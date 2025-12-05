# Plan: Amélioration de l'Interface Utilisateur
## Date: 2025-12-04

---

## Vue d'ensemble des changements

Ce plan couvre 8 améliorations majeures de l'interface utilisateur pour optimiser l'espace et améliorer l'expérience utilisateur.

---

## 1. Dashboard - Réduire et Regrouper les Informations

### Objectif
Rendre le panneau Dashboard plus compact en regroupant FPS, Segments et Duration sur une seule ligne.

### État actuel
```
GLSL Shader Project
Untitled
┌─────────┐  ┌──────────┐
│  FPS    │  │ Segments │
│   60    │  │    1     │
└─────────┘  └──────────┘
┌──────────────────────┐
│   Total Duration     │
│       10.0s          │
└──────────────────────┘
```

### État cible
```
GLSL Shader Project - Untitled
FPS: 60 • Segs: 1 • Duration: 10.0s
```

### Fichiers à modifier
- `src/components/Dashboard/ProjectSummary.tsx`

### Implémentation
1. Refactoriser ProjectSummary pour afficher les infos sur une ligne
2. Utiliser des séparateurs `•` entre les infos
3. Réduire padding et taille de police
4. Garder l'alignement top-left

---

## 2. Timeline Modal - Réduire la Largeur du Panneau Segments

### Objectif
Réduire la largeur de la colonne "Segments" et utiliser des icônes au lieu de texte.

### État actuel
- Colonne gauche: `250px`
- Boutons: "Duplicate", "Delete", "+ Add Segment"

### État cible
- Colonne gauche: `180px`
- Boutons:
  - "Duplicate" → icône de copie ou "Copy"
  - "Delete" → "-"
  - "+ Add Segment" → "+"

### Fichiers à modifier
- `src/components/TimelineModal/TimelineModal.tsx` (grid-cols)
- `src/components/TimelineModal/SegmentItem.tsx` (boutons)
- `src/components/TimelineModal/SegmentList.tsx` (bouton Add)

### Implémentation
1. Modifier `grid-cols-[250px_1fr_400px]` → `grid-cols-[180px_1fr_400px]`
2. Remplacer texte des boutons par icônes/symboles
3. Ajuster le titre "Segments" → "Segs" ou icône
4. Réduire padding des SegmentItems

---

## 3. Segment Tab - Regrouper les Timing Fields

### Objectif
Regrouper Duration, Start Time et End Time dans un seul bloc compact au lieu de 3 champs séparés.

### État actuel
```
Timing
┌─────────────────────┐
│ Duration: 10.00s    │
└─────────────────────┘
┌─────────────────────┐
│ Start Time: 0.00s   │
└─────────────────────┘
┌─────────────────────┐
│ End Time: 10.00s    │
└─────────────────────┘
```

### État cible
```
Timing
┌─────────────────────────────────────┐
│ Duration: 10.00s                    │
│ Range: 0.00s → 10.00s               │
└─────────────────────────────────────┘
```

### Fichiers à modifier
- `src/components/TimelineModal/SegmentTab.tsx`
- Peut-être créer un composant `TimeRangeDisplay.tsx`

### Implémentation
1. Fusionner Start Time et End Time en un champ "Range"
2. Afficher format: "0.00s → 10.00s"
3. Réduire l'espace vertical
4. Garder le style ReadOnlyField mais optimisé

---

## 4. Segment Tab - Shape Instance Counts avec Sliders

### Objectif
Remplacer les inputs numériques des Shape Counts par des sliders + synchroniser avec le tab Shapes.

### État actuel
- Inputs type="number" pour circles, waves, etc.
- Pas de synchronisation avec le nombre réel d'instances

### État cible
- Sliders pour définir le max d'instances par type
- Bouton "+ Add" désactivé si limite atteinte dans Shapes tab

