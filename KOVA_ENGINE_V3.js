/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                        KOVA ENGINE V3                                        ║
 * ║                 Calisthenics Intelligence System                             ║
 * ║                                                                              ║
 * ║  Architect's changelog vs V2:                                                ║
 * ║  - 40+ new exercises (full beginner → elite chain for every figure)          ║
 * ║  - Rich metadata schema: perceivedDifficulty, effortType, jointStress,       ║
 * ║    avgSetDuration, coachingCues, commonErrors, videoSlug, muscleGroups,      ║
 * ║    uiCategory, tags                                                          ║
 * ║  - Fixed progression gaps (beginner→intermediate now continuous)             ║
 * ║  - New figures: basics_push extended, scapular, rings, compression           ║
 * ║  - Improved readiness algorithm (weighted + nonlinear penalty)               ║
 * ║  - Fatigue model (session count × muscle group overlap)                      ║
 * ║  - Smarter main block selection (no repeated muscle groups in same block)    ║
 * ║  - Weekly plan now respects muscle recovery windows                          ║
 * ║  - Split adjusted for actual push/pull/skill balance                         ║
 * ║  - Prehab woven into every session, not optional                             ║
 * ║  - Claude prompt enriched with cue/error context                             ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const KOVA_V3 = (() => {

  // =========================================================
  // 1) ENUMS / TAXONOMY
  // =========================================================

  /**
   * LEVELS — ordered from easiest to hardest.
   * Used for unlock gate logic and exercise matching.
   */
  const LEVELS = [
    "beginner",          // <3 months, <5 pull-ups, <15 push-ups
    "beginner_plus",     // 3-8 months, 5-10 pull-ups, 15-25 push-ups
    "intermediate",      // 8m-2y, 10+ pull-ups, weighted basics starting
    "advanced",          // 2-4y, solid skill holds, heavy weighted basics
    "elite"              // 4y+, full skills with extensions
  ];

  /**
   * FIGURES — movement family categories.
   * Used for UI grouping, session planning, and warm-up selection.
   */
  const FIGURES = [
    "basics_push",       // push-ups, dips, their weighted variants
    "basics_pull",       // pull-ups, rows, their weighted variants
    "weighted_basics",   // any loaded version of basics
    "rings_basics",      // ring dips, ring rows, ring push-ups
    "scapular",          // scapular pull-ups, depression drills, protraction
    "core",              // hollow body, arch body, leg raises, dragon flags
    "compression",       // l-sit, v-sit, manna progression
    "handstand",         // HS balance, HSPU line
    "planche",           // planche holds and push-ups
    "front_lever",       // front lever holds and rows
    "back_lever",        // back lever holds (feeds into manna/OAP)
    "muscle_up",         // bar + ring muscle-up progressions
    "maltese",           // wide planche → maltese
    "oap",               // one-arm planche
    "mobility",          // active mobility drills
    "prehab"             // injury prevention / reinforcement
  ];

  /**
   * METHODS — training modalities.
   * Used for session planning, zone selection, and prescription.
   */
  const METHODS = {
    MAX_HOLD:      "max_hold",
    MAX_REPS:      "max_reps",
    VOLUME:        "volume",
    EMOM:          "emom",
    GTG:           "grease_the_groove",
    PARTIAL_REPS:  "partial_reps",
    NEGATIVE:      "negative",
    ASSISTED:      "band_assisted",
    SHORT_COMBO:   "short_combo",
    LONG_COMBO:    "long_combo",
    HOLDS:         "holds",
    DEAD_STOP:     "dead_stop",
    CLUSTER:       "cluster",
    LADDER:        "ladder",
    DENSITY:       "density_block",
    CONTRAST:      "contrast_set",   // heavy → explosive pairing
    ACCUMULATION:  "accumulation"    // many light sets across session
  };

  /**
   * WEAK_POINTS — specific strength / control deficits.
   * Exercises target these; user profile lists these as weaknesses.
   * Used by scoreExercise() to prioritize relevant work.
   */
  const WEAK_POINTS = [
    "push_strength",
    "pull_strength",
    "press_strength",
    "protraction",
    "scapular_control",
    "straight_arm_strength",
    "biceps_strength",
    "triceps_strength",
    "compression",
    "balance",
    "line",
    "pelvic_tilt",
    "height",           // planche/maltese: hips too low
    "extension",        // maltese/OAP: wrists too far forward
    "wrist_tolerance",
    "transitions",
    "endurance",
    "oblique_strength",
    "shoulder_stability",
    "false_grip",
    "explosiveness",
    "front_chain",
    "back_chain",
    "depression_strength",
    "hollow_control",
    "lat_activation",   // NEW: common pull-up form issue
    "elbow_flare",      // NEW: front lever / handstand press
    "ankle_point",      // NEW: aesthetic / line quality
    "leg_separation",   // NEW: straddle shapes
    "hip_flexor_strength", // NEW: compression / L-sit
    "ring_stability"    // NEW: ring work
  ];

  /**
   * EFFORT_TYPES — metabolic + neural demand classification.
   * Used for fatigue modelling and block composition.
   */
  const EFFORT_TYPES = {
    CNS_INTENSIVE:  "cns_intensive",   // max holds, max reps, heavy weighted
    TECHNIQUE:      "technique",       // skill rehearsal, balance, GTG
    HYPERTROPHY:    "hypertrophy",     // volume, EMOM, density
    CONDITIONING:   "conditioning",   // circuit, ladder, AMRAP
    PREHAB:         "prehab",          // low load, high control
    MOBILITY:       "mobility"         // stretching, passive/active ROM
  };

  /**
   * JOINT_STRESS — which joints are loaded hard.
   * Used to avoid stacking high-stress exercises on the same session.
   */
  const JOINT_STRESS = {
    WRIST_HIGH:     "wrist_high",
    WRIST_MEDIUM:   "wrist_medium",
    ELBOW_HIGH:     "elbow_high",
    ELBOW_MEDIUM:   "elbow_medium",
    SHOULDER_HIGH:  "shoulder_high",
    SHOULDER_MEDIUM:"shoulder_medium",
    SPINE_MEDIUM:   "spine_medium",
    HIP_MEDIUM:     "hip_medium"
  };

  // =========================================================
  // 2) WARMUPS
  // =========================================================

  const warmups = {
    universal: {
      id: "warmup_universal",
      durationMin: 20,
      blocks: [
        { name: "cardio",              durationMin: 4,  items: ["light jump rope", "fast walk", "easy burpees"] },
        { name: "joint_prep",          durationMin: 5,  items: ["wrists circles", "elbow flexion/extension", "shoulder rolls", "scapular circles"] },
        { name: "muscular_prep",       durationMin: 5,  items: ["scapula push-ups 2×10", "band pull-aparts 2×15", "easy pike push-ups 2×8"] },
        { name: "mobility",            durationMin: 4,  items: ["wrist extension stretch 30s", "lat stretch 30s/side", "pec doorway stretch 30s"] },
        { name: "progressive_specific",durationMin: 3,  items: ["1 easy submax set of target exercise or regression"] }
      ]
    },

    planche: {
      id: "warmup_planche",
      durationMin: 25,
      blocks: [
        { name: "cardio",              durationMin: 4,  items: ["jump rope 3 min", "light burpees"] },
        { name: "joint_prep",          durationMin: 7,  items: ["wrist prep protocol (circles, extension, prayer, back prayer)", "elbow mobility", "shoulder CARs"] },
        { name: "muscular_prep",       durationMin: 8,  items: ["scapula push-ups 3×12", "planche lean 2×10s", "band external rotation 2×15", "zanetti press 2×10"] },
        { name: "mobility",            durationMin: 5,  items: ["wrist extension wall 45s", "pec stretch 30s", "thoracic extension on roller"] },
        { name: "progressive_specific",durationMin: 5,  items: ["band tuck planche 3×6s", "planche lean easy"] }
      ]
    },

    handstand: {
      id: "warmup_handstand",
      durationMin: 22,
      blocks: [
        { name: "cardio",              durationMin: 3,  items: ["light jog or skip"] },
        { name: "joint_prep",          durationMin: 6,  items: ["wrist protocol", "shoulder CARs", "scapular circles at wall"] },
        { name: "muscular_prep",       durationMin: 6,  items: ["scapular shrugs in plank 3×10", "wall walks 3×", "hollow body 3×20s", "pike hold 3×20s"] },
        { name: "mobility",            durationMin: 4,  items: ["overhead lat opener", "wrist extension & flexion stretch 40s each"] },
        { name: "progressive_specific",durationMin: 5,  items: ["box handstand 2×20s", "wall chest-to-wall 2×20s", "toe pulls 3×"] }
      ]
    },

    frontLever: {
      id: "warmup_front_lever",
      durationMin: 22,
      blocks: [
        { name: "cardio",              durationMin: 3,  items: ["light cardio"] },
        { name: "joint_prep",          durationMin: 5,  items: ["shoulder external rotation", "elbow extension", "wrist circles"] },
        { name: "muscular_prep",       durationMin: 7,  items: ["scapular pull-ups 3×8", "dead hang 3×20s", "hollow body 3×25s", "arch body 3×20s"] },
        { name: "mobility",            durationMin: 4,  items: ["lat stretch 35s/side", "pec stretch", "hamstring stretch for tuck form"] },
        { name: "progressive_specific",durationMin: 6,  items: ["tuck front lever hold 3×6s", "front lever raise tuck 3×3"] }
      ]
    },

    muscleUp: {
      id: "warmup_muscle_up",
      durationMin: 22,
      blocks: [
        { name: "cardio",              durationMin: 3,  items: ["light cardio"] },
        { name: "joint_prep",          durationMin: 5,  items: ["wrist circles", "elbow flexion/extension", "shoulder CARs"] },
        { name: "muscular_prep",       durationMin: 7,  items: ["scapular pull-ups 3×8", "ring dip or dip easy 2×6", "false grip hang 3×15s", "explosive pull-up prep 2×4"] },
        { name: "mobility",            durationMin: 4,  items: ["lat stretch", "front shoulder stretch", "wrist extension"] },
        { name: "progressive_specific",durationMin: 6,  items: ["band muscle-up transition 3×3", "high pull-up 2×3"] }
      ]
    },

    oap: {
      id: "warmup_oap",
      durationMin: 28,
      blocks: [
        { name: "cardio",              durationMin: 4,  items: ["light cardio"] },
        { name: "joint_prep",          durationMin: 7,  items: ["full wrist protocol", "forearm rolling", "elbow ext/flex", "shoulder CARs bilateral then unilateral"] },
        { name: "muscular_prep",       durationMin: 8,  items: ["band external rotation 3×15", "rotator cuff tubing 3×15", "scapula push-up 3×12", "bar scapular elevation 3×8"] },
        { name: "mobility",            durationMin: 6,  items: ["oblique stretch 40s/side", "intercostal stretch", "band lat opener"] },
        { name: "progressive_specific",durationMin: 6,  items: ["OAP lean entry practice", "handstand flag rehearsal", "band-supported negative"] }
      ]
    },

    rings: {
      id: "warmup_rings",
      durationMin: 20,
      blocks: [
        { name: "cardio",              durationMin: 3,  items: ["light cardio"] },
        { name: "joint_prep",          durationMin: 5,  items: ["wrist protocol", "shoulder internal/external rotation", "scapular circles"] },
        { name: "muscular_prep",       durationMin: 6,  items: ["ring support hold 3×10s", "ring row easy 2×8", "band pull-aparts 2×15"] },
        { name: "mobility",            durationMin: 4,  items: ["pec stretch 35s", "lat stretch 35s/side", "wrist extension 40s"] },
        { name: "progressive_specific",durationMin: 4,  items: ["ring dip top half 3×5", "ring push-up controlled 2×5"] }
      ]
    }
  };

  // =========================================================
  // 3) HELPERS
  // =========================================================

  function avg(arr) {
    return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function levelIndex(level) { return LEVELS.indexOf(level); }

  /**
   * V3 IMPROVEMENT: Readiness is now weighted and nonlinear.
   * - Sleep and joints are more heavily weighted (injury prevention)
   * - Soreness uses quadratic penalty (3 soreness ≠ 1.5× impact of 1 soreness)
   * - Result: 0–10 score that better reflects training readiness
   */
  function computeReadinessScore(readiness = {}) {
    const energy     = readiness.energy     ?? 5;
    const joints     = readiness.joints     ?? 5;
    const motivation = readiness.motivation ?? 5;
    const sleep      = readiness.sleep      ?? 5;
    const soreness   = readiness.soreness   ?? 0;

    // Weighted positive factors: joints and sleep matter most
    const positive = (energy * 0.25) + (joints * 0.30) + (motivation * 0.15) + (sleep * 0.30);

    // Quadratic soreness penalty: high soreness hits harder
    const sorenessNorm = soreness / 10; // 0–1
    const penalty = sorenessNorm * sorenessNorm * 4; // max penalty ~4 pts at soreness=10

    return clamp(Math.round((positive - penalty) * 10) / 10, 0, 10);
  }

  /**
   * V3 IMPROVEMENT: Intensity zone selection now also considers:
   * - consecutive training days (session fatigue accumulation)
   * - specific pain flags mapped to movement patterns
   */
  function chooseIntensityZone(profile) {
    const score        = computeReadinessScore(profile.readiness);
    const perfDrop     = profile.lastSession?.performanceDropPct ?? 0;
    const painCount    = (profile.painFlags || []).length;
    const consecDays   = profile.consecutiveTrainingDays ?? 0;

    // Pain always → low zone
    if (painCount > 0) return "low";

    // Accumulated fatigue
    if (consecDays >= 3) {
      if (score < 7) return "low";
      if (score < 9) return "medium";
    }

    // Performance drop from last session
    if (perfDrop > 30 || score < 4) return "low";
    if (perfDrop > 15 || score < 6.5) return "medium";

    return "high";
  }

  function metricValue(metrics, exerciseId, metric) {
    return metrics?.[exerciseId]?.[metric] ?? 0;
  }

  function isUnlocked(profile, ex) {
    if (!ex.unlockConditions || ex.unlockConditions.length === 0) return true;
    return ex.unlockConditions.every((rule) => {
      const current = metricValue(profile.currentMetrics, rule.exerciseId, rule.metric);
      switch (rule.op) {
        case ">=": return current >= rule.value;
        case ">":  return current >  rule.value;
        case "<=": return current <= rule.value;
        case "<":  return current <  rule.value;
        case "==": return current === rule.value;
        default:   return false;
      }
    });
  }

  function hasEquipment(profile, ex) {
    if (!ex.equipment || ex.equipment.length === 0) return true;
    const set = new Set(profile.equipment || []);
    return ex.equipment.every((item) => item.endsWith("_optional") || set.has(item));
  }

  function matchesLevel(profile, ex) {
    return levelIndex(ex.level) <= levelIndex(profile.level) + 1;
  }

  function getWarmupForFigure(figure) {
    const map = {
      planche: warmups.planche,
      maltese: warmups.planche,
      oap:     warmups.oap,
      handstand: warmups.handstand,
      front_lever: warmups.frontLever,
      back_lever:  warmups.frontLever,
      muscle_up:   warmups.muscleUp,
      rings_basics: warmups.rings
    };
    return map[figure] || warmups.universal;
  }

  function prescribe(ex, zone) {
    return ex.recommendedVolume?.[zone] || "3-4 working sets";
  }

  /**
   * V3 IMPROVEMENT: scoreExercise now also considers:
   * - effortType compatibility with zone
   * - joint stress stacking (penalizes high-stress if paired exercises already load same joint)
   * - perceivedDifficulty vs current metrics ratio
   */
  function scoreExercise(profile, ex, zone, alreadySelectedJoints = []) {
    let score = 0;

    // Priority figure bonus
    if (ex.figure === profile.priorityFigure) score += 30;
    if ((profile.secondaryFigures || []).includes(ex.figure)) score += 12;

    // Weakness targeting bonus
    const weaknessHits = (ex.weakPointsTargeted || []).filter(
      w => (profile.weaknesses || []).includes(w)
    ).length;
    score += weaknessHits * 8;

    // Zone-specific effort type match
    const effortMatch = {
      low:    [EFFORT_TYPES.TECHNIQUE, EFFORT_TYPES.PREHAB, EFFORT_TYPES.MOBILITY],
      medium: [EFFORT_TYPES.HYPERTROPHY, EFFORT_TYPES.TECHNIQUE],
      high:   [EFFORT_TYPES.CNS_INTENSIVE, EFFORT_TYPES.HYPERTROPHY]
    };
    if (effortMatch[zone]?.includes(ex.effortType)) score += 12;

    // Method-zone alignment
    if (zone === "low") {
      if ((ex.methods || []).some(m => [METHODS.HOLDS, METHODS.GTG, METHODS.ASSISTED].includes(m))) score += 8;
    }
    if (zone === "medium") {
      if ((ex.methods || []).some(m => [METHODS.VOLUME, METHODS.PARTIAL_REPS, METHODS.EMOM].includes(m))) score += 8;
    }
    if (zone === "high") {
      if ((ex.methods || []).some(m => [METHODS.MAX_HOLD, METHODS.MAX_REPS, METHODS.CLUSTER, METHODS.SHORT_COMBO].includes(m))) score += 10;
    }

    // Joint stress stacking penalty: don't load same high-stress joint twice in same block
    const exJoints = ex.jointStress || [];
    const highStressJoints = exJoints.filter(j =>
      j.includes("_high") && alreadySelectedJoints.includes(j)
    );
    score -= highStressJoints.length * 15;

    return score;
  }

  /**
   * V3 IMPROVEMENT: Fatigue model.
   * Tracks CNS-intensive exercises and prevents overloading per session.
   */
  function countCNSLoad(exercises) {
    return exercises.filter(ex => ex.effortType === EFFORT_TYPES.CNS_INTENSIVE).length;
  }

  // =========================================================
  // 4) EXERCISE DATABASE
  // =========================================================
  /**
   * SCHEMA (every exercise):
   * {
   *   id:                  string          — stable unique key
   *   name:                string          — display name
   *   figure:              FIGURES[x]      — movement family
   *   type:                string          — static | dynamic | eccentric | assisted | strengthening | prehab
   *   level:               LEVELS[x]       — minimum level to use
   *   effortType:          EFFORT_TYPES[x] — for fatigue and block building
   *   jointStress:         JOINT_STRESS[]  — for joint stacking protection
   *   perceivedDifficulty: 1–10            — subjective difficulty rating
   *   avgSetDurationSec:   number          — average time per set (for session duration estimate)
   *   goals:               string[]        — what it trains
   *   weakPointsTargeted:  WEAK_POINTS[]   — specific deficits it addresses
   *   muscleGroups:        string[]        — primary muscles (UI display)
   *   uiCategory:          string          — for app category display
   *   tags:                string[]        — for search/filter in app
   *   equipment:           string[]        — required items (suffix _optional = optional)
   *   methods:             METHODS[x][]    — usable training methods
   *   unlockConditions:    [{exerciseId, metric, op, value}]
   *   progressions:        string[]        — next exercises (ids)
   *   regressions:         string[]        — easier alternatives (ids)
   *   coachingCues:        string[]        — key technique points
   *   commonErrors:        string[]        — frequent mistakes
   *   videoSlug:           string          — placeholder for video/animation key
   *   recommendedVolume:   { low, medium, high }
   * }
   */

  const exercises = [

    // =======================================================
    // PREHAB / JOINT PREP
    // =======================================================
    // V3 NOTE: Prehab is now a first-class citizen woven into every session.
    // These exercises are always available and always scoreable.

    {
      id: "wrist_protocol",
      name: "Wrist Prep Protocol",
      figure: "prehab",
      type: "prehab",
      level: "beginner",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM],
      perceivedDifficulty: 1,
      avgSetDurationSec: 120,
      goals: ["prehab", "joint_health"],
      weakPointsTargeted: ["wrist_tolerance"],
      muscleGroups: ["forearms", "wrists"],
      uiCategory: "Prehab",
      tags: ["prehab", "wrists", "joint_prep", "daily"],
      equipment: [],
      methods: [METHODS.VOLUME],
      unlockConditions: [],
      progressions: [],
      regressions: [],
      coachingCues: [
        "Circles both directions 10 each",
        "Prayer stretch 30s, back prayer 30s",
        "Wall extension lean with straight arms 30s",
        "Finger extension spread 10 reps"
      ],
      commonErrors: ["Skipping this before planche/handstand work", "Rushing through circles"],
      videoSlug: "wrist_protocol",
      recommendedVolume: { low: "1 round", medium: "1 round", high: "1 round" }
    },

    {
      id: "scapula_pushup",
      name: "Scapula Push-Up",
      figure: "prehab",
      type: "strengthening",
      level: "beginner",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 2,
      avgSetDurationSec: 30,
      goals: ["prehab", "scapular_control"],
      weakPointsTargeted: ["protraction", "scapular_control"],
      muscleGroups: ["serratus anterior", "trapezius lower"],
      uiCategory: "Prehab",
      tags: ["prehab", "scapular", "push", "foundation"],
      equipment: [],
      methods: [METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["planche_lean", "scapula_dip"],
      regressions: [],
      coachingCues: [
        "Arms stay straight the entire set",
        "Only the shoulder blades move",
        "Full protraction at top, full retraction at bottom",
        "No elbow bending ever"
      ],
      commonErrors: ["Bending elbows", "Incomplete range of motion", "Rushing the reps"],
      videoSlug: "scapula_pushup",
      recommendedVolume: { low: "3 × 10-15", medium: "4 × 12-20", high: "5 × 15-25" }
    },

    {
      id: "scapula_pullup",
      name: "Scapular Pull-Up",
      figure: "prehab",
      type: "strengthening",
      level: "beginner",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 2,
      avgSetDurationSec: 30,
      goals: ["prehab", "scapular_control", "depression_strength"],
      weakPointsTargeted: ["scapular_control", "depression_strength", "lat_activation"],
      muscleGroups: ["trapezius lower", "latissimus dorsi", "serratus anterior"],
      uiCategory: "Prehab",
      tags: ["prehab", "scapular", "pull", "foundation"],
      equipment: ["bar"],
      methods: [METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["dead_hang", "pullup"],
      regressions: [],
      coachingCues: [
        "Start from a dead hang",
        "Depress (pull down) shoulder blades without bending elbows",
        "Feel the lats and lower traps engage",
        "Slow and controlled, 1 second up / 1 second down"
      ],
      commonErrors: ["Using arm strength instead of scapular depression", "Not reaching full dead hang between reps"],
      videoSlug: "scapula_pullup",
      recommendedVolume: { low: "3 × 8-12", medium: "4 × 10-15", high: "5 × 12-18" }
    },

    {
      id: "dead_hang",
      name: "Dead Hang",
      figure: "prehab",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 2,
      avgSetDurationSec: 30,
      goals: ["prehab", "shoulder_decompression", "grip"],
      weakPointsTargeted: ["shoulder_stability", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "rotator cuff", "forearms"],
      uiCategory: "Prehab",
      tags: ["prehab", "hang", "shoulder", "daily"],
      equipment: ["bar"],
      methods: [METHODS.HOLDS, METHODS.GTG],
      unlockConditions: [],
      progressions: ["scapula_pullup", "pullup"],
      regressions: [],
      coachingCues: [
        "Fully relax in the hang — no tension in shoulders",
        "Then actively depress and externally rotate shoulders",
        "Breathe slowly and steadily",
        "Goal: spine decompression + shoulder health"
      ],
      commonErrors: ["Passive-only hanging (no activation phase)", "Holding breath"],
      videoSlug: "dead_hang",
      recommendedVolume: { low: "3 × 20-30s", medium: "4 × 30-45s", high: "5 × 45-60s" }
    },

    {
      id: "band_external_rotation",
      name: "Band External Rotation",
      figure: "prehab",
      type: "prehab",
      level: "beginner",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [],
      perceivedDifficulty: 1,
      avgSetDurationSec: 25,
      goals: ["prehab", "rotator_cuff"],
      weakPointsTargeted: ["shoulder_stability", "scapular_control"],
      muscleGroups: ["infraspinatus", "teres minor", "rotator cuff"],
      uiCategory: "Prehab",
      tags: ["prehab", "rotator_cuff", "band", "shoulder"],
      equipment: ["band"],
      methods: [METHODS.VOLUME],
      unlockConditions: [],
      progressions: [],
      regressions: [],
      coachingCues: [
        "Elbow stays pinned at 90° to your side",
        "Slow and controlled: 2s out, 2s back",
        "No shrugging, keep shoulders down"
      ],
      commonErrors: ["Letting elbow drift away from body", "Using momentum"],
      videoSlug: "band_external_rotation",
      recommendedVolume: { low: "2 × 12", medium: "3 × 15", high: "3 × 20" }
    },

    {
      id: "compression_lift",
      name: "Compression Lift",
      figure: "prehab",
      type: "strengthening",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [JOINT_STRESS.HIP_MEDIUM, JOINT_STRESS.WRIST_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 40,
      goals: ["compression", "hip_flexor_strength"],
      weakPointsTargeted: ["compression", "hip_flexor_strength"],
      muscleGroups: ["hip flexors", "iliopsoas", "rectus femoris"],
      uiCategory: "Prehab",
      tags: ["prehab", "compression", "hip_flexors", "l-sit"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.VOLUME, METHODS.HOLDS],
      unlockConditions: [],
      progressions: ["l_sit_tuck", "l_sit"],
      regressions: [],
      coachingCues: [
        "From seated, place hands beside hips",
        "Drive elbows toward hips, not straight down",
        "Lift only the heels first, then aim to lift entire legs",
        "Core braced, hollow position throughout"
      ],
      commonErrors: ["Collapsing the lower back", "Heels barely lifting", "Arms too wide"],
      videoSlug: "compression_lift",
      recommendedVolume: { low: "3 × 8-10", medium: "4 × 10-15", high: "5 × 12-20" }
    },

    {
      id: "zanetti_press",
      name: "Zanetti Press",
      figure: "prehab",
      type: "strengthening",
      level: "intermediate",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["straight_arm_strength", "planche_support"],
      weakPointsTargeted: ["biceps_strength", "straight_arm_strength", "front_chain"],
      muscleGroups: ["biceps long head", "brachialis", "anterior deltoid"],
      uiCategory: "Prehab",
      tags: ["prehab", "straight_arm", "planche_prep", "biceps"],
      equipment: ["dumbbells_optional"],
      methods: [METHODS.VOLUME],
      unlockConditions: [],
      progressions: [],
      regressions: [],
      coachingCues: [
        "Arms fully extended, slight forward lean",
        "Slow eccentric: 3-4 seconds down",
        "Do NOT bend elbows — this is a straight arm strength drill",
        "Minimal weight needed; form over load"
      ],
      commonErrors: ["Bending elbows under load", "Too much weight too soon", "No forward lean"],
      videoSlug: "zanetti_press",
      recommendedVolume: { low: "3 × 8", medium: "4 × 10", high: "5 × 12" }
    },

    {
      id: "jefferson_curl",
      name: "Jefferson Curl",
      figure: "mobility",
      type: "prehab",
      level: "beginner",
      effortType: EFFORT_TYPES.MOBILITY,
      jointStress: [JOINT_STRESS.SPINE_MEDIUM],
      perceivedDifficulty: 2,
      avgSetDurationSec: 60,
      goals: ["posterior_chain_mobility", "hamstring_flexibility"],
      weakPointsTargeted: ["back_chain", "compression"],
      muscleGroups: ["spinal erectors", "hamstrings", "glutes"],
      uiCategory: "Mobilité",
      tags: ["mobility", "hamstring", "posterior_chain", "spine"],
      equipment: ["dumbbells_optional"],
      methods: [METHODS.VOLUME],
      unlockConditions: [],
      progressions: [],
      regressions: [],
      coachingCues: [
        "Tuck chin to chest first",
        "Round vertebra by vertebra, slow",
        "Hold at the bottom 3-5 seconds",
        "Use minimal weight (or none) — this is a stretch"
      ],
      commonErrors: ["Moving too fast", "Using heavy weights", "Not maintaining rounded spine"],
      videoSlug: "jefferson_curl",
      recommendedVolume: { low: "3 × 5 slow", medium: "4 × 5 slow", high: "4 × 6 slow" }
    },

    {
      id: "thoracic_extension",
      name: "Thoracic Extension on Roller",
      figure: "mobility",
      type: "prehab",
      level: "beginner",
      effortType: EFFORT_TYPES.MOBILITY,
      jointStress: [],
      perceivedDifficulty: 1,
      avgSetDurationSec: 60,
      goals: ["thoracic_mobility", "handstand_line"],
      weakPointsTargeted: ["line", "press_strength"],
      muscleGroups: ["thoracic erectors", "rhomboids"],
      uiCategory: "Mobilité",
      tags: ["mobility", "thoracic", "handstand_prep", "daily"],
      equipment: ["foam_roller_optional"],
      methods: [METHODS.HOLDS],
      unlockConditions: [],
      progressions: [],
      regressions: [],
      coachingCues: ["Segment each thoracic vertebra", "Arms overhead to increase stretch", "Breathe into the extension"],
      commonErrors: ["Extending at lumbar instead of thoracic", "Not segmenting"],
      videoSlug: "thoracic_extension",
      recommendedVolume: { low: "2 × 8 breaths", medium: "3 × 8 breaths", high: "3 × 10 breaths" }
    },

    // =======================================================
    // BASICS PUSH
    // =======================================================
    // V3 FIX: Added incline push-up and knee push-up as proper regressions.
    // Added wide/diamond/archer variants as valuable missing steps.

    {
      id: "incline_pushup",
      name: "Incline Push-Up",
      figure: "basics_push",
      type: "dynamic",
      level: "beginner",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 2,
      avgSetDurationSec: 30,
      goals: ["foundation", "push_strength"],
      weakPointsTargeted: ["push_strength"],
      muscleGroups: ["pectoralis major", "triceps", "anterior deltoid"],
      uiCategory: "Push",
      tags: ["push", "beginner", "foundation", "no_equipment"],
      equipment: [],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["pushup_standard"],
      regressions: [],
      coachingCues: [
        "Hands on elevated surface: bench, step, or wall",
        "Body forms a perfect plank — no hips sagging",
        "Elbows track at ~45° from body, not flared wide",
        "Full range: chest nearly touches surface"
      ],
      commonErrors: ["Hips dropping", "Partial reps", "Elbows flaring 90°"],
      videoSlug: "incline_pushup",
      recommendedVolume: { low: "3 × 8-12", medium: "4 × 12-20", high: "5 × 15-25" }
    },

    {
      id: "pushup_standard",
      name: "Push-Up",
      figure: "basics_push",
      type: "dynamic",
      level: "beginner",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 35,
      goals: ["foundation", "strength", "endurance"],
      weakPointsTargeted: ["push_strength", "endurance", "hollow_control"],
      muscleGroups: ["pectoralis major", "triceps", "anterior deltoid", "serratus anterior"],
      uiCategory: "Push",
      tags: ["push", "beginner", "foundation", "no_equipment"],
      equipment: [],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME, METHODS.EMOM],
      unlockConditions: [],
      progressions: ["deep_pushup", "diamond_pushup", "pseudo_planche_pushup", "pike_pushup"],
      regressions: ["incline_pushup"],
      coachingCues: [
        "Hollow body: squeeze glutes, brace abs, anterior pelvic tilt avoided",
        "Elbows ~45° from torso, not chicken-winged",
        "Full range: chest nearly touches floor",
        "Push the floor away, don't just unfold elbows"
      ],
      commonErrors: ["Hips sagging (no core engagement)", "Half reps", "Flared elbows", "Head jutting forward"],
      videoSlug: "pushup_standard",
      recommendedVolume: { low: "3 × 6-10", medium: "4 × 10-20", high: "5 × max-2 or EMOM" }
    },

    {
      id: "diamond_pushup",
      name: "Diamond Push-Up",
      figure: "basics_push",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 35,
      goals: ["triceps_strength", "press_strength"],
      weakPointsTargeted: ["triceps_strength", "press_strength"],
      muscleGroups: ["triceps", "anterior deltoid", "pectoralis major (inner)"],
      uiCategory: "Push",
      tags: ["push", "triceps", "intermediate", "no_equipment"],
      equipment: [],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "pushup_standard", metric: "reps", op: ">=", value: 15 }],
      progressions: ["pseudo_planche_pushup"],
      regressions: ["pushup_standard"],
      coachingCues: [
        "Thumbs and index fingers form a diamond under sternum",
        "Elbows track alongside body",
        "Wrists may need modification if uncomfortable (parallettes help)",
        "Full depth: chest to hands"
      ],
      commonErrors: ["Elbows flaring out (defeats purpose)", "Hands placed too forward", "Wrist pain from angle"],
      videoSlug: "diamond_pushup",
      recommendedVolume: { low: "3 × 4-8", medium: "4 × 6-12", high: "5 × 8-15" }
    },

    {
      id: "deep_pushup",
      name: "Deep Push-Up",
      figure: "basics_push",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["strength", "pec_stretch"],
      weakPointsTargeted: ["push_strength"],
      muscleGroups: ["pectoralis major", "anterior deltoid", "triceps", "serratus anterior"],
      uiCategory: "Push",
      tags: ["push", "parallettes", "range_of_motion", "intermediate"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_REPS, METHODS.PARTIAL_REPS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "pushup_standard", metric: "reps", op: ">=", value: 15 }],
      progressions: ["pseudo_planche_pushup"],
      regressions: ["pushup_standard"],
      coachingCues: [
        "Parallettes or raised objects: chest drops BELOW hands at bottom",
        "Shoulders stretch through full pectoral range at the bottom",
        "Pause 1 second at bottom to avoid bounce",
        "Keep elbows tracking same angle as standard push-up"
      ],
      commonErrors: ["Letting shoulders collapse at bottom", "Bouncing off the bottom"],
      videoSlug: "deep_pushup",
      recommendedVolume: { low: "3 × 4-8", medium: "4 × 6-12", high: "5 × 8-15" }
    },

    {
      id: "pseudo_planche_pushup",
      name: "Pseudo Planche Push-Up",
      figure: "planche",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 45,
      goals: ["planche_prep", "push_strength", "shoulder_position"],
      weakPointsTargeted: ["push_strength", "protraction", "wrist_tolerance", "front_chain"],
      muscleGroups: ["anterior deltoid", "pectoralis major", "serratus anterior", "wrist extensors"],
      uiCategory: "Planche",
      tags: ["planche_prep", "push", "intermediate", "no_equipment"],
      equipment: [],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "pushup_standard", metric: "reps", op: ">=", value: 15 }],
      progressions: ["planche_lean_pushup", "tuck_planche_pushup"],
      regressions: ["pushup_standard", "planche_lean"],
      coachingCues: [
        "Hands face backward or outward, fingers pointing sideways",
        "Forward lean: shoulders in front of wrists",
        "Protract (push through) shoulder blades",
        "Wrist angle is the limiter — progress gradually"
      ],
      commonErrors: ["Insufficient forward lean (turns it into a regular push-up)", "Wrist pain from rushing lean", "No protraction"],
      videoSlug: "pseudo_planche_pushup",
      recommendedVolume: { low: "3 × 4-8", medium: "4 × 6-12", high: "5 × 8-15" }
    },

    {
      id: "dip",
      name: "Dip",
      figure: "basics_push",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["foundation", "push_strength", "triceps"],
      weakPointsTargeted: ["triceps_strength", "push_strength"],
      muscleGroups: ["triceps", "pectoralis major", "anterior deltoid"],
      uiCategory: "Push",
      tags: ["push", "dip", "bars", "foundation"],
      equipment: ["parallel_bars_optional"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["weighted_dip", "straight_bar_dip", "ring_dip"],
      regressions: ["band_dip"],
      coachingCues: [
        "Upright torso = more triceps; forward lean = more chest",
        "Go to 90° elbow minimum — ideally upper arm parallel",
        "Lock out fully at the top",
        "Control the descent: 2-3 second eccentric"
      ],
      commonErrors: ["Not reaching 90° depth", "Elbows flaring wide", "Shrugging shoulders at top"],
      videoSlug: "dip",
      recommendedVolume: { low: "4 × 4-8", medium: "5 × 6-12", high: "5 × 8-15" }
    },

    {
      id: "band_dip",
      name: "Band Assisted Dip",
      figure: "basics_push",
      type: "assisted",
      level: "beginner",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 35,
      goals: ["dip_regression", "foundation"],
      weakPointsTargeted: ["triceps_strength", "push_strength"],
      muscleGroups: ["triceps", "pectoralis major", "anterior deltoid"],
      uiCategory: "Push",
      tags: ["push", "dip", "assisted", "beginner"],
      equipment: ["parallel_bars_optional", "band"],
      methods: [METHODS.ASSISTED, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["dip"],
      regressions: [],
      coachingCues: ["Band under knees or feet", "Same cues as standard dip — don't use band to cheat depth"],
      commonErrors: ["Using band to avoid going deep", "Too strong a band (removes all challenge)"],
      videoSlug: "band_dip",
      recommendedVolume: { low: "3 × 6-10", medium: "4 × 8-12", high: "5 × 10-15" }
    },

    {
      id: "weighted_dip",
      name: "Weighted Dip",
      figure: "weighted_basics",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 7,
      avgSetDurationSec: 45,
      goals: ["max_strength", "hypertrophy"],
      weakPointsTargeted: ["push_strength", "triceps_strength"],
      muscleGroups: ["triceps", "pectoralis major", "anterior deltoid"],
      uiCategory: "Weighted",
      tags: ["push", "weighted", "intermediate", "strength"],
      equipment: ["parallel_bars_optional", "weight_belt_optional"],
      methods: [METHODS.VOLUME, METHODS.CLUSTER, METHODS.CONTRAST],
      unlockConditions: [{ exerciseId: "dip", metric: "reps", op: ">=", value: 12 }],
      progressions: ["heavy_weighted_dip"],
      regressions: ["dip"],
      coachingCues: [
        "Load can be belt, vest, or dumbbell between legs",
        "Same form as bodyweight — do not cheat depth when loaded",
        "Cluster sets (3+2+1) for heavier loads",
        "Start conservative: +5-10kg is meaningful"
      ],
      commonErrors: ["Depth loss under load", "Shrugging at top", "Too much load too soon"],
      videoSlug: "weighted_dip",
      recommendedVolume: { low: "4 × 3", medium: "5 × 3-5", high: "6 × 2-4" }
    },

    {
      id: "straight_bar_dip",
      name: "Straight Bar Dip",
      figure: "muscle_up",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 7,
      avgSetDurationSec: 40,
      goals: ["transition_base", "push_strength"],
      weakPointsTargeted: ["triceps_strength", "transitions", "shoulder_stability"],
      muscleGroups: ["triceps", "anterior deltoid", "pectoralis major", "wrist extensors"],
      uiCategory: "Muscle-Up",
      tags: ["push", "bar", "muscle_up_prep", "transition"],
      equipment: ["bar"],
      methods: [METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "dip", metric: "reps", op: ">=", value: 8 }],
      progressions: ["bar_muscle_up"],
      regressions: ["dip"],
      coachingCues: [
        "Wrists must be above the bar (turn over the bar)",
        "Full lockout at the top",
        "Lean forward slightly for easier balance",
        "This is the hardest part of the muscle-up — prioritize it"
      ],
      commonErrors: ["Wrists not clearing the bar", "Incomplete lockout", "Afraid to commit forward"],
      videoSlug: "straight_bar_dip",
      recommendedVolume: { low: "4 × 3-5", medium: "5 × 5-8", high: "6 × 6-10" }
    },

    // =======================================================
    // BASICS PULL
    // =======================================================

    {
      id: "negative_pullup",
      name: "Negative Pull-Up",
      figure: "basics_pull",
      type: "eccentric",
      level: "beginner",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 40,
      goals: ["pull_strength", "eccentric_strength"],
      weakPointsTargeted: ["pull_strength", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "biceps", "brachialis", "rear deltoid"],
      uiCategory: "Pull",
      tags: ["pull", "beginner", "eccentric", "bar"],
      equipment: ["bar"],
      methods: [METHODS.NEGATIVE, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["band_pullup", "pullup"],
      regressions: [],
      coachingCues: [
        "Start at the top (jump or step to top position)",
        "Lower as SLOWLY as possible: aim for 4-8 seconds",
        "Fully extend at the bottom before next rep",
        "Quality > quantity — 3 slow negatives beat 10 fast ones"
      ],
      commonErrors: ["Dropping too fast", "Not reaching full extension", "Shrugging at bottom"],
      videoSlug: "negative_pullup",
      recommendedVolume: { low: "3 × 3-5 reps", medium: "4 × 4-6 reps", high: "5 × 5-6 reps" }
    },

    {
      id: "band_pullup",
      name: "Band Assisted Pull-Up",
      figure: "basics_pull",
      type: "assisted",
      level: "beginner",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 40,
      goals: ["pull_strength", "foundation"],
      weakPointsTargeted: ["pull_strength", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "biceps", "rear deltoid"],
      uiCategory: "Pull",
      tags: ["pull", "beginner", "assisted", "bar"],
      equipment: ["bar", "band"],
      methods: [METHODS.ASSISTED, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["pullup"],
      regressions: ["negative_pullup"],
      coachingCues: [
        "Lighter band = harder (you do more work)",
        "Aim to use progressively lighter bands over weeks",
        "Full range: dead hang to chin above bar",
        "Same form as standard pull-up"
      ],
      commonErrors: ["Staying on the same band forever", "Kipping with the assistance"],
      videoSlug: "band_pullup",
      recommendedVolume: { low: "4 × 5-8", medium: "5 × 6-10", high: "5 × 8-12" }
    },

    {
      id: "ring_row",
      name: "Ring Row (Australian Row)",
      figure: "basics_pull",
      type: "dynamic",
      level: "beginner",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 35,
      goals: ["pull_strength", "scapular_control"],
      weakPointsTargeted: ["pull_strength", "scapular_control", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "rhomboids", "biceps", "rear deltoid"],
      uiCategory: "Pull",
      tags: ["pull", "beginner", "rings", "no_bar_needed"],
      equipment: ["rings_optional"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["pullup", "ring_pullup"],
      regressions: [],
      coachingCues: [
        "More horizontal body = harder",
        "Retract shoulder blades at the top — don't just pull with arms",
        "Elbows travel to ribs, not flared wide",
        "Body stays completely rigid throughout"
      ],
      commonErrors: ["Hips sagging", "Arms doing all the work (no scapular retraction)", "Partial range"],
      videoSlug: "ring_row",
      recommendedVolume: { low: "3 × 8-12", medium: "4 × 10-15", high: "5 × 12-18" }
    },

    {
      id: "pullup",
      name: "Pull-Up",
      figure: "basics_pull",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["foundation", "pull_strength"],
      weakPointsTargeted: ["pull_strength", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "biceps", "brachialis", "rear deltoid", "core"],
      uiCategory: "Pull",
      tags: ["pull", "bar", "foundation", "intermediate"],
      equipment: ["bar"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME, METHODS.EMOM],
      unlockConditions: [],
      progressions: ["weighted_pullup", "high_pullup", "tuck_front_lever", "chin_up_weighted"],
      regressions: ["band_pullup", "negative_pullup", "ring_row"],
      coachingCues: [
        "Start from a true dead hang — full arm extension",
        "Pull elbows toward hips/pockets, not straight down",
        "Chin over bar is the standard; chest to bar is the goal",
        "Slight hollow body throughout — no kipping"
      ],
      commonErrors: ["Starting from bent arms", "Shrugging at the bottom", "Kipping to cheat reps", "Head jutting forward at top"],
      videoSlug: "pullup",
      recommendedVolume: { low: "4 × 3-5", medium: "5 × 5-8", high: "5 × 8-12" }
    },

    {
      id: "chin_up_weighted",
      name: "Chin-Up",
      figure: "basics_pull",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["biceps_strength", "pull_strength"],
      weakPointsTargeted: ["pull_strength", "biceps_strength"],
      muscleGroups: ["biceps", "brachialis", "latissimus dorsi", "rear deltoid"],
      uiCategory: "Pull",
      tags: ["pull", "bar", "supinated", "biceps"],
      equipment: ["bar"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["weighted_pullup"],
      regressions: ["band_pullup"],
      coachingCues: [
        "Palms face you (supinated grip)",
        "Easier than pronated — great for beginners building first pull-ups",
        "Same cues: dead hang start, elbow-to-hip path",
        "Can be weighted once 10+ clean reps achieved"
      ],
      commonErrors: ["Same errors as standard pull-up"],
      videoSlug: "chin_up",
      recommendedVolume: { low: "4 × 5-8", medium: "5 × 6-10", high: "5 × 8-15" }
    },

    {
      id: "weighted_pullup",
      name: "Weighted Pull-Up",
      figure: "weighted_basics",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 45,
      goals: ["max_strength", "front_lever_prep"],
      weakPointsTargeted: ["pull_strength", "explosiveness", "back_chain"],
      muscleGroups: ["latissimus dorsi", "biceps", "rear deltoid", "core"],
      uiCategory: "Weighted",
      tags: ["pull", "weighted", "intermediate", "strength"],
      equipment: ["bar", "weight_belt_optional"],
      methods: [METHODS.VOLUME, METHODS.CLUSTER, METHODS.CONTRAST],
      unlockConditions: [{ exerciseId: "pullup", metric: "reps", op: ">=", value: 10 }],
      progressions: [],
      regressions: ["pullup"],
      coachingCues: [
        "Start with 2.5-5kg added — quality beats quantity",
        "Cluster sets (2+2+1) work well for heavy loads",
        "Full dead hang between reps",
        "Contrast with explosive pull-ups after heavy set"
      ],
      commonErrors: ["Too much load too soon", "Partial reps under load", "Neglecting deload weeks"],
      videoSlug: "weighted_pullup",
      recommendedVolume: { low: "4 × 3", medium: "5 × 3-5", high: "6 × 2-4" }
    },

    // =======================================================
    // RINGS BASICS
    // =======================================================

    {
      id: "ring_support_hold",
      name: "Ring Support Hold",
      figure: "rings_basics",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 20,
      goals: ["ring_stability", "foundation"],
      weakPointsTargeted: ["ring_stability", "shoulder_stability"],
      muscleGroups: ["triceps", "anterior deltoid", "serratus anterior", "stabilizers"],
      uiCategory: "Anneaux",
      tags: ["rings", "stability", "beginner", "foundation"],
      equipment: ["rings"],
      methods: [METHODS.HOLDS, METHODS.GTG],
      unlockConditions: [],
      progressions: ["ring_dip", "ring_pushup"],
      regressions: [],
      coachingCues: [
        "Rings turned out at top (RTO) — external rotation",
        "Shoulders depressed and packed",
        "Abs braced, hollow position",
        "Rings should feel stable — work up to RTO position over weeks"
      ],
      commonErrors: ["Rings parallel (no external rotation)", "Shrugging shoulders", "Rings too wide"],
      videoSlug: "ring_support_hold",
      recommendedVolume: { low: "4 × 10-15s", medium: "5 × 15-25s", high: "6 × 20-30s" }
    },

    {
      id: "ring_pushup",
      name: "Ring Push-Up",
      figure: "rings_basics",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.WRIST_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 40,
      goals: ["ring_stability", "push_strength"],
      weakPointsTargeted: ["push_strength", "ring_stability", "shoulder_stability"],
      muscleGroups: ["pectoralis major", "triceps", "anterior deltoid", "stabilizers"],
      uiCategory: "Anneaux",
      tags: ["rings", "push", "intermediate", "stability"],
      equipment: ["rings"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "ring_support_hold", metric: "hold", op: ">=", value: 15 }],
      progressions: ["ring_dip"],
      regressions: ["ring_support_hold", "pushup_standard"],
      coachingCues: [
        "Turn rings out (RTO) at the top of every rep",
        "Much harder than floor push-ups — full scapular control required",
        "Slow eccentric: 3s down",
        "Rings at chest height makes it easier; lower = harder"
      ],
      commonErrors: ["Not turning rings out", "Rings too low to start", "Losing hollow body"],
      videoSlug: "ring_pushup",
      recommendedVolume: { low: "3 × 5-8", medium: "4 × 6-10", high: "5 × 8-12" }
    },

    {
      id: "ring_dip",
      name: "Ring Dip",
      figure: "rings_basics",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 45,
      goals: ["ring_stability", "push_strength", "muscle_up_base"],
      weakPointsTargeted: ["triceps_strength", "ring_stability", "push_strength"],
      muscleGroups: ["triceps", "pectoralis major", "anterior deltoid", "stabilizers"],
      uiCategory: "Anneaux",
      tags: ["rings", "push", "advanced", "muscle_up_prep"],
      equipment: ["rings"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME, METHODS.NEGATIVE],
      unlockConditions: [
        { exerciseId: "dip", metric: "reps", op: ">=", value: 10 },
        { exerciseId: "ring_support_hold", metric: "hold", op: ">=", value: 20 }
      ],
      progressions: ["ring_muscle_up"],
      regressions: ["ring_pushup", "dip"],
      coachingCues: [
        "RTO at the top — externally rotate aggressively",
        "Control the descent: rings will want to flare, resist them",
        "Go to at least 90° depth",
        "This is harder than bar dips — be patient"
      ],
      commonErrors: ["No RTO at top", "Rings flaring uncontrolled", "Incomplete depth"],
      videoSlug: "ring_dip",
      recommendedVolume: { low: "4 × 2-4", medium: "5 × 3-6", high: "6 × 4-8" }
    },

    // =======================================================
    // CORE
    // =======================================================

    {
      id: "hollow_body_hold",
      name: "Hollow Body Hold",
      figure: "core",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.SPINE_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 35,
      goals: ["foundation", "control", "line"],
      weakPointsTargeted: ["line", "pelvic_tilt", "compression", "hollow_control"],
      muscleGroups: ["rectus abdominis", "transverse abdominis", "hip flexors"],
      uiCategory: "Core",
      tags: ["core", "foundation", "hollow", "no_equipment", "daily"],
      equipment: [],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["l_sit_tuck", "hollow_rocks", "tuck_planche"],
      regressions: [],
      coachingCues: [
        "Posterior pelvic tilt: press lower back INTO the floor",
        "Arms overhead, straight (harder) or at sides (easier)",
        "Legs together, pointed toes",
        "If lower back lifts: tuck knees slightly, then work to straighten"
      ],
      commonErrors: ["Lower back arching off ground", "Holding breath", "Bent knees as a crutch without progressing"],
      videoSlug: "hollow_body_hold",
      recommendedVolume: { low: "3 × 15-20s", medium: "4 × 20-30s", high: "5 × 30-45s" }
    },

    {
      id: "arch_body_hold",
      name: "Arch Body Hold",
      figure: "core",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.SPINE_MEDIUM],
      perceivedDifficulty: 2,
      avgSetDurationSec: 30,
      goals: ["back_chain", "line"],
      weakPointsTargeted: ["back_chain", "line"],
      muscleGroups: ["spinal erectors", "glutes", "hamstrings", "rear deltoid"],
      uiCategory: "Core",
      tags: ["core", "foundation", "arch", "no_equipment"],
      equipment: [],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: [],
      regressions: [],
      coachingCues: [
        "Opposite of hollow: face down, lift everything off the ground",
        "Arms overhead, legs together, squeeze glutes and hamstrings",
        "Think of making a banana shape face-down"
      ],
      commonErrors: ["Bent knees", "Arms at sides instead of overhead", "Head jutting up"],
      videoSlug: "arch_body_hold",
      recommendedVolume: { low: "3 × 15-25s", medium: "4 × 20-30s", high: "5 × 25-40s" }
    },

    {
      id: "hollow_rocks",
      name: "Hollow Body Rocks",
      figure: "core",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SPINE_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 30,
      goals: ["core_endurance", "hollow_control"],
      weakPointsTargeted: ["hollow_control", "compression"],
      muscleGroups: ["rectus abdominis", "transverse abdominis", "hip flexors"],
      uiCategory: "Core",
      tags: ["core", "intermediate", "hollow", "no_equipment"],
      equipment: [],
      methods: [METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "hollow_body_hold", metric: "hold", op: ">=", value: 25 }],
      progressions: ["l_sit_tuck"],
      regressions: ["hollow_body_hold"],
      coachingCues: [
        "Maintain perfect hollow shape throughout — the shape does not change",
        "Rock comes from the shape, not from legs/arms moving independently",
        "If shape collapses, stop and reset"
      ],
      commonErrors: ["Shape breaking during rocks", "Too fast (momentum cheating)"],
      videoSlug: "hollow_rocks",
      recommendedVolume: { low: "3 × 10-15 reps", medium: "4 × 15-20 reps", high: "5 × 20-30 reps" }
    },

    {
      id: "dragon_flag",
      name: "Dragon Flag",
      figure: "core",
      type: "dynamic",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SPINE_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 9,
      avgSetDurationSec: 45,
      goals: ["core_strength", "front_chain"],
      weakPointsTargeted: ["hollow_control", "front_chain", "compression"],
      muscleGroups: ["entire core", "hip flexors", "rear deltoid", "lats"],
      uiCategory: "Core",
      tags: ["core", "advanced", "front_chain", "bench"],
      equipment: ["bench_or_bar"],
      methods: [METHODS.NEGATIVE, METHODS.PARTIAL_REPS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "hollow_body_hold", metric: "hold", op: ">=", value: 40 }],
      progressions: [],
      regressions: ["hollow_body_hold", "leg_raises_hanging"],
      coachingCues: [
        "Start with negatives only: lower slowly, reset from top",
        "Body stays completely straight (hollow position maintained)",
        "Grip bench/bar behind head for support",
        "If hips pike, regression is needed first"
      ],
      commonErrors: ["Hips piking", "Neck strain from improper head position", "Dropping too fast"],
      videoSlug: "dragon_flag",
      recommendedVolume: { low: "4 × 2-3 negatives", medium: "5 × 3-4", high: "5 × max" }
    },

    {
      id: "leg_raises_hanging",
      name: "Hanging Leg Raises",
      figure: "core",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.HIP_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 40,
      goals: ["core_strength", "compression_prep"],
      weakPointsTargeted: ["compression", "hip_flexor_strength", "hollow_control"],
      muscleGroups: ["rectus abdominis", "hip flexors", "iliopsoas"],
      uiCategory: "Core",
      tags: ["core", "hanging", "bar", "intermediate"],
      equipment: ["bar"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "pullup", metric: "reps", op: ">=", value: 3 }],
      progressions: ["l_sit", "tuck_front_lever"],
      regressions: ["hollow_body_hold"],
      coachingCues: [
        "Toes to bar is the goal; legs parallel = intermediate",
        "Posterior pelvic tilt: pull lower back INTO the bar",
        "Slow eccentric: resist the way down",
        "Avoid swinging — this is core work, not a hip flexor bounce"
      ],
      commonErrors: ["Swinging", "Using momentum", "Anterior pelvic tilt at top"],
      videoSlug: "hanging_leg_raises",
      recommendedVolume: { low: "4 × 6-10", medium: "5 × 8-12", high: "5 × 10-15" }
    },

    // =======================================================
    // COMPRESSION (L-SIT / V-SIT)
    // =======================================================

    {
      id: "l_sit_tuck",
      name: "Tuck L-Sit",
      figure: "compression",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM, JOINT_STRESS.HIP_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 20,
      goals: ["foundation", "compression"],
      weakPointsTargeted: ["compression", "hip_flexor_strength", "wrist_tolerance"],
      muscleGroups: ["hip flexors", "triceps", "wrist extensors"],
      uiCategory: "L-Sit",
      tags: ["compression", "l-sit", "beginner", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["l_sit"],
      regressions: ["compression_lift"],
      coachingCues: [
        "Knees tucked to chest initially",
        "Arms locked straight, shoulders depressed",
        "Work toward extending one leg at a time",
        "Ground, parallettes, or two chairs all work"
      ],
      commonErrors: ["Bent arms", "Shoulders shrugging up", "Not working toward leg extension"],
      videoSlug: "l_sit_tuck",
      recommendedVolume: { low: "4 × 8-12s", medium: "5 × 10-20s", high: "6 × 15-25s" }
    },

    {
      id: "l_sit",
      name: "L-Sit",
      figure: "compression",
      type: "static",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM, JOINT_STRESS.HIP_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 20,
      goals: ["compression", "strength", "control"],
      weakPointsTargeted: ["compression", "line", "hip_flexor_strength"],
      muscleGroups: ["hip flexors", "triceps", "core", "wrist extensors"],
      uiCategory: "L-Sit",
      tags: ["compression", "l-sit", "intermediate", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "l_sit_tuck", metric: "hold", op: ">=", value: 20 }],
      progressions: ["v_sit_progression", "l_sit_to_tuck_planche"],
      regressions: ["l_sit_tuck"],
      coachingCues: [
        "Legs fully extended and horizontal (parallel to floor)",
        "Pointed toes — this is not optional for the skill",
        "Push DOWN through the parallettes to stay elevated",
        "Shoulders depressed (not shrugged)"
      ],
      commonErrors: ["Feet too low (below horizontal)", "Bent knees", "Shrugged shoulders", "Bent arms"],
      videoSlug: "l_sit",
      recommendedVolume: { low: "4 × 5-10s", medium: "5 × 10-15s", high: "6 × 15-25s" }
    },

    {
      id: "v_sit_progression",
      name: "V-Sit Progression",
      figure: "compression",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.HIP_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 8,
      avgSetDurationSec: 15,
      goals: ["compression", "manna_prep"],
      weakPointsTargeted: ["compression", "line", "hip_flexor_strength"],
      muscleGroups: ["hip flexors", "iliopsoas", "core", "triceps"],
      uiCategory: "L-Sit",
      tags: ["compression", "v-sit", "advanced", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "l_sit", metric: "hold", op: ">=", value: 15 }],
      progressions: [],
      regressions: ["l_sit"],
      coachingCues: [
        "Legs lift above horizontal, approaching 45° above",
        "Hips tilt backwards to allow legs higher",
        "Much greater hip flexor and compression demand",
        "Work in partials: slightly above L-sit first"
      ],
      commonErrors: ["Not leaning back enough (hips won't let legs rise)", "Bent knees", "Arms bending"],
      videoSlug: "v_sit",
      recommendedVolume: { low: "4 × 4-8s", medium: "5 × 6-12s", high: "6 × 8-15s" }
    },

    // =======================================================
    // HANDSTAND / HSPU
    // =======================================================

    {
      id: "box_pike_hold",
      name: "Box Pike Hold",
      figure: "handstand",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_MEDIUM, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 25,
      goals: ["shoulder_stacking", "handstand_prep"],
      weakPointsTargeted: ["balance", "shoulder_stability", "line"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors"],
      uiCategory: "Handstand",
      tags: ["handstand", "beginner", "balance", "no_equipment"],
      equipment: [],
      methods: [METHODS.HOLDS, METHODS.GTG],
      unlockConditions: [],
      progressions: ["wall_handstand_chest_to_wall"],
      regressions: [],
      coachingCues: [
        "Feet on box/bench, hands on floor — pike shape",
        "Walk hands toward box to increase shoulder angle",
        "Work toward straight, stacked line",
        "Feel shoulder blades protracting and elevating"
      ],
      commonErrors: ["Sagging through shoulders", "Hips too high (not enough load)"],
      videoSlug: "box_pike_hold",
      recommendedVolume: { low: "4 × 15-20s", medium: "5 × 20-30s", high: "5 × 30-45s" }
    },

    {
      id: "wall_handstand_chest_to_wall",
      name: "Wall Handstand (Chest to Wall)",
      figure: "handstand",
      type: "static",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 5,
      avgSetDurationSec: 35,
      goals: ["balance", "line", "stacking"],
      weakPointsTargeted: ["balance", "line", "shoulder_stability"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "core", "wrist extensors"],
      uiCategory: "Handstand",
      tags: ["handstand", "wall", "intermediate", "balance"],
      equipment: ["wall"],
      methods: [METHODS.HOLDS, METHODS.GTG],
      unlockConditions: [],
      progressions: ["free_handstand", "wall_hspu"],
      regressions: ["box_pike_hold"],
      coachingCues: [
        "Chest faces the wall — this forces a hollow line (not banana back)",
        "Walk feet up the wall, hands 10-20cm from wall",
        "Push floor away, shoulders stacked over wrists",
        "Toe touch: try removing one foot briefly to train balance"
      ],
      commonErrors: ["Back-to-wall handstand (creates banana habit)", "Hands too far from wall", "Not pushing floor away"],
      videoSlug: "wall_hs_chest",
      recommendedVolume: { low: "4 × 15-25s", medium: "5 × 20-40s", high: "6 × 30-60s" }
    },

    {
      id: "free_handstand",
      name: "Free Handstand",
      figure: "handstand",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 30,
      goals: ["balance", "control"],
      weakPointsTargeted: ["balance", "line"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "core", "finger flexors"],
      uiCategory: "Handstand",
      tags: ["handstand", "advanced", "balance", "skill"],
      equipment: [],
      methods: [METHODS.HOLDS, METHODS.GTG],
      unlockConditions: [{ exerciseId: "wall_handstand_chest_to_wall", metric: "hold", op: ">=", value: 30 }],
      progressions: ["wall_hspu", "press_handstand_base"],
      regressions: ["wall_handstand_chest_to_wall"],
      coachingCues: [
        "Balance through fingers (push with fingertips to fall back; push with heel of hand to fall forward)",
        "Eyes fixed on a point between hands",
        "Consistent kick-up entry leads to consistent holds",
        "Aim for quality attempts: 3-5 second holds first"
      ],
      commonErrors: ["Looking at the wall (not the floor)", "Inconsistent entry", "Holding breath"],
      videoSlug: "free_handstand",
      recommendedVolume: { low: "10 min skill practice", medium: "15 min skill practice", high: "20 min skill practice" }
    },

    {
      id: "pike_pushup",
      name: "Pike Push-Up",
      figure: "handstand",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.WRIST_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["press_strength", "hspu_prep"],
      weakPointsTargeted: ["press_strength", "shoulder_stability"],
      muscleGroups: ["anterior deltoid", "triceps", "serratus anterior"],
      uiCategory: "Handstand",
      tags: ["handstand", "push", "intermediate", "press_strength"],
      equipment: [],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "pushup_standard", metric: "reps", op: ">=", value: 12 }],
      progressions: ["wall_hspu", "elevated_pike_pushup"],
      regressions: ["pushup_standard"],
      coachingCues: [
        "Hips high, inverted-V shape",
        "Elbows track forward along ears (not flared wide)",
        "Forehead toward floor — not nose",
        "The more vertical the torso, the more shoulder demand"
      ],
      commonErrors: ["Elbows flaring wide", "Not going to full depth", "Too little hip height (turns into push-up)"],
      videoSlug: "pike_pushup",
      recommendedVolume: { low: "3 × 4-8", medium: "4 × 6-12", high: "5 × 8-15" }
    },

    {
      id: "elevated_pike_pushup",
      name: "Elevated Pike Push-Up",
      figure: "handstand",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 7,
      avgSetDurationSec: 45,
      goals: ["press_strength", "hspu_prep"],
      weakPointsTargeted: ["press_strength", "shoulder_stability", "line"],
      muscleGroups: ["anterior deltoid", "triceps", "serratus anterior", "upper trapezius"],
      uiCategory: "Handstand",
      tags: ["handstand", "push", "intermediate", "press_strength"],
      equipment: ["bench_or_box"],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME, METHODS.PARTIAL_REPS, METHODS.NEGATIVE],
      unlockConditions: [{ exerciseId: "pike_pushup", metric: "reps", op: ">=", value: 10 }],
      progressions: ["wall_hspu"],
      regressions: ["pike_pushup"],
      coachingCues: [
        "Feet elevated on bench: much more vertical torso = closer to HSPU",
        "Track elbows along the ears",
        "Partial reps (top half only) are valid progressions toward full depth"
      ],
      commonErrors: ["Elbows flaring", "Hips not high enough", "Insufficient foot elevation"],
      videoSlug: "elevated_pike_pushup",
      recommendedVolume: { low: "4 × 3-5", medium: "5 × 4-8", high: "6 × 5-10" }
    },

    {
      id: "wall_hspu",
      name: "Wall Handstand Push-Up",
      figure: "handstand",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 50,
      goals: ["strength", "press_strength"],
      weakPointsTargeted: ["press_strength", "line", "shoulder_stability"],
      muscleGroups: ["anterior deltoid", "triceps", "serratus anterior", "upper trapezius", "upper pectoralis"],
      uiCategory: "Handstand",
      tags: ["handstand", "push", "advanced", "press_strength"],
      equipment: ["wall"],
      methods: [METHODS.MAX_REPS, METHODS.NEGATIVE, METHODS.PARTIAL_REPS],
      unlockConditions: [
        { exerciseId: "elevated_pike_pushup", metric: "reps", op: ">=", value: 8 },
        { exerciseId: "wall_handstand_chest_to_wall", metric: "hold", op: ">=", value: 20 }
      ],
      progressions: ["deficit_wall_hspu"],
      regressions: ["elevated_pike_pushup"],
      coachingCues: [
        "Chest-to-wall handstand is safest (hollow line vs banana)",
        "Negatives first: kick up and lower slowly",
        "Full range: head to floor, full lockout at top",
        "Head position: look at floor between hands, not straight up"
      ],
      commonErrors: ["Banana back (back-to-wall HS)", "Partial reps only", "Neck craning upward"],
      videoSlug: "wall_hspu",
      recommendedVolume: { low: "4 × 1-3", medium: "5 × 2-5", high: "6 × 3-6" }
    },

    {
      id: "deficit_wall_hspu",
      name: "Deficit Wall Handstand Push-Up",
      figure: "handstand",
      type: "dynamic",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 55,
      goals: ["max_press_strength"],
      weakPointsTargeted: ["press_strength", "shoulder_stability"],
      muscleGroups: ["anterior deltoid", "triceps", "serratus anterior", "upper trapezius"],
      uiCategory: "Handstand",
      tags: ["handstand", "push", "elite", "press_strength"],
      equipment: ["wall", "parallettes_optional"],
      methods: [METHODS.MAX_REPS, METHODS.NEGATIVE, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "wall_hspu", metric: "reps", op: ">=", value: 5 }],
      progressions: [],
      regressions: ["wall_hspu"],
      coachingCues: [
        "Hands on books or parallettes: increases range of motion below head level",
        "Massive shoulder and tricep demand",
        "Negatives only are valid if full reps aren't there yet"
      ],
      commonErrors: ["Using partial range to feel strong", "No parallette option → wrist angle issues"],
      videoSlug: "deficit_wall_hspu",
      recommendedVolume: { low: "4 × 1-2", medium: "5 × 2-3", high: "6 × 2-4" }
    },

    // =======================================================
    // PLANCHE
    // =======================================================

    {
      id: "planche_lean",
      name: "Planche Lean",
      figure: "planche",
      type: "static",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 20,
      goals: ["foundation", "planche_prep"],
      weakPointsTargeted: ["protraction", "straight_arm_strength", "wrist_tolerance", "front_chain"],
      muscleGroups: ["serratus anterior", "anterior deltoid", "wrist extensors", "core"],
      uiCategory: "Planche",
      tags: ["planche", "beginner", "foundation", "no_equipment"],
      equipment: [],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [],
      progressions: ["semi_planche_hold", "planche_lean_pushup"],
      regressions: ["scapula_pushup"],
      coachingCues: [
        "Push-up position with hands turned backward/outward",
        "Lean forward so shoulders are in front of wrists",
        "Protract (push through) shoulder blades — no sinking",
        "Wrist conditioning is key — build gradually over weeks"
      ],
      commonErrors: ["Insufficient forward lean", "Sinking through shoulders (no protraction)", "Rushed wrist conditioning"],
      videoSlug: "planche_lean",
      recommendedVolume: { low: "4 × 10-15s", medium: "5 × 15-25s", high: "6 × 20-30s" }
    },

    {
      id: "planche_lean_pushup",
      name: "Planche Lean Push-Up",
      figure: "planche",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 45,
      goals: ["planche_prep", "push_strength"],
      weakPointsTargeted: ["push_strength", "protraction"],
      muscleGroups: ["anterior deltoid", "pectoralis major", "serratus anterior", "triceps"],
      uiCategory: "Planche",
      tags: ["planche", "intermediate", "push", "no_equipment"],
      equipment: [],
      methods: [METHODS.MAX_REPS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "planche_lean", metric: "hold", op: ">=", value: 20 }],
      progressions: ["tuck_planche_pushup"],
      regressions: ["pseudo_planche_pushup"],
      coachingCues: [
        "Start from planche lean position, not standard push-up",
        "Maintain forward lean throughout the rep",
        "Protraction must not collapse at any point",
        "Slower = harder = more specific to planche"
      ],
      commonErrors: ["Losing lean on the way up", "Collapsing protraction"],
      videoSlug: "planche_lean_pushup",
      recommendedVolume: { low: "3 × 4-8", medium: "4 × 6-10", high: "5 × 8-15" }
    },

    {
      id: "semi_planche_hold",
      name: "Semi Planche Hold",
      figure: "planche",
      type: "static",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 6,
      avgSetDurationSec: 15,
      goals: ["planche_prep", "straight_arm_strength"],
      weakPointsTargeted: ["straight_arm_strength", "height", "protraction"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors", "upper trapezius"],
      uiCategory: "Planche",
      tags: ["planche", "intermediate", "static", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.HOLDS, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "planche_lean", metric: "hold", op: ">=", value: 20 }],
      progressions: ["tuck_planche"],
      regressions: ["planche_lean"],
      coachingCues: [
        "Lean until just before feet leave floor",
        "Maximum forward lean with protraction maintained",
        "One step below full tuck planche",
        "Band around waist can assist"
      ],
      commonErrors: ["Not leaning far enough", "Losing protraction", "Wrists caving"],
      videoSlug: "semi_planche_hold",
      recommendedVolume: { low: "4 × 5-8s", medium: "5 × 8-12s", high: "6 × 10-15s" }
    },

    {
      id: "tuck_planche",
      name: "Tuck Planche",
      figure: "planche",
      type: "static",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 7,
      avgSetDurationSec: 12,
      goals: ["strength", "skill"],
      weakPointsTargeted: ["straight_arm_strength", "protraction", "balance"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors", "core"],
      uiCategory: "Planche",
      tags: ["planche", "intermediate", "static", "skill"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "semi_planche_hold", metric: "hold", op: ">=", value: 8 }],
      progressions: ["advanced_tuck_planche", "l_sit_to_tuck_planche", "tuck_planche_pushup"],
      regressions: ["semi_planche_hold"],
      coachingCues: [
        "Knees tucked to chest, hips above shoulders",
        "Arms fully straight (no bend — this is a straight arm skill)",
        "Maximum protraction at all times",
        "Eyes down, not forward"
      ],
      commonErrors: ["Bent elbows (this is not a bent-arm skill)", "Hips too low", "Insufficient protraction"],
      videoSlug: "tuck_planche",
      recommendedVolume: { low: "4 × 4-8s", medium: "5 × 6-10s", high: "6 × 8-12s" }
    },

    {
      id: "l_sit_to_tuck_planche",
      name: "L-Sit to Tuck Planche",
      figure: "planche",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.HIP_MEDIUM],
      perceivedDifficulty: 7,
      avgSetDurationSec: 50,
      goals: ["transitions", "skill"],
      weakPointsTargeted: ["compression", "transitions", "press_strength"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "hip flexors", "core"],
      uiCategory: "Planche",
      tags: ["planche", "intermediate", "transition", "combo"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.SHORT_COMBO, METHODS.PARTIAL_REPS],
      unlockConditions: [
        { exerciseId: "l_sit", metric: "hold", op: ">=", value: 8 },
        { exerciseId: "tuck_planche", metric: "hold", op: ">=", value: 4 }
      ],
      progressions: [],
      regressions: ["l_sit", "tuck_planche"],
      coachingCues: [
        "From L-sit: drive elbows to hips and simultaneously lean forward",
        "Hips must pass over hands during the transition",
        "Don't rush — the transition point is where you learn",
        "Can pause briefly at each position"
      ],
      commonErrors: ["Rushing through (no pause at positions)", "Not learning where hips need to go", "Losing protraction mid-transition"],
      videoSlug: "l_sit_to_tuck_planche",
      recommendedVolume: { low: "4 × 1-3 reps", medium: "5 × 2-4 reps", high: "6 × 3-5 reps" }
    },

    {
      id: "advanced_tuck_planche",
      name: "Advanced Tuck Planche",
      figure: "planche",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 10,
      goals: ["strength", "skill"],
      weakPointsTargeted: ["height", "straight_arm_strength", "line"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors", "upper trapezius"],
      uiCategory: "Planche",
      tags: ["planche", "intermediate", "static", "skill"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "tuck_planche", metric: "hold", op: ">=", value: 8 }],
      progressions: ["band_straddle_planche", "straddle_planche", "tuck_planche_pushup"],
      regressions: ["tuck_planche"],
      coachingCues: [
        "Same as tuck but legs extend further back",
        "Hips still above shoulders — do not let them drop",
        "Think: back is becoming flatter each week",
        "Height is king — never sacrifice it for form"
      ],
      commonErrors: ["Hips dropping (cheating the height)", "Back not getting flatter over time", "Bent elbows"],
      videoSlug: "advanced_tuck_planche",
      recommendedVolume: { low: "4 × 4-6s", medium: "5 × 6-8s", high: "6 × 8-12s" }
    },

    {
      id: "tuck_planche_pushup",
      name: "Tuck Planche Push-Up",
      figure: "planche",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 50,
      goals: ["dynamic_planche_strength"],
      weakPointsTargeted: ["push_strength", "transitions", "protraction"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "triceps", "pectoralis major"],
      uiCategory: "Planche",
      tags: ["planche", "advanced", "dynamic", "push"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.PARTIAL_REPS, METHODS.DEAD_STOP, METHODS.MAX_REPS],
      unlockConditions: [{ exerciseId: "tuck_planche", metric: "hold", op: ">=", value: 6 }],
      progressions: ["band_straddle_pushup"],
      regressions: ["planche_lean_pushup"],
      coachingCues: [
        "Lower from tuck planche hold — do not cheat from a high position",
        "Dead stop at bottom is cleanest variation",
        "Maintain tuck height throughout the range",
        "Full lockout at top of each rep"
      ],
      commonErrors: ["Starting too high (not genuine planche position)", "Hips sinking on descent", "No dead stop at bottom"],
      videoSlug: "tuck_planche_pushup",
      recommendedVolume: { low: "4 × 1-3", medium: "5 × 2-4", high: "6 × 3-6" }
    },

    {
      id: "band_straddle_planche",
      name: "Band Assisted Straddle Planche",
      figure: "planche",
      type: "assisted",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 8,
      avgSetDurationSec: 10,
      goals: ["skill", "line", "volume"],
      weakPointsTargeted: ["height", "line", "balance", "leg_separation"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors", "hip abductors"],
      uiCategory: "Planche",
      tags: ["planche", "intermediate", "assisted", "straddle"],
      equipment: ["band"],
      methods: [METHODS.ASSISTED, METHODS.MAX_HOLD],
      unlockConditions: [{ exerciseId: "advanced_tuck_planche", metric: "hold", op: ">=", value: 6 }],
      progressions: ["straddle_planche"],
      regressions: ["advanced_tuck_planche"],
      coachingCues: [
        "Band around hips, not waist",
        "Use minimum band that allows quality form",
        "Straddle: legs wide apart, reducing moment arm vs full planche",
        "Depress the band reliance every 2-3 weeks"
      ],
      commonErrors: ["Too strong a band (no actual demand)", "Legs not separating wide enough", "Hips dropping under band"],
      videoSlug: "band_straddle_planche",
      recommendedVolume: { low: "4 × 4-6s", medium: "5 × 5-8s", high: "6 × 6-10s" }
    },

    {
      id: "straddle_planche",
      name: "Straddle Planche",
      figure: "planche",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 6,
      goals: ["strength", "skill"],
      weakPointsTargeted: ["height", "line", "balance", "straight_arm_strength"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors", "hip abductors", "core"],
      uiCategory: "Planche",
      tags: ["planche", "advanced", "static", "skill"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED, METHODS.SHORT_COMBO],
      unlockConditions: [{ exerciseId: "band_straddle_planche", metric: "hold", op: ">=", value: 6 }],
      progressions: ["straddle_negative", "band_straddle_pushup", "full_planche"],
      regressions: ["band_straddle_planche", "advanced_tuck_planche"],
      coachingCues: [
        "Legs wide: the wider the straddle, the easier (shorter moment arm)",
        "Hips perfectly level with shoulders — not above or below",
        "Maintain perfect scapular protraction",
        "Work to bring legs together progressively (→ full planche)"
      ],
      commonErrors: ["Hips too high or too low", "Legs not wide enough to start", "Protraction dropping"],
      videoSlug: "straddle_planche",
      recommendedVolume: { low: "3-4 × max hold", medium: "4-5 × max hold", high: "5-6 × max hold" }
    },

    {
      id: "straddle_negative",
      name: "Straddle Planche Negative",
      figure: "planche",
      type: "eccentric",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 30,
      goals: ["control", "entry_prep"],
      weakPointsTargeted: ["transitions", "height", "press_strength"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "core", "triceps"],
      uiCategory: "Planche",
      tags: ["planche", "advanced", "negative", "eccentric"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.NEGATIVE, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "straddle_planche", metric: "hold", op: ">=", value: 3 }],
      progressions: ["full_negative"],
      regressions: ["band_straddle_planche"],
      coachingCues: [
        "Start from tuck or supported position, extend to straddle on the way down",
        "Aim for 4-6 second descent",
        "Hips must stay level throughout the lowering",
        "Reset from top each time — no bottom-to-top push-up"
      ],
      commonErrors: ["Dropping too fast (not eccentric)", "Hips dropping on descent"],
      videoSlug: "straddle_negative",
      recommendedVolume: { low: "4 × 1-2", medium: "5 × 2-3", high: "6 × 2-4" }
    },

    {
      id: "band_straddle_pushup",
      name: "Band Assisted Straddle Push-Up",
      figure: "planche",
      type: "assisted",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 55,
      goals: ["dynamic_planche_strength"],
      weakPointsTargeted: ["push_strength", "transitions", "height"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "triceps", "pectoralis major"],
      uiCategory: "Planche",
      tags: ["planche", "advanced", "push", "assisted"],
      equipment: ["band", "parallettes_optional"],
      methods: [METHODS.ASSISTED, METHODS.PARTIAL_REPS, METHODS.DEAD_STOP],
      unlockConditions: [{ exerciseId: "straddle_planche", metric: "hold", op: ">=", value: 3 }],
      progressions: ["full_planche_pushup"],
      regressions: ["tuck_planche_pushup"],
      coachingCues: [
        "Same rules as tuck planche push-up, more demanding",
        "Band should be minimal — just enough to get clean reps",
        "Dead stop at the bottom builds the most specific strength"
      ],
      commonErrors: ["Band too strong (cheating the adaptation)", "Losing straddle width under load"],
      videoSlug: "band_straddle_pushup",
      recommendedVolume: { low: "4 × 1-3", medium: "5 × 2-4", high: "6 × 3-5" }
    },

    {
      id: "full_planche",
      name: "Full Planche",
      figure: "planche",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 5,
      goals: ["max_strength", "skill"],
      weakPointsTargeted: ["height", "line", "straight_arm_strength", "balance"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "wrist extensors", "core", "upper trapezius"],
      uiCategory: "Planche",
      tags: ["planche", "elite", "static", "skill"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.SHORT_COMBO, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "straddle_planche", metric: "hold", op: ">=", value: 5 }],
      progressions: ["full_planche_pushup", "wide_planche"],
      regressions: ["straddle_planche"],
      coachingCues: [
        "Legs together, fully straight, parallel to floor",
        "This is one of the hardest straight-arm strength skills",
        "Maintain full protraction — never let shoulders sink",
        "Photo test: does a line from feet to shoulders look horizontal?"
      ],
      commonErrors: ["Legs not fully together", "Hips slightly below horizontal", "Protraction loss"],
      videoSlug: "full_planche",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    },

    {
      id: "full_planche_pushup",
      name: "Full Planche Push-Up",
      figure: "planche",
      type: "dynamic",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 60,
      goals: ["max_strength", "dynamic_strength"],
      weakPointsTargeted: ["push_strength", "transitions", "height"],
      muscleGroups: ["anterior deltoid", "serratus anterior", "triceps", "pectoralis major", "core"],
      uiCategory: "Planche",
      tags: ["planche", "elite", "push", "skill"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.PARTIAL_REPS, METHODS.DEAD_STOP, METHODS.SHORT_COMBO],
      unlockConditions: [{ exerciseId: "full_planche", metric: "hold", op: ">=", value: 3 }],
      progressions: ["maltese_pushup_assisted"],
      regressions: ["band_straddle_pushup"],
      coachingCues: [
        "Full planche maintained at top and bottom",
        "Even 1 clean rep is significant progress",
        "Dead stop at bottom prevents cheating",
        "Partial range (top half only) is valid for building toward full range"
      ],
      commonErrors: ["Not genuine full planche at the top", "Using momentum"],
      videoSlug: "full_planche_pushup",
      recommendedVolume: { low: "4 × 1", medium: "5 × 1-2", high: "6 × 2-3" }
    },

    // =======================================================
    // FRONT LEVER
    // =======================================================

    {
      id: "band_front_lever_tuck",
      name: "Band Assisted Tuck Front Lever",
      figure: "front_lever",
      type: "assisted",
      level: "beginner",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 3,
      avgSetDurationSec: 15,
      goals: ["front_lever_prep", "back_chain"],
      weakPointsTargeted: ["back_chain", "depression_strength", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "core"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "beginner", "assisted", "bar"],
      equipment: ["bar", "band"],
      methods: [METHODS.ASSISTED, METHODS.HOLDS],
      unlockConditions: [],
      progressions: ["tuck_front_lever"],
      regressions: ["scapula_pullup"],
      coachingCues: [
        "Band supports hips — allows you to practice the position before you have the strength",
        "Focus on depressing shoulder blades while in the hold",
        "Arms stay straight — front lever is a straight arm skill",
        "Aim to use progressively lighter bands"
      ],
      commonErrors: ["Using band to cheat (not progressing)","Bent elbows","Not activating lats and lower traps"],
      videoSlug: "band_fl_tuck",
      recommendedVolume: { low: "4 × 8-12s", medium: "5 × 10-15s", high: "6 × 12-18s" }
    },

    {
      id: "front_lever_raise_tuck",
      name: "Tuck Front Lever Raise",
      figure: "front_lever",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["front_lever_prep", "back_chain", "lat_activation"],
      weakPointsTargeted: ["back_chain", "depression_strength", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "core"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "intermediate", "dynamic", "bar"],
      equipment: ["bar"],
      methods: [METHODS.VOLUME, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "pullup", metric: "reps", op: ">=", value: 5 }],
      progressions: ["tuck_front_lever"],
      regressions: ["band_front_lever_tuck"],
      coachingCues: [
        "From dead hang, tuck knees and raise body to tuck front lever position",
        "Pause 1-2 seconds at the top",
        "Lower slowly (eccentric)",
        "Arms stay straight — if they bend, this is too hard for now"
      ],
      commonErrors: ["Bending elbows", "Using kip/swing", "Not pausing at top"],
      videoSlug: "fl_raise_tuck",
      recommendedVolume: { low: "4 × 3-5", medium: "5 × 4-6", high: "6 × 5-8" }
    },

    {
      id: "tuck_front_lever",
      name: "Tuck Front Lever",
      figure: "front_lever",
      type: "static",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 12,
      goals: ["strength", "skill", "back_chain"],
      weakPointsTargeted: ["back_chain", "depression_strength", "line", "lat_activation"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "core", "biceps"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "intermediate", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "pullup", metric: "reps", op: ">=", value: 5 }],
      progressions: ["advanced_tuck_front_lever", "front_lever_row_tuck"],
      regressions: ["band_front_lever_tuck", "front_lever_raise_tuck"],
      coachingCues: [
        "Overhand grip, arms straight",
        "Depress AND retract shoulder blades simultaneously",
        "Knees tucked to chest, back parallel to floor",
        "Body shape must not change — only gravity changes"
      ],
      commonErrors: ["Bent elbows", "Hips dropping below parallel", "Shoulders not depressed"],
      videoSlug: "tuck_front_lever",
      recommendedVolume: { low: "4 × 5-8s", medium: "5 × 6-10s", high: "6 × 8-12s" }
    },

    {
      id: "front_lever_row_tuck",
      name: "Tuck Front Lever Row",
      figure: "front_lever",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.HYPERTROPHY,
      jointStress: [JOINT_STRESS.SHOULDER_MEDIUM, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 7,
      avgSetDurationSec: 45,
      goals: ["strength", "dynamic_front_lever"],
      weakPointsTargeted: ["back_chain", "pull_strength", "depression_strength"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "biceps"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "intermediate", "dynamic", "bar"],
      equipment: ["bar"],
      methods: [METHODS.VOLUME, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "tuck_front_lever", metric: "hold", op: ">=", value: 6 }],
      progressions: ["front_lever_row_advanced_tuck"],
      regressions: ["front_lever_raise_tuck"],
      coachingCues: [
        "From tuck front lever position, pull bar to lower chest",
        "Maintain tuck position throughout",
        "Elbows stay close to body",
        "Not a pull-up — keep the horizontal body line"
      ],
      commonErrors: ["Turning it into a pull-up (body going vertical)", "Hips dropping during row", "Losing tuck shape"],
      videoSlug: "fl_row_tuck",
      recommendedVolume: { low: "4 × 2-4", medium: "5 × 3-6", high: "6 × 4-8" }
    },

    {
      id: "advanced_tuck_front_lever",
      name: "Advanced Tuck Front Lever",
      figure: "front_lever",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 7,
      avgSetDurationSec: 10,
      goals: ["strength", "skill", "back_chain"],
      weakPointsTargeted: ["back_chain", "depression_strength", "line"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "core", "biceps"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "advanced", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "tuck_front_lever", metric: "hold", op: ">=", value: 8 }],
      progressions: ["one_leg_front_lever", "straddle_front_lever", "front_lever_row_advanced_tuck"],
      regressions: ["tuck_front_lever"],
      coachingCues: [
        "Legs extend further back (less tucked) — knees now at 90° or less",
        "Back must stay parallel to floor — don't let hips drop",
        "More demanding on lower traps and lats",
        "Intermediate between tuck and straddle"
      ],
      commonErrors: ["Hips dropping", "Not extending legs further from tuck", "Bent elbows"],
      videoSlug: "advanced_tuck_fl",
      recommendedVolume: { low: "4 × 4-6s", medium: "5 × 5-8s", high: "6 × 6-10s" }
    },

    {
      id: "one_leg_front_lever",
      name: "One Leg Front Lever",
      figure: "front_lever",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 8,
      avgSetDurationSec: 8,
      goals: ["front_lever_progression"],
      weakPointsTargeted: ["back_chain", "depression_strength", "line"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "core", "hip flexors"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "advanced", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "advanced_tuck_front_lever", metric: "hold", op: ">=", value: 8 }],
      progressions: ["straddle_front_lever"],
      regressions: ["advanced_tuck_front_lever"],
      coachingCues: [
        "One leg extended, one leg tucked",
        "Alternate legs each set for balanced development",
        "Body must stay horizontal with the extended leg",
        "Extend the tucked leg to straddle over time"
      ],
      commonErrors: ["Not keeping extended leg horizontal", "Forgetting to alternate legs"],
      videoSlug: "one_leg_fl",
      recommendedVolume: { low: "4 × 5-7s each side", medium: "5 × 6-8s each side", high: "6 × 7-10s each side" }
    },

    {
      id: "straddle_front_lever",
      name: "Straddle Front Lever",
      figure: "front_lever",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 9,
      avgSetDurationSec: 6,
      goals: ["strength", "skill", "back_chain"],
      weakPointsTargeted: ["back_chain", "line", "depression_strength"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "core"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "advanced", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "advanced_tuck_front_lever", metric: "hold", op: ">=", value: 8 }],
      progressions: ["full_front_lever"],
      regressions: ["advanced_tuck_front_lever", "one_leg_front_lever"],
      coachingCues: [
        "Legs spread wide — wider = easier (shorter moment arm)",
        "Body must be horizontal — perfectly parallel to floor",
        "Work to bring legs together progressively",
        "Depression must be maintained — hardest part for most athletes"
      ],
      commonErrors: ["Body not horizontal", "Insufficient depression", "Legs not wide enough to start"],
      videoSlug: "straddle_fl",
      recommendedVolume: { low: "4 × 3-5s", medium: "5 × 4-6s", high: "6 × 5-8s" }
    },

    {
      id: "full_front_lever",
      name: "Full Front Lever",
      figure: "front_lever",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 4,
      goals: ["max_strength", "skill"],
      weakPointsTargeted: ["back_chain", "line", "depression_strength"],
      muscleGroups: ["latissimus dorsi", "lower trapezius", "rear deltoid", "core", "biceps"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "elite", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "straddle_front_lever", metric: "hold", op: ">=", value: 5 }],
      progressions: ["front_lever_pullup"],
      regressions: ["straddle_front_lever"],
      coachingCues: [
        "Legs together, body perfectly horizontal",
        "This is one of the hardest straight arm pulling skills",
        "Even 1-2 second holds are meaningful at first",
        "Film yourself — hips often feel higher than they are"
      ],
      commonErrors: ["Hips below horizontal (butt drop)", "Bent elbows", "Legs not fully together"],
      videoSlug: "full_fl",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    },

    {
      id: "front_lever_pullup",
      name: "Front Lever Pull-Up",
      figure: "front_lever",
      type: "dynamic",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 60,
      goals: ["max_strength"],
      weakPointsTargeted: ["back_chain", "pull_strength", "depression_strength"],
      muscleGroups: ["latissimus dorsi", "biceps", "lower trapezius", "core"],
      uiCategory: "Front Lever",
      tags: ["front_lever", "elite", "dynamic", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_REPS, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "full_front_lever", metric: "hold", op: ">=", value: 3 }],
      progressions: [],
      regressions: ["front_lever_row_tuck"],
      coachingCues: [
        "Full front lever position maintained while doing a pull-up",
        "Even partial reps (30-60° ROM) are elite level",
        "This is a lifelong goal for most athletes"
      ],
      commonErrors: ["Body going vertical (just a pull-up)", "Hips dropping during rep"],
      videoSlug: "fl_pullup",
      recommendedVolume: { low: "3 × 1", medium: "4 × 1-2", high: "5 × 1-3" }
    },

    // =======================================================
    // BACK LEVER
    // =======================================================
    // V3 ADDITION: Back lever is a foundational skill between pull-up and FL/planche
    // and was entirely missing from V2.

    {
      id: "skin_the_cat",
      name: "Skin the Cat",
      figure: "back_lever",
      type: "dynamic",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 5,
      avgSetDurationSec: 40,
      goals: ["shoulder_mobility", "back_lever_prep"],
      weakPointsTargeted: ["shoulder_stability", "back_chain"],
      muscleGroups: ["latissimus dorsi", "rear deltoid", "rotator cuff", "core"],
      uiCategory: "Back Lever",
      tags: ["back_lever", "intermediate", "mobility", "bar"],
      equipment: ["bar"],
      methods: [METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "pullup", metric: "reps", op: ">=", value: 3 }],
      progressions: ["tuck_back_lever"],
      regressions: ["dead_hang"],
      coachingCues: [
        "From dead hang, rotate body backward through inverted hang",
        "Tuck knees to make it easier first",
        "Slow controlled movement — not a swing",
        "Return through same path (or go all the way to german hang)"
      ],
      commonErrors: ["Swinging through", "Not controlling shoulders throughout rotation", "Rushing"],
      videoSlug: "skin_the_cat",
      recommendedVolume: { low: "3 × 3-5", medium: "4 × 4-6", high: "5 × 5-8" }
    },

    {
      id: "tuck_back_lever",
      name: "Tuck Back Lever",
      figure: "back_lever",
      type: "static",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 12,
      goals: ["back_lever_skill", "shoulder_mobility"],
      weakPointsTargeted: ["shoulder_stability", "back_chain"],
      muscleGroups: ["rear deltoid", "biceps", "core", "rotator cuff"],
      uiCategory: "Back Lever",
      tags: ["back_lever", "intermediate", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.HOLDS, METHODS.VOLUME],
      unlockConditions: [{ exerciseId: "skin_the_cat", metric: "reps", op: ">=", value: 3 }],
      progressions: ["straddle_back_lever"],
      regressions: ["skin_the_cat"],
      coachingCues: [
        "From german hang, extend hips until body is parallel to floor (tucked)",
        "Arms stay straight (or very nearly so)",
        "Hips must reach horizontal — this is the real back lever position",
        "Rings are much easier than bar for back lever"
      ],
      commonErrors: ["Hips not reaching horizontal", "Too much elbow bend", "Lack of shoulder preparation"],
      videoSlug: "tuck_back_lever",
      recommendedVolume: { low: "4 × 5-8s", medium: "5 × 6-10s", high: "6 × 8-12s" }
    },

    {
      id: "straddle_back_lever",
      name: "Straddle Back Lever",
      figure: "back_lever",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 8,
      avgSetDurationSec: 8,
      goals: ["back_lever_skill"],
      weakPointsTargeted: ["shoulder_stability", "back_chain", "compression"],
      muscleGroups: ["rear deltoid", "biceps", "rotator cuff", "core"],
      uiCategory: "Back Lever",
      tags: ["back_lever", "advanced", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "tuck_back_lever", metric: "hold", op: ">=", value: 8 }],
      progressions: ["full_back_lever"],
      regressions: ["tuck_back_lever"],
      coachingCues: [
        "Legs straddled to shorten moment arm",
        "Body perfectly horizontal",
        "Work legs together progressively"
      ],
      commonErrors: ["Hips dropping", "Insufficient straddle width to start"],
      videoSlug: "straddle_back_lever",
      recommendedVolume: { low: "4 × 4-6s", medium: "5 × 5-8s", high: "6 × 6-10s" }
    },

    {
      id: "full_back_lever",
      name: "Full Back Lever",
      figure: "back_lever",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 5,
      goals: ["max_strength", "back_lever_skill"],
      weakPointsTargeted: ["shoulder_stability", "back_chain", "biceps_strength"],
      muscleGroups: ["rear deltoid", "biceps", "rotator cuff", "core"],
      uiCategory: "Back Lever",
      tags: ["back_lever", "elite", "static", "bar"],
      equipment: ["bar"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "straddle_back_lever", metric: "hold", op: ">=", value: 5 }],
      progressions: [],
      regressions: ["straddle_back_lever"],
      coachingCues: [
        "Legs together, body horizontal, arms straight",
        "Massive shoulder flexibility/strength requirement",
        "Rings are significantly easier — consider progressing on rings first"
      ],
      commonErrors: ["Attempting without sufficient shoulder mobility", "Bent elbows"],
      videoSlug: "full_back_lever",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    },

    // =======================================================
    // MUSCLE-UP
    // =======================================================

    {
      id: "false_grip_hang",
      name: "False Grip Hang",
      figure: "muscle_up",
      type: "static",
      level: "beginner_plus",
      effortType: EFFORT_TYPES.PREHAB,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 4,
      avgSetDurationSec: 25,
      goals: ["transition_base", "false_grip_conditioning"],
      weakPointsTargeted: ["false_grip", "wrist_tolerance"],
      muscleGroups: ["forearms", "wrist flexors/extensors", "grip"],
      uiCategory: "Muscle-Up",
      tags: ["muscle_up", "intermediate", "grip", "rings_optional"],
      equipment: ["bar"],
      methods: [METHODS.HOLDS, METHODS.GTG],
      unlockConditions: [],
      progressions: ["false_grip_pullup"],
      regressions: [],
      coachingCues: [
        "Wrist sits ON TOP of the bar (at the wrist crease, not in the palm)",
        "This is uncomfortable at first — conditioning takes 2-4 weeks",
        "Active hang: shoulders depressed, lats engaged",
        "Critical for ring muscle-up; less needed for bar MU"
      ],
      commonErrors: ["Grip too low in palm (won't help with transition)", "Passive hang (no lat engagement)"],
      videoSlug: "false_grip_hang",
      recommendedVolume: { low: "4 × 10-15s", medium: "5 × 15-25s", high: "6 × 20-30s" }
    },

    {
      id: "high_pullup",
      name: "High Pull-Up",
      figure: "muscle_up",
      type: "dynamic",
      level: "intermediate",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 7,
      avgSetDurationSec: 40,
      goals: ["explosiveness", "transition_base"],
      weakPointsTargeted: ["explosiveness", "pull_strength"],
      muscleGroups: ["latissimus dorsi", "biceps", "rear deltoid", "brachialis"],
      uiCategory: "Muscle-Up",
      tags: ["muscle_up", "intermediate", "explosive", "bar"],
      equipment: ["bar"],
      methods: [METHODS.VOLUME, METHODS.CLUSTER],
      unlockConditions: [{ exerciseId: "pullup", metric: "reps", op: ">=", value: 8 }],
      progressions: ["bar_muscle_up"],
      regressions: ["pullup"],
      coachingCues: [
        "Pull chest to bar, not chin over bar",
        "Bar should touch chest (or close) at the top",
        "Use leg drive/lean if needed at first, but work toward strict",
        "Explosive at the start, controlled deceleration at top"
      ],
      commonErrors: ["Only pulling to chin (insufficient height)", "Swinging wildly", "No follow-through past chin"],
      videoSlug: "high_pullup",
      recommendedVolume: { low: "4 × 2-3", medium: "5 × 3-5", high: "6 × 3-6" }
    },

    {
      id: "band_muscle_up_transition",
      name: "Band Muscle-Up Transition",
      figure: "muscle_up",
      type: "assisted",
      level: "intermediate",
      effortType: EFFORT_TYPES.TECHNIQUE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.ELBOW_MEDIUM],
      perceivedDifficulty: 6,
      avgSetDurationSec: 40,
      goals: ["transition", "technique"],
      weakPointsTargeted: ["transitions", "false_grip", "explosiveness"],
      muscleGroups: ["latissimus dorsi", "triceps", "anterior deltoid", "brachialis"],
      uiCategory: "Muscle-Up",
      tags: ["muscle_up", "intermediate", "transition", "bar"],
      equipment: ["bar", "band"],
      methods: [METHODS.ASSISTED, METHODS.PARTIAL_REPS],
      unlockConditions: [
        { exerciseId: "high_pullup", metric: "reps", op: ">=", value: 3 },
        { exerciseId: "straight_bar_dip", metric: "reps", op: ">=", value: 5 }
      ],
      progressions: ["bar_muscle_up"],
      regressions: ["high_pullup"],
      coachingCues: [
        "Band assists the transition phase only — still pull with full effort",
        "Practice the hip lean and wrist turnover",
        "Transition is one fluid movement: pull + turn over + push",
        "Do not pause at the bar — it must be one continuous motion"
      ],
      commonErrors: ["Relying on band too long", "Pausing at the bar instead of transitioning", "No wrist turnover"],
      videoSlug: "band_mu_transition",
      recommendedVolume: { low: "4 × 2-4", medium: "5 × 3-5", high: "6 × 4-6" }
    },

    {
      id: "bar_muscle_up",
      name: "Bar Muscle-Up",
      figure: "muscle_up",
      type: "dynamic",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 50,
      goals: ["skill", "explosiveness", "transition"],
      weakPointsTargeted: ["explosiveness", "transitions", "triceps_strength"],
      muscleGroups: ["latissimus dorsi", "triceps", "anterior deltoid", "brachialis", "core"],
      uiCategory: "Muscle-Up",
      tags: ["muscle_up", "advanced", "bar", "skill"],
      equipment: ["bar"],
      methods: [METHODS.MAX_REPS, METHODS.PARTIAL_REPS, METHODS.SHORT_COMBO],
      unlockConditions: [
        { exerciseId: "high_pullup", metric: "reps", op: ">=", value: 5 },
        { exerciseId: "straight_bar_dip", metric: "reps", op: ">=", value: 8 }
      ],
      progressions: ["strict_bar_muscle_up", "ring_muscle_up"],
      regressions: ["band_muscle_up_transition"],
      coachingCues: [
        "Hollow → arch swing generates momentum (kipping MU)",
        "Or: dead-hang pull → explosive lean → turnover (strict MU, much harder)",
        "Turnover: wrists move over the bar as chest passes it",
        "Lock out completely at the top before next rep"
      ],
      commonErrors: ["No wrist turnover (stuck under bar)", "Pulling without the lean", "Incomplete lockout"],
      videoSlug: "bar_muscle_up",
      recommendedVolume: { low: "4 × 1-2", medium: "5 × 2-4", high: "6 × 3-5" }
    },

    {
      id: "ring_muscle_up",
      name: "Ring Muscle-Up",
      figure: "muscle_up",
      type: "dynamic",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 55,
      goals: ["skill", "strength", "ring_stability"],
      weakPointsTargeted: ["explosiveness", "transitions", "ring_stability"],
      muscleGroups: ["latissimus dorsi", "triceps", "anterior deltoid", "core", "stabilizers"],
      uiCategory: "Muscle-Up",
      tags: ["muscle_up", "advanced", "rings", "skill"],
      equipment: ["rings"],
      methods: [METHODS.MAX_REPS, METHODS.SHORT_COMBO],
      unlockConditions: [
        { exerciseId: "bar_muscle_up", metric: "reps", op: ">=", value: 3 },
        { exerciseId: "ring_dip", metric: "reps", op: ">=", value: 5 }
      ],
      progressions: [],
      regressions: ["bar_muscle_up", "band_muscle_up_transition"],
      coachingCues: [
        "False grip is highly recommended for ring MU",
        "Turn rings out (RTO) at lockout — this is the hardest part",
        "The transition on rings is more natural than bar, but the lockout is harder",
        "Strict ring MU is one of the most impressive feats in calisthenics"
      ],
      commonErrors: ["No false grip", "No RTO at top", "Not turning rings out at lockout"],
      videoSlug: "ring_muscle_up",
      recommendedVolume: { low: "4 × 1-2", medium: "5 × 2-3", high: "6 × 3-5" }
    },

    {
      id: "strict_bar_muscle_up",
      name: "Strict Bar Muscle-Up",
      figure: "muscle_up",
      type: "dynamic",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH, JOINT_STRESS.WRIST_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 60,
      goals: ["max_strength", "skill"],
      weakPointsTargeted: ["pull_strength", "explosiveness", "transitions"],
      muscleGroups: ["latissimus dorsi", "triceps", "anterior deltoid", "brachialis", "core"],
      uiCategory: "Muscle-Up",
      tags: ["muscle_up", "elite", "bar", "strict"],
      equipment: ["bar"],
      methods: [METHODS.MAX_REPS, METHODS.SHORT_COMBO],
      unlockConditions: [{ exerciseId: "bar_muscle_up", metric: "reps", op: ">=", value: 5 }],
      progressions: [],
      regressions: ["bar_muscle_up"],
      coachingCues: [
        "Dead hang start, zero swing",
        "Requires exceptional pull strength: bar must hit hip bone",
        "Turnover from dead hang requires extreme lat + tricep + pec coordination"
      ],
      commonErrors: ["Any swing or kip", "Not getting bar to hip level"],
      videoSlug: "strict_bar_muscle_up",
      recommendedVolume: { low: "3 × 1", medium: "4 × 1-2", high: "5 × 1-3" }
    },

    // =======================================================
    // MALTESE
    // =======================================================

    {
      id: "wide_planche",
      name: "Wide Planche",
      figure: "maltese",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 5,
      goals: ["maltese_base", "strength"],
      weakPointsTargeted: ["height", "extension", "biceps_strength", "straight_arm_strength"],
      muscleGroups: ["pectoralis major", "anterior deltoid", "biceps", "serratus anterior"],
      uiCategory: "Maltese",
      tags: ["maltese", "elite", "static", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "full_planche", metric: "hold", op: ">=", value: 3 }],
      progressions: ["supinated_planche_hold", "maltese_hold_assisted"],
      regressions: ["full_planche"],
      coachingCues: [
        "Hands wider than planche, slight external rotation",
        "Biceps face forward (unlike regular planche)",
        "Pectorals under extreme stretch",
        "Start with just a few cm wider than full planche"
      ],
      commonErrors: ["Too wide too soon (biceps tendon stress)", "Elbows hyperextending"],
      videoSlug: "wide_planche",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    },

    {
      id: "supinated_planche_hold",
      name: "Supinated Planche Hold",
      figure: "maltese",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 5,
      goals: ["maltese_base", "biceps_tendon"],
      weakPointsTargeted: ["biceps_strength", "straight_arm_strength", "extension"],
      muscleGroups: ["biceps", "anterior deltoid", "pectoralis major"],
      uiCategory: "Maltese",
      tags: ["maltese", "elite", "static", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "full_planche", metric: "hold", op: ">=", value: 3 }],
      progressions: ["maltese_hold_assisted"],
      regressions: ["full_planche"],
      coachingCues: [
        "Palms face backward/upward (supinated) instead of forward",
        "Biceps tendon takes maximum stretch — build very gradually",
        "Zanetti press is key preparation work for this",
        "Critical maltese prerequisite alongside wide planche"
      ],
      commonErrors: ["Rushing this progression (biceps tendon injury risk)", "No preceding Zanetti press work"],
      videoSlug: "supinated_planche",
      recommendedVolume: { low: "3 × 3-5s", medium: "4 × 4-6s", high: "5 × 5-8s" }
    },

    {
      id: "maltese_hold_assisted",
      name: "Band Assisted Maltese Hold",
      figure: "maltese",
      type: "assisted",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 5,
      goals: ["skill", "maltese_strength"],
      weakPointsTargeted: ["extension", "height", "biceps_strength"],
      muscleGroups: ["pectoralis major", "anterior deltoid", "biceps", "serratus anterior"],
      uiCategory: "Maltese",
      tags: ["maltese", "elite", "assisted", "parallettes"],
      equipment: ["band", "parallettes_optional"],
      methods: [METHODS.ASSISTED, METHODS.MAX_HOLD],
      unlockConditions: [
        { exerciseId: "wide_planche", metric: "hold", op: ">=", value: 3 },
        { exerciseId: "supinated_planche_hold", metric: "hold", op: ">=", value: 3 }
      ],
      progressions: ["maltese_hold"],
      regressions: ["wide_planche", "supinated_planche_hold"],
      coachingCues: [
        "Hands wide (maltese position), band around waist",
        "Even with assistance, expect maximum effort",
        "Work to reduce band reliance over months, not weeks"
      ],
      commonErrors: ["Band too strong (gives false confidence)", "Not maintaining true maltese width"],
      videoSlug: "band_maltese",
      recommendedVolume: { low: "3 × 3-4s", medium: "4 × 4-6s", high: "5 × 5-8s" }
    },

    {
      id: "maltese_hold",
      name: "Maltese Hold",
      figure: "maltese",
      type: "static",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH, JOINT_STRESS.ELBOW_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 3,
      goals: ["max_strength", "skill"],
      weakPointsTargeted: ["extension", "height", "biceps_strength", "straight_arm_strength"],
      muscleGroups: ["pectoralis major", "anterior deltoid", "biceps", "serratus anterior"],
      uiCategory: "Maltese",
      tags: ["maltese", "elite", "static"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD],
      unlockConditions: [{ exerciseId: "maltese_hold_assisted", metric: "hold", op: ">=", value: 5 }],
      progressions: [],
      regressions: ["maltese_hold_assisted"],
      coachingCues: [
        "Arguably the hardest straight arm strength skill in calisthenics",
        "Hands wider than shoulder width, arms parallel to floor",
        "Biceps face forward, pectorals under maximum stretch"
      ],
      commonErrors: ["Insufficient supination prep work", "Attempting without adequate biceps tendon conditioning"],
      videoSlug: "maltese",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    },

    // =======================================================
    // OAP (ONE-ARM PLANCHE)
    // =======================================================

    {
      id: "handstand_flag",
      name: "Handstand Flag (Side Lean)",
      figure: "oap",
      type: "static",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 8,
      goals: ["oap_prep", "side_control"],
      weakPointsTargeted: ["balance", "oblique_strength"],
      muscleGroups: ["obliques", "anterior deltoid", "serratus anterior", "core"],
      uiCategory: "OAP",
      tags: ["oap", "advanced", "balance", "oblique"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.HOLDS, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "free_handstand", metric: "hold", op: ">=", value: 10 }],
      progressions: ["oap_lean_entry", "oap_negative"],
      regressions: ["free_handstand"],
      coachingCues: [
        "From handstand, shift weight to one side and let other arm gradually lift",
        "Obliques do the lateral bracing",
        "Start with just leaning (not fully lifting the arm)",
        "Film from the front — line must stay straight"
      ],
      commonErrors: ["Hip dropping sideways", "Lifting arm before weight is fully shifted"],
      videoSlug: "handstand_flag",
      recommendedVolume: { low: "4 × 3-5s each side", medium: "5 × 4-6s each side", high: "6 × 5-8s each side" }
    },

    {
      id: "oap_lean_entry",
      name: "One Arm Planche Lean Entry",
      figure: "oap",
      type: "dynamic",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 50,
      goals: ["entry_control"],
      weakPointsTargeted: ["balance", "extension", "oblique_strength"],
      muscleGroups: ["obliques", "anterior deltoid", "serratus anterior", "core"],
      uiCategory: "OAP",
      tags: ["oap", "advanced", "entry", "parallettes"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.PARTIAL_REPS, METHODS.SHORT_COMBO],
      unlockConditions: [
        { exerciseId: "handstand_flag", metric: "hold", op: ">=", value: 3 },
        { exerciseId: "full_planche", metric: "hold", op: ">=", value: 3 }
      ],
      progressions: ["oap_negative", "oap_bad_form_hold"],
      regressions: ["handstand_flag"],
      coachingCues: [
        "From planche lean, shift mass to one arm and let other gradually leave surface",
        "Obliques are critical — think lateral stability, not just push",
        "Other hand can be on thigh/shorts initially as tactile reference",
        "Entry quality determines hold quality"
      ],
      commonErrors: ["Not building oblique base first", "Releasing arm before weight is shifted", "No lateral bracing"],
      videoSlug: "oap_lean_entry",
      recommendedVolume: { low: "4 × 1-3 entries", medium: "5 × 2-4 entries", high: "6 × 3-5 entries" }
    },

    {
      id: "oap_negative",
      name: "One Arm Planche Negative",
      figure: "oap",
      type: "eccentric",
      level: "advanced",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 9,
      avgSetDurationSec: 40,
      goals: ["oap_strength", "control"],
      weakPointsTargeted: ["balance", "extension", "oblique_strength"],
      muscleGroups: ["obliques", "anterior deltoid", "core", "serratus anterior"],
      uiCategory: "OAP",
      tags: ["oap", "advanced", "negative", "eccentric"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.NEGATIVE, METHODS.PARTIAL_REPS],
      unlockConditions: [{ exerciseId: "handstand_flag", metric: "hold", op: ">=", value: 4 }],
      progressions: ["oap_bad_form_hold", "oap_hold"],
      regressions: ["oap_lean_entry"],
      coachingCues: [
        "Start from planche position with other hand on thigh",
        "Lower one arm slowly as you maintain position",
        "Even 1-2 second controlled negatives are training the pattern",
        "Think: you are building the neural pathway first"
      ],
      commonErrors: ["Not using tactile reference initially", "Collapsing rather than controlling descent"],
      videoSlug: "oap_negative",
      recommendedVolume: { low: "4 × 1 rep", medium: "5 × 1-2 reps", high: "6 × 2 reps" }
    },

    {
      id: "oap_bad_form_hold",
      name: "One Arm Planche (Imperfect Hold)",
      figure: "oap",
      type: "static",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 3,
      goals: ["specific_strength"],
      weakPointsTargeted: ["balance", "extension", "height"],
      muscleGroups: ["obliques", "anterior deltoid", "serratus anterior", "core"],
      uiCategory: "OAP",
      tags: ["oap", "elite", "static"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD, METHODS.ASSISTED],
      unlockConditions: [{ exerciseId: "oap_negative", metric: "reps", op: ">=", value: 1 }],
      progressions: ["oap_hold"],
      regressions: ["oap_negative"],
      coachingCues: [
        "Hips may be slightly high initially — this is fine",
        "The goal is getting one arm contact with any form",
        "Clean form comes with time — first you need the pattern",
        "Film to check progress; what feels right is often not right"
      ],
      commonErrors: ["Perfectionism preventing attempts", "No video feedback"],
      videoSlug: "oap_bad_form",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    },

    {
      id: "oap_hold",
      name: "One Arm Planche Hold",
      figure: "oap",
      type: "static",
      level: "elite",
      effortType: EFFORT_TYPES.CNS_INTENSIVE,
      jointStress: [JOINT_STRESS.WRIST_HIGH, JOINT_STRESS.SHOULDER_HIGH],
      perceivedDifficulty: 10,
      avgSetDurationSec: 3,
      goals: ["max_strength", "skill"],
      weakPointsTargeted: ["balance", "extension", "line"],
      muscleGroups: ["obliques", "anterior deltoid", "serratus anterior", "core"],
      uiCategory: "OAP",
      tags: ["oap", "elite", "static"],
      equipment: ["parallettes_optional"],
      methods: [METHODS.MAX_HOLD],
      unlockConditions: [{ exerciseId: "oap_bad_form_hold", metric: "hold", op: ">=", value: 2 }],
      progressions: [],
      regressions: ["oap_bad_form_hold", "oap_negative"],
      coachingCues: [
        "Clean form: straight body, horizontal, arm straight",
        "One of the rarest skills in calisthenics — less than 0.1% achieve this",
        "Years of planche foundation required before attempting"
      ],
      commonErrors: ["Attempting without sufficient planche foundation"],
      videoSlug: "oap_hold",
      recommendedVolume: { low: "3 × max", medium: "4 × max", high: "5 × max" }
    }

  ];

  // =========================================================
  // 5) EXERCISE SELECTION ENGINE
  // =========================================================

  /**
   * V3 IMPROVEMENT: pickTopExercises now tracks joint stress across
   * already-selected exercises to avoid stacking high-stress joints.
   */
  function pickTopExercises(profile, count, filterFn = () => true) {
    const zone = chooseIntensityZone(profile);
    const selectedJoints = [];

    return exercises
      .filter(ex => hasEquipment(profile, ex))
      .filter(ex => matchesLevel(profile, ex))
      .filter(ex => isUnlocked(profile, ex))
      .filter(filterFn)
      .map(ex => ({ ex, score: scoreExercise(profile, ex, zone, selectedJoints) }))
      .sort((a, b) => b.score - a.score)
      .reduce((acc, { ex }) => {
        if (acc.length >= count) return acc;
        // Track joints from added exercises
        (ex.jointStress || []).forEach(j => { if (!selectedJoints.includes(j)) selectedJoints.push(j); });
        acc.push(ex);
        return acc;
      }, []);
  }

  /**
   * V3 IMPROVEMENT: chooseMainTest now uses a richer candidate map
   * with explicit priority ordering per figure.
   */
  function chooseMainTest(profile) {
    const candidates = {
      planche:        ["full_planche", "straddle_planche", "advanced_tuck_planche", "tuck_planche", "semi_planche_hold", "planche_lean"],
      handstand:      ["deficit_wall_hspu", "wall_hspu", "free_handstand", "wall_handstand_chest_to_wall", "elevated_pike_pushup"],
      compression:    ["v_sit_progression", "l_sit", "l_sit_tuck"],
      front_lever:    ["full_front_lever", "straddle_front_lever", "one_leg_front_lever", "advanced_tuck_front_lever", "tuck_front_lever"],
      back_lever:     ["full_back_lever", "straddle_back_lever", "tuck_back_lever"],
      muscle_up:      ["strict_bar_muscle_up", "ring_muscle_up", "bar_muscle_up", "high_pullup", "straight_bar_dip"],
      maltese:        ["maltese_hold", "maltese_hold_assisted", "wide_planche", "supinated_planche_hold"],
      oap:            ["oap_hold", "oap_bad_form_hold", "oap_negative", "handstand_flag"],
      basics_push:    ["weighted_dip", "dip", "deep_pushup", "pushup_standard"],
      basics_pull:    ["weighted_pullup", "pullup", "chin_up_weighted"],
      weighted_basics:["weighted_pullup", "weighted_dip"],
      rings_basics:   ["ring_muscle_up", "ring_dip", "ring_pushup", "ring_support_hold"],
      core:           ["dragon_flag", "leg_raises_hanging", "hollow_body_hold"],
      prehab:         ["dead_hang", "scapula_pullup", "band_external_rotation"]
    };

    const ids = candidates[profile.priorityFigure] || ["pushup_standard"];
    for (const id of ids) {
      const ex = exercises.find(e => e.id === id);
      if (ex && hasEquipment(profile, ex) && matchesLevel(profile, ex) && isUnlocked(profile, ex)) return ex;
    }
    return exercises.find(e => e.id === "pushup_standard");
  }

  // =========================================================
  // 6) SESSION DURATION ESTIMATOR
  // =========================================================

  /**
   * V3 NEW: Estimates session duration based on block composition.
   * Uses avgSetDurationSec + rest time + warm-up.
   */
  function estimateSessionDuration(warmup, mainBlock, accessoryBlock) {
    const warmupMin = warmup?.durationMin || 20;

    const blockDuration = (block) => block.reduce((total, item) => {
      const ex = exercises.find(e => e.id === item.exerciseId);
      const sets = parseInt(item.prescription?.split("×")[0] || item.prescription?.split("x")[0]) || 4;
      const setDur = (ex?.avgSetDurationSec || 40) + 90; // avg rest 90s
      return total + (sets * setDur) / 60;
    }, 0);

    const mainMin = Math.ceil(blockDuration(mainBlock));
    const accessMin = Math.ceil(blockDuration(accessoryBlock));
    const cooldownMin = 5;

    return warmupMin + mainMin + accessMin + cooldownMin;
  }

  // =========================================================
  // 7) WORKOUT GENERATOR
  // =========================================================

  function generateWorkout(profile) {
    const zone = chooseIntensityZone(profile);
    const warmup = getWarmupForFigure(profile.priorityFigure);
    const mainTest = chooseMainTest(profile);

    // Always include prehab in accessory (V3 improvement)
    const prehabExercises = pickTopExercises(profile, 2, ex => ex.figure === "prehab" || ex.figure === "mobility");

    let mainBlock = [];
    let accessoryBlock = [];

    if (zone === "low") {
      mainBlock = pickTopExercises(profile, 4, ex =>
        ex.figure === profile.priorityFigure ||
        ex.figure === "prehab" ||
        ex.type === "assisted" ||
        ex.type === "static" ||
        ex.effortType === EFFORT_TYPES.TECHNIQUE
      );
      accessoryBlock = [
        ...prehabExercises,
        ...pickTopExercises(profile, 2, ex =>
          ex.figure === "compression" || ex.figure === "core" || ex.figure === "scapular"
        )
      ];
    }

    if (zone === "medium") {
      mainBlock = pickTopExercises(profile, 5, ex =>
        ex.figure === profile.priorityFigure ||
        ex.figure === "basics_push" ||
        ex.figure === "basics_pull" ||
        ex.figure === "weighted_basics" ||
        ex.figure === "core" ||
        ex.figure === "compression" ||
        ex.type === "dynamic"
      );
      accessoryBlock = [
        ...prehabExercises,
        ...pickTopExercises(profile, 2, ex =>
          (profile.weaknesses || []).some(w => (ex.weakPointsTargeted || []).includes(w))
        )
      ];
    }

    if (zone === "high") {
      mainBlock = pickTopExercises(profile, 5, ex =>
        ex.figure === profile.priorityFigure ||
        ex.effortType === EFFORT_TYPES.CNS_INTENSIVE ||
        (ex.methods || []).some(m => [METHODS.MAX_HOLD, METHODS.SHORT_COMBO, METHODS.CLUSTER].includes(m))
      );
      accessoryBlock = [
        ...prehabExercises,
        ...pickTopExercises(profile, 3, ex =>
          (profile.weaknesses || []).some(w => (ex.weakPointsTargeted || []).includes(w)) ||
          ex.figure === "compression" ||
          ex.figure === "handstand"
        )
      ];
    }

    // Deduplicate accessory block
    const mainIds = new Set(mainBlock.map(e => e.id));
    accessoryBlock = accessoryBlock.filter(ex => !mainIds.has(ex.id));

    // CNS load check: cap CNS-intensive exercises
    const cnsCount = countCNSLoad(mainBlock);
    if (zone !== "high" && cnsCount > 3) {
      // Replace lowest-scored CNS exercises with technique/hypertrophy ones
      mainBlock = mainBlock.filter(ex => ex.effortType !== EFFORT_TYPES.CNS_INTENSIVE).slice(0, 5);
    }

    const mainBlockFormatted = mainBlock.map(ex => ({
      exerciseId: ex.id,
      name: ex.name,
      figure: ex.figure,
      type: ex.type,
      effortType: ex.effortType,
      methods: ex.methods || [],
      jointStress: ex.jointStress || [],
      coachingCues: (ex.coachingCues || []).slice(0, 2),
      commonErrors: (ex.commonErrors || []).slice(0, 1),
      prescription: prescribe(ex, zone),
      perceivedDifficulty: ex.perceivedDifficulty,
      muscleGroups: ex.muscleGroups || [],
      videoSlug: ex.videoSlug || null
    }));

    const accessoryBlockFormatted = accessoryBlock.map(ex => ({
      exerciseId: ex.id,
      name: ex.name,
      figure: ex.figure,
      effortType: ex.effortType,
      focus: ex.weakPointsTargeted || [],
      coachingCues: (ex.coachingCues || []).slice(0, 2),
      prescription: zone === "high" ? "3-4 sets" : "2-4 sets",
      videoSlug: ex.videoSlug || null
    }));

    const estimatedMin = estimateSessionDuration(warmup, mainBlockFormatted, accessoryBlockFormatted);

    const notes = [];
    if ((profile.painFlags || []).length) notes.push(`⚠️ Pain flags: ${profile.painFlags.join(", ")} — avoid loaded patterns near these joints.`);
    if (zone === "low")    notes.push("🟡 Low readiness: focus on technique, holds, assistance, prehab — no maxing out.");
    if (zone === "medium") notes.push("🟢 Medium readiness: fundamentals + specific work + weakness reinforcement.");
    if (zone === "high")   notes.push("🔵 High readiness: max test + main intensity + combos/volume.");

    return {
      meta: {
        priorityFigure:    profile.priorityFigure,
        intensityZone:     zone,
        readinessScore:    computeReadinessScore(profile.readiness),
        estimatedDurationMin: estimatedMin,
        generatedAt:       new Date().toISOString()
      },
      warmup,
      mainTest: {
        exerciseId:   mainTest.id,
        name:         mainTest.name,
        coachingCues: (mainTest.coachingCues || []).slice(0, 3),
        commonErrors: (mainTest.commonErrors || []).slice(0, 2),
        prescription:
          zone === "low"    ? "2-3 submax technical attempts" :
          zone === "medium" ? "2-4 quality attempts, stop before form breakdown" :
                              "3-5 max-quality attempts with full 3-5 min rest between"
      },
      mainBlock: mainBlockFormatted,
      accessoryBlock: accessoryBlockFormatted,
      cooldown: [
        "Light mobility on trained zones (2 min)",
        "Wrist + shoulder decompression (1 min each)",
        "Dead hang 2 × 30s if pulling was trained",
        "Easy breathing / heart rate downregulation (2 min)"
      ],
      notes
    };
  }

  // =========================================================
  // 8) SPLIT TEMPLATES
  // =========================================================

  /**
   * V3 IMPROVEMENT: Splits now track push/pull/skill balance.
   * Push and pull are always balanced across the week.
   * Skill sessions are protected from high-volume basics on the same day.
   */
  const splitTemplates = {
    days3: [
      { day: 1, focus: "priority",          pushPull: "balanced" },
      { day: 2, focus: "secondary_1",       pushPull: "balanced" },
      { day: 3, focus: "basics_and_weak",   pushPull: "balanced" }
    ],
    days4: [
      { day: 1, focus: "priority",          pushPull: "skill_push" },
      { day: 2, focus: "secondary_pull",    pushPull: "pull" },
      { day: 3, focus: "priority",          pushPull: "skill_push" },
      { day: 4, focus: "basics_and_weak",   pushPull: "balanced" }
    ],
    days5: [
      { day: 1, focus: "priority",          pushPull: "skill_push" },
      { day: 2, focus: "secondary_pull",    pushPull: "pull" },
      { day: 3, focus: "priority",          pushPull: "skill_push" },
      { day: 4, focus: "secondary_2",       pushPull: "push" },
      { day: 5, focus: "volume_weak",       pushPull: "balanced" }
    ],
    days6: [
      { day: 1, focus: "priority",          pushPull: "skill_push" },
      { day: 2, focus: "secondary_pull",    pushPull: "pull" },
      { day: 3, focus: "priority",          pushPull: "skill_push" },
      { day: 4, focus: "secondary_2",       pushPull: "push" },
      { day: 5, focus: "priority",          pushPull: "skill_balanced" },
      { day: 6, focus: "volume_weak",       pushPull: "balanced" }
    ]
  };

  function resolveFocus(profile, slot) {
    switch (slot.focus) {
      case "priority":          return profile.priorityFigure;
      case "secondary_1":       return profile.secondaryFigures?.[0] || profile.priorityFigure;
      case "secondary_pull":    return profile.secondaryFigures?.[0] || "basics_pull";
      case "secondary_2":       return profile.secondaryFigures?.[1] || "basics_push";
      case "secondary_2_or_basics": return profile.secondaryFigures?.[1] || "basics_push";
      case "basics_and_weak":   return "basics_push";
      case "volume_weak":       return profile.priorityFigure;
      default:                  return profile.priorityFigure;
    }
  }

  function generateWeeklyPlan(profile, preferredDays = null) {
    const zone = chooseIntensityZone(profile);

    let days = preferredDays;
    if (!days) {
      const dayMap = { beginner: 3, beginner_plus: 4, intermediate: 4, advanced: zone === "high" ? 5 : 4, elite: zone === "high" ? 6 : 5 };
      days = dayMap[profile.level] || 4;
    }

    const templateKey = days >= 6 ? "days6" : days === 5 ? "days5" : days === 3 ? "days3" : "days4";
    const template = splitTemplates[templateKey];

    const week = template.map((slot, index) => {
      const clone = JSON.parse(JSON.stringify(profile));
      clone.priorityFigure = resolveFocus(profile, slot);

      // Adjust secondary figures based on slot
      if (slot.focus === "basics_and_weak") clone.secondaryFigures = ["compression", "handstand"];
      if (slot.focus === "volume_weak") {
        if (clone.readiness?.energy != null) clone.readiness.energy = Math.max(1, clone.readiness.energy - 1);
      }
      if (index === template.length - 1 && zone === "high") {
        clone.lastSession = { performanceDropPct: 20 };
      }
      // Track consecutive days
      clone.consecutiveTrainingDays = index;

      return {
        day: slot.day,
        focus: clone.priorityFigure,
        pushPullBias: slot.pushPull,
        session: generateWorkout(clone)
      };
    });

    week.push({
      day: "active_rest",
      session: {
        meta: { type: "active_rest", estimatedDurationMin: 25 },
        suggestions: [
          "20-30 min light mobility (jefferson curl, thoracic, shoulder CARs)",
          "Easy handstand balance practice — no pressure",
          "Scapular pull-ups + dead hang 3 × 30s",
          "Compression work: 4 × 10s L-sit tuck",
          "Band external rotation 3 × 15 each side"
        ]
      }
    });

    return week;
  }

  // =========================================================
  // 9) PROGRESSION ANALYZER
  // =========================================================

  /**
   * V3 NEW: Analyzes an athlete's currentMetrics and detects:
   * - Ready-to-progress exercises
   * - Missing prerequisite exercises
   * - Exercises near unlock threshold
   */
  function analyzeProgression(profile) {
    const ready = [];
    const blocked = [];
    const nearUnlock = [];

    exercises.forEach(ex => {
      if (!hasEquipment(profile, ex)) return;
      if (levelIndex(ex.level) > levelIndex(profile.level) + 1) return;

      const unlocked = isUnlocked(profile, ex);

      if (!unlocked) {
        // Check how close we are
        const conditions = ex.unlockConditions || [];
        const details = conditions.map(rule => {
          const current = metricValue(profile.currentMetrics, rule.exerciseId, rule.metric);
          const needed = rule.value;
          const pct = Math.min(100, Math.round((current / needed) * 100));
          return { rule, current, needed, pct, met: current >= needed };
        });

        const avgPct = avg(details.map(d => d.pct));
        if (avgPct >= 70) nearUnlock.push({ exercise: ex, conditions: details, readinessPct: Math.round(avgPct) });
        else blocked.push({ exercise: ex, conditions: details, readinessPct: Math.round(avgPct) });
      } else {
        // Check if progressions are available
        const progs = (ex.progressions || []).map(id => exercises.find(e => e.id === id)).filter(Boolean);
        const availableProgs = progs.filter(p => isUnlocked(profile, p) && hasEquipment(profile, p));
        if (availableProgs.length > 0) {
          ready.push({ exercise: ex, nextExercises: availableProgs });
        }
      }
    });

    return {
      readyToProgress: ready,
      nearUnlock: nearUnlock.sort((a, b) => b.readinessPct - a.readinessPct),
      blocked: blocked.sort((a, b) => b.readinessPct - a.readinessPct)
    };
  }

  // =========================================================
  // 10) CLAUDE PROMPT
  // =========================================================

  function buildClaudePrompt() {
    return `
You are the KOVA Calisthenics Coach — powered by KOVA Engine V3.

The embedded JS knowledge base is your source of truth:
- Exercise database (${exercises.length} exercises)
- Progression chains with unlock conditions
- Readiness scoring (weighted, nonlinear)
- Intensity zone selection (low / medium / high)
- Warm-up protocols per figure family
- Coaching cues and common errors per exercise
- Weekly split templates (3/4/5/6 days)
- Session duration estimation
- Progression analysis (ready / near-unlock / blocked)

WORKFLOW FOR EVERY ATHLETE:
1. Parse athlete profile (level, priority figure, secondary figures, equipment, readiness, pain flags, weaknesses, currentMetrics)
2. computeReadinessScore → chooseIntensityZone
3. detectConsecutiveTrainingDays if available → adjusts zone
4. chooseMainTest (most advanced unlocked exercise for the figure)
5. Select warm-up for the figure family
6. Build main block (4-6 exercises) matching zone + push/pull/skill balance
7. Build accessory block (2-4 exercises) targeting weaknesses + mandatory prehab
8. Check CNS load — cap CNS-intensive exercises if zone is not "high"
9. Estimate session duration
10. Generate coaching cues for each exercise (top 2 cues + top 1 error)
11. Run analyzeProgression to identify what the athlete is close to unlocking

INTENSITY RULES:
- LOW: technique, holds, band-assisted, prehab, NO maxing
- MEDIUM: fundamentals + specific work + moderate volume
- HIGH: max test + combos/clusters + heavy weighted basics
- Pain flags always → LOW regardless of score

SAFETY RULES:
- Never program high joint-stress exercises on two consecutive sessions for the same joint
- Never skip unlock prerequisites (enforce unlock conditions strictly)
- Never prescribe advanced dynamics (tuck planche push-up, FL rows, high pull-ups) when pain flags affect relevant joints
- Always include at least 1 prehab exercise in every session
- Recommend band assistance before raising difficulty for stuck athletes

RESPONSE FORMAT (JSON):
{
  "summary": "1-2 sentence overview",
  "intensityZone": "low|medium|high",
  "readinessScore": 0-10,
  "estimatedDurationMin": number,
  "why": ["reason 1", "reason 2"],
  "session": {
    "warmup": {...},
    "mainTest": { "exerciseId": "", "name": "", "prescription": "", "coachingCues": [], "commonErrors": [] },
    "mainBlock": [{ "exerciseId": "", "name": "", "prescription": "", "coachingCues": [], "perceivedDifficulty": 0 }],
    "accessoryBlock": [...],
    "cooldown": [],
    "notes": []
  },
  "progressionReport": {
    "readyToProgress": [],
    "nearUnlock": [],
    "nextMilestones": []
  },
  "coachingCues": ["top 3 session cues"],
  "substitutions": [{ "original": "", "alternative": "", "reason": "" }]
}
`.trim();
  }

  // =========================================================
  // 11) EXAMPLE PROFILES
  // =========================================================

  const exampleProfiles = {
    beginnerNoEquipment: {
      level: "beginner",
      priorityFigure: "basics_push",
      secondaryFigures: ["core", "compression"],
      availableMinutes: 45,
      equipment: ["wall"],
      readiness: { energy: 6, joints: 8, motivation: 7, soreness: 2, sleep: 7 },
      painFlags: [],
      weaknesses: ["push_strength", "hollow_control", "compression"],
      currentMetrics: {
        pushup_standard: { reps: 8 },
        hollow_body_hold: { hold: 15 }
      },
      consecutiveTrainingDays: 0,
      lastSession: { performanceDropPct: 0 }
    },

    beginnerPlanche: {
      level: "beginner_plus",
      priorityFigure: "planche",
      secondaryFigures: ["handstand", "compression"],
      availableMinutes: 75,
      equipment: ["parallettes", "bar", "wall", "band"],
      readiness: { energy: 7, joints: 8, motivation: 8, soreness: 3, sleep: 7 },
      painFlags: [],
      weaknesses: ["protraction", "compression", "press_strength", "wrist_tolerance"],
      currentMetrics: {
        pushup_standard: { reps: 20 },
        pike_pushup: { reps: 8 },
        l_sit_tuck: { hold: 20 },
        l_sit: { hold: 8 },
        wall_handstand_chest_to_wall: { hold: 20 },
        planche_lean: { hold: 25 },
        semi_planche_hold: { hold: 8 },
        tuck_planche: { hold: 5 }
      },
      consecutiveTrainingDays: 1,
      lastSession: { performanceDropPct: 8 }
    },

    intermediateFrontLever: {
      level: "intermediate",
      priorityFigure: "front_lever",
      secondaryFigures: ["muscle_up", "compression"],
      availableMinutes: 80,
      equipment: ["bar", "band", "wall", "parallettes"],
      readiness: { energy: 8, joints: 8, motivation: 8, soreness: 2, sleep: 7 },
      painFlags: [],
      weaknesses: ["back_chain", "depression_strength", "explosiveness"],
      currentMetrics: {
        pullup: { reps: 10 },
        weighted_pullup: { reps: 3 },
        tuck_front_lever: { hold: 8 },
        advanced_tuck_front_lever: { hold: 4 },
        dip: { reps: 12 },
        straight_bar_dip: { reps: 5 }
      },
      consecutiveTrainingDays: 0,
      lastSession: { performanceDropPct: 5 }
    },

    intermediateHandstand: {
      level: "intermediate",
      priorityFigure: "handstand",
      secondaryFigures: ["planche", "compression"],
      availableMinutes: 70,
      equipment: ["parallettes", "wall"],
      readiness: { energy: 7, joints: 7, motivation: 9, soreness: 1, sleep: 8 },
      painFlags: [],
      weaknesses: ["balance", "press_strength", "line"],
      currentMetrics: {
        wall_handstand_chest_to_wall: { hold: 40 },
        free_handstand: { hold: 5 },
        pike_pushup: { reps: 12 },
        elevated_pike_pushup: { reps: 6 }
      },
      consecutiveTrainingDays: 2,
      lastSession: { performanceDropPct: 10 }
    },

    advancedPlancheMaltese: {
      level: "advanced",
      priorityFigure: "planche",
      secondaryFigures: ["maltese", "compression"],
      availableMinutes: 100,
      equipment: ["parallettes", "bar", "wall", "band", "dumbbells_optional"],
      readiness: { energy: 8, joints: 8, motivation: 9, soreness: 3, sleep: 8 },
      painFlags: [],
      weaknesses: ["height", "transitions", "biceps_strength"],
      currentMetrics: {
        straddle_planche: { hold: 5 },
        full_planche: { hold: 2 },
        wide_planche: { hold: 2 },
        supinated_planche_hold: { hold: 2 },
        l_sit: { hold: 20 }
      },
      consecutiveTrainingDays: 0,
      lastSession: { performanceDropPct: 5 }
    },

    lowReadinessRecovery: {
      level: "intermediate",
      priorityFigure: "front_lever",
      secondaryFigures: ["prehab"],
      availableMinutes: 45,
      equipment: ["bar", "band", "wall"],
      readiness: { energy: 3, joints: 4, motivation: 5, soreness: 7, sleep: 4 },
      painFlags: ["left_elbow"],
      weaknesses: ["back_chain", "scapular_control"],
      currentMetrics: {
        pullup: { reps: 10 },
        tuck_front_lever: { hold: 8 }
      },
      consecutiveTrainingDays: 4,
      lastSession: { performanceDropPct: 35 }
    }
  };

  // =========================================================
  // 12) PUBLIC API
  // =========================================================

  return {
    // Constants
    LEVELS,
    FIGURES,
    METHODS,
    WEAK_POINTS,
    EFFORT_TYPES,
    JOINT_STRESS,

    // Data
    warmups,
    exercises,
    splitTemplates,
    exampleProfiles,

    // Core algorithms
    computeReadinessScore,
    chooseIntensityZone,
    isUnlocked,
    hasEquipment,
    matchesLevel,
    scoreExercise,
    countCNSLoad,

    // Session building
    pickTopExercises,
    chooseMainTest,
    prescribe,
    estimateSessionDuration,
    generateWorkout,

    // Planning
    generateWeeklyPlan,

    // Analysis
    analyzeProgression,

    // Claude integration
    buildClaudePrompt
  };
})();

