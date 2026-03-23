import * as THREE from 'three'

/**
 * Builds a complete set of body part geometries + positions from measurements.
 * All units in Three.js space: 1 unit = 10 cm  → 170 cm person = 17 units.
 * Positions are Y-up, origin at the floor.
 */
export function buildAvatarParts(measurements) {
  const {
    height = 170,
    weight = 65,
    chest = 90,
    waist = 70,
    hip = 95,
    shoulderWidth = 44,
    legLength = 80,
  } = measurements

  // Unit scale: 1 three.js unit = 10 cm
  const S = 0.1

  // ── BMI-based body thickness multiplier ─────────────────────────
  const bmi = weight / Math.pow(height / 100, 2)
  const thick = Math.max(0.75, Math.min(1.6, bmi / 22))

  // ── Radii from circumferences ────────────────────────────────────
  const chestR  = (chest  / (2 * Math.PI)) * S
  const waistR  = (waist  / (2 * Math.PI)) * S
  const hipR    = (hip    / (2 * Math.PI)) * S

  // Shoulder: measured as full width, so half-width from centre
  const shoulderHW = (shoulderWidth / 2) * S

  // ── Proportional Y landmarks (from ground) ───────────────────────
  const H         = height * S
  const ankleY    = H * 0.06
  const kneeY     = H * 0.28
  const crotchY   = H * 0.47
  const hipPeakY  = H * 0.53
  const waistY    = H * 0.61
  const lowerChY  = H * 0.68
  const chestY    = H * 0.75
  const armpitY   = H * 0.79
  const shoulderY = H * 0.82
  const neckBaseY = H * 0.86
  const neckTopY  = H * 0.895
  const headCtrY  = H * 0.935

  // ── Derived radii ────────────────────────────────────────────────
  const neckR      = 7.2 * thick * S * 0.9
  const headR      = H * 0.065

  const upperArmR  = Math.max(0.28, 3.5 * thick * S)
  const lowerArmR  = upperArmR * 0.78
  const handR      = upperArmR * 0.82

  const upperLegR  = Math.max(0.55, hipR * 0.55)
  const lowerLegR  = upperLegR * 0.60
  const ankleR     = lowerLegR * 0.55

  // Arm lengths
  const armTotalL  = H * 0.44
  const upperArmL  = armTotalL * 0.45
  const lowerArmL  = armTotalL * 0.38
  const handL      = armTotalL * 0.17

  // Leg lengths
  const upperLegL  = crotchY - kneeY
  const lowerLegL  = kneeY - ankleY

  const parts = []

  // ═══════════════════════════════════════════════════════════════
  //  TORSO  (LatheGeometry profile, then squeezed on Z)
  // ═══════════════════════════════════════════════════════════════
  const torsoProfile = buildTorsoProfile({
    hipR, waistR, chestR, shoulderHW, neckR, thick,
    crotchY, hipPeakY, waistY, lowerChY, chestY, armpitY, shoulderY, neckBaseY,
  })
  const torsoGeo = new THREE.LatheGeometry(torsoProfile, 32)
  torsoGeo.computeVertexNormals()

  parts.push({
    name: 'torso',
    geo: torsoGeo,
    pos: [0, crotchY, 0],
    rot: [0, 0, 0],
    scl: [1, 1, 0.72],     // flatten depth (body is elliptical, not circular)
    group: 'body',
  })

  // ═══════════════════════════════════════════════════════════════
  //  HEAD
  // ═══════════════════════════════════════════════════════════════
  const headGeo = new THREE.SphereGeometry(headR, 28, 22)
  parts.push({
    name: 'head',
    geo: headGeo,
    pos: [0, headCtrY, 0],
    rot: [0, 0, 0],
    scl: [1, 1.12, 0.88],  // slightly taller, slightly less deep
    group: 'body',
  })

  // ═══════════════════════════════════════════════════════════════
  //  NECK
  // ═══════════════════════════════════════════════════════════════
  const neckH = neckTopY - neckBaseY
  const neckGeo = new THREE.CylinderGeometry(neckR * 0.95, neckR * 1.25, neckH, 14)
  parts.push({
    name: 'neck',
    geo: neckGeo,
    pos: [0, neckBaseY + neckH / 2, 0],
    rot: [0, 0, 0],
    scl: [1, 1, 0.8],
    group: 'body',
  })

  // ═══════════════════════════════════════════════════════════════
  //  ARMS  (T-pose — horizontal, slight downward angle)
  // ═══════════════════════════════════════════════════════════════
  const armAngle = Math.PI * 0.07  // ~12° downward from horizontal

  // Upper arms
  const uArmGeo = new THREE.CylinderGeometry(upperArmR * 0.85, upperArmR, upperArmL, 14)
  const shoulderOffX = shoulderHW + upperArmR * 0.2

  parts.push({
    name: 'leftUpperArm',
    geo: uArmGeo,
    pos: [-(shoulderOffX + upperArmL / 2), shoulderY - Math.sin(armAngle) * upperArmL / 2, 0],
    rot: [0, 0, Math.PI / 2 + armAngle],
    scl: [1, 1, 0.88],
    group: 'body',
  })
  parts.push({
    name: 'rightUpperArm',
    geo: uArmGeo,
    pos: [+(shoulderOffX + upperArmL / 2), shoulderY - Math.sin(armAngle) * upperArmL / 2, 0],
    rot: [0, 0, -(Math.PI / 2 + armAngle)],
    scl: [1, 1, 0.88],
    group: 'body',
  })

  // Forearms
  const lArmGeo = new THREE.CylinderGeometry(lowerArmR * 0.82, lowerArmR, lowerArmL, 12)
  const elbowOffX = shoulderOffX + upperArmL
  const elbowY    = shoulderY - Math.sin(armAngle) * upperArmL

  parts.push({
    name: 'leftLowerArm',
    geo: lArmGeo,
    pos: [-(elbowOffX + lowerArmL / 2), elbowY - Math.sin(armAngle) * lowerArmL / 2, 0],
    rot: [0, 0, Math.PI / 2 + armAngle],
    scl: [1, 1, 0.85],
    group: 'body',
  })
  parts.push({
    name: 'rightLowerArm',
    geo: lArmGeo,
    pos: [+(elbowOffX + lowerArmL / 2), elbowY - Math.sin(armAngle) * lowerArmL / 2, 0],
    rot: [0, 0, -(Math.PI / 2 + armAngle)],
    scl: [1, 1, 0.85],
    group: 'body',
  })

  // Hands (rounded blobs)
  const handGeo = new THREE.SphereGeometry(handR, 12, 10)
  const wristOffX = elbowOffX + lowerArmL
  const wristY    = elbowY - Math.sin(armAngle) * lowerArmL

  parts.push({
    name: 'leftHand',
    geo: handGeo,
    pos: [-(wristOffX + handL * 0.5), wristY - Math.sin(armAngle) * handL * 0.5, 0],
    rot: [0, 0, 0],
    scl: [1, 0.75, 0.55],
    group: 'body',
  })
  parts.push({
    name: 'rightHand',
    geo: handGeo,
    pos: [+(wristOffX + handL * 0.5), wristY - Math.sin(armAngle) * handL * 0.5, 0],
    rot: [0, 0, 0],
    scl: [1, 0.75, 0.55],
    group: 'body',
  })

  // ═══════════════════════════════════════════════════════════════
  //  LEGS
  // ═══════════════════════════════════════════════════════════════
  const legSpread = hipR * 0.65   // distance from centre-line to leg centre
  const legAngle  = Math.atan2(legSpread, upperLegL * 0.5) * 0.3  // subtle outward angle

  // Upper legs
  const uLegGeo = new THREE.CylinderGeometry(lowerLegR * 1.05, upperLegR, upperLegL, 14)
  const upperLegCtrY = crotchY - upperLegL / 2

  parts.push({
    name: 'leftUpperLeg',
    geo: uLegGeo,
    pos: [-legSpread, upperLegCtrY, 0],
    rot: [0, 0, legAngle],
    scl: [1, 1, 0.82],
    group: 'body',
  })
  parts.push({
    name: 'rightUpperLeg',
    geo: uLegGeo,
    pos: [+legSpread, upperLegCtrY, 0],
    rot: [0, 0, -legAngle],
    scl: [1, 1, 0.82],
    group: 'body',
  })

  // Lower legs
  const lLegGeo = new THREE.CylinderGeometry(ankleR * 1.1, lowerLegR, lowerLegL, 12)
  const lowerLegCtrY = kneeY - lowerLegL / 2

  parts.push({
    name: 'leftLowerLeg',
    geo: lLegGeo,
    pos: [-legSpread, lowerLegCtrY, 0],
    rot: [0, 0, 0],
    scl: [1, 1, 0.82],
    group: 'body',
  })
  parts.push({
    name: 'rightLowerLeg',
    geo: lLegGeo,
    pos: [+legSpread, lowerLegCtrY, 0],
    rot: [0, 0, 0],
    scl: [1, 1, 0.82],
    group: 'body',
  })

  // Feet
  const footGeo = new THREE.BoxGeometry(ankleR * 1.8, ankleY * 0.7, ankleR * 3.5)
  const footRound = (geo) => geo  // no-op – boxes look fine for MVP

  parts.push({
    name: 'leftFoot',
    geo: footGeo,
    pos: [-legSpread, ankleY * 0.35, ankleR * 0.8],
    rot: [0, 0, 0],
    scl: [1, 1, 1],
    group: 'body',
  })
  parts.push({
    name: 'rightFoot',
    geo: footGeo,
    pos: [+legSpread, ankleY * 0.35, ankleR * 0.8],
    rot: [0, 0, 0],
    scl: [1, 1, 1],
    group: 'body',
  })

  return { parts, meta: { H, crotchY, shoulderY, headCtrY, legSpread } }
}

