// Cache pour stocker le contexte audio et éviter de créer plusieurs sources
let audioContextCache: AudioContext | null = null;
let audioDestinationCache: MediaStreamAudioDestinationNode | null = null;

/**
 * Extrait la piste audio depuis l'élément HTMLAudioElement qui joue déjà
 * Utilise Web Audio API pour capturer le stream audio
 * IMPORTANT: Ne peut être appelé qu'une seule fois par élément audio
 */
export function extractAudioTrackFromElement(
  audioElement: HTMLAudioElement | null
): MediaStreamTrack | undefined {
  if (!audioElement || !audioElement.src) {
    return undefined;
  }

  try {
    // Si on a déjà un stream en cache, le retourner
    if (audioDestinationCache) {
      return audioDestinationCache.stream.getAudioTracks()[0];
    }

    // Créer un contexte audio (une seule fois)
    if (!audioContextCache) {
      audioContextCache = new AudioContext();
    }

    // Créer une source depuis l'élément audio existant
    // ATTENTION: createMediaElementSource ne peut être appelé qu'UNE SEULE FOIS
    const source = audioContextCache.createMediaElementSource(audioElement);

    // Créer une destination pour capturer le stream
    audioDestinationCache = audioContextCache.createMediaStreamDestination();

    // Connecter la source à la destination ET au speaker
    // (pour continuer à entendre l'audio pendant l'export)
    source.connect(audioDestinationCache);
    source.connect(audioContextCache.destination);

    // Retourner la piste audio
    return audioDestinationCache.stream.getAudioTracks()[0];
  } catch (error) {
    console.error('Erreur extraction audio:', error);
    // Si l'erreur est "already connected", retourner le cache
    if (audioDestinationCache) {
      return audioDestinationCache.stream.getAudioTracks()[0];
    }
    return undefined;
  }
}

/**
 * Nettoie le cache audio (à appeler après l'export)
 */
export function cleanupAudioContext() {
  if (audioContextCache) {
    audioContextCache.close();
    audioContextCache = null;
  }
  audioDestinationCache = null;
}
