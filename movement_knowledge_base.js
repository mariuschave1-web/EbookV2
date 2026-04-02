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
  category: "Poussée / Statique",
  difficulty_range: [3, 10],
  icon: "◆",
  color: "#FF6B35",

  description: "Figure statique emblématique du street workout : le corps entier est maintenu horizontal, bras tendus, en appui sur les mains. La planche mobilise la protraction scapulaire, la rétroversion du bassin et une tension corporelle intégrale. Elle représente l'un des défis les plus complets de la discipline — un équilibre entre force brute, maîtrise technique et endurance du système nerveux.",

  why_it_matters: "La planche structure toute la force de poussée en calisthenics. Elle ouvre la porte aux mouvements avancés (maltese, OAP) et développe de façon unique les deltoïdes antérieurs, le dentelé, les triceps et le gainage profond. Au-delà de la force pure, elle forge le contrôle proprioceptif — la capacité à sentir et corriger ta position dans l'espace. Le chemin vers la planche est aussi un apprentissage mental : accepter de normaliser la difficulté, avancer par cycles (force → volume → forme), et se projeter dans le mouvement avant de le réaliser.",

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
    key_insight: "Le dentelé antérieur (serratus anterior) est le muscle le plus déterminant — et le plus lent à renforcer. C'est lui qui assure la protraction scapulaire et maintient la hauteur du corps. Quand la planche est basse et que les omoplates semblent 'collées' au dos, c'est presque toujours un déficit de dentelé."
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
    { name: "Chercher la forme parfaite trop tôt", severity: "haute", description: "Vouloir corriger chaque détail de forme avant d'avoir construit assez de force. Ça bloque la progression car la force manque pour tenir correctement.", fix: "Accumuler d'abord du volume (même en forme imparfaite), puis corriger la technique par cycles. Force → volume → correction de forme → répéter un cran au-dessus." },
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
    binary_evolution: "L'évolution est un phénomène binaire : gain de force/résistance → correction de la forme → accepter de re-dégrader la forme pour augmenter le volume → corriger un cran plus haut. Répéter indéfiniment.",
    intensity_rule: "En poids du corps, l'intensité est relative à la qualité d'exécution. Négliger la forme = réduire l'intensité = permettre plus de volume.",
    form_vs_strength: "Le concept forme > force est FAUX. La force permet le travail propre. Se concentrer trop tôt sur la forme est une erreur classique qui bloque la progression.",
    strength_period: { ratio: "80% renforcement / 20% forme", description: "Quand tu manques de force pour une figure. Le travail de forme est un 'background work' en fin de séance avec élastique." },
    form_period: { ratio: "80% forme / 20% renforcement", description: "Quand tu as assez de force (7-8s bad form). Focus sur le nettoyage. Le renforcement devient le background." },
    variant_balance: "Hold, press, push up — si une variante devient faible par rapport aux autres, c'est le moment de la cibler. Alterner les focus régulièrement et logiquement."
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
    normalize: "Ta conception de l'objectif est la première chose qui régit ton évolution. Plus tu perçois la difficulté, plus c'est dur. Desmystifie ton objectif. La planche est un mouvement à la portée de tout le monde avec le bon travail.",
    projection: "La vraie visualisation est la PROJECTION : vivre la situation à l'avance, sentir chaque sensation et détail. Sans image claire du point d'arrivée, le chemin reste flou.",
    no_pain_no_gain_myth: "FAUX. Quand il y a douleur, il y a peu ou pas de gain. La douleur N'EST PAS un indicateur de travail bien fait. L'effort au max est un PLAISIR. Chaque échec est un pas de plus vers l'objectif.",
    binary_doors: "Tu rencontreras des phases ascendantes et descendantes. Tu devras passer chaque porte dans ta tête avant de la franchir réellement. Rappelle-toi les portes précédentes : une fois passées, elles ne semblaient plus si dures.",
    positive_feedback: "Toujours trouver du positif dans ta séance. Note chaque progrès : endurance, facilité, ou même juste reproduire une performance similaire en état moins favorable. Félicite-toi — c'est la seule félicitation qui compte."
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
    { q: "Dois-je avoir une forme parfaite dès le début ?", a: "Non. C'est l'erreur n°1. La forme se nettoie APRÈS avoir accumulé suffisamment de force. Accepte la bad form pour progresser, puis corrige-la." },
    { q: "Combien de temps pour avoir la full planche ?", a: "Très variable selon la morphologie, le poids, l'entraînement. La patience est clé. Certains y arrivent en 1-2 ans, d'autres en 3+. Les personnes plus grandes/lourdes ont un bras de levier plus long." },
    { q: "Est-ce plus dur si je suis grand ?", a: "Oui. Un 555 ne signifie pas la même chose pour quelqu'un de 150cm, 170cm ou 180cm+. Le bras de levier joue un rôle important en isométrie. Ce n'est pas une excuse, c'est un fait à intégrer." },
    { q: "Quand passer de la straddle à la full ?", a: "Quand tu as une straddle propre et que tu peux enchaîner des combinaisons complètes. Commence à introduire la full dans tes combos (tentatives, négatives) avant de la cibler." },
    { q: "Le xxx c'est quoi exactement ?", a: "Le meilleur principe d'entraînement pour l'endurance. Tu alternes push up, press, hold dans toutes les combinaisons possibles. 3 raisons : jamais de stagnation (infiniment adaptable), travail de toutes les variantes simultanément, jeu sans fin stimulant." },
    { q: "Puis-je travailler d'autres mouvements en parallèle ?", a: "Oui, c'est même conseillé. Attention simplement à ne pas trop charger les mêmes zones. Par exemple hefesto, maltese et planche supination stressent tous intensivement le coude." }
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

  summary: "La planche se construit par un processus binaire : accumulation de force/volume en acceptant la bad form, puis nettoyage de la forme avec la force acquise, puis on recommence un cran plus haut. L'échauffement est primordial (20-25 min structuré). Le mindset joue un rôle majeur : normaliser, relativiser, se projeter. Le travail se fait 3-5 jours/semaine avec repos actif. Les combinaisons sont l'outil principal de progression à partir du niveau straddle. Le xxx est le meilleur format d'endurance pour les avancés. Ne jamais pousser à travers la douleur, toujours s'adapter à son état du jour."
},