### Fichiers à modifier
- `src/components/TimelineModal/SegmentTab.tsx` (remplacer inputs par sliders)
- `src/components/TimelineModal/ShapesTab.tsx` (vérifier limite avant add)
- `src/components/TimelineModal/InstanceList.tsx` (désactiver bouton +)
- Peut-être `src/constants/sliderDefaults.ts` (ajouter config pour shape counts)

### Implémentation
1. **Ajouter sliders config dans sliderDefaults.ts**
   ```typescript
   shapeInstanceCounts: {
     circles: { min: 0, max: 8, step: 1, label: 'Max Circles' },
     // ... etc
   }
   ```

2. **Modifier SegmentTab pour utiliser SliderField**
   - Remplacer les 4 inputs par SliderField
   - Les valeurs seront stockées dans `shapeCounts` (dérivé de shapeInstances.length)

3. **ATTENTION: Confusion possible**
   - `shapeCounts` actuel = nombre réel d'instances (lecture seule)
   - Besoin d'un nouveau concept: `maxShapeInstances` (limite éditable)

4. **Décision architecture**:
   - Option A: `shapeCounts` devient la limite max, et on dérive automatiquement le count
   - Option B: Créer `maxShapeInstances` séparé dans SegmentConfig

   **Recommandation: Option B** pour clarté
   - Ajouter `maxShapeInstances?: ShapeLimits` dans SegmentConfig
   - Si undefined, utiliser `config.maxShapeLimits` du projet

5. **Synchronisation dans ShapesTab**
   ```typescript
   const canAddInstance = currentInstances.length < getMaxLimit();
   ```

6. **Désactiver le bouton + dans InstanceList**
   ```typescript
   disabled={instances.length >= maxInstances}
   ```

---

## 5. Expanding Circles - Afficher TOUS les Paramètres dans l'UI

### Objectif
Actuellement, l'UI affiche SEULEMENT Intensity et Color. Tous les autres paramètres existent dans le code mais sont invisibles dans l'interface !

### État actuel dans l'UI (selon screenshots)
- ❌ **Manquants dans l'UI**: startRadius, period, maxRadius, thickness, glow, startTime
- ✅ **Visibles**: intensity, color

