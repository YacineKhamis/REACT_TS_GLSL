// ========================================
// FRAGMENT SHADER — Timeline modulaire FLEXIBLE
// Per-instance parameters with smooth interpolation
// ========================================

// ------------ UNIFORMS MINIMALES ------------
#define MAX_SEGMENTS 20
#define MAX_INSTANCES 8
uniform vec2 uResolution;
uniform float iTime;

// Global settings
uniform float uEpiSampleFactor;

// Per-segment background colors
uniform vec3 uBgColorSeg[MAX_SEGMENTS];

// Per-instance uniforms for current and previous segment only (2 * MAX_INSTANCES = 16 slots each)
// Index 0-7: previous segment, Index 8-15: current segment
#define TOTAL_INSTANCE_SLOTS 16
uniform vec3 uCircleColors[TOTAL_INSTANCE_SLOTS];
uniform float uCircleIntensities[TOTAL_INSTANCE_SLOTS];
uniform int uCircleShapeType[TOTAL_INSTANCE_SLOTS];
uniform float uCircleRotationSpeed[TOTAL_INSTANCE_SLOTS];
uniform vec3 uWaveColors[TOTAL_INSTANCE_SLOTS];
uniform float uWaveIntensities[TOTAL_INSTANCE_SLOTS];
uniform vec3 uEpiColors[TOTAL_INSTANCE_SLOTS];
uniform float uEpiIntensities[TOTAL_INSTANCE_SLOTS];
uniform vec3 uExpandColors[TOTAL_INSTANCE_SLOTS];
uniform float uExpandIntensities[TOTAL_INSTANCE_SLOTS];
uniform float uExpandStartRadius[TOTAL_INSTANCE_SLOTS];

// Per-instance geometric parameters
uniform float uCircleRadius[TOTAL_INSTANCE_SLOTS];
uniform float uCircleThickness[TOTAL_INSTANCE_SLOTS];
uniform float uCircleGlow[TOTAL_INSTANCE_SLOTS];
uniform float uExpandPeriod[TOTAL_INSTANCE_SLOTS];
uniform float uExpandThickness[TOTAL_INSTANCE_SLOTS];
uniform float uExpandGlow[TOTAL_INSTANCE_SLOTS];
uniform float uExpandSpeed[TOTAL_INSTANCE_SLOTS];
uniform float uExpandStartTime[TOTAL_INSTANCE_SLOTS];
uniform float uExpandAttack[TOTAL_INSTANCE_SLOTS];
uniform float uExpandDecay[TOTAL_INSTANCE_SLOTS];
uniform int uExpandShapeType[TOTAL_INSTANCE_SLOTS];
uniform int uExpandPulseMode[TOTAL_INSTANCE_SLOTS];
uniform float uWaveAmplitude[TOTAL_INSTANCE_SLOTS];
uniform float uWaveFrequency[TOTAL_INSTANCE_SLOTS];
uniform float uWaveSpeed[TOTAL_INSTANCE_SLOTS];
uniform float uWaveThickness[TOTAL_INSTANCE_SLOTS];
uniform float uWaveGlow[TOTAL_INSTANCE_SLOTS];
uniform float uEpiR[TOTAL_INSTANCE_SLOTS];
uniform float uEpir[TOTAL_INSTANCE_SLOTS];
uniform float uEpiScale[TOTAL_INSTANCE_SLOTS];
uniform float uEpiThickness[TOTAL_INSTANCE_SLOTS];
uniform float uEpiSpeed[TOTAL_INSTANCE_SLOTS];
uniform float uEpiGlow[TOTAL_INSTANCE_SLOTS];
uniform int uEpiSamples[TOTAL_INSTANCE_SLOTS];

// ---------- TIMELINE UNIFORMS ----------
uniform int uNumSegments;
uniform float uSegStart[MAX_SEGMENTS];
uniform float uSegDur[MAX_SEGMENTS];
uniform float uSegTransitionDur[MAX_SEGMENTS];
// Format vec4: .x = nb circles, .y = nb expand circles, .z = nb waves, .w = nb epis
uniform vec4 uShapeCountsSeg[MAX_SEGMENTS];

// ---------- CONSTANTES ----------
// Early exit threshold for epicycloid distance calculations
const float EARLY_EXIT_THRESHOLD = 0.001;

