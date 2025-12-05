# Plan: UI Refactor + Centralized Slider Configuration
## Phase: Enhanced User Experience with Dynamic Controls

### Objectifs Principaux
1. **Refactor des champs informatifs** → Read-only inputs avec style distinct
2. **Ajouter sliders partout** → Intensités, paramètres de formes (radius, thickness, period, scale, etc.)
3. **Configuration centralisée** → Un seul fichier de config pour min/max/step de tous les sliders

---

## Architecture Proposée

### 1. Fichier de Configuration Centralisée
**Fichier:** `src/constants/sliderDefaults.ts`

Contient la définition de tous les sliders par type:

```typescript
export const SLIDER_CONFIG = {
  // Shape Intensities (0-1 range)
  intensity: {
    min: 0,
    max: 1,
    step: 0.01,
    label: "Intensity",
    format: (v: number) => `${(v * 100).toFixed(0)}%`
  },

  // Fixed Circles Parameters
  circles: {
    radius: { min: 0.01, max: 1, step: 0.01, label: "Radius" },
    thickness: { min: 0.0001, max: 0.01, step: 0.0001, label: "Thickness" },
    glow: { min: 0, max: 3, step: 0.1, label: "Glow" }
  },

  // Expanding Circles Parameters
  expandingCircles: {
    startRadius: { min: 0, max: 1, step: 0.05, label: "Start Radius" },
    endRadius: { min: 0, max: 1.5, step: 0.05, label: "End Radius" },
    period: { min: 0.1, max: 100, step: 0.1, label: "Period (s)" },
    thickness: { min: 0.0001, max: 0.01, step: 0.0001, label: "Thickness" }
  },

  // Waves Parameters
  waves: {
    scale: { min: 0.1, max: 5, step: 0.1, label: "Scale" },
    speed: { min: -2, max: 2, step: 0.1, label: "Speed" },
    thickness: { min: 0.0001, max: 0.01, step: 0.0001, label: "Thickness" }
  },

  // Epicycloids Parameters
  epicycloids: {
    r: { min: 0.1, max: 2, step: 0.05, label: "Major Radius (R)" },
    rMinor: { min: 0.01, max: 1, step: 0.05, label: "Minor Radius (r)" },
    d: { min: 0, max: 2, step: 0.05, label: "Distance (d)" },
    scale: { min: 0.1, max: 5, step: 0.1, label: "Scale" },
    thickness: { min: 0.0001, max: 0.01, step: 0.0001, label: "Thickness" }
  },

  // Project-level Settings
  project: {
    fps: { min: 1, max: 120, step: 1, label: "FPS" },
    epicycloidsSampleFactor: { min: 0.1, max: 10, step: 0.1, label: "Sample Factor" }
  }
};

// Utility: Get slider config for a field
export function getSliderConfig(category: string, field: string) {
  return SLIDER_CONFIG[category as keyof typeof SLIDER_CONFIG]?.[field as any];
}
```

### 2. Component: ReadOnlyField
**Fichier:** `src/components/FormFields/ReadOnlyField.tsx`

Affiche les valeurs non-éditables de manière visuelle distincte:

```typescript
interface ReadOnlyFieldProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
}

export function ReadOnlyField({ label, value, unit, icon }: ReadOnlyFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-950 border border-gray-700 rounded text-sm font-mono text-gray-300 cursor-default">
        {icon && <span className="text-gray-500">{icon}</span>}
        <span>{value}</span>
        {unit && <span className="text-gray-500 text-xs">{unit}</span>}
      </div>
    </div>
  );
}
```

### 3. Component: SliderField
**Fichier:** `src/components/FormFields/SliderField.tsx`

Contrôle éditables avec slider + input numérique:

```typescript
interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  config: SliderDef;
  unit?: string;
}

export function SliderField({ label, value, onChange, config }: SliderFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-medium text-gray-300">{label}</label>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          min={config.min}
          max={config.max}
          step={config.step}
          className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-right"
        />
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={config.min}
        max={config.max}
        step={config.step}
        className="w-full h-1.5 accent-primary"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{config.min}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
}
```