// ─────────────────────────────────────────────────────────────────
//  Torso lathe profile builder
//  Returns Array<THREE.Vector2> from bottom (crotch) upward.
// ─────────────────────────────────────────────────────────────────
function buildTorsoProfile({
  hipR, waistR, chestR, shoulderHW, neckR, thick,
  crotchY, hipPeakY, waistY, lowerChY, chestY, armpitY, shoulderY, neckBaseY,
}) {
  // All Y values are RELATIVE to crotchY (the base of the torso mesh)
  const ry = (absY) => absY - crotchY

  // Boost radii slightly so the lathe surface, once Z-scaled to 0.72,
  // still preserves a realistic apparent width.
  const bst = 1.18

  const profile = [
    // crotch bottom – narrowed to blend with upper legs
    new THREE.Vector2(hipR * 0.82 * bst, 0),
    // hip peak
    new THREE.Vector2(hipR * bst,         ry(hipPeakY)),
    // hip-to-waist transition
    new THREE.Vector2(waistR * 1.04 * bst, ry(waistY) * 0.72),
    // waist minimum
    new THREE.Vector2(waistR * bst,        ry(waistY)),
    // lower chest
    new THREE.Vector2(chestR * 0.93 * bst, ry(lowerChY)),
    // chest maximum
    new THREE.Vector2(chestR * bst,        ry(chestY)),
    // armpit / underarm
    new THREE.Vector2(chestR * 0.88 * bst, ry(armpitY)),
    // shoulder splay (widest point of shoulder silhouette)
    new THREE.Vector2(shoulderHW * 0.88,   ry(shoulderY)),
    // neck-shoulder slope
    new THREE.Vector2(shoulderHW * 0.52,   ry(shoulderY) + (ry(neckBaseY) - ry(shoulderY)) * 0.4),
    // neck base
    new THREE.Vector2(neckR * 1.35,        ry(neckBaseY)),
    // cap at neck top (avoid zero-radius to prevent artefacts)
    new THREE.Vector2(neckR * 1.1,         ry(neckBaseY) + (neckBaseY - crotchY) * 0.03),
  ]

  // Clamp: no radius may be ≤ 0
  return profile.map(v => new THREE.Vector2(Math.max(0.01, v.x), v.y))
}

