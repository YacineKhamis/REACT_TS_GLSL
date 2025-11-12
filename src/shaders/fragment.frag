// ========================================
// FRAGMENT SHADER — Timeline modulaire FLEXIBLE
// ========================================

// ------------ UNIFORMS MINIMALES ------------
uniform vec2 uResolution;
uniform float iTime;

// Couleurs principales
uniform vec3 uBackgroundColor;
uniform vec3 uCircleColor0, uCircleColor1, uCircleColor2;
uniform vec3 uWaveColor0, uWaveColor1, uWaveColor2;
uniform vec3 uEpiColor0, uEpiColor1;
uniform vec3 uExpandColor;

// ---------- TIMELINE UNIFORMS ----------
// In order to support a variable number of segments, the timing and
// per‑segment parameters are provided as uniform arrays. uNumSegments
// defines how many entries in these arrays are considered valid.
// MAX_SEGMENTS defines the maximum number supported by the shader.
#define MAX_SEGMENTS 20

uniform int uNumSegments;
uniform float uSegStart[MAX_SEGMENTS];
uniform float uSegDur[MAX_SEGMENTS];
// Format vec4: .x = intensity circles, .y = intensity waves, .z = intensity epicycloids, .w = intensity expand
uniform vec4 uIntensitySeg[MAX_SEGMENTS];
// Format vec4: .x = nb circles, .y = nb expand circles, .z = nb waves, .w = nb epis
uniform vec4 uShapeCountsSeg[MAX_SEGMENTS];
// Per‑segment tints for circles, waves and epicycloids
uniform vec3 uTintCircSeg[MAX_SEGMENTS];
uniform vec3 uTintWaveSeg[MAX_SEGMENTS];
uniform vec3 uTintEpiSeg[MAX_SEGMENTS];

// ---------- CONSTANTES ----------
// NUM_SEGMENTS is no longer used. Segment data is now provided via
// the uniform arrays uSegStart, uSegDur and associated per‑segment
// arrays. The maximum number of supported segments is defined by
// MAX_SEGMENTS at the top of this file.
const float TRANSITION = 10.0;

// Segment start and duration are now provided via uniform arrays uSegStart and uSegDur. See above.

const float MASTER_CIRCLES = 1.0;
const float MASTER_WAVES = 1.0;
const float MASTER_EPIS = 1.0;

// Paramètres par défaut (supportent maintenant jusqu'à 8 instances)
// Cercles fixes
const int MAX_CIRCLES = 8;
const float C_R[MAX_CIRCLES] = float[](0.01, 0.06, 0.06, 0.45, 0.44, 0.16, 0.9, 0.95);
const float C_THICK[MAX_CIRCLES] = float[](0.0005, 0.0006, 0.0005, 0.0005, 0.0005, 0.0002, 0.0004, 0.0009);
const float C_GLOW[MAX_CIRCLES] = float[](1.50, 0.85, 0.1, 1.3, .20, 0.9, 0.6, 1.7);
const float C_GLOW_SHARP = 80.0;

// Cercles expansifs
const int MAX_EXPAND_CIRCLES = 8;
const float EXPAND_DURATION = 41.74;
const float EXPAND_PERIOD = 41.74;
const float EXPAND_THICKNESS = 0.0001;
const float EXPAND_GLOW = 3.5;
const float EXPAND_MAX_RADIUS = 1.5;

// Vagues
const int MAX_WAVE_LAYERS = 8;
const float W_AMP[MAX_WAVE_LAYERS] = float[](0.30, 0.1, 0.15, 0.35, 0.25, 0.78, 0.32, 0.38);
const float W_FREQ[MAX_WAVE_LAYERS] = float[](0.30, 0.56, 0.62, 0.50, 0.65, 0.75, 0.80, 0.55);
const float W_SPEED[MAX_WAVE_LAYERS] = float[](0.20, 0.15, 0.10, 0.18, 0.12, 0.16, 0.22, 0.14);
const float W_THICK[MAX_WAVE_LAYERS] = float[](0.0010, 0.004, 0.006, 0.003, 0.005, 0.05, 0.0035, 0.0045);

