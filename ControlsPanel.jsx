const CLOTHING_OPTIONS = [
  { value: 'none',    label: 'None',    desc: 'Bare avatar' },
  { value: 'tshirt',  label: 'T-Shirt', desc: 'Crew neck, short sleeves' },
  { value: 'hoodie',  label: 'Hoodie',  desc: 'Pullover with hood' },
]

const SKIN_TONES = [
  { value: '#FDDBB4', label: 'Light' },
  { value: '#E8B88A', label: 'Medium Light' },
  { value: '#C68642', label: 'Medium' },
  { value: '#8D5524', label: 'Medium Dark' },
  { value: '#4A2912', label: 'Dark' },
]

function SectionHeader({ title }) {
  return <p className="section-title">{title}</p>
}

function StatRow({ label, value, unit }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-surface-600/50 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-xs font-medium text-gray-200">
        {value} <span className="text-gray-500">{unit}</span>
      </span>
    </div>
  )
}

export default function ControlsPanel({
  clothingStyle, setClothingStyle,
  showTexture, setShowTexture,
  skinTone, setSkinTone,
  onExport, measurements,
}) {
  // Derived stats
  const chestInch = (measurements.chest / 2.54).toFixed(1)
  const waistInch = (measurements.waist / 2.54).toFixed(1)
  const hipInch   = (measurements.hip   / 2.54).toFixed(1)
  const heightFt  = Math.floor(measurements.height / 30.48)
  const heightIn  = Math.round((measurements.height / 2.54) % 12)

  // Clothing size estimate
  const getSize = () => {
    const c = measurements.chest
    if (c < 86) return 'XS'
    if (c < 92) return 'S'
    if (c < 98) return 'M'
    if (c < 106) return 'L'
    if (c < 116) return 'XL'
    return 'XXL'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-5 border-b border-surface-600">
        <h2 className="text-base font-semibold text-white tracking-tight">Avatar Controls</h2>
        <p className="text-xs text-gray-500 mt-0.5">Customise appearance and clothing</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

        {/* ── Skin Tone ─────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Skin Tone" />
          <div className="flex gap-2 flex-wrap">
            {SKIN_TONES.map((tone) => (
              <button
                key={tone.value}
                onClick={() => setSkinTone(tone.value)}
                title={tone.label}
                className={`w-9 h-9 rounded-full border-2 transition-all duration-150 hover:scale-110 active:scale-95 ${
                  skinTone === tone.value
                    ? 'border-accent shadow-lg shadow-accent/30'
                    : 'border-surface-500'
                }`}
                style={{ backgroundColor: tone.value }}
              />
            ))}
          </div>
        </div>

        {/* ── Clothing ─────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Clothing" />
          <div className="space-y-2">
            {CLOTHING_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setClothingStyle(opt.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all duration-150
                  ${clothingStyle === opt.value
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-surface-500 bg-surface-700 text-gray-400 hover:border-surface-400 hover:text-gray-200'
                  }`}
              >
                <div className="text-left">
                  <span className="text-sm font-medium block">{opt.label}</span>
                  <span className="text-xs text-gray-500">{opt.desc}</span>
                </div>
                {clothingStyle === opt.value && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Design overlay ───────────────────────────────────── */}
        <div>
          <SectionHeader title="Custom Design" />
          <button
            onClick={() => setShowTexture(v => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-200 ${
              showTexture
                ? 'border-accent bg-accent/10'
                : 'border-surface-500 bg-surface-700 hover:border-surface-400'
            }`}
          >
            <div className="text-left">
              <span className={`text-sm font-medium ${showTexture ? 'text-white' : 'text-gray-400'}`}>
                Apply Custom Design
              </span>
              <span className="text-xs text-gray-500 block mt-0.5">
                Pattern & QR-code overlay
              </span>
            </div>
            {/* Toggle pill */}
            <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${
              showTexture ? 'bg-accent' : 'bg-surface-500'
            }`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                showTexture ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
          {showTexture && (
            <p className="text-xs text-gray-500 mt-2 px-1">
              Design applied to torso via UV mapping
            </p>
          )}
        </div>

        {/* ── Stats ───────────────────────────────────────────── */}
        <div>
          <SectionHeader title="Measurements Summary" />
          <div className="panel px-3 py-1">
            <StatRow label="Height" value={`${measurements.height} cm  (${heightFt}'${heightIn}")`} unit="" />
            <StatRow label="Chest" value={`${measurements.chest} cm  (${chestInch}")`} unit="" />
            <StatRow label="Waist" value={`${measurements.waist} cm  (${waistInch}")`} unit="" />
            <StatRow label="Hip"   value={`${measurements.hip} cm  (${hipInch}")`} unit="" />
            <StatRow label="Estimated Size" value={getSize()} unit="" />
          </div>
        </div>
      </div>

      {/* Export */}
      <div className="px-5 py-4 border-t border-surface-600 space-y-2">
        <button onClick={onExport} className="btn-primary">
          Export Avatar Config
        </button>
        <p className="text-center text-xs text-gray-600">
          Saves measurements as JSON
        </p>
      </div>
    </div>
  )
}