// ─────────────────────────────────────────────────────────────────
//  Clothing geometry builder
//  Returns extra parts with 'clothing' group tag.
// ─────────────────────────────────────────────────────────────────
export function buildClothingParts(measurements, style) {
  if (style === 'none') return []

  const {
    height = 170, weight = 65, chest = 90, waist = 70, hip = 95, shoulderWidth = 44,
  } = measurements

  const S    = 0.1
  const bmi  = weight / Math.pow(height / 100, 2)
  const thick = Math.max(0.75, Math.min(1.6, bmi / 22))

  const chestR  = (chest  / (2 * Math.PI)) * S
  const waistR  = (waist  / (2 * Math.PI)) * S
  const hipR    = (hip    / (2 * Math.PI)) * S
  const shoulderHW = (shoulderWidth / 2) * S

  const H         = height * S
  const crotchY   = H * 0.47
  const hipPeakY  = H * 0.53
  const waistY    = H * 0.61
  const lowerChY  = H * 0.68
  const chestY    = H * 0.75
  const armpitY   = H * 0.79
  const shoulderY = H * 0.82
  const neckBaseY = H * 0.86
  const neckR     = 7.2 * thick * S * 0.9

  const parts = []

  // ── Clothing offset (cloth sits ~1.2cm above skin) ──────────────
  const off = 0.012

  // ── T-Shirt torso ───────────────────────────────────────────────
  // Use the same lathe profile but scaled outward
  const shirtBottom = style === 'tshirt' ? waistY - (waistY - crotchY) * 0.5 : crotchY
  const hemY        = style === 'tshirt' ? H * 0.595 : H * 0.47   // hem / bottom edge

  const shirtProfile = buildClothingTorsoProfile({
    hipR: hipR + off, waistR: waistR + off, chestR: chestR + off,
    shoulderHW: shoulderHW + off * 0.5, neckR,
    crotchY: hemY, hipPeakY, waistY, lowerChY, chestY, armpitY, shoulderY, neckBaseY,
    style,
  })

  const shirtGeo = new THREE.LatheGeometry(shirtProfile, 32)
  shirtGeo.computeVertexNormals()

  parts.push({
    name: 'shirt_torso',
    geo: shirtGeo,
    pos: [0, hemY, 0],
    rot: [0, 0, 0],
    scl: [1.02, 1, 0.74],
    group: 'clothing',
  })

  // ── Sleeves ─────────────────────────────────────────────────────
  const upperArmR  = Math.max(0.28, 3.5 * thick * S) + off
  const sleeveLen  = style === 'tshirt' ? H * 0.1 : H * 0.18
  const armAngle   = Math.PI * 0.07
  const sleeveOffX = shoulderHW + upperArmR

  const sleeveGeo = new THREE.CylinderGeometry(upperArmR * 0.9, upperArmR * 1.05, sleeveLen, 14)

  parts.push({
    name: 'shirt_leftSleeve',
    geo: sleeveGeo,
    pos: [-(sleeveOffX + sleeveLen / 2), shoulderY - Math.sin(armAngle) * sleeveLen / 2, 0],
    rot: [0, 0, Math.PI / 2 + armAngle],
    scl: [1, 1, 0.9],
    group: 'clothing',
  })
  parts.push({
    name: 'shirt_rightSleeve',
    geo: sleeveGeo,
    pos: [+(sleeveOffX + sleeveLen / 2), shoulderY - Math.sin(armAngle) * sleeveLen / 2, 0],
    rot: [0, 0, -(Math.PI / 2 + armAngle)],
    scl: [1, 1, 0.9],
    group: 'clothing',
  })

  // ── Hoodie: add hood ─────────────────────────────────────────────
  if (style === 'hoodie') {
    const hoodGeo = new THREE.TorusGeometry(
      (neckR * 2.2),  // torus radius
      neckR * 1.3,    // tube radius
      10, 24,
      Math.PI         // half-torus = hood opening
    )
    parts.push({
      name: 'hood',
      geo: hoodGeo,
      pos: [0, neckBaseY + neckR * 1.2, -neckR * 0.5],
      rot: [Math.PI * 0.1, 0, 0],
      scl: [1.1, 1.2, 0.8],
      group: 'clothing',
    })
  }

  return parts
}

