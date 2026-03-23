import { useState } from 'react'

const FIELDS = [
  { key: 'height',       label: 'Height',          unit: 'cm',  min: 140, max: 220, step: 1,   icon: '↕' },
  { key: 'weight',       label: 'Weight',           unit: 'kg',  min: 35,  max: 160, step: 0.5, icon: '◎' },
  { key: 'chest',        label: 'Chest',            unit: 'cm',  min: 60,  max: 140, step: 0.5, icon: '▭' },
  { key: 'waist',        label: 'Waist',            unit: 'cm',  min: 50,  max: 130, step: 0.5, icon: '▭' },
  { key: 'hip',          label: 'Hip',              unit: 'cm',  min: 60,  max: 145, step: 0.5, icon: '▭' },
  { key: 'shoulderWidth',label: 'Shoulder Width',   unit: 'cm',  min: 30,  max: 60,  step: 0.5, icon: '↔' },
  { key: 'legLength',    label: 'Leg Length',       unit: 'cm',  min: 60,  max: 110, step: 0.5, icon: '↕' },
]

const PRESET_LABELS = {
  slim:     { label: 'Slim',     color: 'text-blue-400' },
  average:  { label: 'Average',  color: 'text-green-400' },
  athletic: { label: 'Athletic', color: 'text-orange-400' },
  plus:     { label: 'Plus',     color: 'text-purple-400' },
}

function MeasurementField({ field, value, onChange }) {
  const [focused, setFocused] = useState(false)

  const pct = ((value - field.min) / (field.max - field.min)) * 100

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {field.label}
        </label>
        <div className={`flex items-center gap-1 text-xs ${focused ? 'text-accent' : 'text-gray-300'} transition-colors`}>
          <input
            type="number"
            value={value}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(e) => onChange(field.key, e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-14 bg-surface-700 border border-surface-500 rounded px-2 py-0.5 text-right text-xs
              focus:outline-none focus:border-accent transition-colors"
          />
          <span className="text-gray-500 text-xs">{field.unit}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step}
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          className="w-full"
          style={{
            background: `linear-gradient(to right, #7C6AF7 ${pct}%, #22222F ${pct}%)`,
          }}
        />
      </div>
    </div>
  )
}

export default function MeasurementsPanel({ measurements, onChange, onGenerate, onPreset, presets }) {
  const bmi = (measurements.weight / Math.pow(measurements.height / 100, 2)).toFixed(1)
  const bmiCategory = bmi < 18.5 ? { label: 'Underweight', color: 'text-blue-400' }
    : bmi < 25 ? { label: 'Normal', color: 'text-green-400' }
    : bmi < 30 ? { label: 'Overweight', color: 'text-orange-400' }
    : { label: 'Obese', color: 'text-red-400' }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-5 border-b border-surface-600">
        <h1 className="text-base font-semibold text-white tracking-tight">Body Measurements</h1>
        <p className="text-xs text-gray-500 mt-0.5">Enter your measurements to generate your avatar</p>
      </div>

      {/* Presets */}
      <div className="px-5 pt-4 pb-2">
        <p className="section-title">Quick presets</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PRESET_LABELS).map(([key, { label, color }]) => (
            <button
              key={key}
              onClick={() => onPreset(key)}
              className="py-1.5 px-3 rounded-lg bg-surface-700 hover:bg-surface-600 border border-surface-500
                hover:border-surface-400 transition-all duration-150 text-xs font-medium text-left"
            >
              <span className={color}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="section-title">Measurements</p>
        {FIELDS.map((field) => (
          <MeasurementField
            key={field.key}
            field={field}
            value={measurements[field.key]}
            onChange={onChange}
          />
        ))}
      </div>

      {/* BMI indicator */}
      <div className="px-5 py-3 border-t border-surface-600 bg-surface-700/40">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">BMI</span>
          <span className="font-semibold text-gray-300">{bmi}</span>
          <span className={`font-medium ${bmiCategory.color}`}>{bmiCategory.label}</span>
        </div>
        {/* BMI bar */}
        <div className="mt-2 h-1 rounded-full bg-surface-600 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-green-500 to-red-500"
            style={{ width: `${Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100))}%` }}
          />
        </div>
      </div>

      {/* Generate button */}
      <div className="px-5 py-4 border-t border-surface-600">
        <button onClick={onGenerate} className="btn-primary">
          Generate My Avatar
        </button>
        <p className="text-center text-xs text-gray-600 mt-2">Updates in real-time</p>
      </div>
    </div>
  )
}
