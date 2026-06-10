// ============================================================================
// Stack layout · transcribed verbatim from animejs.com/assets/js/scripts.js
// (v4.3.5-6). This is the single source of truth for both `composer.html`
// and runtime `app.js`. Any manual tweaks should happen in one place and be
// re-exported from here.
//
// Axis convention
//   +Z toward viewer (light enters from +Z, sensor sits at -Z)
//   +Y up
//   rotations in DEGREES (converted to radians by the consumer)
// ============================================================================

export const DEG = Math.PI / 180;

// ---- helpers used by the per-module children constructors ----
function timelineRing() {
  return Array.from({ length: 8 }, (_, i) => {
    const a = i * 45 * DEG;
    return {
      glb: "timeline-02",
      t: { x: Math.cos(a) * 0.68, y: Math.sin(a) * 0.68, z: -0.35, rotateZ: -90 + i * 45 },
    };
  });
}
function staggerStack() {
  return Array.from({ length: 4 }, (_, i) => ({ glb: "stagger-02", t: { z: -0.1 * i + 0.06 } }));
}
function animateGrid() {
  const cols = 5, gap = 0.18;
  return Array.from({ length: 13 }, (_, i) => {
    const cx = (i % cols) - 2;
    const cy = Math.floor(i / cols) - 1;
    return { glb: "easing-01", t: { x: cx * gap, y: cy * gap * 1.2 - 0.05, z: 0 } };
  });
}
function draggableRing() {
  return Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2;
    return { glb: "draggable-02", t: { x: Math.sin(a) * 0.92, y: Math.cos(a) * 0.92, z: 0 } };
  });
}
function caseCorners(I, scale = 1, scaleZ = 1, zOffset = 0) {
  return [
    { t: { x: -I, y:  I, z: zOffset, rotateZ:    0, scale, scaleZ } },
    { t: { x:  I, y:  I, z: zOffset, rotateZ:  -90, scale, scaleZ } }, // inferred 4th corner
    { t: { x:  I, y: -I, z: zOffset, rotateZ: -180, scale, scaleZ } },
    { t: { x: -I, y: -I, z: zOffset, rotateZ: -270, scale, scaleZ } },
  ];
}
function ventStrips(I, W, zMin, zMax, count = 15) {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const z = W + zMin + t * (zMax - zMin);
    return { glb: "shield-02", t: { x: I, y: I, z, rotateZ: -90, scaleZ: 0.025 } };
  });
}

// ----------------------------------------------------------------------------
// LAYOUT — 15 parent groups (12 anime.js module layers + 3 case shell parts)
//
// Each entry:
//   key      — unique name; used for selection, visibility, and scene overrides
//   group    — "front" | "back" | "case" (for sidebar bucketing and per-scene rules)
//   role     — MetaSpectra+ semantic role (our re-casting layer)
//   parent   — transform of the parent group (anime.js numbers, rotations in DEGREES)
//   children — array of GLB instances with their own local transforms
// ----------------------------------------------------------------------------

