"use strict";
const e = React.createElement;
const { useState, useEffect, useRef, useCallback } = React;

// ─── THEME VIOLET PREMIUM ────────────────────────────────────────────────────
const T = {
  bg:"#07060E", surface:"#0E0D18", elevated:"#141322", card:"#1A1830",
  border:"#252345", borderSub:"#1C1A35",
  // Violet premium
  accent:"#8B5CF6", accentLight:"#A78BFA", accentDim:"rgba(139,92,246,0.06)",
  accentGlow:"rgba(139,92,246,0.14)", accentBorder:"rgba(139,92,246,0.28)",
  accentStrong:"#7C3AED", accentDeep:"#6D28D9",
  // Secondary lime for validation/success
  lime:"#C8F135", limeDim:"rgba(200,241,53,0.06)", limeGlow:"rgba(200,241,53,0.12)",
  // Gold for Pro
  gold:"#D4A843", goldDim:"#8A6A20", goldGlow:"rgba(212,168,67,0.1)",
  // Text
  text:"#F0EEF8", textSec:"#8B89A6", textTert:"#4B4870",
  // Semantic
  red:"#FF453A", warn:"#FF9F0A",
  // Categories
  push:"#FF6B35", pushDim:"rgba(255,107,53,0.08)",
  pull:"#32D4C0", pullDim:"rgba(50,212,192,0.08)",
  legs:"#BF5AF2", legsDim:"rgba(191,90,242,0.08)",
};
function cc(cat){
  return({Push:T.push,Pull:T.pull,Core:T.accent,Legs:T.legs,Skills:T.gold})[cat]||T.accent;
}
function ccDim(cat){
  return({Push:T.pushDim,Pull:T.pullDim,Core:T.accentDim,Legs:T.legsDim,Skills:T.goldGlow})[cat]||T.accentDim;
}
function catLabel(cat){
  return({Push:"POUSSÉE",Pull:"TIRAGE",Core:"GAINAGE",Skills:"FIGURES",Legs:"JAMBES"})[cat]||cat;
}

// ─── PERSISTENCE ─────────────────────────────────────────────────────────────
const KEY = "kova_v5";
function persist(data){
  const json = JSON.stringify(data);
  try { localStorage.setItem(KEY, json); } catch(_){}
  try { sessionStorage.setItem(KEY, json); } catch(_){}
}
function hydrate(){
  try { const ls = localStorage.getItem(KEY); if(ls) return JSON.parse(ls); } catch(_){}
  try { const ss = sessionStorage.getItem(KEY); if(ss) return JSON.parse(ss); } catch(_){}
  return null;
}
function clearPersist(){
  try { localStorage.removeItem(KEY); } catch(_){}
  try { sessionStorage.removeItem(KEY); } catch(_){}
}

// ─── HAPTIC FEEDBACK ─────────────────────────────────────────────────────────
function haptic(type) {
  if (!navigator.vibrate) return;
  if (type === "light")   navigator.vibrate(18);
  if (type === "medium")  navigator.vibrate(35);
  if (type === "success") navigator.vibrate([20, 40, 60]);
  if (type === "done")    navigator.vibrate([30, 30, 80, 30, 120]);
}

