import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei'
import AvatarModel from './AvatarModel'

function Lights() {
  return (
    <>
      {/* Ambient — subtle base illumination */}
      <ambientLight intensity={0.4} color="#b8c4d4" />

      {/* Key light — main illumination from upper-left front */}
      <directionalLight
        position={[4, 8, 5]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={30}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={6}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0005}
      />

      {/* Fill light — soft from the right to reduce harsh shadows */}
      <directionalLight position={[-3, 4, 2]} intensity={0.55} color="#c8d8f0" />

      {/* Rim light — back-right for depth separation */}
      <pointLight position={[2, 6, -4]} intensity={0.9} color="#8070e0" />

      {/* Under light — subtle upward bounce */}
      <pointLight position={[0, -1, 2]} intensity={0.15} color="#c0b8f0" />
    </>
  )
}

function SceneFloor() {
  return (
    <>
      {/* Soft contact shadow beneath the avatar */}
      <ContactShadows
        position={[0, -0.01, 0]}
        opacity={0.45}
        scale={6}
        blur={2.5}
        far={3}
        color="#4040a0"
      />
      {/* Subtle grid */}
      <Grid
        position={[0, -0.015, 0]}
        args={[12, 12]}
        cellSize={0.5}
        cellThickness={0.4}
        cellColor="#2C2C4A"
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor="#3D3D6A"
        fadeDistance={7}
        fadeStrength={2}
        infiniteGrid
      />
    </>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#7C6AF7" wireframe />
    </mesh>
  )
}

export default function AvatarViewer({ measurements, clothingStyle, showTexture, skinTone }) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        camera={{
          position: [0, 0, 4.2],
          fov: 42,
          near: 0.05,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: 3,          // ACESFilmicToneMapping
          toneMappingExposure: 1.1,
          outputColorSpace: 'srgb',
        }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#0A0A0F']} />
        <fog attach="fog" args={['#0A0A0F', 10, 22]} />

        <Lights />
        <SceneFloor />

        <Suspense fallback={<LoadingFallback />}>
          <AvatarModel
            measurements={measurements}
            clothingStyle={clothingStyle}
            showTexture={showTexture}
            skinTone={skinTone}
          />
        </Suspense>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={1.5}
          maxDistance={9}
          target={[0, 0, 0]}
          dampingFactor={0.08}
          enableDamping
          rotateSpeed={0.6}
          zoomSpeed={0.8}
          makeDefault
        />
      </Canvas>
    </div>
  )
}