// ═══════════════════════════════════════════════════════════════════════════════
// ONE ARM PLANCHE (OAP)
// ═══════════════════════════════════════════════════════════════════════════════
one_arm_planche: {
  title: "One Arm Planche",
  slug: "one-arm-planche",
  category: "Poussée / Statique Avancé",
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
    { name: "Forme « banana »", severity: "CRITIQUE", description: "Le corps se courbe vers l'arrière par manque de hauteur, en écrasant les obliques pour remonter les jambes. Tout le poids bascule derrière, ce qui tasse l'omoplate et crée un risque réel de blessure. C'est la SEULE forme à proscrire absolument.", fix: "Toujours chercher à projeter le corps vers l'avant plutôt qu'à compenser la hauteur. Si le résultat est une banana, régresser vers des variantes plus accessibles." },
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
  category: "Tirage / Statique",
  difficulty_range: [3, 9],
  icon: "◇",
  color: "#32D4C0",

  description: "Le front lever est un maintien statique de tirage horizontal : le corps est tenu à l'horizontale sous une barre, bras complètement tendus. Il sollicite massivement les dorsaux, les biceps et tout le gainage postérieur. C'est le pendant tirage de la planche — les deux mouvements forment un duo complémentaire fondamental.",

  why_it_matters: "Le front lever pousse la force des dorsaux bien au-delà de ce que les tractions seules permettent d'atteindre. Il améliore la posture, renforce toute la chaîne postérieure et prépare les mouvements avancés comme le hefesto. Sa construction suit les mêmes principes que la planche : tuck → advanced tuck → straddle → full, avec des cycles de force et de forme.",

  prerequisites: [
    { name: "10+ tractions propres", category: "force", critical: true },
    { name: "5 tractions larges", category: "force", critical: false },
    { name: "Hollow body hold 30s", category: "core", critical: true }
  ],

  anatomy: {
    primary: ["Grand dorsal", "Grand rond", "Biceps brachial"],
    secondary: ["Rhomboïdes", "Trapèzes moyens/inférieurs", "Core (rectus abdominis)"],
    key_insight: "L'activation des dorsaux (lat activation) est le facteur limitant principal. Beaucoup d'athlètes ont assez de force brute mais manquent de connexion neuromusculaire avec les dorsaux."
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
    binary_evolution: "Même principe binaire que la planche : force/volume d'abord, forme ensuite.",
    note: "Le front lever répond aux mêmes principes que la planche. Les méthodes d'entraînement (xxx, combos, EMOM, partial reps) s'appliquent aussi au front lever."
  },

  volume_guidelines: {
    session_duration: "60-90 min",
    rest: "3-5 min entre séries de hold, 2-3 min pour les rows",
    sets: "3-6 séries de hold, 3-5 séries de rows"
  },

  frequency_guidelines: {
    training_days: "3-5/semaine, peut se combiner avec un jour push",
    note: "Attention au volume combiné avec la planche si même jour — le coude et l'épaule sont sollicités dans les deux."
  },

  summary: "Le front lever se construit comme la planche : tuck → advanced tuck → straddle → full. Force d'abord, forme ensuite. L'activation des dorsaux est la clé. Les mêmes principes d'entraînement (xxx, combos, EMOM) s'appliquent."
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

  description: "Le muscle-up combine un tirage explosif sous la barre et une poussée au-dessus de celle-ci, via une phase de transition rapide. C'est un mouvement composite qui sollicite toute la chaîne supérieure : dorsaux, pectoraux, triceps, deltoïdes et core. Sa maîtrise marque souvent le passage vers un niveau intermédiaire-avancé en calisthenics.",

  why_it_matters: "Le muscle-up est la porte d'entrée vers les enchaînements sur barre. Il enseigne l'explosivité contrôlée, la coordination inter-chaînes (tirage → poussée) et le timing de la transition. Sans cette compétence, la plupart des combos et routines avancées restent inaccessibles. Il développe aussi une confiance corporelle unique : savoir se propulser au-dessus d'un obstacle.",

  prerequisites: [
    { name: "10+ tractions propres au menton", category: "force", critical: true },
    { name: "15+ dips propres (amplitude complète)", category: "force", critical: true },
    { name: "5 tractions explosives (poitrine à la barre)", category: "explosivité", critical: true },
    { name: "5 dips barre droite (straight bar dips)", category: "transition", critical: true },
    { name: "False grip basique 10s (pour anneaux)", category: "technique", critical: false },
    { name: "Gainage creux solide 30s", category: "core", critical: false }
  ],

  anatomy: {
    primary: ["Grand dorsal", "Pectoraux", "Triceps", "Deltoïdes antérieurs"],
    secondary: ["Biceps", "Avant-bras (grip)", "Core (stabilisation)", "Dentelé antérieur"],
    stabilizers: ["Coiffe des rotateurs", "Rhomboïdes", "Trapèzes"],
    key_insight: "La phase de transition — le passage des coudes sous la barre à au-dessus — est le maillon faible chez la plupart des pratiquants. Elle nécessite à la fois de l'explosivité dans le tirage ET une force de poussée spécifique au niveau des coudes en position de dip barre droite. Travailler les dips barre droite séparément est indispensable."
  },

  technique: {
    form_principles: [
      { name: "Tirage explosif vertical", detail: "Le tirage doit être rapide et puissant, pas simplement haut. L'objectif est d'amener la poitrine, pas le menton, au niveau de la barre. Plus le tirage est explosif, plus la transition est facile." },
      { name: "Trajectoire en C", detail: "Le corps ne monte pas en ligne droite. Il suit une courbe en C autour de la barre. En haut du tirage, les coudes partent vers l'arrière et le buste bascule par-dessus la barre." },
      { name: "Transition rapide", detail: "La transition (passage des coudes) doit être un mouvement fluide et rapide. Hésiter en haut du tirage = échec. L'intention est de 'rouler' par-dessus la barre." },
      { name: "False grip (anneaux)", detail: "Pour le muscle-up aux anneaux, le false grip (poignet cassé par-dessus l'anneau) est quasi obligatoire. Il raccourcit le chemin de transition. Se travaille d'abord en suspension statique." },
      { name: "Kip vs Strict", detail: "Le kip (balancement contrôlé) est une aide légitime pour débuter. L'objectif à terme est de réduire le kip pour arriver au strict. Ne pas confondre kip technique et balancement anarchique." }
    ],
    breathing: "Inspirer en bas, bloquer pendant le tirage explosif et la transition, expirer une fois stabilisé au-dessus de la barre en position dip."
  },

  common_mistakes: [
    { name: "Tirage pas assez explosif", severity: "haute", description: "Tirer haut ne suffit pas — il faut tirer VITE. Un tirage lent, même haut, ne donne pas l'élan nécessaire pour la transition.", fix: "Travailler spécifiquement les tractions explosives (poitrine à la barre). Ajouter des high pulls-up en pensant vitesse, pas juste hauteur." },
    { name: "Chicken wing (bras asymétrique)", severity: "moyenne", description: "Un coude passe avant l'autre au-dessus de la barre. Crée un déséquilibre et peut stresser l'épaule.", fix: "Ralentir la transition avec un élastique pour conscientiser la symétrie. Travailler les dips barre droite pour renforcer les deux côtés." },
    { name: "Manque de force en dips barre droite", severity: "haute", description: "Passer la transition mais ne pas pouvoir pousser au-dessus. La force de dips sur barres parallèles ne se transfère pas directement aux dips barre droite.", fix: "Intégrer les dips barre droite (straight bar dips) dans toutes les séances tirage. 3-4 séries de 6-8 reps." },
    { name: "Kip excessif / balancement", severity: "moyenne", description: "Trop de balancement réduit le transfert de force et empêche la progression vers le strict.", fix: "Réduire progressivement le kip. Travailler le strict avec bande élastique. Le kip doit être un outil temporaire, pas une béquille permanente." },
    { name: "Grip trop large ou trop serré", severity: "faible", description: "Les mains trop écartées ou trop serrées changent la mécanique de transition.", fix: "Placer les mains légèrement plus large que les épaules. Tester différentes largeurs pour trouver la plus naturelle." }
  ],

  progressions: [
    {
      level: 0,
      name: "Construction des prérequis",
      target: "10 tractions / 15 dips / 5 dips barre droite",
      description: "Construire la force de base avant de tenter quoi que ce soit. Si les prérequis ne sont pas atteints, travailler le muscle-up est prématuré et risque de créer des compensations.",
      exercises: [
        { name: "Tractions pronation", reps: "4 × max-2" },
        { name: "Dips", reps: "4 × max-2" },
        { name: "Dips barre droite", reps: "3 × 5-8" },
        { name: "Rowing inversé", reps: "3 × 12" },
        { name: "Gainage creux (hollow)", reps: "3 × 30s" }
      ]
    },
    {
      level: 1,
      name: "Tirage explosif",
      target: "5 tractions poitrine à la barre",
      description: "L'explosivité est plus importante que la force brute pour le muscle-up. L'objectif est d'apprendre à tirer VITE et HAUT, pas simplement fort. Les high pull-ups sont l'exercice clé de cette phase.",
      exercises: [
        { name: "Tractions explosives (poitrine barre)", reps: "5 × 3-5" },
        { name: "High pull-up explosif", reps: "4 × 3" },
        { name: "Tractions lâchées (clapping pulls)", reps: "3 × 2-3" },
        { name: "Dips barre droite", reps: "4 × 6-8" },
        { name: "Suspension false grip", reps: "4 × 10-15s" }
      ],
      methods: [
        { name: "Contraste lourd-explosif", detail: "1 série de 5 tractions lestées lourdes → 90s repos → 1 série de 3-5 tractions explosives. Le système nerveux est 'préparé' par la charge lourde." },
        { name: "Séries courtes très explosives", detail: "3-5 séries de 2-3 reps ultra-explosives avec 2-3 min de repos. Qualité > quantité." }
      ]
    },
    {
      level: 2,
      name: "Premier muscle-up",
      target: "3 muscle-ups (kip autorisé)",
      description: "C'est le moment de tenter la bête. Un léger kip est normal et acceptable. Le but est de réussir la transition, pas d'être parfait. Travailler aussi les excentriques (descente lente depuis le haut) pour sentir le mouvement inverse.",
      exercises: [
        { name: "Tentatives muscle-up (avec kip léger)", reps: "5-8 tentatives, repos 2-3 min" },
        { name: "Muscle-up excentrique (descente lente)", reps: "4 × 3" },
        { name: "Transition assistée (bande élastique)", reps: "4 × 3-5" },
        { name: "High pull-up explosif", reps: "3 × 4" },
        { name: "Dips barre droite", reps: "3 × 8" }
      ]
    },
    {
      level: 3,
      name: "Muscle-up propre (strict)",
      target: "5 muscle-ups propres sans kip",
      description: "Réduire progressivement le kip jusqu'à l'éliminer. Le muscle-up strict demande une explosivité encore supérieure mais donne un contrôle total. Les séries de muscle-ups deviennent possibles.",
      exercises: [
        { name: "Muscle-up strict", reps: "5 × 1-3" },
        { name: "Muscle-up lent (contrôlé)", reps: "3 × 2" },
        { name: "Séries de muscle-ups", reps: "3 × 3-5" }
      ]
    },
    {
      level: 4,
      name: "Muscle-up anneaux + variantes",
      target: "3 muscle-up anneaux / L-sit MU",
      description: "Le muscle-up aux anneaux est plus technique mais potentiellement plus accessible grâce au false grip. Les variantes (L-sit muscle-up, wide, 360) ajoutent du défi et de la polyvalence.",
      exercises: [
        { name: "Muscle-up anneaux (false grip)", reps: "5 × 2-3" },
        { name: "L-sit muscle-up", reps: "3 × 1-2" },
        { name: "Muscle-up large", reps: "3 × 2-3" }
      ]
    }
  ],

  programming_guidelines: {
    frequency: "2-3 séances avec muscle-up par semaine. Pas de muscle-up deux jours consécutifs.",
    placement: "Toujours placer le travail de muscle-up en DÉBUT de séance, quand le système nerveux est frais.",
    integration: "Combiner avec du tirage lourd (tractions) et des dips barre droite dans la même séance.",
    progression_rule: "Ne passer au niveau suivant que quand le niveau actuel est solide et reproductible sur 3 séances consécutives."
  },

  volume_guidelines: {
    session_duration: "Le travail spécifique muscle-up ne devrait pas dépasser 20-25 min par séance",
    rest: "2-3 min entre tentatives, 3-5 min entre séries de muscle-ups",
    sets: "5-8 tentatives en phase d'apprentissage, 3-5 séries de 2-5 en phase de consolidation"
  },

  frequency_guidelines: {
    training_days: "2-3/semaine",
    note: "Alterner séances explosives (tentatives, high pulls) et séances de consolidation (séries, excentriques). Inclure les dips barre droite à CHAQUE séance.",
    recovery: ["Le muscle-up sollicite beaucoup les coudes et les épaules", "Respecter 48h minimum entre deux séances MU", "Si douleur au coude interne → repos obligatoire"]
  },

  warmup: {
    structure: [
      { phase: "Activation", duration: "3-5 min", items: ["Cercles d'épaules progressifs", "Suspensions actives 2 × 10s", "Tractions scapulaires 2 × 8"] },
      { phase: "Montée en charge", duration: "5-8 min", items: ["2-3 tractions faciles", "5 dips faciles", "3 dips barre droite", "2 tractions explosives à 70%"] }
    ],
    key_point: "Ne JAMAIS tenter un muscle-up à froid. Les épaules et les coudes doivent être complètement échauffés."
  },

  warning_flags: [
    { flag: "Douleur coude interne (épitrochléalgie)", action: "Stopper les tentatives de muscle-up. Le coude interne est très sollicité par la transition. Repos + renforcement excentrique des fléchisseurs du poignet." },
    { flag: "Douleur épaule antérieure", action: "Vérifier la technique de transition. Possible impingement si le mouvement est fait en force brute. Régresser aux excentriques." },
    { flag: "Stagnation > 4 semaines", action: "Revenir aux fondamentaux : tractions explosives et dips barre droite. La force de base est probablement insuffisante." }
  ],

  summary: "Le muscle-up se construit par étapes : prérequis de force → explosivité du tirage → transition avec kip → muscle-up strict → variantes. L'erreur classique est de tenter le muscle-up sans la base explosive. Les dips barre droite sont un prérequis souvent négligé mais indispensable."
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

  description: "Le handstand (équilibre sur les mains) consiste à maintenir le corps parfaitement vertical en appui sur les mains. C'est une compétence à part entière qui se travaille quotidiennement. Au-delà de la force d'épaules, il développe la proprioception, le contrôle corporel fin et une conscience spatiale unique.",

  why_it_matters: "Le handstand est présent dans quasiment tous les enchaînements avancés de calisthenics : transitions planche ↔ handstand, press, négatives, combos. C'est aussi un excellent outil d'échauffement et un élément de repos actif dans les séquences longues. La maîtrise du handstand libre est un marqueur de niveau reconnu dans la discipline.",

  prerequisites: [
    { name: "10+ pike push-ups propres", category: "force", critical: true },
    { name: "Souplesse des poignets (extension 80°+)", category: "mobilité", critical: true },
    { name: "Gainage creux (hollow) 30s", category: "core", critical: false },
    { name: "Confort en inversion (pas de peur)", category: "mental", critical: true }
  ],

  anatomy: {
    primary: ["Deltoïdes (antérieurs + moyens)", "Trapèzes supérieurs", "Triceps"],
    secondary: ["Avant-bras (stabilisation)", "Core profond (transverse)", "Fléchisseurs des doigts"],
    key_insight: "Le contrôle du handstand se fait principalement par les doigts et les poignets, pas par les épaules. Les doigts pressent le sol pour corriger les déséquilibres vers l'avant (sous-équilibre), les paumes pressent pour corriger vers l'arrière (sur-équilibre)."
  },

  technique: {
    form_principles: [
      { name: "Ligne droite (stacking)", detail: "Poignets sous épaules, épaules sous hanches, hanches sous pieds. Le corps doit former une seule ligne verticale. Toute cassure au niveau des épaules ou du bassin crée un déséquilibre constant." },
      { name: "Épaules ouvertes", detail: "L'angle épaule doit être totalement ouvert (180°). Si les épaules ne s'ouvrent pas complètement, le dos se cambre pour compenser (banana handstand)." },
      { name: "Rétroversion du bassin", detail: "Comme en hollow body, le bassin doit être légèrement basculé vers l'arrière pour fermer la cambrure lombaire. C'est la clé de la ligne droite." },
      { name: "Doigts actifs", detail: "Les doigts sont écartés et pressent activement le sol. Ce sont eux qui gèrent l'équilibre, pas les épaules. Penser 'gripper le sol'." },
      { name: "Regard entre les mains", detail: "La tête reste neutre, regard dirigé entre les mains (pas vers les pieds, pas vers le sol devant soi). La position de la tête influence toute la ligne." }
    ],
    breathing: "Respiration naturelle et continue. Bloquer la respiration raccourcit les tentatives. Au début il est normal de bloquer — l'objectif est de relâcher progressivement."
  },

  common_mistakes: [
    { name: "Banana handstand (dos cambré)", severity: "haute", description: "Épaules pas assez ouvertes, compensées par une cambrure lombaire. Le corps forme un arc au lieu d'une ligne.", fix: "Travailler le handstand dos au mur (poitrine face au mur) pour forcer l'ouverture des épaules. Renforcer le hollow body." },
    { name: "Mains trop écartées ou trop serrées", severity: "moyenne", description: "Un placement de mains inadapté déstabilise l'ensemble.", fix: "Largeur d'épaules, doigts bien écartés. Tester plusieurs largeurs pour trouver la plus naturelle." },
    { name: "Manque de travail régulier", severity: "haute", description: "Le handstand est une compétence motrice qui se perd vite sans pratique régulière.", fix: "5-15 min de travail quotidien valent mieux que 2h une fois par semaine. La fréquence prime sur le volume." }
  ],

  progressions: [
    { level: 1, name: "Handstand mur (poitrine face au mur)", target: "60s stable", exercises: [{ name: "Handstand mur (poitrine)", reps: "5 × 20-30s" }, { name: "Marches au mur", reps: "3 × 3 montées" }, { name: "Épaule-main au mur", reps: "3 × 6 par côté" }] },
    { level: 2, name: "Handstand libre court", target: "5-10s de tenue libre", exercises: [{ name: "Kick-up + tenue", reps: "10-15 tentatives" }, { name: "Décollage du mur (float-offs)", reps: "10 × 3-5s" }, { name: "Sortie pirouette (bail)", reps: "Pratiquer systématiquement" }] },
    { level: 3, name: "Handstand libre 30s+", target: "30s+ stable et reproductible", exercises: [{ name: "Tenue libre", reps: "10-15 tentatives" }, { name: "Travail de ligne (shape work)", reps: "3 × 20s" }, { name: "Déplacements latéraux", reps: "3 × 5m" }] },
    { level: 4, name: "HSPU + OAH", target: "5 pompes renversées / 5s OAH", exercises: [{ name: "Pompes renversées (mur → libre)", reps: "5 × 3-5" }, { name: "Press straddle → handstand", reps: "3 × 3" }, { name: "Équilibre un bras (début)", reps: "Tentatives" }] }
  ],

  programming_guidelines: {
    frequency: "Idéalement quotidien. 5-15 min suffisent. La régularité compte plus que l'intensité.",
    placement: "En début de séance (frais) ou en séance dédiée courte. Peut aussi servir d'échauffement actif.",
    note: "Le handstand se travaille par tentatives courtes avec repos complet entre chaque, pas par séries longues sous fatigue."
  },

  volume_guidelines: {
    session_duration: "10-20 min de travail spécifique",
    rest: "30-60s entre tentatives (récupération nerveuse, pas musculaire)",
    sets: "10-20 tentatives de 5-30s"
  },

  frequency_guidelines: {
    training_days: "5-7/semaine (travail court)",
    note: "Le handstand est l'une des rares compétences qui bénéficie d'un travail quasi-quotidien à faible volume."
  },

  warmup: {
    structure: [
      { phase: "Poignets", duration: "3-5 min", items: ["Rotations de poignets", "Extensions progressives au sol", "Flexions sur les paumes et dos de main"] },
      { phase: "Épaules", duration: "2-3 min", items: ["Cercles d'épaules", "Élévations bras tendus", "Étirements pectoraux contre un mur"] }
    ],
    key_point: "Les poignets doivent TOUJOURS être échauffés avant le handstand. C'est la zone la plus sollicitée et la plus fragile."
  },

  warning_flags: [
    { flag: "Douleur poignets persistante", action: "Réduire le volume, augmenter le temps d'échauffement poignets. Si ça persiste, travailler sur parallettes ou sur les poings." },
    { flag: "Peur de tomber", action: "Maîtriser d'abord la sortie pirouette (bail) contre un mur. La confiance vient quand on sait comment sortir en sécurité." }
  ],

  summary: "Le handstand se construit par la régularité : du mur vers le libre, de la stabilité vers les variantes. La tête guide la trajectoire — principe universel. Travailler 10 min tous les jours vaut mieux que 2h une fois par semaine."
},