// ─── WEB AUDIO ENGINE ────────────────────────────────────────────────────────
var _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) {
    try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(_){}
  }
  return _audioCtx;
}
function playTone(freq, duration, type, gain, fadeIn, fadeOut) {
  var ctx = getAudioCtx(); if (!ctx) return;
  try {
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.connect(g); g.connect(ctx.destination);
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    var gv = gain || 0.18;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gv, ctx.currentTime + (fadeIn || 0.01));
    g.gain.linearRampToValueAtTime(0, ctx.currentTime + duration - (fadeOut || 0.05));
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(_) {}
}
function playSound(type) {
  var ctx = getAudioCtx();
  if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch(_){} }
  if (type === "rest_start") {
    setTimeout(function(){ playTone(523, 0.18, "sine", 0.14, 0.02, 0.08); }, 0);
    setTimeout(function(){ playTone(659, 0.22, "sine", 0.10, 0.02, 0.10); }, 120);
  } else if (type === "countdown") {
    playTone(880, 0.08, "triangle", 0.12, 0.005, 0.03);
  } else if (type === "rest_end") {
    playTone(220, 0.05, "sine", 0.22, 0.005, 0.01);
    setTimeout(function(){ playTone(440, 0.55, "sine", 0.18, 0.01, 0.35); }, 30);
    setTimeout(function(){ playTone(660, 0.40, "sine", 0.10, 0.01, 0.28); }, 50);
  } else if (type === "set_done") {
    playTone(784, 0.07, "triangle", 0.15, 0.005, 0.03);
    setTimeout(function(){ playTone(1046, 0.12, "triangle", 0.10, 0.005, 0.06); }, 60);
  } else if (type === "workout_done") {
    playTone(523, 0.20, "sine", 0.15, 0.01, 0.10);
    setTimeout(function(){ playTone(659, 0.22, "sine", 0.13, 0.01, 0.10); }, 120);
    setTimeout(function(){ playTone(784, 0.26, "sine", 0.12, 0.01, 0.14); }, 240);
    setTimeout(function(){ playTone(1046, 0.40, "sine", 0.14, 0.01, 0.22); }, 360);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── KOVA ENGINE BRIDGE ───────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function isEngineAvailable() {
  try {
    return (
      typeof window.KOVA_V3 !== "undefined" &&
      typeof window.KOVA_V3.generateWorkout === "function" &&
      typeof window.KOVA_V3.generateWeeklyPlan === "function"
    );
  } catch (_) { return false; }
}
function getKovaEngine() {
  return isEngineAvailable() ? window.KOVA_V3 : null;
}

// Enhanced level mapping with sub-levels
var LEVEL_MAP = {
  "Débutant":"beginner","Débutant+":"beginner_plus",
  "Intermédiaire":"intermediate","Avancé":"advanced","Élite":"elite"
};
function mapLevel(frLevel, movementData) {
  // If we have movement data, refine the level
  if (movementData) {
    var pullups = parseInt(movementData.pullups) || 0;
    var dips = parseInt(movementData.dips) || 0;
    var pushups = parseInt(movementData.pushups) || 0;
    if (pullups >= 15 && dips >= 20) return "advanced";
    if (pullups >= 8 && dips >= 12 && pushups >= 25) return "intermediate";
    if (pullups >= 4 && pushups >= 15) return "beginner_plus";
    return "beginner";
  }
  return LEVEL_MAP[frLevel] || "beginner";
}

var GOAL_TO_FIGURE = {
  "Force":"basics_pull","Hypertrophie":"basics_push","Muscle-Up":"muscle_up",
  "Handstand":"handstand","Front Lever":"front_lever","Planche":"planche",
  "Recomposition":"basics_push","Reprise":"basics_push","Endurance":"core",
  "Figures":"planche"
};
var GOAL_TO_SECONDARY = {
  "Force":["basics_push","weighted_basics"],"Hypertrophie":["basics_pull","core"],
  "Muscle-Up":["basics_pull","compression"],"Handstand":["planche","compression"],
  "Front Lever":["basics_pull","core"],"Planche":["handstand","compression"],
  "Recomposition":["basics_pull","core"],"Reprise":["core","compression"],
  "Endurance":["basics_push","basics_pull"],"Figures":["handstand","front_lever"]
};
var GOAL_TO_WEAKNESSES = {
  "Force":["pull_strength","push_strength","lat_activation"],
  "Hypertrophie":["push_strength","pull_strength","endurance"],
  "Muscle-Up":["explosiveness","transitions","false_grip","lat_activation"],
  "Handstand":["balance","line","shoulder_stability","push_strength"],
  "Front Lever":["back_chain","depression_strength","hollow_control"],
  "Planche":["protraction","straight_arm_strength","compression"],
  "Recomposition":["endurance","hollow_control","front_chain"],
  "Reprise":["endurance","hollow_control","shoulder_stability"],
  "Endurance":["endurance","hollow_control"],
  "Figures":["protraction","balance","straight_arm_strength"]
};
var FREQ_TO_DAYS = { "2x":2, "3x":3, "4x":4, "5x":5, "6x":6 };
var FIGURE_TO_CAT = {
  "basics_push":"Push","basics_pull":"Pull","weighted_basics":"Push",
  "rings_basics":"Push","scapular":"Pull","core":"Core","compression":"Core",
  "handstand":"Skills","planche":"Skills","front_lever":"Skills",
  "back_lever":"Skills","muscle_up":"Skills","maltese":"Skills",
  "oap":"Skills","mobility":"Core","prehab":"Core"
};

// Equipment mapping from profile to engine
var EQUIPMENT_MAP = {
  "barre":"bar","parallettes":"parallettes","anneaux":"rings",
  "bandes":"band","haltères":"dumbbells","ceinture_lest":"weights",
  "gilet_leste":"weights","mur":"wall"
};
function mapEquipment(profileEquip) {
  if (!profileEquip || !profileEquip.length) return ["wall"];
  var mapped = ["wall"];
  profileEquip.forEach(function(eq) {
    var m = EQUIPMENT_MAP[eq];
    if (m && mapped.indexOf(m) < 0) mapped.push(m);
  });
  return mapped;
}

function parsePrescription(prescription, defaultRest) {
  if (!prescription || typeof prescription !== "string") {
    return { sets: 3, reps: "8", rest: defaultRest || 60 };
  }
  try {
    var p = prescription.trim();
    // Split on × (unicode multiplication) or on 'x' ONLY when between digits/spaces
    // This avoids splitting "max", "quality", "approx" etc.
    var parts = p.split(/\s*×\s*/);
    if (parts.length < 2) {
      // Try 'x' only if surrounded by digit context: "4x8", "4 x 8", "3-4 x max"
      var xMatch = p.match(/^(\d[\d\-]*)\s*x\s+(.+)$/i) || p.match(/^(\d[\d\-]*)\s*x(\d.*)$/i);
      if (xMatch) {
        parts = [xMatch[1], xMatch[2]];
      }
    }
    if (parts.length >= 2) {
      var sets = parseInt(parts[0].trim()) || 3;
      var repStr = parts[1].trim();
      return { sets: Math.min(sets, 8), reps: repStr, rest: defaultRest || 90 };
    }
    // No split found — check if it's a pure text prescription
    // "10 min skill practice", "2-3 submax technical attempts", etc.
    var leadingNum = p.match(/^(\d+)/);
    if (leadingNum && p.length > 4) {
      // It's a complex text prescription, keep as-is
      return { sets: 3, reps: p, rest: defaultRest || 90 };
    }
    return { sets: 3, reps: p || "8", rest: defaultRest || 60 };
  } catch (_) {
    return { sets: 3, reps: "8", rest: defaultRest || 60 };
  }
}

// Better exercise name resolution
var ENGINE_NAME_TO_FR = {
  "Push-Up":"Pompes","Standard Push-Up":"Pompes",
  "Incline Push-Up":"Pompes inclinées","Diamond Push-Up":"Pompes diamant",
  "Deep Push-Up":"Pompes profondes","Pseudo Planche Push-Up":"Pseudo planche push-up",
  "Dip":"Dips","Band Dip":"Dips assistés (bande)","Weighted Dip":"Dips lestés",
  "Pike Push-Up":"Pike push-up","Elevated Pike Push-Up":"Pike push-up surélevé",
  "Pull-Up":"Tractions pronation","Negative Pull-Up":"Tractions excentriques",
  "Band Pull-Up":"Tractions assistées (bande)","Weighted Pull-Up":"Tractions lestées",
  "Chin-Up":"Tractions supination","Weighted Chin-Up":"Tractions supination lestées",
  "Ring Row (Australian Row)":"Rowing inversé (anneaux)","Australian Row":"Rowing inversé",
  "Ring Row":"Rowing inversé (anneaux)",
  "Scapula Pull-Up":"Tractions scapulaires","Dead Hang":"Suspension passive",
  "Active Hang":"Suspension active",
  "Hollow Body Hold":"Gainage creux (hollow)","Hollow Rocks":"Gainage creux dynamique",
  "Arch Body Hold":"Gainage dos (arch)","Leg Raises Hanging":"Relevés de jambes suspendus",
  "Dragon Flag":"Dragon flag",
  "L-Sit Tuck":"L-sit groupé","L-Sit":"L-sit","V-Sit Progression":"V-sit progression",
  "Compression Lift":"Compression lift",
  "Wall Handstand (Chest to Wall)":"Handstand mur (poitrine)","Wall Handstand":"Handstand mur",
  "Free Handstand":"Handstand libre","Box Pike Hold":"Pike sur box",
  "Wall HSPU":"Pompes renversées mur","Deficit Wall HSPU":"Pompes renversées mur déficit",
  "HSPU":"Pompes renversées","Handstand Push-Up":"Pompes renversées",
  "Planche Lean":"Planche lean","Semi Planche Hold":"Semi-planche",
  "Planche Lean Push-Up":"Planche lean push-up",
  "Tuck Planche":"Tuck planche","Advanced Tuck Planche":"Advanced tuck planche",
  "Straddle Planche":"Straddle planche","Full Planche":"Full planche",
  "Tuck Planche Push-Up":"Tuck planche push-up",
  "Tuck Front Lever":"Tuck front lever","Advanced Tuck Front Lever":"Adv. tuck front lever",
  "One Leg Front Lever":"Front lever une jambe","Straddle Front Lever":"Straddle front lever",
  "Full Front Lever":"Full front lever","Front Lever Raise (Tuck)":"Front lever raise (tuck)",
  "Front Lever Pull-Up":"Front lever rowing",
  "Band Front Lever (Tuck)":"Tuck front lever assisté (bande)",
  "Skin The Cat":"Skin the cat","Tuck Back Lever":"Tuck back lever",
  "Straddle Back Lever":"Straddle back lever","Full Back Lever":"Full back lever",
  "High Pull-Up":"High pull-up explosif","Straight Bar Dip":"Dips barre droite",
  "Bar Muscle-Up":"Muscle-up barre","Strict Bar Muscle-Up":"Muscle-up barre strict",
  "Ring Muscle-Up":"Muscle-up anneaux",
  "Ring Support Hold":"Support anneaux","Ring Push-Up":"Pompes anneaux","Ring Dip":"Dips anneaux",
  "Wide Planche":"Planche large","Supinated Planche Hold":"Planche supination",
  "Band Assisted Maltese Hold":"Maltese assisté (bande)","Maltese Hold":"Maltese",
  "Handstand Flag (Side Lean)":"Handstand flag","One Arm Planche Lean Entry":"OAP lean entry",
  "One Arm Planche Negative":"OAP excentrique",
  "One Arm Planche (Imperfect Hold)":"OAP (forme imparfaite)","One Arm Planche Hold":"OAP",
  "Wrist Prep Protocol":"Protocole poignets","Scapula Push-Up":"Pompes scapulaires",
  "Band External Rotation":"Rotation externe (bande)","Zanetti Press":"Zanetti press",
  "Jefferson Curl":"Jefferson curl","Thoracic Extension":"Extension thoracique",
  "False Grip Hang":"Suspension false grip",
  "L-Sit to Tuck Planche":"L-sit vers tuck planche",
  "Shoulder Tap":"Épaule-main (shoulder tap)","Wall Walk":"Marche au mur",
  "Negative Muscle-Up":"Muscle-up excentrique",
  "Muscle-Up Transition Drill":"Travail de transition muscle-up",
};
function resolveExName(n){ return ENGINE_NAME_TO_FR[n] || n; }

/**
 * Enhanced engine profile builder — uses movement assessment data
 */
function buildEngineProfile(appProfile, appStats, appHistory, readinessOverride) {
  var movementData = appProfile.movements || {};
  var level = mapLevel(appProfile.level, movementData);
  var figure = GOAL_TO_FIGURE[appProfile.goal] || "basics_push";
  var secondary = GOAL_TO_SECONDARY[appProfile.goal] || ["core","compression"];
  var weaknesses = (GOAL_TO_WEAKNESSES[appProfile.goal] || []).slice();
  var freq = FREQ_TO_DAYS[appProfile.freq] || 3;
  var durPref = appProfile.sessionLength || "moyenne";
  var availableMinutes = durPref === "courte" ? 45 : durPref === "longue" ? 90 : 65;

  // Equipment from profile
  var equipment = mapEquipment(appProfile.equipment || []);

  // Derive weaknesses from movement data
  var pullups = parseInt(movementData.pullups) || 0;
  var dips = parseInt(movementData.dips) || 0;
  var pushups = parseInt(movementData.pushups) || 0;
  if (pullups < 5 && weaknesses.indexOf("pull_strength") < 0) weaknesses.push("pull_strength");
  if (dips < 8 && weaknesses.indexOf("push_strength") < 0) weaknesses.push("push_strength");
  if (pushups < 15 && weaknesses.indexOf("push_strength") < 0) weaknesses.push("push_strength");
  if (movementData.hollow && parseInt(movementData.hollow) < 20) {
    if (weaknesses.indexOf("hollow_control") < 0) weaknesses.push("hollow_control");
  }
  if (level === "beginner") {
    if (weaknesses.indexOf("hollow_control") < 0) weaknesses.push("hollow_control");
    if (weaknesses.indexOf("lat_activation") < 0) weaknesses.push("lat_activation");
  }

  // Build currentMetrics from movement assessment
  var currentMetrics = {};
  if (pullups > 0) currentMetrics.pullup = { reps: pullups };
  if (dips > 0) currentMetrics.dip = { reps: dips };
  if (pushups > 0) currentMetrics.pushup_standard = { reps: pushups };
  if (movementData.hollow) currentMetrics.hollow_body_hold = { hold: parseInt(movementData.hollow) || 0 };
  if (movementData.handstandWall) currentMetrics.wall_handstand_chest_to_wall = { hold: parseInt(movementData.handstandWall) || 0 };
  if (movementData.muscleUp === "plusieurs") { currentMetrics.bar_muscle_up = { reps: 3 }; }
  else if (movementData.muscleUp === "1_clean") { currentMetrics.bar_muscle_up = { reps: 1 }; }

  // Consecutive training days from history
  var consecutiveTrainingDays = 0;
  var history = Array.isArray(appHistory) ? appHistory : [];
  if (history.length > 0) {
    var sorted = history.slice().sort(function(a,b){ return new Date(b.date)-new Date(a.date); });
    var checkTs = new Date(); checkTs.setHours(0,0,0,0);
    for (var i = 0; i < Math.min(sorted.length, 14); i++) {
      var sDate = new Date(sorted[i].date); sDate.setHours(0,0,0,0);
      var diff = Math.round((checkTs-sDate)/(86400000));
      if (diff <= 1) { consecutiveTrainingDays++; checkTs.setDate(checkTs.getDate()-1); }
      else break;
    }
  }

  var perfDrop = 0;
  if (appStats && appStats.lastDate) {
    var daysSince = Math.round((Date.now()-new Date(appStats.lastDate).getTime())/86400000);
    if (daysSince > 7) perfDrop = 40;
    else if (daysSince > 4) perfDrop = 25;
    else if (daysSince > 2) perfDrop = 10;
  }

  var soreness = consecutiveTrainingDays >= 4 ? 7 : consecutiveTrainingDays >= 3 ? 5 : 2;
  var readiness = readinessOverride || { energy: 7, joints: 8, motivation: 7, soreness: soreness, sleep: 7 };

  // Training mode preference
  var trainingMode = appProfile.trainingMode || "pdc";
  if (trainingMode === "lest" || trainingMode === "mixte") {
    if (equipment.indexOf("weights") < 0) equipment.push("weights");
  }

  return {
    level: level, priorityFigure: figure, secondaryFigures: secondary,
    availableMinutes: availableMinutes, equipment: equipment,
    readiness: readiness, painFlags: [], weaknesses: weaknesses,
    consecutiveTrainingDays: consecutiveTrainingDays,
    currentMetrics: currentMetrics,
    lastSession: { performanceDropPct: perfDrop }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRAINING MODE FILTER — PROTECTION ANTI-LEST (MULTI-NIVEAUX) ────────────
// ═══════════════════════════════════════════════════════════════════════════════

var WEIGHTED_EXERCISE_NAMES = [
  "Weighted Dip","Weighted Pull-Up","Weighted Chin-Up","Chin-Up Weighted",
  "Dips lestés","Tractions lestées","Tractions supination lestées",
  "Dips lesté","Traction lestée","Dips lestées",
  "Heavy Weighted Dip","Heavy Weighted Pull-Up",
  "Tractions lestés","Dip lesté","Pull-up lesté",
  "Weighted Ring Dip","Ring Dip Weighted"
];
var WEIGHTED_FIGURES = ["weighted_basics"];
var WEIGHTED_TAGS = ["weighted","lest","lesté"];

function isWeightedExercise(ex) {
  if (!ex) return false;
  var name = (ex.name || ex.engineName || "").toLowerCase();
  // Check explicit weighted names
  for (var i = 0; i < WEIGHTED_EXERCISE_NAMES.length; i++) {
    if (name === WEIGHTED_EXERCISE_NAMES[i].toLowerCase()) return true;
  }
  // Check if name contains "lesté/lestée/lestés/lestées" or "weighted"
  if (/lest[éèe]/i.test(name)) return true;
  if (name.indexOf("weighted") >= 0) return true;
  // Check figure
  if (ex.figure && WEIGHTED_FIGURES.indexOf(ex.figure) >= 0) return true;
  // Check tags
  if (ex.tags && Array.isArray(ex.tags)) {
    for (var j = 0; j < ex.tags.length; j++) {
      if (WEIGHTED_TAGS.indexOf(ex.tags[j].toLowerCase()) >= 0) return true;
    }
  }
  // Check equipment requiring weights
  if (ex.equip && Array.isArray(ex.equip)) {
    if (ex.equip.indexOf("ceinture_lest") >= 0 || ex.equip.indexOf("gilet_leste") >= 0) return true;
  }
  return false;
}

function isExerciseCompatibleWithTrainingMode(ex, trainingMode, equipment) {
  if (!trainingMode || trainingMode === "mixte") return true;
  if (trainingMode === "pdc") return !isWeightedExercise(ex);
  if (trainingMode === "lest") {
    // Weighted exercises OK only if user has weights
    if (isWeightedExercise(ex)) {
      return equipment && (equipment.indexOf("ceinture_lest") >= 0 || equipment.indexOf("gilet_leste") >= 0 || equipment.indexOf("weights") >= 0);
    }
    return true;
  }
  return true;
}

// PDC-safe alternative map
var WEIGHTED_ALTERNATIVES = {
  "Dips lestés": {name:"Dips",cat:"Push",sets:4,reps:"max-2",rest:120},
  "Dips lestées": {name:"Dips",cat:"Push",sets:4,reps:"max-2",rest:120},
  "Tractions lestées": {name:"Tractions pronation",cat:"Pull",sets:4,reps:"max-2",rest:120},
  "Tractions supination lestées": {name:"Tractions supination",cat:"Pull",sets:4,reps:"max-2",rest:120},
  "Tractions lestés": {name:"Tractions pronation",cat:"Pull",sets:4,reps:"max-2",rest:120},
  "Weighted Dip": {name:"Dips",cat:"Push",sets:4,reps:"max-2",rest:120},
  "Weighted Pull-Up": {name:"Tractions pronation",cat:"Pull",sets:4,reps:"max-2",rest:120},
  "Weighted Chin-Up": {name:"Tractions supination",cat:"Pull",sets:4,reps:"max-2",rest:120},
  "Heavy Weighted Dip": {name:"Dips",cat:"Push",sets:5,reps:"5-8",rest:150},
  "Heavy Weighted Pull-Up": {name:"Tractions pronation",cat:"Pull",sets:5,reps:"5-8",rest:150},
};

function getBodyweightAlternative(ex) {
  var alt = WEIGHTED_ALTERNATIVES[ex.name] || WEIGHTED_ALTERNATIVES[ex.engineName];
  if (alt) return Object.assign({}, alt, {cues: ex.cues || [], errors: ex.errors || []});
  // Fallback: transform weighted → bodyweight version
  var name = (ex.name || "").replace(/\s*lest[éèe]+e?s?\s*/gi, " ").replace(/\s*weighted\s*/gi, " ").trim();
  return Object.assign({}, ex, {name: name || ex.name});
}

function filterSessionForTrainingMode(session, trainingMode, equipment) {
  if (!session || !session.ex || trainingMode === "mixte") return session;
  var filtered = session.ex.map(function(ex) {
    if (isExerciseCompatibleWithTrainingMode(ex, trainingMode, equipment)) return ex;
    if (trainingMode === "pdc") return getBodyweightAlternative(ex);
    return null; // remove incompatible
  }).filter(Boolean);
  return Object.assign({}, session, {ex: filtered});
}

function isProgramCompatibleWithTrainingMode(prog, trainingMode) {
  if (!trainingMode || trainingMode === "mixte") return true;
  if (trainingMode === "pdc") {
    // Reject explicitly weighted programs
    var name = (prog.name || "").toLowerCase();
    var tagline = (prog.tagline || "").toLowerCase();
    if (/lest[éèe]/i.test(name) || name.indexOf("weighted") >= 0) return false;
    if (name.indexOf("force lest") >= 0) return false;
    if (/lest[éèe]/i.test(tagline) || tagline.indexOf("weighted") >= 0) return false;
    // Also check if ANY session contains weighted exercises
    if (prog.sessions) {
      for (var i = 0; i < prog.sessions.length; i++) {
        var sess = prog.sessions[i];
        if (sess.ex) {
          for (var j = 0; j < sess.ex.length; j++) {
            if (isWeightedExercise(sess.ex[j])) return false;
          }
        }
      }
    }
  }
  return true;
}

// Translate common engine coaching cues to French
var ENGINE_CUE_FR = {
  "Arms stay straight":"Bras tendus tout au long",
  "Push through":"Pousser activement à travers",
  "Protract":"Protracter les omoplates",
  "Posterior pelvic tilt":"Rétroversion du bassin",
  "Squeeze glutes":"Contracter les fessiers",
  "Lean forward":"Pencher vers l'avant",
  "Full range of motion":"Amplitude complète",
  "Slow and controlled":"Lent et contrôlé",
  "Keep core tight":"Gainage actif",
  "Depress shoulders":"Baisser les épaules",
  "Retract scapulae":"Rétracter les omoplates",
  "Fingers spread":"Doigts écartés",
  "Head neutral":"Tête neutre",
  "Lock elbows":"Verrouiller les coudes",
  "Breathe":"Respirer",
};
function translateCue(cue) {
  if (!cue || typeof cue !== "string") return cue;
  var result = cue;
  Object.keys(ENGINE_CUE_FR).forEach(function(en) {
    if (result.toLowerCase().indexOf(en.toLowerCase()) >= 0) {
      result = result.replace(new RegExp(en, "gi"), ENGINE_CUE_FR[en]);
    }
  });
  return result;
}
function translateError(err) {
  if (!err || typeof err !== "string") return err;
  return err
    .replace(/insufficient/gi, "insuffisant(e)")
    .replace(/sinking/gi, "affaissement")
    .replace(/rushed/gi, "précipité")
    .replace(/forward lean/gi, "inclinaison avant")
    .replace(/protraction/gi, "protraction")
    .replace(/losing/gi, "perte de")
    .replace(/collapsing/gi, "effondrement");
}

function normalizeEngineExercise(engineEx, defaultRest) {
  if (!engineEx) return null;
  try {
    var parsed = parsePrescription(engineEx.prescription, defaultRest);
    var cat = FIGURE_TO_CAT[engineEx.figure] || "Core";
    var name = resolveExName(engineEx.name || "");
    
    // Plausibility guard: cap hold reps for static exercises
    var reps = parsed.reps;
    if (engineEx.type === "static" || engineEx.effortType === "technique") {
      // Ensure hold time per set doesn't exceed 120s
      var numMatch = reps.match(/^(\d+)s?$/);
      if (numMatch && parseInt(numMatch[1]) > 120) {
        reps = "120s";
      }
    }
    
    return {
      name: name, engineName: engineEx.name || "", cat: cat,
      sets: parsed.sets, reps: reps, rest: parsed.rest,
      cues: Array.isArray(engineEx.coachingCues) ? engineEx.coachingCues.slice(0,2).map(translateCue) : [],
      errors: Array.isArray(engineEx.commonErrors) ? engineEx.commonErrors.slice(0,1).map(translateError) : [],
      muscles: Array.isArray(engineEx.muscleGroups) ? engineEx.muscleGroups.join(" · ") : "",
      difficulty: engineEx.perceivedDifficulty || null,
      videoSlug: engineEx.videoSlug || null,
      figure: engineEx.figure || null,
      effortType: engineEx.effortType || null,
      _isMainTest: false
    };
  } catch (_) { return null; }
}

function normalizeEngineWorkout(engineWorkout, sessionName) {
  if (!engineWorkout) return null;
  try {
    var exercises = [];
    if (engineWorkout.mainTest) {
      var mt = engineWorkout.mainTest;
      var mainEx = normalizeEngineExercise({
        name: mt.name,
        figure: engineWorkout.meta && engineWorkout.meta.priorityFigure || "basics_push",
        prescription: mt.prescription,
        coachingCues: mt.coachingCues || [], commonErrors: mt.commonErrors || [],
        muscleGroups: [], perceivedDifficulty: 8, videoSlug: null
      }, 120);
      if (mainEx) { mainEx._isMainTest = true; exercises.push(mainEx); }
    }
    var mainBlock = engineWorkout.mainBlock || [];
    mainBlock.forEach(function(ex) {
      if (engineWorkout.mainTest && ex.name === engineWorkout.mainTest.name) return;
      var n = normalizeEngineExercise(ex, 90); if (n) exercises.push(n);
    });
    var accessBlock = (engineWorkout.accessoryBlock || []).slice(0, 3);
    accessBlock.forEach(function(ex) {
      var n = normalizeEngineExercise(ex, 60); if (n) exercises.push(n);
    });
    exercises = exercises.slice(0, 7);
    if (exercises.length === 0) return null;
    var meta = engineWorkout.meta || {};
    // Translate cooldown notes to French
    var cooldown = (engineWorkout.cooldown || []).map(function(c) {
      return c.replace(/Light mobility on trained zones/gi, "Mobilité légère sur les zones travaillées")
              .replace(/Wrist \+ shoulder decompression/gi, "Décompression poignets + épaules")
              .replace(/Dead hang/gi, "Suspension passive")
              .replace(/if pulling was trained/gi, "si tirage travaillé")
              .replace(/Easy breathing \/ heart rate downregulation/gi, "Respiration calme / retour au calme")
              .replace(/min each/gi, "min chaque")
              .replace(/min/gi, "min");
    });
    // Translate notes to French
    var notes = (engineWorkout.notes || []).map(function(n) {
      return n.replace(/Pain flags/gi, "Zones sensibles")
              .replace(/avoid loaded patterns near these joints/gi, "éviter les exercices lourds sur ces articulations")
              .replace(/Low readiness/gi, "Récupération basse")
              .replace(/focus on technique, holds, assistance, prehab/gi, "priorité technique, maintiens, assisté, préhab")
              .replace(/no maxing out/gi, "pas d'effort maximal")
              .replace(/Medium readiness/gi, "Récupération moyenne")
              .replace(/fundamentals \+ specific work \+ weakness reinforcement/gi, "fondamentaux + travail spécifique + renforcement des faiblesses")
              .replace(/High readiness/gi, "Bonne récupération")
              .replace(/max test \+ main intensity \+ combos\/volume/gi, "test max + intensité + combos / volume");
    });
    return {
      name: sessionName || "Séance personnalisée", ex: exercises,
      _fromEngine: true, _intensityZone: meta.intensityZone || "medium",
      _readinessScore: meta.readinessScore || null,
      _estimatedMin: meta.estimatedDurationMin || null,
      _warmup: engineWorkout.warmup || null,
      _notes: notes, _cooldown: cooldown
    };
  } catch (_) { return null; }
}

function fallbackToLocalPrograms() {
  return PROGRAMS[0] && PROGRAMS[0].sessions[0] ? PROGRAMS[0].sessions[0] : null;
}

function generateSmartWorkoutFromProfile(appState, readiness) {
  var engine = getKovaEngine(); if (!engine) return null;
  try {
    var profile = buildEngineProfile(appState.profile, appState.stats, appState.history, readiness);
    // If PDC mode, remove weights from engine equipment to prevent weighted generation
    var trainingMode = appState.profile.trainingMode || "pdc";
    if (trainingMode === "pdc") {
      profile.equipment = (profile.equipment || []).filter(function(eq){ return eq !== "weights"; });
    }
    var result = engine.generateWorkout(profile);
    if (!result) return null;
    var zone = result.meta && result.meta.intensityZone || "medium";
    var figure = result.meta && result.meta.priorityFigure || "basics_push";
    var figureNames = {
      "muscle_up":"Muscle-Up","handstand":"Handstand","planche":"Planche",
      "front_lever":"Front Lever","basics_push":"Poussée","basics_pull":"Tirage",
      "core":"Gainage","compression":"Compression","back_lever":"Back Lever",
      "weighted_basics":"Force de base","rings_basics":"Anneaux","scapular":"Scapulaire",
      "prehab":"Préhab","mobility":"Mobilité","oap":"OAP","maltese":"Maltese"
    };
    var figureFR = figureNames[figure] || "Complet";
    var zoneFR = zone==="high"?"Intensif":zone==="low"?"Récupération":"Standard";
    var session = normalizeEngineWorkout(result, "Séance " + figureFR + " · " + zoneFR);
    // Post-filter: remove any weighted exercise that slipped through
    if (session) {
      session = filterSessionForTrainingMode(session, trainingMode, appState.profile.equipment);
    }
    return session;
  } catch (err) { console.warn("[KOVA Bridge]", err); return null; }
}

function generateSmartWeekFromProfile(appState, days) {
  var engine = getKovaEngine(); if (!engine) return null;
  try {
    var profile = buildEngineProfile(appState.profile, appState.stats, appState.history);
    var trainingMode = appState.profile.trainingMode || "pdc";
    if (trainingMode === "pdc") {
      profile.equipment = (profile.equipment || []).filter(function(eq){ return eq !== "weights"; });
    }
    var preferredDays = days || FREQ_TO_DAYS[appState.profile.freq] || 3;
    var weekPlan = engine.generateWeeklyPlan(profile, preferredDays);
    if (!Array.isArray(weekPlan)) return null;
    var sessions = [];
    var focusNames = {
      "priority":"Figure prioritaire","secondary_1":"Renforcement secondaire","secondary_2":"Renforcement complémentaire",
      "basics_and_weak":"Fondamentaux & faiblesses","full_body":"Corps complet","active_rest":"Récupération active"
    };
    weekPlan.forEach(function(dayPlan) {
      if (!dayPlan || !dayPlan.session) return;
      if (dayPlan.day === "active_rest") return;
      var focusFR = focusNames[dayPlan.focus] || (dayPlan.focus||"Séance");
      var n = normalizeEngineWorkout(dayPlan.session, "Jour " + dayPlan.day + " — " + focusFR);
      if (n) {
        // Post-filter weighted exercises
        n = filterSessionForTrainingMode(n, trainingMode, appState.profile.equipment);
        sessions.push(n);
      }
    });
    return sessions.length > 0 ? sessions : null;
  } catch (err) { console.warn("[KOVA Bridge]", err); return null; }
}

// ─── EXERCISE MEDIA CONFIG ──────────────────────────────────────────────────
var EXERCISE_MEDIA_CONFIG = {};
function svgAnim(id, content) { return { id: id, content: content }; }
var EXERCISE_MEDIA = {
  "Pompes": svgAnim("pushup", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.pu{animation:pushUp 1.6s ease-in-out infinite;transform-origin:100px 85px}@keyframes pushUp{0%,100%{transform:translateY(0)}45%,55%{transform:translateY(18px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><line x1="20" y1="110" x2="180" y2="110" stroke="#252345" stroke-width="2"/><g class="pu"><rect x="48" y="72" width="104" height="16" rx="8" fill="#8B5CF6" opacity="0.85"/><circle cx="160" cy="64" r="11" fill="#F0EEF8" opacity="0.9"/><line x1="148" y1="82" x2="150" y2="108" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="110" r="5" fill="#8B5CF6"/><line x1="60" y1="82" x2="52" y2="108" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><circle cx="52" cy="110" r="5" fill="#8B5CF6"/><rect x="30" y="76" width="22" height="8" rx="4" fill="#F0EEF8" opacity="0.6"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">POMPES</text></svg>'),
  "Dips": svgAnim("dip", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.dip{animation:dipMove 2s ease-in-out infinite}@keyframes dipMove{0%,100%{transform:translateY(0)}40%,60%{transform:translateY(20px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="42" width="12" height="80" rx="4" fill="#252345"/><rect x="158" y="42" width="12" height="80" rx="4" fill="#252345"/><g class="dip"><line x1="42" y1="44" x2="68" y2="30" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><line x1="158" y1="44" x2="132" y2="30" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="24" r="11" fill="#F0EEF8" opacity="0.9"/><rect x="88" y="34" width="24" height="28" rx="8" fill="#8B5CF6" opacity="0.85"/><line x1="94" y1="62" x2="86" y2="88" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><line x1="106" y1="62" x2="114" y2="88" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">DIPS</text></svg>'),
  "Tractions pronation": svgAnim("pullup", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.pull{animation:pullUp 2.2s ease-in-out infinite}@keyframes pullUp{0%,100%{transform:translateY(20px)}40%,60%{transform:translateY(0)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="16" width="140" height="8" rx="4" fill="#252345"/><g class="pull"><circle cx="80" cy="20" r="5" fill="#32D4C0"/><circle cx="120" cy="20" r="5" fill="#32D4C0"/><line x1="80" y1="22" x2="82" y2="44" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><line x1="120" y1="22" x2="118" y2="44" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="44" r="11" fill="#F0EEF8" opacity="0.9"/><rect x="88" y="54" width="24" height="28" rx="8" fill="#32D4C0" opacity="0.85"/><line x1="94" y1="82" x2="88" y2="105" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><line x1="106" y1="82" x2="112" y2="105" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">TRACTIONS</text></svg>'),
  "Hollow body hold": svgAnim("hollow", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.hollow{animation:hb 2.5s ease-in-out infinite;transform-origin:100px 80px}@keyframes hb{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.92) translateY(3px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><ellipse cx="100" cy="82" rx="80" ry="18" fill="#8B5CF6" opacity="0.15"/><g class="hollow"><ellipse cx="100" cy="78" rx="60" ry="10" fill="#141322" stroke="#8B5CF6" stroke-width="1.5"/><rect x="48" y="70" width="104" height="16" rx="8" fill="#8B5CF6" opacity="0.85"/><circle cx="160" cy="64" r="10" fill="#F0EEF8" opacity="0.9"/><line x1="48" y1="75" x2="28" y2="60" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">GAINAGE CREUX</text></svg>'),
  "Gainage creux (hollow)": svgAnim("hollow2", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.hollow2{animation:hb2 2.5s ease-in-out infinite;transform-origin:100px 80px}@keyframes hb2{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.92) translateY(3px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><ellipse cx="100" cy="82" rx="80" ry="18" fill="#8B5CF6" opacity="0.15"/><g class="hollow2"><ellipse cx="100" cy="78" rx="60" ry="10" fill="#141322" stroke="#8B5CF6" stroke-width="1.5"/><rect x="48" y="70" width="104" height="16" rx="8" fill="#8B5CF6" opacity="0.85"/><circle cx="160" cy="64" r="10" fill="#F0EEF8" opacity="0.9"/><line x1="48" y1="75" x2="28" y2="60" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">GAINAGE CREUX</text></svg>'),
  "Relevés de jambes suspendus": svgAnim("legraises", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.legs-up{animation:legRaise 2s ease-in-out infinite;transform-origin:100px 72px}@keyframes legRaise{0%,100%{transform:rotate(50deg)}45%,55%{transform:rotate(-10deg)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="16" width="140" height="8" rx="4" fill="#252345"/><g class="legs-up"><circle cx="100" cy="44" r="11" fill="#F0EEF8" opacity="0.9"/><rect x="88" y="54" width="24" height="20" rx="8" fill="#8B5CF6" opacity="0.85"/><line x1="94" y1="73" x2="78" y2="108" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><line x1="106" y1="73" x2="122" y2="108" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/></g><text x="100" y="136" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">RELEVÉS DE JAMBES</text></svg>'),
  "Tuck planche": svgAnim("frogstand", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.frog{animation:frogBalance 3s ease-in-out infinite;transform-origin:100px 75px}@keyframes frogBalance{0%,100%{transform:rotate(-1deg) translateX(-2px)}50%{transform:rotate(1deg) translateX(2px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><ellipse cx="100" cy="116" rx="28" ry="6" fill="#8B5CF6" opacity="0.2"/><g class="frog"><circle cx="100" cy="44" r="12" fill="#F0EEF8" opacity="0.9"/><rect x="88" y="55" width="24" height="26" rx="8" fill="#D4A843" opacity="0.9"/><line x1="88" y1="65" x2="68" y2="80" stroke="#F0EEF8" stroke-width="6" stroke-linecap="round"/><line x1="112" y1="65" x2="132" y2="80" stroke="#F0EEF8" stroke-width="6" stroke-linecap="round"/><circle cx="66" cy="82" r="6" fill="#F0EEF8" opacity="0.8"/><circle cx="134" cy="82" r="6" fill="#F0EEF8" opacity="0.8"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">TUCK PLANCHE</text></svg>'),
  "Handstand mur": svgAnim("handstand", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.hs{animation:hsBalance 3.5s ease-in-out infinite;transform-origin:100px 100px}@keyframes hsBalance{0%,100%{transform:rotate(-1.5deg)}50%{transform:rotate(1.5deg)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="150" y="0" width="14" height="140" fill="#141322"/><g class="hs"><circle cx="100" cy="66" r="11" fill="#F0EEF8" opacity="0.9"/><rect x="93" y="38" width="14" height="38" rx="6" fill="#A78BFA" opacity="0.7"/><rect x="85" y="74" width="30" height="20" rx="8" fill="#A78BFA" opacity="0.9"/><circle cx="86" cy="118" r="7" fill="#F0EEF8" opacity="0.8"/><circle cx="114" cy="118" r="7" fill="#F0EEF8" opacity="0.8"/></g><text x="80" y="136" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">HANDSTAND MUR</text></svg>'),
  "Muscle-up barre": svgAnim("muscleup", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.mu{animation:muscleup 2.8s ease-in-out infinite}@keyframes muscleup{0%{transform:translateY(30px)}35%{transform:translateY(0px)}55%{transform:translateY(-18px)}75%,100%{transform:translateY(30px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="20" width="140" height="9" rx="4.5" fill="#252345"/><g class="mu"><circle cx="100" cy="20" r="11" fill="#F0EEF8" opacity="0.9"/><rect x="88" y="30" width="24" height="28" rx="8" fill="#D4A843" opacity="0.9"/><line x1="94" y1="58" x2="86" y2="80" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/><line x1="106" y1="58" x2="114" y2="80" stroke="#F0EEF8" stroke-width="5" stroke-linecap="round"/></g><text x="100" y="136" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">MUSCLE-UP</text></svg>'),
  "Tuck front lever": svgAnim("frontlever", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.fl{animation:flHold 3s ease-in-out infinite;transform-origin:100px 60px}@keyframes flHold{0%,100%{transform:translateY(4px) rotate(2deg)}50%{transform:translateY(-4px) rotate(-2deg)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="22" width="140" height="9" rx="4.5" fill="#252345"/><ellipse cx="100" cy="70" rx="55" ry="14" fill="#32D4C0" opacity="0.12"/><g class="fl"><rect x="74" y="52" width="52" height="14" rx="7" fill="#32D4C0" opacity="0.9"/><circle cx="132" cy="58" r="10" fill="#F0EEF8" opacity="0.9"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">TUCK FRONT LEVER</text></svg>'),
  "Pseudo planche push-up": svgAnim("pseudoplanche", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.pp{animation:ppMove 1.8s ease-in-out infinite;transform-origin:100px 85px}@keyframes ppMove{0%,100%{transform:translateY(0)}45%,55%{transform:translateY(18px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><line x1="20" y1="110" x2="180" y2="110" stroke="#252345" stroke-width="2"/><g class="pp"><rect x="52" y="72" width="96" height="14" rx="7" fill="#FF6B35" opacity="0.85"/><circle cx="155" cy="65" r="11" fill="#F0EEF8" opacity="0.9"/></g><text x="100" y="130" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">PSEUDO PLANCHE</text></svg>'),
  "High pull-up explosif": svgAnim("highpull", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.hp{animation:highpull 1.8s ease-in-out infinite}@keyframes highpull{0%,100%{transform:translateY(22px)}40%,60%{transform:translateY(0px)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="16" width="140" height="9" rx="4.5" fill="#252345"/><g class="hp"><circle cx="100" cy="36" r="11" fill="#F0EEF8" opacity="0.9"/><rect x="88" y="46" width="24" height="28" rx="8" fill="#32D4C0" opacity="0.85"/></g><text x="100" y="135" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">HIGH PULL-UP EXPLOSIF</text></svg>'),
  "Dragon flag": svgAnim("dragonflag", '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg"><style>.df{animation:dragonFlag 2.2s ease-in-out infinite;transform-origin:148px 78px}@keyframes dragonFlag{0%,100%{transform:rotate(-5deg)}45%,55%{transform:rotate(15deg)}}</style><rect x="0" y="0" width="200" height="140" fill="#0E0D18" rx="16"/><rect x="30" y="78" width="148" height="14" rx="6" fill="#141322" stroke="#252345" stroke-width="1.5"/><g class="df"><rect x="40" y="70" width="108" height="14" rx="7" fill="#FF453A" opacity="0.85"/><circle cx="150" cy="72" r="10" fill="#F0EEF8" opacity="0.9"/></g><text x="100" y="126" text-anchor="middle" font-size="9" fill="#4B4870" font-family="system-ui">DRAGON FLAG</text></svg>'),
};

function ExerciseMedia(props) {
  var name = props.name; var catColor = props.catColor || T.accent;
  var compact = props.compact; var height = compact ? 170 : 230;
  var errS = useState(false); var hasError = errS[0]; var setHasError = errS[1];
  var config = EXERCISE_MEDIA_CONFIG[name] || {};
  var hasSvg = !!EXERCISE_MEDIA[name];
  var containerStyle = {
    height: height, borderRadius: compact ? 18 : 24, overflow: "hidden",
    position: "relative", background: T.elevated, flexShrink: 0
  };
  if (hasSvg) {
    return e("div", { style: Object.assign({}, containerStyle, { border: "none" }),
      dangerouslySetInnerHTML: { __html: EXERCISE_MEDIA[name].content } });
  }
  return e("div", { style: Object.assign({}, containerStyle, {
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
    background: "linear-gradient(135deg," + catColor + "08 0%," + T.elevated + " 100%)",
    border: "1px solid " + T.border
  }) },
    e("div", { style: { fontSize: compact ? 40 : 54, opacity: 0.2 } }, "🎬"),
    e("div", { style: { fontSize: 13, fontWeight: 600, color: catColor, opacity: 0.5 } }, name));
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDE VIEWER — Mini-ebook premium scrollable
// ═══════════════════════════════════════════════════════════════════════════════

function GSection(props){
  var open=useState(props.defaultOpen!==false); var isOpen=open[0]; var setOpen=open[1];
  return e("div",{style:{background:T.elevated,border:"1px solid "+T.border,borderRadius:20,overflow:"hidden",
    animation:"fadeIn 0.3s ease"}},
    e("button",{onClick:function(){setOpen(!isOpen);},style:{width:"100%",display:"flex",alignItems:"center",
      justifyContent:"space-between",padding:"16px 18px",background:"none",border:"none",cursor:"pointer"}},
      e("div",{style:{display:"flex",alignItems:"center",gap:10}},
        props.icon&&e("span",{style:{fontSize:16}},props.icon),
        e("span",{style:{fontSize:14,fontWeight:700,color:T.text}},props.title)),
      e("span",{style:{fontSize:12,color:T.textTert,transition:"transform 0.2s",
        transform:isOpen?"rotate(90deg)":"rotate(0deg)"}},isOpen?"▾":"▸")),
    isOpen&&e("div",{style:{padding:"0 18px 18px",display:"flex",flexDirection:"column",gap:12}},props.children));
}

function GBullet(props){
  return e("div",{style:{display:"flex",gap:10,alignItems:"flex-start"}},
    e("span",{style:{color:props.color||T.accent,fontSize:13,flexShrink:0,marginTop:1}},props.bullet||"◆"),
    e("div",{style:{fontSize:13,color:T.textSec,lineHeight:1.6}},props.children));
}

function GProse(props){
  return e("div",{style:{fontSize:13,color:T.textSec,lineHeight:1.7}},props.children);
}

function GBadge(props){
  return e("span",{style:{display:"inline-block",fontSize:10,fontWeight:700,color:props.color||T.accent,
    background:(props.color||T.accent)+"14",borderRadius:6,padding:"3px 8px",marginRight:6}},props.children);
}

function GuideDetail(props){
  var guide=props.guide; var onClose=props.onClose;
  if(!guide) return null;

  // Table of contents state
  var tocS=useState(false); var showToc=tocS[0]; var setShowToc=tocS[1];

  var sections=[];
  // Build sections from guide data
  sections.push("description");
  if(guide.why_it_matters) sections.push("why_it_matters");
  if(guide.anatomy) sections.push("anatomy");
  if(guide.technique) sections.push("technique");
  if(guide.prerequisites) sections.push("prerequisites");
  if(guide.common_mistakes) sections.push("common_mistakes");
  if(guide.progressions) sections.push("progressions");
  if(guide.mindset) sections.push("mindset");
  if(guide.programming_guidelines) sections.push("programming");
  if(guide.volume_guidelines) sections.push("volume");
  if(guide.frequency_guidelines) sections.push("frequency");
  if(guide.warmup) sections.push("warmup");
  if(guide.warning_flags) sections.push("warnings");
  if(guide.equipment_options) sections.push("equipment");
  if(guide.variants) sections.push("variants");
  if(guide.readiness_tests) sections.push("tests");
  if(guide.faq) sections.push("faq");
  if(guide.glossary) sections.push("glossary");

  var SECTION_LABELS={
    description:"Présentation",why_it_matters:"Pourquoi c'est important",anatomy:"Anatomie",
    technique:"Technique",prerequisites:"Prérequis",common_mistakes:"Erreurs fréquentes",
    progressions:"Progressions",mindset:"Approche mentale",programming:"Programmation",
    volume:"Volume & repos",frequency:"Fréquence",warmup:"Échauffement",warnings:"Points de vigilance",
    equipment:"Matériel",variants:"Variantes",tests:"Tests de niveau",faq:"FAQ",glossary:"Glossaire"
  };
  var SECTION_ICONS={
    description:"📖",why_it_matters:"🎯",anatomy:"🦴",technique:"⚙️",prerequisites:"✅",
    common_mistakes:"⚠️",progressions:"📈",mindset:"🧠",programming:"📋",volume:"⏱",
    frequency:"📅",warmup:"🔥",warnings:"🚨",equipment:"🔧",variants:"✦",tests:"🏆",faq:"❓",glossary:"📚"
  };

  var diffMin=guide.difficulty_range?guide.difficulty_range[0]:0;
  var diffMax=guide.difficulty_range?guide.difficulty_range[1]:10;

  return e("div",{style:{position:"absolute",inset:0,background:T.bg,zIndex:50,display:"flex",
    flexDirection:"column",animation:"fadeIn 0.3s ease"}},

    // Header
    e("div",{style:{minHeight:130,background:"linear-gradient(180deg,"+(guide.color||T.accent)+"18 0%,"+T.bg+" 100%)",
      padding:"48px 20px 14px",position:"relative",flexShrink:0}},
      e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        e("button",{onClick:onClose,style:{background:T.elevated,border:"1px solid "+T.border,
          borderRadius:100,padding:"6px 14px",fontSize:12,color:T.textSec,cursor:"pointer",fontWeight:600}},"← Retour"),
        e("button",{onClick:function(){setShowToc(!showToc);},style:{background:T.elevated,border:"1px solid "+T.border,
          borderRadius:100,padding:"6px 14px",fontSize:12,color:T.accent,cursor:"pointer",fontWeight:600}},
          showToc?"✕ Fermer":"☰ Sommaire")),
      e("div",{style:{display:"flex",alignItems:"center",gap:10}},
        e("span",{style:{fontSize:28}},guide.icon||"◆"),
        e("div",{},
          e("div",{style:{fontSize:11,fontWeight:700,color:guide.color||T.accent,letterSpacing:1.5}},
            (guide.category||"").toUpperCase()),
          e("div",{style:{fontSize:24,fontWeight:900,color:T.text,lineHeight:1.1,marginTop:2}},guide.title))),
      e("div",{style:{display:"flex",gap:8,marginTop:10,alignItems:"center"}},
        e("div",{style:{flex:1,height:4,background:T.border,borderRadius:2,overflow:"hidden"}},
          e("div",{style:{height:"100%",width:(diffMax*10)+"%",
            background:"linear-gradient(90deg,"+T.accent+","+(guide.color||T.accent)+")",borderRadius:2}})),
        e("span",{style:{fontSize:10,color:T.textTert,fontWeight:600}},diffMin+"-"+diffMax+"/10"))),

    // TOC overlay
    showToc&&e("div",{style:{position:"absolute",top:130,left:0,right:0,bottom:0,
      background:T.bg+"F5",zIndex:5,padding:"16px 20px",overflowY:"auto"}},
      e("div",{style:{fontSize:16,fontWeight:800,color:T.text,marginBottom:14}},"Sommaire"),
      sections.map(function(s,i){
        return e("button",{key:s,onClick:function(){setShowToc(false);
          setTimeout(function(){var el=document.getElementById("gsec-"+s);if(el)el.scrollIntoView({behavior:"smooth"});},100);},
          style:{display:"flex",gap:10,alignItems:"center",padding:"10px 12px",
            width:"100%",background:"none",border:"none",cursor:"pointer",textAlign:"left",
            borderBottom:"1px solid "+T.border}},
          e("span",{style:{fontSize:14}},SECTION_ICONS[s]||"•"),
          e("span",{style:{fontSize:13,color:T.text,fontWeight:600}},SECTION_LABELS[s]||s),
          e("span",{style:{fontSize:11,color:T.textTert,marginLeft:"auto"}},(i+1)));
      })),

    // Content
    e("div",{style:{flex:1,overflowY:"auto",padding:"0 16px 100px",display:"flex",flexDirection:"column",gap:14}},

      // Description
      e("div",{id:"gsec-description"},
        e(GSection,{title:"Présentation",icon:"📖",defaultOpen:true},
          e(GProse,null,guide.description))),

      // Why it matters
      guide.why_it_matters&&e("div",{id:"gsec-why_it_matters"},
        e(GSection,{title:"Pourquoi c'est important",icon:"🎯",defaultOpen:true},
          e(GProse,null,guide.why_it_matters))),

      // Anatomy
      guide.anatomy&&e("div",{id:"gsec-anatomy"},
        e(GSection,{title:"Anatomie & Muscles",icon:"🦴"},
          guide.anatomy.primary&&e("div",{style:{marginBottom:10}},
            e("div",{style:{fontSize:11,fontWeight:700,color:T.accent,marginBottom:6}},"MUSCLES PRINCIPAUX"),
            e("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
              guide.anatomy.primary.map(function(m){return e(GBadge,{key:m,color:guide.color},m);}))),
          guide.anatomy.secondary&&e("div",{style:{marginBottom:10}},
            e("div",{style:{fontSize:11,fontWeight:700,color:T.textTert,marginBottom:6}},"MUSCLES SECONDAIRES"),
            e("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
              guide.anatomy.secondary.map(function(m){return e(GBadge,{key:m,color:T.textSec},m);}))),
          guide.anatomy.key_insight&&e("div",{style:{background:T.accentGlow,border:"1px solid "+T.accentBorder,
            borderRadius:14,padding:"12px 14px",marginTop:6}},
            e("div",{style:{fontSize:12,color:T.accent,lineHeight:1.6}},
              "💡 ",guide.anatomy.key_insight)))),

      // Technique
      guide.technique&&e("div",{id:"gsec-technique"},
        e(GSection,{title:"Technique",icon:"⚙️"},
          guide.technique.form_principles&&e("div",{style:{display:"flex",flexDirection:"column",gap:10}},
            guide.technique.form_principles.map(function(p,i){
              return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px"}},
                e("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}},p.name),
                e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.6}},p.detail));
            })),
          guide.technique.grip_options&&e("div",{style:{marginTop:12}},
            e("div",{style:{fontSize:11,fontWeight:700,color:T.accent,marginBottom:8}},"PRISES / SUPPORTS"),
            guide.technique.grip_options.map(function(g,i){
              return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
                e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
                  e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},g.name),
                  g.difficulty&&e("span",{style:{fontSize:10,color:T.textTert}},"Niveau: "+g.difficulty+"/4")),
                e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.6,marginTop:4}},g.detail));
            })),
          guide.technique.breathing&&e("div",{style:{background:"rgba(200,241,53,0.06)",border:"1px solid rgba(200,241,53,0.15)",
            borderRadius:14,padding:"12px 14px",marginTop:10}},
            e("div",{style:{fontSize:12,fontWeight:700,color:T.lime,marginBottom:4}},"🫁 Respiration"),
            e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.6}},guide.technique.breathing)),
          // Entries (OAP)
          guide.technique.entries&&e("div",{style:{marginTop:12}},
            e("div",{style:{fontSize:11,fontWeight:700,color:T.accent,marginBottom:8}},"ENTRÉES DANS LE MOUVEMENT"),
            guide.technique.entries.map(function(ent,i){
              return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
                e("div",{style:{display:"flex",justifyContent:"space-between"}},
                  e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},ent.name),
                  e("span",{style:{fontSize:10,color:T.textTert}},ent.difficulty)),
                ent.steps&&e("div",{style:{marginTop:8,display:"flex",flexDirection:"column",gap:6}},
                  ent.steps.map(function(s,j){
                    return e("div",{key:j,style:{display:"flex",gap:8,alignItems:"flex-start"}},
                      e("span",{style:{fontSize:11,fontWeight:700,color:T.accent,flexShrink:0,
                        width:18,textAlign:"center"}},(j+1)),
                      e("span",{style:{fontSize:12,color:T.textSec,lineHeight:1.5}},s));
                  })));
            })))),

      // Prerequisites
      guide.prerequisites&&e("div",{id:"gsec-prerequisites"},
        e(GSection,{title:"Prérequis",icon:"✅"},
          guide.prerequisites.map(function(p,i){
            return e(GBullet,{key:i,bullet:p.critical?"●":"○",
              color:p.critical?T.lime:T.textTert},
              e("span",null,p.name,
                e("span",{style:{fontSize:11,color:T.textTert,marginLeft:6}},"("+p.category+")")));
          }))),

      // Common mistakes
      guide.common_mistakes&&e("div",{id:"gsec-common_mistakes"},
        e(GSection,{title:"Erreurs fréquentes",icon:"⚠️"},
          guide.common_mistakes.map(function(m,i){
            var sevCol=m.severity==="haute"||m.severity==="CRITIQUE"?T.red:
              m.severity==="moyenne"?T.warn:T.textTert;
            return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"14px",marginBottom:8}},
              e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}},
                e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},m.name),
                e(GBadge,{color:sevCol},m.severity)),
              e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.5,marginBottom:8}},m.description),
              m.fix&&e("div",{style:{background:T.accentGlow,borderRadius:10,padding:"8px 12px"}},
                e("span",{style:{fontSize:11,fontWeight:600,color:T.accent}},"✦ Correction : "),
                e("span",{style:{fontSize:11,color:T.textSec}},m.fix)));
          }))),

      // Progressions
      guide.progressions&&e("div",{id:"gsec-progressions"},
        e(GSection,{title:"Progressions",icon:"📈",defaultOpen:true},
          guide.progressions.map(function(p,i){
            return e("div",{key:i,style:{background:T.card,border:"1px solid "+T.border,
              borderRadius:18,padding:"16px",marginBottom:10}},
              e("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:8}},
                e("div",{style:{width:28,height:28,borderRadius:8,
                  background:(guide.color||T.accent)+"22",display:"flex",alignItems:"center",justifyContent:"center"}},
                  e("span",{style:{fontSize:12,fontWeight:900,color:guide.color||T.accent}},
                    typeof p.level==="number"?p.level:i)),
                e("div",{style:{flex:1}},
                  e("div",{style:{fontSize:14,fontWeight:700,color:T.text}},p.name),
                  p.target&&e("div",{style:{fontSize:11,color:T.accent,marginTop:2}},"🎯 "+p.target))),
              p.description&&e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.6,marginBottom:8}},p.description),
              p.exercises&&e("div",{style:{display:"flex",flexDirection:"column",gap:4}},
                p.exercises.map(function(ex,j){
                  var exObj=typeof ex==="string"?{name:ex}:ex;
                  return e("div",{key:j,style:{display:"flex",gap:8,alignItems:"center",
                    padding:"6px 10px",background:T.elevated,borderRadius:10}},
                    e("span",{style:{fontSize:11,color:T.accent}},"▸"),
                    e("span",{style:{fontSize:12,fontWeight:600,color:T.text,flex:1}},exObj.name),
                    exObj.reps&&e("span",{style:{fontSize:10,color:T.textTert}},exObj.reps));
                })),
              p.combos&&e("div",{style:{marginTop:8}},
                e("div",{style:{fontSize:11,fontWeight:700,color:T.accent,marginBottom:6}},"COMBOS"),
                p.combos.map(function(c,j){
                  return e("div",{key:j,style:{fontSize:11,color:T.textSec,lineHeight:1.6,
                    padding:"6px 10px",background:T.elevated,borderRadius:10,marginBottom:4}},
                    "⟫ "+c);
                })),
              p.methods&&e("div",{style:{marginTop:8}},
                e("div",{style:{fontSize:11,fontWeight:700,color:T.accent,marginBottom:6}},"MÉTHODES D'ENTRAÎNEMENT"),
                p.methods.map(function(m,j){
                  return e("div",{key:j,style:{background:T.elevated,borderRadius:10,padding:"10px 12px",marginBottom:6}},
                    e("div",{style:{fontSize:12,fontWeight:700,color:T.text}},m.name),
                    e("div",{style:{fontSize:11,color:T.textSec,lineHeight:1.5,marginTop:3}},m.detail));
                })));
          }))),

      // Mindset
      guide.mindset&&e("div",{id:"gsec-mindset"},
        e(GSection,{title:"Approche mentale",icon:"🧠"},
          Object.entries(guide.mindset).map(function(entry,i){
            return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
              e("div",{style:{fontSize:12,fontWeight:700,color:T.accent,marginBottom:4,textTransform:"capitalize"}},
                entry[0].replace(/_/g," ")),
              e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.6}},entry[1]));
          }))),

      // Programming
      guide.programming_guidelines&&e("div",{id:"gsec-programming"},
        e(GSection,{title:"Programmation",icon:"📋"},
          Object.entries(guide.programming_guidelines).map(function(entry,i){
            var val=entry[1];
            if(typeof val==="object"&&val!==null&&!Array.isArray(val)){
              return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
                e("div",{style:{fontSize:12,fontWeight:700,color:T.accent,marginBottom:4,textTransform:"capitalize"}},
                  entry[0].replace(/_/g," ")),
                Object.entries(val).map(function(sub,j){
                  return e("div",{key:j,style:{fontSize:12,color:T.textSec,lineHeight:1.5}},
                    e("strong",{style:{color:T.text}},sub[0].replace(/_/g," ")+": "),sub[1]);
                }));
            }
            return e(GBullet,{key:i,bullet:"◆",color:T.accent},
              e("span",null,e("strong",{style:{color:T.text}},entry[0].replace(/_/g," ")+": "),
                typeof val==="string"?val:JSON.stringify(val)));
          }))),

      // Volume
      guide.volume_guidelines&&e("div",{id:"gsec-volume"},
        e(GSection,{title:"Volume & Temps de repos",icon:"⏱"},
          Object.entries(guide.volume_guidelines).map(function(entry,i){
            return e(GBullet,{key:i,bullet:"⏱",color:T.lime},
              e("span",null,e("strong",{style:{color:T.text}},entry[0].replace(/_/g," ")+": "),entry[1]));
          }))),

      // Frequency
      guide.frequency_guidelines&&e("div",{id:"gsec-frequency"},
        e(GSection,{title:"Fréquence d'entraînement",icon:"📅"},
          Object.entries(guide.frequency_guidelines).map(function(entry,i){
            var val=entry[1];
            if(Array.isArray(val)){
              return e("div",{key:i,style:{marginBottom:6}},
                e("div",{style:{fontSize:12,fontWeight:700,color:T.text,marginBottom:4,textTransform:"capitalize"}},
                  entry[0].replace(/_/g," ")),
                val.map(function(v,j){return e(GBullet,{key:j,bullet:"•",color:T.warn},v);}));
            }
            if(typeof val==="boolean") return null;
            return e(GBullet,{key:i,bullet:"📅",color:T.accent},
              e("span",null,e("strong",{style:{color:T.text}},entry[0].replace(/_/g," ")+": "),
                String(val)));
          }))),

      // Warmup
      guide.warmup&&e("div",{id:"gsec-warmup"},
        e(GSection,{title:"Échauffement",icon:"🔥"},
          guide.warmup.structure&&guide.warmup.structure.map(function(phase,i){
            return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
              e("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:6}},
                e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},phase.phase),
                phase.duration&&e("span",{style:{fontSize:11,color:T.textTert}},phase.duration)),
              phase.items&&e("div",{style:{display:"flex",flexDirection:"column",gap:3}},
                phase.items.map(function(it,j){
                  return e("div",{key:j,style:{fontSize:12,color:T.textSec}},"• "+it);
                })));
          }),
          guide.warmup.key_point&&e("div",{style:{background:T.accentGlow,border:"1px solid "+T.accentBorder,
            borderRadius:14,padding:"12px 14px",marginTop:6}},
            e("div",{style:{fontSize:12,color:T.accent,lineHeight:1.5}},"💡 "+guide.warmup.key_point)),
          guide.warmup.duration_total&&e("div",{style:{fontSize:12,color:T.textTert,marginTop:4}},
            "⏱ Durée totale : "+guide.warmup.duration_total))),

      // Warnings
      guide.warning_flags&&e("div",{id:"gsec-warnings"},
        e(GSection,{title:"Points de vigilance",icon:"🚨"},
          guide.warning_flags.map(function(w,i){
            return e("div",{key:i,style:{background:"rgba(255,69,58,0.06)",border:"1px solid rgba(255,69,58,0.15)",
              borderRadius:14,padding:"12px 14px",marginBottom:8}},
              e("div",{style:{fontSize:13,fontWeight:700,color:T.red,marginBottom:4}},w.flag),
              e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.5}},w.action));
          }))),

      // Equipment
      guide.equipment_options&&e("div",{id:"gsec-equipment"},
        e(GSection,{title:"Matériel & Options",icon:"🔧"},
          guide.equipment_options.map(function(eq,i){
            return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
              e("div",{style:{display:"flex",justifyContent:"space-between"}},
                e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},eq.name),
                e("span",{style:{fontSize:10,color:T.textTert}},eq.when)),
              e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.5,marginTop:4}},eq.advantage));
          }))),

      // Variants
      guide.variants&&e("div",{id:"gsec-variants"},
        e(GSection,{title:"Variantes",icon:"✦"},
          guide.variants.map(function(v,i){
            return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
              e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
                e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},v.name),
                e("div",{style:{display:"flex",gap:6}},
                  v.type&&e(GBadge,{color:T.textSec},v.type),
                  v.difficulty&&e(GBadge,{color:T.accent},v.difficulty+"/10"))),
              v.description&&e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.5,marginTop:6}},v.description));
          }))),

      // Readiness tests
      guide.readiness_tests&&e("div",{id:"gsec-tests"},
        e(GSection,{title:"Tests de niveau",icon:"🏆"},
          guide.readiness_tests.map(function(t,i){
            return e("div",{key:i,style:{display:"flex",gap:10,alignItems:"center",
              padding:"10px 14px",background:T.card,borderRadius:14,marginBottom:6}},
              e("div",{style:{width:28,height:28,borderRadius:8,background:T.accentGlow,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}},
                e("span",{style:{fontSize:11,fontWeight:800,color:T.accent}},t.level_unlocked)),
              e("div",{},
                e("div",{style:{fontSize:12,fontWeight:700,color:T.text}},t.name),
                e("div",{style:{fontSize:11,color:T.textSec,marginTop:2}},t.description)));
          }))),

      // FAQ
      guide.faq&&e("div",{id:"gsec-faq"},
        e(GSection,{title:"FAQ",icon:"❓"},
          guide.faq.map(function(f,i){
            return e("div",{key:i,style:{background:T.card,borderRadius:14,padding:"12px 14px",marginBottom:8}},
              e("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:6}},f.q),
              e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.6}},f.a));
          }))),

      // Glossary
      guide.glossary&&e("div",{id:"gsec-glossary"},
        e(GSection,{title:"Glossaire",icon:"📚"},
          e("div",{style:{display:"flex",flexDirection:"column",gap:4}},
            guide.glossary.map(function(g,i){
              return e("div",{key:i,style:{display:"flex",gap:10,padding:"6px 0",
                borderBottom:"1px solid "+T.border}},
                e("span",{style:{fontSize:12,fontWeight:700,color:T.accent,minWidth:80}},g.term),
                e("span",{style:{fontSize:12,color:T.textSec}},g.def));
            })))),

      // Summary
      guide.summary&&e("div",{style:{background:"linear-gradient(135deg,"+(guide.color||T.accent)+"12 0%,"+T.card+" 100%)",
        border:"1px solid "+(guide.color||T.accent)+"28",borderRadius:18,padding:"16px 18px",marginTop:4}},
        e("div",{style:{fontSize:12,fontWeight:700,color:guide.color||T.accent,marginBottom:6}},"📌 En résumé"),
        e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.7}},guide.summary))
    ));
}