// Paramètres par défaut (supportent maintenant jusqu'à 8 instances)
// Cercles fixes
const int MAX_CIRCLES = 8;
const float C_R[MAX_CIRCLES] = float[](0.01, 0.06, 0.06, 0.45, 0.44, 0.16, 0.9, 0.95);
const float C_THICK[MAX_CIRCLES] = float[](0.0005, 0.0006, 0.0005, 0.0005, 0.0005, 0.0002, 0.0004, 0.0009);
const float C_GLOW[MAX_CIRCLES] = float[](1.50, 0.85, 0.1, 1.3, .20, 0.9, 0.6, 1.7);
const float C_GLOW_SHARP = 80.0;

// Cercles expansifs
const int MAX_EXPAND_CIRCLES = 8;
const float EXPAND_THICKNESS = 0.0001;
const float EXPAND_GLOW = 3.5;

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

float sdSquare(vec2 p, float halfExtent) {
    vec2 d = abs(p) - vec2(halfExtent);
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

float sdEquilateralTriangle(vec2 p, float radius) {
    float safeRadius = max(radius, 1e-5);
    vec2 q = p / safeRadius;
    const float k = 1.7320508;
    q.x = abs(q.x) - 1.0;
    q.y = q.y + 1.0 / k;
    if (q.x + k * q.y > 0.0) {
        q = vec2(q.x - k * q.y, -k * q.x - q.y) / 2.0;
    }
    q.x -= clamp(q.x, -2.0, 0.0);
    float dist = -length(q) * sign(q.y);
    return dist * safeRadius;
}

float sdHeart(vec2 p, float radius) {
    float safeRadius = max(radius, 1e-5);
    vec2 q = p / safeRadius;
    q.y -= 0.25;
    float a = atan(q.x, q.y) / 3.14159265;
    float h = length(q);
    float dist = h - (0.5 + 0.3 * (1.0 - q.y) + 0.2 * cos(3.14159265 * a));
    return dist * safeRadius;
}

float shapeRadiusScale(int shapeType) {
    if (shapeType == 1) return 0.70710678; // square
    if (shapeType == 2) return 0.8660254; // triangle
    if (shapeType == 3) return 0.9; // heart
    return 1.0;
}

float shapeDistance(int shapeType, vec2 p, float radius) {
    if (shapeType == 1) {
        return sdSquare(p, radius);
    }
    if (shapeType == 2) {
        return sdEquilateralTriangle(p, radius);
    }
    if (shapeType == 3) {
        return sdHeart(p, radius);
    }
    return length(p) - radius;
}

vec2 rotate2D(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// ---------- PER-INSTANCE DATA ACCESSORS ----------
// segmentType: 0 = previous, 1 = current
int getInstanceIndex(int segmentType, int instanceIdx) {
    int offset = segmentType * MAX_INSTANCES; // 0 for prev, 8 for current
    return offset + clamp(instanceIdx, 0, MAX_INSTANCES - 1);
}

int selectDiscrete(int prevValue, int currValue, float blendFactor) {
    return blendFactor < 0.5 ? prevValue : currValue;
}

// Circle accessors
vec3 getCircleColor(int segType, int instIdx) {
    return uCircleColors[getInstanceIndex(segType, instIdx)];
}
float getCircleIntensity(int segType, int instIdx) {
    return uCircleIntensities[getInstanceIndex(segType, instIdx)];
}
int getCircleShape(int segType, int instIdx) {
    return uCircleShapeType[getInstanceIndex(segType, instIdx)];
}

// Wave accessors
vec3 getWaveColor(int segType, int instIdx) {
    return uWaveColors[getInstanceIndex(segType, instIdx)];
}
float getWaveIntensity(int segType, int instIdx) {
    return uWaveIntensities[getInstanceIndex(segType, instIdx)];
}

// Epicycloid accessors
vec3 getEpiColor(int segType, int instIdx) {
    return uEpiColors[getInstanceIndex(segType, instIdx)];
}
float getEpiIntensity(int segType, int instIdx) {
    return uEpiIntensities[getInstanceIndex(segType, instIdx)];
}

// Expanding circle accessors
vec3 getExpandColor(int segType, int instIdx) {
    return uExpandColors[getInstanceIndex(segType, instIdx)];
}
float getExpandIntensity(int segType, int instIdx) {
    return uExpandIntensities[getInstanceIndex(segType, instIdx)];
}
float getExpandStartRadius(int segType, int instIdx) {
    return uExpandStartRadius[getInstanceIndex(segType, instIdx)];
}
float getExpandStartTime(int segType, int instIdx) {
    return uExpandStartTime[getInstanceIndex(segType, instIdx)];
}
float getExpandAttack(int segType, int instIdx) {
    return uExpandAttack[getInstanceIndex(segType, instIdx)];
}
float getExpandDecay(int segType, int instIdx) {
    return uExpandDecay[getInstanceIndex(segType, instIdx)];
}
int getExpandShapeType(int segType, int instIdx) {
    return uExpandShapeType[getInstanceIndex(segType, instIdx)];
}
int getExpandPulseMode(int segType, int instIdx) {
    return uExpandPulseMode[getInstanceIndex(segType, instIdx)];
}

// ---------- TIMELINE ----------
struct SegData {
    vec4 shapeCounts; // x=nb circles, y=nb expandCircles, z=nb waves, w=nb epis
    vec3 bgColor;     // Couleur de fond interpolée
    float progress;
    int idx;          // Current segment index
    int prevIdx;      // Previous segment index (for interpolation)
    float blendFactor; // Interpolation factor (0=prev, 1=current)
};

vec4 getShapeCountsForSeg(int i) {
    return uShapeCountsSeg[i];
}

vec3 getBgColor(int i) {
    return uBgColorSeg[i];
}

SegData getSegment(float t) {
    SegData s;
    s.shapeCounts = vec4(0.0);
    s.bgColor = vec3(0.0);
    s.progress = 0.0;
    s.idx = uNumSegments - 1;
    s.prevIdx = 0;
    s.blendFactor = 1.0;

    int cur = -1;
    float start = 0.0;
    float dur = 0.0;

    // Find current segment
    for (int i = 0; i < MAX_SEGMENTS; i++) {
        if (i >= uNumSegments) break;
        float ss = uSegStart[i];
        float dd = uSegDur[i];
        if (t >= ss && t < ss + dd) {
            cur = i;
            start = ss;
            dur = dd;
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
    float prog = (dur > 0.0) ? clamp(tIn / max(dur, 0.0001), 0.0, 1.0) : 0.0;
    s.progress = prog;

    // Get current segment data
    vec4 shapeCountsCurr = getShapeCountsForSeg(cur);
    vec3 bgColorCurr = getBgColor(cur);

    // Determine if we're in transition from previous segment
    int prevIndex = max(0, cur - 1);
    s.prevIdx = prevIndex;

    float transitionDur = uSegTransitionDur[cur];

    if (cur > 0 && tIn < transitionDur) {
        // We're in transition period - interpolate
        float k = easeInOut(clamp(tIn / max(transitionDur, 0.0001), 0.0, 1.0));
        s.blendFactor = k;

        vec4 shapeCountsPrev = getShapeCountsForSeg(prevIndex);
        vec3 bgColorPrev = getBgColor(prevIndex);

        s.shapeCounts = mix(shapeCountsPrev, shapeCountsCurr, k);
        s.bgColor = mix(bgColorPrev, bgColorCurr, k);
    } else {
        // No transition - use current values directly
        s.blendFactor = 1.0;
        s.shapeCounts = shapeCountsCurr;
        s.bgColor = bgColorCurr;
    }

    return s;
}

// ---------- FORMES ----------
vec3 renderCircles(vec2 p, float t, float numCirclesFloat, float blendFactor) {
    int maxCircles = int(ceil(numCirclesFloat));
    maxCircles = clamp(maxCircles, 0, MAX_CIRCLES);
    if (maxCircles == 0) return vec3(0.0);

    vec3 col = vec3(0.0);
    const float wob = 0.01;

    for (int i = 0; i < MAX_CIRCLES; i++) {
        if (i >= maxCircles) break;
        float shapeAlpha = clamp(numCirclesFloat - float(i), 0.0, 1.0);

        vec3 colorCurr = getCircleColor(1, i);
        float intensityCurr = getCircleIntensity(1, i);
        int shapeCurr = getCircleShape(1, i);

        vec3 finalColor = colorCurr;
        float finalIntensity = intensityCurr;

        if (blendFactor < 1.0) {
            vec3 colorPrev = getCircleColor(0, i);
            float intensityPrev = getCircleIntensity(0, i);
            int shapePrev = getCircleShape(0, i);
            finalColor = mix(colorPrev, colorCurr, blendFactor);
            finalIntensity = mix(intensityPrev, intensityCurr, blendFactor);
            shapeCurr = selectDiscrete(shapePrev, shapeCurr, blendFactor);
        }

        if (finalIntensity <= 0.0) continue;

        // Use uniforms for geometric parameters (blend between prev and current segment)
        int idxPrev = i;
        int idxCurr = 8 + i;
        float radiusPrev = uCircleRadius[idxPrev];
        float radiusCurr = uCircleRadius[idxCurr];
        float thicknessPrev = uCircleThickness[idxPrev];
        float thicknessCurr = uCircleThickness[idxCurr];
        float glowPrev = uCircleGlow[idxPrev];
        float glowCurr = uCircleGlow[idxCurr];
        float rotPrev = uCircleRotationSpeed[idxPrev];
        float rotCurr = uCircleRotationSpeed[idxCurr];

        float finalRadius = mix(radiusPrev, radiusCurr, blendFactor);
        float finalThickness = mix(thicknessPrev, thicknessCurr, blendFactor);
        float finalGlow = mix(glowPrev, glowCurr, blendFactor);
        float finalRotation = mix(rotPrev, rotCurr, blendFactor);

        float r = finalRadius * (1.0 + wob * sin(t * (0.5 + float(i) * 0.05)));
        float scaledRadius = r * shapeRadiusScale(shapeCurr);
        vec2 shapePoint = p;
        if (shapeCurr == 1 || shapeCurr == 2) {
            shapePoint = rotate2D(p, finalRotation * t);
        }
        float dist = shapeDistance(shapeCurr, shapePoint, scaledRadius);
        float d = abs(dist);
        float m = softBand(d, finalThickness);
        float g = finalGlow * exp(-d * C_GLOW_SHARP);
        col += (m + g) * finalColor * finalIntensity * shapeAlpha;
    }
    return col;
}

vec3 renderExpandingCircles(vec2 p, float t, float numExpandFloat, float blendFactor) {
    int maxExpand = int(ceil(numExpandFloat));
    maxExpand = clamp(maxExpand, 0, MAX_EXPAND_CIRCLES);
    if (maxExpand == 0) return vec3(0.0);

    vec3 col = vec3(0.0);
    for (int i = 0; i < MAX_EXPAND_CIRCLES; i++) {
        if (i >= maxExpand) break;
        float shapeAlpha = clamp(numExpandFloat - float(i), 0.0, 1.0);

        vec3 colorCurr = getExpandColor(1, i);
        float intensityCurr = getExpandIntensity(1, i);
        float startRadiusCurr = getExpandStartRadius(1, i);
        float startTimeCurr = getExpandStartTime(1, i);

        vec3 finalColor = colorCurr;
        float finalIntensity = intensityCurr;
        float finalStartRadius = startRadiusCurr;
        float finalStartTime = startTimeCurr;
        float finalAttack = getExpandAttack(1, i);
        float finalDecay = getExpandDecay(1, i);
        int finalShapeType = getExpandShapeType(1, i);
        int finalPulseMode = getExpandPulseMode(1, i);

        if (blendFactor < 1.0) {
            vec3 colorPrev = getExpandColor(0, i);
            float intensityPrev = getExpandIntensity(0, i);
            float attackPrev = getExpandAttack(0, i);
            float decayPrev = getExpandDecay(0, i);
            // Interpolate visual parameters only (smooth color/intensity transitions)
            finalColor = mix(colorPrev, colorCurr, blendFactor);
            finalIntensity = mix(intensityPrev, intensityCurr, blendFactor);
            finalAttack = mix(attackPrev, finalAttack, blendFactor);
            finalDecay = mix(decayPrev, finalDecay, blendFactor);
            // Do NOT interpolate temporal parameters (prevents visual backward motion)
            // finalStartRadius, finalStartTime, finalShapeType, finalPulseMode use current segment values
        }

        if (finalIntensity <= 0.0) continue;

        // Use uniforms for geometric parameters
        // For expanding circles: interpolate visual params only, NOT temporal params
        int idxPrev = i;
        int idxCurr = 8 + i;
        float thicknessPrev = uExpandThickness[idxPrev];
        float thicknessCurr = uExpandThickness[idxCurr];
        float glowPrev = uExpandGlow[idxPrev];
        float glowCurr = uExpandGlow[idxCurr];

        // Interpolate visual parameters (smooth style transitions)
        float finalThickness = mix(thicknessPrev, thicknessCurr, blendFactor);
        float finalGlow = mix(glowPrev, glowCurr, blendFactor);

        // Use current segment values for temporal parameters (prevents backward motion)
        float finalPeriod = uExpandPeriod[idxCurr];
        float finalExpansionSpeed = uExpandSpeed[idxCurr];
        float off = float(i) * (finalPeriod / max(1.0, numExpandFloat));
        float cycleDuration = max(finalPeriod, 0.0001);
        float localTime = (t - finalStartTime) + off;
        float tt = localTime;
        if (finalPulseMode == 0) {
            tt = mod(localTime, cycleDuration);
            if (tt < 0.0) {
                tt += cycleDuration;
            }
        } else {
            if (tt < 0.0 || tt > cycleDuration + finalDecay) {
                continue;
            }
        }
        if (tt < 0.0) {
            continue;
        }
        // Calculate radius based on expansion speed (units per second)
        float radius = finalStartRadius + finalExpansionSpeed * tt;
        // Optimization: skip rendering if shape is completely off-screen
        if (radius > 2.0) {
            continue;
        }
        float prog = clamp(tt / cycleDuration, 0.0, 1.0); // Still used for alpha fade
        float scaledRadius = radius * shapeRadiusScale(finalShapeType);
        float attackTime = max(0.001, finalAttack);
        float decayTime = max(0.001, finalDecay);
        float decayStart = max(0.0, cycleDuration - decayTime);
        float envelope = smoothstep(0.0, attackTime, tt) * (1.0 - smoothstep(decayStart, decayStart + decayTime, tt));
        float alpha = (1.0 - prog);
        alpha *= alpha * shapeAlpha * clamp(envelope, 0.0, 1.0);
        if (alpha <= 0.0) {
            continue;
        }
        float dist = shapeDistance(finalShapeType, p, scaledRadius);
        float d = abs(dist);
        float l = softBand(d, finalThickness);
        float g = finalGlow * exp(-d * 50.0);
        col += finalColor * (l + g) * alpha * finalIntensity;
    }
    return col;
}

float waveY(float x, float A, float F, float ph) {
    return A * sin(F * x + ph) + 0.45 * A * sin(0.5 * F * x - 1.7 * ph) + 0.2 * A * sin(1.8 * F * x + 2.3 * ph);
}

vec3 renderWaves(vec2 p, float t, float numWavesFloat, float blendFactor) {
    int maxWaves = int(ceil(numWavesFloat));
    maxWaves = clamp(maxWaves, 0, MAX_WAVE_LAYERS);
    if (maxWaves == 0) return vec3(0.0);

    vec3 col = vec3(0.0);
    for (int i = 0; i < MAX_WAVE_LAYERS; i++) {
        if (i >= maxWaves) break;
        float shapeAlpha = clamp(numWavesFloat - float(i), 0.0, 1.0);

        vec3 colorCurr = getWaveColor(1, i);
        float intensityCurr = getWaveIntensity(1, i);

        vec3 finalColor = colorCurr;
        float finalIntensity = intensityCurr;

        if (blendFactor < 1.0) {
            vec3 colorPrev = getWaveColor(0, i);
            float intensityPrev = getWaveIntensity(0, i);
            finalColor = mix(colorPrev, colorCurr, blendFactor);
            finalIntensity = mix(intensityPrev, intensityCurr, blendFactor);
        }

        if (finalIntensity <= 0.0) continue;

        // Use uniforms for geometric parameters (blend between prev and current segment)
        int idxPrev = i;
        int idxCurr = 8 + i;
        float ampPrev = uWaveAmplitude[idxPrev];
        float ampCurr = uWaveAmplitude[idxCurr];
        float freqPrev = uWaveFrequency[idxPrev];
        float freqCurr = uWaveFrequency[idxCurr];
        float speedPrev = uWaveSpeed[idxPrev];
        float speedCurr = uWaveSpeed[idxCurr];
        float thicknessPrev = uWaveThickness[idxPrev];
        float thicknessCurr = uWaveThickness[idxCurr];
        float glowPrev = uWaveGlow[idxPrev];
        float glowCurr = uWaveGlow[idxCurr];

        float finalAmp = mix(ampPrev, ampCurr, blendFactor);
        float finalFreq = mix(freqPrev, freqCurr, blendFactor);
        float finalSpeed = mix(speedPrev, speedCurr, blendFactor);
        float finalThickness = mix(thicknessPrev, thicknessCurr, blendFactor);
        float finalGlow = mix(glowPrev, glowCurr, blendFactor);

        float ph = t * finalSpeed + float(i) * 0.8;
        float y = waveY(p.x + 0.5 * float(i), finalAmp, finalFreq, ph);
        float d = abs(p.y - y);
        float band = softBand(d, finalThickness);
        float glow = finalGlow * exp(-d * 50.0);
        col += finalColor * (0.8 * band + 0.35 * glow) * finalIntensity * shapeAlpha;
    }
    return col;
}

vec2 epicycloid(float tt, float R, float r) {
    float k = (R + r) / r;
    return vec2(
        (R + r) * cos(tt) - r * cos(k * tt),
        (R + r) * sin(tt) - r * sin(k * tt)
    );
}

vec3 renderEpicycloids(vec2 p, float t, float numEpiFloat, float blendFactor) {
    int maxEpi = int(ceil(numEpiFloat));
    maxEpi = clamp(maxEpi, 0, MAX_EPI);
    if (maxEpi == 0) return vec3(0.0);

    vec3 outC = vec3(0.0);
    float epiFactor = clamp(uEpiSampleFactor, 0.05, 2.0);
    for (int i = 0; i < MAX_EPI; i++) {
        if (i >= maxEpi) break;
        float shapeAlpha = clamp(numEpiFloat - float(i), 0.0, 1.0);

        vec3 colorCurr = getEpiColor(1, i);
        float intensityCurr = getEpiIntensity(1, i);

        vec3 finalColor = colorCurr;
        float finalIntensity = intensityCurr;

        if (blendFactor < 1.0) {
            vec3 colorPrev = getEpiColor(0, i);
            float intensityPrev = getEpiIntensity(0, i);
            finalColor = mix(colorPrev, colorCurr, blendFactor);
            finalIntensity = mix(intensityPrev, intensityCurr, blendFactor);
        }

        if (finalIntensity <= 0.0) continue;

        // Use uniforms for geometric parameters (blend between prev and current segment)
        int idxPrev = i;
        int idxCurr = 8 + i;
        float RPrev = uEpiR[idxPrev];
        float RCurr = uEpiR[idxCurr];
        float rPrev = uEpir[idxPrev];
        float rCurr = uEpir[idxCurr];
        float scalePrev = uEpiScale[idxPrev];
        float scaleCurr = uEpiScale[idxCurr];
        float thicknessPrev = uEpiThickness[idxPrev];
        float thicknessCurr = uEpiThickness[idxCurr];
        float speedPrev = uEpiSpeed[idxPrev];
        float speedCurr = uEpiSpeed[idxCurr];
        float glowPrev = uEpiGlow[idxPrev];
        float glowCurr = uEpiGlow[idxCurr];
        int samplesPrev = uEpiSamples[idxPrev];
        int samplesCurr = uEpiSamples[idxCurr];

        float finalR = mix(RPrev, RCurr, blendFactor);
        float finalr = mix(rPrev, rCurr, blendFactor);
        float finalScale = mix(scalePrev, scaleCurr, blendFactor);
        float finalThickness = mix(thicknessPrev, thicknessCurr, blendFactor);
        float finalSpeed = mix(speedPrev, speedCurr, blendFactor);
        float finalGlow = mix(glowPrev, glowCurr, blendFactor);
        int baseSamples = int(mix(float(samplesPrev), float(samplesCurr), blendFactor));

        int scaledSamples = max(1, int(float(baseSamples) * epiFactor));
        int capSamples = max(1, int(float(MAX_EPI_SAMPLES) * epiFactor));
        int SMPL = min(scaledSamples, capSamples);
        float minD = 1e9;
        for (int j = 0; j < MAX_EPI_SAMPLES; j++) {
            if (j >= SMPL) break;
            float a = TAU * float(j) / float(SMPL) * 8.0 + t * finalSpeed;
            vec2 q = epicycloid(a, finalR, finalr) * finalScale;
            minD = min(minD, length(p - q));
            if (minD < EARLY_EXIT_THRESHOLD) break;
        }
        float line = softBand(minD, finalThickness);
        float glow = finalGlow * exp(-minD * 100.0);
        float vGlow = 0.5 * exp(-abs(p.y) * 10.0);
        line *= mix(1.0, vGlow, 0.3);
        outC += finalColor * (line + glow) * finalIntensity * shapeAlpha;
    }
    return outC;
}

// ---------- MAIN ----------
void main() {
    vec2 p = uvNorm();
    SegData seg = getSegment(iTime);
    vec3 col = seg.bgColor;

    col += renderCircles(p, iTime, seg.shapeCounts.x, seg.blendFactor);
    col += renderWaves(p, iTime, seg.shapeCounts.z, seg.blendFactor);
    col += renderEpicycloids(p, iTime, seg.shapeCounts.w, seg.blendFactor);
    col += renderExpandingCircles(p, iTime, seg.shapeCounts.y, seg.blendFactor);

    gl_FragColor = vec4(col, 1.0);
}
