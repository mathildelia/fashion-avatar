import { useState, useCallback } from 'react'
import MeasurementsPanel from './components/MeasurementsPanel'
import AvatarViewer from './components/AvatarViewer'
import ControlsPanel from './components/ControlsPanel'

const DEFAULT_MEASUREMENTS = {
  height: 170,
  weight: 65,
  chest: 90,
  waist: 70,
  hip: 95,
  shoulderWidth: 44,
  legLength: 80,
}

const PRESETS = {
  slim: { height: 175, weight: 58, chest: 84, waist: 64, hip: 88, shoulderWidth: 42, legLength: 83 },
  average: { height: 170, weight: 70, chest: 92, waist: 76, hip: 96, shoulderWidth: 44, legLength: 80 },
  athletic: { height: 178, weight: 82, chest: 102, waist: 80, hip: 100, shoulderWidth: 48, legLength: 84 },
  plus: { height: 168, weight: 95, chest: 112, waist: 98, hip: 116, shoulderWidth: 46, legLength: 78 },
}

export default function App() {
  const [measurements, setMeasurements] = useState(DEFAULT_MEASUREMENTS)
  const [pendingMeasurements, setPendingMeasurements] = useState(DEFAULT_MEASUREMENTS)
  const [clothingStyle, setClothingStyle] = useState('none')
  const [showTexture, setShowTexture] = useState(false)
  const [skinTone, setSkinTone] = useState('#C68642')
  const [avatarGenerated, setAvatarGenerated] = useState(true)

  const handleMeasurementChange = useCallback((key, value) => {
    setPendingMeasurements(prev => ({ ...prev, [key]: parseFloat(value) || 0 }))
  }, [])

  const handleGenerate = useCallback(() => {
    setMeasurements({ ...pendingMeasurements })
    setAvatarGenerated(true)
  }, [pendingMeasurements])

  const handlePreset = useCallback((presetKey) => {
    const preset = PRESETS[presetKey]
    setPendingMeasurements(preset)
    setMeasurements(preset)
    setAvatarGenerated(true)
  }, [])

  const handleExport = useCallback(() => {
    const data = {
      measurements,
      clothingStyle,
      skinTone,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'avatar-config.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [measurements, clothingStyle, skinTone])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-900">
      {/* Left Panel — Measurements */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r border-surface-600 bg-surface-800 overflow-y-auto">
        <MeasurementsPanel
          measurements={pendingMeasurements}
          onChange={handleMeasurementChange}
          onGenerate={handleGenerate}
          onPreset={handlePreset}
          presets={PRESETS}
        />
      </aside>

      {/* Center — 3D Viewer */}
      <main className="flex-1 relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-gray-300 tracking-wide">FitForm</span>
            <span className="tag bg-surface-700 text-gray-500">3D Avatar</span>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            <span className="text-xs text-gray-600">
              {measurements.height}cm · {measurements.weight}kg
            </span>
          </div>
        </div>

        <AvatarViewer
          measurements={measurements}
          clothingStyle={clothingStyle}
          showTexture={showTexture}
          skinTone={skinTone}
        />

        {/* Bottom hint */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-xs text-gray-600 text-center">
            Drag to rotate · Scroll to zoom · Right-drag to pan
          </p>
        </div>
      </main>

      {/* Right Panel — Controls */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-l border-surface-600 bg-surface-800 overflow-y-auto">
        <ControlsPanel
          clothingStyle={clothingStyle}
          setClothingStyle={setClothingStyle}
          showTexture={showTexture}
          setShowTexture={setShowTexture}
          skinTone={skinTone}
          setSkinTone={setSkinTone}
          onExport={handleExport}
          measurements={measurements}
        />
      </aside>
    </div>
  )
}
