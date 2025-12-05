# Plan: Timeline Editor avec Live Preview Intégré

## Vue d'ensemble

Refactoriser le Timeline Modal pour inclure une preview live du shader au centre, permettant l'édition en temps réel avec feedback visuel immédiat.

## Layout Cible

```
┌─────────────────────────────────────────────────────────────┐
│ Timeline Editor                                        [X]  │
├──────────────┬─────────────────────┬────────────────────────┤
│              │                     │                        │
│  Segments    │  SHADER PREVIEW     │   Shape Editor         │
│  (250px)     │  (live, resizable)  │   (350-400px)          │
│              │                     │                        │
│  • Seg 1     │                     │  Tabs: Segment|Shapes  │
│  • Seg 2     │                     │                        │
│  • Seg 3     │      [Render]       │  [Parameters here]     │
│              │                     │                        │
│  [+ Add]     │                     │  • Intensity slider    │
│              │                     │  • Color picker        │
│              │                     │  • Real-time update    │
├──────────────┴─────────────────────┴────────────────────────┤
│  ◄ ═══●═════════════════════════════════════ ►  ⏸  [0:05]  │
│  Playback Bar (scrubbing, play/pause, time display)        │
└─────────────────────────────────────────────────────────────┘
```

## Objectifs

1. **Preview Live Intégrée**: ThreeScene rendu au centre du modal
2. **Playback Intégré**: Barre de lecture en bas du modal avec scrubbing
3. **Édition Temps Réel**: Modifications de paramètres → update instantané du shader
4. **Navigation Fluide**: Click segment → jump au début du segment
5. **Resize Flexible**: Colonnes redimensionnables (stretch goal)

---

## Phase A: Restructuration du TimelineModal Layout

### A.1: Modifier TimelineModal.tsx - Layout 3 colonnes + Playback Bar
**Fichier**: `src/components/TimelineModal/TimelineModal.tsx`

**Changements**:
- Remplacer layout `grid-cols-[300px_1fr]` par `grid-cols-[250px_1fr_400px]`
- Ajouter colonne centrale pour la preview
- Ajouter footer avec playback bar intégrée
- Ajuster hauteurs pour laisser place au playback bar

**Props à ajouter**:
```typescript
interface TimelineModalProps {
  // ... existing props
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  shaderUniforms: Record<string, { value: unknown }>;
}
```

### A.2: Créer TimelinePreview.tsx - Container pour ThreeScene
**Fichier**: `src/components/TimelineModal/TimelinePreview.tsx` (NOUVEAU)

**Responsabilités**:
- Wrapper pour ThreeScene avec dimensions adaptées au modal
- Affichage du segment actuel en overlay (optionnel)
- Gestion du resize (future feature)

**Props**:
```typescript
interface TimelinePreviewProps {
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  uniforms: Record<string, { value: unknown }>;
  onTimeUpdate: (time: number) => void;
}
```

**Implémentation**:
- Réutiliser ThreeScene existant
- Ajuster CSS pour s'adapter au container modal
- Ajouter border/styling pour distinguer la preview

### A.3: Créer TimelinePlaybackBar.tsx - Barre de lecture intégrée
**Fichier**: `src/components/TimelineModal/TimelinePlaybackBar.tsx` (NOUVEAU)

**Différences avec PlaybackBar existant**:
- Version compacte pour le modal
- Même fonctionnalités (play/pause, scrub, time display)
- Styling adapté au modal (border-top, padding réduit)

**Props**: Mêmes que PlaybackBar actuel
```typescript
interface TimelinePlaybackBarProps {
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  totalDuration: number;
  segments: Array<{ start: number; duration: number }>;
}
```

---

## Phase B: Synchronisation Temps Réel

### B.1: Modifier App.tsx - Passer props au TimelineModal
**Fichier**: `src/App.tsx`

**Changements**:
- Passer `currentTime`, `isPlaying`, `totalDuration` à TimelineModal
- Passer `handlePlayPause`, `handleScrub` callbacks
- Passer `shaderUniforms` pour la preview

**Note**: Le state de temps reste dans App.tsx (single source of truth)

### B.2: Gestion du Auto-Jump au Segment
**Fichier**: `src/components/TimelineModal/TimelineModal.tsx`

**Logique**:
```typescript
// Quand un segment est sélectionné, jump au début du segment
const handleSelectSegment = (index: number) => {
  onSelectSegment(index);
  const selectedSeg = segments[index];
  onScrub(selectedSeg.startSec); // Jump to segment start
};
```

### B.3: Live Update sur Modification de Paramètres
**Implémentation**: Déjà fonctionnel!

Les hooks `updateSegmentBackground`, `updateSegmentShapeInstances`, etc. modifient `config` → `shaderUniforms` se recalcule via `useMemo` → ThreeScene reçoit les nouveaux uniforms → update automatique.

**Vérification**: Tester que les modifications se reflètent instantanément dans la preview.

---

## Phase C: Features UX Avancées

### C.1: Isolate Mode (Stretch Goal)
**Fichier**: `src/components/TimelineModal/TimelineModal.tsx`

**Feature**: Bouton pour afficher uniquement le segment actuel (masque les autres)

**Implémentation**:
- State local `isolateMode: boolean`
- Si `isolateMode === true`, forcer `currentTime` à rester dans le segment actuel
- Modifier les uniforms pour ne rendre que le segment sélectionné

**UI**: Toggle button à côté du segment sélectionné ou dans le header

### C.2: Resize des Colonnes (Stretch Goal)
**Library**: `react-resizable-panels` ou custom implementation