// ─── STATE FACTORY ────────────────────────────────────────────────────────────
function mkState(){
  return {
    v: 5, onboardingDone: false,
    profile: {
      firstName:"", age:"", height:"", weight:"", level:"", goal:"", freq:"",
      sessionLength:"moyenne", trainingMode:"pdc", focus:"full_body",
      equipment: [], movements: {},
      notifications: { workoutReminder: true, weeklyReport: true, tips: false }
    },
    sub: { status:"free", plan:null, trialStart:null },
    stats: { sessions:0, minutes:0, streak:0, bestStreak:0, lastDate:null },
    history: [],
    skills: [
      {name:"Muscle-Up",  step:0, total:6, icon:"👑"},
      {name:"Front Lever",step:0, total:5, icon:"⭐"},
      {name:"Handstand",  step:0, total:7, icon:"🤸"},
      {name:"Planche",    step:0, total:6, icon:"⚡"},
    ],
  };
}

// ─── EXERCISE DATABASE (rebalanced freemium) ─────────────────────────────────
const EX_DB = {
  Push:[
    {name:"Pompes",            level:"Débutant",      pro:false, muscles:"Pectoraux · Triceps · Gainage", equip:[]},
    {name:"Pompes diamant",    level:"Débutant",      pro:false, muscles:"Triceps · Pectoraux internes", equip:[]},
    {name:"Pike push-up",      level:"Débutant",      pro:false, muscles:"Deltoïdes · Triceps", equip:[]},
    {name:"Dips",              level:"Intermédiaire", pro:false, muscles:"Pectoraux · Triceps · Deltoïdes ant.", equip:["barre"]},
    {name:"Pseudo planche push-up", level:"Intermédiaire", pro:false, muscles:"Pectoraux · Dentelé · Deltoïdes ant.", equip:[]},
    {name:"Dips lestés",       level:"Avancé",        pro:true,  muscles:"Pectoraux · Triceps · Force poussée", equip:["barre","ceinture_lest"]},
    {name:"Pike push-up surélevé", level:"Intermédiaire", pro:false, muscles:"Deltoïdes · Triceps · Haut pectoraux", equip:[]},
    {name:"Pompes anneaux",    level:"Intermédiaire", pro:true,  muscles:"Pectoraux · Stabilisateurs · Triceps", equip:["anneaux"]},
  ],
  Pull:[
    {name:"Rowing inversé",    level:"Débutant",      pro:false, muscles:"Dorsal · Biceps · Rhomboïdes", equip:["barre"]},
    {name:"Tractions pronation",level:"Intermédiaire", pro:false, muscles:"Grand dorsal · Biceps · Core", equip:["barre"]},
    {name:"Tractions supination",level:"Intermédiaire", pro:false, muscles:"Biceps · Grand dorsal", equip:["barre"]},
    {name:"Tractions scapulaires",level:"Débutant",    pro:false, muscles:"Trapèze inf. · Rhomboïdes · Scapulaire", equip:["barre"]},
    {name:"High pull-up explosif",level:"Avancé",      pro:false, muscles:"Grand dorsal · Deltoïdes · Explosivité", equip:["barre"]},
    {name:"Tractions lestées",  level:"Avancé",        pro:true,  muscles:"Grand dorsal · Biceps · Force tirage", equip:["barre","ceinture_lest"]},
    {name:"Rowing inversé (anneaux)", level:"Intermédiaire", pro:true, muscles:"Dorsal · Biceps · Stabilisateurs", equip:["anneaux"]},
  ],
  Core:[
    {name:"Gainage creux (hollow)",  level:"Débutant",      pro:false, muscles:"Transverse · Fléchisseurs hanche · Gainage ant.", equip:[]},
    {name:"Relevés de jambes suspendus", level:"Intermédiaire", pro:false, muscles:"Abdominaux inf. · Fléchisseurs hanche", equip:["barre"]},
    {name:"L-sit groupé",      level:"Débutant",      pro:false, muscles:"Abdominaux · Fléchisseurs hanche · Compression", equip:["parallettes"]},
    {name:"L-sit",             level:"Intermédiaire", pro:false, muscles:"Abdominaux · Fléchisseurs hanche · Compression", equip:["parallettes"]},
    {name:"Dragon flag",       level:"Avancé",        pro:true,  muscles:"Gainage complet · Anti-extension", equip:[]},
    {name:"V-sit progression", level:"Avancé",        pro:true,  muscles:"Compression avancée · Fléchisseurs hanche", equip:["parallettes"]},
  ],
  Skills:[
    {name:"Tuck planche",      level:"Intermédiaire", pro:false, muscles:"Deltoïdes ant. · Dentelé · Triceps", equip:["parallettes"]},
    {name:"Handstand mur",     level:"Débutant",      pro:false, muscles:"Épaules · Gainage · Équilibre", equip:[]},
    {name:"Tuck front lever",  level:"Intermédiaire", pro:false, muscles:"Grand dorsal · Gainage · Scapulaire", equip:["barre"]},
    {name:"Muscle-up barre",   level:"Avancé",        pro:false, muscles:"Grand dorsal · Pectoraux · Transition", equip:["barre"]},
    {name:"Planche lean",      level:"Débutant",      pro:false, muscles:"Deltoïdes ant. · Dentelé · Poignets", equip:[]},
    {name:"Dips barre droite", level:"Intermédiaire", pro:false, muscles:"Triceps · Deltoïdes · Transition", equip:["barre"]},
    {name:"Straddle planche",  level:"Avancé",        pro:true,  muscles:"Deltoïdes ant. · Corps entier · Bras tendus", equip:["parallettes"]},
    {name:"Full front lever",  level:"Avancé",        pro:true,  muscles:"Grand dorsal · Gainage · Force isométrique", equip:["barre"]},
    {name:"Handstand libre",   level:"Avancé",        pro:true,  muscles:"Épaules · Gainage · Proprioception", equip:[]},
    {name:"Suspension false grip", level:"Intermédiaire", pro:false, muscles:"Avant-bras · Fléchisseurs poignet", equip:["barre"]},
  ],
};

