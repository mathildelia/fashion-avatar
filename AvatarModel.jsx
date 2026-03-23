import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { buildAvatarParts, buildClothingParts, createPatternTexture } from '../utils/avatarBuilder'

/**
 * Renders the full parametric 3D avatar (body + optional clothing + optional texture).
 * All geometry is re-computed only when measurements change (useMemo).
 */
export default function AvatarModel({ measurements, clothingStyle, showTexture, skinTone }) {
  const groupRef = useRef()

  // ── Body geometry parts ──────────────────────────────────────────
  const { parts: bodyParts, meta } = useMemo(
    () => buildAvatarParts(measurements),
    [
      measurements.height, measurements.weight, measurements.chest,
      measurements.waist, measurements.hip, measurements.shoulderWidth, measurements.legLength,
    ]
  )

  // ── Clothing geometry parts ──────────────────────────────────────
  const clothingParts = useMemo(
    () => buildClothingParts(measurements, clothingStyle),
    [
      measurements.height, measurements.weight, measurements.chest,
      measurements.waist, measurements.hip, measurements.shoulderWidth,
      clothingStyle,
    ]
  )

  // ── Pattern texture ──────────────────────────────────────────────
  const patternTexture = useMemo(() => createPatternTexture(), [])

  // ── Materials ────────────────────────────────────────────────────
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinTone),
    roughness: 0.72,
    metalness: 0.0,
  }), [skinTone])

  const skinTexMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(skinTone),
    roughness: 0.72,
    metalness: 0.0,
    map: patternTexture,
    transparent: true,
    opacity: 1,
  }), [skinTone, patternTexture])

  const clothingMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1E293B'),
    roughness: 0.92,
    metalness: 0.0,
  }), [])

  const clothingMat2 = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color('#374151'),
    roughness: 0.88,
    metalness: 0.0,
  }), [])

  // Centre avatar on screen: shift down by half total height so model sits on a virtual floor
  const offsetY = useMemo(() => -(meta.H * 0.5), [meta.H])

  return (
    <group ref={groupRef} position={[0, offsetY, 0]}>
      {/* Body parts */}
      {bodyParts.map((part) => {
        // Apply pattern texture only to the torso when showTexture is on
        const material = showTexture && part.name === 'torso' ? skinTexMat : skinMat
        return (
          <mesh
            key={part.name}
            geometry={part.geo}
            material={material}
            position={part.pos}
            rotation={part.rot}
            scale={part.scl}
            castShadow
            receiveShadow
          />
        )
      })}

      {/* Clothing parts */}
      {clothingParts.map((part, i) => (
        <mesh
          key={part.name}
          geometry={part.geo}
          material={i % 2 === 0 ? clothingMat : clothingMat2}
          position={part.pos}
          rotation={part.rot}
          scale={part.scl}
          castShadow
          receiveShadow
        />
      ))}

      {/* Floor shadow catcher */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[2.5, 48]} />
        <shadowMaterial opacity={0.18} transparent />
      </mesh>
    </group>
  )
}