// Cinematic layout: the camera body is now front-only (no back-half compute
// modules, no rear case panel). All core optical components are packed into a
// short Z range that fits inside the front half of the camera; scenes 4+ use
// applyExplode (with a higher factor than before) to spread them apart for the
// optical-diagram views.
//
//   cinematic Z spread (M₀ → sensor) = ~1.4 units (packed in front half)
//   exploded Z spread at peak        = ~3.0 units (clear stage separation)
export const LAYOUT = [
  // ===== OPTICAL FRONT (z > 0) =====
  // Lens length halved relative to the case01 mount (z=1.80): the original
  // protrusion of renderer/waapi/timeline beyond case01 is cut to ~50% so the
  // cinematic lens reads as a compact stub instead of a long zoom barrel.
  { key: "renderer", group: "front", role: "objective_lens",     parent: { z: 2.25, scale: 0.98 },
    children: [ { glb: "renderer-01", t: { z: 0.025 } } ] },

  { key: "waapi",    group: "front", role: "front_decor",        parent: { z: 2.20, scale: 0.80 },
    children: [ { glb: "waapi-01", t: {} } ] },

  { key: "timeline", group: "front", role: "barrel_ring",        parent: { z: 1.925 },
    children: [ { glb: "timeline-01", t: {} }, ...timelineRing() ] },

  // Core optical components — packed tightly into the front half of the body.
  // Scenes 4+ multiply these Z's via applyExplode for stage-by-stage clarity.
  { key: "stagger",  group: "front", role: "M0_beamsplitter ★",  parent: { z: 1.20 },
    // M₀ is one beamsplitting metasurface plate (per Meta4 fig 1). The 4 stacked
    // stagger-02 GLBs that anime.js used as decoration were collapsing to a fake
    // multi-layer M₀ — we drop them so the cinematic phase reads as one plate too.
    children: [ { glb: "stagger-01", t: {} } ] },

  { key: "svg",      group: "front", role: "M0_pattern_overlay", parent: { z: 0.95 },
    children: [ { glb: "svg-01", t: {} } ] },

  { key: "spring",   group: "front", role: "optical_gap",        parent: { z: 0.80 },
    children: [ { glb: "spring-01", t: {} } ] },

  { key: "timer",    group: "front", role: "M1_M4_dispersion ★", parent: { z: 0.55 },
    children: [
      { glb: "timer-01", t: { z:  0.075 } },
      { glb: "timer-02", t: { z: -0.080 } },
      { glb: "timer-03", t: { x: -0.225, y: 0.50, z: 0.16 } },
      { glb: "timer-04", t: { x:  0.500, y: 0.40, z: 0.16 } },
      { glb: "timer-05", t: { z: 0.26, scale: 0.95 } },
    ] },

  // Animate (eyepieces) and draggable (sensor) are spaced so that all three
  // optical gaps — M₀→M_i, M_i→eye, eye→sensor — equal 0.65 in cinematic
  // layout. The scene 8 explode (factor 2) then gives three uniform gaps of
  // 1.30 instead of the lopsided [1.30, 0.80, 0.70] the original packed
  // layout produced (user 2026-04-19).
  { key: "animate",  group: "front", role: "eyepieces ★",        parent: { z: -0.10 },
    children: animateGrid() },

  // ===== SENSOR (no compute back-half — removed per design) =====
  { key: "draggable", group: "back", role: "sensor_plate ★",     parent: { z: -0.75 },
    children: [ { glb: "draggable-01", t: {} }, ...draggableRing() ] },

  // ===== CASE SHELL =====
  // Case shell is now front-only — the rear cap (case02_back) was removed
  // since the optics are packed in the front half. Vent strips shortened
  // again so the lens barrel matches the halved cinematic lens length.
  { key: "case01",       group: "case", role: "front_edge_frame",    parent: { z: 1.80 },
    children: caseCorners(0.541, 0.925, 1).map((c) => ({ glb: "shield-01", ...c })) },

  { key: "case02_front", group: "case", role: "front_panel + vents", parent: { z: 0.35 },
    children: [
      ...caseCorners(0.585, 1, 1, 0.715).map((c) => ({ glb: "shield-02", ...c })),
      // Vents halved again: zMax 0.85 → 0.45, count 10 → 6. Lens barrel
      // now ends at world z ≈ 1.515 (well behind the gold lens face) so the
      // total camera silhouette is roughly half its previous length.
      ...ventStrips(0.585, 0.715, 0, 0.45, 6),
    ] },
];

// ----------------------------------------------------------------------------
// OPTICAL RECAST OVERRIDES — applied when the scroll enters Scene 5 and
// continues through Scene 8. These swap the anime.js child positions (and
// materials, at a higher layer) into MetaSpectra+ optical geometry.
//
// The shape of each override mirrors the child layout it replaces: positions
// are new LOCAL offsets on the same parent group, keyed by GLB name.
// ----------------------------------------------------------------------------

export const OPTICAL_RECAST = {
  // stagger: anime.js stagger module → single procedural M₀ beamsplitting
  // metasurface plate. The GLB hides; the procedural plate (buildM0Plate) takes
  // over with a uniform sub-wavelength dot pattern (no dispersion streak).
  stagger: {
    hide_all: true,
    material: "cyan_emissive_metasurface",
  },
  // timer: 5 scattered gears → 4 M₁-M₄ metasurfaces in a 2×2 grid, timer-05 hidden
  timer: {
    layout: [
      { glb: "timer-01", t: { x: -0.25, y:  0.25, z: 0 } },
      { glb: "timer-02", t: { x:  0.25, y:  0.25, z: 0 } },
      { glb: "timer-03", t: { x: -0.25, y: -0.25, z: 0 } },
      { glb: "timer-04", t: { x:  0.25, y: -0.25, z: 0 } },
      { glb: "timer-05", t: { visible: false } },
    ],
    material: "cyan_emissive_metasurface",
  },
  // animate: 13 easing discs → 4 eyepiece discs in 2×2, rest hidden
  animate: {
    // child index (in LAYOUT.animate.children) → override transform
    // easing-01 appears 13 times; we pick 4 by index and hide the other 9
    pick_by_index: {
      0:  { x: -0.3, y:  0.3, z: 0 },
      4:  { x:  0.3, y:  0.3, z: 0 },
      5:  { x: -0.3, y: -0.3, z: 0 },
      9:  { x:  0.3, y: -0.3, z: 0 },
    },
    hide_others: true,
    material: "warm_amber_glass",
  },
  // draggable: concentric-ring iris disc → sensor plate with 2×2 tile guides
  draggable: {
    // keep draggable-01 visible as the sensor disc, scale up slightly
    keep_primary: { glb: "draggable-01", t: { scale: 1.15 } },
    hide_others: true, // the 5 draggable-02 ring copies disappear
    material: "sensor_plate_2x2_tiles",
  },
};