// Epicycloïdes
const int MAX_EPI = 8;
const float E_R[MAX_EPI] = float[](7.190, 1.85, 13.5, 20., 14.3, 9.1, 5.8, 7.5);
const float E_r[MAX_EPI] = float[](-3.03, 0.506, -3.94, 7., -3.5, 5.5, -4.0, 6.5);
const float E_SCALE[MAX_EPI] = float[](0.0075, 0.045, 0.031, 0.025, 0.040, 0.030, 0.038, 0.028);
const float E_THICK[MAX_EPI] = float[](0.0005, 0.001, 0.0005, 0.0006, 0.0004, 0.0005, 0.0006, 0.0005);
const float E_SPEED[MAX_EPI] = float[](0.09, 0.18, 0.035, 0.042, 0.028, 0.038, 0.045, 0.032);
const float E_GLOW[MAX_EPI] = float[](0.25, 1.0, 0.75, 1.50, 0.80, 0.85, 0.68, 0.78);
const int E_SAMPLES[MAX_EPI] = int[](118, 11, 900, 1100, 500, 700, 900, 650);

// ---------- UTILS ----------
const float TAU = 6.2831853;
const int MAX_EPI_SAMPLES = 1024;

vec2 uvNorm() {
    return (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
}

float easeInOut(float x) {
    x = clamp(x, 0.0, 1.0);
    return x * x * (3.0 - 2.0 * x);
}

float softBand(float d, float halfW) {
    float aa = 1.9 * fwidth(d);
    return 1.0 - smoothstep(halfW, halfW + aa, d);
}

// ---------- TIMELINE ----------
struct SegData {
    vec4 intensities; // x=circles, y=waves, z=epis, w=expandCircles
    vec4 shapeCounts; // x=nb circles, y=nb expandCircles, z=nb waves, w=nb epis
    vec3 tintCirc;    // Teinte interpolée pour cercles
    vec3 tintWave;    // Teinte interpolée pour vagues
    vec3 tintEpi;     // Teinte interpolée pour epicycloïdes
    float progress;
    int idx;
};

vec4 getIntensityForSeg(int i) {
    // Directly index into the uniform array of intensities. The index
    // must be less than uNumSegments; callers are responsible for
    // bounds checking.
    return uIntensitySeg[i];
}

vec4 getShapeCountsForSeg(int i) {
    // Directly index into the uniform array of shape counts.
    return uShapeCountsSeg[i];
}

vec3 getTintCirc(int i) {
    return uTintCircSeg[i];
}

vec3 getTintWave(int i) {
    return uTintWaveSeg[i];
}

vec3 getTintEpi(int i) {
    return uTintEpiSeg[i];
}

SegData getSegment(float t) {
    SegData s;
    s.intensities = vec4(0.0);
    s.shapeCounts = vec4(0.0);
    s.tintCirc = vec3(1.0);
    s.tintWave = vec3(1.0);
    s.tintEpi = vec3(1.0);
    // Default to the last segment
    s.idx = uNumSegments - 1;

    int cur = -1;
    float start = 0.0;
    float dur = 0.0;
    // Utilise une borne fixe (MAX_SEGMENTS) pour respecter GLSL ES.
    // On quitte la boucle dès que l’on dépasse uNumSegments ou que l’on a trouvé le segment.
    for (int i = 0; i < MAX_SEGMENTS; i++) {
        // Arrêter la recherche si on dépasse le nombre de segments valides.
        if (i >= uNumSegments) {
            break;
        }
        float ss = uSegStart[i];
        float dd = uSegDur[i];
        if (t >= ss && t < ss + dd) {
            cur   = i;
            start = ss;
            dur   = dd;
            break;
        }
    }
    if (cur == -1) {
        cur = uNumSegments - 1;
        start = uSegStart[cur];
        dur = uSegDur[cur];
    }

    s.idx = cur;
    float tIn = t - start;
    float prog = clamp(tIn / dur, 0.0, 1.0);

    // Retrieve current and next segment data
    vec4 intensityA = getIntensityForSeg(cur);
    vec4 intensityB = (cur < uNumSegments - 1) ? getIntensityForSeg(cur + 1) : intensityA;

    vec4 shapeCountsA = getShapeCountsForSeg(cur);
    vec4 shapeCountsB = (cur < uNumSegments - 1) ? getShapeCountsForSeg(cur + 1) : shapeCountsA;

    vec3 tintCircA = getTintCirc(cur);
    vec3 tintCircB = (cur < uNumSegments - 1) ? getTintCirc(cur + 1) : tintCircA;

    vec3 tintWaveA = getTintWave(cur);
    vec3 tintWaveB = (cur < uNumSegments - 1) ? getTintWave(cur + 1) : tintWaveA;

    vec3 tintEpiA = getTintEpi(cur);
    vec3 tintEpiB = (cur < uNumSegments - 1) ? getTintEpi(cur + 1) : tintEpiA;

    // Smooth transition if within the transition zone at the end of the segment
    if (cur < uNumSegments - 1 && tIn > dur - TRANSITION) {
        float k = easeInOut(clamp((tIn - (dur - TRANSITION)) / TRANSITION, 0.0, 1.0));
        s.intensities = mix(intensityA, intensityB, k);
        s.shapeCounts = mix(shapeCountsA, shapeCountsB, k);
        s.tintCirc = mix(tintCircA, tintCircB, k);
        s.tintWave = mix(tintWaveA, tintWaveB, k);
        s.tintEpi = mix(tintEpiA, tintEpiB, k);
    } else {
        s.intensities = intensityA;
        s.shapeCounts = shapeCountsA;
        s.tintCirc = tintCircA;
        s.tintWave = tintWaveA;
        s.tintEpi = tintEpiA;
    }

    s.progress = prog;
    return s;
}

// ---------- FORMES ----------
float circleLine(vec2 p, float r, float th, float g, float sharp) {
    float d = abs(length(p) - r);
    float l = softBand(d, th);
    float glow = g * exp(-d * sharp);
    return clamp(l + glow, 0.0, 1.0);
}

vec3 renderCircles(vec2 p, float t, float inten, vec3 tint, float numCirclesFloat) {
    if (inten <= 0.0) return vec3(0.0);
    int maxCircles = int(ceil(numCirclesFloat));
    maxCircles = clamp(maxCircles, 0, MAX_CIRCLES);
    if (maxCircles == 0) return vec3(0.0);

    vec3 col = vec3(0.0);
    const float wob = 0.01;

    for (int i = 0; i < MAX_CIRCLES; i++) {
        if (i >= maxCircles) break;
        // Calcul du fade pour cette forme spécifique
        float shapeAlpha = clamp(numCirclesFloat - float(i), 0.0, 1.0);

        float r = C_R[i] * (1.0 + wob * sin(t * (0.5 + float(i) * 0.05)));
        float m = circleLine(p, r, C_THICK[i], C_GLOW[i], C_GLOW_SHARP);
        vec3 baseColor = (i == 0) ? uCircleColor0 : (i == 1) ? uCircleColor1 : uCircleColor2;
        col += m * (baseColor * tint) * shapeAlpha;
    }
    return col * inten * MASTER_CIRCLES;
}

vec3 renderExpandingCircles(vec2 p, float t, float inten, float numExpandFloat) {
    if (inten <= 0.0) return vec3(0.0);
    int maxExpand = int(ceil(numExpandFloat));
    maxExpand = clamp(maxExpand, 0, MAX_EXPAND_CIRCLES);
    if (maxExpand == 0) return vec3(0.0);

    vec3 col = vec3(0.0);
    for (int i = 0; i < MAX_EXPAND_CIRCLES; i++) {
        if (i >= maxExpand) break;
        // Calcul du fade pour cette forme spécifique
        float shapeAlpha = clamp(numExpandFloat - float(i), 0.0, 1.0);

        float off = float(i) * (EXPAND_PERIOD / max(1.0, numExpandFloat));
        float tt = mod(t + off, EXPAND_PERIOD);
        if (tt < EXPAND_DURATION) {
            float prog = tt / EXPAND_DURATION;
            float radius = prog * EXPAND_MAX_RADIUS;
            float alpha = (1.0 - prog);
            alpha *= alpha * shapeAlpha;
            float d = abs(length(p) - radius);
            float l = softBand(d, EXPAND_THICKNESS);
            float g = EXPAND_GLOW * exp(-d * 50.0);
            col += uExpandColor * (l + g) * alpha;
        }
    }
    return col * inten;
}

float waveY(float x, float A, float F, float ph) {
    return A * sin(F * x + ph) + 0.45 * A * sin(0.5 * F * x - 1.7 * ph) + 0.2 * A * sin(1.8 * F * x + 2.3 * ph);
}

vec3 renderWaves(vec2 p, float t, float inten, vec3 tint, float numWavesFloat) {
    if (inten <= 0.0) return vec3(0.0);
    int maxWaves = int(ceil(numWavesFloat));
    maxWaves = clamp(maxWaves, 0, MAX_WAVE_LAYERS);
    if (maxWaves == 0) return vec3(0.0);

    vec3 col = vec3(0.0);
    for (int i = 0; i < MAX_WAVE_LAYERS; i++) {
        if (i >= maxWaves) break;
        // Calcul du fade pour cette forme spécifique
        float shapeAlpha = clamp(numWavesFloat - float(i), 0.0, 1.0);

        float ph = t * W_SPEED[i] + float(i) * 0.8;
        float y = waveY(p.x + 0.5 * float(i), W_AMP[i], W_FREQ[i], ph);
        float d = abs(p.y - y);
        float band = softBand(d, W_THICK[i]);
        float glow = 5.2 * exp(-d * 50.0);
        vec3 base = (i == 0) ? uWaveColor0 : (i == 1) ? uWaveColor1 : uWaveColor2;
        col += (base * tint) * (0.8 * band + 0.35 * glow) * shapeAlpha;
    }
    return col * inten * MASTER_WAVES;
}

vec2 epicycloid(float tt, float R, float r) {
    float k = (R + r) / r;
    return vec2(
        (R + r) * cos(tt) - r * cos(k * tt),
        (R + r) * sin(tt) - r * sin(k * tt)
    );
}

vec3 renderEpicycloids(vec2 p, float t, float inten, vec3 tint, float numEpiFloat) {
    if (inten <= 0.0) return vec3(0.0);
    int maxEpi = int(ceil(numEpiFloat));
    maxEpi = clamp(maxEpi, 0, MAX_EPI);
    if (maxEpi == 0) return vec3(0.0);

    vec3 outC = vec3(0.0);
    for (int i = 0; i < MAX_EPI; i++) {
        if (i >= maxEpi) break;
        // Calcul du fade pour cette forme spécifique
        float shapeAlpha = clamp(numEpiFloat - float(i), 0.0, 1.0);

        int SMPL = E_SAMPLES[i];
        float minD = 1e9;
        for (int j = 0; j < MAX_EPI_SAMPLES; j++) {
            if (j >= SMPL) break;
            float a = TAU * float(j) / float(SMPL) * 8.0 + t * E_SPEED[i];
            vec2 q = epicycloid(a, E_R[i], E_r[i]) * E_SCALE[i];
            minD = min(minD, length(p - q));
        }
        float line = softBand(minD, E_THICK[i]);
        float glow = E_GLOW[i] * exp(-minD * 100.0);
        float vGlow = 0.5 * exp(-abs(p.y) * 10.0);
        line *= mix(1.0, vGlow, 0.3);
        vec3 base = (i == 0) ? uEpiColor0 : uEpiColor1;
        outC += (base * tint) * (line + glow) * shapeAlpha;
    }
    return outC * inten * MASTER_EPIS;
}

// ---------- MAIN ----------
void main() {
    vec2 p = uvNorm();
    vec3 col = uBackgroundColor;

    SegData seg = getSegment(iTime);

    col += renderCircles(p, iTime, seg.intensities.x, seg.tintCirc, seg.shapeCounts.x);
    col += renderWaves(p, iTime, seg.intensities.y, seg.tintWave, seg.shapeCounts.z);
    col += renderEpicycloids(p, iTime, seg.intensities.z, seg.tintEpi, seg.shapeCounts.w);
    col += renderExpandingCircles(p, iTime, seg.intensities.w, seg.shapeCounts.y);

    gl_FragColor = vec4(col, 1.0);
}