// ─── PROGRAMS (rebalanced: more free content) ────────────────────────────────
const PROGRAMS = [
  { id:"p1", name:"Fondations PDC", tagline:"4 semaines de bases solides au poids du corps",
    level:"Débutant", weeks:4, sessionsPerWeek:3, avgMin:40, pro:false, color:T.accent, icon:"🏗",
    sessions:[
      { name:"Jour 1 — Poussée + Gainage", ex:[
        {name:"Pompes",cat:"Push",sets:3,reps:"10-12",rest:60},
        {name:"Pike push-up",cat:"Push",sets:3,reps:"8",rest:60},
        {name:"Pompes diamant",cat:"Push",sets:3,reps:"8",rest:60},
        {name:"Gainage creux (hollow)",cat:"Core",sets:3,reps:"20s",rest:45}]},
      { name:"Jour 2 — Tirage + Gainage", ex:[
        {name:"Rowing inversé",cat:"Pull",sets:4,reps:"10",rest:60},
        {name:"Tractions scapulaires",cat:"Pull",sets:3,reps:"10",rest:60},
        {name:"Relevés de jambes suspendus",cat:"Core",sets:3,reps:"8",rest:45},
        {name:"Suspension false grip",cat:"Skills",sets:3,reps:"15s",rest:45}]},
      { name:"Jour 3 — Complet + Figures", ex:[
        {name:"Pompes",cat:"Push",sets:3,reps:"12",rest:60},
        {name:"Rowing inversé",cat:"Pull",sets:3,reps:"12",rest:60},
        {name:"Planche lean",cat:"Skills",sets:4,reps:"15s",rest:60},
        {name:"L-sit groupé",cat:"Core",sets:3,reps:"15s",rest:45}]},
    ]},
  { id:"p2", name:"Poussée-Tirage Équilibre", tagline:"Structure poussée/tirage pour une progression équilibrée",
    level:"Débutant", weeks:6, sessionsPerWeek:4, avgMin:45, pro:false, color:T.pull, icon:"🔄",
    sessions:[
      { name:"Séance Poussée A", ex:[
        {name:"Dips",cat:"Push",sets:3,reps:"8",rest:90},
        {name:"Pike push-up",cat:"Push",sets:3,reps:"10",rest:60},
        {name:"Pseudo planche push-up",cat:"Push",sets:3,reps:"6",rest:90},
        {name:"Gainage creux (hollow)",cat:"Core",sets:3,reps:"30s",rest:45}]},
      { name:"Séance Tirage A", ex:[
        {name:"Tractions pronation",cat:"Pull",sets:4,reps:"5-8",rest:120},
        {name:"Rowing inversé",cat:"Pull",sets:3,reps:"12",rest:60},
        {name:"Tractions scapulaires",cat:"Pull",sets:3,reps:"10",rest:60},
        {name:"L-sit groupé",cat:"Core",sets:3,reps:"15s",rest:45}]},
    ]},
  { id:"p3", name:"Prépa Muscle-Up", tagline:"Construis l'explosivité et la transition",
    level:"Intermédiaire", weeks:8, sessionsPerWeek:4, avgMin:50, pro:false, color:T.gold, icon:"👑",
    sessions:[
      { name:"Séance Explosivité tirage", ex:[
        {name:"Tractions pronation",cat:"Pull",sets:5,reps:"5",rest:120},
        {name:"High pull-up explosif",cat:"Pull",sets:4,reps:"3-4",rest:120},
        {name:"Dips barre droite",cat:"Skills",sets:4,reps:"6-8",rest:90},
        {name:"Suspension false grip",cat:"Skills",sets:4,reps:"10-15s",rest:60}]},
      { name:"Séance Transition + Force", ex:[
        {name:"Tractions pronation",cat:"Pull",sets:4,reps:"8",rest:90},
        {name:"Dips barre droite",cat:"Skills",sets:4,reps:"8",rest:90},
        {name:"Rowing inversé",cat:"Pull",sets:3,reps:"12",rest:60},
        {name:"Gainage creux (hollow)",cat:"Core",sets:3,reps:"30s",rest:45}]},
    ]},
  { id:"p4", name:"Front Lever — Fondations", tagline:"Construis la force de tirage horizontale",
    level:"Intermédiaire", weeks:10, sessionsPerWeek:3, avgMin:50, pro:false, color:T.pull, icon:"⭐",
    sessions:[
      { name:"Séance Levier", ex:[
        {name:"Tuck front lever",cat:"Skills",sets:4,reps:"8-10s",rest:120},
        {name:"Tractions pronation",cat:"Pull",sets:4,reps:"6-8",rest:90},
        {name:"Rowing inversé",cat:"Pull",sets:3,reps:"12",rest:60},
        {name:"Gainage creux (hollow)",cat:"Core",sets:3,reps:"30s",rest:45}]},
    ]},
  { id:"p5", name:"Progression Handstand", tagline:"De la première inversion à l'équilibre libre",
    level:"Intermédiaire", weeks:12, sessionsPerWeek:5, avgMin:30, pro:true, color:"#A78BFA", icon:"🤸",
    sessions:[
      { name:"Séance Inversion", ex:[
        {name:"Handstand mur",cat:"Skills",sets:5,reps:"30s",rest:60},
        {name:"Pike push-up surélevé",cat:"Push",sets:3,reps:"8",rest:90},
        {name:"Gainage creux (hollow)",cat:"Core",sets:3,reps:"30s",rest:45}]},
    ]},
  { id:"p6", name:"Planche — Force brute", tagline:"La figure ultime, bras tendus",
    level:"Avancé", weeks:16, sessionsPerWeek:4, avgMin:60, pro:true, color:T.push, icon:"⚡",
    sessions:[
      { name:"Séance Planche", ex:[
        {name:"Pseudo planche push-up",cat:"Push",sets:4,reps:"5",rest:120},
        {name:"Tuck planche",cat:"Skills",sets:5,reps:"8s",rest:150},
        {name:"Dips",cat:"Push",sets:4,reps:"10",rest:90}]},
    ]},
  { id:"p7", name:"Force lestée", tagline:"Tractions et dips lestés pour la force pure",
    level:"Avancé", weeks:8, sessionsPerWeek:4, avgMin:55, pro:true, color:T.red, icon:"🏋️",
    sessions:[
      { name:"Séance Tirage lourd", ex:[
        {name:"Tractions lestées",cat:"Pull",sets:5,reps:"3-5",rest:180},
        {name:"Tractions pronation",cat:"Pull",sets:3,reps:"max",rest:120},
        {name:"Rowing inversé",cat:"Pull",sets:3,reps:"12",rest:60}]},
    ]},
  { id:"p8", name:"Figures combinées", tagline:"Handstand + Planche + Front Lever en parallèle",
    level:"Avancé", weeks:12, sessionsPerWeek:5, avgMin:60, pro:true, color:T.gold, icon:"🔥",
    sessions:[
      { name:"Séance Figures", ex:[
        {name:"Handstand mur",cat:"Skills",sets:4,reps:"30s",rest:90},
        {name:"Tuck planche",cat:"Skills",sets:4,reps:"8s",rest:120},
        {name:"Tuck front lever",cat:"Skills",sets:4,reps:"8s",rest:120}]},
    ]},
];

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function Btn(props){
  var label=props.label; var onClick=props.onClick; var disabled=props.disabled;
  var ghost=props.ghost; var danger=props.danger; var small=props.small;
  var full=props.full!==false;
  var bg=disabled?T.border:ghost?"transparent":danger?T.red+"18":"linear-gradient(135deg,"+T.accent+" 0%,"+T.accentDeep+" 100%)";
  var col=disabled?T.textTert:ghost?T.textSec:danger?T.red:"#fff";
  var bdr=ghost?"1px solid "+T.border:danger?"1px solid "+T.red+"40":"none";
  var h = small ? "40px" : "50px";
  return e("button",{onClick:onClick,disabled:disabled,style:{
    background:bg,color:col,border:bdr,borderRadius:100,
    height:h,padding:small?"0 20px":"0 28px",fontSize:small?13:15,
    fontWeight:700,letterSpacing:0.3,cursor:disabled?"default":"pointer",
    width:full?"100%":"auto",opacity:disabled?.55:1,
    display:"flex",alignItems:"center",justifyContent:"center",gap:6,
    transition:"opacity 0.15s,transform 0.1s",WebkitTapHighlightColor:"transparent"
  }},label);
}
function GoldBtn(props){
  return e("button",{onClick:props.onClick,disabled:props.loading,style:{
    background:"linear-gradient(135deg,"+T.gold+" 0%,"+T.goldDim+" 100%)",
    color:"#fff",border:"none",borderRadius:100,height:50,padding:"0 28px",
    fontSize:15,fontWeight:700,cursor:props.loading?"default":"pointer",
    width:"100%",opacity:props.loading?.7:1,letterSpacing:0.3,
    display:"flex",alignItems:"center",justifyContent:"center"
  }},props.loading?"Traitement...":props.label);
}
function ProBadge(){
  return e("span",{style:{fontSize:9,fontWeight:700,color:T.gold,
    background:"rgba(212,168,67,0.12)",border:"1px solid rgba(212,168,67,0.28)",
    padding:"3px 9px",borderRadius:100,whiteSpace:"nowrap",letterSpacing:0.5
  }},"PRO");
}
function SecTitle(props){
  return e("div",{style:{fontSize:12,fontWeight:700,color:T.accentLight,
    letterSpacing:1.5,marginBottom:14,textTransform:"uppercase"}},props.t);
}
function Tag(props){
  return e("span",{style:{fontSize:10,fontWeight:600,color:props.color||T.accent,
    background:(props.color||T.accent)+"15",borderRadius:100,
    padding:"3px 10px",letterSpacing:0.5,whiteSpace:"nowrap"}},props.label);
}
function StatCard(props){
  return e("div",{style:{background:T.elevated,border:"1px solid "+T.border,
    borderRadius:18,padding:"16px 14px",display:"flex",flexDirection:"column",gap:4}},
    e("div",{style:{fontSize:16,marginBottom:2,lineHeight:1}},props.icon),
    e("div",{style:{fontSize:26,fontWeight:900,color:props.value?T.text:T.textTert,
      lineHeight:1,letterSpacing:-0.5}},props.value||"–"),
    e("div",{style:{fontSize:10,color:T.textTert,letterSpacing:0.5,marginTop:2}},props.label));
}
function Pill(props){
  return e("div",{style:{background:T.elevated,border:"1px solid "+T.border,
    borderRadius:16,padding:"14px 8px",textAlign:"center",display:"flex",
    flexDirection:"column",gap:4}},
    e("div",{style:{fontSize:16,lineHeight:1}},props.icon),
    e("div",{style:{fontSize:18,fontWeight:800,color:props.value?T.text:T.textTert,
      letterSpacing:-0.3}},props.value||"–"),
    e("div",{style:{fontSize:10,color:T.textTert}},props.unit));
}
function EmptyState(props){
  return e("div",{style:{background:T.elevated,border:"1px solid "+T.border,
    borderRadius:24,padding:"40px 28px",textAlign:"center",
    display:"flex",flexDirection:"column",alignItems:"center",gap:12}},
    e("div",{style:{fontSize:48,marginBottom:4,opacity:0.7}},props.icon),
    e("div",{style:{fontSize:18,fontWeight:800,color:T.text,lineHeight:1.2}},props.title),
    e("div",{style:{fontSize:13,color:T.textTert,lineHeight:1.7,maxWidth:260}},props.sub));
}
function Inp(props){
  var s=useState(false); var focused=s[0]; var setFocused=s[1];
  return e("div",{style:{display:"flex",flexDirection:"column",gap:7}},
    props.label&&e("label",{style:{fontSize:11,fontWeight:700,color:T.textSec,
      letterSpacing:1,textTransform:"uppercase"}},props.label),
    e("div",{style:{position:"relative"}},
      e("input",{type:props.type||"text",value:props.value,onChange:props.onChange,
        placeholder:props.placeholder,
        onFocus:function(){setFocused(true);},onBlur:function(){setFocused(false);},
        style:{background:T.elevated,border:"1px solid "+(focused?T.accent:T.border),
          borderRadius:16,padding:props.suffix?"16px 48px 16px 18px":"16px 18px",
          fontSize:16,color:T.text,width:"100%",outline:"none",
          transition:"border-color 0.2s",boxShadow:focused?"0 0 0 3px "+T.accentGlow:"none"}}),
      props.suffix&&e("span",{style:{position:"absolute",right:16,top:"50%",
        transform:"translateY(-50%)",fontSize:12,color:T.textTert,fontWeight:600}},props.suffix)));
}
function IntensityBadge(props){
  var zone = props.zone;
  var colors = { low:T.warn, medium:T.accent, high:T.red };
  var labels = { low:"Récupération", medium:"Standard", high:"Intensif" };
  var col = colors[zone] || T.accent;
  return e("div",{style:{display:"flex",alignItems:"center",gap:5}},
    e("div",{style:{width:6,height:6,borderRadius:"50%",background:col,boxShadow:"0 0 6px "+col}}),
    e("span",{style:{fontSize:10,fontWeight:700,color:col,letterSpacing:1}},(labels[zone]||"KOVA").toUpperCase()));
}
// Modal wrapper
function Modal(props){
  return e("div",{style:{position:"absolute",inset:0,background:T.bg,zIndex:40,
    overflowY:"auto",animation:"slideUp 0.3s ease"}},
    e("div",{style:{padding:"50px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}},
      e("div",{style:{fontSize:20,fontWeight:900,color:T.text}},props.title),
      e("button",{onClick:props.onClose,style:{background:T.elevated,border:"1px solid "+T.border,
        borderRadius:"50%",width:38,height:38,cursor:"pointer",color:T.textSec,fontSize:16}},"✕")),
    e("div",{style:{padding:"20px 24px 100px"}},props.children));
}
// Selection chip for onboarding
function Chip(props){
  var sel=props.selected;
  return e("button",{onClick:props.onClick,style:{
    background:sel?T.accentGlow:T.elevated,
    border:"1px solid "+(sel?T.accentBorder:T.border),
    borderRadius:14,padding:"10px 16px",fontSize:13,fontWeight:sel?700:500,
    color:sel?T.accent:T.textSec,cursor:"pointer",textAlign:"left",
    transition:"all 0.2s",display:"flex",alignItems:"center",gap:8}},
    sel&&e("span",{style:{fontSize:10}},"✓"),
    props.label);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── ONBOARDING (8 steps — real calisthenics profiling) ──────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function Onboarding(props){
  var onFinish=props.onFinish;
  var ss=useState(0); var step=ss[0]; var setStep=ss[1];
  var ds=useState({
    firstName:"",age:"",height:"",weight:"",level:"",goal:"",freq:"",
    sessionLength:"moyenne",trainingMode:"pdc",focus:"full_body",
    equipment:[],
    movements:{pullups:"",dips:"",pushups:"",hollow:"",handstandWall:"",muscleUp:"jamais",frontLever:"aucune",planche:"aucune"}
  });
  var d=ds[0]; var setD=ds[1];
  function up(k,v){setD(function(x){var n=Object.assign({},x);n[k]=v;return n;});}
  function upMov(k,v){setD(function(x){var n=Object.assign({},x);n.movements=Object.assign({},x.movements);n.movements[k]=v;return n;});}
  function toggleEquip(eq){
    setD(function(x){
      var n=Object.assign({},x);
      var arr=n.equipment.slice();
      var idx=arr.indexOf(eq);
      if(idx>=0)arr.splice(idx,1);else arr.push(eq);
      n.equipment=arr; return n;
    });
  }

  var steps=["intro","identity","body","level","movements","goal","equipment","prefs","ready"];
  var s=steps[step];
  var TOTAL=7; var prog=step===0||s==="ready"?null:step/TOTAL;
  var canNext={
    intro:true,
    identity:d.firstName.trim()&&d.age,
    body:d.height&&d.weight,
    level:d.level,
    movements:d.movements.pushups!=="",
    goal:d.goal,
    equipment:true,
    prefs:d.freq,
    ready:true
  }[s];
  function next(){if(step<steps.length-1)setStep(step+1);else onFinish(d);}
  function back(){if(step>0)setStep(step-1);}

  function wrap(content){
    return e("div",{style:{background:"#000",minHeight:"100vh",display:"flex",
      justifyContent:"center",alignItems:"center",padding:"20px 0",overflowY:"auto"}},
      e("div",{style:{width:375,minHeight:812,background:T.bg,borderRadius:44,overflow:"hidden",
        boxShadow:"0 40px 120px rgba(0,0,0,0.9),0 0 0 1px rgba(139,92,246,0.08)",
        display:"flex",flexDirection:"column",animation:"fadeIn 0.35s ease"}},
        e("div",{style:{height:48,background:T.bg,flexShrink:0,display:"flex",alignItems:"center",padding:"0 28px"}},
          step>0&&step<steps.length-1&&e("button",{onClick:back,style:{background:"none",border:"none",color:T.textTert,fontSize:13,cursor:"pointer",fontWeight:600}},"← Retour")),
        prog!==null&&e("div",{style:{height:3,background:T.border,margin:"0 28px",flexShrink:0,borderRadius:2}},
          e("div",{style:{height:"100%",width:(prog*100)+"%",
            background:"linear-gradient(90deg,"+T.accent+","+T.accentLight+")",
            borderRadius:2,transition:"width 0.5s cubic-bezier(0.4,0,0.2,1)"}})),
        e("div",{style:{flex:1,display:"flex",flexDirection:"column",
          overflowY:"auto",padding:prog!==null?"16px 0 0":0}},content)));
  }

  // STEP 0: Intro
  if(s==="intro") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    alignItems:"center",justifyContent:"center",padding:"40px 28px",gap:40}},
    e("div",{style:{textAlign:"center"}},
      e("div",{style:{fontSize:80,fontWeight:900,color:T.accent,lineHeight:1,
        textShadow:"0 0 80px rgba(139,92,246,0.5),0 0 160px rgba(139,92,246,0.2)"}},"\u039A"),
      e("div",{style:{fontSize:36,fontWeight:900,color:T.text,letterSpacing:12,marginTop:4}},"KOVA"),
      e("div",{style:{fontSize:10,color:T.accentLight,letterSpacing:6,marginTop:8}},
        "PROGRAMMATION CALISTHENICS")),
    e("div",{style:{width:"100%",display:"flex",flexDirection:"column",gap:8}},
      [["Séances IA sur-mesure","Personnalisées selon ton niveau réel"],
       ["Progressions par mouvement","Tractions, planche, handstand, front lever…"],
       ["Matériel & préférences","PDC, lesté, mixte — adapté à ton équipement"],
       ["Suivi intelligent","Streak, stats, historique complet"]].map(function(row){
        return e("div",{key:row[0],style:{display:"flex",gap:12,alignItems:"center",
          background:T.elevated,borderRadius:16,padding:"14px 16px",
          border:"1px solid "+T.border}},
          e("div",{style:{width:28,height:28,background:T.accentGlow,borderRadius:8,
            display:"flex",alignItems:"center",justifyContent:"center",
            color:T.accent,fontSize:14,flexShrink:0}},"✓"),
          e("div",{},
            e("div",{style:{fontSize:13,fontWeight:600,color:T.text}},row[0]),
            e("div",{style:{fontSize:11,color:T.textTert,marginTop:1}},row[1])));
      })),
    e(Btn,{label:"Commencer →",onClick:next})));

  // STEP 1: Identity
  if(s==="identity") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:32}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Bienvenue 👋"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:8,lineHeight:1.6}},"On construit ton profil d'athlète.")),
    e("div",{style:{display:"flex",flexDirection:"column",gap:20}},
      e(Inp,{label:"Prénom ou pseudo",placeholder:"Ex: Marius",value:d.firstName,
        onChange:function(ev){up("firstName",ev.target.value);}}),
      e(Inp,{label:"Âge",placeholder:"25",type:"number",value:d.age,
        onChange:function(ev){up("age",ev.target.value);},suffix:"ans"})),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next,disabled:!canNext})));

  // STEP 2: Body
  if(s==="body") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:32}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Ton physique"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:8}},"Utile pour adapter les charges et la programmation.")),
    e("div",{style:{display:"flex",flexDirection:"column",gap:20}},
      e(Inp,{label:"Taille",placeholder:"175",type:"number",value:d.height,
        onChange:function(ev){up("height",ev.target.value);},suffix:"cm"}),
      e(Inp,{label:"Poids",placeholder:"72",type:"number",value:d.weight,
        onChange:function(ev){up("weight",ev.target.value);},suffix:"kg"})),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next,disabled:!canNext})));

  // STEP 3: Level (macro)
  var LEVELS=[["Débutant","< 6 mois de calisthenics","🌱"],
    ["Intermédiaire","6 mois à 2 ans de pratique","⚡"],
    ["Avancé","2 ans+, bases solides, premières figures","🔥"]];
  if(s==="level") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:28}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Ton niveau général"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:8}},"On affine juste après avec de vraies questions.")),
    e("div",{style:{display:"flex",flexDirection:"column",gap:10}},
      LEVELS.map(function(item){
        var sel=d.level===item[0];
        return e("button",{key:item[0],onClick:function(){up("level",item[0]);},style:{
          background:sel?T.accentGlow:T.elevated,
          border:"1px solid "+(sel?T.accentBorder:T.border),
          borderRadius:20,padding:18,display:"flex",gap:16,alignItems:"center",
          cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.2s"}},
          e("div",{style:{width:52,height:52,background:sel?T.accent:T.border,
            borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:sel?18:22,color:sel?"#fff":T.text,flexShrink:0,transition:"all 0.2s"}},sel?"✓":item[2]),
          e("div",{},
            e("div",{style:{fontSize:16,fontWeight:700,color:T.text}},item[0]),
            e("div",{style:{fontSize:12,color:T.textTert,marginTop:2}},item[1])));
      })),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next,disabled:!canNext})));

  // STEP 4: Movement Assessment
  if(s==="movements") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:20}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Évaluation mouvement"),
      e("div",{style:{fontSize:13,color:T.textTert,marginTop:8,lineHeight:1.6}},"Sois honnête — c'est ce qui rend KOVA précis. Reps propres uniquement.")),
    e("div",{style:{display:"flex",flexDirection:"column",gap:14}},
      e(Inp,{label:"Tractions propres (pronation)",placeholder:"Ex: 8",type:"number",value:d.movements.pullups,
        onChange:function(ev){upMov("pullups",ev.target.value);},suffix:"reps"}),
      e(Inp,{label:"Dips propres",placeholder:"Ex: 12",type:"number",value:d.movements.dips,
        onChange:function(ev){upMov("dips",ev.target.value);},suffix:"reps"}),
      e(Inp,{label:"Pompes propres",placeholder:"Ex: 20",type:"number",value:d.movements.pushups,
        onChange:function(ev){upMov("pushups",ev.target.value);},suffix:"reps"}),
      e(Inp,{label:"Gainage creux (hollow body)",placeholder:"Ex: 25",type:"number",value:d.movements.hollow,
        onChange:function(ev){upMov("hollow",ev.target.value);},suffix:"sec"}),
      e(Inp,{label:"Handstand mur (poitrine face mur)",placeholder:"Ex: 30",type:"number",value:d.movements.handstandWall,
        onChange:function(ev){upMov("handstandWall",ev.target.value);},suffix:"sec"}),
      // Muscle-up
      e("div",{style:{display:"flex",flexDirection:"column",gap:7}},
        e("label",{style:{fontSize:11,fontWeight:700,color:T.textSec,letterSpacing:1,textTransform:"uppercase"}},"Muscle-up"),
        e("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
          ["jamais","en cours","1_clean","plusieurs"].map(function(opt){
            var labels={"jamais":"Jamais tenté","en cours":"En progression","1_clean":"1 propre","plusieurs":"Plusieurs"};
            return e(Chip,{key:opt,label:labels[opt],selected:d.movements.muscleUp===opt,
              onClick:function(){upMov("muscleUp",opt);}});
          })))),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next,disabled:!canNext})));

  // STEP 5: Goal
  var GOALS=[["Force","Force max et bases lourdes","⚡"],["Hypertrophie","Volume et esthétique","💪"],
    ["Muscle-Up","Débloquer le muscle-up","👑"],["Handstand","Maîtriser l'inversion","🤸"],
    ["Front Lever","Force de tirage horizontale","⭐"],["Planche","La figure ultime","🔥"],
    ["Recomposition","Sèche et force","🎯"],["Reprise","Retour après pause","🏃"],
    ["Figures","Explorer toutes les figures","✦"]];
  if(s==="goal") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:28}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Ton objectif"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:8}},"KOVA construit tout autour de ça.")),
    e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}},
      GOALS.map(function(item){
        var sel=d.goal===item[0];
        return e("button",{key:item[0],onClick:function(){up("goal",item[0]);},style:{
          background:sel?T.accentGlow:T.elevated,
          border:"1px solid "+(sel?T.accentBorder:T.border),
          borderRadius:18,padding:"16px 8px",
          display:"flex",flexDirection:"column",alignItems:"center",gap:6,
          cursor:"pointer",textAlign:"center",transition:"all 0.2s"}},
          e("div",{style:{fontSize:22}},item[2]),
          e("div",{style:{fontSize:11,fontWeight:sel?700:500,color:sel?T.accent:T.textSec,lineHeight:1.2}},item[0]));
      })),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next,disabled:!canNext})));

  // STEP 6: Equipment
  var EQUIPS=[
    ["barre","Barre de traction","🪵"],["parallettes","Parallettes","◫"],
    ["anneaux","Anneaux","⭕"],["bandes","Bandes élastiques","🔗"],
    ["haltères","Haltères","🏋️"],["ceinture_lest","Ceinture de lest","⛓"],
    ["gilet_leste","Gilet lesté","🦺"]];
  if(s==="equipment") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:24}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Ton matériel"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:8}},"Les séances n'utiliseront que ce que tu as.")),
    e("div",{style:{display:"flex",flexDirection:"column",gap:8}},
      EQUIPS.map(function(eq){
        var sel=d.equipment.indexOf(eq[0])>=0;
        return e("button",{key:eq[0],onClick:function(){toggleEquip(eq[0]);},style:{
          background:sel?T.accentGlow:T.elevated,
          border:"1px solid "+(sel?T.accentBorder:T.border),
          borderRadius:16,padding:"14px 16px",display:"flex",gap:14,alignItems:"center",
          cursor:"pointer",width:"100%",transition:"all 0.15s"}},
          e("div",{style:{width:42,height:42,background:sel?T.accent+"20":T.border+"60",
            borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:18,flexShrink:0}},eq[2]),
          e("div",{style:{fontSize:14,fontWeight:sel?700:500,color:sel?T.text:T.textSec,flex:1,textAlign:"left"}},eq[1]),
          sel&&e("div",{style:{color:T.accent,fontSize:14}},"✓"));
      }),
      e("div",{style:{fontSize:12,color:T.textTert,padding:"4px 0",fontStyle:"italic"}},
        d.equipment.length===0?"Aucun matériel sélectionné — séances PDC uniquement":d.equipment.length+" élément(s) sélectionné(s)")),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next})));

  // STEP 7: Training Preferences
  var FREQS=["2x","3x","4x","5x","6x"];
  if(s==="prefs") return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"20px 28px",gap:22}},
    e("div",{},
      e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1}},"Préférences"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:8}},"On adapte la programmation à ta vie.")),
    // Fréquence
    e("div",{},
      e("label",{style:{fontSize:11,fontWeight:700,color:T.textSec,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}},"Fréquence par semaine"),
      e("div",{style:{display:"flex",gap:8}},
        FREQS.map(function(f){
          var sel=d.freq===f;
          return e("button",{key:f,onClick:function(){up("freq",f);},style:{
            background:sel?T.accent:T.elevated,border:"1px solid "+(sel?T.accent:T.border),
            borderRadius:14,padding:"14px 0",flex:1,fontSize:18,fontWeight:800,
            color:sel?"#fff":T.textSec,cursor:"pointer",transition:"all 0.15s"}},f);
        }))),
    // Durée séance
    e("div",{},
      e("label",{style:{fontSize:11,fontWeight:700,color:T.textSec,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}},"Durée de séance préférée"),
      e("div",{style:{display:"flex",gap:8}},
        [["courte","30-45 min"],["moyenne","45-70 min"],["longue","70-90+ min"]].map(function(opt){
          var sel=d.sessionLength===opt[0];
          return e("button",{key:opt[0],onClick:function(){up("sessionLength",opt[0]);},style:{
            background:sel?T.accentGlow:T.elevated,border:"1px solid "+(sel?T.accentBorder:T.border),
            borderRadius:14,padding:"12px 8px",flex:1,cursor:"pointer",textAlign:"center",transition:"all 0.15s"}},
            e("div",{style:{fontSize:13,fontWeight:sel?700:500,color:sel?T.accent:T.textSec}},opt[0].charAt(0).toUpperCase()+opt[0].slice(1)),
            e("div",{style:{fontSize:10,color:T.textTert,marginTop:2}},opt[1]));
        }))),
    // Mode d'entraînement
    e("div",{},
      e("label",{style:{fontSize:11,fontWeight:700,color:T.textSec,letterSpacing:1,textTransform:"uppercase",display:"block",marginBottom:10}},"Mode d'entraînement"),
      e("div",{style:{display:"flex",gap:8}},
        [["pdc","Poids du corps"],["lest","Lesté"],["mixte","Les deux"]].map(function(opt){
          var sel=d.trainingMode===opt[0];
          return e("button",{key:opt[0],onClick:function(){up("trainingMode",opt[0]);},style:{
            background:sel?T.accentGlow:T.elevated,border:"1px solid "+(sel?T.accentBorder:T.border),
            borderRadius:14,padding:"14px 12px",flex:1,cursor:"pointer",textAlign:"center",
            fontSize:12,fontWeight:sel?700:500,color:sel?T.accent:T.textSec,transition:"all 0.15s"}},opt[1]);
        }))),
    e("div",{style:{flex:1}}),
    e(Btn,{label:"Continuer →",onClick:next,disabled:!canNext})));

  // STEP 8: Ready
  return wrap(e("div",{style:{flex:1,display:"flex",flexDirection:"column",
    padding:"40px 28px",alignItems:"center",justifyContent:"center",gap:28}},
    e("div",{style:{textAlign:"center"}},
      e("div",{style:{fontSize:60,marginBottom:10,lineHeight:1,
        textShadow:"0 0 40px rgba(139,92,246,0.4)"}},
        isEngineAvailable()?"✦":"🔥"),
      e("div",{style:{fontSize:26,fontWeight:900,color:T.text}},"Prêt, "+d.firstName+" !"),
      e("div",{style:{fontSize:14,color:T.textTert,marginTop:10,lineHeight:1.7,maxWidth:280}},
        isEngineAvailable()
          ? "Le moteur KOVA analyse ton profil et génère des séances sur-mesure."
          : "Ton profil est créé. KOVA adapte ton parcours.")),
    e("div",{style:{width:"100%",background:T.elevated,border:"1px solid "+T.border,
      borderRadius:22,padding:20,display:"flex",flexDirection:"column",gap:8}},
      [[d.level,"Niveau"],[d.goal,"Objectif"],[d.freq+"/sem","Fréquence"],
       [d.movements.pullups?(d.movements.pullups+" tractions"):"–","Pull"],
       [d.movements.dips?(d.movements.dips+" dips"):"–","Push"],
       [d.trainingMode==="pdc"?"Poids du corps":d.trainingMode==="lest"?"Lesté":"Mixte","Mode"],
       [d.equipment.length?d.equipment.length+" items":"Aucun","Matériel"]].map(function(row){
        return e("div",{key:row[1],style:{display:"flex",justifyContent:"space-between",
          alignItems:"center",padding:"4px 0"}},
          e("span",{style:{fontSize:12,color:T.textTert}},row[1]),
          e("span",{style:{fontSize:12,fontWeight:700,color:T.accent}},row[0]));
      })),
    e(Btn,{label:"Lancer KOVA 🚀",onClick:next})));
}