// ----------------------------------------------------------------------------
// SCENE VISIBILITY MATRIX — for each scene, which top-level groups are visible.
// The `optical_recast` flag toggles the overrides above.
//
// Scene 3 (body dissolves) and Scene 11 (reassembly) are transitions: their
// `fading_*` entries are handled as opacity animations on the relevant groups.
// ----------------------------------------------------------------------------

// SCENE_VISIBILITY is no longer authored here — it is derived from
// src/config/timeline.js (single source of truth for scene durations + flags)
// via src/config/deriveTimeline.js. Edit timeline.js to change pacing or
// visibility flags. The historical design notes that lived in this section
// are preserved in the per-scene comments inside timeline.js.

// ----------------------------------------------------------------------------
// CAMERA POSES — keyframes per scene. Each pose is { position, target, fov }.
// The app interpolates between poses based on scroll progress within [range].
// Distances are in the same anime.js units as LAYOUT.
//
// Defaults aim for a subtle 3/4 axonometric drift, opening near the front
// (+Z side) and returning there for the hero shots (Scenes 1, 2, 11).
// ----------------------------------------------------------------------------

export const CAMERA_POSES = {
  // Scene 1: hero shot of the iPhone Air phone body, slight 3/4 so the
  // camera plateau (upper-back pill with single lens + flash) is visible.
  // Phone centered at world (0, 0, 0.35); spans X≈±0.67, Y≈±1.42 after
  // CameraBody's 18.1× scale, so target the phone center.
  scene1_title:          { position: [0.8,  0.3,   7.2], target: [0, 0,  0.35], fov: 28 },
  // Scene 2: zoom in toward the camera lens on the upper-LEFT of the
  // plateau (iPhone Air design). Lens world position ≈ (-0.34, 1.02, 0.47);
  // we frame it tight with a slight diagonal so the plateau pill reads
  // clearly. Phone fades out near the end (CameraBody opacity from m.case
  // "out") so by scene 3 the optical chain takes over the cleared frame.
  scene2_reveal:         { position: [-0.7, 1.3,   1.8], target: [-0.34, 1.02, 0.47], fov: 30 },
  scene3_body_dissolves: { position: [4.5,  2.0,   5.0], target: [0, 0,  0.5], fov: 36 },
  scene3_barrel_opens:   { position: [3.8,  1.6,   5.8], target: [0, 0,  0.5], fov: 38 },
  scene5_stack:          { position: [3.5,  1.4,   6.0], target: [0, 0,  0.4], fov: 38 }, // pivot — show full stack centered on packed optics
  scene4_explode:        { position: [4.5,  1.8,   7.5], target: [0, 0,  0.4], fov: 40 }, // back off for explode
  scene5_labeled:        { position: [9.5,  0.4,   0.5], target: [0, 0,  0.5], fov: 42 }, // near-orthographic side, wide enough for full stack
  scene6_light_path:     { position: [7.5,  2.0,   5.5], target: [0, 0,  0.9], fov: 44 }, // 3/4 to see beam — target is the explode-1.8 chain midpoint, not the sensor; pulled back so the full M₀→sensor chain fits
  scene7_handoff:        { position: [3.5,  1.5,   2.0], target: [0, 0, -1.2], fov: 40 }, // shift toward back
  scene8_outputs:       { position: [2.5,  1.0,   1.0], target: [0, 0, -1.5], fov: 42 },
  scene9_reassembly:    { position: [3.5,  2.0,   5.2], target: [0, 0,  0.5], fov: 36 }, // return to 3/4
  epilogue:              { position: [4.5,  1.5,   5.5], target: [0, 0,  0.0], fov: 38 },
};