### État cible
Afficher TOUS les sliders dans InstanceForm pour ExpandingCircle:
- Start Radius (rayon de départ)
- Period (temps d'expansion en secondes)
- Max Radius
- Thickness
- Glow
- Start Time (offset dans le segment)
- Intensity
- Color

### Fichiers à modifier
- `src/components/TimelineModal/InstanceForm.tsx` (section expandingCircle)
  - Les sliders existent dans le code mais ne sont PAS rendus !
  - Vérifier que la section ExpandingCircle affiche bien tous les SliderField

---

## 6. Fixed Circles - Afficher TOUS les Paramètres dans l'UI

### Objectif
Actuellement, l'UI affiche SEULEMENT Intensity et Color. Les paramètres radius, thickness, glow existent mais sont invisibles !

### État actuel dans l'UI (selon screenshots)
- ❌ **Manquants dans l'UI**: radius, thickness, glow
- ✅ **Visibles**: intensity, color

### État cible
Afficher TOUS les sliders dans InstanceForm pour Circle:
- Radius (rayon du cercle)
- Thickness
- Glow
- Intensity
- Color

### Fichiers à modifier
- `src/components/TimelineModal/InstanceForm.tsx` (section circle)
  - Les sliders existent dans le code mais ne sont PAS rendus !
  - Vérifier que la section Circle affiche bien tous les SliderField

---

## 7. Waves - Afficher TOUS les Paramètres dans l'UI + Ajouter Glow

### Objectif
Actuellement, l'UI affiche SEULEMENT Intensity et Color. Manquent: amplitude, frequency, speed, thickness, ET glow.

### État actuel dans l'UI (selon screenshots)
- ❌ **Manquants dans l'UI**: amplitude, frequency, speed, thickness
- ❌ **Manquant dans le type**: glow
- ✅ **Visibles**: intensity, color

### État cible
Afficher TOUS les sliders dans InstanceForm pour Wave:
- Amplitude
- Frequency (fréquence)
- Speed
- Thickness
- **Glow** (à ajouter au type WaveInstance)
- Intensity
- Color

### Changements nécessaires
1. **Ajouter `glow` dans le type `WaveInstance`** (src/types/shapeInstances.ts)
2. **Ajouter slider config** pour `waves.glow` (src/constants/sliderDefaults.ts)
3. **Modifier InstanceForm** (src/components/TimelineModal/InstanceForm.tsx)
   - Afficher les sliders amplitude, frequency, speed, thickness (qui existent)
   - Ajouter le slider glow
4. **Mettre à jour shapeDefaults.ts** pour inclure glow dans getWaveDefaults()
5. **Mettre à jour schema.ts** pour inclure glow dans waveInstanceSchema

---

## 8. Epicycloids - Afficher TOUS les Paramètres dans l'UI

### Objectif
Actuellement, l'UI affiche SEULEMENT Intensity et Color. Tous les autres paramètres (R, r, scale, thickness, speed, glow, samples) existent mais sont invisibles !

### État actuel dans l'UI (selon screenshots)
- ❌ **Manquants dans l'UI**: R, r, scale, thickness, speed, glow, samples
- ✅ **Visibles**: intensity, color

### État cible
Afficher TOUS les sliders dans InstanceForm pour Epicycloid:
- R (rayon R extérieur)
- r (rayon r intérieur)
- Scale
- Thickness
- Speed (vitesse)
- Glow
- Samples (nombre de samples)
- Intensity
- Color

### Fichiers à modifier
- `src/components/TimelineModal/InstanceForm.tsx` (section epicycloid)
  - Les sliders existent dans le code mais ne sont PAS rendus !
  - Vérifier que la section Epicycloid affiche bien tous les SliderField

---

## Ordre d'implémentation recommandé

### Phase 1: Changements simples (1h)
1. ✅ Dashboard compact (Point 1)
2. ✅ Réduire largeur Segments + icônes (Point 2)
3. ✅ Regrouper Timing fields (Point 3)

### Phase 2: Ajouter glow aux Waves (30min)
4. ✅ Point 7 - Ajouter `glow` dans WaveInstance (COMPLETED)

### Phase 3: Shape Counts avec sliders (2h)
5. ✅ Point 4 - Architecture pour max instances
6. ✅ Sliders dans SegmentTab
7. ✅ Synchronisation avec ShapesTab
8. ✅ Désactivation bouton + si limite atteinte

### Phase 4: Vérification (Points 5, 6, 8)
9. ✅ Confirmer que tous les paramètres demandés existent déjà

---

## Résumé des fichiers impactés

### Créations
- Peut-être: `src/components/TimelineModal/TimeRangeDisplay.tsx` (optionnel)

### Modifications principales
1. `src/components/Dashboard/ProjectSummary.tsx`
2. `src/components/TimelineModal/TimelineModal.tsx`
3. `src/components/TimelineModal/SegmentList.tsx`
4. `src/components/TimelineModal/SegmentItem.tsx`
5. `src/components/TimelineModal/SegmentTab.tsx`
6. `src/types/config.ts` (ajouter maxShapeInstances dans SegmentConfig)
7. `src/types/shapeInstances.ts` (ajouter glow dans WaveInstance)
8. `src/constants/sliderDefaults.ts`
9. `src/components/TimelineModal/ShapesTab.tsx`
10. `src/components/TimelineModal/InstanceList.tsx`
11. `src/components/TimelineModal/InstanceForm.tsx` (ajouter glow pour waves)

---

## Validation

Après implémentation, vérifier:
- ✅ Dashboard est compact et lisible
- ✅ Colonne Segments réduite mais utilisable
- ✅ Timing fields groupés et clairs
- ✅ Sliders shape counts fonctionnent
- ✅ Bouton + désactivé si limite atteinte
- ✅ Glow paramètre disponible pour Waves
- ✅ Tous les autres paramètres déjà présents fonctionnent
- ✅ Build réussit sans erreurs
- ✅ Lint passe sans warnings