// ─── SUBSCRIPTION FLOW ────────────────────────────────────────────────────────
function SubFlow(props){
  var onClose=props.onClose; var onSuccess=props.onSuccess;
  var ss=useState("pricing"); var step=ss[0]; var setStep=ss[1];
  var ps=useState("annual"); var plan=ps[0]; var setPlan=ps[1];
  var overlay={position:"absolute",inset:0,background:T.bg,zIndex:30,overflowY:"auto",animation:"slideUp 0.3s ease"};

  if(step==="pricing") return e("div",{style:overlay},
    e("div",{style:{padding:"50px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}},
      e("div",{style:{fontSize:20,fontWeight:900,color:T.text}},"KOVA Pro"),
      e("button",{onClick:onClose,style:{background:T.elevated,border:"1px solid "+T.border,
        borderRadius:"50%",width:38,height:38,cursor:"pointer",color:T.textSec,fontSize:16}},"✕")),
    e("div",{style:{padding:"24px 24px 100px",display:"flex",flexDirection:"column",gap:20}},
      e("div",{style:{textAlign:"center",padding:"8px 0"}},
        e("div",{style:{fontSize:52,marginBottom:8}},"👑"),
        e("div",{style:{fontSize:15,color:T.textSec,lineHeight:1.7}},"L'expérience calisthenics complète.")),
      e("div",{style:{display:"flex",flexDirection:"column",gap:8}},
        [["▦","Programmes avancés spécialisés","Planche, Force, Skills combinés…"],
         ["✦","Séances IA personnalisées","Moteur KOVA — adapté à ton profil en temps réel"],
         ["↗","Progressions élite","OAP, Maltese, variantes avancées"],
         ["📊","Suivi analytique complet","Historique, stats détaillées, progression"]].map(function(row){
          return e("div",{key:row[1],style:{background:T.elevated,border:"1px solid "+T.border,
            borderRadius:16,padding:"14px 16px",display:"flex",gap:12,alignItems:"center"}},
            e("div",{style:{width:40,height:40,background:T.goldGlow,borderRadius:10,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,flexShrink:0}},row[0]),
            e("div",{},e("div",{style:{fontSize:13,fontWeight:700,color:T.text}},row[1]),
              e("div",{style:{fontSize:11,color:T.textTert,marginTop:2}},row[2])));
        })),
      [["annual","Annuel","4,17€","/mois","49,99€/an · −50%"],
       ["monthly","Mensuel","7,99€","/mois",null]].map(function(row){
        var p=row[0]; var sel=plan===p;
        return e("button",{key:p,onClick:function(){setPlan(p);},style:{
          background:sel?"rgba(212,168,67,0.07)":T.elevated,
          border:"1px solid "+(sel?"rgba(212,168,67,0.45)":T.border),
          borderRadius:18,padding:"16px 18px",display:"flex",justifyContent:"space-between",
          alignItems:"center",cursor:"pointer",position:"relative",overflow:"hidden",transition:"all 0.2s"}},
          e("div",{style:{textAlign:"left"}},
            e("div",{style:{display:"flex",gap:8,alignItems:"center",marginBottom:2}},
              e("div",{style:{fontSize:15,fontWeight:700,color:T.text}},row[1]),
              p==="annual"&&e("span",{style:{fontSize:9,background:T.accent,color:"#fff",
                borderRadius:100,padding:"2px 8px",fontWeight:700}},"MEILLEUR PRIX")),
            row[4]&&e("div",{style:{fontSize:11,color:T.gold}},row[4])),
          e("div",{style:{textAlign:"right"}},
            e("span",{style:{fontSize:24,fontWeight:900,color:sel?T.gold:T.text}},row[2]),
            e("span",{style:{fontSize:12,color:T.textTert}},row[3])),
          sel&&e("div",{style:{position:"absolute",left:0,top:0,bottom:0,width:3,background:T.gold}}));
      }),
      e(GoldBtn,{label:"Commencer l'essai gratuit — 7 jours",onClick:function(){setStep("processing");
        setTimeout(function(){onSuccess(plan);},1800);}}),
      e("div",{style:{textAlign:"center",fontSize:11,color:T.textTert}},"Paiement sécurisé · Résiliable à tout moment")));

  // Processing
  return e("div",{style:Object.assign({},overlay,{display:"flex",alignItems:"center",justifyContent:"center"})},
    e("div",{style:{textAlign:"center"}},
      e("div",{style:{fontSize:48,animation:"spin 1s linear infinite",marginBottom:16}},"✦"),
      e("div",{style:{fontSize:16,color:T.text,fontWeight:700}},"Activation en cours...")));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PROFILE MODALS (real functional screens) ────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function NotificationsModal(props){
  var notifs = props.notifs || {};
  var onUpdate = props.onUpdate;
  function toggle(key){
    var next = Object.assign({}, notifs);
    next[key] = !next[key];
    onUpdate(next);
  }
  function row(key, label, desc){
    var on = notifs[key];
    return e("div",{key:key,style:{display:"flex",justifyContent:"space-between",alignItems:"center",
      padding:"16px 0",borderBottom:"1px solid "+T.border}},
      e("div",{style:{flex:1}},
        e("div",{style:{fontSize:14,fontWeight:600,color:T.text}},label),
        e("div",{style:{fontSize:12,color:T.textTert,marginTop:2}},desc)),
      e("button",{onClick:function(){toggle(key);},style:{
        width:50,height:28,borderRadius:14,border:"none",cursor:"pointer",
        background:on?"linear-gradient(135deg,"+T.accent+","+T.accentDeep+")":T.border,
        position:"relative",transition:"background 0.2s"}},
        e("div",{style:{width:22,height:22,borderRadius:11,background:"#fff",
          position:"absolute",top:3,left:on?25:3,transition:"left 0.2s",
          boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}})));
  }
  return e(Modal,{title:"Notifications",onClose:props.onClose},
    e("div",{style:{display:"flex",flexDirection:"column"}},
      row("workoutReminder","Rappel d'entraînement","Notification quotidienne à l'heure choisie"),
      row("weeklyReport","Bilan hebdomadaire","Résumé de ta semaine chaque dimanche"),
      row("tips","Conseils & astuces","Tips coaching et progressions")
    ));
}

function PrivacyModal(props){
  return e(Modal,{title:"Confidentialité",onClose:props.onClose},
    e("div",{style:{display:"flex",flexDirection:"column",gap:20}},
      e("div",{style:{background:T.elevated,borderRadius:18,padding:18,border:"1px solid "+T.border}},
        e("div",{style:{fontSize:14,fontWeight:700,color:T.accent,marginBottom:8}},"Stockage local uniquement"),
        e("div",{style:{fontSize:13,color:T.textSec,lineHeight:1.7}},
          "Toutes tes données (profil, historique, préférences) sont stockées uniquement sur ton appareil via le localStorage. Aucune donnée n'est envoyée à un serveur.")),
      e("div",{style:{background:T.elevated,borderRadius:18,padding:18,border:"1px solid "+T.border}},
        e("div",{style:{fontSize:14,fontWeight:700,color:T.accent,marginBottom:8}},"Pas de tracking"),
        e("div",{style:{fontSize:13,color:T.textSec,lineHeight:1.7}},
          "KOVA ne collecte aucune donnée analytique, ne place aucun cookie tiers, et ne partage aucune information avec des services externes.")),
      e("div",{style:{background:T.elevated,borderRadius:18,padding:18,border:"1px solid "+T.border}},
        e("div",{style:{fontSize:14,fontWeight:700,color:T.accent,marginBottom:8}},"Suppression des données"),
        e("div",{style:{fontSize:13,color:T.textSec,lineHeight:1.7}},
          "Tu peux supprimer toutes tes données à tout moment via le bouton « Réinitialiser » dans les paramètres de ton profil. Cela efface définitivement tout."))));
}

function SupportModal(props){
  var faqS = useState(null); var openFaq = faqS[0]; var setOpenFaq = faqS[1];
  var faqs = [
    ["Comment sont générées les séances ?","Les séances sont créées par le moteur KOVA V3, un système intelligent qui analyse ton profil (niveau, mouvements, matériel, fatigue, objectif) pour construire des séances cohérentes et progressives."],
    ["Pourquoi cet exercice a-t-il été choisi ?","Chaque exercice est sélectionné en fonction de ton objectif prioritaire, de tes faiblesses identifiées, de ton matériel disponible, et du stress articulaire cumulé dans la séance."],
    ["Comment fonctionne la progression ?","KOVA utilise des arbres de progression par mouvement avec des critères de déblocage (ex : 10 tractions propres pour accéder aux variantes avancées). La progression suit un cycle : force → volume → forme → palier supérieur. Chaque mouvement a sa propre logique issue des guides."],
    ["Je peux modifier mon profil ?","Oui, tu peux réinitialiser ton profil à tout moment depuis l'onglet Profil pour refaire l'évaluation avec de nouvelles données."],
    ["Que signifient les zones d'intensité ?","Récup = technique et renforcement léger · Standard = travail solide et renforcement · Intensif = effort maximal et combos avancés. La zone est calculée selon ta fatigue et ton historique."],
    ["Mon choix poids du corps est-il respecté ?","Oui. Si tu as choisi « Poids du corps », aucun exercice lesté ne sera proposé. Ni dans les programmes, ni dans les séances générées. KOVA respecte strictement ce choix."],
  ];
  return e(Modal,{title:"Support & FAQ",onClose:props.onClose},
    e("div",{style:{display:"flex",flexDirection:"column",gap:12}},
      e("div",{style:{background:T.accentGlow,borderRadius:16,padding:16,border:"1px solid "+T.accentBorder,marginBottom:8}},
        e("div",{style:{fontSize:14,fontWeight:700,color:T.accent,marginBottom:4}},"Besoin d'aide ?"),
        e("div",{style:{fontSize:13,color:T.textSec,lineHeight:1.6}},
          "Contacte le créateur directement sur Instagram @mariuschave ou TikTok @mariuschv_ pour toute question.")),
      e("div",{style:{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:1.5,marginBottom:6}},"FAQ"),
      faqs.map(function(faq, idx){
        var open = openFaq === idx;
        return e("button",{key:idx,onClick:function(){setOpenFaq(open?null:idx);},style:{
          background:T.elevated,border:"1px solid "+T.border,borderRadius:16,
          padding:"14px 16px",cursor:"pointer",textAlign:"left",width:"100%",transition:"all 0.15s"}},
          e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"}},
            e("div",{style:{fontSize:13,fontWeight:600,color:T.text,flex:1,lineHeight:1.4}},faq[0]),
            e("span",{style:{color:T.textTert,fontSize:14,flexShrink:0,marginLeft:8}},open?"−":"+")),
          open&&e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.7,marginTop:10,
            paddingTop:10,borderTop:"1px solid "+T.border}},faq[1]));
      })));
}

