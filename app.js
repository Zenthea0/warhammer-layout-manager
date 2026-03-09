const { useState, useEffect, useRef } = React;
const { Eye, Trash2, Move, Check, Shuffle, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } = lucide;

const TABLE_WIDTH = 600;
const TABLE_HEIGHT = 440;
const SCALE = 10;
const CENTER_X = TABLE_WIDTH / 2;
const CENTER_Y = TABLE_HEIGHT / 2;

const TERRAIN_TYPES = {
  gruin: { 
    width: 120, height: 60,
    color: 'bg-gray-600', borderColor: 'border-gray-800',
    label: 'Grande Ruine', icon: '🏛️',
    buildingPolygon: [
      { x: 1, y: 6 }, { x: 1, y: 1 }, { x: 10, y: 1 },
      { x: 10, y: 1.2 }, { x: 1.2, y: 1.2 }, { x: 1.2, y: 6 }
    ]
  },
  pruin: { 
    width: 120, height: 60,
    color: 'bg-gray-500', borderColor: 'border-gray-700',
    label: 'Petite Ruine', icon: '🏚️',
    buildingPolygon: [
      { x: 10.8, y: 6 }, { x: 10.8, y: 1.2 }, { x: 2, y: 1.2 },
      { x: 2, y: 1 }, { x: 11, y: 1 }, { x: 11, y: 6 }
    ]
  },
  forest: { 
    width: 90, height: 50,
    color: 'bg-green-700', borderColor: 'border-green-900',
    label: 'Forêt', icon: '🌲'
  },
  container: { 
    width: 50, height: 25,
    color: 'bg-orange-600', borderColor: 'border-orange-800',
    label: 'Container', icon: '📦'
  }
};

const WTC_LAYOUTS = {
  "Layout par défaut": [
    { id: 1, x: 30, y: 20, type: 'gruin', rotation: 0, name: "GRuine 1", symmetricId: 2 },
    { id: 2, x: 450, y: 360, type: 'gruin', rotation: 180, name: "GRuine 1'", symmetricId: 1 },
    { id: 3, x: 430, y: 50, type: 'gruin', rotation: 0, name: "GRuine 2", symmetricId: 4 },
    { id: 4, x: 50, y: 330, type: 'gruin', rotation: 180, name: "GRuine 2'", symmetricId: 3 },
    { id: 5, x: 240, y: 100, type: 'pruin', rotation: 0, name: "PRuine 1", symmetricId: 6 },
    { id: 6, x: 240, y: 280, type: 'pruin', rotation: 180, name: "PRuine 1'", symmetricId: 5 },
    { id: 7, x: 100, y: 190, type: 'pruin', rotation: 0, name: "PRuine 2", symmetricId: 8 },
    { id: 8, x: 380, y: 190, type: 'pruin', rotation: 180, name: "PRuine 2'", symmetricId: 7 },
    { id: 9, x: 70, y: 120, type: 'forest', rotation: 0, name: "Forêt 1", symmetricId: 10 },
    { id: 10, x: 440, y: 270, type: 'forest', rotation: 180, name: "Forêt 1'", symmetricId: 9 },
    { id: 11, x: 275, y: 50, type: 'container', rotation: 0, name: "Container 1", symmetricId: 12 },
    { id: 12, x: 275, y: 365, type: 'container', rotation: 180, name: "Container 1'", symmetricId: 11 },
  ]
};

const DEPLOYMENT_ZONES = {
  "Dawn of War": {
    player1: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 12 }, { x: 0, y: 12 }
      ]
    },
    player2: {
      type: 'polygon',
      points: [
        { x: 0, y: 32 }, { x: 60, y: 32 }, { x: 60, y: 44 }, { x: 0, y: 44 }
      ]
    }
  },
  "Crucible of Battle": {
    player1: {
      type: 'polygon',
      points: [
        { x: 30, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 44 }
      ]
    },
    player2: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 }, { x: 30, y: 44 }, { x: 0, y: 44 }
      ]
    }
  },
  "Hammer and Anvil": {
    player1: {
      type: 'polygon',
      points: [
        { x: 42, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 44 }, { x: 42, y: 44 }
      ]
    },
    player2: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 }, { x: 18, y: 0 }, { x: 18, y: 44 }, { x: 0, y: 44 }
      ]
    }
  },
  "Tipping Point": {
    player1: {
      type: 'polygon',
      points: [
        { x: 40, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 44 }, { x: 48, y: 44 }, { x: 48, y: 22 }, { x: 40, y: 22 }
      ]
    },
    player2: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 }, { x: 12, y: 0 }, { x: 12, y: 22 }, { x: 20, y: 22 }, { x: 20, y: 44 }, { x: 0, y: 44 }
      ]
    }
  },
  "Sweeping Engagement": {
    player1: {
      type: 'polygon',
      points: [
        { x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 14 }, { x: 30, y: 14 }, { x: 30, y: 8 }, { x: 0, y: 8 }
      ]
    },
    player2: {
      type: 'polygon',
      points: [
        { x: 0, y: 30 }, { x: 30, y: 30 }, { x: 30, y: 36 }, { x: 60, y: 36 }, { x: 60, y: 44 }, { x: 0, y: 44 }
      ]
    }
  },
  "Search and Destroy": {
    player1: {
      type: 'path',
      // (30;0) -> (60;0) -> (60;22) -> (39;22) -> arc vers (30;13) -> fermer
      d: (scale) => {
        const r = 9 * scale;
        return `M ${30*scale} ${0*scale} 
                L ${60*scale} ${0*scale} 
                L ${60*scale} ${22*scale} 
                L ${39*scale} ${22*scale} 
                A ${r} ${r} 0 0 0 ${30*scale} ${13*scale} 
                Z`;
      }
    },
    player2: {
      type: 'path',
      // (0;22) -> (21;22) -> arc vers (30;31) -> (30;44) -> (0;44) -> fermer
      d: (scale) => {
        const r = 9 * scale;
        return `M ${0*scale} ${22*scale} 
                L ${21*scale} ${22*scale} 
                A ${r} ${r} 0 0 0 ${30*scale} ${31*scale} 
                L ${30*scale} ${44*scale} 
                L ${0*scale} ${44*scale} 
                Z`;
      }
    }
  }
};

// Objectifs pour chaque zone de déploiement (5 objectifs par zone)
// Cercle intérieur : 40mm diamètre ≈ 1.57" diamètre → rayon ≈ 0.79"
// Cercle extérieur : 20mm + 3" = 0.79" + 3" = 3.79" rayon
const OBJECTIVES = {
  "Dawn of War": [
    { x: 30, y: 22 }, { x: 30, y: 6 }, { x: 30, y: 38 }, { x: 10, y: 22 }, { x: 50, y: 22 }
  ],
  "Crucible of Battle": [
    { x: 30, y: 22 }, { x: 20, y: 8 }, { x: 46, y: 10 }, { x: 14, y: 34 }, { x: 40, y: 36 }
  ],
  "Hammer and Anvil": [
    { x: 30, y: 22 }, { x: 30, y: 6 }, { x: 30, y: 38 }, { x: 10, y: 22 }, { x: 50, y: 22 }
  ],
  "Tipping Point": [
    { x: 30, y: 22 }, { x: 22, y: 8 }, { x: 46, y: 10 }, { x: 14, y: 34 }, { x: 38, y: 36 }
  ],
  "Sweeping Engagement": [
    { x: 30, y: 22 }, { x: 10, y: 18 }, { x: 42, y: 6 }, { x: 18, y: 38 }, { x: 50, y: 26 }
  ],
  "Search and Destroy": [
    { x: 30, y: 22 }, { x: 14, y: 10 }, { x: 46, y: 10 }, { x: 14, y: 34 }, { x: 46, y: 34 }
  ]
};

// Constantes pour les objectifs (conversion mm vers pouces)
const OBJECTIVE_INNER_RADIUS = 0.79; // 40mm diamètre / 2 ≈ 0.79"
const OBJECTIVE_OUTER_RADIUS = 3.79; // 20mm + 3" ≈ 0.79" + 3"

