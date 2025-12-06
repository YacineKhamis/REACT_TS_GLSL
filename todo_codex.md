# Audio Integration Roadmap

## Sprint 1 - Importer la piste
- [x] Ajouter une zone de drop/upload dans `ProjectSettings` pour s?lectionner un fichier audio.
- [x] ?tendre `ProjectConfig`/`useProjectState` avec un champ `audioTrack` (nom, dur?e, url, status).
- [x] Cr?er un hook/utilitaire (`useAudioTrack`) qui charge le fichier, lit sa dur?e et remonte les erreurs d'encodage ou de taille.
- [x] Sauvegarde/chargement du projet conserve l'audio (m?tadonn?es + revalidation si le fichier manque).
- [x] Tests manuels : import MP3/OGG valide, rejet format invalide, suppression de la piste.

## Sprint 2 - Transport synchronis?
- [x] Impl?menter `useAudioPlayer` (play/pause/seek, ?tat en lecture, erreurs).
- [x] Connecter Play/Pause/Scrub du transport principal (`App.tsx`) au lecteur audio et maintenir la synchro avec `currentTime`.
- [x] G?rer les cas limites : pas de piste charg?e (transport audio d?sactiv?), piste retir?e pendant la lecture (stop propre).
- [x] Tests manuels : lecture simultan?e, pause instantan?e, scrub rapide, retrait de piste.

## Sprint 3 - Dur?es align?es ? l'audio
- [ ] Ajouter le toggle "Verrouiller la dur?e totale ? la piste" + indicateur de temps restant dans la timeline/projet.
- [ ] Emp?cher que la somme des `durationSec` d?passe la dur?e audio (validation c?t? state + feedback UI).
- [ ] Actions rapides "?tendre jusqu'? la fin" et "R?partir la dur?e restante" dans l'?diteur de segments.
- [ ] Scrub d'un segment d?clenche aussi `audio.seek` pour entendre le passage cibl?.
- [ ] Tests manuels : verrou actif/inactif, d?passement bloqu?, boutons rapides, scrub audio sur segment s?lectionn?.

## Sprint 4 - Waveform & rep?res (optionnel)
- [ ] G?n?rer une waveform downsampl?e apr?s import (workers ou utilitaire d?di?) et l'afficher derri?re la timeline.
- [ ] Permettre l'ajout/suppression de rep?res (cues) li?s au temps audio, visibles sur la waveform et list?s.
- [ ] Snap des bords de segments sur les rep?res + navigation via clic dans la waveform.
- [ ] Tests manuels : waveform align?e ? la dur?e audio, rep?res persistants, snap fiable, clic waveform = scrub audio.