**Feature**: Drag handles entre les colonnes pour ajuster les largeurs

**Implémentation**:
- Remplacer `grid-cols-[250px_1fr_400px]` par des ResizablePanels
- Sauvegarder les tailles dans localStorage (optionnel)

### C.3: Indicateur Visuel du Segment Actuel
**Fichier**: `src/components/TimelineModal/TimelinePreview.tsx`

**Feature**: Overlay semi-transparent affichant "Segment 2: Chorus" en bas de la preview

**Implémentation**:
```tsx
<div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
  <span className="text-white text-sm">
    Segment {selectedSegmentIndex + 1}: {selectedSegment.label}
  </span>
</div>
```

---

## Phase D: Polish & Tests

### D.1: Styling & Responsive
- Assurer que le modal s'adapte aux petits écrans (min-width?)
- Vérifier les overflow/scrolling des colonnes
- Tester les bordures/séparateurs entre colonnes

### D.2: Performance
- Vérifier que ThreeScene ne se recréé pas inutilement
- Optimiser les useMemo/useCallback si nécessaire
- Tester avec 10+ segments et 8 shapes par type

### D.3: Tests Manuels
- [ ] Click segment → Preview jump au début du segment
- [ ] Modifier intensity → Preview update en temps réel
- [ ] Modifier color → Preview update en temps réel
- [ ] Scrub playback bar → Preview suit
- [ ] Play/pause → Animation continue
- [ ] Ajouter/supprimer segment → Preview reste fonctionnelle
- [ ] Ajouter/supprimer instance → Preview update

### D.4: Lint & Build
- `npm run lint` - aucune erreur
- `npm run build` - build réussit
- `npx tsc --noEmit` - aucune erreur TypeScript

---

## Dépendances entre Phases

```
A.1 (Layout) ──┬──> B.1 (App props)
               │
A.2 (Preview)──┴──> B.2 (Auto-jump) ──> C.1 (Isolate)
               │
A.3 (Playback)─────> B.3 (Live update) ──> C.3 (Indicateur)
                                           │
                                           └──> D.* (Polish)
```

**Note**: Phase C est optionnelle (stretch goals), Phase D est finale.

---

## Ordre d'Implémentation Recommandé

1. **A.2**: Créer TimelinePreview.tsx (indépendant)
2. **A.3**: Créer TimelinePlaybackBar.tsx (indépendant)
3. **A.1**: Modifier TimelineModal.tsx pour intégrer les 2 nouveaux composants
4. **B.1**: Modifier App.tsx pour passer les props
5. **B.2**: Implémenter auto-jump au segment
6. **B.3**: Vérifier live updates (devrait déjà fonctionner)
7. **C.3**: Ajouter indicateur visuel (quick win)
8. **D.3**: Tests manuels
9. **D.4**: Validation lint/build
10. **C.1, C.2**: Features avancées (si temps disponible)

---

## Notes Techniques

### ThreeScene Reuse
- **Problème potentiel**: Deux ThreeScene simultanés (dashboard + modal)?
- **Solution**: Vérifier que le dashboard est caché quand le modal est ouvert
- **Alternative**: Réutiliser la même instance WebGL (complexe)

### Playback Bar Sync
- **État partagé**: `currentTime`, `isPlaying` doivent rester dans App.tsx
- **Modal playback**: Contrôle le même state que la barre principale
- **Comportement**: Quand modal fermé, la barre principale reprend le contrôle

### Performance Considerations
- **Uniforms recalcul**: Déjà optimisé avec useMemo dans App.tsx
- **ThreeScene render**: Utilise requestAnimationFrame, pas d'impact
- **Modal render**: Éviter re-render complet à chaque frame

---

## Questions à Clarifier

1. **Playback global vs local**: Quand le modal est ouvert, veut-on:
   - Option A: La lecture continue normalement (timeline globale)
   - Option B: La lecture s'arrête à l'ouverture du modal
   - **Recommandation**: Option A (plus fluide)

2. **Dashboard visibility**: Quand modal ouvert:
   - Option A: Dashboard caché (backdrop couvre tout)
   - Option B: Dashboard visible en arrière-plan
   - **Actuel**: Dashboard caché (backdrop opaque)
   - **Recommandation**: Garder tel quel

3. **Resize colonnes**: Priorité haute ou basse?
   - **Recommandation**: Basse (stretch goal Phase C.2)

---

## Checklist de Complétion

### Phase A: Layout
- [ ] A.1: TimelineModal layout 3 colonnes
- [ ] A.2: TimelinePreview component créé
- [ ] A.3: TimelinePlaybackBar component créé

### Phase B: Synchronisation
- [ ] B.1: Props passés de App.tsx
- [ ] B.2: Auto-jump implémenté
- [ ] B.3: Live updates vérifiés

### Phase C: Features Avancées (Optionnel)
- [ ] C.1: Isolate mode (stretch)
- [ ] C.2: Resize colonnes (stretch)
- [ ] C.3: Indicateur segment actuel

### Phase D: Validation
- [ ] D.1: Styling finalisé
- [ ] D.2: Performance OK
- [ ] D.3: Tests manuels passés
- [ ] D.4: Lint & build OK

---

## Estimation

- **Phase A**: ~2-3h (layout + 2 nouveaux composants)
- **Phase B**: ~1h (props + auto-jump)
- **Phase C.3**: ~30min (indicateur)
- **Phase D**: ~1h (tests + polish)

**Total MVP**: ~4-5h
**Total avec stretch goals**: ~6-8h

---

## Prochaine Étape

Attendre validation du plan, puis commencer par **Phase A.2** (TimelinePreview.tsx).