// Clothing torso profile (slightly larger than body profile)
function buildClothingTorsoProfile({
  hipR, waistR, chestR, shoulderHW, neckR,
  crotchY, hipPeakY, waistY, lowerChY, chestY, armpitY, shoulderY, neckBaseY,
  style,
}) {
  const ry  = (absY) => absY - crotchY
  const bst = 1.2

  const collarR = neckR * (style === 'hoodie' ? 1.6 : 1.2)

  const profile = [
    new THREE.Vector2(style === 'tshirt' ? waistR * bst : hipR * 0.84 * bst, 0),
    new THREE.Vector2(hipR  * bst,              ry(hipPeakY)),
    new THREE.Vector2(waistR * 1.06 * bst,      ry(waistY) * 0.72),
    new THREE.Vector2(waistR * bst,             ry(waistY)),
    new THREE.Vector2(chestR * 0.95 * bst,      ry(lowerChY)),
    new THREE.Vector2(chestR * bst,             ry(chestY)),
    new THREE.Vector2(chestR * 0.90 * bst,      ry(armpitY)),
    new THREE.Vector2(shoulderHW * 0.90,        ry(shoulderY)),
    new THREE.Vector2(shoulderHW * 0.54,        ry(shoulderY) + (ry(neckBaseY) - ry(shoulderY)) * 0.4),
    new THREE.Vector2(collarR,                  ry(neckBaseY)),
    new THREE.Vector2(collarR * 0.92,           ry(neckBaseY) + (neckBaseY - crotchY) * 0.03),
  ]

  return profile.map(v => new THREE.Vector2(Math.max(0.01, v.x), v.y))
}