function RateModal(props){
  var rs = useState(0); var rating = rs[0]; var setRating = rs[1];
  var ds = useState(false); var done = ds[0]; var setDone = ds[1];
  if(done) return e(Modal,{title:"Merci !",onClose:props.onClose},
    e("div",{style:{textAlign:"center",padding:"40px 0"}},
      e("div",{style:{fontSize:64,marginBottom:16}},"💜"),
      e("div",{style:{fontSize:18,fontWeight:800,color:T.text}},"Merci pour ton retour !"),
      e("div",{style:{fontSize:13,color:T.textTert,marginTop:8,lineHeight:1.6}},
        "Ton avis aide à améliorer KOVA pour toute la communauté.")));
  return e(Modal,{title:"Noter KOVA",onClose:props.onClose},
    e("div",{style:{textAlign:"center",padding:"20px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:24}},
      e("div",{style:{fontSize:15,color:T.textSec}},"Comment trouves-tu KOVA ?"),
      e("div",{style:{display:"flex",gap:10}},
        [1,2,3,4,5].map(function(star){
          return e("button",{key:star,onClick:function(){setRating(star);},style:{
            fontSize:36,background:"none",border:"none",cursor:"pointer",
            opacity:star<=rating?1:0.3,transition:"opacity 0.15s",
            filter:star<=rating?"drop-shadow(0 0 8px rgba(139,92,246,0.5))":"none"}},
            star<=rating?"⭐":"☆");
        })),
      rating>0&&e(Btn,{label:"Envoyer mon avis",onClick:function(){setDone(true);}})));
}

function CreatorModal(props){
  return e(Modal,{title:"Créateur",onClose:props.onClose},
    e("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:24,padding:"20px 0"}},
      e("div",{style:{width:90,height:90,background:"linear-gradient(135deg,"+T.accent+","+T.accentDeep+")",
        borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:36,fontWeight:900,color:"#fff",
        boxShadow:"0 0 40px rgba(139,92,246,0.3)"}},"M"),
      e("div",{style:{textAlign:"center"}},
        e("div",{style:{fontSize:22,fontWeight:900,color:T.text}},"Marius"),
        e("div",{style:{fontSize:13,color:T.textSec,marginTop:4,lineHeight:1.6}},
          "Créateur de KOVA · Pratiquant calisthenics · Passionné de programmation.")),
      e("div",{style:{width:"100%",display:"flex",flexDirection:"column",gap:10}},
        [["TikTok","@mariuschv_","https://tiktok.com/@mariuschv_","🎵"],
         ["Instagram","@mariuschave","https://instagram.com/mariuschave","📸"]].map(function(link){
          return e("a",{key:link[0],href:link[2],target:"_blank",rel:"noopener",style:{
            background:T.elevated,border:"1px solid "+T.border,borderRadius:18,
            padding:"16px 18px",display:"flex",gap:14,alignItems:"center",
            textDecoration:"none",cursor:"pointer",transition:"border-color 0.15s"}},
            e("div",{style:{width:44,height:44,background:T.accentGlow,borderRadius:12,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},link[3]),
            e("div",{style:{flex:1}},
              e("div",{style:{fontSize:14,fontWeight:700,color:T.text}},link[0]),
              e("div",{style:{fontSize:12,color:T.accentLight,marginTop:2}},link[1])),
            e("span",{style:{color:T.textTert,fontSize:16}},"\u203A"));
        })),
      e("div",{style:{fontSize:12,color:T.textTert,textAlign:"center",lineHeight:1.6,marginTop:8}},
        "KOVA est une app indépendante. Chaque mise à jour est pensée pour la communauté calisthenics.")));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HOME TAB ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function HomeTab(props){
  var state=props.state; var isPro=props.isPro; var setShowPaywall=props.setShowPaywall;
  var onStartWorkout=props.onStartWorkout;
  var profile=state.profile; var stats=state.stats; var history=state.history;
  var firstName=profile.firstName||"Athlète";
  var hour=new Date().getHours();
  var greeting=hour<12?"Bon matin":hour<18?"Bon après-midi":"Bonsoir";
  var hasData=stats.sessions>0;

  // Generate smart workout
  var suggestedS = useState(null); var suggested = suggestedS[0];
  var fromEngine = false;
  useEffect(function(){
    if(isEngineAvailable()){
      setTimeout(function(){
        var s = generateSmartWorkoutFromProfile(state);
        suggestedS[1](s);
      },50);
    } else {
      suggestedS[1](PROGRAMS[0]&&PROGRAMS[0].sessions[0]||null);
    }
  },[state.profile.goal,state.profile.level]);
  if(suggested && suggested._fromEngine) fromEngine = true;

  return e("div",{style:{padding:"20px",display:"flex",flexDirection:"column",gap:22,paddingBottom:24}},
    // Header
    e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}},
      e("div",{},
        e("div",{style:{fontSize:12,color:T.textTert,letterSpacing:0.5}},greeting),
        e("div",{style:{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.1,marginTop:2}},firstName)),
      stats.streak>0&&e("div",{style:{
        background:"rgba(255,69,58,0.08)",border:"1px solid rgba(255,69,58,0.18)",
        borderRadius:16,padding:"8px 14px",textAlign:"center"}},
        e("div",{style:{display:"flex",alignItems:"center",gap:4}},
          e("span",{style:{fontSize:16}},"🔥"),
          e("span",{style:{fontSize:20,fontWeight:900,color:T.red}},stats.streak)),
        e("div",{style:{fontSize:9,color:T.textTert,letterSpacing:0.5}},
          stats.streak===1?"JOUR":"JOURS"))),

    // Suggested session
    !hasData
      ? e("div",{},
          e(EmptyState,{icon:"🏋️",title:"Ta première séance t'attend",
            sub:"Lance ton premier programme et commence ta progression."}),
          suggested&&e("div",{style:{marginTop:14}},
            e(Btn,{label:"▶  Commencer maintenant",onClick:function(){onStartWorkout(suggested);}})))
      : suggested
        ? e("div",{style:{
            background:"linear-gradient(135deg,"+T.accentGlow+" 0%,"+T.elevated+" 100%)",
            border:"1px solid "+T.accentBorder,borderRadius:24,padding:20,
            position:"relative",overflow:"hidden"}},
            e("div",{style:{position:"absolute",top:-30,right:-30,width:100,height:100,
              background:"radial-gradient(circle,"+T.accent+"20 0%,transparent 70%)",pointerEvents:"none"}}),
            e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}},
              fromEngine
                ? e(IntensityBadge,{zone:suggested._intensityZone||"medium"})
                : e("div",{style:{fontSize:9,color:T.accent,letterSpacing:2,fontWeight:700}},"SÉANCE SUGGÉRÉE"),
              fromEngine&&e("div",{style:{fontSize:9,color:T.textTert}},"✦ KOVA ENGINE")),
            e("div",{style:{fontSize:20,fontWeight:900,color:T.text,marginBottom:4,lineHeight:1.2}},suggested.name),
            fromEngine&&suggested._estimatedMin&&
              e("div",{style:{fontSize:12,color:T.textTert,marginBottom:12}},"~"+suggested._estimatedMin+" min"),
            e("div",{style:{display:"flex",flexDirection:"column",gap:6,marginBottom:16}},
              suggested.ex.slice(0,4).map(function(ex){
                return e("div",{key:ex.name,style:{display:"flex",justifyContent:"space-between",
                  alignItems:"center",padding:"6px 0",borderBottom:"1px solid "+T.borderSub}},
                  e("div",{style:{display:"flex",gap:8,alignItems:"center"}},
                    e("div",{style:{width:6,height:6,borderRadius:"50%",background:cc(ex.cat||"Core"),flexShrink:0}}),
                    e("span",{style:{fontSize:13,color:T.textSec,fontWeight:500}},ex.name)),
                  e("span",{style:{fontSize:12,color:T.textTert,fontFamily:"monospace"}},ex.sets+"×"+ex.reps));
              })),
            suggested.ex.length>4&&e("div",{style:{fontSize:11,color:T.textTert,marginBottom:12}},"+ "+(suggested.ex.length-4)+" autre(s)"),
            e(Btn,{label:"▶  Lancer la séance",onClick:function(){onStartWorkout(suggested);}}))
        : null,

    // Stats grid
    e("div",{},
      e("div",{style:{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}},"Statistiques"),
      e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
        e(StatCard,{icon:"✓",value:stats.sessions>0?String(stats.sessions):null,label:"SÉANCES"}),
        e(StatCard,{icon:"⏱",value:stats.minutes>0?stats.minutes+"min":null,label:"TEMPS TOTAL"}),
        e(StatCard,{icon:"🔥",value:stats.streak>0?String(stats.streak):null,label:"RÉGULARITÉ"}),
        e(StatCard,{icon:"👑",value:stats.bestStreak>0?String(stats.bestStreak):null,label:"RECORD"}))),

    // Pro banner
    !isPro&&e("button",{onClick:function(){setShowPaywall(true);},style:{
      background:"linear-gradient(90deg,rgba(139,92,246,0.08) 0%,"+T.elevated+" 100%)",
      border:"1px solid "+T.accentBorder,borderRadius:20,padding:"16px 18px",
      display:"flex",alignItems:"center",gap:14,cursor:"pointer",width:"100%",textAlign:"left"}},
      e("div",{style:{width:42,height:42,background:T.accentGlow,borderRadius:12,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},"✦"),
      e("div",{style:{flex:1}},
        e("div",{style:{fontSize:14,fontWeight:700,color:T.text}},"KOVA Pro — 7 jours gratuits"),
        e("div",{style:{fontSize:11,color:T.textTert,marginTop:2}},"Programmes avancés · Séances IA · Sans engagement")),
      e("span",{style:{color:T.accent,fontSize:18}},"\u203A")),

    // KB-powered: Guide recommandé + Conseil du jour
    window.MOVEMENT_GUIDES&&(function(){
      var guides=Object.values(window.MOVEMENT_GUIDES);
      var profile=state.profile||{};
      // Pick a relevant guide based on user's goal/focus
      var focusMap={"planche":"planche","front_lever":"front_lever","muscle_up":"muscle_up",
        "handstand":"handstand","full_body":"planche","oap":"one_arm_planche"};
      var recSlug=focusMap[profile.focus]||focusMap[profile.goal]||"planche";
      var rec=window.MOVEMENT_GUIDES[recSlug]||guides[0];
      // Pick a random training principle
      var principles=window.TRAINING_PRINCIPLES?Object.values(window.TRAINING_PRINCIPLES):[];
      var tip=principles.length>0?principles[Math.floor(Date.now()/86400000)%principles.length]:null;
      return e("div",{style:{display:"flex",flexDirection:"column",gap:12}},
        // Guide card
        rec&&e("div",{},
          e("div",{style:{fontSize:14,fontWeight:700,color:T.text,marginBottom:10}},"📖 Guide recommandé"),
          e("button",{onClick:function(){if(props.onOpenGuide)props.onOpenGuide(rec);},
            style:{background:"linear-gradient(135deg,"+(rec.color||T.accent)+"10 0%,"+T.elevated+" 100%)",
              border:"1px solid "+(rec.color||T.accent)+"22",borderRadius:20,padding:"14px 16px",
              cursor:"pointer",width:"100%",textAlign:"left",display:"flex",gap:14,alignItems:"center"}},
            e("div",{style:{width:44,height:44,borderRadius:12,background:(rec.color||T.accent)+"18",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}},rec.icon||"◆"),
            e("div",{style:{flex:1}},
              e("div",{style:{fontSize:14,fontWeight:700,color:T.text}},rec.title),
              e("div",{style:{fontSize:11,color:rec.color||T.accent,marginTop:2}},rec.category),
              e("div",{style:{fontSize:11,color:T.textTert,marginTop:4,lineHeight:1.4,
                overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
                WebkitLineClamp:2,WebkitBoxOrient:"vertical"}},
                rec.description)),
            e("span",{style:{color:T.accent,fontSize:16}},"\u203A"))),
        // Tip of the day
        tip&&e("div",{style:{background:T.elevated,border:"1px solid "+T.border,borderRadius:18,
          padding:"14px 16px",marginTop:4}},
          e("div",{style:{fontSize:10,fontWeight:700,color:T.gold,letterSpacing:1.5,marginBottom:6}},
            "💡 PRINCIPE DU JOUR"),
          e("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}},tip.name),
          e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.5,
            overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
            WebkitLineClamp:3,WebkitBoxOrient:"vertical"}},tip.description)));
    })(),

    // Recent history
    history.length>0&&e("div",{},
      e("div",{style:{fontSize:14,fontWeight:700,color:T.text,marginBottom:14}},"Activité récente"),
      e("div",{style:{display:"flex",flexDirection:"column",gap:8}},
        [].concat(history).reverse().slice(0,5).map(function(s,i){
          return e("div",{key:i,style:{background:T.elevated,borderRadius:16,
            padding:"14px 16px",display:"flex",gap:12,alignItems:"center",border:"1px solid "+T.border}},
            e("div",{style:{width:38,height:38,background:T.accentGlow,borderRadius:10,
              display:"flex",alignItems:"center",justifyContent:"center",
              color:T.accent,fontSize:14,fontWeight:700,flexShrink:0}},"✓"),
            e("div",{style:{flex:1}},
              e("div",{style:{fontSize:13,fontWeight:700,color:T.text,lineHeight:1}},s.name),
              e("div",{style:{fontSize:11,color:T.textTert,marginTop:3}},
                new Date(s.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long"}))),
            e("div",{style:{fontSize:13,fontWeight:600,color:T.textSec}},s.duration+"min"));})))
  );
}

// ─── PROGRAMS TAB ─────────────────────────────────────────────────────────────
function SmartWeekSection(props){
  var state=props.state; var onStartWorkout=props.onStartWorkout;
  var sessS=useState(null); var sessions=sessS[0]; var setSessions=sessS[1];
  var loadS=useState(false); var loading=loadS[0]; var setLoading=loadS[1];
  var selS=useState(null); var selIdx=selS[0]; var setSelIdx=selS[1];
  useEffect(function(){
    if (!isEngineAvailable()) return;
    setLoading(true);
    setTimeout(function(){
      var s = generateSmartWeekFromProfile(state);
      setSessions(s); setLoading(false);
    }, 10);
  }, [state.profile.goal, state.profile.level, state.profile.freq]);
  if (!isEngineAvailable()) return null;
  return e("div",{style:{background:"linear-gradient(135deg,"+T.accentDim+" 0%,"+T.elevated+" 100%)",
    border:"1px solid "+T.accentBorder,borderRadius:24,padding:20,marginBottom:4}},
    e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}},
      e("div",{},
        e("div",{style:{fontSize:9,color:T.accent,letterSpacing:2,fontWeight:700,marginBottom:2}},"✦ KOVA ENGINE"),
        e("div",{style:{fontSize:18,fontWeight:900,color:T.text}},"Ta semaine personnalisée")),
      e("div",{style:{fontSize:10,color:T.textTert}},state.profile.freq+"/sem")),
    loading
      ? e("div",{style:{display:"flex",alignItems:"center",gap:10,padding:"8px 0"}},
          e("div",{style:{width:18,height:18,border:"2px solid "+T.accent,borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite"}}),
          e("div",{style:{fontSize:13,color:T.textSec}},"Génération en cours..."))
      : sessions && sessions.length > 0
        ? e("div",{style:{display:"flex",flexDirection:"column",gap:8}},
            sessions.map(function(sess, idx){
              var isOpen = selIdx === idx;
              return e("div",{key:idx},
                e("button",{onClick:function(){setSelIdx(isOpen?null:idx);},style:{
                  background:isOpen?T.card:T.elevated,border:"1px solid "+(isOpen?T.accentBorder:T.border),
                  borderRadius:16,padding:"12px 14px",display:"flex",justifyContent:"space-between",
                  alignItems:"center",cursor:"pointer",width:"100%",transition:"all 0.15s"}},
                  e("div",{style:{display:"flex",gap:10,alignItems:"center"}},
                    e("div",{style:{width:30,height:30,background:T.accentGlow,borderRadius:8,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:13,fontWeight:800,color:T.accent}},idx+1),
                    e("div",{style:{textAlign:"left"}},
                      e("div",{style:{fontSize:13,fontWeight:700,color:T.text}},sess.name),
                      sess._estimatedMin&&e("div",{style:{fontSize:10,color:T.textTert}},"~"+sess._estimatedMin+" min"))),
                  e("span",{style:{color:T.textTert,fontSize:12}},isOpen?"−":"+")),
                isOpen&&e("div",{style:{padding:"8px 0 4px",display:"flex",flexDirection:"column",gap:4}},
                  sess.ex.slice(0,5).map(function(ex){
                    return e("div",{key:ex.name,style:{display:"flex",justifyContent:"space-between",
                      padding:"4px 14px",fontSize:12}},
                      e("span",{style:{color:T.textSec}},ex.name),
                      e("span",{style:{color:T.textTert,fontFamily:"monospace"}},ex.sets+"×"+ex.reps));
                  }),
                  e("div",{style:{padding:"8px 14px 0"}},
                    e(Btn,{label:"▶  Lancer",small:true,onClick:function(){onStartWorkout(sess);}})))
              );
            }))
        : e("div",{style:{fontSize:12,color:T.textTert,padding:"8px 0"}},"Aucune séance générée — vérifie ton profil."));
}

function ProgramCard(props){
  var prog=props.prog; var locked=props.locked; var onClick=props.onClick;
  return e("button",{onClick:onClick,style:{
    background:"linear-gradient(155deg,"+prog.color+"10 0%,"+T.surface+" 100%)",
    border:"1px solid "+prog.color+"18",borderRadius:22,padding:16,
    position:"relative",overflow:"hidden",cursor:"pointer",textAlign:"left",width:"100%"}},
    e("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:18}},
      e("div",{style:{width:44,height:44,background:prog.color+"15",borderRadius:12,
        display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}},prog.icon),
      locked?e(ProBadge):e(Tag,{label:"GRATUIT",color:T.lime})),
    e("div",{style:{fontSize:14,fontWeight:800,color:locked?T.textSec:T.text,lineHeight:1.3}},prog.name),
    e("div",{style:{fontSize:11,color:T.textTert,marginTop:3,lineHeight:1.4}},prog.tagline),
    e("div",{style:{display:"flex",gap:8,marginTop:10}},
      e("span",{style:{fontSize:10,color:T.textTert}},prog.weeks+"sem"),
      e("span",{style:{fontSize:10,color:T.border}},"·"),
      e("span",{style:{fontSize:10,color:T.textTert}},prog.sessionsPerWeek+"x/sem"),
      e("span",{style:{fontSize:10,color:T.border}},"·"),
      e("span",{style:{fontSize:10,color:T.textTert}},"~"+prog.avgMin+"min")),
    locked&&e("div",{style:{position:"absolute",inset:0,background:"rgba(7,6,14,0.45)",borderRadius:22}}));
}

function ProgramsTab(props){
  var state=props.state; var isPro=props.isPro;
  var setShowPaywall=props.setShowPaywall; var onSelect=props.onSelect;
  var onStartWorkout=props.onStartWorkout;
  var fs=useState("Tous"); var filter=fs[0]; var setFilter=fs[1];
  var filters=["Tous","Débutant","Intermédiaire","Avancé"];
  var tm = state.profile.trainingMode || "pdc";
  var free=PROGRAMS.filter(function(p){return !p.pro&&(filter==="Tous"||p.level===filter)&&isProgramCompatibleWithTrainingMode(p,tm);});
  var pro=PROGRAMS.filter(function(p){return p.pro&&(filter==="Tous"||p.level===filter)&&isProgramCompatibleWithTrainingMode(p,tm);});
  return e("div",{style:{padding:"20px",display:"flex",flexDirection:"column",gap:24}},
    e("div",{style:{fontSize:28,fontWeight:900,color:T.text}},"Programmes"),
    e(SmartWeekSection,{state:state,onStartWorkout:onStartWorkout}),
    e("div",{style:{display:"flex",gap:8,overflowX:"auto",paddingBottom:2}},
      filters.map(function(f){
        return e("button",{key:f,onClick:function(){setFilter(f);},style:{
          background:filter===f?T.accent:T.elevated,color:filter===f?"#fff":T.textSec,
          border:"none",borderRadius:100,padding:"8px 16px",fontSize:12,fontWeight:700,
          cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}},f);
      })),
    free.length>0&&e("div",{},
      e(SecTitle,{t:"Gratuit"}),
      e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
        free.map(function(p){return e(ProgramCard,{key:p.id,prog:p,locked:false,
          onClick:function(){onSelect(p);}});}))),
    pro.length>0&&e("div",{},
      e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}},
        e("div",{style:{fontSize:12,fontWeight:700,color:T.textSec,letterSpacing:1.5,textTransform:"uppercase"}},"Pro"),
        e(ProBadge)),
      e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}},
        pro.map(function(p){return e(ProgramCard,{key:p.id,prog:p,locked:!isPro,
          onClick:function(){isPro?onSelect(p):setShowPaywall(true);}});}))));
}