// ═══════════════════════════════════════════════════════════════════════════════
// DIPS
// ═══════════════════════════════════════════════════════════════════════════════
dips: {
  title: "Dips",
  slug: "dips",
  category: "Poussée / Base",
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
  category: "Tirage / Base",
  difficulty_range: [1, 6],
  icon: "△",
  color: "#32D4C0",

  description: "Les tractions sont le mouvement fondamental de tirage en calisthenics. Suspendre sous une barre, tirer le corps vers le haut jusqu'au menton ou la poitrine au-dessus de la barre. Déclinable en multiples prises (pronation, supination, neutre, large, serré).",

  why_it_matters: "Les tractions sont à la chaîne de tirage ce que les dips sont à la poussée. Elles développent les dorsaux, les biceps, les avant-bras et le core. Elles préparent au front lever, au muscle-up et à tous les mouvements de tirage avancés.",

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
  category: "Gainage / Compression",
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
  category: "Poussée / Base",
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
    name: "Évolution Binaire",
    description: "La progression au poids du corps suit un cycle naturel : d'abord gagner en force et en volume (même en forme imparfaite), puis consolider la technique, puis accepter de dégrader temporairement la forme pour monter le volume d'un cran, et corriger à nouveau. Ce cycle s'applique à tous les niveaux, du débutant à l'élite.",
    applies_to: "all",
    source: "Principe fondamental calisthenics"
  },
  strength_vs_form_periods: {
    name: "Périodes de Force / Périodes de Forme",
    description: "Alternance entre phases de renforcement (80% force, 20% forme) et phases de nettoyage (80% forme, 20% force). On ne peut pas performer clean en se sentant lourd. Grow strength → get used → get clean.",
    applies_to: "all",
    beginner_example: "3s bad form straddle → renforcer à 7-8s bad form → corriger à 2-3s clean form",
    advanced_example: "1-1-1 clean → accepter 2-2-2 bad form → corriger 2-2-2 clean → monter à 3-2-2 bad form"
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
    name: "La Méthode 3× (Montée Progressive)",
    description: "Quand le temps de maintien est encore court (quelques secondes) : réaliser 3 tentatives enchaînées avec micro-repos. Première tentative à 50% du max, respirer 3-5 secondes. Deuxième à 80%, respirer 5-7 secondes. Troisième à 100% réel. Le corps mémorise la position trois fois plus vite et l'on atteint son vrai potentiel maximal plus facilement.",
    applies_to: "beginner"
  },
  degressive_form: {
    name: "Forme Dégressive",
    description: "En clean form, tu es à intensité maximale et ne peux pas ajouter de volume. Comme un powerlifter ne peut pas enchaîner 2 reps à 1RM. Accepte de dégrader la forme pour ajouter du volume dans les combos, puis corrige après.",
    applies_to: "intermediate+"
  },
  xxx: {
    name: "Le XXX",
    description: "Enchaînement de trois variantes (push-press-hold) dans toutes les combinaisons possibles (6 ordres). Principe d'entraînement particulièrement efficace pour développer l'endurance de force. Trois avantages majeurs : adaptation infinie (jamais de stagnation), sollicitation simultanée de toutes les variantes, dimension ludique. L'ordre des variantes influence leur difficulté : la première est facilitée (fraîcheur), la dernière est plus dure (fatigue accumulée).",
    applies_to: "advanced+",
    orders: ["push-press-hold", "push-hold-press", "hold-press-push", "hold-push-press", "press-push-hold", "press-hold-push"],
    usage: "1 à 3 fois par entraînement avec repos conséquent entre les passages (7-10 min). Peut être déséquilibré volontairement pour cibler une variante spécifique."
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
    description: "En calisthenics, la composition corporelle a un impact direct sur la performance. Les derniers kilogrammes et pourcentages de masse grasse font une différence significative sur les figures et l'endurance. Privilégier une alimentation de qualité, non transformée, permet de maintenir un ratio force/poids optimal.",
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
