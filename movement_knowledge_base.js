/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║              KOVA — MOVEMENT KNOWLEDGE BASE (Source de Vérité)              ║
 * ║                                                                              ║
 * ║  Contenu extrait et structuré à partir des ebooks :                         ║
 * ║  • Planche E-Book (Saïan Mureau)                                            ║
 * ║  • Full Planche V2 (Valentin OTZ / Davai Calisthenics)                      ║
 * ║  • Next Level Planche (Davai Calisthenics) — avancé/555+                   ║
 * ║  • One Arm Planche E-Book (Saïan Mureau)                                    ║
 * ║  • Unlimited Endurance (Davai Calisthenics) — principes d'entraînement     ║
 * ║                                                                              ║
 * ║  ARCHITECTURE :                                                              ║
 * ║  - Chaque mouvement = 1 objet riche dans MOVEMENT_GUIDES                   ║
 * ║  - Le générateur de programmes lit cette base                               ║
 * ║  - Les programmes prédéfinis lisent cette base                              ║
 * ║  - Les fiches "mini-ebook" affichent cette base                             ║
 * ║  - Les conseils/tips de l'app puisent dans cette base                       ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

const MOVEMENT_GUIDES = {

// ═══════════════════════════════════════════════════════════════════════════════
// PLANCHE
// ═══════════════════════════════════════════════════════════════════════════════
planche: {
  title: "Planche",
  slug: "planche",
  category: "Push / Statique",
  difficulty_range: [3, 10],
  icon: "◆",
  color: "#FF6B35",

  description: "Mouvement statique emblématique de la discipline : le corps est tenu à l'horizontale, bras verrouillés, en appui sur les mains. Pour y arriver, il faut combiner protraction scapulaire, contrôle du bassin (rétroversion) et tension corporelle maximale. La planche demande autant de force brute que de maîtrise technique et d'endurance nerveuse.",

  why_it_matters: "Maîtriser la planche, c'est débloquer le pilier central du pushing en calisthenics. Elle ouvre la porte au maltese, à la one arm planche et à une quantité infinie de transitions. Au passage, elle construit une force de poussée exceptionnelle sur les deltoïdes antérieurs, le dentelé, les triceps et le core. Mais au-delà de la force, elle développe une conscience corporelle — sentir exactement comment ton corps est positionné dans l'espace. C'est aussi un vrai test mental : apprendre à normaliser la difficulté, à relativiser chaque obstacle et à se projeter dans le mouvement avant de le réaliser.",

  prerequisites: [
    { name: "15 dips propres", category: "force", critical: true },
    { name: "20 pompes propres", category: "force", critical: true },
    { name: "8 tractions", category: "force", critical: false },
    { name: "30s de gainage plank", category: "core", critical: true },
    { name: "10s de L-sit", category: "compression", critical: false },
    { name: "Handstand contre le mur 10s", category: "équilibre", critical: false },
    { name: "Souplesse poignets : extension 90°+", category: "mobilité", critical: true }
  ],

  anatomy: {
    primary: ["Deltoïdes antérieurs", "Serratus anterior (dentelé)", "Triceps"],
    secondary: ["Pectoraux", "Biceps (stabilisation bras tendu)", "Core (transverse, obliques)", "Avant-bras"],
    stabilizers: ["Trapèzes inférieurs", "Rhomboïdes", "Fléchisseurs de hanche"],
    key_insight: "Le dentelé antérieur (serratus) est le muscle le plus déterminant et le plus lent à se renforcer. C'est lui qui maintient la protraction et la hauteur en planche. Si tes planches sont basses et que tes omoplates semblent tirées en arrière, c'est probablement un déficit de dentelé."
  },

  technique: {
    form_principles: [
      { name: "Protraction scapulaire", detail: "Les omoplates doivent être poussées vers l'avant (protraction), pas tirées vers l'arrière. C'est ce qui donne la hauteur et engage le dentelé. Une protraction abusive (trop arrondi) est aussi une erreur." },
      { name: "Rétroversion du bassin", detail: "Le bassin doit être basculé vers l'arrière (posterior pelvic tilt). Cela crée la ligne droite et engage le core. Un bassin en antéversion (creux dans le dos) casse la ligne et réduit l'efficacité." },
      { name: "Bras tendus", detail: "Les bras doivent être verrouillés en extension complète. Plier les coudes réduit drastiquement la difficulté et n'est pas considéré comme une planche valide." },
      { name: "Extension totale du corps", detail: "Pointes tendues, jambes serrées et tendues, corps en ligne. L'extension active des chevilles aide à engager toute la chaîne postérieure des jambes." },
      { name: "Position de la tête", detail: "La tête guide la trajectoire. Ne pas regarder le sol mais plutôt devant soi. Rentrer la tête à mi-hauteur d'une press facilite grandement la montée." }
    ],
    grip_options: [
      { name: "Barres parallèles", detail: "Recommandé pour débuter. Plus facile pour les poignets, permet une meilleure prise et engage mieux l'avant-bras. S'assurer que l'arrière de la main est surélevé avec le poignet cassé dans l'axe de la barre.", difficulty: 1 },
      { name: "Sol (pronation)", detail: "Plus stressant pour les poignets mais développe une force différente. Utile pour les variantes avancées. Se concentrer sur les épaules et les coudes car le grip est absent.", difficulty: 2 },
      { name: "Sol (supination)", detail: "Force les biceps et les avant-bras davantage. Prépare au maltese. Commencer seulement après une bonne base en pronation.", difficulty: 3 },
      { name: "Anneaux", detail: "Surface instable à classifier indépendamment. Les autres supports aident à progresser aux anneaux, pas l'inverse. Ne commencer qu'avec une force et un contrôle suffisants.", difficulty: 4 }
    ],
    breathing: "Toujours expirer l'air avant de lancer la planche. Bloquer la respiration limite le temps de maintien — tu pourrais perdre la position non pas par manque de force mais par manque d'oxygène. Avec le temps et la maîtrise, tu pourras respirer naturellement en position."
  },

  common_mistakes: [
    { name: "Rétraction scapulaire", severity: "haute", description: "Omoplates tirées en arrière au lieu d'être en protraction. Rend la planche basse et stressante pour les épaules.", fix: "Travailler les scapula push-ups intensivement. Intégrer l'intention de protraction à chaque tentative." },
    { name: "Bras pliés", severity: "haute", description: "Les coudes fléchissent sous la charge. Réduit l'intensité réelle et empêche la progression.", fix: "Vérifier la rotation externe de l'épaule — le deltoïde antérieur doit faire face au sol. Poignets, avant-bras, coudes, biceps et épaules doivent travailler dans la même trajectoire." },
    { name: "Manque de rétroversion", severity: "moyenne", description: "Le bassin reste en position neutre ou en antéversion (creux). Casse la ligne et surcharge le bas du dos.", fix: "Renforcer le hollow body hold. Pratiquer la rétroversion active à chaque tentative." },
    { name: "Travailler la forme propre trop tôt", severity: "haute", description: "Se concentrer sur la forme parfaite sans avoir assez de force. Bloque complètement la progression.", fix: "Accepter la bad form pour accumuler du volume. La forme se corrige APRÈS la force, pas avant. C'est un processus binaire : force → volume → forme → répéter un cran au-dessus." },
    { name: "Cassure du poignet", severity: "moyenne", description: "Le poignet casse sous l'angle, ce qui empêche d'utiliser pleinement le grip et la chaîne arrière du bras.", fix: "Travailler le conditionnement des poignets. Ajuster la position des mains par rapport à la barre." },
    { name: "Protraction abusive", severity: "faible", description: "Trop de protraction crée un arrondi excessif du haut du dos.", fix: "Trouver le juste milieu : protraction active sans arrondir le dos." }
  ],

  progressions: [
    {
      level: 0,
      name: "Renforcement de base (1/2)",
      slug: "renforcement_base_1",
      description: "Construction des fondations de force avant le travail spécifique. Le but est d'atteindre les prérequis minimaux pour commencer les figures.",
      target: "15 Dips / 20 Pompes / 8 Tractions",
      exercises: [
        { name: "Dips", reps: "80% max", rest: "1:30-4:00", focus: ["bras", "épaules"] },
        { name: "Pompes (normal/large/diamant)", reps: "80% max, changer de prise à chaque set", rest: "1:30-4:00", focus: ["bras"] },
        { name: "Tractions (normal/large/supination)", reps: "80% max, changer de prise", rest: "1:30-4:00", focus: ["bras", "épaules"] },
        { name: "L-Sit", reps: "max hold", rest: "1:30-4:00", focus: ["compression"] },
        { name: "Pike push-ups", reps: "max", rest: "1:30-4:00", focus: ["épaules"] },
        { name: "Gainage au sol (plank)", reps: "max hold", rest: "1:30-4:00", focus: ["core"] }
      ],
      format: "Circuit × 4 — 1:30 repos entre exercices, 4:00 entre circuits",
      duration: "60-90 min"
    },
    {
      level: 0.5,
      name: "Renforcement de base (2/2)",
      slug: "renforcement_base_2",
      description: "Renforcement spécifique à la planche. Introduction des premiers exercices de poussée horizontale et de contrôle corporel.",
      target: "10s Tuck planche / 8 HSPU mur / 10s Handstand",
      exercises: [
        { name: "Tuck Planche hold", reps: "max hold", rest: "1:30-4:00", focus: ["épaules", "core", "contrôle"] },
        { name: "HSPU contre le mur", reps: "max", rest: "1:30-4:00", focus: ["bras"] },
        { name: "Semi Planche hold", reps: "max hold", rest: "1:30-4:00", focus: ["bras", "core"] },
        { name: "Lean Planche push-ups", reps: "max", rest: "1:30-4:00", focus: ["épaules", "contrôle"] },
        { name: "L-Sit to Tuck Planche", reps: "max", rest: "1:30-4:00", focus: ["compression", "épaules"] },
        { name: "Dips", reps: "max", rest: "1:30-4:00", focus: ["bras"] },
        { name: "Tractions", reps: "max", rest: "1:30-4:00", focus: ["bras", "épaules"] }
      ],
      format: "Circuit × 4 — commencer par 15-20 min de travail Handstand contre le mur",
      duration: "60-90 min"
    },
    {
      level: 1,
      name: "Objectif Straddle Planche",
      slug: "objectif_straddle",
      description: "Le vrai travail de planche commence. Focus sur le hold en straddle avec élastique, les négatives, et les premières combinaisons. C'est le moment d'appliquer le principe binaire : accumuler de la force d'abord, nettoyer la forme ensuite.",
      target: "3 secondes de straddle planche",
      exercises: [
        { name: "Max hold straddle avec élastique", reps: "max hold × 3-6 séries", rest: "3:00-4:00", focus: ["épaules", "core"] },
        { name: "Négatives straddle avec élastique", reps: "3-6 séries", rest: "3:00-4:00", focus: ["épaules", "core"] },
        { name: "Tuck push-ups", reps: "max", rest: "2:00-4:00", focus: ["bras"] },
        { name: "Lean to Tuck to Lean", reps: "max reps dead stop", rest: "2:00-3:00", focus: ["épaules", "core"] },
        { name: "Tuck kick to straddle", reps: "max", rest: "2:00-3:00", focus: ["épaules", "core"] },
        { name: "HS press + négative", reps: "max", rest: "2:00-3:00", focus: ["contrôle", "épaules"] },
        { name: "Zanetti fly", reps: "max + iso", rest: "2:00-4:00", focus: ["bras", "épaules"] },
        { name: "Combo libre avec élastique", reps: "max effort, ne pas s'arrêter sur un échec technique", rest: "4:00", focus: ["contrôle", "bras", "épaules", "core"] }
      ],
      combos: [
        "Tuck push up → L-sit → Tuck kick straddle → Straddle max",
        "Tuck press → L-sit → Négative tuck hold → Semi planche hold 3s",
        "Tuck push up × 2 → L-sit → Straddle push up non hold → L-sit → Tuck to straddle",
        "L-sit → Straddle + press → Négative → L-sit → Straddle max",
        "Handstand → Négative straddle → L-sit → Handstand → Négative → L-sit → Straddle"
      ],
      session_structure: {
        choice_1_low_energy: "Renfo à l'élastique intensif + renforcement musculaire (dips lestées, tractions, curl, zanetti, HSPU)",
        choice_2_medium_energy: "Choisis 3-5 exercices de renforcement ciblé selon tes faiblesses",
        choice_3_high_energy: "Enchaînements de combinaisons — 1h de combos"
      },
      format: "Max → Adaptation → Combos ou Renfo selon énergie",
      duration: "60-120 min"
    },
    {
      level: 2,
      name: "Objectif Full Planche",
      slug: "objectif_full",
      description: "Tu as ta straddle. L'objectif devient la full planche. Les MAX en début de séance jaugent ton énergie du jour. Ensuite, combinaisons intensives. C'est normal que la full commence en mauvaise forme — le processus binaire s'applique toujours.",
      target: "3 secondes de full planche",
      exercises: [
        { name: "Max du moment", reps: "3-4 séries (hold, press, max hold to press, max push up deadstop)", rest: "4:00-5:00", focus: ["évaluation", "force max"] },
        { name: "Combinaisons (voir combos)", reps: "1h de combos", rest: "4:00-5:00 entre combos", focus: ["volume", "endurance"] },
        { name: "Full hold avec élastique", reps: "max hold", rest: "2:00", focus: ["épaules", "core"] },
        { name: "Full push-ups avec élastique", reps: "max dead stop", rest: "2:00", focus: ["core", "bras"] },
        { name: "Full press avec élastique", reps: "max", rest: "2:00", focus: ["épaules", "core"] },
        { name: "90° push-ups parallèles", reps: "max, coudes", rest: "3:00-4:00", focus: ["bras", "core"] }
      ],
      combos: [
        "Straddle 3s → push up → L-sit → Négative straddle hold → V-sit → Tuck to straddle",
        "Straddle press rapide → L-sit → Négative max hold → Straddle push up max non hold",
        "Full planche max hold → L-sit → Straddle push up to press → L-sit → Tuck to straddle",
        "Straddle push up × 3 deadstop hold 3s → L-sit → 90° push up → Négative straddle",
        "3× Tuck push up hold → V-sit → Tuck to straddle → L-sit → Straddle push up max",
        "OAH → Straddle press deadstop → V-sit → Négative full to straddle → L-sit → Tuck to straddle"
      ],
      format: "Max (évaluation) → Combos 1h ou Renfo selon énergie",
      duration: "90-120 min"
    },
    {
      level: 3,
      name: "Full Planche maîtrisée — Et après ?",
      slug: "full_maitrisee",
      description: "Tu as ta full planche. L'erreur la plus fréquente est de délaisser totalement la straddle. Un max hold seul ne te fera jamais progresser en press ou en push up. Le volume via les combinaisons te fait progresser PARTOUT. Lance tes fulls en début de séance, puis rallonge avec des straddle.",
      target: "Full planche 5-10s + transitions propres",
      note: "Ne pas négliger la straddle. Les combos commencent par des fulls et se prolongent avec des straddle pour le volume.",
      combos: [
        "Straddle press deadstop → V-sit → Négative full to straddle → V-sit → Négative straddle → Tuck to straddle",
        "Full planche → L-sit → Straddle planche négative hold → Tuck to straddle push up → Straddle push up max",
        "Full press rapide → V-sit → Full press deadstop → Négative straddle → Tuck to straddle → V-sit → Straddle press fermé full",
        "HS push up → Négative full hold → L-sit → Straddle push up → Straddle press → L-sit → Straddle max hold"
      ],
      format: "Full en début → Combos mixtes full/straddle → Renfo ou élastique selon énergie"
    },
    {
      level: 4,
      name: "Next Level — De Full à 555+",
      slug: "next_level",
      description: "Tu maîtrises la full planche et les transitions. L'objectif est maintenant la performance : xxx, combinaisons longues, endurance. Tu dois maintenant diversifier les supports (sol, supination, anneaux) et les formats d'entraînement. La planification littérale ne suffit plus — apprends à t'adapter au jour le jour.",
      source: "Next Level Planche (Davai Calisthenics)",
      note: "L'évolution de la force en poids du corps est un phénomène binaire : gain de force/volume → correction de la forme → accepter de re-dégrader la forme pour monter le volume → re-corriger un cran plus haut.",
      methods: [
        { name: "Méthode Combos", detail: "Combinaisons longues et complètes. Haut volume dans les combos, moins de séries globales. Suit les 3 règles : décroissant, forme dégressive, alterner les groupes musculaires." },
        { name: "Méthode Répétition", detail: "Combinaisons courtes et périodes de repos. Peu de volume par combo, beaucoup de séries au total. Maintient mieux la force au cours de la séance." },
        { name: "XXX", detail: "Le meilleur principe d'entraînement pour l'endurance. Push-press-hold dans tous les sens possibles. Ne mène jamais à la stagnation car infiniment adaptable. Tu travailles toutes les variantes simultanément et peux équilibrer constamment tes niveaux entre elles." },
        { name: "XXXX", detail: "Complémentaire au xxx. On ajoute un premier mouvement (HSPU, wide planche, maltese, OAP) avant le xxx pour créer de la fatigue préalable. Gérer la pause entre les deux pour progresser." },
        { name: "EMOM", detail: "Every Minute On the Minute. Définir un nombre de reps à faire chaque minute pendant X minutes. Progresser en augmentant les minutes, puis les reps. En fin de séance pour vider les réserves. Attention : nerveusement épuisant, ne pas en abuser." },
        { name: "Spam", detail: "Volume brut maximal sur une seule variante. Pour la force brute. Ne pas spammer en utilisant la tête ou en perdant la position d'épaule — négliger la forme n'est pas négliger l'activation musculaire." },
        { name: "Reps partielles", detail: "Isoler la partie problématique d'un mouvement. Utile pour débloquer un nouveau mouvement ou gagner en endurance sur une amplitude spécifique." },
        { name: "Max hold to press/pushup", detail: "Faire un max hold puis enchaîner press ou pushup avant de tomber. Force à garder la bonne trajectoire et la hauteur maximale." },
        { name: "Combos courts (focus technique)", detail: "Isoler une transition problématique. Les transitions sont souvent plus dures que le mouvement lui-même. Plus la transition est fluide, moins tu dépenses de force = économie = gain." },
        { name: "Combos longs (focus endurance)", detail: "3 règles : 1) Figures en décroissant 2) Alterner les groupes + respirer 3) Forme dégressive pour maximiser le volume." },
        { name: "Travail avec bande élastique lesté", detail: "Rend le mouvement plus dur et moins stable. Maintenir au moins 50% du volume normal. 5 kg déjà très dur pour un avancé, 15 kg max pour un pro." },
        { name: "Yeux bandés (proprioception)", detail: "Oblige à se concentrer uniquement sur les sensations. Gain massif en contrôle et confiance. ATTENTION : uniquement sur barres basses." }
      ],
      training_formats_advanced: {
        lesté: "Ajouter du poids (genoux, chevilles) pour augmenter la force max et donc le volume global sans poids. Commencer léger.",
        surfaces: "Sol, barres parallèles basses/hautes, supination, pronation, anneaux. Chaque surface développe des forces différentes et complémentaires.",
        combo_exam_phase1: "Hold 2s → Push up dead stop → Press → Négative → Hold 2s",
        combo_exam_phase2: "333 dynamique en bonne forme (push-press-hold)",
        combo_exam_phase3: "555 en forme moyenne"
      }
    }
  ],

  readiness_tests: [
    { name: "Test Tuck", description: "Tenir un tuck planche bras tendus 10s → prêt pour le niveau 1", level_unlocked: 1 },
    { name: "Test Straddle", description: "Tenir une straddle planche 3s → prêt pour le niveau 2", level_unlocked: 2 },
    { name: "Test Full", description: "Tenir une full planche 3s → prêt pour le niveau 3", level_unlocked: 3 },
    { name: "Test Combo 1", description: "Hold 2s → Push up dead stop → Press → Négative → Hold 2s proprement → prêt pour Next Level phase 2", level_unlocked: 4 },
    { name: "Test 333", description: "333 dynamique en bonne forme → prêt pour Next Level phase 3", level_unlocked: 4 },
    { name: "Test 555", description: "555 en forme moyenne → prêt pour diversification complète", level_unlocked: 4 }
  ],

  programming_guidelines: {
    binary_evolution: "La progression suit un cycle binaire : accumule de la force et du volume (même avec une forme imparfaite), puis corrige la forme avec cette force acquise, puis recommence un cran au-dessus. Ce cycle se répète indéfiniment.",
    intensity_rule: "En poids du corps, l'intensité dépend de la qualité d'exécution. Relâcher un peu la forme permet d'augmenter le volume — c'est voulu et nécessaire à certaines phases.",
    form_vs_strength: "Chercher la forme parfaite trop tôt bloque la progression. La force vient d'abord, la propreté suit. Investis ton énergie dans la construction de force avant de polir la technique.",
    strength_period: { ratio: "80% renforcement / 20% forme", description: "Quand la force manque pour une figure. Le travail de forme reste en arrière-plan, en fin de séance avec assistance." },
    form_period: { ratio: "80% forme / 20% renforcement", description: "Quand tu tiens 7-8s en forme dégradée. Focus sur la correction. Le renforcement brut passe en arrière-plan." },
    variant_balance: "Hold, press, push-up — si l'une de ces variantes décroche par rapport aux autres, c'est le moment de la cibler. Alterne les focus régulièrement."
  },

  volume_guidelines: {
    session_duration: "60 à 180 min selon le niveau et l'énergie. Après 2h d'intensif, le progrès devient plus technique.",
    rest_short_intense: "1-3 min pour exercice court et intense (~10s) = gain de force max",
    rest_long_combo: "4-5 min pour combo long (~20-40s) = résistance nerveuse",
    rest_failure: "Jusqu'à 7 min si travail au fallo total",
    rest_xxx: "7-10 min entre les xxx/xxxx",
    order: "Toujours du plus dur au plus facile : Volume → Combos courts/intenses → Élastique",
    deload: "Si stagnation persistante, réduire volontairement l'intensité pendant une semaine complète. Si ça continue, 2-3 jours de repos consécutifs."
  },

  frequency_guidelines: {
    training_days: "3 à 5 jours par semaine selon l'énergie ressentie. 4 minimum recommandé pour une bonne progression.",
    active_rest: "Préférable au repos total. Étirements, mobilité, équilibre, exercices à faible volume/intensité, environ 30 min à effort modéré.",
    listen_to_body: "Pas de jours de repos imposés. Adapter au taux d'énergie journalier. Si un jour tu as des courbatures mais que le système nerveux est frais, tu peux performer.",
    adaptation_warnings: [
      "Big level up : le corps doit assimiler le nouveau effort. Ne pas pousser au max immédiatement.",
      "Changement de saison : les articulations, muscles et le corps réagissent aux variations de température, pression atmosphérique, humidité.",
      "Changement de programmation : même si tout va bien, ne pas mettre trop d'intensité les premières semaines."
    ],
    example_good_week: "Lun: Training | Mar: Repos actif | Mer: Training | Jeu: Training | Ven: Repos actif | Sam: Training | Dim: Repos",
    example_tired_week: "Lun: Training | Mar: Repos actif | Mer: Training | Jeu: Repos | Ven: Training | Sam: Training | Dim: Repos actif"
  },

  warmup: {
    structure: [
      { phase: "Cardio-vasculaire", duration: "5 min", items: ["Corde à sauter", "Course légère", "Burpees légers"] },
      { phase: "Articulaire", duration: "5-7 min", items: ["Cercles poignets", "Flexion/extension coudes", "CARs épaules (cercles)", "Cercles scapulaires"] },
      { phase: "Musculaire", duration: "5-8 min", items: ["Scapula push-ups 3×12", "Band pull-aparts 2×15", "Band external rotation 2×15", "Zanetti press 2×10", "Lean planche 2×10s"] },
      { phase: "Étirements zones de travail", duration: "5 min", items: ["Extension poignets 45s", "Pec stretch 30s", "Extension thoracique", "Automassage si tensions"] },
      { phase: "Surcharge progressive", duration: "3-5 min", items: ["Quelques séries avec élastique pour impliquer les muscles et mettre à jour la proprioception", "Planche lean facile", "Band tuck planche 3×6s"] }
    ],
    key_point: "À la fin de l'échauffement tu dois te sentir chaud, énergique et mentalement prêt. Tu ne dois EN AUCUN CAS te sentir fatigué.",
    duration_total: "20-25 min"
  },

  mindset: {
    normaliser_la_difficulte: "Comment tu perçois l'objectif influence directement ta progression. Plus tu la vois comme inaccessible, plus elle le sera. Rappelle-toi que la planche est un mouvement accessible à toute personne prête à travailler correctement.",
    se_projeter: "Visualise la position finale avec précision — pas juste une image floue, mais les sensations musculaires, l'angle des bras, la tension du core. Cette projection mentale ancre le mouvement avant même de l'exécuter.",
    effort_et_douleur: "L'effort intense est un signal positif. La douleur articulaire ne l'est pas. Apprends à distinguer les deux : un muscle qui brûle au max = bon signe. Une articulation qui tire = signal d'arrêt.",
    accepter_les_phases: "La progression n'est jamais linéaire. Tu auras des jours où tout semble facile et d'autres où tu recules. Chaque phase descendante précède souvent un palier. Note tes progrès, même les plus subtils.",
    se_feliciter: "Trouve du positif dans chaque séance. Reproduire une performance en étant fatigué est déjà un progrès. La seule validation qui compte, c'est celle que tu te donnes."
  },

  warning_flags: [
    { flag: "Douleur persistante", action: "Ne JAMAIS pousser à travers une vraie douleur. Changer de grip si possible, sinon arrêter ce mouvement. Traiter la zone (étirements, automassage) ou consulter un professionnel." },
    { flag: "Tendinopathie", action: "2-3 jours de repos pour réduire l'inflammation. Ensuite travailler en-dessous du seuil 3-4/10 de douleur pour maintenir l'irrigation du tissu et la mobilité." },
    { flag: "Stagnation", action: "D'abord vérifier le mindset (visualisation, relativisation). Si rien de psychologique, vérifier les paramètres physiques : conditionnement, mobilité, body fat. Essayer une semaine de deload." },
    { flag: "Lâcher les barres brusquement", action: "Toujours relâcher les barres PROGRESSIVEMENT en fin de combo/hold. Évite d'accentuer les douleurs aux avant-bras." },
    { flag: "Protège-poignets/coudières", action: "Ne PAS utiliser d'accessoires pour camoufler une douleur. La douleur est un signal. Si tu as mal, soigne-toi directement plutôt que de masquer." }
  ],

  equipment_options: [
    { name: "Barres parallèles", advantage: "Plus facile pour les poignets, meilleur grip, recommandé pour débuter", when: "toujours" },
    { name: "Sol", advantage: "Force les épaules et coudes sans grip. Force différente et complémentaire", when: "intermédiaire+" },
    { name: "Élastique", advantage: "Focus technique, accès à des éléments trop intenses, quantification des progrès. Ne doit PAS rendre l'exercice trop facile.", when: "toujours, en complément" },
    { name: "Anneaux", advantage: "Surface instable, force unique. Les autres supports aident à progresser aux anneaux.", when: "avancé+" },
    { name: "Lest (chevilles/genoux)", advantage: "Augmente la force max, le volume global monte ensuite sans poids. Commencer à 0.5-0.75kg par cheville", when: "avancé+" },
    { name: "Bande élastique lestée", advantage: "Rend plus dur ET moins stable. Garder au moins 50% du volume. 5kg déjà beaucoup pour avancé, 15kg max pour pro", when: "avancé+" }
  ],

  faq: [
    { q: "Faut-il une forme parfaite dès le début ?", a: "Non — c'est même l'erreur la plus fréquente. La forme se nettoie après avoir construit suffisamment de force. Accepter une exécution imparfaite au début est indispensable pour progresser." },
    { q: "En combien de temps peut-on atteindre la full planche ?", a: "Très variable selon la morphologie, le poids et la régularité. Certains y arrivent en 1-2 ans, d'autres en 3+. Les personnes plus grandes ou plus lourdes ont un bras de levier plus long, ce qui augmente la difficulté." },
    { q: "C'est plus difficile si on est grand ?", a: "Oui. Le bras de levier joue un rôle important en isométrie. Ce n'est pas une excuse pour ne pas progresser, mais un paramètre à prendre en compte dans tes attentes." },
    { q: "Quand passer de la straddle à la full ?", a: "Quand ta straddle est solide et que tu enchaînes des combinaisons complètes. Commence par introduire la full dans tes combos (tentatives, négatives) avant de la cibler directement." },
    { q: "Le format xxx, c'est quoi exactement ?", a: "Un enchaînement cyclique entre push-up, press et hold dans tous les ordres possibles. C'est l'un des meilleurs outils d'endurance : adaptable à l'infini, il fait travailler toutes les variantes en simultané." },
    { q: "Peut-on travailler d'autres mouvements en parallèle ?", a: "Oui, c'est même recommandé. Attention simplement à ne pas surcharger les mêmes zones articulaires — le coude et l'épaule sont très sollicités en planche." }
  ],

  glossary: [
    { term: "Hold", def: "Maintenir une position statique" },
    { term: "Press", def: "Montée bras tendus de la position de planche au handstand" },
    { term: "Push up", def: "Pompe en position de planche" },
    { term: "Négative", def: "Descente contrôlée du handstand à la planche (inverse d'une press)" },
    { term: "Deadstop", def: "Tenir (hold) brièvement avant ou après une push up ou press — pas de rebond" },
    { term: "PR", def: "Personal Record — tes performances maximum" },
    { term: "Deload", def: "Semaine où tu réduis volontairement l'intensité pour récupérer le système nerveux" },
    { term: "XXX", def: "Alternance de push up - press - hold (ou autre ordre) en boucle. Meilleur outil d'endurance." },
    { term: "XXXX", def: "Comme le xxx mais avec un mouvement supplémentaire en début (HSPU, wide, maltese)" },
    { term: "EMOM", def: "Every Minute On the Minute — X reps toutes les minutes pendant Y minutes" },
    { term: "Spam", def: "Volume brut maximal sur une seule variante pour la force brute" },
    { term: "Combo", def: "Enchaînement de plusieurs figures/transitions sans pause" },
    { term: "Bad form", def: "Forme dégradée volontairement pour accumuler du volume et de la force" },
    { term: "Clean form", def: "Forme techniquement correcte avec protraction, rétroversion, ligne" }
  ],

  summary: "La planche se construit par un cycle binaire : accumulation de force (même en forme imparfaite) → correction de la technique → on recommence plus haut. L'échauffement est essentiel (20-25 min structurées). L'approche mentale joue un rôle majeur : normaliser la difficulté, se projeter, rester positif. Le travail se fait 3-5 jours par semaine avec repos actif. À partir du niveau straddle, les combinaisons deviennent l'outil principal de progression."
},

// ═══════════════════════════════════════════════════════════════════════════════
// ONE ARM PLANCHE (OAP)
// ═══════════════════════════════════════════════════════════════════════════════
one_arm_planche: {
  title: "One Arm Planche",
  slug: "one-arm-planche",
  category: "Push / Statique Avancé",
  difficulty_range: [8, 10],
  icon: "✦",
  color: "#D4A843",

  description: "La One Arm Planche (OAP) est une figure statique où le corps est maintenu à l'horizontale sur un seul bras d'appui tendu, l'autre servant de balancier. Les jambes sont tendues et serrées, le tronc horizontal, créant une ligne. C'est l'une des figures les plus impressionnantes du street workout, demandant un niveau de force, d'équilibre et de contrôle exceptionnel.",

  why_it_matters: "La OAP est considérée comme l'aboutissement ultime du pushing en calisthenics. Elle développe une force unilatérale extraordinaire et une proprioception de très haut niveau. Maîtriser la OAP clean form place l'athlète parmi les meilleurs au monde.",

  prerequisites: [
    { name: "5 secondes de straddle planche", category: "force", critical: true },
    { name: "Full planche solide", category: "force", critical: true },
    { name: "10 secondes de Handstand Flag des deux côtés", category: "équilibre", critical: true },
    { name: "Bonne souplesse des obliques/intercostaux", category: "mobilité", critical: true }
  ],

  anatomy: {
    primary: ["Deltoïdes antérieurs et latéraux", "Grands dorsaux", "Obliques et intercostaux"],
    secondary: ["Biceps", "Avant-bras", "Triceps"],
    key_insight: "Les obliques et intercostaux jouent un rôle crucial dans la OAP — bien plus que dans la planche classique. Le conditionnement latéral est essentiel."
  },

  technique: {
    positioning: {
      head: "Toujours regarder DEVANT soi, pas vers le bras d'appui. La tête détermine la trajectoire.",
      grip_floor: "Étendre au maximum les doigts pour remplir le plus de surface possible. Meilleure gestion de l'équilibre. Main à plat ou doigts légèrement pliés selon préférence.",
      grip_parallettes: "Cassure du poignet vers l'extérieur pour la stabilité. Préférer des barres rondes.",
      balance_arm: "Le bras libre aide à se diriger et donne de la stabilité. L'étendre au maximum, paume vers l'intérieur. L'addition tête + paume de main détermine la position.",
      alignment: "Quand tu regardes pouce et auriculaire : jambes alignées avec l'auriculaire, haut du corps suivant la courbure du pouce. Épaules à la même hauteur."
    },
    entries: [
      { name: "Lean", difficulty: "Plus dur mais plus courant", steps: ["Main à plat, pieds rejoignent la main (un pied au niveau de l'auriculaire, l'autre devant la main d'appui)", "Commencer à lean en formant un C avec le corps — utiliser obliques et intercostaux", "Avancer jusqu'au point d'équilibre, décoller doucement (sauter si nécessaire au début)", "Resserrer les jambes, jambe loin au niveau du pouce, autre alignée avec l'auriculaire", "Extension maximale : pointes, bras, hauteur avec les talons"] },
      { name: "Négative", difficulty: "Moins technique, plus abordable pour débuter", steps: ["Handstand bras tendu — expirer l'air AVANT la descente", "Ouvrir légèrement les jambes, regarder devant avec la tête", "Orienter le tronc en suivant la tête tout en descendant les jambes", "En position OAP à deux bras, lâcher progressivement le bras d'équilibre (passer sur les doigts d'abord)", "Extension maximale"] }
    ],
    breathing: "Toujours expirer l'air au début du mouvement. En expirant tu te sentiras plus fort et auras moins la sensation d'oppression. La OAP est maîtrisée quand tu peux respirer naturellement ou même parler en maintenant la position."
  },

  common_mistakes: [
    { name: "OAP Banana", severity: "CRITIQUE", description: "Manque de hauteur compensé en écrasant les obliques pour faire remonter les jambes. Tout le poids est réparti à l'arrière, provoquant un tassement de l'omoplate. SEULE forme à éviter absolument — risque de blessures importantes.", fix: "Toujours chercher à aller le plus possible vers l'avant. Si tu tombes directement, passer à des variations plus simples." },
    { name: "Pike OAP (portefeuille)", severity: "acceptable début", description: "Trajectoire descendante, bassin trop haut. Raccourcit le bras de levier. Forme idéale pour commencer.", fix: "Descendre progressivement l'angle du bassin au fur et à mesure de la progression." },
    { name: "Bras plié", severity: "acceptable début", description: "Facilite grandement le maintien. Les sensations sont proches de la clean form.", fix: "Chercher à verrouiller le bras progressivement, pas chercher la perfect form d'un coup." },
    { name: "OAP Straddle (jambes ouvertes)", severity: "moyenne", description: "Beaucoup de gens ne réalisent pas que les jambes doivent être serrées.", fix: "Comme pour la planche classique, jambes impérativement serrées l'une contre l'autre." },
    { name: "OAP Semi-Flag", severity: "faible", description: "Tronc pas en adéquation avec la trajectoire du pouce lors du passage OAF → OAP.", fix: "Travailler la transition OAF → OAP spécifiquement." }
  ],

  progressions: [
    { level: 0, name: "Handstand Flag", target: "10s des deux côtés", description: "Bon moyen de préparer le corps aux sensations de la OAP. Travailler le OAH à côté (pas obligatoire mais fortement recommandé)." },
    { level: 1, name: "Side Planches", prereq: "5s straddle planche", description: "Recrute énormément les obliques et intercostaux. Intégrer en milieu de séance dans les combos. Possible en straddle si pas encore la full." },
    { level: 2, name: "One Arm Flag", prereq: "10s handstand flag des deux côtés", description: "LE MEILLEUR EXERCICE pour travailler la OAP. Énormes similitudes en ressenti, muscles sollicités, trajectoires. Un OAF solide = les meilleures bases pour la OAP. Le placer dans les combos ou en séance dédiée.", target: "5s des deux côtés" },
    { level: 3, name: "Négatives OAP 2 bras + OAF bras collé", prereq: "Maîtrise OAF", description: "Incliner progressivement le bassin. Le OAF aide à avoir la souplesse et résistance pour les négatives. Continuer à améliorer le OAF (hold plus long, angle plus aigu, bras collé).", target: "10s OAP 2 bras, 10s OAF, 3-5s bras collé" },
    { level: 4, name: "Lean OAP + Négative OAP", description: "Le niveau le plus difficile : les premières vraies OAP. Intégrer la bad form. Séances entières dédiées à la OAP, combos en alternant sol et parallèles.", target: "12s OAP bad form (négative), 8s bonnes (lean)" },
    { level: 5, name: "OAP Clean Form", description: "Réduire volontairement le volume pour se concentrer sur la correction de la forme. Processus long : revoir TOUS les automatismes. Corriger les défauts un par un. Intégrer le travail à l'élastique.", target: "3s clean form" },
    { level: 6, name: "OAP Clean Form maîtrisée", description: "Retrouver le volume acquis en bad form mais en l'appliquant à la clean form. Jongler entre volume et forme.", target: "8-10s perfect form" }
  ],

  variants: [
    { name: "OAP Push-up", type: "dynamique", difficulty: 10, description: "L'un des éléments les plus rares. Force/équilibre/trajectoire très précis. Orienter le regard plus proche des doigts lors de la descente. Compenser en pliant le bras libre. Critères clean : buste dans l'axe, ligne tenue, pas de kipping, amplitude correcte." },
    { name: "OAP Press", type: "dynamique", difficulty: 8, description: "Plus abordable que la push-up. Avec une bonne technique, il est plus simple de presser que de juste hold clean. Orienter le regard vers le bras d'appui, trajectoire plongeante." },
    { name: "OAP sur les poings", type: "statique", difficulty: 8, description: "Pas plus de force requise mais technique particulière. Poing dans l'axe comme sur parallèle, pouce au-dessus sans toucher le sol. Difficulté = équilibre + résistance à la douleur." },
    { name: "OAP sur les doigts", type: "statique", difficulty: 9, description: "Dépend beaucoup de la génétique des pouces (souplesse de la dernière phalange). Objectivement pas la plus dure mais le facteur génétique peut la rendre BEAUCOUP plus difficile." },
    { name: "OAP bras collé (main au dos)", type: "statique", difficulty: 10, description: "Considérée comme la VRAIE OAP. Suite logique : le deuxième bras est une AIDE qu'on réduit progressivement. Maîtriser le bras collé rend la OAP classique ridiculement facile. Tout reprendre depuis le début pour cette variante." }
  ],

  programming_guidelines: {
    frequency: "3 entraînements MAX par semaine. Ne JAMAIS enchaîner 2 jours consécutifs de OAP.",
    bilateral: "TOUJOURS travailler des deux côtés.",
    safety: "Si sensation de décharge électrique → arrêter immédiatement et prendre quelques jours de repos.",
    weighted: "Le lesté (0.5-0.75kg par cheville) est une méthode puissante mais OCCASIONNELLE. 1× par semaine pour s'habituer. Max hold en dégressives (poids puis sans poids sans repos).",
    session_structure: "Début : tentatives, combos incluant OAP. Milieu : travail spécifique OAF/sides/négatives. Fin : conditionnement et étirements."
  },

  volume_guidelines: {
    session_duration: "Variable — séances dédiées possibles à partir du niveau 4",
    rest_between_attempts: "3-5 min",
    integration: "Aux niveaux 1-3, intégrer dans les combos de planche. Aux niveaux 4+, séances dédiées."
  },

  frequency_guidelines: {
    max_sessions: "3/semaine",
    no_consecutive: true,
    always_bilateral: true,
    warning: "Mouvement très traumatisant pour le corps. Respecter les jours off."
  },

  warmup: {
    structure: [
      { phase: "Cardio-vasculaire", items: ["Identique planche"] },
      { phase: "Articulaire", items: ["Poignets et avant-bras en priorité"] },
      { phase: "Musculaire", items: ["Coiffe des rotateurs (élastique tous les sens)", "Scapula push up / élévation barre"] },
      { phase: "Étirements", items: ["Obliques et intercostaux : étirements passifs et actifs à l'élastique puis bâton"] },
      { phase: "Surcharge progressive", items: ["Travail à l'élastique comme pour la planche"] }
    ],
    conditioning: {
      lower_body: "Souplesse et compression — éviter les blessures et débloquer la OAP plus naturellement",
      upper_body: "Renforcement épaules, rotateurs",
      wrists: "Étirements et renforcement spécifique avant-bras/poignets",
      stick_stretches: "Tenir 3s minimum chaque position, augmenter sur zones de tension",
      band_stretches: "Travail passif et actif pour les obliques et intercostaux"
    }
  },

  warning_flags: [
    { flag: "Décharge électrique", action: "Arrêter IMMÉDIATEMENT. Quelques jours de repos." },
    { flag: "Forme banana", action: "JAMAIS continuer. Risque de blessure omoplate. Régresser à des variantes plus simples." },
    { flag: "Douleur omoplate", action: "Vérifier qu'on cherche toujours à aller vers l'avant, pas à compenser la hauteur avec les obliques." }
  ],

  glossary: [
    { term: "OAP", def: "One Arm Planche" },
    { term: "OAF", def: "One Arm Flag" },
    { term: "OAH", def: "One Arm Handstand" },
    { term: "Side", def: "Courbure du corps lors d'une OAP/Flag (pas dans l'axe)" },
    { term: "Lean", def: "Entrée en OAP depuis le sol en avançant le poids" },
    { term: "Bras collé / main au dos", def: "OAP sans bras libre étendu — considérée comme la vraie OAP" }
  ],

  summary: "La OAP se construit à travers 6 niveaux progressifs, du handstand flag à la clean form maîtrisée. Le One Arm Flag est le meilleur exercice préparatoire. 3 sessions max/semaine, jamais 2 jours de suite, toujours bilatéral. La forme banana est DANGEREUSE et doit être évitée absolument. Le processus volume → forme s'applique comme pour la planche. La vraie OAP est celle avec le bras collé au dos."
},

// ═══════════════════════════════════════════════════════════════════════════════
// FRONT LEVER
// ═══════════════════════════════════════════════════════════════════════════════
front_lever: {
  title: "Front Lever",
  slug: "front-lever",
  category: "Pull / Statique",
  difficulty_range: [3, 9],
  icon: "◇",
  color: "#32D4C0",

  description: "Mouvement statique de tirage où le corps est tenu à l'horizontale sous la barre, bras verrouillés. Il développe une force dorsale exceptionnelle et un gainage profond. C'est le pendant tirage de la planche — l'autre moitié de l'équation.",

  why_it_matters: "Le front lever construit une force de tirage horizontale impossible à atteindre avec des tractions seules. Il renforce les dorsaux à un niveau unique, améliore la posture et prépare aux mouvements avancés. Pour un physique calisthenics complet, c'est indispensable — il équilibre la force de poussée développée par la planche.",

  prerequisites: [
    { name: "10+ tractions propres", category: "force", critical: true },
    { name: "5 tractions larges", category: "force", critical: false },
    { name: "Hollow body hold 30s", category: "core", critical: true }
  ],

  anatomy: {
    primary: ["Grand dorsal", "Grand rond", "Biceps brachial"],
    secondary: ["Rhomboïdes", "Trapèzes moyens/inférieurs", "Core (rectus abdominis)"],
    key_insight: "Le facteur limitant principal est souvent l'activation des dorsaux, pas la force brute. Beaucoup de pratiquants ont la force nécessaire mais manquent de connexion neuromusculaire avec leurs grands dorsaux. Le travail de scapula pulls et de suspensions actives est essentiel."
  },

  technique: {
    form_principles: [
      { name: "Rétraction et dépression scapulaire", detail: "Les omoplates doivent être tirées vers le bas et légèrement vers l'arrière. Inverse de la planche (protraction)." },
      { name: "Bras tendus", detail: "Extension complète des coudes. Le front lever avec les bras pliés n'est pas un front lever." },
      { name: "Corps horizontal", detail: "Ligne droite des épaules aux pieds. Le bassin ne doit pas piquer vers le bas." },
      { name: "Hollow body actif", detail: "Maintenir la rétroversion du bassin et l'engagement du core tout au long du hold." }
    ]
  },

  common_mistakes: [
    { name: "Lat activation insuffisante", severity: "haute", description: "Les dorsaux ne s'engagent pas correctement. Le mouvement est porté par les bras.", fix: "Travailler les scapula pulls, les active hangs, et les tractions en se concentrant sur le tirage par les coudes." },
    { name: "Coudes pliés", severity: "haute", description: "Réduit la difficulté et empêche la progression.", fix: "Régresser à une variante plus facile plutôt que de plier les coudes." },
    { name: "Bassin qui descend", severity: "moyenne", description: "Les hanches tombent, créant une forme en V.", fix: "Renforcer le hollow body, travailler les relevés de jambes." }
  ],

  progressions: [
    { level: 1, name: "Tuck Front Lever", target: "15s hold", exercises: ["Tuck FL hold", "Tuck FL rows", "Active hang depression"] },
    { level: 2, name: "Advanced Tuck / Single Leg", target: "10s hold", exercises: ["Adv tuck FL hold", "Single leg FL", "Négatives FL", "FL pulls (scapula)"] },
    { level: 3, name: "Straddle Front Lever", target: "5s hold", exercises: ["Straddle FL hold", "Straddle FL rows", "Négatives straddle", "Ice cream makers"] },
    { level: 4, name: "Full Front Lever", target: "5s hold + rows", exercises: ["Full FL hold", "Full FL raises", "FL rows", "Combos FL"] }
  ],

  programming_guidelines: {
    binary_evolution: "Même cycle binaire que la planche : accumuler la force d'abord (même en forme imparfaite), corriger ensuite.",
    note: "Les méthodes qui fonctionnent pour la planche (combos, EMOM, reps partielles) s'appliquent aussi au front lever. Le transfert méthodologique est direct."
  },

  volume_guidelines: {
    session_duration: "60-90 min",
    rest: "3-5 min entre séries de maintien, 2-3 min pour les rows",
    sets: "3-6 séries de maintien, 3-5 séries de rows"
  },

  frequency_guidelines: {
    training_days: "3-5 par semaine, se combine bien avec un jour poussée",
    note: "Attention au volume combiné avec la planche le même jour — le coude et l'épaule sont très sollicités dans les deux mouvements."
  },

  summary: "Le front lever suit la même logique que la planche : tuck → advanced tuck → straddle → full. Force d'abord, forme ensuite. L'activation dorsale est la clé — travaille les suspensions actives et les tirages scapulaires."
},

// ═══════════════════════════════════════════════════════════════════════════════
// MUSCLE-UP
// ═══════════════════════════════════════════════════════════════════════════════
muscle_up: {
  title: "Muscle-Up",
  slug: "muscle-up",
  category: "Tirage → Poussée / Transition",
  difficulty_range: [4, 8],
  icon: "▲",
  color: "#BF5AF2",

  description: "Le muscle-up combine un tirage explosif et une poussée pour passer de sous la barre à au-dessus en un seul mouvement fluide. C'est souvent le premier vrai jalon de progression en calisthenics — celui qui sépare le pratiquant de gym du pratiquant de street workout.",

  why_it_matters: "Au-delà du symbole, le muscle-up enseigne l'explosivité, la coordination entre chaînes musculaires opposées (pull → push) et le contrôle de la transition. Une fois acquis, il ouvre la porte aux enchaînements sur barre, aux routines de compétition et à un niveau de confiance dans le mouvement qui change tout.",

  prerequisites: [
    { name: "10 tractions propres (menton au-dessus)", category: "force", critical: true },
    { name: "15 dips stricts", category: "force", critical: true },
    { name: "3-5 tractions hautes (poitrine à la barre)", category: "explosivité", critical: true },
    { name: "5 dips barre droite", category: "force de transition", critical: true },
    { name: "Suspension false grip 10s (optionnel mais recommandé pour anneaux)", category: "technique", critical: false }
  ],

  anatomy: {
    primary: ["Grand dorsal", "Pectoraux", "Triceps", "Deltoïdes"],
    secondary: ["Biceps", "Avant-bras", "Core (gainage dynamique)"],
    key_insight: "Le point de blocage n°1 est la transition : le moment où tu passes de la traction au dip. Ce n'est ni un manque de force de tirage ni de poussée — c'est un mouvement spécifique qui nécessite un travail dédié. Les dips barre droite et les tractions hautes sont les deux exercices qui ciblent directement cette zone."
  },

  technique: {
    form_principles: [
      { name: "Tirage explosif", detail: "Le tirage doit être rapide et puissant dès le départ. L'objectif n'est pas de monter haut, mais de monter VITE. La hauteur vient de la vitesse, pas de la force brute." },
      { name: "Lean (inclinaison)", detail: "Au sommet du tirage, le corps s'incline légèrement vers l'avant pour permettre le passage au-dessus de la barre. Sans ce lean, même une traction très haute ne suffit pas pour passer." },
      { name: "Retournement des poignets", detail: "Les poignets pivotent au-dessus de la barre pendant la transition. C'est un mouvement technique qui se travaille spécifiquement — pas quelque chose qui vient naturellement." },
      { name: "Verrouillage complet", detail: "La phase finale est un dip complet avec verrouillage des coudes en haut. Sans extension complète, le muscle-up n'est pas validé." }
    ]
  },

  common_mistakes: [
    { name: "Tirage insuffisamment explosif", severity: "haute", description: "Tirer haut mais lentement empêche la transition. La vitesse est plus importante que la hauteur absolue.", fix: "Travailler les tractions explosives en priorité. Chercher à projeter la barre vers les hanches, pas vers le menton." },
    { name: "Bras asymétrique (chicken wing)", severity: "moyenne", description: "Un coude passe avant l'autre au-dessus de la barre, créant une rotation du corps.", fix: "Utiliser un élastique pour ralentir la transition et travailler la symétrie. Alterner côté fort et côté faible." },
    { name: "Balancement excessif (kipping)", severity: "faible", description: "Trop de kip rend le mouvement plus facile mais empêche la progression vers le strict.", fix: "Réduire progressivement le kip au fil des séances. Le kip est un outil d'apprentissage, pas l'objectif final." },
    { name: "Absence de lean", severity: "haute", description: "Le corps reste vertical pendant le tirage. Impossible de passer au-dessus sans incliner le buste vers l'avant.", fix: "Travailler des tractions « au sternum » pour habituer le corps au lean. S'entraîner avec un élastique en se concentrant sur l'inclinaison." },
    { name: "Négliger les dips barre droite", severity: "moyenne", description: "Beaucoup se concentrent uniquement sur le tirage et oublient que la phase push est spécifique.", fix: "Intégrer 3-5 séries de dips barre droite à chaque séance pull. C'est le transfert direct vers la transition." }
  ],

  progressions: [
    { level: 1, name: "Construction des fondations", 
      description: "Avant de penser au muscle-up, il faut construire une base de tirage solide. L'objectif ici n'est PAS de tenter le muscle-up, mais d'acquérir la force brute nécessaire.",
      target: "10 tractions propres + 15 dips stricts", 
      exercises: [
        { name: "Tractions pronation", reps: "4-5 × max-2" },
        { name: "Dips", reps: "4-5 × max-2" },
        { name: "Tractions scapulaires", reps: "3 × 10-12" },
        { name: "Suspension active", reps: "3 × 20s" }
      ],
      methods: [
        { name: "Pourquoi ces exercices", detail: "Les tractions et dips construisent la force de base. Les tractions scapulaires entraînent la dépression scapulaire — essentielle pour tirer haut. La suspension active renforce le grip et la position de départ." }
      ]
    },
    { level: 2, name: "Tirage explosif + dips barre droite", 
      description: "Tu as les bases de force. Maintenant il faut développer l'explosivité ET préparer la transition. C'est la phase la plus importante — ne la saute pas.",
      target: "5 tractions hautes (poitrine à la barre) + 8 dips barre droite", 
      exercises: [
        { name: "Tractions explosives (poitrine à la barre)", reps: "5 × 3-5" },
        { name: "Dips barre droite", reps: "4 × 6-8" },
        { name: "Négatifs de muscle-up (descente lente depuis le haut)", reps: "3 × 3-5" },
        { name: "Suspension false grip (optionnel)", reps: "4 × 10-15s" }
      ],
      methods: [
        { name: "Pourquoi les tractions explosives", detail: "La hauteur du tirage dépend de la VITESSE, pas de la force statique. Tire comme si tu voulais projeter ton sternum au-dessus de la barre." },
        { name: "Pourquoi les dips barre droite", detail: "Un dip classique utilise des barres parallèles. Le muscle-up se fait sur une barre unique — les dips barre droite reproduisent exactement la mécanique de la phase push." },
        { name: "Pourquoi les négatifs", detail: "Ils entraînent la transition en sens inverse. Le cerveau apprend la trajectoire même si tu ne peux pas encore la réaliser en montant." }
      ]
    },
    { level: 3, name: "Premiers muscle-ups (avec kip ou élastique)", 
      description: "Les fondations sont là. Tu peux maintenant tenter le mouvement complet avec un peu d'aide — kip léger ou élastique fin. L'objectif est de réussir la transition complète, même de manière imparfaite.",
      target: "3-5 muscle-ups d'affilée (kip ou bande autorisés)", 
      exercises: [
        { name: "Muscle-up avec kip léger", reps: "5-8 × 1-3" },
        { name: "Muscle-up avec élastique (transition assistée)", reps: "4 × 3-5" },
        { name: "Tractions explosives (entretien)", reps: "3 × 3-5" },
        { name: "Dips barre droite (entretien)", reps: "3 × 6-8" }
      ],
      methods: [
        { name: "Kip vs strict", detail: "Le kip est un outil d'apprentissage légitime, pas de la triche. Il permet au corps d'intégrer la trajectoire complète. L'objectif est de le réduire progressivement." },
        { name: "L'élastique comme outil technique", detail: "L'élastique n'est pas là pour rendre le mouvement facile — il ralentit la transition et permet de la travailler en détail." }
      ]
    },
    { level: 4, name: "Muscle-up strict + variantes", 
      description: "Tu maîtrises le muscle-up avec un peu d'élan. L'objectif devient le strict (sans kip) et les premières variantes : anneaux, wide grip, L-sit muscle-up.",
      target: "5 muscle-ups stricts + 3 ring muscle-ups", 
      exercises: [
        { name: "Muscle-up strict (dead-hang start)", reps: "5 × 2-4" },
        { name: "Slow muscle-up (transition lente volontaire)", reps: "3 × 2-3" },
        { name: "Ring muscle-up", reps: "4 × 1-3" },
        { name: "Muscle-up × séries longues (5+)", reps: "3 × 5+" }
      ]
    }
  ],

  programming_guidelines: {
    frequency: "2-3 séances pull/semaine incluant du travail de muscle-up. Ne pas négliger les dips barre droite même après l'acquisition.",
    integration: "Le muscle-up se travaille EN DÉBUT de séance, quand le système nerveux est frais. Les exercices accessoires (tractions, dips) viennent après.",
    patience: "Le muscle-up demande souvent 3-6 mois de travail spécifique après les prérequis. C'est normal. La transition est un pattern moteur complexe qui prend du temps à intégrer."
  },

  volume_guidelines: {
    rest: "2-3 min entre les séries de tentatives, 90s pour les exercices accessoires",
    sets: "4-6 séries de muscle-up en début de séance, 3-4 séries d'accessoires"
  },

  summary: "Le muscle-up se construit en 4 étapes claires : base de force (tractions + dips) → explosivité + transition (tractions hautes + dips barre droite) → premiers muscle-ups (kip/bande) → strict et variantes. La clé est l'explosivité du tirage et le travail spécifique de la transition — pas seulement « tirer plus fort »."
},

// ═══════════════════════════════════════════════════════════════════════════════
// HANDSTAND
// ═══════════════════════════════════════════════════════════════════════════════
handstand: {
  title: "Handstand",
  slug: "handstand",
  category: "Équilibre / Poussée",
  difficulty_range: [2, 9],
  icon: "△",
  color: "#A78BFA",

  description: "L'équilibre sur les mains est une discipline à part entière qui complète toutes les figures de calisthenics. Maintenir le corps à la verticale, en appui sur les mains, demande autant de force d'épaules que de proprioception et de patience.",

  why_it_matters: "Le handstand développe l'équilibre, la conscience corporelle et la force des épaules de façon unique. Il intervient dans presque tous les enchaînements avancés : transitions planche ↔ handstand, press, négatives. C'est aussi un excellent échauffement actif et un élément de récupération dans les combos longs — les épaules travaillent différemment en position inversée.",

  prerequisites: [
    { name: "10 pike push-ups propres", category: "force", critical: true },
    { name: "Mobilité complète des poignets en extension", category: "mobilité", critical: true },
    { name: "Gainage hollow body 20s", category: "core", critical: false }
  ],

  technique: {
    form_principles: [
      { name: "Ligne corporelle", detail: "Épaules ouvertes, bassin en rétroversion légère, pointes tendues. La ligne du poignet à la cheville doit être la plus droite possible." },
      { name: "Pression des doigts", detail: "L'équilibre se contrôle principalement par la pression des doigts au sol. Doigts écartés, pression active vers l'avant pour corriger une chute en arrière." },
      { name: "Regard", detail: "Regarder entre les mains, légèrement vers l'avant. La tête guide la trajectoire — c'est un principe qui s'applique aussi à la planche et aux transitions." }
    ]
  },

  progressions: [
    { level: 1, name: "Handstand mur (poitrine face au mur)", target: "30s stable, poitrine face au mur", 
      exercises: [
        { name: "Wall handstand (poitrine face au mur)", reps: "5 × 20-30s" },
        { name: "Wall walks (montées depuis le sol)", reps: "3 × 3-5" },
        { name: "Shoulder taps au mur", reps: "3 × 6-8 par bras" }
      ],
      methods: [
        { name: "Pourquoi poitrine face au mur", detail: "Cette position force les épaules à s'ouvrir et empêche le dos de s'arquer. C'est techniquement plus exigeant que dos au mur, mais construit de meilleures habitudes." }
      ]
    },
    { level: 2, name: "Premiers secondes libres", target: "5-10s en handstand libre",
      exercises: [
        { name: "Kick-ups (entrées depuis le sol)", reps: "10-15 tentatives par séance" },
        { name: "Wall float-offs (décoller du mur)", reps: "5 × 3-5 tentatives" },
        { name: "Pirouette bail (sortie de sécurité)", reps: "Intégrer dès le début" }
      ],
      methods: [
        { name: "Le handstand est un skill", detail: "Il se travaille par la fréquence, pas par le volume. 10-15 min par jour, 5-6 jours par semaine, vaut mieux que 2 grosses séances par semaine." }
      ]
    },
    { level: 3, name: "Handstand stable 30s+", target: "30s+ en handstand libre de façon reproductible",
      exercises: [
        { name: "Handstand libre (travail d'endurance)", reps: "Accumuler 3-5 min de temps total en position" },
        { name: "Shape work (varier les formes : tuck, straddle, une jambe)", reps: "Exploration libre" },
        { name: "Handstand walks", reps: "3 × 5-10m" }
      ]
    },
    { level: 4, name: "HSPU + variantes avancées", target: "5 pompes en appui renversé + 5s handstand un bras",
      exercises: [
        { name: "Pompes en appui renversé (mur → libre)", reps: "4 × 3-5" },
        { name: "Straddle press to handstand", reps: "3 × 3-5" },
        { name: "Handstand un bras (initiation)", reps: "Tentatives avec assistance" }
      ]
    }
  ],

  common_mistakes: [
    { name: "Dos arqué (banana handstand)", severity: "moyenne", description: "Épaules pas assez ouvertes, bassin en antéversion. Crée une cambrure visible.", fix: "Travailler le hollow body au sol, puis transférer cette sensation en position inversée. Privilégier le travail poitrine face au mur." },
    { name: "Mains mal placées", severity: "faible", description: "Mains trop écartées ou trop serrées, doigts pas assez actifs.", fix: "Mains à largeur d'épaules, doigts écartés et actifs. La pression des doigts est le principal outil d'équilibre." },
    { name: "Peur de la chute", severity: "moyenne", description: "L'appréhension empêche de s'engager pleinement dans le kick-up ou le float-off.", fix: "Apprendre la pirouette bail dès le début. Savoir sortir en sécurité élimine la peur et libère la progression." }
  ],

  frequency_guidelines: {
    optimal: "Le handstand se travaille idéalement tous les jours, 10-15 min. La fréquence prime sur le volume.",
    integration: "Peut servir d'échauffement actif avant une séance planche ou push. 5 min de handstand en début de séance = échauffement + travail d'équilibre."
  },

  summary: "Le handstand se travaille par la fréquence quotidienne plutôt que par de longues séances. Du mur (poitrine face au mur) vers le libre, de la stabilité vers les variantes avancées. La tête et les doigts guident l'équilibre."
},

// ═══════════════════════════════════════════════════════════════════════════════
// DIPS
// ═══════════════════════════════════════════════════════════════════════════════
dips: {
  title: "Dips",
  slug: "dips",
  category: "Push / Base",
  difficulty_range: [1, 6],
  icon: "▽",
  color: "#FF6B35",

  description: "Les dips sont un exercice fondamental de poussée. En appui sur les mains (barres parallèles, anneaux ou banc), on plie les coudes pour descendre puis on pousse pour remonter. C'est un exercice de base incontournable qui prépare à tous les mouvements push avancés.",

  why_it_matters: "Les dips sont le fondement de la force de poussée en calisthenics. Ils renforcent les pectoraux, les triceps et les deltoïdes antérieurs. Sans une base solide de dips, la progression vers la planche, les HSPU et les impossible dips sera bloquée.",

  prerequisites: [
    { name: "10 pompes propres", category: "force", critical: true }
  ],

  progressions: [
    { level: 1, name: "Dips assistés → stricts", target: "15 dips propres" },
    { level: 2, name: "Dips lestés", target: "+20kg × 5 reps" },
    { level: 3, name: "Dips anneaux", target: "10 ring dips propres" },
    { level: 4, name: "Impossible dips / Korean dips", target: "5 impossible dips" }
  ],

  summary: "Les dips sont la base. 15 dips propres = prérequis pour commencer la planche. Les lester permet de construire une force maximale transférable aux skills."
},

// ═══════════════════════════════════════════════════════════════════════════════
// TRACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
tractions: {
  title: "Tractions",
  slug: "tractions",
  category: "Pull / Base",
  difficulty_range: [1, 6],
  icon: "△",
  color: "#32D4C0",

  description: "Les tractions sont le mouvement fondamental de tirage en calisthenics. Suspendre sous une barre, tirer le corps vers le haut jusqu'au menton ou la poitrine au-dessus de la barre. Déclinable en multiples prises (pronation, supination, neutre, large, serré).",

  why_it_matters: "Les tractions sont à la chaîne pull ce que les dips sont au push. Elles développent les dorsaux, les biceps, les avant-bras et le core. Elles préparent au front lever, au muscle-up et à tous les mouvements de tirage avancés.",

  prerequisites: [
    { name: "Suspension active 20s", category: "grip", critical: true }
  ],

  progressions: [
    { level: 1, name: "Première traction → 8 reps", target: "8 tractions propres" },
    { level: 2, name: "Tractions variées", target: "10+ en pronation, supination, large" },
    { level: 3, name: "Tractions lestées", target: "+20kg × 5 reps" },
    { level: 4, name: "Tractions avancées", target: "Archer pull-ups, one arm pull-up work" }
  ],

  programming_guidelines: {
    note: "Changer de prise à chaque série : normal, large, supination. Cela développe des forces complémentaires.",
    integration: "Les tractions servent d'échauffement, de renforcement, et de mouvement complémentaire dans toute séance de calisthenics."
  },

  summary: "Les tractions sont le pilier pull. 8 tractions propres = prérequis pour le front lever. Varier les prises systématiquement."
},

// ═══════════════════════════════════════════════════════════════════════════════
// L-SIT / COMPRESSION
// ═══════════════════════════════════════════════════════════════════════════════
l_sit: {
  title: "L-Sit & Compression",
  slug: "l-sit",
  category: "Core / Compression",
  difficulty_range: [2, 7],
  icon: "∟",
  color: "#8B5CF6",

  description: "Le L-sit est une position statique où le corps forme un angle de 90° aux hanches, les jambes tendues à l'horizontale devant soi, en appui sur les mains bras tendus. C'est la base de la compression, qui mène au V-sit puis au manna. Le L-sit est aussi un élément de transition et de 'repos' essentiel dans les combos de planche.",

  why_it_matters: "Le L-sit développe la force de compression (fléchisseurs de hanche), le core, et sert de transition entre presque tous les mouvements. Dans les combos de planche, le L-sit permet de respirer et d'alterner les groupes musculaires tout en maintenant le volume. Sans L-sit solide, impossible de faire des combos longs et efficaces.",

  progressions: [
    { level: 1, name: "Tuck L-sit", target: "15s tuck" },
    { level: 2, name: "L-sit complet", target: "10s L-sit" },
    { level: 3, name: "V-sit", target: "5s V-sit" },
    { level: 4, name: "Manna", target: "Manna progression" }
  ],

  summary: "Le L-sit est un pilier des combos de planche et un mouvement de transition universel. Il développe la compression et le core. Le V-sit et le manna sont ses extensions avancées."
},

// ═══════════════════════════════════════════════════════════════════════════════
// POMPES (PUSH-UPS)
// ═══════════════════════════════════════════════════════════════════════════════
push_ups: {
  title: "Pompes (Push-Ups)",
  slug: "pompes",
  category: "Push / Base",
  difficulty_range: [1, 5],
  icon: "▿",
  color: "#FF6B35",

  description: "Les pompes sont le premier exercice de poussée en calisthenics. Déclinables en dizaines de variantes (normales, larges, diamant, pike, archer, planche lean), elles constituent la base de toute force de pushing. Les pike push-ups préparent au handstand, les lean push-ups préparent à la planche.",

  why_it_matters: "20 pompes propres est un prérequis pour commencer la planche. Les pompes développent les pectoraux, les triceps et les deltoïdes. Leurs variantes (lean, pike, archer) sont directement transférables aux skills avancés.",

  progressions: [
    { level: 1, name: "Pompes basiques", target: "20 pompes propres" },
    { level: 2, name: "Pompes variées", target: "Diamant, large, pike, archer" },
    { level: 3, name: "Lean push-ups", target: "10 lean push-ups propres" },
    { level: 4, name: "Planche push-ups", target: "Transition vers tuck/straddle push-ups" }
  ],

  programming_guidelines: {
    note: "Changer de prise à chaque série : normal, large, diamant. Développe des forces complémentaires. Les lean push-ups sont le pont direct vers la planche."
  },

  summary: "Les pompes sont la base du push. 20 reps = prérequis planche. Varier les prises (normal/large/diamant). Les lean push-ups = pont vers la planche."
}

}; // fin MOVEMENT_GUIDES