// ─── EXERCISES TAB ────────────────────────────────────────────────────────────
function ExercisesTab(props){
  var isPro=props.isPro; var setShowPaywall=props.setShowPaywall;
  var onOpenGuide=props.onOpenGuide;
  var searchS=useState(""); var search=searchS[0]; var setSearch=searchS[1];
  var catS=useState("Tous"); var cat=catS[0]; var setCat=catS[1];
  var selS=useState(null); var sel=selS[0]; var setSel=selS[1];
  var modeS=useState("guides"); var mode=modeS[0]; var setMode=modeS[1];
  var cats=["Tous"].concat(Object.keys(EX_DB));

  // Exercise detail view
  if(sel) return e("div",{style:{display:"flex",flexDirection:"column",height:"100%",animation:"fadeIn 0.25s ease"}},
    e("div",{style:{minHeight:140,
      background:"linear-gradient(180deg,"+cc(sel.category)+"18 0%,"+T.bg+" 100%)",
      padding:"52px 24px 16px",position:"relative",flexShrink:0}},
      e("button",{onClick:function(){setSel(null);},style:{position:"absolute",top:14,left:18,
        background:T.elevated,border:"1px solid "+T.border,
        borderRadius:100,padding:"6px 14px",fontSize:12,color:T.textSec,cursor:"pointer",fontWeight:600}},"← Retour"),
      e(Tag,{label:catLabel(sel.category),color:cc(sel.category)}),
      e("div",{style:{fontSize:24,fontWeight:900,color:T.text,marginTop:8,lineHeight:1.1}},sel.name)),
    e("div",{style:{flex:1,padding:"0 24px 100px",display:"flex",flexDirection:"column",gap:20,overflowY:"auto"}},
      e(ExerciseMedia,{name:sel.name,catColor:cc(sel.category)}),
      e("div",{style:{display:"flex",gap:8,flexWrap:"wrap"}},
        e(Tag,{label:sel.level,color:sel.level==="Avancé"?T.red:sel.level==="Intermédiaire"?T.warn:T.accent}),
        sel.pro&&e(ProBadge),
        sel.equip&&sel.equip.length>0&&sel.equip.map(function(eq){
          return e(Tag,{key:eq,label:eq,color:T.textSec});
        })),
      e("div",{},e(SecTitle,{t:"Muscles ciblés"}),
        e("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
          sel.muscles.split(" · ").map(function(m){
            return e(Tag,{key:m,label:m,color:cc(sel.category)});
          }))),
      (function(){
        var eng = getKovaEngine();
        if(!eng) return null;
        var engEx = eng.exercises.find(function(ex){ return resolveExName(ex.name) === sel.name; });
        if(!engEx) return null;
        return e("div",{style:{display:"flex",flexDirection:"column",gap:16}},
          engEx.coachingCues&&engEx.coachingCues.length>0&&e("div",{},
            e(SecTitle,{t:"Consignes coaching"}),
            e("div",{style:{background:T.elevated,border:"1px solid "+T.border,borderRadius:18,
              padding:"16px 18px",display:"flex",flexDirection:"column",gap:8}},
              engEx.coachingCues.map(function(cue,i){
                return e("div",{key:i,style:{display:"flex",gap:10,alignItems:"flex-start"}},
                  e("span",{style:{color:T.accent,fontSize:13,flexShrink:0}},"✦"),
                  e("span",{style:{fontSize:13,color:T.textSec,lineHeight:1.5}},cue));
              }))),
          engEx.commonErrors&&engEx.commonErrors.length>0&&e("div",{},
            e(SecTitle,{t:"Erreurs fréquentes"}),
            e("div",{style:{background:T.elevated,border:"1px solid "+T.border,borderRadius:18,
              padding:"14px 18px",display:"flex",flexDirection:"column",gap:8}},
              engEx.commonErrors.map(function(err,i){
                return e("div",{key:i,style:{display:"flex",gap:10,alignItems:"flex-start"}},
                  e("span",{style:{color:T.red,fontSize:13,flexShrink:0}},"✗"),
                  e("span",{style:{fontSize:13,color:T.textSec,lineHeight:1.5}},err));
              }))),
          engEx.progressions&&engEx.progressions.length>0&&e("div",{},
            e(SecTitle,{t:"Progression suivante"}),
            e("div",{style:{display:"flex",gap:6,flexWrap:"wrap"}},
              engEx.progressions.map(function(pid){
                var next = eng.exercises.find(function(ex){return ex.id===pid;});
                return next?e(Tag,{key:pid,label:resolveExName(next.name),color:T.accentLight}):null;
              }))));
      })()));

  // List view with tabs
  var guides = window.MOVEMENT_GUIDES ? Object.values(window.MOVEMENT_GUIDES) : [];
  var filteredGuides = guides.filter(function(g){
    if(!search) return true;
    return g.title.toLowerCase().includes(search.toLowerCase()) ||
           g.category.toLowerCase().includes(search.toLowerCase());
  });

  return e("div",{style:{padding:"20px",display:"flex",flexDirection:"column",gap:14,paddingBottom:24}},
    e("div",{style:{fontSize:28,fontWeight:900,color:T.text}},"Savoir & Exercices"),

    // Sub-tabs: Guides / Exercices
    e("div",{style:{display:"flex",gap:4,background:T.elevated,borderRadius:14,padding:3,
      border:"1px solid "+T.border}},
      ["guides","exercices"].map(function(m){
        return e("button",{key:m,onClick:function(){setMode(m);},style:{
          flex:1,padding:"10px 0",borderRadius:12,border:"none",cursor:"pointer",
          fontSize:13,fontWeight:700,
          background:mode===m?T.accent:"transparent",
          color:mode===m?"#fff":T.textSec}},
          m==="guides"?"📖 Guides Mouvement":"◈ Exercices");
      })),

    // Search
    e("div",{style:{background:T.elevated,border:"1px solid "+T.border,
      borderRadius:16,padding:"12px 16px",display:"flex",gap:10,alignItems:"center"}},
      e("span",{style:{color:T.textTert,fontSize:16}},"🔍"),
      e("input",{value:search,onChange:function(ev){setSearch(ev.target.value);},
        placeholder:mode==="guides"?"Rechercher un guide...":"Rechercher un exercice...",
        style:{background:"none",border:"none",outline:"none",color:T.text,fontSize:14,flex:1}})),

    // GUIDES MODE
    mode==="guides"&&e("div",{style:{display:"flex",flexDirection:"column",gap:10}},
      // Intro
      e("div",{style:{background:"linear-gradient(135deg,"+T.accent+"08 0%,"+T.card+" 100%)",
        border:"1px solid "+T.accentBorder,borderRadius:18,padding:"14px 16px"}},
        e("div",{style:{fontSize:12,color:T.accent,lineHeight:1.5}},
          "📖 Fiches de référence complètes pour chaque mouvement. Technique, progressions, programmation, erreurs, approche mentale — tout est couvert en profondeur.")),

      // Guide cards
      filteredGuides.map(function(g){
        var diffMin=g.difficulty_range?g.difficulty_range[0]:0;
        var diffMax=g.difficulty_range?g.difficulty_range[1]:10;
        return e("button",{key:g.slug,onClick:function(){if(onOpenGuide)onOpenGuide(g);},
          style:{background:T.elevated,border:"1px solid "+T.border,borderRadius:20,
            padding:"16px 18px",cursor:"pointer",width:"100%",textAlign:"left",
            display:"flex",gap:14,alignItems:"center",position:"relative",overflow:"hidden"}},
          // Color accent strip
          e("div",{style:{position:"absolute",left:0,top:0,bottom:0,width:4,
            background:g.color||T.accent,borderRadius:"20px 0 0 20px"}}),
          // Icon
          e("div",{style:{width:48,height:48,borderRadius:14,
            background:(g.color||T.accent)+"14",display:"flex",alignItems:"center",
            justifyContent:"center",flexShrink:0}},
            e("span",{style:{fontSize:22}},g.icon||"◆")),
          // Text
          e("div",{style:{flex:1,minWidth:0}},
            e("div",{style:{fontSize:15,fontWeight:700,color:T.text,marginBottom:2}},g.title),
            e("div",{style:{fontSize:11,color:g.color||T.accent,fontWeight:600,marginBottom:4}},g.category),
            e("div",{style:{fontSize:11,color:T.textTert,lineHeight:1.4,
              overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
              WebkitLineClamp:2,WebkitBoxOrient:"vertical"}},
              g.description)),
          // Difficulty bar
          e("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}},
            e("div",{style:{width:4,height:32,background:T.border,borderRadius:2,overflow:"hidden",
              display:"flex",flexDirection:"column-reverse"}},
              e("div",{style:{width:"100%",height:(diffMax*10)+"%",
                background:g.color||T.accent,borderRadius:2}})),
            e("span",{style:{fontSize:9,color:T.textTert}},diffMin+"-"+diffMax)));
      }),

      // Training Principles card
      window.TRAINING_PRINCIPLES&&e("div",{style:{marginTop:8}},
        e("div",{style:{fontSize:11,fontWeight:700,color:T.gold,letterSpacing:2,marginBottom:10}},
          "PRINCIPES D'ENTRAÎNEMENT"),
        e("div",{style:{display:"flex",flexDirection:"column",gap:8}},
          Object.values(window.TRAINING_PRINCIPLES).slice(0,5).map(function(p,i){
            return e("div",{key:i,style:{background:T.elevated,border:"1px solid "+T.border,
              borderRadius:16,padding:"14px 16px"}},
              e("div",{style:{fontSize:13,fontWeight:700,color:T.text,marginBottom:4}},p.name),
              e("div",{style:{fontSize:11,color:T.textSec,lineHeight:1.5,
                overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",
                WebkitLineClamp:3,WebkitBoxOrient:"vertical"}},p.description));
          })))),

    // EXERCISES MODE
    mode==="exercices"&&e("div",{style:{display:"flex",flexDirection:"column",gap:14}},
      e("div",{style:{display:"flex",gap:8,overflowX:"auto"}},
        cats.map(function(c){
          return e("button",{key:c,onClick:function(){setCat(c);},style:{
            background:cat===c?T.accent:T.elevated,color:cat===c?"#fff":T.textSec,
            border:"none",borderRadius:100,padding:"8px 14px",fontSize:12,
            fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}},c);})),
      Object.entries(EX_DB).filter(function(entry){return cat==="Tous"||cat===entry[0];}).map(function(entry){
        var c=entry[0]; var exs=entry[1];
        return e("div",{key:c},
          e("div",{style:{fontSize:11,fontWeight:700,color:cc(c),letterSpacing:2,marginBottom:10}},c.toUpperCase()),
          e("div",{style:{display:"flex",flexDirection:"column",gap:8}},
            exs.filter(function(ex){return !search||ex.name.toLowerCase().includes(search.toLowerCase());}).map(function(ex){
              return e("button",{key:ex.name,
                onClick:function(){ex.pro&&!isPro?setShowPaywall(true):setSel(Object.assign({},ex,{category:c}));},
                style:{background:T.elevated,border:"1px solid "+T.border,borderRadius:18,
                  padding:"14px 16px",display:"flex",gap:14,alignItems:"center",
                  cursor:"pointer",width:"100%",textAlign:"left",position:"relative"}},
                e("div",{style:{width:42,height:42,background:ccDim(c),borderRadius:12,
                  display:"flex",alignItems:"center",justifyContent:"center"}},
                  e("div",{style:{width:6,height:6,borderRadius:"50%",background:cc(c)}})),
                e("div",{style:{flex:1}},
                  e("div",{style:{fontSize:14,fontWeight:600,color:ex.pro&&!isPro?T.textSec:T.text}},ex.name),
                  e("div",{style:{fontSize:11,color:T.textTert,marginTop:2}},ex.muscles)),
                ex.pro&&!isPro&&e(ProBadge));
            })));
      })));
}


// ─── PROGRESS TAB ─────────────────────────────────────────────────────────────
function ProgressTab(props){
  var state=props.state; var stats=state.stats; var skills=state.skills;
  var has=stats.sessions>0;
  return e("div",{style:{padding:"20px",display:"flex",flexDirection:"column",gap:24,paddingBottom:24}},
    e("div",{style:{fontSize:28,fontWeight:900,color:T.text}},"Progression"),
    !has
      ? e(EmptyState,{icon:"📊",title:"Pas encore de données",sub:"Ta progression s'affichera après ta première séance."})
      : e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}},
          [["✓",String(stats.sessions),"Séances"],["⏱",stats.minutes+"m","Temps"],["🔥",String(stats.streak),"Régularité"]].map(function(row){
            return e("div",{key:row[2],style:{background:T.elevated,border:"1px solid "+T.border,
              borderRadius:18,padding:"16px 10px",textAlign:"center",display:"flex",flexDirection:"column",gap:4,alignItems:"center"}},
              e("div",{style:{fontSize:16,lineHeight:1}},row[0]),
              e("div",{style:{fontSize:22,fontWeight:900,color:T.text}},row[1]),
              e("div",{style:{fontSize:9,color:T.textTert,letterSpacing:1}},row[2].toUpperCase()));})),
    e("div",{},
      e(SecTitle,{t:"Figures en cours"}),
      e("div",{style:{display:"flex",flexDirection:"column",gap:10}},
        skills.map(function(s){
          var pct=Math.round((s.step/s.total)*100);
          return e("div",{key:s.name,style:{background:T.elevated,borderRadius:20,padding:18,border:"1px solid "+T.border}},
            e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
              e("div",{style:{display:"flex",gap:8,alignItems:"center"}},
                e("span",{style:{fontSize:20}},s.icon),
                e("span",{style:{fontSize:14,fontWeight:800,color:T.text}},s.name)),
              e("div",{style:{textAlign:"right"}},
                e("div",{style:{fontSize:15,fontWeight:800,color:s.step>0?T.accent:T.textTert}},pct+"%"),
                e("div",{style:{fontSize:9,color:T.textTert}},s.step+"/"+s.total+" étapes"))),
            e("div",{style:{height:6,background:T.border,borderRadius:3,overflow:"hidden"}},
              e("div",{style:{height:"100%",width:pct+"%",
                background:"linear-gradient(90deg,"+T.accent+","+T.accentLight+")",
                borderRadius:3,transition:"width 0.8s"}})));
        }))),
    e("div",{},
      e(SecTitle,{t:"Badges"}),
      e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
        [{name:"Première séance",icon:"🔥",color:T.accent,ok:stats.sessions>=1},
         {name:"5 séances",icon:"⚡",color:T.warn,ok:stats.sessions>=5},
         {name:"Semaine parfaite",icon:"📅",color:T.gold,ok:stats.streak>=7},
         {name:"10 séances",icon:"👑",color:T.pull,ok:stats.sessions>=10}].map(function(b){
          return e("div",{key:b.name,style:{background:b.ok?T.elevated:T.surface,
            border:"1px solid "+(b.ok?b.color+"40":T.border),borderRadius:20,
            padding:"18px 14px",textAlign:"center",opacity:b.ok?1:0.35}},
            e("div",{style:{fontSize:32,marginBottom:8}},b.icon),
            e("div",{style:{fontSize:12,fontWeight:700,color:b.ok?T.text:T.textTert}},b.name),
            b.ok&&e("div",{style:{fontSize:10,color:b.color,marginTop:4,fontWeight:600}},"Débloqué ✓"));}))));
}

// ─── PROFILE TAB (fully functional) ──────────────────────────────────────────
function ProfileTab(props){
  var state=props.state; var isPro=props.isPro;
  var setShowPaywall=props.setShowPaywall; var onReset=props.onReset;
  var onUpdateNotifs=props.onUpdateNotifs;
  var profile=state.profile; var stats=state.stats; var sub=state.sub;
  var crS=useState(false); var confirmReset=crS[0]; var setConfirmReset=crS[1];
  // Modal states
  var modalS=useState(null); var modal=modalS[0]; var setModal=modalS[1];

  var bmi=profile.height&&profile.weight?Math.round(profile.weight/Math.pow(profile.height/100,2)*10)/10:null;

  return e("div",{style:{padding:"20px",display:"flex",flexDirection:"column",gap:22,paddingBottom:24}},
    e("div",{style:{fontSize:28,fontWeight:900,color:T.text}},"Profil"),
    // Avatar card
    e("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:10,
      background:"linear-gradient(180deg,"+T.accentDim+" 0%,"+T.elevated+" 100%)",
      border:"1px solid "+T.border,borderRadius:24,padding:"24px 20px"}},
      e("div",{style:{width:76,height:76,background:"linear-gradient(135deg,"+T.accent+","+T.accentDeep+")",
        borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:30,fontWeight:900,color:"#fff",
        boxShadow:"0 0 30px "+T.accentGlow}},
        profile.firstName?profile.firstName[0].toUpperCase():"?"),
      e("div",{style:{fontSize:22,fontWeight:900,color:T.text}},profile.firstName||"Athlète"),
      e("div",{style:{fontSize:12,color:T.textTert}},
        [profile.level,profile.goal].filter(Boolean).join(" · ")),
      profile.trainingMode&&e("div",{style:{fontSize:10,color:T.accentLight,marginTop:2}},
        profile.trainingMode==="pdc"?"Poids du corps":profile.trainingMode==="lest"?"Lesté":"Mixte")),

    // Engine badge
    isEngineAvailable()&&e("div",{style:{background:T.accentDim,border:"1px solid "+T.accentBorder,
      borderRadius:16,padding:"12px 16px",display:"flex",gap:12,alignItems:"center"}},
      e("span",{style:{fontSize:18,color:T.accent}},"✦"),
      e("div",{style:{flex:1}},
        e("div",{style:{fontSize:13,fontWeight:700,color:T.accent}},"KOVA Engine actif"),
        e("div",{style:{fontSize:11,color:T.textTert,marginTop:2}},
          (getKovaEngine()&&getKovaEngine().exercises?getKovaEngine().exercises.length:0)+" exercices · Séances IA"))),

    // Physique
    e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}},
      e(Pill,{icon:"📏",value:profile.height||null,unit:"cm"}),
      e(Pill,{icon:"⚖️",value:profile.weight||null,unit:"kg"}),
      e(Pill,{icon:"📊",value:bmi?String(bmi):null,unit:"IMC"})),

    // Movement data
    profile.movements&&(profile.movements.pullups||profile.movements.dips)&&
      e("div",{style:{background:T.elevated,borderRadius:18,padding:16,border:"1px solid "+T.border}},
        e("div",{style:{fontSize:11,fontWeight:700,color:T.accentLight,letterSpacing:1.5,marginBottom:10}},"ÉVALUATION MOUVEMENT"),
        e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}},
          [["Tractions",profile.movements.pullups,"reps"],
           ["Dips",profile.movements.dips,"reps"],
           ["Pompes",profile.movements.pushups,"reps"],
           ["Hollow",profile.movements.hollow,"sec"],
           ["HS mur",profile.movements.handstandWall,"sec"],
           ["MU",profile.movements.muscleUp==="jamais"?"–":profile.movements.muscleUp,""]].map(function(row){
            return e("div",{key:row[0],style:{textAlign:"center"}},
              e("div",{style:{fontSize:14,fontWeight:800,color:row[1]?T.text:T.textTert}},row[1]||"–"),
              e("div",{style:{fontSize:9,color:T.textTert}},row[0]));
          }))),

    // Sub status
    isPro
      ?e("div",{style:{background:T.goldGlow,border:"1px solid rgba(212,168,67,0.25)",
          borderRadius:18,padding:"16px 18px",display:"flex",gap:14,alignItems:"center"}},
          e("span",{style:{fontSize:22}},"👑"),
          e("div",{style:{flex:1}},
            e("div",{style:{fontSize:15,fontWeight:800,color:T.gold}},"KOVA Pro actif"),
            e("div",{style:{fontSize:12,color:T.textTert,marginTop:2}},"Plan "+(sub.plan==="annual"?"annuel":"mensuel"))),
          e("span",{style:{color:T.gold,fontSize:18}},"✓"))
      :e("button",{onClick:function(){setShowPaywall(true);},style:{
          background:"linear-gradient(90deg,"+T.goldGlow+" 0%,"+T.elevated+" 100%)",
          border:"1px solid rgba(212,168,67,0.22)",borderRadius:18,padding:"16px 18px",
          display:"flex",alignItems:"center",gap:14,cursor:"pointer",width:"100%"}},
          e("span",{style:{fontSize:20}},"👑"),
          e("div",{style:{textAlign:"left",flex:1}},
            e("div",{style:{fontSize:15,fontWeight:800,color:T.text}},"Passer à KOVA Pro"),
            e("div",{style:{fontSize:12,color:T.textTert,marginTop:2}},"7 jours gratuits")),
          e("span",{style:{marginLeft:"auto",color:T.gold,fontSize:18}},"\u203A")),

    // Stats
    e("div",{},
      e(SecTitle,{t:"Performances"}),
      e("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},
        e(StatCard,{icon:"✓",value:stats.sessions>0?String(stats.sessions):null,label:"SÉANCES"}),
        e(StatCard,{icon:"⏱",value:stats.minutes>0?stats.minutes+"m":null,label:"TEMPS TOTAL"}))),

    // Menu — FUNCTIONAL
    e("div",{style:{background:T.elevated,borderRadius:20,border:"1px solid "+T.border,overflow:"hidden"}},
      [["🔔","Notifications","notifs"],["🛡","Confidentialité","privacy"],
       ["❓","Support & FAQ","support"],["⭐","Noter KOVA","rate"],
       ["✦","Créateur","creator"]].map(function(item,idx,arr){
        return e("button",{key:item[1],onClick:function(){setModal(item[2]);},style:{
          padding:"16px 18px",display:"flex",gap:14,alignItems:"center",
          borderBottom:idx<arr.length-1?"1px solid "+T.border:"none",
          background:"transparent",border:"none",cursor:"pointer",width:"100%"}},
          e("span",{style:{fontSize:17}},item[0]),
          e("span",{style:{fontSize:14,color:T.text,flex:1,textAlign:"left"}},item[1]),
          e("span",{style:{color:T.textTert,fontSize:14}},"\u203A"));
      })),

    // Reset
    !confirmReset
      ?e("button",{onClick:function(){setConfirmReset(true);},style:{background:"none",
          border:"1px solid "+T.border,borderRadius:16,padding:14,
          fontSize:13,color:T.textTert,cursor:"pointer",width:"100%"}},"Réinitialiser l'app")
      :e("div",{style:{background:T.red+"12",border:"1px solid "+T.red+"30",
          borderRadius:16,padding:18,textAlign:"center"}},
          e("div",{style:{fontSize:14,fontWeight:700,color:T.red,marginBottom:8}},"Supprimer toutes les données ?"),
          e("div",{style:{fontSize:12,color:T.textTert,marginBottom:14}},"Irréversible — profil, historique, abonnement."),
          e("div",{style:{display:"flex",gap:8}},
            e(Btn,{label:"Annuler",ghost:true,onClick:function(){setConfirmReset(false);}}),
            e(Btn,{label:"Supprimer",danger:true,onClick:onReset}))),

    // Modals
    modal==="notifs"&&e(NotificationsModal,{notifs:profile.notifications||{},onClose:function(){setModal(null);},
      onUpdate:function(n){onUpdateNotifs(n);}}),
    modal==="privacy"&&e(PrivacyModal,{onClose:function(){setModal(null);}}),
    modal==="support"&&e(SupportModal,{onClose:function(){setModal(null);}}),
    modal==="rate"&&e(RateModal,{onClose:function(){setModal(null);}}),
    modal==="creator"&&e(CreatorModal,{onClose:function(){setModal(null);}})
  );
}