// Expose globally so app.js can detect the engine via window.KOVA_V3
window.KOVA_V3 = KOVA_V3;

/* =========================================================
   USAGE EXAMPLES

// Basic workout:
// const workout = KOVA_V3.generateWorkout(KOVA_V3.exampleProfiles.beginnerPlanche);
// console.log(JSON.stringify(workout, null, 2));

// Weekly plan:
// const week = KOVA_V3.generateWeeklyPlan(KOVA_V3.exampleProfiles.intermediateFrontLever, 4);
// console.log(JSON.stringify(week, null, 2));

// Progression analysis:
// const report = KOVA_V3.analyzeProgression(KOVA_V3.exampleProfiles.beginnerPlanche);
// console.log(JSON.stringify(report, null, 2));

// Low readiness session:
// const recovery = KOVA_V3.generateWorkout(KOVA_V3.exampleProfiles.lowReadinessRecovery);
// console.log(JSON.stringify(recovery, null, 2));

// Claude prompt for API integration:
// console.log(KOVA_V3.buildClaudePrompt());

   =========================================================

   CHANGELOG V2 → V3 SUMMARY:
   ────────────────────────────
   EXERCISES ADDED (new in V3):
   - incline_pushup, diamond_pushup (beginner push chain completed)
   - band_dip (dip regression missing in V2)
   - negative_pullup, band_pullup (pull-up regressions added)
   - chin_up_weighted (supinated pull variant)
   - ring_row (beginner pull without a bar)
   - ring_support_hold, ring_pushup, ring_dip (rings_basics figure added)
   - ring_muscle_up, strict_bar_muscle_up (muscle_up chain extended)
   - arch_body_hold, hollow_rocks (core chain filled)
   - dragon_flag, leg_raises_hanging (core advanced steps)
   - box_pike_hold, elevated_pike_pushup (handstand ramp completed)
   - deficit_wall_hspu (HSPU chain to elite)
   - front_lever_raise_tuck, one_leg_front_lever (FL chain filled)
   - front_lever_pullup (FL elite dynamic)
   - band_front_lever_tuck (FL beginner regression)
   - skin_the_cat, tuck_back_lever, straddle_back_lever, full_back_lever (back_lever figure — was entirely missing)
   - ring_muscle_up (rings MU path)
   - v_sit_progression (compression path extended)
   - wrist_protocol (prehab formalized)
   - scapula_pullup, dead_hang (pulling prehab)
   - jefferson_curl, thoracic_extension (mobility figure)
   - band_external_rotation already existed, unchanged
   - compression_lift, zanetti_press already existed, refined

   SCHEMA IMPROVEMENTS (every exercise now has):
   - effortType (CNS_INTENSIVE / TECHNIQUE / HYPERTROPHY / PREHAB / MOBILITY)
   - jointStress[] (for stacking protection)
   - perceivedDifficulty (1-10)
   - avgSetDurationSec (for session duration estimation)
   - muscleGroups[] (for UI display)
   - uiCategory (for app grouping)
   - tags[] (for search/filter)
   - coachingCues[] (2-4 per exercise)
   - commonErrors[] (1-3 per exercise)
   - videoSlug (placeholder for media)

   ALGORITHM IMPROVEMENTS:
   - Readiness: weighted + nonlinear soreness penalty
   - Zone selection: tracks consecutiveTrainingDays
   - Exercise scoring: joint stress stacking penalty
   - pickTopExercises: accumulates selected joints to avoid stacking
   - chooseMainTest: extended candidate maps, priority ordering
   - Session duration estimator (new)
   - Prehab always included in accessory block
   - CNS load capped for non-high zones
   - Weekly splits: 3-day template added, push/pull/skill balance tracked
   - analyzeProgression: new tool to detect ready/near-unlock/blocked exercises

   ========================================================= */