const Warhammer40kLayoutManager = () => {
  const initialLayout = WTC_LAYOUTS["Layout par défaut"] || [];
  const [terrains, setTerrains] = useState(JSON.parse(JSON.stringify(initialLayout)));
  const [selectedLayout, setSelectedLayout] = useState("Layout par défaut");
  const [deploymentZone, setDeploymentZone] = useState("Dawn of War");
  const [showDeployment, setShowDeployment] = useState(true);
  const [showObjectives, setShowObjectives] = useState(false);
  const [selectedTerrain, setSelectedTerrain] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editMethod, setEditMethod] = useState('buttons'); // 'buttons', 'drag' ou 'fine'
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragOriginalRotation, setDragOriginalRotation] = useState(null); // Rotation d'origine avant le drag
  const snapGuidesRef = useRef([]); // Guides d'aimantation (useRef pour éviter re-renders)
  const [snapGuidesVersion, setSnapGuidesVersion] = useState(0); // Pour forcer le re-render du SVG des guides
  const losCalculationCancelledRef = useRef(false); // Pour annuler le calcul LoS en cours
  
  // États pour le mode positionnement fin
  const [finePositionStep, setFinePositionStep] = useState(1); // Étape 1 à 5
  const [finePositionCorner1, setFinePositionCorner1] = useState(null); // Index du premier coin sélectionné
  const [finePositionCorner2, setFinePositionCorner2] = useState(null); // Index du deuxième coin sélectionné
  const [finePositionX, setFinePositionX] = useState(''); // Coordonnée X pour l'étape 3
  const [finePositionY, setFinePositionY] = useState(''); // Coordonnée Y pour l'étape 3
  const [finePositionAxis, setFinePositionAxis] = useState('X'); // Axe choisi pour l'étape 5 ('X' ou 'Y')
  const [finePositionValue, setFinePositionValue] = useState(''); // Valeur pour l'étape 5
  const [finePositionError, setFinePositionError] = useState(''); // Message d'erreur
  
  const [pointA, setPointA] = useState(null);
  const [pointB, setPointB] = useState(null);
  const [losResult, setLosResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [cornersMode, setCornersMode] = useState('hidden'); // 'hidden', 'classic', 'feq'
  const [optimizing, setOptimizing] = useState(false);
  
  // Charger les layouts personnalisés depuis localStorage
  const [customLayouts, setCustomLayouts] = useState(() => {
    try {
      const stored = localStorage.getItem('w40k_customLayouts');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Erreur chargement layouts:', e);
      return {};
    }
  });
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [layoutNameInput, setLayoutNameInput] = useState("");
  const [saveDebugInfo, setSaveDebugInfo] = useState(null);
  const [containerMoveStep, setContainerMoveStep] = useState(1); // 1 pouce ou 0.5 pouce
  
  // États pour l'import/export de layouts
  const MAX_LAYOUTS = 30;
  const [showLayoutImportExport, setShowLayoutImportExport] = useState(false);
  const [importMode, setImportMode] = useState('merge'); // 'merge' ou 'replace'
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);
  
  // États pour l'export d'images
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportTab, setExportTab] = useState('image'); // 'image' ou 'pdf'
  const [exportShowClassicCoords, setExportShowClassicCoords] = useState(false);
  const [exportShowFEQCoords, setExportShowFEQCoords] = useState(true);
  const [exportShowDeployment, setExportShowDeployment] = useState(true);
  const [exportShowObjectives, setExportShowObjectives] = useState(false);
  const [exportShowSurfaces, setExportShowSurfaces] = useState(false);
  const [exportGenerating, setExportGenerating] = useState(false);
  const exportCanvasRef = useRef(null);
  
  // Configuration du nombre de décors pour la génération aléatoire
  const [showGenerateConfig, setShowGenerateConfig] = useState(false);
  const [configGruin, setConfigGruin] = useState(4);
  const [configPruin, setConfigPruin] = useState(4);
  const [configForest, setConfigForest] = useState(2);
  const [configContainer, setConfigContainer] = useState(2);
  const [generateError, setGenerateError] = useState(null);
  
  // Mode LoS avancé
  const [advancedLoSMode, setAdvancedLoSMode] = useState(false);
  const [losResolution, setLosResolution] = useState(0.5); // 0.25, 0.5, ou 1 pouce
  const [excludeTerrainPoints, setExcludeTerrainPoints] = useState(true); // Exclure les points dans les décors de la zone 1
  const [advancedLoSCalculating, setAdvancedLoSCalculating] = useState(false);
  const [advancedLoSProgress, setAdvancedLoSProgress] = useState(0);
  const [advancedLoSResults, setAdvancedLoSResults] = useState(null); // Résultats des calculs
  const [showAdvancedLoSConfig, setShowAdvancedLoSConfig] = useState(false);
  const [showGridPoints, setShowGridPoints] = useState(false); // Afficher les points de la grille
  const [showVisiblePoints, setShowVisiblePoints] = useState(false); // Afficher les points visibles
  const [showVisibleSurfaces, setShowVisibleSurfaces] = useState(false); // Afficher les surfaces visibles
  const [gridClassification, setGridClassification] = useState(null); // Cache de la classification

  // Responsive - scale de la table
  const [tableScale, setTableScale] = useState(1);
  const [userZoom, setUserZoom] = useState(1); // Zoom utilisateur (pinch)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 }); // Décalage de la vue
  const [isPinching, setIsPinching] = useState(false);
  const [lastPinchDistance, setLastPinchDistance] = useState(0);
  const [lastPinchCenter, setLastPinchCenter] = useState({ x: 0, y: 0 });
  const tableContainerRef = useRef(null);

  // Fonctions de gestion du LocalStorage pour les résultats LoS
  const getLosStorageKey = (layoutName, zone) => `${layoutName}_${zone}`;
  
  const saveLoSResults = (layoutName, zone, results) => {
    try {
      const stored = JSON.parse(localStorage.getItem('losResults') || '{}');
      const key = getLosStorageKey(layoutName, zone);
      stored[key] = {
        ...results,
        // Convertir les Maps en objets pour le stockage
        visibilityNML: Object.fromEntries(results.visibilityNML),
        visibilityZ2: Object.fromEntries(results.visibilityZ2),
        resolution: losResolution,
        timestamp: Date.now()
      };
      localStorage.setItem('losResults', JSON.stringify(stored));
    } catch (e) {
      console.error('Erreur sauvegarde résultats LoS:', e);
    }
  };
  
  const loadLoSResults = (layoutName, zone) => {
    try {
      const stored = JSON.parse(localStorage.getItem('losResults') || '{}');
      const key = getLosStorageKey(layoutName, zone);
      const data = stored[key];
      if (data) {
        return {
          visibilityNML: new Map(Object.entries(data.visibilityNML)),
          visibilityZ2: new Map(Object.entries(data.visibilityZ2)),
          statsNML: data.statsNML,
          statsZ2: data.statsZ2,
          resolution: data.resolution
        };
      }
      return null;
    } catch (e) {
      console.error('Erreur chargement résultats LoS:', e);
      return null;
    }
  };
  
  const invalidateLoSResultsForLayout = (layoutName) => {
    try {
      const stored = JSON.parse(localStorage.getItem('losResults') || '{}');
      const keysToDelete = Object.keys(stored).filter(key => key.startsWith(`${layoutName}_`));
      keysToDelete.forEach(key => delete stored[key]);
      localStorage.setItem('losResults', JSON.stringify(stored));
      // Aussi vider les résultats en mémoire si c'est le layout actuel
      if (layoutName === selectedLayout) {
        setAdvancedLoSResults(null);
        setShowVisiblePoints(false);
        setShowVisibleSurfaces(false);
      }
    } catch (e) {
      console.error('Erreur invalidation résultats LoS:', e);
    }
  };

  useEffect(() => {
    const calculateScale = () => {
      const containerWidth = tableContainerRef.current?.offsetWidth || window.innerWidth - 32;
      const maxScale = Math.min(1, (containerWidth - 16) / TABLE_WIDTH);
      setTableScale(maxScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  // Sauvegarder les layouts personnalisés dans localStorage
  useEffect(() => {
    try {
      localStorage.setItem('w40k_customLayouts', JSON.stringify(customLayouts));
    } catch (e) {
      console.error('Erreur sauvegarde layouts:', e);
    }
  }, [customLayouts]);

  // Charger les résultats LoS sauvegardés lors du changement de zone de déploiement
  useEffect(() => {
    const savedResults = loadLoSResults(selectedLayout, deploymentZone);
    if (savedResults) {
      setAdvancedLoSResults(savedResults);
      setLosResolution(savedResults.resolution);
    } else {
      setAdvancedLoSResults(null);
    }
    setShowVisiblePoints(false);
    setShowVisibleSurfaces(false);
  }, [deploymentZone]);

  const loadLayout = (layoutName) => {
    const layout = WTC_LAYOUTS[layoutName] || customLayouts[layoutName];
    if (layout) {
      setSelectedLayout(layoutName);
      setTerrains(JSON.parse(JSON.stringify(layout)));
      setPointA(null);
      setPointB(null);
      setLosResult(null);
      setSelectedTerrain(null);
      
      // Charger les résultats LoS sauvegardés pour ce layout et la zone actuelle
      const savedResults = loadLoSResults(layoutName, deploymentZone);
      if (savedResults) {
        setAdvancedLoSResults(savedResults);
        setLosResolution(savedResults.resolution);
      } else {
        setAdvancedLoSResults(null);
      }
      setShowVisiblePoints(false);
      setShowVisibleSurfaces(false);
    }
  };

  const resetLoS = () => {
    setPointA(null);
    setPointB(null);
    setLosResult(null);
  };

  const validateGenerateConfig = () => {
    const errors = [];
    
    // Vérifier que chaque nombre est pair
    if (configGruin % 2 !== 0) {
      errors.push("Le nombre de Grandes Ruines doit être pair");
    }
    if (configPruin % 2 !== 0) {
      errors.push("Le nombre de Petites Ruines doit être pair");
    }
    if (configForest % 2 !== 0) {
      errors.push("Le nombre de Forêts doit être pair");
    }
    if (configContainer % 2 !== 0) {
      errors.push("Le nombre de Containers doit être pair");
    }
    
    // Vérifier les limites individuelles
    if (configGruin < 0 || configGruin > 8) {
      errors.push("Le nombre de Grandes Ruines doit être entre 0 et 8");
    }
    if (configPruin < 0 || configPruin > 8) {
      errors.push("Le nombre de Petites Ruines doit être entre 0 et 8");
    }
    if (configForest < 0 || configForest > 4) {
      errors.push("Le nombre de Forêts doit être entre 0 et 4");
    }
    if (configContainer < 0 || configContainer > 4) {
      errors.push("Le nombre de Containers doit être entre 0 et 4");
    }
    
    // Vérifier le total gruin + pruin
    if (configGruin + configPruin > 12) {
      errors.push("Le total Grandes Ruines + Petites Ruines ne doit pas dépasser 12");
    }
    
    return errors;
  };

  const startGeneration = () => {
    const errors = validateGenerateConfig();
    if (errors.length > 0) {
      setGenerateError(errors);
      return;
    }
    setGenerateError(null);
    setShowGenerateConfig(false);
    generateRandomLayout();
  };

  // ===== FONCTIONS POUR LE MODE LOS AVANCÉ =====
  
  // Vérifie si un point est dans un polygone (algorithme ray-casting amélioré)
  // Inclut les points sur les bords du polygone
  const isPointInPolygon = (point, polygon) => {
    const n = polygon.length;
    
    // D'abord vérifier si le point est sur un des bords du polygone
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      // Vérifier si le point est sur ce segment
      if (isPointOnSegment(point, { x: xi, y: yi }, { x: xj, y: yj })) {
        return true;
      }
    }
    
    // Sinon, utiliser l'algorithme ray-casting standard
    let inside = false;
    
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) &&
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  };
  
  // Vérifie si un point est sur un segment (avec tolérance)
  const isPointOnSegment = (point, p1, p2) => {
    const tolerance = 0.0001;
    
    // Vérifier si le point est dans le rectangle englobant du segment
    const minX = Math.min(p1.x, p2.x) - tolerance;
    const maxX = Math.max(p1.x, p2.x) + tolerance;
    const minY = Math.min(p1.y, p2.y) - tolerance;
    const maxY = Math.max(p1.y, p2.y) + tolerance;
    
    if (point.x < minX || point.x > maxX || point.y < minY || point.y > maxY) {
      return false;
    }
    
    // Calculer la distance du point à la ligne
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthSq = dx * dx + dy * dy;
    
    if (lengthSq < tolerance * tolerance) {
      // Segment de longueur quasi nulle, vérifier la distance au point
      const distSq = (point.x - p1.x) ** 2 + (point.y - p1.y) ** 2;
      return distSq < tolerance * tolerance;
    }
    
    // Distance perpendiculaire du point à la ligne
    const cross = Math.abs((point.y - p1.y) * dx - (point.x - p1.x) * dy);
    const distance = cross / Math.sqrt(lengthSq);
    
    return distance < tolerance;
  };
  
  // Vérifie si un point est dans une zone de déploiement (polygon ou path)
  const isPointInDeploymentZone = (point, zone) => {
    if (zone.type === 'polygon') {
      return isPointInPolygon(point, zone.points);
    } else if (zone.type === 'path') {
      // Pour les paths avec arcs, on convertit en polygone en échantillonnant l'arc
      const polygonPoints = convertPathToPolygon(zone);
      return isPointInPolygon(point, polygonPoints);
    }
    return false;
  };
  
  // Convertit un path SVG avec arc en polygone (pour Search and Destroy)
  const convertPathToPolygon = (zone) => {
    // On parse la fonction d() pour extraire les points
    // Pour Search and Destroy, on connait la structure :
    // Player1: (30,0) -> (60,0) -> (60,22) -> (39,22) -> arc -> (30,13) -> fermer
    // Player2: (0,22) -> (21,22) -> arc -> (30,31) -> (30,44) -> (0,44) -> fermer
    
    // Centre de l'arc : (30, 22), rayon : 9
    const cx = 30, cy = 22, r = 9;
    
    // On utilise une heuristique basée sur le path
    const pathStr = zone.d(1); // On génère le path avec scale=1 pour avoir les coordonnées en pouces
    
    // Extraire les points du path
    const points = [];
    
    // Parser le path pour extraire les coordonnées
    // Format: M x y L x y L x y ... A rx ry rotation large-arc sweep x y Z
    const commands = pathStr.match(/[MLAZ][^MLAZ]*/gi);
    
    if (!commands) return points;
    
    let lastX = 0, lastY = 0;
    let arcStart = null;
    let arcEnd = null;
    
    for (const cmd of commands) {
      const type = cmd.charAt(0).toUpperCase();
      const coords = cmd.slice(1).trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
      
      if (type === 'M' || type === 'L') {
        if (coords.length >= 2) {
          lastX = coords[0];
          lastY = coords[1];
          points.push({ x: lastX, y: lastY });
        }
      } else if (type === 'A') {
        // Arc: rx ry x-rotation large-arc-flag sweep-flag x y
        if (coords.length >= 7) {
          arcStart = { x: lastX, y: lastY };
          arcEnd = { x: coords[5], y: coords[6] };
          
          // Échantillonner l'arc
          const arcPoints = sampleArc(cx, cy, r, arcStart, arcEnd, 16);
          for (const ap of arcPoints) {
            points.push(ap);
          }
          
          lastX = arcEnd.x;
          lastY = arcEnd.y;
        }
      }
      // Z ferme le polygone, pas besoin de traitement
    }
    
    return points;
  };
  
  // Échantillonne un arc de cercle entre deux points
  const sampleArc = (cx, cy, r, start, end, numSamples) => {
    const points = [];
    
    // Calculer les angles de départ et d'arrivée
    let startAngle = Math.atan2(start.y - cy, start.x - cx);
    let endAngle = Math.atan2(end.y - cy, end.x - cx);
    
    // S'assurer qu'on va dans le bon sens (sens anti-horaire pour sweep=0)
    // Pour Search and Destroy player1: de (39,22) à (30,13) -> de 0° à -90° (ou 270°)
    // Pour Search and Destroy player2: de (21,22) à (30,31) -> de 180° à 90°
    
    // Normaliser les angles
    while (startAngle < 0) startAngle += 2 * Math.PI;
    while (endAngle < 0) endAngle += 2 * Math.PI;
    
    // Déterminer la direction de l'arc (on veut l'arc le plus court dans le sens anti-horaire)
    let deltaAngle = endAngle - startAngle;
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;
    
    // Échantillonner
    for (let i = 1; i < numSamples; i++) {
      const t = i / numSamples;
      const angle = startAngle + deltaAngle * t;
      points.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      });
    }
    
    // Ajouter le point final
    points.push({ x: end.x, y: end.y });
    
    return points;
  };
  
  // Vérifie si un point est dans l'emprise d'un décor (rectangle tourné)
  const isPointInTerrain = (point, terrain) => {
    const corners = getRotatedCorners(terrain);
    return isPointInPolygon({ x: point.x * SCALE, y: point.y * SCALE }, corners);
  };
  
  // Vérifie si un point est dans un container
  const isPointInContainer = (point) => {
    for (const terrain of terrains) {
      if (terrain.type === 'container' && isPointInTerrain(point, terrain)) {
        return true;
      }
    }
    return false;
  };
  
  // Vérifie si un point est dans n'importe quel décor (hors containers)
  const isPointInAnyTerrainExceptContainer = (point) => {
    for (const terrain of terrains) {
      if (terrain.type !== 'container' && isPointInTerrain(point, terrain)) {
        return true;
      }
    }
    return false;
  };
  
  // Vérifie si un point est dans n'importe quel décor
  const isPointInAnyTerrain = (point) => {
    for (const terrain of terrains) {
      if (isPointInTerrain(point, terrain)) {
        return true;
      }
    }
    return false;
  };
  
  // Génère la grille de points selon la résolution
  const generateGrid = (resolution) => {
    const points = [];
    const stepsX = Math.floor(60 / resolution) + 1;
    const stepsY = Math.floor(44 / resolution) + 1;
    
    for (let i = 0; i < stepsX; i++) {
      for (let j = 0; j < stepsY; j++) {
        points.push({
          x: i * resolution,
          y: j * resolution
        });
      }
    }
    
    return points;
  };
  
  // Classifie tous les points de la grille
  const classifyGridPoints = (resolution) => {
    const zone = DEPLOYMENT_ZONES[deploymentZone];
    
    if (!zone) return { zone1Only: [], zone2Only: [], noManLandOnly: [], zone1AndNoManLand: [], zone2AndNoManLand: [] };
    
    const stepsX = Math.floor(60 / resolution) + 1;
    const stepsY = Math.floor(44 / resolution) + 1;
    
    // Première passe : classifier chaque point dans une grille 2D indexée par entiers
    const grid = []; // grid[i][j] = { x, y, inZone1, inZone2, inTerrain, inContainer }
    
    for (let i = 0; i < stepsX; i++) {
      grid[i] = [];
      for (let j = 0; j < stepsY; j++) {
        const x = i * resolution;
        const y = j * resolution;
        const point = { x, y };
        
        const inZone1 = isPointInDeploymentZone(point, zone.player1);
        const inZone2 = isPointInDeploymentZone(point, zone.player2);
        const inContainer = isPointInContainer(point);
        const inTerrain = inContainer ? false : isPointInAnyTerrainExceptContainer(point);
        
        grid[i][j] = {
          x,
          y,
          inZone1,
          inZone2,
          inTerrain,
          inContainer
        };
      }
    }
    
    // Fonction pour obtenir un voisin par indices
    const getNeighbor = (i, j) => {
      if (i < 0 || i >= stepsX || j < 0 || j >= stepsY) return null;
      return grid[i][j];
    };
    
    // Directions pour les 8 voisins (en indices)
    const directions = [
      { di: 0, dj: -1 },   // haut
      { di: 0, dj: 1 },    // bas
      { di: -1, dj: 0 },   // gauche
      { di: 1, dj: 0 },    // droite
      { di: -1, dj: -1 },  // haut-gauche
      { di: 1, dj: -1 },   // haut-droite
      { di: -1, dj: 1 },   // bas-gauche
      { di: 1, dj: 1 }     // bas-droite
    ];
    
    // Fonction pour vérifier si un point a un voisin EXISTANT dans le No Man's Land
    const hasNeighborInNoManLand = (i, j) => {
      for (const dir of directions) {
        const neighbor = getNeighbor(i + dir.di, j + dir.dj);
        if (neighbor !== null && !neighbor.inZone1 && !neighbor.inZone2) {
          return true;
        }
      }
      return false;
    };
    
    // Fonction pour vérifier si un point du NML a un voisin EXISTANT dans zone 1
    const hasNeighborInZone1 = (i, j) => {
      for (const dir of directions) {
        const neighbor = getNeighbor(i + dir.di, j + dir.dj);
        if (neighbor !== null && neighbor.inZone1) {
          return true;
        }
      }
      return false;
    };
    
    // Fonction pour vérifier si un point du NML a un voisin EXISTANT dans zone 2
    const hasNeighborInZone2 = (i, j) => {
      for (const dir of directions) {
        const neighbor = getNeighbor(i + dir.di, j + dir.dj);
        if (neighbor !== null && neighbor.inZone2) {
          return true;
        }
      }
      return false;
    };
    
    // Deuxième passe : classifier avec les frontières
    const zone1OnlyPoints = [];
    const zone2OnlyPoints = [];
    const noManLandOnlyPoints = [];
    const zone1AndNoManLandPoints = [];
    const zone2AndNoManLandPoints = [];
    
    for (let i = 0; i < stepsX; i++) {
      for (let j = 0; j < stepsY; j++) {
        const point = grid[i][j];
        const pointData = {
          x: point.x,
          y: point.y,
          inTerrain: point.inTerrain,
          inContainer: point.inContainer
        };
        
        if (point.inZone1 && !point.inZone2) {
          // Point dans zone 1
          if (hasNeighborInNoManLand(i, j)) {
            zone1AndNoManLandPoints.push(pointData);
          } else {
            zone1OnlyPoints.push(pointData);
          }
        } else if (point.inZone2 && !point.inZone1) {
          // Point dans zone 2
          if (hasNeighborInNoManLand(i, j)) {
            zone2AndNoManLandPoints.push(pointData);
          } else {
            zone2OnlyPoints.push(pointData);
          }
        } else if (!point.inZone1 && !point.inZone2) {
          // Point dans No Man's Land - vérifier s'il est adjacent à une zone
          const adjZone1 = hasNeighborInZone1(i, j);
          const adjZone2 = hasNeighborInZone2(i, j);
          
          if (adjZone1) {
            zone1AndNoManLandPoints.push(pointData);
          } else if (adjZone2) {
            zone2AndNoManLandPoints.push(pointData);
          } else {
            noManLandOnlyPoints.push(pointData);
          }
        }
      }
    }
    
    return {
      zone1Only: zone1OnlyPoints,
      zone2Only: zone2OnlyPoints,
      noManLandOnly: noManLandOnlyPoints,
      zone1AndNoManLand: zone1AndNoManLandPoints,
      zone2AndNoManLand: zone2AndNoManLandPoints,
      totalPoints: stepsX * stepsY
    };
  };
  
  // Réinitialise les résultats du mode avancé
  const resetAdvancedLoS = () => {
    setAdvancedLoSResults(null);
    setAdvancedLoSProgress(0);
    setGridClassification(null);
  };
  
  // Met à jour la classification de la grille
  const updateGridClassification = () => {
    const classification = classifyGridPoints(losResolution);
    setGridClassification(classification);
    return classification;
  };

  // Génère la liste des points sources (zone J1) et cibles (NML + zone J2) pour le calcul des LoS
  const getLoSPointSets = (classification) => {
    if (!classification) return { sourcePoints: [], targetPointsNML: [], targetPointsZ2: [] };
    
    // Points sources : zone J1 (zone1Only + zone1AndNoManLand)
    // Exclure les containers (toujours) et les décors (si option activée)
    const allZone1Points = [...classification.zone1Only, ...classification.zone1AndNoManLand];
    const sourcePoints = allZone1Points.filter(p => {
      if (p.inContainer) return false;
      if (excludeTerrainPoints && p.inTerrain) return false;
      return true;
    });
    
    // Points cibles No Man's Land : noManLandOnly + zone1AndNoManLand + zone2AndNoManLand
    // Exclure les containers
    const allNMLPoints = [
      ...classification.noManLandOnly, 
      ...classification.zone1AndNoManLand, 
      ...classification.zone2AndNoManLand
    ];
    const targetPointsNML = allNMLPoints.filter(p => !p.inContainer);
    
    // Points cibles Zone 2 : zone2Only + zone2AndNoManLand
    // Exclure les containers
    const allZone2Points = [...classification.zone2Only, ...classification.zone2AndNoManLand];
    const targetPointsZ2 = allZone2Points.filter(p => !p.inContainer);
    
    return { sourcePoints, targetPointsNML, targetPointsZ2 };
  };

  // Calcule le nombre de segments à calculer (en excluant les segments de longueur nulle)
  const countLoSSegments = (sourcePoints, targetPointsNML, targetPointsZ2) => {
    // Créer un Set des points sources pour vérifier les doublons rapidement
    const sourceSet = new Set(sourcePoints.map(p => `${p.x},${p.y}`));
    
    // Compter les segments vers NML (en excluant les points qui sont aussi sources)
    let segmentsToNML = 0;
    for (const target of targetPointsNML) {
      const key = `${target.x},${target.y}`;
      if (!sourceSet.has(key)) {
        segmentsToNML += sourcePoints.length;
      } else {
        // Ce point est aussi une source, donc on a (sourcePoints.length - 1) segments
        segmentsToNML += sourcePoints.length - 1;
      }
    }
    
    // Compter les segments vers Zone 2
    const segmentsToZ2 = sourcePoints.length * targetPointsZ2.length;
    
    return {
      segmentsToNML,
      segmentsToZ2,
      total: segmentsToNML + segmentsToZ2
    };
  };

  // Vérifie si une ligne de vue est bloquée par les décors
  // Utilise les mêmes règles que calculateLoS
  const isLoSBlocked = (source, target, terrainsToCheck) => {
    // Convertir en pixels pour la vérification (comme dans calculateLoS)
    const pA = { x: source.x * SCALE, y: source.y * SCALE };
    const pB = { x: target.x * SCALE, y: target.y * SCALE };
    
    for (const terrain of terrainsToCheck) {
      const buildingPolygon = getBuildingPolygon(terrain);
      
      if (terrain.type === 'forest') {
        // FORÊT : bloqué si la ligne traverse 2 segments ou plus de l'empreinte
        const corners = getRotatedCorners(terrain);
        const intersections = findAllIntersections(pA, pB, corners);
        
        if (intersections.length >= 2) {
          return true;
        }
      } else if (terrain.type === 'gruin' || terrain.type === 'pruin') {
        // RUINES : bloqué si traverse le building OU si traverse 2 segments d'empreinte
        if (buildingPolygon) {
          // Vérifier si traverse le building (polygone en L)
          const buildingIntersections = findAllIntersections(pA, pB, buildingPolygon);
          if (buildingIntersections.length > 0) {
            return true;
          } else {
            // Sinon vérifier si traverse 2 segments de l'empreinte
            const corners = getRotatedCorners(terrain);
            const intersections = findAllIntersections(pA, pB, corners);
            
            if (intersections.length >= 2) {
              return true;
            }
          }
        }
      } else if (terrain.type === 'container') {
        // CONTAINER : bloqué si traverse n'importe quel segment
        const corners = getRotatedCorners(terrain);
        const intersection = findFirstIntersection(pA, pB, corners);
        
        if (intersection) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Fonction de lissage pour éliminer les points isolés dans l'affichage des surfaces
  // Un point est considéré comme isolé si ses 8 voisins ont tous un état différent
  const smoothVisibilityMap = (visibilityMap, resolution) => {
    const smoothed = new Map(visibilityMap);
    const directions = [
      [-1, -1], [0, -1], [1, -1],  // haut-gauche, haut, haut-droite
      [-1, 0],          [1, 0],    // gauche, droite
      [-1, 1],  [0, 1],  [1, 1]    // bas-gauche, bas, bas-droite
    ];
    
    for (const [key, isVisible] of visibilityMap.entries()) {
      const [x, y] = key.split(',').map(Number);
      
      let neighborsWithDifferentState = 0;
      let totalNeighbors = 0;
      
      for (const [dx, dy] of directions) {
        const neighborKey = `${x + dx * resolution},${y + dy * resolution}`;
        if (visibilityMap.has(neighborKey)) {
          totalNeighbors++;
          if (visibilityMap.get(neighborKey) !== isVisible) {
            neighborsWithDifferentState++;
          }
        }
      }
      
      // Si le point a 8 voisins et tous sont en désaccord, on le corrige
      if (totalNeighbors === 8 && neighborsWithDifferentState === 8) {
        smoothed.set(key, !isVisible);
      }
    }
    
    return smoothed;
  };

  // Lance le calcul complet des lignes de vue
  const calculateAdvancedLoS = async () => {
    if (!gridClassification) {
      alert("Veuillez d'abord générer la classification de la grille");
      return;
    }
    
    // Purger les résultats précédents
    setAdvancedLoSResults(null);
    setShowVisiblePoints(false);
    setShowVisibleSurfaces(false);
    
    // Réinitialiser le flag d'annulation
    losCalculationCancelledRef.current = false;
    
    setAdvancedLoSCalculating(true);
    setAdvancedLoSProgress(0);
    
    // Récupérer les ensembles de points
    const { sourcePoints, targetPointsNML, targetPointsZ2 } = getLoSPointSets(gridClassification);
    
    if (sourcePoints.length === 0) {
      alert("Aucun point source valide dans la zone J1");
      setAdvancedLoSCalculating(false);
      return;
    }
    
    // Créer un Set des points sources pour éviter les segments de longueur nulle
    const sourceSet = new Set(sourcePoints.map(p => `${p.x},${p.y}`));
    
    // Préparer les résultats : pour chaque point cible, est-il visible depuis au moins un point source ?
    const visibilityNML = new Map(); // clé: "x,y" -> true/false
    const visibilityZ2 = new Map();
    
    // Initialiser tous les points cibles comme non visibles
    for (const target of targetPointsNML) {
      visibilityNML.set(`${target.x},${target.y}`, false);
    }
    for (const target of targetPointsZ2) {
      visibilityZ2.set(`${target.x},${target.y}`, false);
    }
    
    const totalTargets = targetPointsNML.length + targetPointsZ2.length;
    let processedTargets = 0;
    
    // Pour optimiser, on itère sur les cibles et on cherche si AU MOINS UN source peut les voir
    // Dès qu'on trouve un source qui voit la cible, on passe à la cible suivante
    
    // Calculer pour les cibles NML
    for (const target of targetPointsNML) {
      // Vérifier si le calcul a été annulé
      if (losCalculationCancelledRef.current) {
        setAdvancedLoSCalculating(false);
        setAdvancedLoSProgress(0);
        return;
      }
      
      const targetKey = `${target.x},${target.y}`;
      
      for (const source of sourcePoints) {
        // Éviter les segments de longueur nulle
        if (source.x === target.x && source.y === target.y) continue;
        
        if (!isLoSBlocked(source, target, terrains)) {
          visibilityNML.set(targetKey, true);
          break; // Pas besoin de vérifier les autres sources
        }
      }
      
      processedTargets++;
      if (processedTargets % 100 === 0) {
        setAdvancedLoSProgress(Math.round((processedTargets / totalTargets) * 100));
        // Permettre à l'UI de se mettre à jour
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Calculer pour les cibles Zone 2
    for (const target of targetPointsZ2) {
      // Vérifier si le calcul a été annulé
      if (losCalculationCancelledRef.current) {
        setAdvancedLoSCalculating(false);
        setAdvancedLoSProgress(0);
        return;
      }
      
      const targetKey = `${target.x},${target.y}`;
      
      for (const source of sourcePoints) {
        if (!isLoSBlocked(source, target, terrains)) {
          visibilityZ2.set(targetKey, true);
          break;
        }
      }
      
      processedTargets++;
      if (processedTargets % 100 === 0) {
        setAdvancedLoSProgress(Math.round((processedTargets / totalTargets) * 100));
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Vérifier une dernière fois si le calcul a été annulé avant de sauvegarder
    if (losCalculationCancelledRef.current) {
      setAdvancedLoSCalculating(false);
      setAdvancedLoSProgress(0);
      return;
    }
    
    // Compter les résultats
    const visibleNML = [...visibilityNML.values()].filter(v => v).length;
    const visibleZ2 = [...visibilityZ2.values()].filter(v => v).length;
    
    const results = {
      visibilityNML,
      visibilityZ2,
      statsNML: {
        total: targetPointsNML.length,
        visible: visibleNML,
        percent: targetPointsNML.length > 0 ? Math.round((visibleNML / targetPointsNML.length) * 100) : 0
      },
      statsZ2: {
        total: targetPointsZ2.length,
        visible: visibleZ2,
        percent: targetPointsZ2.length > 0 ? Math.round((visibleZ2 / targetPointsZ2.length) * 100) : 0
      }
    };
    
    setAdvancedLoSResults(results);
    
    // Sauvegarder les résultats dans le LocalStorage
    saveLoSResults(selectedLayout, deploymentZone, results);
    
    setAdvancedLoSProgress(100);
    setAdvancedLoSCalculating(false);
  };

  const getBuildingPolygon = (terrain) => {
    const terrainType = TERRAIN_TYPES[terrain.type];
    if (!terrainType.buildingPolygon) return null;
    
    const cx = terrain.x + terrainType.width / 2;
    const cy = terrain.y + terrainType.height / 2;
    const angle = (terrain.rotation * Math.PI) / 180;
    
    return terrainType.buildingPolygon.map(point => {
      const px = terrain.x + (point.x * SCALE);
      const py = terrain.y + (point.y * SCALE);
      const dx = px - cx;
      const dy = py - cy;
      
      return {
        x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: cy + dx * Math.sin(angle) + dy * Math.cos(angle)
      };
    });
  };

  const saveCurrentLayout = () => {
    const debugInfo = {
      step1: `📊 Début sauvegarde\nTerrains: ${terrains ? terrains.length : 0} décors\nLayouts: ${Object.keys(customLayouts).length}/10`,
      success: false
    };
    
    if (!terrains || terrains.length === 0) {
      debugInfo.error = "❌ Aucun layout à sauvegarder";
      setSaveDebugInfo(debugInfo);
      return;
    }
    
    if (!layoutNameInput.trim() || layoutNameInput.length > 24) {
      debugInfo.error = "❌ Le nom doit contenir entre 1 et 24 caractères";
      setSaveDebugInfo(debugInfo);
      return;
    }
    
    if (Object.keys(customLayouts).length >= MAX_LAYOUTS && !customLayouts[layoutNameInput]) {
      debugInfo.error = `❌ Maximum ${MAX_LAYOUTS} layouts personnalisés atteints`;
      setSaveDebugInfo(debugInfo);
      return;
    }
    
    try {
      const terrainsCopy = JSON.parse(JSON.stringify(terrains));
      const newCustomLayouts = { ...customLayouts, [layoutNameInput]: terrainsCopy };
      
      setCustomLayouts(newCustomLayouts);
      setSelectedLayout(layoutNameInput);
      
      debugInfo.step4 = `✅ Layout "${layoutNameInput}" sauvegardé ! (${terrainsCopy.length} décors)`;
      debugInfo.success = true;
      setSaveDebugInfo(debugInfo);
      
      setShowSaveDialog(false);
      setLayoutNameInput("");
    } catch (error) {
      debugInfo.error = `❌ ERREUR: ${error.message}`;
      setSaveDebugInfo(debugInfo);
    }
  };
  
  const renameLayout = () => {
    if (!customLayouts[selectedLayout]) {
      alert("Layout introuvable");
      return;
    }
    
    if (!layoutNameInput.trim() || layoutNameInput.length > 24) {
      alert("Le nom doit contenir entre 1 et 24 caractères");
      return;
    }
    
    if (customLayouts[layoutNameInput]) {
      alert("Ce nom existe déjà");
      return;
    }
    
    const newCustomLayouts = { ...customLayouts };
    newCustomLayouts[layoutNameInput] = JSON.parse(JSON.stringify(newCustomLayouts[selectedLayout]));
    delete newCustomLayouts[selectedLayout];
    
    setCustomLayouts(newCustomLayouts);
    setSelectedLayout(layoutNameInput);
    setShowRenameDialog(false);
    setLayoutNameInput("");
  };
  
  const deleteLayout = (layoutName) => {
    if (!customLayouts[layoutName]) return;
    
    if (window.confirm(`Supprimer le layout "${layoutName}" ?`)) {
      const newCustomLayouts = { ...customLayouts };
      delete newCustomLayouts[layoutName];
      setCustomLayouts(newCustomLayouts);
      
      if (selectedLayout === layoutName) {
        setSelectedLayout("Layout par défaut");
        setTerrains(JSON.parse(JSON.stringify(WTC_LAYOUTS["Layout par défaut"])));
        setPointA(null);
        setPointB(null);
        setLosResult(null);
        setSelectedTerrain(null);
      }
    }
  };

  // Export des layouts en JSON
  const exportLayoutsToJSON = () => {
    const layoutCount = Object.keys(customLayouts).length;
    if (layoutCount === 0) {
      alert('Aucun layout personnalisé à exporter');
      return;
    }
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      layoutCount: layoutCount,
      layouts: customLayouts
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Ouvrir dans un nouvel onglet avec instructions
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Export Layouts - W40K</title>
            <style>
              body { font-family: Arial, sans-serif; background: #1f2937; color: white; padding: 20px; }
              .info { background: #065f46; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              pre { background: #374151; padding: 15px; border-radius: 8px; overflow: auto; max-height: 400px; font-size: 12px; }
              button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px; margin-right: 10px; }
              button:hover { background: #2563eb; }
            </style>
          </head>
          <body>
            <h1>📤 Export des layouts</h1>
            <div class="info">
              <p><strong>${layoutCount} layout(s)</strong> exporté(s) le ${new Date().toLocaleDateString('fr-FR')}</p>
              <p>💡 Cliquez sur le bouton ci-dessous pour télécharger le fichier, ou copiez le contenu.</p>
            </div>
            <button onclick="downloadFile()">💾 Télécharger le fichier JSON</button>
            <h3>Contenu :</h3>
            <pre>${jsonString.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
            <script>
              function downloadFile() {
                const a = document.createElement('a');
                a.href = '${url}';
                a.download = 'w40k_layouts_${new Date().toISOString().slice(0,10)}.json';
                a.click();
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  // Import des layouts depuis JSON
  const importLayoutsFromJSON = (event) => {
    setImportError('');
    setImportSuccess('');
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const data = JSON.parse(content);
        
        // Validation du format
        if (!data.layouts || typeof data.layouts !== 'object') {
          setImportError('Format de fichier invalide : propriété "layouts" manquante');
          return;
        }
        
        const importedLayouts = data.layouts;
        const importedCount = Object.keys(importedLayouts).length;
        
        if (importedCount === 0) {
          setImportError('Le fichier ne contient aucun layout');
          return;
        }
        
        // Validation des layouts
        for (const [name, terrains] of Object.entries(importedLayouts)) {
          if (!Array.isArray(terrains)) {
            setImportError(`Layout "${name}" invalide : doit être un tableau de décors`);
            return;
          }
          for (const terrain of terrains) {
            if (!terrain.type || !TERRAIN_TYPES[terrain.type]) {
              setImportError(`Layout "${name}" contient un décor avec un type invalide`);
              return;
            }
          }
        }
        
        let newCustomLayouts;
        let resultMessage;
        
        if (importMode === 'replace') {
          // Remplacer tous les layouts existants
          newCustomLayouts = { ...importedLayouts };
          resultMessage = `✅ ${importedCount} layout(s) importé(s) (layouts précédents remplacés)`;
        } else {
          // Fusionner avec les layouts existants
          const currentCount = Object.keys(customLayouts).length;
          newCustomLayouts = { ...customLayouts };
          
          let added = 0;
          let skipped = 0;
          
          for (const [name, terrains] of Object.entries(importedLayouts)) {
            if (Object.keys(newCustomLayouts).length >= MAX_LAYOUTS) {
              skipped += Object.keys(importedLayouts).length - added - skipped;
              break;
            }
            
            let finalName = name;
            // Si le nom existe déjà, ajouter un suffixe
            if (newCustomLayouts[name]) {
              let suffix = 2;
              while (newCustomLayouts[`${name} (${suffix})`]) {
                suffix++;
              }
              finalName = `${name} (${suffix})`;
            }
            
            newCustomLayouts[finalName] = terrains;
            added++;
          }
          
          resultMessage = `✅ ${added} layout(s) ajouté(s)`;
          if (skipped > 0) {
            resultMessage += ` (${skipped} ignoré(s) - limite de ${MAX_LAYOUTS} atteinte)`;
          }
        }
        
        setCustomLayouts(newCustomLayouts);
        setImportSuccess(resultMessage);
        
        // Reset le file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
      } catch (error) {
        setImportError(`Erreur de lecture : ${error.message}`);
      }
    };
    
    reader.onerror = () => {
      setImportError('Erreur lors de la lecture du fichier');
    };
    
    reader.readAsText(file);
  };

  const isTerrainInBounds = (terrain) => {
    const corners = getRotatedCorners(terrain);
    
    for (const corner of corners) {
      const xInches = corner.x / SCALE;
      const yInches = corner.y / SCALE;
      
      if (xInches < 0 || xInches > 60 || yInches < 0 || yInches > 44) {
        return false;
      }
    }
    
    return true;
  };

  const rotateTerrain = (terrainId, delta) => {
    setTerrains(prevTerrains => {
      return prevTerrains.map(t => {
        if (t.id === terrainId) {
          return { ...t, rotation: (t.rotation + delta + 360) % 360 };
        } else if (t.id === prevTerrains.find(ter => ter.id === terrainId)?.symmetricId) {
          // Le symétrique tourne du même delta mais garde son décalage de 180°
          return { ...t, rotation: (t.rotation + delta + 360) % 360 };
        }
        return t;
      });
    });
    // Invalider les résultats LoS pour ce layout
    invalidateLoSResultsForLayout(selectedLayout);
  };

  const translateTerrain = (terrainId, dx, dy) => {
    setTerrains(prevTerrains => {
      return prevTerrains.map(t => {
        if (t.id === terrainId) {
          return { ...t, x: t.x + dx, y: t.y + dy };
        } else if (t.id === prevTerrains.find(ter => ter.id === terrainId)?.symmetricId) {
          return { ...t, x: t.x - dx, y: t.y - dy };
        }
        return t;
      });
    });
    // Invalider les résultats LoS pour ce layout
    invalidateLoSResultsForLayout(selectedLayout);
  };

  const snapTerrainToGrid = (terrain) => {
    const corners = getRotatedCorners(terrain);
    
    let minDistance = Infinity;
    let bestOffset = { x: 0, y: 0 };
    
    for (const corner of corners) {
      const snapX = Math.round(corner.x / SCALE) * SCALE;
      const snapY = Math.round(corner.y / SCALE) * SCALE;
      
      const dx = snapX - corner.x;
      const dy = snapY - corner.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        bestOffset = { x: dx, y: dy };
      }
    }
    
    return {
      ...terrain,
      x: terrain.x + bestOffset.x,
      y: terrain.y + bestOffset.y
    };
  };

  const optimizeAllTerrains = () => {
    if (!terrains || terrains.length === 0) return;
    
    setOptimizing(true);
    
    setTimeout(() => {
      let currentTerrains = [...terrains];
      let maxIterations = 3;
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        currentTerrains = currentTerrains.map(terrain => {
          let optimized = { ...terrain };
          
          let corners = getRotatedCorners(optimized);
          let alphaIndex = -1;
          let alphaCorner = null;
          
          for (let i = 0; i < corners.length; i++) {
            const corner = corners[i];
            const xIsInt = Math.abs((corner.x / SCALE) - Math.round(corner.x / SCALE)) < 0.05;
            const yIsInt = Math.abs((corner.y / SCALE) - Math.round(corner.y / SCALE)) < 0.05;
            
            if (xIsInt && yIsInt) {
              alphaIndex = i;
              alphaCorner = { x: corner.x, y: corner.y };
              break;
            }
          }
          
          if (alphaIndex === -1) {
            optimized = snapTerrainToGrid(optimized);
            corners = getRotatedCorners(optimized);
            
            for (let i = 0; i < corners.length; i++) {
              const corner = corners[i];
              const xIsInt = Math.abs((corner.x / SCALE) - Math.round(corner.x / SCALE)) < 0.05;
              const yIsInt = Math.abs((corner.y / SCALE) - Math.round(corner.y / SCALE)) < 0.05;
              
              if (xIsInt && yIsInt) {
                alphaIndex = i;
                alphaCorner = { x: corner.x, y: corner.y };
                break;
              }
            }
          }
          
          if (alphaIndex !== -1 && alphaCorner) {
            corners = getRotatedCorners(optimized);
            
            let hasIntegerCoord = false;
            for (let i = 0; i < corners.length; i++) {
              if (i === alphaIndex) continue;
              
              const corner = corners[i];
              const xIsInt = Math.abs((corner.x / SCALE) - Math.round(corner.x / SCALE)) < 0.05;
              const yIsInt = Math.abs((corner.y / SCALE) - Math.round(corner.y / SCALE)) < 0.05;
              
              if (xIsInt || yIsInt) {
                hasIntegerCoord = true;
                break;
              }
            }
            
            if (!hasIntegerCoord) {
              let bestSolution = null;
              let bestAngleMagnitude = Infinity;
              
              for (let i = 0; i < corners.length; i++) {
                if (i === alphaIndex) continue;
                
                const corner = corners[i];
                
                const targetX = Math.round(corner.x / SCALE) * SCALE;
                const angleForX = calculateRotationToAlign(alphaCorner, corner, targetX, null);
                
                if (angleForX !== null && Math.abs(angleForX) < 10) {
                  if (Math.abs(angleForX) < bestAngleMagnitude) {
                    bestAngleMagnitude = Math.abs(angleForX);
                    bestSolution = { angle: angleForX, cornerIndex: i, axis: 'X' };
                  }
                }
                
                const targetY = Math.round(corner.y / SCALE) * SCALE;
                const angleForY = calculateRotationToAlign(alphaCorner, corner, null, targetY);
                
                if (angleForY !== null && Math.abs(angleForY) < 10) {
                  if (Math.abs(angleForY) < bestAngleMagnitude) {
                    bestAngleMagnitude = Math.abs(angleForY);
                    bestSolution = { angle: angleForY, cornerIndex: i, axis: 'Y' };
                  }
                }
              }
              
              if (bestSolution) {
                const oldAlphaX = alphaCorner.x;
                const oldAlphaY = alphaCorner.y;
                
                optimized.rotation = (optimized.rotation + bestSolution.angle) % 360;
                
                const newCorners = getRotatedCorners(optimized);
                const newAlpha = newCorners[alphaIndex];
                
                optimized.x += (oldAlphaX - newAlpha.x);
                optimized.y += (oldAlphaY - newAlpha.y);
              }
            }
          }
          
          return optimized;
        });
      }
      
      // Étape supplémentaire : correction de la symétrie
      // Les décors sans apostrophe (ex: "GRuine 1") priment sur ceux avec apostrophe (ex: "GRuine 1'")
      currentTerrains = currentTerrains.map(terrain => {
        // Vérifier si c'est un décor symétrique (avec apostrophe)
        if (terrain.name && terrain.name.includes("'") && terrain.symmetricId) {
          // Trouver le décor principal (sans apostrophe)
          const mainTerrain = currentTerrains.find(t => t.id === terrain.symmetricId);
          
          if (mainTerrain) {
            const terrainType = TERRAIN_TYPES[terrain.type];
            
            // Calculer la position symétrique par rapport au centre de la table
            // Centre de la table : (300, 220) en pixels
            const centerX = TABLE_WIDTH / 2;
            const centerY = TABLE_HEIGHT / 2;
            
            // Position du centre du décor principal
            const mainCenterX = mainTerrain.x + terrainType.width / 2;
            const mainCenterY = mainTerrain.y + terrainType.height / 2;
            
            // Position symétrique du centre
            const symCenterX = 2 * centerX - mainCenterX;
            const symCenterY = 2 * centerY - mainCenterY;
            
            // Position du coin supérieur gauche du décor symétrique
            const symX = symCenterX - terrainType.width / 2;
            const symY = symCenterY - terrainType.height / 2;
            
            // Rotation symétrique (180° de différence)
            const symRotation = (mainTerrain.rotation + 180) % 360;
            
            // Vérifier si le décor est déjà bien positionné (tolérance de 0.1 pixel)
            const needsCorrection = 
              Math.abs(terrain.x - symX) > 0.1 || 
              Math.abs(terrain.y - symY) > 0.1 || 
              Math.abs(terrain.rotation - symRotation) > 0.1;
            
            if (needsCorrection) {
              return {
                ...terrain,
                x: symX,
                y: symY,
                rotation: symRotation
              };
            }
          }
        }
        
        return terrain;
      });
      
      setTerrains(currentTerrains);
      setOptimizing(false);
      // Invalider les résultats LoS pour ce layout
      invalidateLoSResultsForLayout(selectedLayout);
    }, 150);
  };
  
  const calculateRotationToAlign = (pivot, point, targetX, targetY) => {
    const dx = point.x - pivot.x;
    const dy = point.y - pivot.y;
    const radius = Math.sqrt(dx * dx + dy * dy);
    
    if (radius < 0.1) return null;
    
    const currentAngle = Math.atan2(dy, dx);
    
    let targetAngle;
    
    if (targetX !== null) {
      const dx_target = targetX - pivot.x;
      const cosTheta = dx_target / radius;
      
      if (Math.abs(cosTheta) > 1) return null;
      
      const angle1 = Math.acos(cosTheta);
      const angle2 = -Math.acos(cosTheta);
      
      const diff1 = angle1 - currentAngle;
      const diff2 = angle2 - currentAngle;
      
      targetAngle = Math.abs(diff1) < Math.abs(diff2) ? angle1 : angle2;
    } else if (targetY !== null) {
      const dy_target = targetY - pivot.y;
      const sinTheta = dy_target / radius;
      
      if (Math.abs(sinTheta) > 1) return null;
      
      const angle1 = Math.asin(sinTheta);
      const angle2 = Math.PI - Math.asin(sinTheta);
      
      const diff1 = angle1 - currentAngle;
      const diff2 = angle2 - currentAngle;
      
      targetAngle = Math.abs(diff1) < Math.abs(diff2) ? angle1 : angle2;
    } else {
      return null;
    }
    
    let angleDiff = targetAngle - currentAngle;
    
    while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
    while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
    
    return angleDiff * 180 / Math.PI;
  };

  const snapTerrainToGridAfterRotation = (terrain) => {
    const corners = getRotatedCorners(terrain);
    
    const threshold = 0.5;
    for (const corner of corners) {
      const snapX = Math.round(corner.x / SCALE) * SCALE;
      const snapY = Math.round(corner.y / SCALE) * SCALE;
      const distX = Math.abs(corner.x - snapX);
      const distY = Math.abs(corner.y - snapY);
      
      if (distX < threshold && distY < threshold) {
        return terrain;
      }
    }
    
    let minDistance = Infinity;
    const candidateOffsets = [];
    
    for (const corner of corners) {
      const snapX = Math.round(corner.x / SCALE) * SCALE;
      const snapY = Math.round(corner.y / SCALE) * SCALE;
      
      const dx = snapX - corner.x;
      const dy = snapY - corner.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < minDistance) {
        minDistance = distance;
        candidateOffsets.length = 0;
        candidateOffsets.push({ x: dx, y: dy });
      } else if (Math.abs(distance - minDistance) < 0.1) {
        candidateOffsets.push({ x: dx, y: dy });
      }
    }
    
    const bestOffset = candidateOffsets[Math.floor(Math.random() * candidateOffsets.length)];
    
    return {
      ...terrain,
      x: terrain.x + bestOffset.x,
      y: terrain.y + bestOffset.y
    };
  };

  const generateRandomLayout = () => {
    setGenerating(true);
    
    setTimeout(() => {
      let bestTerrains = [];
      let maxAttempts = 10; // Nombre maximum de tentatives de génération complète
      
      // Utiliser la configuration définie par l'utilisateur
      const terrainConfig = [];
      if (configGruin > 0) terrainConfig.push({ type: 'gruin', count: configGruin / 2 });
      if (configPruin > 0) terrainConfig.push({ type: 'pruin', count: configPruin / 2 });
      if (configForest > 0) terrainConfig.push({ type: 'forest', count: configForest / 2 });
      if (configContainer > 0) terrainConfig.push({ type: 'container', count: configContainer / 2 });
      
      const expectedTotal = configGruin + configPruin + configForest + configContainer;
      
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const newTerrains = [];
        
        let currentId = 1;
        let allPlaced = true;
        let typeCounter = { gruin: 0, pruin: 0, forest: 0, container: 0 };
        
        for (const config of terrainConfig) {
          for (let i = 0; i < config.count; i++) {
            let placed = false;
            let localAttempts = 0;
            
            while (!placed && localAttempts < 200) {
              const terrainType = TERRAIN_TYPES[config.type];
              const margin = 20;
              
              // Calculer les limites pour s'assurer que le décor reste dans la table
              const maxX = CENTER_X - terrainType.width - margin;
              const maxY = TABLE_HEIGHT - terrainType.height - margin;
              
              const x = margin + Math.random() * maxX;
              const y = margin + Math.random() * maxY;
              
              const rotations = [0, 0, 0, 15, 30, 45, 90, -15, -30, -45];
              const rotation = rotations[Math.floor(Math.random() * rotations.length)];
              
              typeCounter[config.type]++;
              const terrainNumber = typeCounter[config.type];
              
              let terrain1 = {
                id: currentId,
                x: Math.round(x),
                y: Math.round(y),
                type: config.type,
                rotation,
                name: `${TERRAIN_TYPES[config.type].label} ${terrainNumber}`,
                symmetricId: currentId + 1
              };
              
              terrain1 = snapTerrainToGrid(terrain1);
              
              const center1X = terrain1.x + terrainType.width / 2;
              const center1Y = terrain1.y + terrainType.height / 2;
              const symX = 2 * CENTER_X - center1X;
              const symY = 2 * CENTER_Y - center1Y;
              
              let terrain2 = {
                id: currentId + 1,
                x: symX - terrainType.width / 2,
                y: symY - terrainType.height / 2,
                type: config.type,
                rotation: (rotation + 180) % 360,
                name: `${TERRAIN_TYPES[config.type].label} ${terrainNumber}'`,
                symmetricId: currentId
              };
              
              terrain2 = snapTerrainToGrid(terrain2);
              
              // Vérifier que les deux décors sont dans les limites de la table
              const terrain1InBounds = isTerrainInBounds(terrain1);
              const terrain2InBounds = isTerrainInBounds(terrain2);
              
              if (!terrain1InBounds || !terrain2InBounds) {
                typeCounter[config.type]--;
                localAttempts++;
                continue;
              }
              
              const testTerrains = [...newTerrains, terrain1, terrain2];
              let hasCollision = false;
              
              for (let j = 0; j < testTerrains.length - 2; j++) {
                if (checkOverlap(terrain1, testTerrains[j]) || 
                    checkOverlap(terrain2, testTerrains[j])) {
                  hasCollision = true;
                  break;
                }
              }
              
              const validGrid = checkGridConstraints(terrain1) && checkGridConstraints(terrain2);
              
              if (!hasCollision && validGrid) {
                newTerrains.push(terrain1, terrain2);
                currentId += 2;
                placed = true;
              } else {
                typeCounter[config.type]--;
              }
              
              localAttempts++;
            }
            
            if (!placed) {
              allPlaced = false;
              break;
            }
          }
          
          if (!allPlaced) break;
        }
        
        // Si tous les décors sont placés et dans les limites, on a trouvé un bon layout
        if (allPlaced && newTerrains.length === expectedTotal) {
          const allInBounds = newTerrains.every(t => isTerrainInBounds(t));
          if (allInBounds) {
            bestTerrains = newTerrains;
            break;
          }
        }
        
        // Garder le meilleur résultat partiel
        if (newTerrains.length > bestTerrains.length) {
          bestTerrains = newTerrains;
        }
      }
      
      if (bestTerrains.length === expectedTotal) {
        setTerrains(bestTerrains);
        setSelectedLayout("Layout Aléatoire");
        // Invalider les résultats LoS pour le layout aléatoire
        invalidateLoSResultsForLayout("Layout Aléatoire");
      } else {
        alert(`Génération incomplète (${bestTerrains.length}/${expectedTotal} décors). Réessayez.`);
      }
      
      setGenerating(false);
      setPointA(null);
      setPointB(null);
      setLosResult(null);
      setSelectedTerrain(null);
    }, 100);
  };

  const getRotatedCorners = (terrain) => {
    const terrainType = TERRAIN_TYPES[terrain.type];
    const cx = terrain.x + terrainType.width / 2;
    const cy = terrain.y + terrainType.height / 2;
    const angle = (terrain.rotation * Math.PI) / 180;
    
    const corners = [
      { x: terrain.x, y: terrain.y },
      { x: terrain.x + terrainType.width, y: terrain.y },
      { x: terrain.x + terrainType.width, y: terrain.y + terrainType.height },
      { x: terrain.x, y: terrain.y + terrainType.height }
    ];
    
    return corners.map(corner => {
      const dx = corner.x - cx;
      const dy = corner.y - cy;
      return {
        x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: cy + dx * Math.sin(angle) + dy * Math.cos(angle)
      };
    });
  };

  const checkOverlap = (terrain1, terrain2) => {
    if (terrain1.id === terrain2.id) return false;
    
    const corners1 = getRotatedCorners(terrain1);
    const corners2 = getRotatedCorners(terrain2);
    
    const axes = [];
    
    for (let i = 0; i < corners1.length; i++) {
      const p1 = corners1[i];
      const p2 = corners1[(i + 1) % corners1.length];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      axes.push({ x: -edge.y, y: edge.x });
    }
    
    for (let i = 0; i < corners2.length; i++) {
      const p1 = corners2[i];
      const p2 = corners2[(i + 1) % corners2.length];
      const edge = { x: p2.x - p1.x, y: p2.y - p1.y };
      axes.push({ x: -edge.y, y: edge.x });
    }
    
    for (const axis of axes) {
      const proj1 = projectPolygon(corners1, axis);
      const proj2 = projectPolygon(corners2, axis);
      
      // Utiliser <= au lieu de < pour permettre aux décors de se toucher sans se chevaucher
      if (proj1.max <= proj2.min || proj2.max <= proj1.min) {
        return false;
      }
    }
    
    return true;
  };

  const projectPolygon = (corners, axis) => {
    let min = corners[0].x * axis.x + corners[0].y * axis.y;
    let max = min;
    
    for (let i = 1; i < corners.length; i++) {
      const proj = corners[i].x * axis.x + corners[i].y * axis.y;
      if (proj < min) min = proj;
      if (proj > max) max = proj;
    }
    
    return { min, max };
  };

  const checkGridConstraints = (terrain) => {
    const corners = getRotatedCorners(terrain);
    let vertexOnGrid = 0;
    let coordOnGrid = 0;
    
    for (const corner of corners) {
      const xIsInt = Math.abs(corner.x - Math.round(corner.x)) < 1;
      const yIsInt = Math.abs(corner.y - Math.round(corner.y)) < 1;
      
      if (xIsInt && yIsInt) vertexOnGrid++;
      else if (xIsInt || yIsInt) coordOnGrid++;
    }
    
    return vertexOnGrid >= 1 && (vertexOnGrid + coordOnGrid) >= 2;
  };

  // Constante pour le seuil d'aimantation (en pixels)
  const SNAP_THRESHOLD = 2 * SCALE; // 2 pouces en pixels
  const ROTATION_SNAP_THRESHOLD = 10; // 10 degrés max pour l'aimantation en rotation

  // Calcule la position aimantée d'un terrain (entrée et sortie en pouces)
  // Retourne { x, y, rotation } où rotation est la nouvelle rotation si aimantation angulaire
  const calculateSnappedPosition = (movingTerrain, newX, newY) => {
    // Convertir en pixels pour les calculs
    const newXpx = newX * SCALE;
    const newYpx = newY * SCALE;
    
    const movingCorners = getRotatedCorners({ ...movingTerrain, x: newXpx, y: newYpx });
    let bestSnap = null;
    let bestDistance = SNAP_THRESHOLD;
    let bestRotationDelta = null;
    const guides = [];

    for (const otherTerrain of terrains) {
      if (otherTerrain.id === movingTerrain.id) continue;

      const otherCorners = getRotatedCorners(otherTerrain);

      // Vérifier l'aimantation bord à bord
      for (let i = 0; i < movingCorners.length; i++) {
        const m1 = movingCorners[i];
        const m2 = movingCorners[(i + 1) % movingCorners.length];
        const movingEdge = { x: m2.x - m1.x, y: m2.y - m1.y };
        const movingLen = Math.sqrt(movingEdge.x ** 2 + movingEdge.y ** 2);
        if (movingLen === 0) continue;
        const movingNorm = { x: movingEdge.x / movingLen, y: movingEdge.y / movingLen };
        
        // Angle du bord du décor en mouvement
        const movingAngle = Math.atan2(movingEdge.y, movingEdge.x) * 180 / Math.PI;

        for (let j = 0; j < otherCorners.length; j++) {
          const o1 = otherCorners[j];
          const o2 = otherCorners[(j + 1) % otherCorners.length];
          const otherEdge = { x: o2.x - o1.x, y: o2.y - o1.y };
          const otherLen = Math.sqrt(otherEdge.x ** 2 + otherEdge.y ** 2);
          if (otherLen === 0) continue;
          const otherNorm = { x: otherEdge.x / otherLen, y: otherEdge.y / otherLen };
          
          // Angle du bord de l'autre décor
          const otherAngle = Math.atan2(otherEdge.y, otherEdge.x) * 180 / Math.PI;

          // Vérifier si les bords sont presque parallèles (produit scalaire proche de ±1)
          const dot = movingNorm.x * otherNorm.x + movingNorm.y * otherNorm.y;
          const absDot = Math.abs(dot);
          
          // Calculer l'angle entre les deux bords
          let angleDiff = Math.abs(movingAngle - otherAngle);
          if (angleDiff > 180) angleDiff = 360 - angleDiff;
          // Les bords peuvent être parallèles dans le même sens ou opposés
          if (angleDiff > 90) angleDiff = 180 - angleDiff;
          
          // Seuil plus permissif pour détecter les bords "presque parallèles"
          const isAlmostParallel = absDot > Math.cos(ROTATION_SNAP_THRESHOLD * Math.PI / 180);
          
          if (isAlmostParallel) {
            // Bords presque parallèles - calculer la distance perpendiculaire
            const perpendicular = { x: -otherNorm.y, y: otherNorm.x };
            const distToLine = (m1.x - o1.x) * perpendicular.x + (m1.y - o1.y) * perpendicular.y;

            if (Math.abs(distToLine) < bestDistance) {
              // Vérifier que les bords se chevauchent (projection)
              const proj1Start = (m1.x - o1.x) * otherNorm.x + (m1.y - o1.y) * otherNorm.y;
              const proj1End = (m2.x - o1.x) * otherNorm.x + (m2.y - o1.y) * otherNorm.y;
              const proj2Start = 0;
              const proj2End = otherLen;

              const overlapStart = Math.max(Math.min(proj1Start, proj1End), proj2Start);
              const overlapEnd = Math.min(Math.max(proj1Start, proj1End), proj2End);

              if (overlapEnd > overlapStart - SNAP_THRESHOLD) {
                // Il y a un chevauchement (ou presque) - aimanter
                bestDistance = Math.abs(distToLine);
                bestSnap = {
                  dx: -distToLine * perpendicular.x,
                  dy: -distToLine * perpendicular.y
                };
                
                // Calculer la rotation nécessaire pour aligner les bords
                if (angleDiff > 0.5 && angleDiff <= ROTATION_SNAP_THRESHOLD) {
                  // Calculer la rotation à appliquer
                  // On veut que le bord du décor en mouvement devienne parallèle au bord cible
                  let rotationDelta;
                  if (dot > 0) {
                    // Bords dans le même sens
                    rotationDelta = otherAngle - movingAngle;
                  } else {
                    // Bords en sens opposés
                    rotationDelta = otherAngle - movingAngle + 180;
                  }
                  // Normaliser entre -180 et 180
                  while (rotationDelta > 180) rotationDelta -= 360;
                  while (rotationDelta < -180) rotationDelta += 360;
                  
                  if (Math.abs(rotationDelta) <= ROTATION_SNAP_THRESHOLD) {
                    bestRotationDelta = rotationDelta;
                  }
                } else {
                  bestRotationDelta = null;
                }
                
                // Ajouter un guide visuel
                guides.push({
                  type: 'edge',
                  x1: o1.x,
                  y1: o1.y,
                  x2: o2.x,
                  y2: o2.y
                });
              }
            }
          }
        }
      }

      // Vérifier l'aimantation coin à coin
      for (const mc of movingCorners) {
        for (const oc of otherCorners) {
          const dist = Math.sqrt((mc.x - oc.x) ** 2 + (mc.y - oc.y) ** 2);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestSnap = {
              dx: oc.x - mc.x,
              dy: oc.y - mc.y
            };
            bestRotationDelta = null; // Pas de rotation pour l'aimantation coin à coin
            guides.push({
              type: 'corner',
              x: oc.x,
              y: oc.y
            });
          }
        }
      }
    }

    snapGuidesRef.current = guides;

    if (bestSnap) {
      // Convertir le snap de pixels en pouces
      const result = { 
        x: newX + bestSnap.dx / SCALE, 
        y: newY + bestSnap.dy / SCALE 
      };
      if (bestRotationDelta !== null) {
        result.rotation = movingTerrain.rotation + bestRotationDelta;
        // Normaliser la rotation entre 0 et 360
        while (result.rotation < 0) result.rotation += 360;
        while (result.rotation >= 360) result.rotation -= 360;
      }
      return result;
    }
    return { x: newX, y: newY };
  };

  // Gestionnaires d'événements pour le glisser-déposer
  const handleDragStart = (e, terrain) => {
    if (!editMode || editMethod !== 'drag') return;
    
    e.stopPropagation();
    e.preventDefault();
    setSelectedTerrain(terrain.id);
    setIsDragging(true);
    setDragOriginalRotation(terrain.rotation); // Sauvegarder la rotation d'origine
    
    const rect = e.currentTarget.closest('.relative').getBoundingClientRect();
    
    // Support tactile et souris
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Prendre en compte le scale et le zoom pour convertir les coordonnées
    const mouseX = (clientX - rect.left) / (SCALE * tableScale * userZoom);
    const mouseY = (clientY - rect.top) / (SCALE * tableScale * userZoom);
    
    setDragOffset({
      x: mouseX - terrain.x / SCALE,
      y: mouseY - terrain.y / SCALE
    });
  };

  const handleDragMove = (e) => {
    if (!isDragging || !selectedTerrain) return;
    
    e.preventDefault();
    
    const terrain = terrains.find(t => t.id === selectedTerrain);
    if (!terrain) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Support tactile et souris
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Prendre en compte le scale et le zoom pour convertir les coordonnées
    const mouseX = (clientX - rect.left) / (SCALE * tableScale * userZoom);
    const mouseY = (clientY - rect.top) / (SCALE * tableScale * userZoom);
    
    let newX = mouseX - dragOffset.x;
    let newY = mouseY - dragOffset.y;
    
    // Arrondir à 0.5 pouce pour rester sur la grille
    newX = Math.round(newX * 2) / 2;
    newY = Math.round(newY * 2) / 2;
    
    // Utiliser la rotation d'origine pour le calcul d'aimantation
    const terrainWithOriginalRotation = { ...terrain, rotation: dragOriginalRotation };
    
    // Appliquer l'aimantation (position et éventuellement rotation)
    const snapped = calculateSnappedPosition(terrainWithOriginalRotation, newX, newY);
    
    // Limiter aux bords de la table
    const terrainType = TERRAIN_TYPES[terrain.type];
    const maxX = 60 - terrainType.width / SCALE;
    const maxY = 44 - terrainType.height / SCALE;
    snapped.x = Math.max(0, Math.min(maxX, snapped.x));
    snapped.y = Math.max(0, Math.min(maxY, snapped.y));
    
    // Mettre à jour la position (et rotation si aimantée) du terrain
    setTerrains(prev => prev.map(t => {
      if (t.id === selectedTerrain) {
        const updated = { ...t, x: snapped.x * SCALE, y: snapped.y * SCALE };
        // Si aimantation en rotation, appliquer la nouvelle rotation, sinon restaurer l'originale
        if (snapped.rotation !== undefined) {
          updated.rotation = snapped.rotation;
        } else {
          updated.rotation = dragOriginalRotation;
        }
        return updated;
      }
      return t;
    }));
  };

  const handleDragEnd = () => {
    if (isDragging && selectedTerrain) {
      // Déplacer le décor symétrique en conséquence
      const movedTerrain = terrains.find(t => t.id === selectedTerrain);
      if (movedTerrain && movedTerrain.symmetricId) {
        const symmetricTerrain = terrains.find(t => t.id === movedTerrain.symmetricId);
        if (symmetricTerrain) {
          // Calculer le déplacement effectué par le décor principal
          // Le symétrique doit faire le déplacement inverse par rapport au centre de la table
          const centerX = 30; // Centre de la table en pouces (60/2)
          const centerY = 22; // Centre de la table en pouces (44/2)
          
          // Position symétrique = rotation de 180° autour du centre
          const newSymX = 2 * centerX * SCALE - movedTerrain.x - TERRAIN_TYPES[movedTerrain.type].width;
          const newSymY = 2 * centerY * SCALE - movedTerrain.y - TERRAIN_TYPES[movedTerrain.type].height;
          
          // Rotation symétrique = rotation du décor + 180°
          let newSymRotation = (movedTerrain.rotation + 180) % 360;
          
          setTerrains(prev => prev.map(t => 
            t.id === symmetricTerrain.id ? { ...t, x: newSymX, y: newSymY, rotation: newSymRotation } : t
          ));
        }
      }
      // Invalider les résultats LoS pour ce layout
      invalidateLoSResultsForLayout(selectedLayout);
    }
    setIsDragging(false);
    setDragOriginalRotation(null);
    snapGuidesRef.current = [];
  };

  // Fonctions pour le pinch-to-zoom et pan
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    };
  };

  const handlePinchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);
      setLastPinchDistance(distance);
      setLastPinchCenter(center);
    }
  };

  const handlePinchMove = (e) => {
    if (e.touches.length === 2 && isPinching) {
      e.preventDefault();
      
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const currentCenter = getCenter(e.touches[0], e.touches[1]);
      
      // Calculer le facteur de zoom
      if (lastPinchDistance > 0) {
        const zoomDelta = currentDistance / lastPinchDistance;
        const newZoom = Math.min(Math.max(userZoom * zoomDelta, 0.5), 3); // Limiter entre 0.5x et 3x
        setUserZoom(newZoom);
      }
      
      // Calculer le déplacement (pan)
      const dx = currentCenter.x - lastPinchCenter.x;
      const dy = currentCenter.y - lastPinchCenter.y;
      setPanOffset(prev => ({
        x: prev.x + dx,
        y: prev.y + dy
      }));
      
      setLastPinchDistance(currentDistance);
      setLastPinchCenter(currentCenter);
    }
  };

  const handlePinchEnd = (e) => {
    if (e.touches.length < 2) {
      setIsPinching(false);
      setLastPinchDistance(0);
    }
  };

  const resetZoomAndPan = () => {
    setUserZoom(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Fonctions pour le mode positionnement fin
  const resetFinePosition = () => {
    setFinePositionStep(1);
    setFinePositionCorner1(null);
    setFinePositionCorner2(null);
    setFinePositionX('');
    setFinePositionY('');
    setFinePositionAxis('X');
    setFinePositionValue('');
    setFinePositionError('');
  };

  const handleFinePositionCornerClick = (cornerIndex) => {
    if (finePositionStep === 2) {
      setFinePositionCorner1(cornerIndex);
      setFinePositionStep(3);
    } else if (finePositionStep === 4) {
      if (cornerIndex !== finePositionCorner1) {
        setFinePositionCorner2(cornerIndex);
        setFinePositionStep(5);
      }
    }
  };

  const applyFinePositionTranslation = () => {
    setFinePositionError('');
    
    const terrain = terrains.find(t => t.id === selectedTerrain?.id);
    if (!terrain || finePositionCorner1 === null) return;

    const targetX = parseFloat(finePositionX);
    const targetY = parseFloat(finePositionY);
    if (isNaN(targetX) || isNaN(targetY)) {
      setFinePositionError('Veuillez entrer des coordonnées valides');
      return;
    }

    // Vérifier que les coordonnées cibles sont dans la table
    if (targetX < 0 || targetX > 60 || targetY < 0 || targetY > 44) {
      setFinePositionError('Les coordonnées doivent être dans la table (X: 0-60, Y: 0-44)');
      return;
    }

    // Obtenir la position actuelle du coin sélectionné
    const corners = getRotatedCorners(terrain);
    const currentCorner = corners[finePositionCorner1];

    // Calculer le décalage nécessaire (en pixels)
    const dx = targetX * SCALE - currentCorner.x;
    const dy = targetY * SCALE - currentCorner.y;

    // Calculer les nouvelles positions de tous les coins après translation
    const newCorners = corners.map(c => ({
      x: (c.x + dx) / SCALE,
      y: (c.y + dy) / SCALE
    }));

    // Vérifier que tous les coins restent dans la table
    for (let i = 0; i < newCorners.length; i++) {
      if (newCorners[i].x < 0 || newCorners[i].x > 60 || newCorners[i].y < 0 || newCorners[i].y > 44) {
        setFinePositionError(`Le coin ${i + 1} sortirait de la table (${newCorners[i].x.toFixed(1)}, ${newCorners[i].y.toFixed(1)})`);
        return;
      }
    }

    // Vérifier aussi le décor symétrique
    const symmetricTerrain = terrains.find(t => t.id === terrain.symmetricId);
    if (symmetricTerrain) {
      const centerX = 30 * SCALE;
      const centerY = 22 * SCALE;
      const newTerrainX = terrain.x + dx;
      const newTerrainY = terrain.y + dy;
      const newSymX = 2 * centerX - newTerrainX - TERRAIN_TYPES[terrain.type].width;
      const newSymY = 2 * centerY - newTerrainY - TERRAIN_TYPES[terrain.type].height;
      
      // Créer un terrain temporaire pour vérifier ses coins
      const tempSymTerrain = { ...symmetricTerrain, x: newSymX, y: newSymY };
      const symCorners = getRotatedCorners(tempSymTerrain);
      
      for (let i = 0; i < symCorners.length; i++) {
        const cx = symCorners[i].x / SCALE;
        const cy = symCorners[i].y / SCALE;
        if (cx < 0 || cx > 60 || cy < 0 || cy > 44) {
          setFinePositionError(`Le décor symétrique sortirait de la table`);
          return;
        }
      }
    }

    // Appliquer la translation
    setTerrains(prev => prev.map(t => {
      if (t.id === terrain.id) {
        return { ...t, x: t.x + dx, y: t.y + dy };
      }
      return t;
    }));

    // Mettre à jour le décor symétrique
    if (symmetricTerrain) {
      const centerX = 30 * SCALE;
      const centerY = 22 * SCALE;
      const newTerrainX = terrain.x + dx;
      const newTerrainY = terrain.y + dy;
      const newSymX = 2 * centerX - newTerrainX - TERRAIN_TYPES[terrain.type].width;
      const newSymY = 2 * centerY - newTerrainY - TERRAIN_TYPES[terrain.type].height;
      
      setTerrains(prev => prev.map(t => 
        t.id === symmetricTerrain.id ? { ...t, x: newSymX, y: newSymY } : t
      ));
    }

    // Invalider les résultats LoS
    invalidateLoSResultsForLayout(selectedLayout);

    // Passer à l'étape 4
    setFinePositionStep(4);
  };

  const applyFinePositionRotation = () => {
    setFinePositionError('');
    
    const terrain = terrains.find(t => t.id === selectedTerrain?.id);
    if (!terrain || finePositionCorner1 === null || finePositionCorner2 === null) return;

    const targetValue = parseFloat(finePositionValue);
    if (isNaN(targetValue)) {
      setFinePositionError('Veuillez entrer une coordonnée valide');
      return;
    }

    // Vérifier que la coordonnée cible est dans la table
    if (finePositionAxis === 'X' && (targetValue < 0 || targetValue > 60)) {
      setFinePositionError('La coordonnée X doit être entre 0 et 60');
      return;
    }
    if (finePositionAxis === 'Y' && (targetValue < 0 || targetValue > 44)) {
      setFinePositionError('La coordonnée Y doit être entre 0 et 44');
      return;
    }

    // Obtenir les positions actuelles des coins (après la translation)
    const corners = getRotatedCorners(terrain);
    const pivot = corners[finePositionCorner1]; // Point fixe (coin 1)
    const corner2 = corners[finePositionCorner2]; // Point à faire pivoter (coin 2)

    // Calculer la distance entre pivot et corner2
    const distance = Math.sqrt((corner2.x - pivot.x) ** 2 + (corner2.y - pivot.y) ** 2);

    // Calculer la position cible du coin 2
    let targetCorner2X, targetCorner2Y;
    if (finePositionAxis === 'X') {
      targetCorner2X = targetValue * SCALE;
      const dxTarget = targetCorner2X - pivot.x;
      if (Math.abs(dxTarget) > distance) {
        setFinePositionError(`Position impossible : le coin ${finePositionCorner2 + 1} ne peut pas atteindre X=${targetValue}" (distance max depuis le pivot : ${(distance / SCALE).toFixed(1)}")`);
        return;
      }
      const dyTargetSquared = distance ** 2 - dxTarget ** 2;
      const dyTarget = Math.sqrt(Math.max(0, dyTargetSquared));
      // Choisir le signe de dy pour minimiser la rotation
      const currentDy = corner2.y - pivot.y;
      targetCorner2Y = pivot.y + (currentDy >= 0 ? dyTarget : -dyTarget);
    } else {
      targetCorner2Y = targetValue * SCALE;
      const dyTarget = targetCorner2Y - pivot.y;
      if (Math.abs(dyTarget) > distance) {
        setFinePositionError(`Position impossible : le coin ${finePositionCorner2 + 1} ne peut pas atteindre Y=${targetValue}" (distance max depuis le pivot : ${(distance / SCALE).toFixed(1)}")`);
        return;
      }
      const dxTargetSquared = distance ** 2 - dyTarget ** 2;
      const dxTarget = Math.sqrt(Math.max(0, dxTargetSquared));
      // Choisir le signe de dx pour minimiser la rotation
      const currentDx = corner2.x - pivot.x;
      targetCorner2X = pivot.x + (currentDx >= 0 ? dxTarget : -dxTarget);
    }

    // Calculer l'angle de rotation nécessaire
    const currentAngle = Math.atan2(corner2.y - pivot.y, corner2.x - pivot.x);
    const targetAngle = Math.atan2(targetCorner2Y - pivot.y, targetCorner2X - pivot.x);
    const rotationDelta = (targetAngle - currentAngle) * 180 / Math.PI;

    // Calculer la nouvelle position du décor après rotation autour du pivot
    const terrainType = TERRAIN_TYPES[terrain.type];
    const terrainCenterX = terrain.x + terrainType.width / 2;
    const terrainCenterY = terrain.y + terrainType.height / 2;

    // Faire pivoter le centre du décor autour du pivot
    const cosR = Math.cos(rotationDelta * Math.PI / 180);
    const sinR = Math.sin(rotationDelta * Math.PI / 180);
    const dxCenter = terrainCenterX - pivot.x;
    const dyCenter = terrainCenterY - pivot.y;
    const newCenterX = pivot.x + dxCenter * cosR - dyCenter * sinR;
    const newCenterY = pivot.y + dxCenter * sinR + dyCenter * cosR;

    const newX = newCenterX - terrainType.width / 2;
    const newY = newCenterY - terrainType.height / 2;
    const newRotation = (terrain.rotation + rotationDelta + 360) % 360;

    // Vérifier que tous les coins restent dans la table après rotation
    const tempTerrain = { ...terrain, x: newX, y: newY, rotation: newRotation };
    const newCorners = getRotatedCorners(tempTerrain);
    for (let i = 0; i < newCorners.length; i++) {
      const cx = newCorners[i].x / SCALE;
      const cy = newCorners[i].y / SCALE;
      if (cx < 0 || cx > 60 || cy < 0 || cy > 44) {
        setFinePositionError(`Le coin ${i + 1} sortirait de la table après rotation (${cx.toFixed(1)}, ${cy.toFixed(1)})`);
        return;
      }
    }

    // Vérifier aussi le décor symétrique
    const symmetricTerrain = terrains.find(t => t.id === terrain.symmetricId);
    if (symmetricTerrain) {
      const centerX = 30 * SCALE;
      const centerY = 22 * SCALE;
      const newSymX = 2 * centerX - newX - terrainType.width;
      const newSymY = 2 * centerY - newY - terrainType.height;
      const newSymRotation = (newRotation + 180) % 360;
      
      const tempSymTerrain = { ...symmetricTerrain, x: newSymX, y: newSymY, rotation: newSymRotation };
      const symCorners = getRotatedCorners(tempSymTerrain);
      for (let i = 0; i < symCorners.length; i++) {
        const cx = symCorners[i].x / SCALE;
        const cy = symCorners[i].y / SCALE;
        if (cx < 0 || cx > 60 || cy < 0 || cy > 44) {
          setFinePositionError(`Le décor symétrique sortirait de la table après rotation`);
          return;
        }
      }
    }

    // Appliquer la rotation
    setTerrains(prev => prev.map(t => {
      if (t.id === terrain.id) {
        return { ...t, x: newX, y: newY, rotation: newRotation };
      }
      return t;
    }));

    // Mettre à jour le décor symétrique
    if (symmetricTerrain) {
      const centerX = 30 * SCALE;
      const centerY = 22 * SCALE;
      const newSymX = 2 * centerX - newX - terrainType.width;
      const newSymY = 2 * centerY - newY - terrainType.height;
      const newSymRotation = (newRotation + 180) % 360;
      
      setTerrains(prev => prev.map(t => 
        t.id === symmetricTerrain.id ? { ...t, x: newSymX, y: newSymY, rotation: newSymRotation } : t
      ));
    }

    // Invalider les résultats LoS
    invalidateLoSResultsForLayout(selectedLayout);

    // Réinitialiser le mode
    resetFinePosition();
  };

  // Fonction pour générer l'image d'export
  const generateExportImage = async (options = {}) => {
    const {
      showClassicCoords = false,
      showFEQCoords = false,
      showDeploymentZones = false,
      showObjectivesMarkers = false,
      showLoSSurfaces = false,
      forPDF = false
    } = options;

    // Dimensions de l'export avec marges
    const EXPORT_WIDTH = 800;
    const EXPORT_HEIGHT = 600;
    const MARGIN = 40;
    const TABLE_EXPORT_WIDTH = EXPORT_WIDTH - 2 * MARGIN;
    const TABLE_EXPORT_HEIGHT = EXPORT_HEIGHT - 2 * MARGIN;
    const EXPORT_SCALE = TABLE_EXPORT_WIDTH / TABLE_WIDTH;

    // Créer un canvas
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_WIDTH;
    canvas.height = EXPORT_HEIGHT;
    const ctx = canvas.getContext('2d');

    // Fond gris foncé (comme l'application)
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);

    // Fond de la table (gris comme dans l'app)
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(MARGIN, MARGIN, TABLE_EXPORT_WIDTH, TABLE_EXPORT_HEIGHT);

    // Bordure de la table (jaune)
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.strokeRect(MARGIN, MARGIN, TABLE_EXPORT_WIDTH, TABLE_EXPORT_HEIGHT);

    // Lignes de centre en pointillés
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Ligne verticale
    ctx.beginPath();
    ctx.moveTo(MARGIN + TABLE_EXPORT_WIDTH / 2, MARGIN);
    ctx.lineTo(MARGIN + TABLE_EXPORT_WIDTH / 2, MARGIN + TABLE_EXPORT_HEIGHT);
    ctx.stroke();
    
    // Ligne horizontale
    ctx.beginPath();
    ctx.moveTo(MARGIN, MARGIN + TABLE_EXPORT_HEIGHT / 2);
    ctx.lineTo(MARGIN + TABLE_EXPORT_WIDTH, MARGIN + TABLE_EXPORT_HEIGHT / 2);
    ctx.stroke();
    
    ctx.setLineDash([]);

    // Dessiner les zones de déploiement si demandé
    if (showDeploymentZones && DEPLOYMENT_ZONES[deploymentZone]) {
      const zone = DEPLOYMENT_ZONES[deploymentZone];
      
      const drawZone = (zoneData, color, isPlayer1) => {
        ctx.fillStyle = color;
        ctx.strokeStyle = color.replace('0.25', '0.8').replace('0.3', '0.8');
        ctx.lineWidth = 2;
        
        if (zoneData.type === 'polygon') {
          ctx.beginPath();
          zoneData.points.forEach((p, i) => {
            const x = MARGIN + p.x * SCALE * EXPORT_SCALE;
            const y = MARGIN + p.y * SCALE * EXPORT_SCALE;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (zoneData.type === 'path') {
          // Pour Search and Destroy : dessiner manuellement avec l'arc
          const s = SCALE * EXPORT_SCALE;
          const r = 9 * s;
          
          ctx.beginPath();
          
          if (isPlayer1) {
            // Player 1 : (30;0) -> (60;0) -> (60;22) -> (39;22) -> arc vers (30;13) -> fermer
            ctx.moveTo(MARGIN + 30 * s, MARGIN + 0 * s);
            ctx.lineTo(MARGIN + 60 * s, MARGIN + 0 * s);
            ctx.lineTo(MARGIN + 60 * s, MARGIN + 22 * s);
            ctx.lineTo(MARGIN + 39 * s, MARGIN + 22 * s);
            // Arc de (39;22) vers (30;13) - centre à (30;22), de 0 rad à -π/2 rad (sens antihoraire)
            ctx.arc(MARGIN + 30 * s, MARGIN + 22 * s, r, 0, -Math.PI / 2, true);
            ctx.lineTo(MARGIN + 30 * s, MARGIN + 0 * s);
          } else {
            // Player 2 : (0;22) -> (21;22) -> arc vers (30;31) -> (30;44) -> (0;44) -> fermer
            ctx.moveTo(MARGIN + 0 * s, MARGIN + 22 * s);
            ctx.lineTo(MARGIN + 21 * s, MARGIN + 22 * s);
            // Arc de (21;22) vers (30;31) - centre à (30;22), de π rad à π/2 rad (sens antihoraire)
            ctx.arc(MARGIN + 30 * s, MARGIN + 22 * s, r, Math.PI, Math.PI / 2, true);
            ctx.lineTo(MARGIN + 30 * s, MARGIN + 44 * s);
            ctx.lineTo(MARGIN + 0 * s, MARGIN + 44 * s);
          }
          
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      };
      
      drawZone(zone.player1, 'rgba(139, 0, 0, 0.25)', true);
      drawZone(zone.player2, 'rgba(0, 100, 0, 0.3)', false);
    }

    // Dessiner les objectifs si demandé
    if (showObjectivesMarkers && OBJECTIVES[deploymentZone]) {
      const objectives = OBJECTIVES[deploymentZone];
      
      for (const obj of objectives) {
        const cx = MARGIN + obj.x * SCALE * EXPORT_SCALE;
        const cy = MARGIN + obj.y * SCALE * EXPORT_SCALE;
        
        // Cercle extérieur - zone de contrôle (20mm + 3")
        ctx.beginPath();
        ctx.arc(cx, cy, OBJECTIVE_OUTER_RADIUS * SCALE * EXPORT_SCALE, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Cercle intérieur - pion d'objectif (40mm diamètre)
        ctx.beginPath();
        ctx.arc(cx, cy, OBJECTIVE_INNER_RADIUS * SCALE * EXPORT_SCALE, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.9)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    // Dessiner les surfaces LoS si demandé
    if (showLoSSurfaces && advancedLoSResults) {
      const smoothedNML = smoothVisibilityMap(advancedLoSResults.visibilityNML, losResolution);
      const smoothedZ2 = smoothVisibilityMap(advancedLoSResults.visibilityZ2, losResolution);
      const halfSize = (losResolution * SCALE * EXPORT_SCALE) / 2;

      // NML
      for (const [key, isVisible] of smoothedNML.entries()) {
        const [x, y] = key.split(',').map(Number);
        const px = MARGIN + x * SCALE * EXPORT_SCALE - halfSize;
        const py = MARGIN + y * SCALE * EXPORT_SCALE - halfSize;
        ctx.fillStyle = isVisible ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(px, py, losResolution * SCALE * EXPORT_SCALE, losResolution * SCALE * EXPORT_SCALE);
      }

      // Zone 2
      for (const [key, isVisible] of smoothedZ2.entries()) {
        const [x, y] = key.split(',').map(Number);
        const px = MARGIN + x * SCALE * EXPORT_SCALE - halfSize;
        const py = MARGIN + y * SCALE * EXPORT_SCALE - halfSize;
        ctx.fillStyle = isVisible ? 'rgba(16, 185, 129, 0.6)' : 'rgba(220, 38, 38, 0.5)';
        ctx.fillRect(px, py, losResolution * SCALE * EXPORT_SCALE, losResolution * SCALE * EXPORT_SCALE);
      }
    }

    // Dessiner les décors
    for (const terrain of terrains) {
      const terrainType = TERRAIN_TYPES[terrain.type];
      const cx = MARGIN + (terrain.x + terrainType.width / 2) * EXPORT_SCALE;
      const cy = MARGIN + (terrain.y + terrainType.height / 2) * EXPORT_SCALE;
      const w = terrainType.width * EXPORT_SCALE;
      const h = terrainType.height * EXPORT_SCALE;
      const angle = terrain.rotation * Math.PI / 180;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      // Couleur selon le type
      if (terrain.type === 'gruin') {
        ctx.fillStyle = '#4b5563';
        ctx.strokeStyle = '#1f2937';
      } else if (terrain.type === 'pruin') {
        ctx.fillStyle = '#6b7280';
        ctx.strokeStyle = '#374151';
      } else if (terrain.type === 'forest') {
        ctx.fillStyle = '#166534';
        ctx.strokeStyle = '#14532d';
      } else if (terrain.type === 'container') {
        ctx.fillStyle = '#9a3412';
        ctx.strokeStyle = '#7c2d12';
      }

      // Dessiner le rectangle ou le polygone
      if (terrainType.buildingPolygon) {
        // Dessiner l'empreinte en pointillés (plus visible pour l'export)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#d1d5db'; // Gris clair pour meilleure visibilité
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
        ctx.setLineDash([]);

        // Dessiner le bâtiment
        ctx.beginPath();
        terrainType.buildingPolygon.forEach((p, i) => {
          const px = (p.x * SCALE - terrainType.width / 2) * EXPORT_SCALE;
          const py = (p.y * SCALE - terrainType.height / 2) * EXPORT_SCALE;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillRect(-w / 2, -h / 2, w, h);
        ctx.lineWidth = 2;
        ctx.strokeRect(-w / 2, -h / 2, w, h);
      }

      // Nom du décor
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(terrain.name, 0, 0);

      ctx.restore();
    }

    // Dessiner les coordonnées classiques si demandé
    if (showClassicCoords) {
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      
      for (const terrain of terrains) {
        const corners = getRotatedCorners(terrain);
        for (const corner of corners) {
          const x = MARGIN + corner.x * EXPORT_SCALE;
          const y = MARGIN + corner.y * EXPORT_SCALE;
          
          ctx.fillStyle = '#eab308';
          ctx.fillRect(x - 22, y - 8, 44, 14);
          ctx.fillStyle = 'black';
          ctx.fillText(`(${(corner.x / SCALE).toFixed(1)};${(corner.y / SCALE).toFixed(1)})`, x, y);
        }
      }
    }

    // Dessiner les coordonnées FEQ si demandé
    if (showFEQCoords) {
      const maxVectorLength = 2 * SCALE * EXPORT_SCALE;
      
      for (const terrain of terrains) {
        const corners = getRotatedCorners(terrain);
        
        for (const corner of corners) {
          const xInches = corner.x / SCALE;
          const yInches = corner.y / SCALE;
          const xIsInteger = Math.abs(xInches - Math.round(xInches)) < 0.01;
          const yIsInteger = Math.abs(yInches - Math.round(yInches)) < 0.01;
          
          const cx = MARGIN + corner.x * EXPORT_SCALE;
          const cy = MARGIN + corner.y * EXPORT_SCALE;
          
          // Vecteur horizontal
          if (xIsInteger) {
            const distanceToLeft = xInches;
            const distanceToRight = 60 - xInches;
            const goLeft = distanceToLeft <= distanceToRight;
            const distance = goLeft ? distanceToLeft : distanceToRight;
            
            if (distance > 0) {
              const vecLength = Math.min(distance * SCALE * EXPORT_SCALE, maxVectorLength);
              const endX = goLeft ? cx - vecLength : cx + vecLength;
              
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(endX, cy);
              ctx.stroke();
              
              // Flèche
              const arrowSize = 5;
              const arrowDir = goLeft ? 1 : -1;
              ctx.fillStyle = '#3b82f6';
              ctx.beginPath();
              ctx.moveTo(endX, cy);
              ctx.lineTo(endX + arrowDir * arrowSize, cy - arrowSize / 2);
              ctx.lineTo(endX + arrowDir * arrowSize, cy + arrowSize / 2);
              ctx.closePath();
              ctx.fill();
              
              // Texte
              ctx.font = 'bold 10px Arial';
              ctx.fillStyle = '#3b82f6';
              ctx.textAlign = 'center';
              ctx.fillText(`${Math.round(distance)}"`, (cx + endX) / 2, cy - 8);
            }
          }
          
          // Vecteur vertical
          if (yIsInteger) {
            const distanceToTop = yInches;
            const distanceToBottom = 44 - yInches;
            const goUp = distanceToTop <= distanceToBottom;
            const distance = goUp ? distanceToTop : distanceToBottom;
            
            if (distance > 0) {
              const vecLength = Math.min(distance * SCALE * EXPORT_SCALE, maxVectorLength);
              const endY = goUp ? cy - vecLength : cy + vecLength;
              
              ctx.strokeStyle = '#3b82f6';
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.lineTo(cx, endY);
              ctx.stroke();
              
              // Flèche
              const arrowSize = 5;
              const arrowDir = goUp ? 1 : -1;
              ctx.fillStyle = '#3b82f6';
              ctx.beginPath();
              ctx.moveTo(cx, endY);
              ctx.lineTo(cx - arrowSize / 2, endY + arrowDir * arrowSize);
              ctx.lineTo(cx + arrowSize / 2, endY + arrowDir * arrowSize);
              ctx.closePath();
              ctx.fill();
              
              // Texte
              ctx.font = 'bold 10px Arial';
              ctx.fillStyle = '#3b82f6';
              ctx.textAlign = 'left';
              ctx.fillText(`${Math.round(distance)}"`, cx + 8, (cy + endY) / 2);
            }
          }
          
          // Point au coin si au moins un vecteur
          if (xIsInteger || yIsInteger) {
            ctx.fillStyle = '#3b82f6';
            ctx.beginPath();
            ctx.arc(cx, cy, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    return canvas;
  };

  // Fonction pour exporter en PNG
  const exportPNG = async () => {
    setExportGenerating(true);
    
    try {
      const canvas = await generateExportImage({
        showClassicCoords: exportShowClassicCoords,
        showFEQCoords: exportShowFEQCoords,
        showDeploymentZones: exportShowDeployment,
        showObjectivesMarkers: exportShowObjectives,
        showLoSSurfaces: exportShowSurfaces
      });
      
      // Convertir en blob et ouvrir dans un nouvel onglet
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${selectedLayout} - Export PNG</title>
                <style>
                  body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: #1f2937; font-family: sans-serif; }
                  img { max-width: 100%; border: 2px solid #4b5563; }
                  p { color: white; margin: 20px; text-align: center; }
                  a { color: #60a5fa; }
                </style>
              </head>
              <body>
                <p>Clic droit sur l'image → "Enregistrer l'image sous..." pour télécharger</p>
                <img src="${url}" alt="Export du layout"/>
                <p>Layout: ${selectedLayout}</p>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          alert('Impossible d\'ouvrir une nouvelle fenêtre. Vérifiez que les popups ne sont pas bloquées.');
        }
      }, 'image/png');
    } catch (error) {
      console.error('Erreur export PNG:', error);
      alert('Erreur lors de l\'export PNG: ' + error.message);
    }
    
    setExportGenerating(false);
  };

  // Fonction pour exporter le rapport PDF (via HTML imprimable)
  const exportPDF = async () => {
    if (!advancedLoSResults) return;
    
    setExportGenerating(true);
    
    try {
      // Générer les deux images
      const canvas1 = await generateExportImage({
        showClassicCoords: false,
        showFEQCoords: true,
        showDeploymentZones: true,
        showLoSSurfaces: false,
        forPDF: true
      });
      
      const canvas2 = await generateExportImage({
        showClassicCoords: false,
        showFEQCoords: false,
        showDeploymentZones: false,
        showLoSSurfaces: true,
        forPDF: true
      });
      
      const img1DataUrl = canvas1.toDataURL('image/png');
      const img2DataUrl = canvas2.toDataURL('image/png');
      
      // Statistiques de classification
      let classifStats = '';
      if (gridClassification) {
        const zone1Count = (gridClassification.zone1Only?.length || 0) + (gridClassification.zone1AndNoManLand?.length || 0);
        const nmlCount = gridClassification.noManLandOnly?.length || 0;
        const zone2Count = (gridClassification.zone2Only?.length || 0) + (gridClassification.zone2AndNoManLand?.length || 0);
        const frontier1Count = gridClassification.zone1AndNoManLand?.length || 0;
        const frontier2Count = gridClassification.zone2AndNoManLand?.length || 0;
        const terrainCount = (gridClassification.zone1Only?.filter(p => p.inTerrain).length || 0) + 
                            (gridClassification.noManLandOnly?.filter(p => p.inTerrain).length || 0) +
                            (gridClassification.zone2Only?.filter(p => p.inTerrain).length || 0);
        
        classifStats = `
          <li>Points classifiés : Zone J1=${zone1Count}, NML=${nmlCount}, Zone J2=${zone2Count}</li>
          <li>Points frontière : J1/NML=${frontier1Count}, J2/NML=${frontier2Count}</li>
          <li>Points dans décors : ${terrainCount}</li>
        `;
      }
      
      const nbTargets = advancedLoSResults.statsNML.total + advancedLoSResults.statsZ2.total;
      const nmlPercent = advancedLoSResults.statsNML.percent;
      
      let interpretation = '';
      if (nmlPercent >= 70) {
        interpretation = 'Le No Man\'s Land est très exposé, favorisant les armées de tir.';
      } else if (nmlPercent >= 40) {
        interpretation = 'Le No Man\'s Land offre un équilibre entre couverture et exposition.';
      } else {
        interpretation = 'Le No Man\'s Land est bien couvert, favorisant les armées de mêlée.';
      }
      
      // Créer la page HTML du rapport
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Rapport d'analyse - ${selectedLayout}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                max-width: 210mm; 
                margin: 0 auto; 
                padding: 20mm;
                background: white;
                color: black;
              }
              h1 { text-align: center; color: #1f2937; margin-bottom: 5px; }
              h2 { text-align: center; color: #4b5563; font-weight: normal; margin-top: 0; }
              h3 { color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; margin-top: 30px; }
              img { width: 100%; border: 1px solid #ccc; margin: 10px 0; }
              ul { line-height: 1.8; }
              .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
              .stat-box { background: #f3f4f6; padding: 15px; border-radius: 8px; }
              .stat-box h4 { margin: 0 0 10px 0; color: #1f2937; }
              .interpretation { background: #dbeafe; padding: 15px; border-radius: 8px; margin-top: 20px; }
              .legend { font-style: italic; color: #6b7280; text-align: center; }
              .print-instructions { 
                background: #fef3c7; 
                padding: 15px; 
                border-radius: 8px; 
                margin-bottom: 20px;
                text-align: center;
              }
              @media print {
                .print-instructions { display: none; }
                body { padding: 10mm; }
              }
              @page { size: A4; margin: 10mm; }
            </style>
          </head>
          <body>
            <div class="print-instructions">
              <strong>💡 Pour sauvegarder en PDF :</strong> Utilisez Ctrl+P (ou Cmd+P sur Mac) puis choisissez "Enregistrer au format PDF"
            </div>
            
            <h1>Rapport d'analyse</h1>
            <h2>${selectedLayout} - ${deploymentZone}</h2>
            
            <h3>Vue du layout avec zones de déploiement</h3>
            <img src="${img1DataUrl}" alt="Layout avec zones de déploiement"/>
            
            <h3>Hypothèses de calcul</h3>
            <ul>
              <li>Résolution de la grille : ${losResolution}"</li>
              <li>Déploiement J1 dans les décors : ${excludeTerrainPoints ? 'Non (points exclus)' : 'Oui (points inclus)'}</li>
              <li>Zone de déploiement : ${deploymentZone}</li>
              ${classifStats}
              <li>Points cibles analysés : ${nbTargets}</li>
            </ul>
            
            <h3>Résultats du calcul de lignes de vue</h3>
            <img src="${img2DataUrl}" alt="Surfaces de visibilité"/>
            <p class="legend">Légende : Vert = visible depuis la zone J1, Rouge = non visible</p>
            
            <h3>Statistiques de visibilité</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <h4>No Man's Land</h4>
                <p>Points visibles : ${advancedLoSResults.statsNML.visible} / ${advancedLoSResults.statsNML.total}</p>
                <p><strong>Visibilité : ${advancedLoSResults.statsNML.percent}%</strong></p>
              </div>
              <div class="stat-box">
                <h4>Zone Joueur 2</h4>
                <p>Points visibles : ${advancedLoSResults.statsZ2.visible} / ${advancedLoSResults.statsZ2.total}</p>
                <p><strong>Visibilité : ${advancedLoSResults.statsZ2.percent}%</strong></p>
              </div>
            </div>
            
            <div class="interpretation">
              <strong>Interprétation :</strong> ${interpretation}
            </div>
          </body>
        </html>
      `;
      
      // Ouvrir dans un nouvel onglet
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        alert('Impossible d\'ouvrir une nouvelle fenêtre. Vérifiez que les popups ne sont pas bloquées.');
      }
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF: ' + error.message);
    }
    
    setExportGenerating(false);
  };

  const validateLayout = () => {
    if (!terrains || terrains.length === 0) return [];
    
    const errors = [];
    
    for (let i = 0; i < terrains.length; i++) {
      for (let j = i + 1; j < terrains.length; j++) {
        if (checkOverlap(terrains[i], terrains[j])) {
          errors.push(`${terrains[i].name} et ${terrains[j].name} se chevauchent`);
        }
      }
    }
    
    for (const terrain of terrains) {
      if (!checkGridConstraints(terrain)) {
        errors.push(`${terrain.name} ne respecte pas les contraintes de grille`);
      }
    }
    
    return errors;
  };

  const handleTableClick = (e) => {
    if (editMode) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    // Prendre en compte le scale et le zoom pour convertir les coordonnées
    const x = (e.clientX - rect.left) / (tableScale * userZoom);
    const y = (e.clientY - rect.top) / (tableScale * userZoom);

    if (!pointA) {
      setPointA({ x, y });
      setLosResult(null);
    } else if (!pointB) {
      setPointB({ x, y });
      calculateLoS({ x, y }, pointA);
    } else {
      setPointA({ x, y });
      setPointB(null);
      setLosResult(null);
    }
  };

  const calculateLoS = (pB, pA) => {
    let blocked = false;
    let blockingTerrain = null;
    let intersectionPoint = null;
    let minDistance = Infinity;

    for (const terrain of terrains) {
      const terrainType = TERRAIN_TYPES[terrain.type];
      const buildingPolygon = getBuildingPolygon(terrain);
      
      let isBlocked = false;
      let currentIntersection = null;

      if (terrain.type === 'forest') {
        // FORÊT : bloqué si la ligne traverse 2 segments ou plus
        const corners = getRotatedCorners(terrain);
        const intersections = findAllIntersections(pA, pB, corners);
        
        if (intersections.length >= 2) {
          isBlocked = true;
          currentIntersection = intersections[1]; // Point C = 2ème intersection
        }
      } else if (terrain.type === 'gruin' || terrain.type === 'pruin') {
        // RUINES : bloqué si traverse le building OU si traverse 2 segments d'empreinte
        if (buildingPolygon) {
          // Vérifier si traverse le building (polygone en L)
          const buildingIntersections = findAllIntersections(pA, pB, buildingPolygon);
          if (buildingIntersections.length > 0) {
            isBlocked = true;
            currentIntersection = buildingIntersections[0]; // 1ère intersection avec le building
          } else {
            // Sinon vérifier si traverse 2 segments de l'empreinte
            const corners = getRotatedCorners(terrain);
            const intersections = findAllIntersections(pA, pB, corners);
            
            if (intersections.length >= 2) {
              isBlocked = true;
              currentIntersection = intersections[1]; // Point C = 2ème intersection
            }
          }
        }
      } else {
        // CONTAINER : bloqué si traverse n'importe quel segment
        const corners = getRotatedCorners(terrain);
        const intersection = findFirstIntersection(pA, pB, corners);
        
        if (intersection) {
          isBlocked = true;
          currentIntersection = intersection;
        }
      }

      // Garder seulement l'obstruction la plus proche
      if (isBlocked && currentIntersection) {
        const dist = Math.sqrt(
          Math.pow(currentIntersection.x - pA.x, 2) + 
          Math.pow(currentIntersection.y - pA.y, 2)
        );
        
        if (dist < minDistance) {
          minDistance = dist;
          blocked = true;
          blockingTerrain = `${terrain.name} (${terrainType.label})`;
          intersectionPoint = currentIntersection;
        }
      }
    }

    setLosResult({
      blocked,
      blockingTerrain,
      intersectionPoint,
      distance: Math.sqrt(Math.pow(pB.x - pA.x, 2) + Math.pow(pB.y - pA.y, 2))
    });
  };

  const findAllIntersections = (p1, p2, corners) => {
    const intersections = [];

    for (let i = 0; i < corners.length; i++) {
      const c1 = corners[i];
      const c2 = corners[(i + 1) % corners.length];
      const intersection = getLineSegmentIntersection(p1, p2, c1, c2);
      
      if (intersection) {
        intersections.push(intersection);
      }
    }
    
    // Trier par distance depuis p1
    intersections.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.x - p1.x, 2) + Math.pow(a.y - p1.y, 2));
      const distB = Math.sqrt(Math.pow(b.x - p1.x, 2) + Math.pow(b.y - p1.y, 2));
      return distA - distB;
    });
    
    return intersections;
  };

  const findFirstIntersection = (p1, p2, corners) => {
    const intersections = findAllIntersections(p1, p2, corners);
    return intersections.length > 0 ? intersections[0] : null;
  };

  const getLineSegmentIntersection = (p1, p2, p3, p4) => {
    const x1 = p1.x, y1 = p1.y;
    const x2 = p2.x, y2 = p2.y;
    const x3 = p3.x, y3 = p3.y;
    const x4 = p4.x, y4 = p4.y;

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    
    // Tolérance plus stricte pour éviter les faux négatifs
    if (Math.abs(denom) < 0.000001) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    // Tolérance légère pour les points aux extrémités
    const epsilon = 0.0001;
    if (t >= -epsilon && t <= 1 + epsilon && u >= -epsilon && u <= 1 + epsilon) {
      return {
        x: x1 + t * (x2 - x1),
        y: y1 + t * (y2 - y1)
      };
    }

    return null;
  };

  const lineIntersectsPolygon = (p1, p2, corners) => {
    for (let i = 0; i < corners.length; i++) {
      const c1 = corners[i];
      const c2 = corners[(i + 1) % corners.length];
      if (doLineSegmentsIntersect(p1, p2, c1, c2)) return true;
    }
    return false;
  };

  const doLineSegmentsIntersect = (p1, p2, p3, p4) => {
    const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
  };

  const counts = {
    gruins: terrains ? terrains.filter(t => t.type === 'gruin').length : 0,
    pruins: terrains ? terrains.filter(t => t.type === 'pruin').length : 0,
    forests: terrains ? terrains.filter(t => t.type === 'forest').length : 0,
    containers: terrains ? terrains.filter(t => t.type === 'container').length : 0
  };

  // Ne pas recalculer les erreurs pendant le drag pour éviter les re-renders
  const [cachedValidationErrors, setCachedValidationErrors] = useState([]);
  
  useEffect(() => {
    if (!isDragging) {
      setCachedValidationErrors(validateLayout());
    }
  }, [terrains, isDragging]);

  const validationErrors = isDragging ? cachedValidationErrors : validateLayout();

  if (!terrains || !Array.isArray(terrains)) {
    return (
      <div className="w-full min-h-screen bg-gray-900 text-white p-4 flex items-center justify-center">
        <div className="text-center bg-gray-800 p-8 rounded-lg">
          <p className="text-xl mb-4">Chargement...</p>
          <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 px-4 py-2 rounded">
            Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-2 sm:p-4 overflow-x-hidden">
      <div className="w-full max-w-[640px] mx-auto flex flex-col">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-center">
          Warhammer 40K - Gestionnaire de Layout
        </h1>

        <div className={`bg-gray-800 rounded-lg p-3 mb-3 ${isDragging ? 'pointer-events-none' : ''}`}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium mb-1">Layout</label>
              <select
                value={selectedLayout}
                onChange={(e) => loadLayout(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                <optgroup label="Layouts WTC">
                  {Object.keys(WTC_LAYOUTS).map(layout => (
                    <option key={layout} value={layout}>{layout}</option>
                  ))}
                </optgroup>
                {Object.keys(customLayouts).length > 0 && (
                  <optgroup label="Mes Layouts">
                    {Object.keys(customLayouts).map(layout => (
                      <option key={`custom-${layout}`} value={layout}>{layout}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Zone</label>
              <select
                value={deploymentZone}
                onChange={(e) => {
                  setDeploymentZone(e.target.value);
                  // Si le panneau LoS avancé est ouvert, réafficher les zones et masquer la grille
                  if (showAdvancedLoSConfig) {
                    setShowDeployment(true);
                    setShowGridPoints(false);
                    setGridClassification(null);
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm"
              >
                {Object.keys(DEPLOYMENT_ZONES).map(zone => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Ligne de boutons d'action */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              onClick={() => {
                // Cycler entre les 3 modes : masqué -> zones seules -> zones + objectifs -> masqué
                if (!showDeployment && !showObjectives) {
                  setShowDeployment(true);
                  setShowObjectives(false);
                } else if (showDeployment && !showObjectives) {
                  setShowDeployment(true);
                  setShowObjectives(true);
                } else {
                  setShowDeployment(false);
                  setShowObjectives(false);
                }
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs ${
                !showDeployment && !showObjectives ? 'bg-gray-600' : 
                showDeployment && !showObjectives ? 'bg-blue-600' : 'bg-orange-600'
              }`}
            >
              <Eye size={14} />
              <span>{!showDeployment && !showObjectives ? 'Zones' : showDeployment && !showObjectives ? 'Zones' : 'Zones+Obj'}</span>
            </button>
            <button
              onClick={() => {
                // Cycler entre les 3 modes : hidden -> classic -> feq -> hidden
                if (cornersMode === 'hidden') setCornersMode('classic');
                else if (cornersMode === 'classic') setCornersMode('feq');
                else setCornersMode('hidden');
              }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs ${
                cornersMode === 'hidden' ? 'bg-gray-600' : 
                cornersMode === 'classic' ? 'bg-yellow-500 text-black' : 'bg-blue-600'
              }`}
            >
              📐 <span>{cornersMode === 'hidden' ? 'Coins' : cornersMode === 'classic' ? 'Classique' : 'FEQ'}</span>
            </button>
            <button
              onClick={resetLoS}
              className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 px-2 py-1.5 rounded text-xs"
            >
              🔄 <span>LoS</span>
            </button>
            <button
              onClick={() => {
                setShowExportDialog(true);
                setShowAdvancedLoSConfig(false);
              }}
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 px-2 py-1.5 rounded text-xs"
            >
              📤 <span>Export</span>
            </button>
            <button
              onClick={() => {
                const newEditMode = !editMode;
                setEditMode(newEditMode);
                if (newEditMode) {
                  setShowGridPoints(false);
                  setShowVisiblePoints(false);
                  setShowVisibleSurfaces(false);
                  setShowAdvancedLoSConfig(false);
                } else {
                  setSelectedTerrain(null);
                }
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium ${
                editMode ? 'bg-green-600' : 'bg-purple-600'
              }`}
            >
              {editMode ? <Check size={14} /> : <Move size={14} />}
              <span>{editMode ? 'LoS' : 'Edit'}</span>
            </button>
            {!editMode && (
              <button
                onClick={() => setShowAdvancedLoSConfig(true)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded text-xs ${
                  advancedLoSMode ? 'bg-orange-600' : 'bg-gray-600'
                }`}
              >
                <Eye size={14} />
                <span>LoS+</span>
              </button>
            )}
            {editMode && (
              <button
                onClick={() => setShowGenerateConfig(true)}
                disabled={generating}
                className="flex items-center gap-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 px-2 py-1.5 rounded text-xs"
              >
                <Shuffle size={14} />
                <span>{generating ? '...' : 'Aléa'}</span>
              </button>
            )}
            <button
              onClick={() => {
                // Pré-remplir avec le nom du layout actuel sauf pour "Layout par défaut"
                if (selectedLayout !== "Layout par défaut") {
                  setLayoutNameInput(selectedLayout);
                } else {
                  setLayoutNameInput("");
                }
                setShowSaveDialog(true);
              }}
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-2 py-1.5 rounded text-xs"
            >
              💾 <span>Sauver</span>
            </button>
            {customLayouts[selectedLayout] && (
              <>
                <button
                  onClick={() => setShowRenameDialog(true)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-2 py-1.5 rounded text-xs"
                >
                  ✏️
                </button>
                <button
                  onClick={() => deleteLayout(selectedLayout)}
                  className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-2 py-1.5 rounded text-xs"
                >
                  🗑️
                </button>
              </>
            )}
            <button
              onClick={() => {
                setShowLayoutImportExport(true);
                setImportError('');
                setImportSuccess('');
              }}
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-700 px-2 py-1.5 rounded text-xs"
            >
              📋 <span>Fichier</span>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400">
            Layouts sauvegardés : {Object.keys(customLayouts).length} / {MAX_LAYOUTS}
          </div>

          <div className="mt-3 flex gap-3 text-xs flex-wrap">
            <span>🏛️ <strong>{counts.gruins}</strong></span>
            <span>🏚️ <strong>{counts.pruins}</strong></span>
            <span>🌲 <strong>{counts.forests}</strong></span>
            <span>📦 <strong>{counts.containers}</strong></span>
            <span className="text-gray-400">Total: {counts.gruins + counts.pruins + counts.forests + counts.containers}</span>
          </div>
        </div>

        {showSaveDialog && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-green-500">
            <h3 className="font-bold mb-3">💾 Sauvegarder le layout</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={layoutNameInput}
                onChange={(e) => setLayoutNameInput(e.target.value.slice(0, 24))}
                placeholder="Nom du layout (max 24 car.)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                maxLength={24}
              />
              <button onClick={saveCurrentLayout} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
                Sauvegarder
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setLayoutNameInput("");
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">{layoutNameInput.length}/24 caractères</p>
            {layoutNameInput.trim() && 
             layoutNameInput.trim() !== selectedLayout && 
             customLayouts[layoutNameInput.trim()] && (
              <div className="mt-2 p-2 bg-orange-900 border border-orange-500 rounded">
                <p className="text-xs text-orange-300">
                  ⚠️ Un layout nommé "{layoutNameInput.trim()}" existe déjà. 
                  Si vous continuez, il sera écrasé par le layout actuel.
                </p>
              </div>
            )}
          </div>
        )}

        {showRenameDialog && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-blue-500">
            <h3 className="font-bold mb-3">✏️ Renommer "{selectedLayout}"</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={layoutNameInput}
                onChange={(e) => setLayoutNameInput(e.target.value.slice(0, 24))}
                placeholder="Nouveau nom (max 24 car.)"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                maxLength={24}
              />
              <button onClick={renameLayout} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
                Renommer
              </button>
              <button
                onClick={() => {
                  setShowRenameDialog(false);
                  setLayoutNameInput("");
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">{layoutNameInput.length}/24 caractères</p>
          </div>
        )}

        {/* Dialogue d'import/export de layouts */}
        {showLayoutImportExport && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-purple-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">📋 Import / Export de fichier de layouts</h3>
              <button
                onClick={() => setShowLayoutImportExport(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Messages de succès/erreur */}
            {importError && (
              <div className="mb-4 p-3 bg-red-900 border border-red-500 rounded">
                <p className="text-sm text-red-300">{importError}</p>
              </div>
            )}
            {importSuccess && (
              <div className="mb-4 p-3 bg-green-900 border border-green-500 rounded">
                <p className="text-sm text-green-300">{importSuccess}</p>
              </div>
            )}
            
            {/* Section Export */}
            <div className="mb-6">
              <h4 className="font-medium mb-2 text-purple-300">📤 Exporter mes layouts</h4>
              <p className="text-sm text-gray-400 mb-3">
                Téléchargez tous vos layouts personnalisés ({Object.keys(customLayouts).length}) dans un fichier JSON.
              </p>
              <button
                onClick={exportLayoutsToJSON}
                disabled={Object.keys(customLayouts).length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded font-medium"
              >
                📤 Exporter {Object.keys(customLayouts).length} layout(s)
              </button>
            </div>
            
            {/* Séparateur */}
            <div className="border-t border-gray-600 my-4"></div>
            
            {/* Section Import */}
            <div>
              <h4 className="font-medium mb-2 text-purple-300">📥 Importer des layouts</h4>
              <p className="text-sm text-gray-400 mb-3">
                Chargez des layouts depuis un fichier JSON exporté précédemment.
              </p>
              
              {/* Mode d'import */}
              <div className="mb-3">
                <p className="text-xs text-gray-400 mb-2">Mode d'import :</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setImportMode('merge')}
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      importMode === 'merge' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    🔀 Fusionner
                  </button>
                  <button
                    onClick={() => setImportMode('replace')}
                    className={`flex-1 px-3 py-2 rounded text-sm ${
                      importMode === 'replace' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                  >
                    🔄 Remplacer
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {importMode === 'merge' 
                    ? 'Les nouveaux layouts seront ajoutés aux existants' 
                    : '⚠️ Tous les layouts existants seront supprimés'}
                </p>
              </div>
              
              {/* Input fichier */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={importLayoutsFromJSON}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded font-medium border-2 border-dashed border-gray-500"
              >
                📂 Choisir un fichier JSON
              </button>
            </div>
          </div>
        )}
        {showExportDialog && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-indigo-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">📤 Export</h3>
              <button
                onClick={() => setShowExportDialog(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            {/* Onglets */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setExportTab('image')}
                className={`flex-1 px-4 py-2 rounded font-medium ${
                  exportTab === 'image' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🖼️ Image PNG
              </button>
              <button
                onClick={() => setExportTab('pdf')}
                disabled={!advancedLoSResults}
                className={`flex-1 px-4 py-2 rounded font-medium ${
                  exportTab === 'pdf' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'
                } ${!advancedLoSResults ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                📄 Rapport PDF
              </button>
            </div>
            
            {/* Contenu onglet Image */}
            {exportTab === 'image' && (
              <div>
                <p className="text-sm text-gray-400 mb-3">Options d'affichage :</p>
                <div className="space-y-2 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportShowClassicCoords}
                      onChange={(e) => {
                        setExportShowClassicCoords(e.target.checked);
                        if (e.target.checked) setExportShowFEQCoords(false);
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Coordonnées mode Classique</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportShowFEQCoords}
                      onChange={(e) => {
                        setExportShowFEQCoords(e.target.checked);
                        if (e.target.checked) setExportShowClassicCoords(false);
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Coordonnées mode FEQ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportShowDeployment}
                      onChange={(e) => setExportShowDeployment(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Zones de déploiement</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportShowObjectives}
                      onChange={(e) => setExportShowObjectives(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Objectifs</span>
                  </label>
                  {advancedLoSResults && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportShowSurfaces}
                        onChange={(e) => setExportShowSurfaces(e.target.checked)}
                        className="w-4 h-4 rounded"
                      />
                      <span className="text-sm">Surfaces LoS</span>
                    </label>
                  )}
                </div>
                <button
                  onClick={exportPNG}
                  disabled={exportGenerating}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 px-4 py-2 rounded font-medium"
                >
                  {exportGenerating ? '⏳ Génération...' : '📥 Télécharger PNG'}
                </button>
              </div>
            )}
            
            {/* Contenu onglet PDF */}
            {exportTab === 'pdf' && (
              <div>
                {advancedLoSResults ? (
                  <>
                    <p className="text-sm text-gray-400 mb-3">Le rapport inclura :</p>
                    <ul className="text-sm space-y-1 mb-4 list-disc list-inside text-gray-300">
                      <li>Vue du layout avec zones de déploiement et coordonnées FEQ</li>
                      <li>Hypothèses de calcul (résolution, paramètres)</li>
                      <li>Carte des surfaces visibles/non visibles</li>
                      <li>Statistiques de visibilité détaillées</li>
                    </ul>
                    <button
                      onClick={exportPDF}
                      disabled={exportGenerating}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 px-4 py-2 rounded font-medium"
                    >
                      {exportGenerating ? '⏳ Génération...' : '📥 Télécharger PDF'}
                    </button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-2">⚠️ Aucun résultat de calcul LoS disponible</p>
                    <p className="text-sm text-gray-500">Effectuez d'abord un calcul avancé de lignes de vue pour générer un rapport.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showGenerateConfig && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-yellow-500">
            <h3 className="font-bold mb-3">🎲 Configuration de la génération aléatoire</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">🏛️ Grandes Ruines (0-8)</label>
                <select
                  value={configGruin}
                  onChange={(e) => setConfigGruin(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {[0, 2, 4, 6, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">🏚️ Petites Ruines (0-8)</label>
                <select
                  value={configPruin}
                  onChange={(e) => setConfigPruin(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {[0, 2, 4, 6, 8].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">🌲 Forêts (0-4)</label>
                <select
                  value={configForest}
                  onChange={(e) => setConfigForest(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {[0, 2, 4].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">📦 Containers (0-4)</label>
                <select
                  value={configContainer}
                  onChange={(e) => setConfigContainer(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  {[0, 2, 4].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-4 p-2 bg-gray-700 rounded">
              <p className="text-sm">
                <strong>Total ruines :</strong> {configGruin + configPruin}/12 
                {configGruin + configPruin > 12 && <span className="text-red-400 ml-2">⚠️ Maximum dépassé !</span>}
              </p>
              <p className="text-sm">
                <strong>Total décors :</strong> {configGruin + configPruin + configForest + configContainer}
              </p>
            </div>
            
            {generateError && (
              <div className="bg-red-900 rounded p-3 mb-4">
                <p className="font-bold mb-1">⚠️ Erreurs de configuration :</p>
                <ul className="text-sm list-disc list-inside">
                  {generateError.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={startGeneration}
                className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded font-bold"
              >
                🎲 Générer
              </button>
              <button
                onClick={() => {
                  setShowGenerateConfig(false);
                  setGenerateError(null);
                }}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {showAdvancedLoSConfig && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 border-2 border-orange-500">
            <h3 className="font-bold mb-3">🎯 Configuration du Mode LoS Avancé</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">Résolution de la grille</label>
                <select
                  value={losResolution}
                  onChange={(e) => setLosResolution(Number(e.target.value))}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value={1}>1" (rapide, ~2 600 points)</option>
                  <option value={0.5}>0.5" (équilibré, ~10 500 points)</option>
                  <option value={0.25}>0.25" (précis, ~42 000 points)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Déploiement dans les décors (Zone J1)</label>
                <select
                  value={excludeTerrainPoints ? 'exclude' : 'include'}
                  onChange={(e) => setExcludeTerrainPoints(e.target.value === 'exclude')}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                >
                  <option value="exclude">Non (exclure les points dans les décors)</option>
                  <option value="include">Oui (inclure les points dans les décors)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {excludeTerrainPoints 
                    ? "Les figurines du J1 ne se déploient pas dans les décors" 
                    : "Les figurines du J1 peuvent se déployer dans les décors"}
                </p>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-gray-700 rounded">
              <p className="text-sm font-medium mb-2">📊 Aperçu de la classification :</p>
              {(() => {
                const classification = classifyGridPoints(losResolution);
                const { sourcePoints, targetPointsNML, targetPointsZ2 } = getLoSPointSets(classification);
                const segmentCounts = countLoSSegments(sourcePoints, targetPointsNML, targetPointsZ2);
                
                // Stats détaillées
                const allZone1 = [...classification.zone1Only, ...classification.zone1AndNoManLand];
                const zone1InContainer = allZone1.filter(p => p.inContainer).length;
                const zone1InTerrain = allZone1.filter(p => p.inTerrain && !p.inContainer).length;
                
                return (
                  <div className="text-sm space-y-1">
                    <p>• <span className="text-red-400">Points sources (Zone J1)</span> : {sourcePoints.length} points
                      {zone1InContainer > 0 && <span className="text-orange-400 ml-1">(-{zone1InContainer} containers)</span>}
                      {excludeTerrainPoints && zone1InTerrain > 0 && <span className="text-amber-700 ml-1">(-{zone1InTerrain} décors)</span>}
                    </p>
                    <p>• <span className="text-gray-300">Cibles No Man's Land</span> : {targetPointsNML.length} points</p>
                    <p>• <span className="text-green-400">Cibles Zone J2</span> : {targetPointsZ2.length} points</p>
                    <p className="text-gray-400 mt-2 pt-2 border-t border-gray-600">
                      <strong>Segments à calculer :</strong>
                    </p>
                    <p className="text-gray-400">
                      • Vers NML : {segmentCounts.segmentsToNML.toLocaleString()}
                    </p>
                    <p className="text-gray-400">
                      • Vers Zone J2 : {segmentCounts.segmentsToZ2.toLocaleString()}
                    </p>
                    <p className="text-white font-bold">
                      • Total : {segmentCounts.total.toLocaleString()} segments
                    </p>
                  </div>
                );
              })()}
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  if (advancedLoSCalculating) {
                    // Annuler le calcul en cours
                    losCalculationCancelledRef.current = true;
                  } else {
                    // Lancer un nouveau calcul
                    setAdvancedLoSResults(null);
                    setShowVisiblePoints(false);
                    
                    if (!gridClassification) {
                      updateGridClassification();
                    }
                    calculateAdvancedLoS();
                  }
                }}
                className={`px-4 py-2 rounded font-bold ${
                  advancedLoSCalculating 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {advancedLoSCalculating ? `⛔ Arrêter (${advancedLoSProgress}%)` : '🔬 Calculer LoS'}
              </button>
              <button
                onClick={() => {
                  if (!showGridPoints) {
                    updateGridClassification();
                    setShowVisiblePoints(false);
                    setShowVisibleSurfaces(false);
                  }
                  setShowGridPoints(!showGridPoints);
                }}
                className={`px-4 py-2 rounded font-bold ${
                  showGridPoints ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {showGridPoints ? '👁️ Masquer grille' : '👁️ Afficher grille'}
              </button>
              {advancedLoSResults && (
                <button
                  onClick={() => {
                    if (!showVisiblePoints) {
                      setShowGridPoints(false);
                      setShowVisibleSurfaces(false);
                    }
                    setShowVisiblePoints(!showVisiblePoints);
                  }}
                  className={`px-4 py-2 rounded font-bold ${
                    showVisiblePoints ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {showVisiblePoints ? '🎯 Masquer points' : '🎯 Afficher points'}
                </button>
              )}
              {advancedLoSResults && (
                <button
                  onClick={() => {
                    if (!showVisibleSurfaces) {
                      setShowGridPoints(false);
                      setShowVisiblePoints(false);
                    }
                    setShowVisibleSurfaces(!showVisibleSurfaces);
                  }}
                  className={`px-4 py-2 rounded font-bold ${
                    showVisibleSurfaces ? 'bg-teal-600 hover:bg-teal-700' : 'bg-gray-600 hover:bg-gray-700'
                  }`}
                >
                  {showVisibleSurfaces ? '🗺️ Masquer surfaces' : '🗺️ Afficher surfaces'}
                </button>
              )}
              <button
                onClick={() => setShowDeployment(!showDeployment)}
                className={`px-4 py-2 rounded font-bold ${
                  showDeployment ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {showDeployment ? '🗺️ Masquer zones' : '🗺️ Afficher zones'}
              </button>
              {advancedLoSMode && (
                <button
                  onClick={() => {
                    setAdvancedLoSMode(false);
                    setShowAdvancedLoSConfig(false);
                    setShowGridPoints(false);
                    setShowVisiblePoints(false);
                    setShowVisibleSurfaces(false);
                    resetAdvancedLoS();
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Désactiver
                </button>
              )}
              <button
                onClick={() => setShowAdvancedLoSConfig(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
              >
                Fermer
              </button>
            </div>
            
            {/* Barre de progression */}
            {advancedLoSCalculating && (
              <div className="mt-4">
                <div className="bg-gray-600 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-green-500 h-full transition-all duration-300"
                    style={{ width: `${advancedLoSProgress}%` }}
                  />
                </div>
                <p className="text-sm text-center mt-1">Calcul en cours... {advancedLoSProgress}%</p>
              </div>
            )}
            
            {/* Résultats du calcul */}
            {advancedLoSResults && !advancedLoSCalculating && (
              <div className="mt-4 p-3 bg-gray-700 rounded border-2 border-green-500">
                <p className="text-sm font-bold mb-2">📈 Résultats du calcul LoS :</p>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">No Man's Land visible :</span>
                    <span className="font-bold">
                      {advancedLoSResults.statsNML.visible} / {advancedLoSResults.statsNML.total} points
                      <span className={`ml-2 px-2 py-1 rounded ${
                        advancedLoSResults.statsNML.percent >= 70 ? 'bg-green-600' :
                        advancedLoSResults.statsNML.percent >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {advancedLoSResults.statsNML.percent}%
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-400">Zone J2 visible :</span>
                    <span className="font-bold">
                      {advancedLoSResults.statsZ2.visible} / {advancedLoSResults.statsZ2.total} points
                      <span className={`ml-2 px-2 py-1 rounded ${
                        advancedLoSResults.statsZ2.percent >= 70 ? 'bg-green-600' :
                        advancedLoSResults.statsZ2.percent >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                      }`}>
                        {advancedLoSResults.statsZ2.percent}%
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {showGridPoints && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-sm font-medium mb-2">🎨 Légende des couleurs :</p>
                <div className="flex gap-3 text-xs flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Zone J1
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span> No Man's Land
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Zone J2
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 border-2 border-purple-500 inline-block"></span> Frontière J1/NML
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 border-2 border-purple-500 inline-block"></span> Frontière J2/NML
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-amber-700 inline-block"></span> Décor + Zone J1
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Décor (autres)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Container
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-gray-500 border-2 border-black inline-block"></span> Exclu
                  </span>
                </div>
              </div>
            )}
            
            {showVisiblePoints && advancedLoSResults && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-sm font-medium mb-2">🎯 Légende des points visibles :</p>
                <div className="flex gap-4 text-xs flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Visible (NML)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Visible (Zone J2)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Non visible
                  </span>
                </div>
              </div>
            )}
            
            {showVisibleSurfaces && advancedLoSResults && (
              <div className="mt-4 p-3 bg-gray-700 rounded">
                <p className="text-sm font-medium mb-2">🗺️ Légende des surfaces :</p>
                <div className="flex gap-4 text-xs flex-wrap">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-3 bg-green-500 bg-opacity-50 inline-block"></span> NML visible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-3 bg-red-500 bg-opacity-40 inline-block"></span> NML non visible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-3 bg-emerald-500 bg-opacity-60 inline-block"></span> Zone J2 visible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-3 bg-red-600 bg-opacity-50 inline-block"></span> Zone J2 non visible
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {saveDebugInfo && (
          <div className={`rounded-lg p-4 mb-4 border-4 ${saveDebugInfo.success ? 'bg-green-900 border-green-500' : 'bg-red-900 border-red-500'}`}>
            <h3 className="font-bold text-xl mb-4">
              {saveDebugInfo.success ? '✅ Sauvegarde Réussie' : '❌ Problème'}
            </h3>
            <div className="space-y-3 text-sm font-mono bg-gray-950 p-3 rounded">
              <div className="whitespace-pre-wrap">{saveDebugInfo.step1}</div>
              {saveDebugInfo.step4 && <div className="whitespace-pre-wrap border-t border-gray-700 pt-2">{saveDebugInfo.step4}</div>}
              {saveDebugInfo.error && <div className="whitespace-pre-wrap border-t border-red-500 pt-2 text-red-400">{saveDebugInfo.error}</div>}
            </div>
            <button
              onClick={() => setSaveDebugInfo(null)}
              className="mt-4 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg font-bold w-full"
            >
              Fermer
            </button>
          </div>
        )}

        <div className={isDragging ? 'invisible' : 'visible'}>
          {validationErrors.length > 0 && (
            <div className="bg-red-900 rounded-lg p-3 mb-3">
              <h3 className="font-bold mb-1 text-sm">⚠️ Erreurs :</h3>
              <ul className="text-xs list-disc list-inside">
                {validationErrors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          {optimizing && (
            <div className="bg-blue-900 rounded-lg p-3 mb-3">
              <p className="font-bold text-sm">🧲 Optimisation en cours...</p>
            </div>
          )}
        </div>

        <div className={isDragging ? 'invisible h-0 overflow-hidden' : ''}>
        {editMode && selectedTerrain && terrains && (() => {
          const currentTerrain = terrains.find(t => t.id === selectedTerrain.id);
          if (!currentTerrain) return null;
          
          const corners = getRotatedCorners(currentTerrain);
          const isContainer = currentTerrain.type === 'container';
          const moveStepPixels = isContainer ? containerMoveStep * SCALE : SCALE; // 0.5" ou 1" pour containers, 1" pour autres
          
          // Calculer les positions extrêmes des coins du décor sélectionné
          const minY = Math.min(...corners.map(c => c.y));
          const maxY = Math.max(...corners.map(c => c.y));
          const minX = Math.min(...corners.map(c => c.x));
          const maxX = Math.max(...corners.map(c => c.x));
          
          // Vérifier aussi le décor symétrique (qui bouge en sens inverse)
          const symmetricTerrain = terrains.find(t => t.id === currentTerrain.symmetricId);
          let symMinY = 0, symMaxY = 44 * SCALE, symMinX = 0, symMaxX = 60 * SCALE;
          
          if (symmetricTerrain) {
            const symCorners = getRotatedCorners(symmetricTerrain);
            symMinY = Math.min(...symCorners.map(c => c.y));
            symMaxY = Math.max(...symCorners.map(c => c.y));
            symMinX = Math.min(...symCorners.map(c => c.x));
            symMaxX = Math.max(...symCorners.map(c => c.x));
          }
          
          // Vérifier si on peut bouger sans sortir de la table (0-60" en X, 0-44" en Y)
          // Le décor sélectionné bouge de +delta, le symétrique de -delta
          // Tolérance pour les erreurs d'arrondi des nombres flottants
          const epsilon = 0.001;
          const canMoveUp = (minY - moveStepPixels) >= -epsilon && (symMaxY + moveStepPixels) <= (44 * SCALE) + epsilon;
          const canMoveDown = (maxY + moveStepPixels) <= (44 * SCALE) + epsilon && (symMinY - moveStepPixels) >= -epsilon;
          const canMoveLeft = (minX - moveStepPixels) >= -epsilon && (symMaxX + moveStepPixels) <= (60 * SCALE) + epsilon;
          const canMoveRight = (maxX + moveStepPixels) <= (60 * SCALE) + epsilon && (symMinX - moveStepPixels) >= -epsilon;
          
          const canRotateClockwise = (() => {
            const rotated = { ...currentTerrain, rotation: (currentTerrain.rotation + 15) % 360 };
            const snapped = snapTerrainToGridAfterRotation(rotated);
            return isTerrainInBounds(snapped);
          })();
          
          const canRotateCounterClockwise = (() => {
            const rotated = { ...currentTerrain, rotation: (currentTerrain.rotation - 15) % 360 };
            const snapped = snapTerrainToGridAfterRotation(rotated);
            return isTerrainInBounds(snapped);
          })();
          
          return (
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">Édition : {currentTerrain.name}</h3>
                <button
                  onClick={optimizeAllTerrains}
                  disabled={optimizing}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-3 py-2 rounded text-sm"
                >
                  🧲 Optimiser tout
                </button>
              </div>
              
              {/* Sélecteur de mode d'édition */}
              <div className="mb-4 p-2 bg-gray-700 rounded">
                <p className="text-xs text-gray-400 mb-2">Mode d'édition :</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditMethod('buttons'); resetFinePosition(); }}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium ${
                      editMethod === 'buttons' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    🎛️ Boutons
                  </button>
                  <button
                    onClick={() => { setEditMethod('drag'); resetFinePosition(); }}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium ${
                      editMethod === 'drag' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    ✋ Glisser
                  </button>
                  <button
                    onClick={() => { setEditMethod('fine'); resetFinePosition(); setFinePositionStep(selectedTerrain ? 2 : 1); }}
                    className={`flex-1 px-2 py-2 rounded text-xs font-medium ${
                      editMethod === 'fine' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    📍 Précis
                  </button>
                </div>
                {editMethod === 'drag' && (
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Faites glisser le décor. Il s'aimantera aux décors proches.
                  </p>
                )}
              </div>
              
              {/* Interface du mode positionnement fin */}
              {editMethod === 'fine' && (
                <div className="mb-4 p-3 bg-gray-700 rounded border-2 border-blue-500">
                  <p className="text-sm font-bold mb-2">📍 Positionnement précis</p>
                  
                  {/* Message d'erreur */}
                  {finePositionError && (
                    <div className="mb-2 p-2 bg-red-900 border border-red-500 rounded">
                      <p className="text-xs text-red-300">⚠️ {finePositionError}</p>
                    </div>
                  )}
                  
                  {/* Étape 1 : Sélectionner un décor */}
                  {finePositionStep === 1 && (
                    <div className="text-sm">
                      <p className="text-yellow-400">Étape 1/5 : Sélectionnez un décor sur la table</p>
                    </div>
                  )}
                  
                  {/* Étape 2 : Sélectionner un coin */}
                  {finePositionStep === 2 && (
                    <div className="text-sm">
                      <p className="text-yellow-400">Étape 2/5 : Cliquez sur un coin du décor</p>
                      <p className="text-xs text-gray-400 mt-1">Les coins sont affichés en cyan sur le décor sélectionné.</p>
                    </div>
                  )}
                  
                  {/* Étape 3 : Entrer les coordonnées */}
                  {finePositionStep === 3 && (
                    <div className="text-sm">
                      <p className="text-yellow-400 mb-2">Étape 3/5 : Coordonnées du coin {finePositionCorner1 + 1}</p>
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <label className="text-xs text-gray-400">X (pouces)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="60"
                            value={finePositionX}
                            onChange={(e) => { setFinePositionX(e.target.value); setFinePositionError(''); }}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="0.0"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-xs text-gray-400">Y (pouces)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="44"
                            value={finePositionY}
                            onChange={(e) => { setFinePositionY(e.target.value); setFinePositionError(''); }}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                            placeholder="0.0"
                          />
                        </div>
                      </div>
                      <button
                        onClick={applyFinePositionTranslation}
                        disabled={!finePositionX || !finePositionY}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 px-3 py-2 rounded text-sm font-medium"
                      >
                        ✓ Appliquer la translation
                      </button>
                    </div>
                  )}
                  
                  {/* Étape 4 : Sélectionner un deuxième coin */}
                  {finePositionStep === 4 && (
                    <div className="text-sm">
                      <p className="text-green-400 mb-2">✓ Translation appliquée !</p>
                      <p className="text-yellow-400">Étape 4/5 : Cliquez sur un autre coin pour la rotation</p>
                      <p className="text-xs text-gray-400 mt-1">Ou cliquez sur "Terminer" si vous ne souhaitez pas de rotation.</p>
                      <button
                        onClick={resetFinePosition}
                        className="mt-2 w-full bg-gray-600 hover:bg-gray-500 px-3 py-2 rounded text-sm"
                      >
                        Terminer sans rotation
                      </button>
                    </div>
                  )}
                  
                  {/* Étape 5 : Entrer la coordonnée pour la rotation */}
                  {finePositionStep === 5 && (
                    <div className="text-sm">
                      <p className="text-yellow-400 mb-2">Étape 5/5 : Rotation - Coin {finePositionCorner2 + 1}</p>
                      <div className="mb-2">
                        <label className="text-xs text-gray-400">Axe à caler :</label>
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => { setFinePositionAxis('X'); setFinePositionError(''); }}
                            className={`flex-1 px-2 py-1 rounded text-sm ${
                              finePositionAxis === 'X' ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            X
                          </button>
                          <button
                            onClick={() => { setFinePositionAxis('Y'); setFinePositionError(''); }}
                            className={`flex-1 px-2 py-1 rounded text-sm ${
                              finePositionAxis === 'Y' ? 'bg-blue-600' : 'bg-gray-600'
                            }`}
                          >
                            Y
                          </button>
                        </div>
                      </div>
                      <div className="mb-2">
                        <label className="text-xs text-gray-400">{finePositionAxis} du coin {finePositionCorner2 + 1} (pouces)</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max={finePositionAxis === 'X' ? 60 : 44}
                          value={finePositionValue}
                          onChange={(e) => { setFinePositionValue(e.target.value); setFinePositionError(''); }}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm"
                          placeholder="0.0"
                        />
                      </div>
                      <button
                        onClick={applyFinePositionRotation}
                        disabled={!finePositionValue}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 px-3 py-2 rounded text-sm font-medium"
                      >
                        ✓ Appliquer la rotation
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {editMethod === 'buttons' && (
              <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm mb-2">Rotation :</p>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => rotateTerrain(currentTerrain.id, -15)}
                      disabled={!canRotateCounterClockwise}
                      className={`px-3 py-2 rounded ${
                        canRotateCounterClockwise ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      -15°
                    </button>
                    <button
                      onClick={() => rotateTerrain(currentTerrain.id, -5)}
                      disabled={!canRotateCounterClockwise}
                      className={`px-3 py-2 rounded ${
                        canRotateCounterClockwise ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      -5°
                    </button>
                    <button
                      onClick={() => {
                        setTerrains(prevTerrains => {
                          return prevTerrains.map(t => {
                            if (t.id === currentTerrain.id) {
                              return { ...t, rotation: 0 };
                            } else if (t.id === currentTerrain.symmetricId) {
                              return { ...t, rotation: 180 };
                            }
                            return t;
                          });
                        });
                      }}
                      className="px-3 py-2 rounded bg-green-600 hover:bg-green-700"
                      title="Réinitialiser à 0° (symétrique à 180°)"
                    >
                      0°
                    </button>
                    <button
                      onClick={() => rotateTerrain(currentTerrain.id, 5)}
                      disabled={!canRotateClockwise}
                      className={`px-3 py-2 rounded ${
                        canRotateClockwise ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      +5°
                    </button>
                    <button
                      onClick={() => rotateTerrain(currentTerrain.id, 15)}
                      disabled={!canRotateClockwise}
                      className={`px-3 py-2 rounded ${
                        canRotateClockwise ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      +15°
                    </button>
                    <span className="flex items-center px-3 bg-gray-700 rounded">
                      {currentTerrain.rotation.toFixed(2)}°
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-2">Translation {isContainer ? `(${containerMoveStep}")` : '(1")'}:</p>
                  <div className="grid grid-cols-3 gap-1 w-32">
                    <div></div>
                    <button
                      onClick={() => translateTerrain(currentTerrain.id, 0, -moveStepPixels)}
                      disabled={!canMoveUp}
                      className={`p-2 rounded flex items-center justify-center ${
                        canMoveUp ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <div></div>
                    <button
                      onClick={() => translateTerrain(currentTerrain.id, -moveStepPixels, 0)}
                      disabled={!canMoveLeft}
                      className={`p-2 rounded flex items-center justify-center ${
                        canMoveLeft ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div className="bg-gray-700 rounded flex items-center justify-center">
                      <Move size={16} />
                    </div>
                    <button
                      onClick={() => translateTerrain(currentTerrain.id, moveStepPixels, 0)}
                      disabled={!canMoveRight}
                      className={`p-2 rounded flex items-center justify-center ${
                        canMoveRight ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ArrowRight size={16} />
                    </button>
                    <div></div>
                    <button
                      onClick={() => translateTerrain(currentTerrain.id, 0, moveStepPixels)}
                      disabled={!canMoveDown}
                      className={`p-2 rounded flex items-center justify-center ${
                        canMoveDown ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <ArrowDown size={16} />
                    </button>
                    <div></div>
                  </div>
                </div>
              </div>
              {isContainer && (
                <div className="mt-4">
                  <p className="text-sm mb-2">Pas de déplacement :</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContainerMoveStep(1)}
                      className={`px-4 py-2 rounded ${
                        containerMoveStep === 1 ? 'bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      1"
                    </button>
                    <button
                      onClick={() => setContainerMoveStep(0.5)}
                      className={`px-4 py-2 rounded ${
                        containerMoveStep === 0.5 ? 'bg-orange-600' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      0.5"
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                ℹ️ Modifications appliquées au décor symétrique
              </p>
              </>
              )}
              
              {(currentTerrain.type === 'gruin' || currentTerrain.type === 'pruin') && (
                <div className="mt-3 pt-3 border-t border-gray-600">
                  <p className="text-sm mb-2">Changer le type de ruine :</p>
                  <button
                    onClick={() => {
                      const newType = currentTerrain.type === 'gruin' ? 'pruin' : 'gruin';
                      const newLabel = newType === 'gruin' ? 'Grande Ruine' : 'Petite Ruine';
                      
                      setTerrains(prevTerrains => {
                        return prevTerrains.map(t => {
                          if (t.id === currentTerrain.id) {
                            // Extraire le numéro du nom actuel
                            const match = t.name.match(/(\d+)('?)$/);
                            const num = match ? match[1] : '1';
                            const prime = match ? match[2] : '';
                            return { ...t, type: newType, name: `${newLabel} ${num}${prime}` };
                          } else if (t.id === currentTerrain.symmetricId) {
                            const match = t.name.match(/(\d+)('?)$/);
                            const num = match ? match[1] : '1';
                            const prime = match ? match[2] : '';
                            return { ...t, type: newType, name: `${newLabel} ${num}${prime}` };
                          }
                          return t;
                        });
                      });
                      
                      // Mettre à jour le terrain sélectionné
                      setSelectedTerrain(prev => ({ ...prev, type: newType }));
                      
                      // Invalider les résultats LoS pour ce layout
                      invalidateLoSResultsForLayout(selectedLayout);
                    }}
                    className={`px-4 py-2 rounded font-bold ${
                      currentTerrain.type === 'gruin' 
                        ? 'bg-gray-500 hover:bg-gray-600' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    {currentTerrain.type === 'gruin' ? '🏚️ Convertir en Petite Ruine' : '🏛️ Convertir en Grande Ruine'}
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {losResult && !editMode && (
          <div className={`rounded-lg p-4 mb-4 ${losResult.blocked ? 'bg-red-900' : 'bg-green-900'}`}>
            <h3 className="font-bold text-lg mb-2">
              {losResult.blocked ? '🚫 BLOQUÉE' : '✅ DÉGAGÉE'}
            </h3>
            {losResult.blocked && <p>Par : {losResult.blockingTerrain}</p>}
            <p>Distance : {(losResult.distance / SCALE).toFixed(1)}"</p>
          </div>
        )}
        </div>

        {/* Bouton de reset zoom si zoomé */}
        {(userZoom !== 1 || panOffset.x !== 0 || panOffset.y !== 0) && (
          <button
            onClick={resetZoomAndPan}
            className="mb-2 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm flex items-center gap-2"
          >
            🔍 Réinitialiser le zoom ({Math.round(userZoom * 100)}%)
          </button>
        )}

        <div 
          ref={tableContainerRef} 
          className="bg-gray-700 rounded-lg p-2 overflow-hidden"
          onTouchStart={handlePinchStart}
          onTouchMove={(e) => {
            if (e.touches.length === 2) {
              handlePinchMove(e);
            } else if (editMethod === 'drag' && e.touches.length === 1 && !isPinching) {
              handleDragMove(e);
            }
          }}
          onTouchEnd={(e) => {
            handlePinchEnd(e);
            if (editMethod === 'drag') {
              handleDragEnd(e);
            }
          }}
          onTouchCancel={handlePinchEnd}
        >
          <div 
            className="origin-top-left"
            style={{
              width: TABLE_WIDTH * tableScale * userZoom,
              height: TABLE_HEIGHT * tableScale * userZoom,
              transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
          >
          <div
            className="relative bg-gray-600 border-4 border-yellow-600"
            style={{
              width: TABLE_WIDTH,
              height: TABLE_HEIGHT,
              transform: `scale(${tableScale * userZoom})`,
              transformOrigin: 'top left',
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '10px 10px',
              cursor: editMode ? (editMethod === 'drag' ? (isDragging ? 'grabbing' : 'default') : 'default') : 'crosshair',
              touchAction: 'none'
            }}
            onClick={handleTableClick}
            onMouseMove={editMethod === 'drag' ? handleDragMove : undefined}
            onMouseUp={editMethod === 'drag' ? handleDragEnd : undefined}
            onMouseLeave={editMethod === 'drag' ? handleDragEnd : undefined}
          >
            {/* Définition du marker pour les flèches FEQ */}
            <svg className="absolute" width="0" height="0">
              <defs>
                <marker
                  id="arrowhead-feq"
                  markerWidth="6"
                  markerHeight="4"
                  refX="5"
                  refY="2"
                  orient="auto"
                >
                  <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
            
            {/* Lignes de centre en pointillés */}
            <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 0 }}>
              {/* Ligne verticale (30;0) à (30;44) */}
              <line
                x1={30 * SCALE}
                y1={0}
                x2={30 * SCALE}
                y2={44 * SCALE}
                stroke="rgba(200, 200, 200, 0.5)"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
              {/* Ligne horizontale (0;22) à (60;22) */}
              <line
                x1={0}
                y1={22 * SCALE}
                x2={60 * SCALE}
                y2={22 * SCALE}
                stroke="rgba(200, 200, 200, 0.5)"
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            </svg>

            {showDeployment && DEPLOYMENT_ZONES[deploymentZone] && (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 1 }}>
                {DEPLOYMENT_ZONES[deploymentZone].player1.type === 'polygon' ? (
                  <polygon
                    points={DEPLOYMENT_ZONES[deploymentZone].player1.points.map(p => `${p.x * SCALE},${p.y * SCALE}`).join(' ')}
                    fill="rgba(139, 0, 0, 0.25)"
                    stroke="rgba(139, 0, 0, 0.8)"
                    strokeWidth="3"
                  />
                ) : (
                  <path
                    d={DEPLOYMENT_ZONES[deploymentZone].player1.d(SCALE)}
                    fill="rgba(139, 0, 0, 0.25)"
                    stroke="rgba(139, 0, 0, 0.8)"
                    strokeWidth="3"
                  />
                )}
                {DEPLOYMENT_ZONES[deploymentZone].player2.type === 'polygon' ? (
                  <polygon
                    points={DEPLOYMENT_ZONES[deploymentZone].player2.points.map(p => `${p.x * SCALE},${p.y * SCALE}`).join(' ')}
                    fill="rgba(144, 238, 144, 0.25)"
                    stroke="rgba(34, 139, 34, 0.8)"
                    strokeWidth="3"
                  />
                ) : (
                  <path
                    d={DEPLOYMENT_ZONES[deploymentZone].player2.d(SCALE)}
                    fill="rgba(144, 238, 144, 0.25)"
                    stroke="rgba(34, 139, 34, 0.8)"
                    strokeWidth="3"
                  />
                )}
              </svg>
            )}

            {/* Affichage des objectifs */}
            {showObjectives && OBJECTIVES[deploymentZone] && (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 2 }}>
                {OBJECTIVES[deploymentZone].map((obj, idx) => (
                  <React.Fragment key={`objective-${idx}`}>
                    {/* Cercle extérieur - zone de contrôle (20mm + 3") */}
                    <circle
                      cx={obj.x * SCALE}
                      cy={obj.y * SCALE}
                      r={OBJECTIVE_OUTER_RADIUS * SCALE}
                      fill="rgba(168, 85, 247, 0.15)"
                      stroke="rgba(168, 85, 247, 0.6)"
                      strokeWidth="2"
                      strokeDasharray="4,2"
                    />
                    {/* Cercle intérieur - pion d'objectif (40mm diamètre) */}
                    <circle
                      cx={obj.x * SCALE}
                      cy={obj.y * SCALE}
                      r={OBJECTIVE_INNER_RADIUS * SCALE}
                      fill="rgba(168, 85, 247, 0.4)"
                      stroke="rgba(168, 85, 247, 0.9)"
                      strokeWidth="2"
                    />
                  </React.Fragment>
                ))}
              </svg>
            )}

            {/* Affichage des points de la grille pour le mode LoS avancé */}
            {showGridPoints && gridClassification && (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 2 }}>
                {/* Points du No Man's Land uniquement (en gris) */}
                {gridClassification.noManLandOnly.map((point, idx) => (
                  <circle
                    key={`nml-${idx}`}
                    cx={point.x * SCALE}
                    cy={point.y * SCALE}
                    r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                    fill={point.inContainer ? "rgba(249, 115, 22, 0.9)" : point.inTerrain ? "rgba(234, 179, 8, 0.8)" : "rgba(156, 163, 175, 0.6)"}
                  />
                ))}
                {/* Points de la Zone 2 uniquement (en vert) */}
                {gridClassification.zone2Only.map((point, idx) => (
                  <circle
                    key={`z2-${idx}`}
                    cx={point.x * SCALE}
                    cy={point.y * SCALE}
                    r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                    fill={point.inContainer ? "rgba(249, 115, 22, 0.9)" : point.inTerrain ? "rgba(234, 179, 8, 0.8)" : "rgba(34, 197, 94, 0.8)"}
                  />
                ))}
                {/* Points Zone 2 + No Man's Land (frontière - en vert/violet) */}
                {gridClassification.zone2AndNoManLand.map((point, idx) => (
                  <circle
                    key={`z2nml-${idx}`}
                    cx={point.x * SCALE}
                    cy={point.y * SCALE}
                    r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                    fill={point.inContainer ? "rgba(249, 115, 22, 0.9)" : point.inTerrain ? "rgba(234, 179, 8, 0.8)" : "rgba(34, 197, 94, 0.8)"}
                    stroke="rgba(168, 85, 247, 0.9)"
                    strokeWidth={losResolution === 0.25 ? 1 : 1.5}
                  />
                ))}
                {/* Points de la Zone 1 uniquement (en rouge) */}
                {gridClassification.zone1Only.map((point, idx) => {
                  const isInTerrainZone1 = point.inTerrain && !point.inContainer;
                  const isExcluded = excludeTerrainPoints && point.inTerrain && !point.inContainer;
                  return (
                    <circle
                      key={`z1-${idx}`}
                      cx={point.x * SCALE}
                      cy={point.y * SCALE}
                      r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                      fill={point.inContainer ? "rgba(249, 115, 22, 0.9)" : isInTerrainZone1 ? "rgba(180, 83, 9, 0.9)" : "rgba(239, 68, 68, 0.8)"}
                      stroke={isExcluded ? "rgba(0, 0, 0, 0.8)" : "none"}
                      strokeWidth={isExcluded ? 1.5 : 0}
                    />
                  );
                })}
                {/* Points Zone 1 + No Man's Land (frontière - en rouge/violet) */}
                {gridClassification.zone1AndNoManLand.map((point, idx) => {
                  const isInTerrainZone1 = point.inTerrain && !point.inContainer;
                  const isExcluded = excludeTerrainPoints && point.inTerrain && !point.inContainer;
                  return (
                    <circle
                      key={`z1nml-${idx}`}
                      cx={point.x * SCALE}
                      cy={point.y * SCALE}
                      r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                      fill={point.inContainer ? "rgba(249, 115, 22, 0.9)" : isInTerrainZone1 ? "rgba(180, 83, 9, 0.9)" : "rgba(239, 68, 68, 0.8)"}
                      stroke={isExcluded ? "rgba(0, 0, 0, 0.8)" : (point.inContainer ? "none" : "rgba(168, 85, 247, 0.9)")}
                      strokeWidth={isExcluded ? 1.5 : (point.inContainer ? 0 : (losResolution === 0.25 ? 1 : 1.5))}
                    />
                  );
                })}
              </svg>
            )}

            {/* Affichage des points visibles (résultats du calcul LoS) */}
            {showVisiblePoints && advancedLoSResults && (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 2 }}>
                {/* Points visibles du No Man's Land (en vert clair) */}
                {[...advancedLoSResults.visibilityNML.entries()].map(([key, isVisible], idx) => {
                  const [x, y] = key.split(',').map(Number);
                  return (
                    <circle
                      key={`vis-nml-${idx}`}
                      cx={x * SCALE}
                      cy={y * SCALE}
                      r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                      fill={isVisible ? "rgba(34, 197, 94, 0.8)" : "rgba(239, 68, 68, 0.6)"}
                    />
                  );
                })}
                {/* Points visibles de la Zone 2 (en vert vif ou rouge) */}
                {[...advancedLoSResults.visibilityZ2.entries()].map(([key, isVisible], idx) => {
                  const [x, y] = key.split(',').map(Number);
                  return (
                    <circle
                      key={`vis-z2-${idx}`}
                      cx={x * SCALE}
                      cy={y * SCALE}
                      r={losResolution === 0.25 ? 1.5 : losResolution === 0.5 ? 2 : 3}
                      fill={isVisible ? "rgba(16, 185, 129, 0.9)" : "rgba(220, 38, 38, 0.7)"}
                    />
                  );
                })}
              </svg>
            )}

            {/* Affichage des surfaces visibles/non visibles */}
            {showVisibleSurfaces && advancedLoSResults && (() => {
              // Appliquer le lissage pour éliminer les points isolés
              const smoothedNML = smoothVisibilityMap(advancedLoSResults.visibilityNML, losResolution);
              const smoothedZ2 = smoothVisibilityMap(advancedLoSResults.visibilityZ2, losResolution);
              
              return (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 2 }}>
                {/* Carrés pour le No Man's Land */}
                {[...smoothedNML.entries()].map(([key, isVisible], idx) => {
                  const [x, y] = key.split(',').map(Number);
                  const halfSize = (losResolution * SCALE) / 2;
                  return (
                    <rect
                      key={`surf-nml-${idx}`}
                      x={x * SCALE - halfSize}
                      y={y * SCALE - halfSize}
                      width={losResolution * SCALE}
                      height={losResolution * SCALE}
                      fill={isVisible ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.4)"}
                      stroke="none"
                    />
                  );
                })}
                {/* Carrés pour la Zone 2 */}
                {[...smoothedZ2.entries()].map(([key, isVisible], idx) => {
                  const [x, y] = key.split(',').map(Number);
                  const halfSize = (losResolution * SCALE) / 2;
                  return (
                    <rect
                      key={`surf-z2-${idx}`}
                      x={x * SCALE - halfSize}
                      y={y * SCALE - halfSize}
                      width={losResolution * SCALE}
                      height={losResolution * SCALE}
                      fill={isVisible ? "rgba(16, 185, 129, 0.6)" : "rgba(220, 38, 38, 0.5)"}
                      stroke="none"
                    />
                  );
                })}
              </svg>
              );
            })()}

            {/* Guides d'aimantation pendant le glisser-déposer */}
            {isDragging && snapGuidesRef.current.length > 0 && (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 10 }}>
                {snapGuidesRef.current.map((guide, idx) => (
                  guide.type === 'edge' ? (
                    <line
                      key={`guide-${idx}`}
                      x1={guide.x1}
                      y1={guide.y1}
                      x2={guide.x2}
                      y2={guide.y2}
                      stroke="rgba(0, 255, 255, 0.9)"
                      strokeWidth="3"
                      strokeDasharray="5,5"
                    />
                  ) : (
                    <circle
                      key={`guide-${idx}`}
                      cx={guide.x}
                      cy={guide.y}
                      r="6"
                      fill="rgba(0, 255, 255, 0.9)"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )
                ))}
              </svg>
            )}

            {terrains.map(terrain => {
              const terrainType = TERRAIN_TYPES[terrain.type];
              const isSelected = selectedTerrain?.id === terrain.id;
              const corners = getRotatedCorners(terrain);
              const buildingPolygon = getBuildingPolygon(terrain);
              
              const shouldShowCornersClassic = cornersMode === 'classic' && (!editMode || isSelected || (selectedTerrain && terrain.id === selectedTerrain.symmetricId));
              const shouldShowCornersFEQ = cornersMode === 'feq' && (!editMode || isSelected || (selectedTerrain && terrain.id === selectedTerrain.symmetricId));
              // En mode fine, afficher les coins cliquables sur le décor sélectionné (étapes 2, 3, 4, 5)
              const shouldShowFineCorners = editMode && editMethod === 'fine' && isSelected && (finePositionStep >= 2 && finePositionStep <= 5);
              
              return (
                <React.Fragment key={terrain.id}>
                  {!buildingPolygon && (
                    <div
                      className={`absolute ${terrainType.color} border-2 ${terrainType.borderColor} flex flex-col items-center justify-center ${
                        editMode ? 'cursor-pointer hover:opacity-80' : ''
                      } ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                      style={{
                        left: terrain.x,
                        top: terrain.y,
                        width: terrainType.width,
                        height: terrainType.height,
                        transform: `rotate(${terrain.rotation}deg)`,
                        transformOrigin: 'center',
                        cursor: editMode && editMethod === 'drag' ? (isDragging && isSelected ? 'grabbing' : 'grab') : undefined,
                        touchAction: editMode && editMethod === 'drag' ? 'none' : 'auto'
                      }}
                      onClick={(e) => {
                        if (editMode) {
                          e.stopPropagation();
                          // En mode fine, réinitialiser si on change de décor
                          if (editMethod === 'fine' && selectedTerrain?.id !== terrain.id) {
                            resetFinePosition();
                            setFinePositionStep(2);
                          }
                          setSelectedTerrain(terrain);
                        }
                      }}
                      onMouseDown={(e) => {
                        if (editMode && editMethod === 'drag') {
                          handleDragStart(e, terrain);
                        }
                      }}
                      onTouchStart={(e) => {
                        if (editMode && editMethod === 'drag') {
                          handleDragStart(e, terrain);
                        }
                      }}
                    >
                      <span className="text-xl">{terrainType.icon}</span>
                      <span className="text-xs font-bold text-white">{terrain.name}</span>
                    </div>
                  )}
                  
                  {buildingPolygon && (
                    <>
                      <div
                        className={`absolute border-2 border-dashed border-gray-500 ${
                          editMode ? 'cursor-pointer hover:opacity-80' : ''
                        } ${isSelected ? 'ring-4 ring-yellow-400' : ''}`}
                        style={{
                          left: terrain.x,
                          top: terrain.y,
                          width: terrainType.width,
                          height: terrainType.height,
                          transform: `rotate(${terrain.rotation}deg)`,
                          transformOrigin: 'center',
                          backgroundColor: 'rgba(107, 114, 128, 0.3)',
                          opacity: 0.8,
                          cursor: editMode && editMethod === 'drag' ? (isDragging && isSelected ? 'grabbing' : 'grab') : undefined,
                          touchAction: editMode && editMethod === 'drag' ? 'none' : 'auto'
                        }}
                        onClick={(e) => {
                          if (editMode) {
                            e.stopPropagation();
                            // En mode fine, réinitialiser si on change de décor
                            if (editMethod === 'fine' && selectedTerrain?.id !== terrain.id) {
                              resetFinePosition();
                              setFinePositionStep(2);
                            }
                            setSelectedTerrain(terrain);
                          }
                        }}
                        onMouseDown={(e) => {
                          if (editMode && editMethod === 'drag') {
                            handleDragStart(e, terrain);
                          }
                        }}
                        onTouchStart={(e) => {
                          if (editMode && editMethod === 'drag') {
                            handleDragStart(e, terrain);
                          }
                        }}
                      />
                      
                      <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT} style={{ zIndex: 5 }}>
                        <polygon
                          points={buildingPolygon.map(p => `${p.x},${p.y}`).join(' ')}
                          fill={terrain.type === 'gruin' ? '#4b5563' : '#6b7280'}
                          stroke={terrain.type === 'gruin' ? '#1f2937' : '#374151'}
                          strokeWidth="2"
                          opacity="0.9"
                        />
                        <text
                          x={terrain.x + terrainType.width / 2}
                          y={terrain.y + terrainType.height / 2}
                          textAnchor="middle"
                          fill="white"
                          fontSize="20"
                          fontWeight="bold"
                          transform={`rotate(${terrain.rotation}, ${terrain.x + terrainType.width / 2}, ${terrain.y + terrainType.height / 2})`}
                        >
                          {terrainType.icon}
                        </text>
                        <text
                          x={terrain.x + terrainType.width / 2}
                          y={terrain.y + terrainType.height / 2 + 15}
                          textAnchor="middle"
                          fill="white"
                          fontSize="10"
                          fontWeight="bold"
                          transform={`rotate(${terrain.rotation}, ${terrain.x + terrainType.width / 2}, ${terrain.y + terrainType.height / 2 + 15})`}
                        >
                          {terrain.name}
                        </text>
                      </svg>
                    </>
                  )}
                  
                  {/* Mode classique : afficher coordonnées (X;Y) */}
                  {shouldShowCornersClassic && corners.map((corner, idx) => (
                    <div
                      key={`${terrain.id}-corner-${idx}`}
                      className="absolute bg-yellow-500 text-black text-xs font-bold px-1 rounded pointer-events-none z-40"
                      style={{ left: corner.x - 20, top: corner.y - 12, fontSize: '9px' }}
                    >
                      ({(corner.x / SCALE).toFixed(1)};{(corner.y / SCALE).toFixed(1)})
                    </div>
                  ))}
                  
                  {/* Mode FEQ : afficher vecteurs vers les bords */}
                  {shouldShowCornersFEQ && corners.map((corner, idx) => {
                    const xInches = corner.x / SCALE;
                    const yInches = corner.y / SCALE;
                    const xIsInteger = Math.abs(xInches - Math.round(xInches)) < 0.01;
                    const yIsInteger = Math.abs(yInches - Math.round(yInches)) < 0.01;
                    
                    const vectors = [];
                    const maxVectorLength = 2 * SCALE; // 2 pouces max
                    
                    // Vecteur horizontal (si X est entier)
                    if (xIsInteger) {
                      const distanceToLeft = xInches;
                      const distanceToRight = 60 - xInches;
                      const goLeft = distanceToLeft <= distanceToRight;
                      const distance = goLeft ? distanceToLeft : distanceToRight;
                      
                      if (distance > 0) {
                        vectors.push({
                          type: 'horizontal',
                          direction: goLeft ? 'left' : 'right',
                          distance: Math.round(goLeft ? xInches : 60 - xInches),
                          x1: corner.x,
                          y1: corner.y,
                          x2: goLeft ? corner.x - Math.min(distance * SCALE, maxVectorLength) : corner.x + Math.min(distance * SCALE, maxVectorLength)
                        });
                      }
                    }
                    
                    // Vecteur vertical (si Y est entier)
                    if (yIsInteger) {
                      const distanceToTop = yInches;
                      const distanceToBottom = 44 - yInches;
                      const goUp = distanceToTop <= distanceToBottom;
                      const distance = goUp ? distanceToTop : distanceToBottom;
                      
                      if (distance > 0) {
                        vectors.push({
                          type: 'vertical',
                          direction: goUp ? 'up' : 'down',
                          distance: Math.round(goUp ? yInches : 44 - yInches),
                          x1: corner.x,
                          y1: corner.y,
                          y2: goUp ? corner.y - Math.min(distance * SCALE, maxVectorLength) : corner.y + Math.min(distance * SCALE, maxVectorLength)
                        });
                      }
                    }
                    
                    return (
                      <React.Fragment key={`${terrain.id}-feq-corner-${idx}`}>
                        {vectors.map((vec, vecIdx) => (
                          <svg
                            key={`${terrain.id}-feq-vec-${idx}-${vecIdx}`}
                            className="absolute top-0 left-0 pointer-events-none z-40"
                            width={TABLE_WIDTH}
                            height={TABLE_HEIGHT}
                          >
                            {/* Ligne du vecteur */}
                            <line
                              x1={vec.x1}
                              y1={vec.y1}
                              x2={vec.type === 'horizontal' ? vec.x2 : vec.x1}
                              y2={vec.type === 'vertical' ? vec.y2 : vec.y1}
                              stroke="#3b82f6"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead-feq)"
                            />
                            {/* Texte de distance */}
                            <text
                              x={vec.type === 'horizontal' 
                                ? (vec.x1 + vec.x2) / 2 
                                : vec.x1 + (vec.direction === 'left' ? -12 : 12)}
                              y={vec.type === 'vertical' 
                                ? (vec.y1 + vec.y2) / 2 
                                : vec.y1 + (vec.direction === 'up' ? -8 : 14)}
                              fill="#3b82f6"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                              stroke="#000"
                              strokeWidth="0.5"
                            >
                              {vec.distance}"
                            </text>
                          </svg>
                        ))}
                        {/* Point au niveau du coin */}
                        {vectors.length > 0 && (
                          <div
                            className="absolute w-2 h-2 bg-blue-500 rounded-full pointer-events-none z-40"
                            style={{ left: corner.x - 4, top: corner.y - 4 }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Coins cliquables en mode positionnement fin */}
                  {shouldShowFineCorners && corners.map((corner, idx) => {
                    // Déterminer le style du coin selon l'étape et s'il est sélectionné
                    let cornerStyle = '';
                    let isClickable = false;
                    
                    if (finePositionStep === 2) {
                      // Étape 2 : tous les coins sont cliquables
                      cornerStyle = 'bg-cyan-500 border-white hover:bg-cyan-400 cursor-pointer';
                      isClickable = true;
                    } else if (finePositionStep === 3) {
                      // Étape 3 : le coin 1 est sélectionné (vert), les autres sont grisés
                      if (idx === finePositionCorner1) {
                        cornerStyle = 'bg-green-500 border-white';
                      } else {
                        cornerStyle = 'bg-gray-500 border-gray-400 opacity-50';
                      }
                    } else if (finePositionStep === 4) {
                      // Étape 4 : le coin 1 est vert, les autres sont cliquables (cyan)
                      if (idx === finePositionCorner1) {
                        cornerStyle = 'bg-green-500 border-white';
                      } else {
                        cornerStyle = 'bg-cyan-500 border-white hover:bg-cyan-400 cursor-pointer';
                        isClickable = true;
                      }
                    } else if (finePositionStep === 5) {
                      // Étape 5 : coin 1 vert, coin 2 orange, les autres grisés
                      if (idx === finePositionCorner1) {
                        cornerStyle = 'bg-green-500 border-white';
                      } else if (idx === finePositionCorner2) {
                        cornerStyle = 'bg-orange-500 border-white';
                      } else {
                        cornerStyle = 'bg-gray-500 border-gray-400 opacity-50';
                      }
                    }
                    
                    return (
                      <div
                        key={`${terrain.id}-fine-corner-${idx}`}
                        className={`absolute w-6 h-6 rounded-full z-50 flex items-center justify-center text-xs font-bold ${cornerStyle}`}
                        style={{ 
                          left: corner.x - 12, 
                          top: corner.y - 12,
                          borderWidth: '3px',
                          borderStyle: 'solid'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isClickable) {
                            handleFinePositionCornerClick(idx);
                          }
                        }}
                      >
                        {idx + 1}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}

            {!editMode && pointA && (
              <div className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white z-30" style={{ left: pointA.x - 8, top: pointA.y - 8 }} />
            )}

            {!editMode && pointB && (
              <div className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white z-30" style={{ left: pointB.x - 8, top: pointB.y - 8 }} />
            )}

            {!editMode && pointA && pointB && losResult && (
              <svg className="absolute top-0 left-0 pointer-events-none" width={TABLE_WIDTH} height={TABLE_HEIGHT}>
                {losResult.blocked && losResult.intersectionPoint ? (
                  <>
                    <line
                      x1={pointA.x}
                      y1={pointA.y}
                      x2={losResult.intersectionPoint.x}
                      y2={losResult.intersectionPoint.y}
                      stroke="#22c55e"
                      strokeWidth="3"
                    />
                    <line
                      x1={losResult.intersectionPoint.x}
                      y1={losResult.intersectionPoint.y}
                      x2={pointB.x}
                      y2={pointB.y}
                      stroke="#ef4444"
                      strokeWidth="3"
                    />
                    <circle
                      cx={losResult.intersectionPoint.x}
                      cy={losResult.intersectionPoint.y}
                      r="5"
                      fill="#fbbf24"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  </>
                ) : (
                  <line
                    x1={pointA.x}
                    y1={pointA.y}
                    x2={pointB.x}
                    y2={pointB.y}
                    stroke="#22c55e"
                    strokeWidth="3"
                  />
                )}
              </svg>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rendu de l'application
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Warhammer40kLayoutManager />);