// ─────────────────────────────────────────────────────────────────
//  Custom pattern canvas texture (QR-like design overlay)
// ─────────────────────────────────────────────────────────────────
export function createPatternTexture() {
  const size  = 512
  const canvas = document.createElement('canvas')
  canvas.width  = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  // Base
  ctx.fillStyle = 'rgba(0,0,0,0)'
  ctx.fillRect(0, 0, size, size)

  // Grid pattern
  const grid = 32
  ctx.strokeStyle = 'rgba(124, 106, 247, 0.35)'
  ctx.lineWidth = 1
  for (let x = 0; x <= size; x += grid) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, size); ctx.stroke()
  }
  for (let y = 0; y <= size; y += grid) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke()
  }

  // QR-like corner squares
  const drawCornerBlock = (cx, cy, s) => {
    ctx.fillStyle = 'rgba(124, 106, 247, 0.9)'
    ctx.fillRect(cx, cy, s, s)
    ctx.fillStyle = 'rgba(10, 10, 15, 0.9)'
    ctx.fillRect(cx + s * 0.18, cy + s * 0.18, s * 0.64, s * 0.64)
    ctx.fillStyle = 'rgba(124, 106, 247, 0.9)'
    ctx.fillRect(cx + s * 0.32, cy + s * 0.32, s * 0.36, s * 0.36)
  }
  const cs = 80
  drawCornerBlock(32, 32, cs)
  drawCornerBlock(size - cs - 32, 32, cs)
  drawCornerBlock(32, size - cs - 32, cs)

  // Random data dots
  ctx.fillStyle = 'rgba(124, 106, 247, 0.8)'
  const rng = mulberry32(42)
  for (let i = 0; i < 420; i++) {
    const x = Math.floor(rng() * (size / grid)) * grid + grid * 0.2
    const y = Math.floor(rng() * (size / grid)) * grid + grid * 0.2
    const w = grid * (rng() < 0.6 ? 0.55 : 1.55)
    const h = grid * 0.55
    ctx.fillRect(x, y, w, h)
  }

  // Centre logo text
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = 'bold 28px Inter, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('FITFORM', size / 2, size / 2)
  ctx.font = '14px Inter, sans-serif'
  ctx.fillStyle = 'rgba(180,170,255,0.8)'
  ctx.fillText('3D AVATAR SYSTEM', size / 2, size / 2 + 30)

  return new THREE.CanvasTexture(canvas)
}

// Deterministic pseudo-random (seeded)
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