### 4. Refactor de l'Interface Existante

**Zones à refactor:**

| Zone | Champs Read-only | Champs Slider |
|------|-----------------|---------------|
| **Project Settings** | FPS | epicycloidsSampleFactor |
| **Segment List** | Duration, Start Time, End Time | - |
| **Segment Details** | Background Color, Transition Duration | - |
| **Shape Instances** | - | intensity, tous les paramètres |

---

## Phases d'Implémentation

### Phase 1: Infrastructure
- [ ] Créer `SLIDER_CONFIG` dans `src/constants/sliderDefaults.ts`
- [ ] Créer composant `ReadOnlyField.tsx`
- [ ] Créer composant `SliderField.tsx`
- [ ] Tests: vérifier que les configs sont accessibles

### Phase 2: Refactor Project Settings
- [ ] Remplacer les inputs FPS par ReadOnlyField
- [ ] Ajouter slider pour epicycloidsSampleFactor
- [ ] Style: appliquer cohérence visuelle

### Phase 3: Refactor Segment Display
- [ ] SegmentList: Duration/Start/End → ReadOnlyFields
- [ ] Segment Settings: ajouter sliders pour Transition Duration (si éditable)
- [ ] Background Color: rester en color picker (pas de slider)

### Phase 4: Refactor Shape Instance Editor
- [ ] Intensity: slider au lieu d'input
- [ ] Tous les paramètres: radius, thickness, glow, period, scale, d, r, etc. → sliders
- [ ] Live preview: vérifier que les sliders mettent à jour le shader en temps réel

### Phase 5: Validation & Polish
- [ ] Tests visuels: tous les sliders fonctionnent correctement
- [ ] Performance: pas de lag avec beaucoup de sliders
- [ ] Responsive: layout sur petits écrans
- [ ] Build & lint: aucune erreur

---

## Points d'Attention

1. **Performance des sliders**
   - ✅ Déjà optimisé: live preview désactivée par onChange throttling (ou debouncing)
   - À tester: nombreux sliders simultanés

2. **Précision vs Contrôlabilité**
   - Sliders avec step petit (0.01) peuvent être difficiles à contrôler
   - Prévoir: input numérique en parallèle pour fine-tuning

3. **Format d'affichage**
   - Certaines valeurs très petites (0.0001) difficiles à lire
   - Solution: format personnalisé via `formatValue()` dans SliderDef

4. **Découverte des limites**
   - Min/max non évidents pour l'utilisateur
   - Solution: afficher min/max en bas du slider

---

## Fichiers à Créer/Modifier

### Créer:
- `src/constants/sliderDefaults.ts` (nouvelle config)
- `src/components/FormFields/ReadOnlyField.tsx` (nouveau composant)
- `src/components/FormFields/SliderField.tsx` (nouveau composant)

### Modifier:
- `src/components/TimelineModal/ShapeInstanceEditor.tsx` → ajouter sliders
- `src/components/ProjectModal/ProjectSettings.tsx` → refactor avec ReadOnlyFields
- `src/components/Dashboard/Dashboard.tsx` (segment list)
- `src/components/TimelineModal/SegmentTab.tsx` (segment details)

---

## Estimations

| Phase | Complexité | Fichiers |
|-------|-----------|----------|
| 1 (Infrastructure) | Basse | 3 créés |
| 2 (Project Settings) | Basse | 1 modifié |
| 3 (Segments) | Moyenne | 2 modifiés |
| 4 (Shape Instances) | Moyenne-Haute | 1 modifié (peut avoir beaucoup de sliders) |
| 5 (Validation) | Basse | Tests |

**Total estimé:** 2-3 heures pour MVP

---

## Prochaines Étapes

1. **Validation du plan** ← Ton retour ici
2. Si OK → Commencer Phase 1 (infrastructure)
3. Puis phases 2-5 itérativement