// ═══════════════════════════════════════════════════════════════════════════════
// TRAINING PRINCIPLES (Unlimited Endurance)
// ═══════════════════════════════════════════════════════════════════════════════
const TRAINING_PRINCIPLES = {
  binary_evolution: {
    name: "Évolution binaire",
    description: "La progression en poids du corps suit un cycle en deux temps : on accumule force et volume (même avec une forme imparfaite), puis on corrige la technique avec la force acquise. Ensuite on accepte de re-dégrader la forme pour monter encore le volume — et on recommence. Ce cycle s'applique à tous les niveaux, du débutant à l'élite.",
    applies_to: "all"
  },
  strength_vs_form_periods: {
    name: "Phases de force / Phases de forme",
    description: "La programmation alterne entre phases de renforcement (80% force, 20% forme) et phases de correction technique (80% forme, 20% force). On ne peut pas être propre en se sentant encore faible sur un mouvement. Construis la force d'abord, habitue-toi, puis nettoie.",
    applies_to: "all",
    beginner_example: "3s de straddle imparfaite → renforcer jusqu'à 7-8s → corriger vers 2-3s en forme propre",
    advanced_example: "1-1-1 propre → accepter 2-2-2 imparfait → corriger 2-2-2 propre → monter à 3-2-2 imparfait"
  },
  variant_balance: {
    name: "Équilibrer les Variantes",
    description: "Hold, press, push up — chacun a ses points forts/faibles. Quand une variante devient faible, la cibler. Alterner les focus. Les combos peuvent être orientés pour cibler une variante spécifique tout en maintenant les autres en background.",
    applies_to: "intermediate+",
    combo_examples: {
      focus_hold: "straddle hold → pushup to hold → press → negative to hold → L-sit → straddle hold",
      focus_press: "straddle to press ×2 to hold → L-sit → to press → negative to pushup hold",
      focus_pushup: "straddle → push ups ×2 to hold → L-sit → to press → negative to spam pushups → L-sit → try straddle hold"
    }
  },
  three_x_method: {
    name: "La Méthode 3× (50% 80% 100%)",
    description: "Quand tu n'as que quelques secondes de hold : 3 tentatives consécutives. 1ère: 50% du max → respirer 3-5s. 2ème: 80% du max → respirer 5-7s. 3ème: vrai max à 100%. Le corps mémorise la position 3× plus vite et tu atteins ton vrai maximum.",
    applies_to: "beginner"
  },
  degressive_form: {
    name: "Forme Dégressive",
    description: "En clean form, tu es à intensité maximale et ne peux pas ajouter de volume. Comme un powerlifter ne peut pas enchaîner 2 reps à 1RM. Accepte de dégrader la forme pour ajouter du volume dans les combos, puis corrige après.",
    applies_to: "intermediate+"
  },
  xxx: {
    name: "Le XXX",
    description: "Push-press-hold dans toutes les combinaisons possibles (6 ordres). Le meilleur principe d'entraînement pour l'endurance. 3 avantages : jamais de stagnation (infiniment adaptable), toutes les variantes simultanément, jeu sans fin. L'ordre détermine la difficulté de chaque variante : la première est la plus facile (fraîcheur), la dernière la plus dure.",
    applies_to: "advanced+",
    orders: ["push-press-hold", "push-hold-press", "hold-press-push", "hold-push-press", "press-push-hold", "press-hold-push"],
    usage: "1 à 3 fois par entraînement avec gros repos entre (7-10 min). Peut être unbalancé pour cibler une variante (ex: 9/10-3-3 hold-push-press pour cibler hold)."
  },
  xxxx: {
    name: "Le XXXX",
    description: "Ajouter un mouvement initial (HSPU, wide planche, maltese, OAP) avant le xxx. Crée de la fatigue préalable. Progresser en réduisant la pause entre le premier X et le xxx. Minimum 555 requis avant de commencer.",
    applies_to: "advanced+"
  },
  emom: {
    name: "EMOM",
    description: "Every Minute On the Minute. Définir X reps toutes les minutes pendant Y minutes. Progresser : d'abord plus de minutes, puis plus de reps. En fin de séance pour vider les réserves. Attention : nerveusement épuisant, pas trop souvent.",
    applies_to: "intermediate+",
    versions: {
      simple: "Timer après l'exercice → 1 min de repos total",
      hard: "Timer au début → si l'exercice dure 20s, seulement 40s de repos"
    }
  },
  spam: {
    name: "Spam",
    description: "Volume brut maximal sur une seule variante pour la force brute. Ne pas spammer en utilisant la tête ou en perdant la position d'épaule. Négliger la forme N'EST PAS négliger l'activation musculaire. Seulement les jours où tu te sens bien.",
    applies_to: "all"
  },
  partial_reps: {
    name: "Reps Partielles",
    description: "Isoler la partie problématique d'un mouvement. 2 usages : débloquer un nouveau mouvement (focus sur l'amplitude accessible) et gagner en endurance sur une amplitude spécifique.",
    applies_to: "beginner+"
  },
  short_combos: {
    name: "Combos Courts (Focus Technique)",
    description: "Isoler une transition problématique. Les transitions sont souvent plus dures que le mouvement. Plus c'est fluide, moins tu dépenses de force. Économiser la force = gagner de la force.",
    applies_to: "intermediate+"
  },
  long_combos: {
    name: "Combos Longs (Focus Endurance)",
    description: "3 règles : 1) Figures en décroissant (plus dur → plus facile). 2) Alterner les groupes musculaires + respirer entre les mouvements. 3) Forme dégressive (ne pas essayer de tout faire parfaitement = rester à max intensité = pas de volume).",
    applies_to: "intermediate+"
  },
  max_hold_to_action: {
    name: "95% Max to Press/Push up",
    description: "Max hold puis press ou push up avant de tomber. Oblige à garder la bonne trajectoire et la hauteur max. Identifier son max hold puis essayer d'ajouter 1 seconde à chaque session.",
    applies_to: "intermediate+"
  },
  rubber_band_weighted: {
    name: "Élastique Lesté",
    description: "Rend le mouvement plus dur ET moins stable. Garder au moins 50% du volume normal. 5kg déjà beaucoup pour avancé, 15kg max pour pro, 25kg trop lourd. 1-3 fois par entraînement. Aide à relativiser : après un 10-10-10 lesté, un 13-13-13 sans poids semble faisable.",
    applies_to: "advanced+"
  },
  body_optimization: {
    name: "Optimisation Corporelle",
    description: "Être le plus léger et le plus sain possible. Les derniers kg et % de body fat ont le plus grand impact. 30% d'endurance en moins entre 70kg et 64-66kg pour une même personne. Manger qualité, éviter les aliments transformés. Le jeûne intermittent aide à nettoyer le corps.",
    applies_to: "all"
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER — Recherche dans la KB pour le générateur
// ═══════════════════════════════════════════════════════════════════════════════
function getGuide(slug) {
  return MOVEMENT_GUIDES[slug] || Object.values(MOVEMENT_GUIDES).find(g => g.slug === slug) || null;
}

function getProgressionForLevel(slug, userLevel) {
  var guide = getGuide(slug);
  if (!guide || !guide.progressions) return null;
  // Find the matching or closest progression
  var sorted = guide.progressions.slice().sort(function(a,b){ return a.level - b.level; });
  var match = null;
  for (var i = 0; i < sorted.length; i++) {
    if (sorted[i].level <= userLevel) match = sorted[i];
  }
  return match || sorted[0];
}

function getExercisesForLevel(slug, userLevel) {
  var prog = getProgressionForLevel(slug, userLevel);
  if (!prog) return [];
  return prog.exercises || [];
}

function getCombosForLevel(slug, userLevel) {
  var prog = getProgressionForLevel(slug, userLevel);
  if (!prog) return [];
  return prog.combos || [];
}

function getWarningsForMovement(slug) {
  var guide = getGuide(slug);
  return (guide && guide.warning_flags) || [];
}

function getMistakesForMovement(slug) {
  var guide = getGuide(slug);
  return (guide && guide.common_mistakes) || [];
}

function getProgrammingRules(slug) {
  var guide = getGuide(slug);
  return (guide && guide.programming_guidelines) || {};
}

function getVolumeRules(slug) {
  var guide = getGuide(slug);
  return (guide && guide.volume_guidelines) || {};
}

function getFrequencyRules(slug) {
  var guide = getGuide(slug);
  return (guide && guide.frequency_guidelines) || {};
}

function getWarmup(slug) {
  var guide = getGuide(slug);
  return (guide && guide.warmup) || null;
}

function getAllGuideSlugs() {
  return Object.keys(MOVEMENT_GUIDES);
}

function getGuidesList() {
  return Object.values(MOVEMENT_GUIDES).map(function(g) {
    return { title: g.title, slug: g.slug, category: g.category, icon: g.icon, color: g.color, difficulty_range: g.difficulty_range, description: g.description };
  });
}

// Export for use by app.js and engine
if (typeof window !== "undefined") {
  window.MOVEMENT_GUIDES = MOVEMENT_GUIDES;
  window.TRAINING_PRINCIPLES = TRAINING_PRINCIPLES;
  window.KB = {
    getGuide: getGuide,
    getProgressionForLevel: getProgressionForLevel,
    getExercisesForLevel: getExercisesForLevel,
    getCombosForLevel: getCombosForLevel,
    getWarningsForMovement: getWarningsForMovement,
    getMistakesForMovement: getMistakesForMovement,
    getProgrammingRules: getProgrammingRules,
    getVolumeRules: getVolumeRules,
    getFrequencyRules: getFrequencyRules,
    getWarmup: getWarmup,
    getAllGuideSlugs: getAllGuideSlugs,
    getGuidesList: getGuidesList
  };
}