// ─── PROGRAM DETAIL ───────────────────────────────────────────────────────────
function ProgDetail(props){
  var prog=props.prog; var isPro=props.isPro; var setShowPaywall=props.setShowPaywall;
  var onStartWorkout=props.onStartWorkout; var onClose=props.onClose;
  var locked=prog.pro&&!isPro;
  return e("div",{style:{position:"absolute",inset:0,background:T.bg,zIndex:20,overflowY:"auto",animation:"slideUp 0.3s ease"}},
    e("div",{style:{minHeight:180,
      background:"linear-gradient(180deg,"+prog.color+"20 0%,"+T.bg+" 100%)",
      padding:"52px 24px 20px",position:"relative"}},
      e("button",{onClick:onClose,style:{position:"absolute",top:14,left:18,
        background:T.elevated,border:"1px solid "+T.border,borderRadius:100,
        padding:"6px 14px",fontSize:12,color:T.textSec,cursor:"pointer",fontWeight:600}},"← Retour"),
      e("div",{style:{fontSize:36,marginBottom:8}},prog.icon),
      e("div",{style:{fontSize:24,fontWeight:900,color:T.text,lineHeight:1.2}},prog.name),
      e("div",{style:{fontSize:13,color:T.textSec,marginTop:6}},prog.tagline)),
    e("div",{style:{padding:"0 24px 100px",display:"flex",flexDirection:"column",gap:20}},
      e("div",{style:{display:"flex",gap:10}},
        e(Tag,{label:prog.level,color:prog.level==="Avancé"?T.red:prog.level==="Intermédiaire"?T.warn:T.accent}),
        e(Tag,{label:prog.weeks+" semaines",color:T.textSec}),
        e(Tag,{label:prog.sessionsPerWeek+"x/sem",color:T.textSec})),
      e("div",{},
        e(SecTitle,{t:"Sessions"}),
        e("div",{style:{display:"flex",flexDirection:"column",gap:10}},
          prog.sessions.map(function(sess,i){
            return e("div",{key:i,style:{background:T.elevated,borderRadius:18,
              padding:16,border:"1px solid "+T.border}},
              e("div",{style:{fontSize:14,fontWeight:700,color:T.text,marginBottom:10}},sess.name),
              e("div",{style:{display:"flex",flexDirection:"column",gap:6}},
                sess.ex.map(function(ex){
                  return e("div",{key:ex.name,style:{display:"flex",justifyContent:"space-between",
                    alignItems:"center",padding:"4px 0"}},
                    e("div",{style:{display:"flex",gap:8,alignItems:"center"}},
                      e("div",{style:{width:5,height:5,borderRadius:"50%",background:cc(ex.cat),flexShrink:0}}),
                      e("span",{style:{fontSize:13,color:T.textSec}},ex.name)),
                    e("span",{style:{fontSize:12,color:T.textTert,fontFamily:"monospace"}},ex.sets+"×"+ex.reps));
                })),
              !locked&&e("div",{style:{marginTop:12}},
                e(Btn,{label:"▶  Lancer",small:true,onClick:function(){onStartWorkout(sess);}})));
          }))),
      locked&&e("div",{style:{textAlign:"center",padding:"20px 0"}},
        e("div",{style:{fontSize:14,color:T.textTert,marginBottom:14}},"Ce programme nécessite KOVA Pro"),
        e(GoldBtn,{label:"Débloquer — 7 jours gratuits",onClick:function(){setShowPaywall(true);}})),

      // KB-powered: show related guide tips
      !locked&&window.KB&&(function(){
        // Try to match program to a guide
        var slugMap={"Planche":"planche","Front Lever":"front_lever","Muscle-Up":"muscle_up",
          "Handstand":"handstand","Full Body":"planche","OAP":"one_arm_planche"};
        var matched=null;
        Object.keys(slugMap).forEach(function(k){
          if(prog.name&&prog.name.toLowerCase().includes(k.toLowerCase())) matched=slugMap[k];
        });
        var guide=matched?window.KB.getGuide(matched):null;
        if(!guide) return null;
        var mistakes=guide.common_mistakes?guide.common_mistakes.slice(0,3):[];
        var rules=guide.programming_guidelines||{};
        return e("div",{style:{display:"flex",flexDirection:"column",gap:14}},
          e("div",{style:{fontSize:11,fontWeight:700,color:T.gold,letterSpacing:2}},"ISSU DU GUIDE "+guide.title.toUpperCase()),
          // Quick technique tips
          mistakes.length>0&&e("div",{style:{background:T.elevated,border:"1px solid "+T.border,
            borderRadius:18,padding:"14px 16px"}},
            e("div",{style:{fontSize:12,fontWeight:700,color:T.text,marginBottom:8}},"⚠️ Erreurs à éviter"),
            mistakes.map(function(m,i){
              return e("div",{key:i,style:{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}},
                e("span",{style:{color:T.red,fontSize:11,flexShrink:0}},"✗"),
                e("div",{},
                  e("span",{style:{fontSize:12,fontWeight:600,color:T.text}},m.name),
                  m.fix&&e("span",{style:{fontSize:11,color:T.textTert,marginLeft:6}},"→ "+m.fix)));
            })),
          // Key programming rule
          rules.binary_evolution&&e("div",{style:{background:T.accentGlow,border:"1px solid "+T.accentBorder,
            borderRadius:16,padding:"12px 14px"}},
            e("div",{style:{fontSize:12,fontWeight:700,color:T.accent,marginBottom:4}},"📋 Règle de programmation"),
            e("div",{style:{fontSize:12,color:T.textSec,lineHeight:1.5}},
              typeof rules.binary_evolution==="string"?rules.binary_evolution:
              "L'évolution est binaire : force/volume → forme → répéter.")),
          // Link to full guide
          props.onOpenGuide&&e("button",{onClick:function(){props.onOpenGuide(guide);},
            style:{background:T.elevated,border:"1px solid "+(guide.color||T.accent)+"30",
              borderRadius:16,padding:"12px 16px",cursor:"pointer",display:"flex",gap:10,alignItems:"center",
              width:"100%",textAlign:"left"}},
            e("span",{style:{fontSize:16}},guide.icon||"◆"),
            e("div",{style:{flex:1}},
              e("div",{style:{fontSize:13,fontWeight:700,color:T.text}},"Voir le guide complet : "+guide.title),
              e("div",{style:{fontSize:11,color:T.textTert,marginTop:2}},"Technique, progressions, mindset...")),
            e("span",{style:{color:T.accent,fontSize:14}},"\u203A")));
      })()));
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── PRESCRIPTION FORMATTER — Affichage humain et premium ────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

function formatPrescription(rawReps, exName) {
  if (!rawReps || typeof rawReps !== "string") return { value: rawReps || "–", label: "REPS", detail: null };
  var r = rawReps.trim();
  
  // Translate common engine fragments to French
  r = r.replace(/quality\s*attempts?/gi, "tentatives propres")
       .replace(/submax\s*technical\s*attempts?/gi, "tentatives sous-max")
       .replace(/max[\-\s]*quality\s*attempts?/gi, "tentatives maximales")
       .replace(/with\s*full/gi, " · repos complet")
       .replace(/with\s*rest/gi, " · repos")
       .replace(/min\s*rest\s*between/gi, " min entre séries")
       .replace(/min\s*rest/gi, " min repos")
       .replace(/sec\s*rest/gi, "s repos")
       .replace(/stop\s*before\s*form\s*breakdown/gi, "stop avant dégradation")
       .replace(/working\s*sets/gi, "séries de travail")
       .replace(/skill\s*practice/gi, "travail technique")
       .replace(/max\s*hold/gi, "maintien max")
       .replace(/max\s*reps/gi, "max reps")
       .replace(/dead\s*stop/gi, "temps mort")
       .replace(/negatives?/gi, "excentriques")
       .replace(/slow/gi, "lent")
       .replace(/breaths?/gi, "respirations")
       .replace(/sets?/gi, "séries")
       .replace(/or\s*EMOM/gi, "ou EMOM");
  
  // Determine type from content
  var lc = r.toLowerCase();
  var isHold = /^\d+[\-–]?\d*\s*s$/i.test(r) || lc.indexOf("hold") >= 0 || lc.indexOf("maintien") >= 0;
  var isAttempt = lc.indexOf("tentative") >= 0 || lc.indexOf("attempt") >= 0 || lc.indexOf("essai") >= 0;
  var isMax = lc.indexOf("max") >= 0;
  var isDuration = /^\d+\s*min/i.test(r);
  
  // Detect holds from exercise names
  var nameLc = (exName || "").toLowerCase();
  var holdExercises = ["hold","planche","lever","handstand","l-sit","hollow","arch","lean","support","maintien","suspension","hang"];
  var isHoldExercise = holdExercises.some(function(h){ return nameLc.indexOf(h) >= 0; });
  
  // ── PLAUSIBILITY GUARDS FOR HOLDS ──
  // A single hold set should never exceed 120s for advanced moves, 60s for technical moves
  function capHoldSeconds(str) {
    if (!str) return str;
    // Handle range: "15-25s" → keep as-is (it's a range, not a single value)
    if (/^\d+[\-–]\d+s?$/.test(str)) return str.replace(/s$/i, "") + "s";
    var num = parseInt(str.replace(/[^\d]/g, ""));
    if (isNaN(num)) return str;
    // Cap at 120s per set for any hold exercise
    if (num > 120) num = Math.min(num, 120);
    return num + "s";
  }
  
  // Format hold exercises — properly handle ranges like "8-15s", "15-25s"
  if ((isHold || (isHoldExercise && /^\d/.test(r))) && !isAttempt) {
    // Range pattern: "8-15s" or "15-25" 
    var rangeMatch = r.match(/^(\d+)\s*[\-–]\s*(\d+)\s*s?$/);
    if (rangeMatch) {
      var lo = Math.min(parseInt(rangeMatch[1]), 120);
      var hi = Math.min(parseInt(rangeMatch[2]), 120);
      return { value: lo + "-" + hi + "s", label: "MAINTIEN", detail: null };
    }
    // Single number: "15s" or "15"
    var singleMatch = r.match(/^(\d+)\s*s?$/);
    if (singleMatch) {
      return { value: capHoldSeconds(singleMatch[1]), label: "MAINTIEN", detail: null };
    }
    // "maintien max" or "max hold"
    if (isMax) return { value: "MAX", label: "MAINTIEN", detail: null };
  }
  
  // Format attempts
  if (isAttempt) {
    var parts = r.split("·").map(function(s){return s.trim();});
    return { value: parts[0], label: "OBJECTIF", detail: parts.length > 1 ? parts.slice(1).join(" · ") : null };
  }
  
  // Format max
  if (isMax && !isHold) {
    return { value: "MAX", label: "REPS", detail: r.indexOf("repos") >= 0 || r.indexOf("EMOM") >= 0 ? r : null };
  }
  
  // Format duration
  if (isDuration) {
    return { value: r, label: "DURÉE", detail: null };
  }
  
  // Format range (e.g. "5-8", "8-10s")
  if (/^\d+[\-–]\d+s?$/.test(r)) {
    if (r.indexOf("s") >= 0 || isHoldExercise) {
      var rMatch = r.match(/^(\d+)[\-–](\d+)/);
      if (rMatch) {
        var rLo = Math.min(parseInt(rMatch[1]), 120);
        var rHi = Math.min(parseInt(rMatch[2]), 120);
        return { value: rLo + "-" + rHi + "s", label: "MAINTIEN", detail: null };
      }
    }
    return { value: r, label: "REPS", detail: null };
  }
  
  // Simple number
  if (/^\d+$/.test(r)) {
    if (isHoldExercise) {
      var sec = Math.min(parseInt(r), 120);
      return { value: sec + "s", label: "MAINTIEN", detail: null };
    }
    return { value: r, label: "REPS", detail: null };
  }
  
  // Complex strings — clean and show
  if (r.length > 25) {
    var sentences = r.split(/[·,]/).map(function(s){return s.trim();}).filter(Boolean);
    if (sentences.length > 1) {
      return { value: sentences[0], label: "OBJECTIF", detail: sentences.slice(1).join(" · ") };
    }
  }
  
  return { value: r, label: "REPS", detail: null };
}

// ─── WORKOUT COMPONENT ────────────────────────────────────────────────────────
function Workout(props){
  var session=props.session; var onFinish=props.onFinish; var onCancel=props.onCancel;
  var exs=session.ex||[];
  var idxS=useState(0); var idx=idxS[0]; var setIdx=idxS[1];
  var setS=useState(0); var currentSet=setS[0]; var setCurrentSet=setS[1];
  var restS=useState(false); var resting=restS[0]; var setResting=restS[1];
  var restTimeS=useState(0); var restTime=restTimeS[0]; var setRestTime=restTimeS[1];
  var startS=useRef(Date.now());
  var timerRef=useRef(null);

  var ex=exs[idx]; if(!ex) return null;
  var totalSets=ex.sets||3; var totalEx=exs.length;

  function endRest(){
    setResting(false); setRestTime(0);
    if(timerRef.current){clearInterval(timerRef.current);timerRef.current=null;}
  }
  function completeSet(){
    haptic("medium"); playSound("set_done");
    if(currentSet+1>=totalSets){
      if(idx+1>=totalEx){
        haptic("done"); playSound("workout_done");
        var dur=Math.round((Date.now()-startS.current)/60000);
        onFinish({session:session,duration:Math.max(dur,1)});
        return;
      }
      setIdx(idx+1); setCurrentSet(0);
    } else {
      setCurrentSet(currentSet+1);
    }
    // Start rest
    var restDur=ex.rest||60;
    setResting(true); setRestTime(restDur);
    playSound("rest_start");
    timerRef.current=setInterval(function(){
      setRestTime(function(t){
        if(t<=1){endRest();playSound("rest_end");haptic("success");return 0;}
        if(t<=4)playSound("countdown");
        return t-1;
      });
    },1000);
  }

  useEffect(function(){return function(){if(timerRef.current)clearInterval(timerRef.current);};}, []);

  var progress=((idx*totalSets+currentSet)/(totalEx*3))*100;

  return e("div",{style:{position:"absolute",inset:0,background:T.bg,zIndex:50,
    display:"flex",flexDirection:"column",animation:"slideUp 0.3s ease"}},
    // Header
    e("div",{style:{padding:"50px 24px 14px",flexShrink:0}},
      e("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}},
        e("button",{onClick:function(){if(timerRef.current)clearInterval(timerRef.current);onCancel();},
          style:{background:"none",border:"none",color:T.textTert,fontSize:13,cursor:"pointer",fontWeight:600}},"✕ Quitter"),
        e("div",{style:{fontSize:12,color:T.textSec,fontWeight:600}},
          "Ex "+(idx+1)+"/"+totalEx)),
      e("div",{style:{height:3,background:T.border,borderRadius:2}},
        e("div",{style:{height:"100%",width:Math.min(progress,100)+"%",
          background:"linear-gradient(90deg,"+T.accent+","+T.accentLight+")",borderRadius:2,
          transition:"width 0.4s"}}))),

    // Content
    e("div",{style:{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"0 28px",gap:20,overflowY:"auto"}},

      resting
        ? e("div",{style:{textAlign:"center",width:"100%"}},
            e("div",{style:{fontSize:11,color:T.textSec,letterSpacing:2,fontWeight:700,marginBottom:12}},"REPOS"),
            e("div",{style:{fontSize:72,fontWeight:900,color:T.accent,lineHeight:1,
              textShadow:"0 0 40px "+T.accentGlow}},restTime+"s"),
            // Next exercise preview
            idx+1 < totalEx && currentSet+1 >= totalSets && e("div",{style:{
              background:T.elevated,borderRadius:16,padding:"12px 16px",marginTop:20,
              border:"1px solid "+T.border,textAlign:"left"}},
              e("div",{style:{fontSize:9,color:T.textTert,letterSpacing:1.5,fontWeight:700,marginBottom:6}},"PROCHAIN EXERCICE"),
              e("div",{style:{display:"flex",gap:10,alignItems:"center"}},
                e("div",{style:{width:6,height:6,borderRadius:"50%",background:cc((exs[idx+1]||{}).cat||"Core"),flexShrink:0}}),
                e("div",{},
                  e("div",{style:{fontSize:14,fontWeight:700,color:T.text}},exs[idx+1].name),
                  e("div",{style:{fontSize:11,color:T.textTert,marginTop:2}},exs[idx+1].sets+"×"+exs[idx+1].reps)))),
            e("div",{style:{marginTop:24}},
              e(Btn,{label:"Passer →",ghost:true,onClick:endRest})))
        : e("div",{style:{textAlign:"center",width:"100%",display:"flex",flexDirection:"column",gap:16}},
            e(ExerciseMedia,{name:ex.name,catColor:cc(ex.cat||"Core"),compact:true}),
            e("div",{style:{fontSize:10,color:cc(ex.cat||"Core"),letterSpacing:2,fontWeight:700,marginTop:4}},catLabel(ex.cat||"Core")),
            e("div",{style:{fontSize:22,fontWeight:900,color:T.text,lineHeight:1.2,padding:"0 8px"}},ex.name),
            // Formatted prescription display
            (function(){
              var rx = formatPrescription(ex.reps, ex.name);
              return e("div",{style:{display:"flex",justifyContent:"center",gap:24,margin:"10px 0",
                background:T.elevated,borderRadius:18,padding:"16px 20px",border:"1px solid "+T.border}},
                e("div",{style:{textAlign:"center",minWidth:60}},
                  e("div",{style:{fontSize:30,fontWeight:900,color:T.accent,lineHeight:1}},(currentSet+1)+"/"+totalSets),
                  e("div",{style:{fontSize:9,color:T.textTert,letterSpacing:1.5,marginTop:4,fontWeight:700}},"SÉRIE")),
                e("div",{style:{width:1,background:T.border,margin:"2px 0"}}),
                e("div",{style:{textAlign:"center",minWidth:60,flex:1}},
                  e("div",{style:{fontSize:rx.value.length > 8 ? 18 : 30,fontWeight:900,color:T.text,lineHeight:1.1}},rx.value),
                  e("div",{style:{fontSize:9,color:T.textTert,letterSpacing:1.5,marginTop:4,fontWeight:700}},rx.label),
                  rx.detail&&e("div",{style:{fontSize:11,color:T.textSec,marginTop:6,lineHeight:1.4,
                    background:T.card,borderRadius:10,padding:"6px 10px"}},rx.detail)),
                ex.rest&&ex.rest>0&&e("div",{style:{textAlign:"center",minWidth:50}},
                  e("div",{style:{fontSize:20,fontWeight:800,color:T.textSec,lineHeight:1}},
                    ex.rest>=60?Math.floor(ex.rest/60)+"′"+((ex.rest%60>0)?((ex.rest%60<10?"0":"")+ex.rest%60+"″"):""):ex.rest+"s"),
                  e("div",{style:{fontSize:9,color:T.textTert,letterSpacing:1.5,marginTop:4,fontWeight:700}},"REPOS")));
            })(),
            // Coaching cues (engine + KB-powered)
            (function(){
              var allCues = (ex.cues || []).slice();
              // Enrich with KB data if available
              if (window.KB) {
                var exNameLc = (ex.name || "").toLowerCase();
                var guideSlugMap = {"planche":"planche","front lever":"front_lever","handstand":"handstand",
                  "muscle-up":"muscle_up","dips":"dips","traction":"tractions","l-sit":"l_sit","pompes":"push_ups",
                  "hollow":"l_sit","lean":"planche","tuck":"planche"};
                var matchedSlug = null;
                Object.keys(guideSlugMap).forEach(function(k){
                  if (exNameLc.indexOf(k) >= 0 && !matchedSlug) matchedSlug = guideSlugMap[k];
                });
                if (matchedSlug) {
                  var mistakes = window.KB.getMistakesForMovement(matchedSlug);
                  if (mistakes && mistakes.length > 0 && allCues.length < 3) {
                    var topMistake = mistakes[0];
                    if (topMistake.fix) allCues.push("⚠ " + topMistake.name + " → " + topMistake.fix);
                  }
                }
              }
              if (allCues.length === 0) return null;
              return e("div",{style:{background:T.elevated,borderRadius:16,
                padding:"12px 16px",border:"1px solid "+T.border,textAlign:"left"}},
                allCues.slice(0,3).map(function(cue,i){
                  var isWarning = typeof cue === "string" && cue.indexOf("⚠") === 0;
                  return e("div",{key:i,style:{fontSize:12,color:isWarning?T.warn:T.textSec,lineHeight:1.5,
                    padding:"3px 0",display:"flex",gap:6}},
                    e("span",{style:{color:isWarning?T.warn:T.accent,flexShrink:0}},isWarning?"⚠":"✦"),
                    isWarning?cue.substring(2):cue);
                }));
            })(),
            e("div",{style:{marginTop:8,width:"100%"}},
              e(Btn,{label:"Série terminée ✓",onClick:completeSet})))
    )
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
function App(){
  var stS=useState(function(){ return hydrate()||mkState(); });
  var state=stS[0]; var setState=stS[1];
  var tabS=useState("home"); var tab=tabS[0]; var setTab=tabS[1];
  var scrS=useState("main"); var screen=scrS[0]; var setScreen=scrS[1];
  var pwS=useState(false); var showPaywall=pwS[0]; var setShowPaywall=pwS[1];
  var woS=useState(null); var workout=woS[0]; var setWorkout=woS[1];
  var dwS=useState(null); var doneWorkout=dwS[0]; var setDoneWorkout=dwS[1];
  var spS=useState(null); var selProg=spS[0]; var setSelProg=spS[1];
  var guideS=useState(null); var activeGuide=guideS[0]; var setActiveGuide=guideS[1];
  var now=new Date();
  var isPro=state.sub&&state.sub.status==="pro";

  function finishOnboarding(data){
    setState(function(prev){
      var next=Object.assign({},prev,{
        onboardingDone:true,
        profile:Object.assign({},prev.profile,{
          firstName:data.firstName, age:data.age, height:data.height, weight:data.weight,
          level:data.level, goal:data.goal, freq:data.freq,
          sessionLength:data.sessionLength, trainingMode:data.trainingMode,
          focus:data.focus, equipment:data.equipment||[],
          movements:data.movements||{}
        })
      });
      persist(next); return next;
    });
  }

  function finishWorkout(data){
    var session=data.session; var duration=data.duration;
    setWorkout(null);
    setState(function(prev){
      var todayStr=new Date().toDateString();
      var lastStr=prev.stats.lastDate?new Date(prev.stats.lastDate).toDateString():null;
      var yesterStr=new Date(Date.now()-86400000).toDateString();
      var streak=prev.stats.streak;
      if(lastStr===todayStr){}
      else if(lastStr===yesterStr) streak+=1;
      else streak=1;
      var best=Math.max(prev.stats.bestStreak,streak);
      var next=Object.assign({},prev,{
        stats:{sessions:prev.stats.sessions+1,minutes:prev.stats.minutes+duration,
          streak:streak,bestStreak:best,lastDate:new Date().toISOString()},
        history:prev.history.concat([{name:session.name,date:new Date().toISOString(),duration:duration}])});
      persist(next); return next;
    });
    setDoneWorkout({session:session,duration:duration});
  }

  function activatePro(plan){
    setState(function(prev){
      var next=Object.assign({},prev,{sub:{status:"pro",plan:plan,trialStart:new Date().toISOString()}});
      persist(next); return next;
    });
  }

  function updateNotifs(notifs){
    setState(function(prev){
      var next=Object.assign({},prev);
      next.profile=Object.assign({},next.profile,{notifications:notifs});
      persist(next); return next;
    });
  }

  function resetApp(){
    var fresh=mkState(); clearPersist(); persist(fresh); setState(fresh);
    setTab("home"); setScreen("main"); setShowPaywall(false);
    setWorkout(null); setDoneWorkout(null); setSelProg(null); setActiveGuide(null);
  }

  if(!state.onboardingDone) return e(Onboarding,{onFinish:finishOnboarding});

  var TABS=[
    {id:"home",     icon:"⌂",  label:"Accueil"},
    {id:"programs", icon:"▦",  label:"Programmes"},
    {id:"exercises",icon:"📖",  label:"Savoir"},
    {id:"progress", icon:"↗",  label:"Progression"},
    {id:"profile",  icon:"◉",  label:"Profil"},
  ];
  var timeStr=now.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});

  return e("div",{style:{background:"#000",minHeight:"100vh",display:"flex",
    justifyContent:"center",alignItems:"center",padding:"20px 0"}},
    e("div",{style:{position:"relative",width:375,height:812,background:T.bg,
      borderRadius:44,overflow:"hidden",
      boxShadow:"0 40px 120px rgba(0,0,0,0.9),0 0 0 1px rgba(139,92,246,0.06)"}},

      // Status bar
      e("div",{style:{height:48,background:T.bg,display:"flex",alignItems:"center",
        justifyContent:"space-between",padding:"0 24px",flexShrink:0,position:"relative",zIndex:2}},
        e("span",{style:{color:T.text,fontSize:15,fontWeight:600}},timeStr),
        e("div",{style:{width:120,height:32,background:"#000",borderRadius:20,
          position:"absolute",left:"50%",transform:"translateX(-50%)"}}),
        e("div",{style:{display:"flex",gap:5,alignItems:"center"}},
          isPro&&e("span",{style:{fontSize:9,color:T.gold,fontWeight:700}},"PRO"),
          e("span",{style:{fontSize:11,color:T.text}},"●●●"))),

      // Main content
      e("div",{style:{height:"calc(100% - 48px - 86px)",overflowY:"auto",overflowX:"hidden"}},
        tab==="home"&&e(HomeTab,{state:state,isPro:isPro,setShowPaywall:setShowPaywall,
          onStartWorkout:function(s){setWorkout(filterSessionForTrainingMode(s,state.profile.trainingMode,state.profile.equipment));},
          onOpenGuide:function(g){setActiveGuide(g);}}),
        tab==="programs"&&e(ProgramsTab,{state:state,isPro:isPro,setShowPaywall:setShowPaywall,
          onSelect:function(p){setSelProg(p);setScreen("program");},
          onStartWorkout:function(s){setWorkout(filterSessionForTrainingMode(s,state.profile.trainingMode,state.profile.equipment));}}),
        tab==="exercises"&&e(ExercisesTab,{isPro:isPro,setShowPaywall:setShowPaywall,
          onOpenGuide:function(g){setActiveGuide(g);}}),
        tab==="progress"&&e(ProgressTab,{state:state}),
        tab==="profile"&&e(ProfileTab,{state:state,isPro:isPro,setShowPaywall:setShowPaywall,
          onReset:resetApp,onUpdateNotifs:updateNotifs})),

      // Navigation bar
      e("div",{style:{height:86,background:T.surface,borderTop:"1px solid "+T.border,
        display:"flex",alignItems:"center",justifyContent:"space-around",
        padding:"0 4px 22px",position:"relative",zIndex:2}},
        TABS.map(function(t){
          var active=tab===t.id;
          return e("button",{key:t.id,onClick:function(){setTab(t.id);setScreen("main");},
            style:{background:"none",border:"none",cursor:"pointer",display:"flex",
              flexDirection:"column",alignItems:"center",gap:3,padding:"8px 12px",
              borderRadius:16,flex:1,WebkitTapHighlightColor:"transparent"}},
            e("div",{style:{width:36,height:28,background:active?T.accentGlow:"none",
              borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}},
              e("span",{style:{fontSize:18,color:active?T.accent:T.textTert}},t.icon)),
            e("span",{style:{fontSize:9,letterSpacing:0.5,
              color:active?T.accent:T.textTert,fontWeight:active?700:500}},t.label));
        })),

      // Modal layers
      screen==="program"&&selProg&&e(ProgDetail,{prog:selProg,isPro:isPro,setShowPaywall:setShowPaywall,
        onStartWorkout:function(s){setScreen("main");setWorkout(filterSessionForTrainingMode(s,state.profile.trainingMode,state.profile.equipment));},
        onOpenGuide:function(g){setActiveGuide(g);},
        onClose:function(){setScreen("main");}}),
      activeGuide&&e(GuideDetail,{guide:activeGuide,onClose:function(){setActiveGuide(null);}}),
      showPaywall&&e(SubFlow,{onClose:function(){setShowPaywall(false);},
        onSuccess:function(plan){activatePro(plan);setShowPaywall(false);}}),
      workout&&e(Workout,{session:workout,onFinish:finishWorkout,
        onCancel:function(){setWorkout(null);}}),

      // Workout complete screen
      doneWorkout&&e("div",{style:{position:"absolute",inset:0,background:T.bg,zIndex:60,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"32px 28px",gap:24,animation:"fadeIn 0.4s ease",overflowY:"auto"}},
        e("div",{style:{textAlign:"center"}},
          e("div",{style:{fontSize:72,animation:"checkPop 0.5s ease",lineHeight:1,marginBottom:8}},"🏆"),
          e("div",{style:{fontSize:26,fontWeight:900,color:T.text,lineHeight:1.1}},"Séance terminée !"),
          e("div",{style:{fontSize:14,color:T.textTert,marginTop:6}},"Excellent travail.")),
        e("div",{style:{background:T.elevated,border:"1px solid "+T.border,
          borderRadius:22,padding:22,width:"100%",display:"flex",flexDirection:"column",gap:12}},
          [["Séance",doneWorkout.session.name||"Séance KOVA"],
           ["Durée",doneWorkout.duration+" min"],
           ["Exercices",String((doneWorkout.session.ex||[]).length)],
           ["Total",String(state.stats.sessions)+" séances"]].map(function(row){
            return e("div",{key:row[0],style:{display:"flex",justifyContent:"space-between",padding:"2px 0"}},
              e("span",{style:{fontSize:13,color:T.textTert}},row[0]),
              e("span",{style:{fontSize:13,fontWeight:700,color:T.text}},row[1]));})),
        e("div",{style:{background:T.accentGlow,border:"1px solid "+T.accentBorder,
          borderRadius:18,padding:"14px 18px",width:"100%"}},
          e("div",{style:{fontSize:14,color:T.accent,textAlign:"center",fontWeight:700,lineHeight:1.5}},
            state.stats.streak>1
              ? "🔥 Streak de "+state.stats.streak+" jours — continue !"
              : "✓ Séance validée !")),
        e(Btn,{label:"Continuer",onClick:function(){setDoneWorkout(null);}}))));
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
