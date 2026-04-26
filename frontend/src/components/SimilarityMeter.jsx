import { motion } from 'framer-motion'

function getStatus(rank, total) {
  const ratio = rank / total
  if (ratio <= 0.05) return { label: 'On fire!', color: '#22c55e', emoji: '🔥🔥🔥' }
  if (ratio <= 0.15) return { label: 'Very close!', color: '#22c55e', emoji: '🔥🔥' }
  if (ratio <= 0.3)  return { label: 'Getting warm', color: '#06b6d4', emoji: '🔥' }
  if (ratio <= 0.5)  return { label: 'On the right track', color: '#6366f1', emoji: '🎯' }
  if (ratio <= 0.7)  return { label: 'A bit cold', color: '#a855f7', emoji: '💡' }
  return { label: 'Far away', color: '#6b7280', emoji: '❄️' }
}

export default function SimilarityMeter({ word, similarity, rank, total }) {
  const barWidth = Math.max(5, ((total - rank) / total) * 100)
  const status = getStatus(rank, total)

  return (
    <div className="space-y-3">
      {/* Word and rank */}
      <div className="flex justify-between items-baseline">
        <span className="text-base font-bold capitalize" style={{ color: '#e5e7eb' }}>
          {word}
        </span>
        <span className="text-lg font-black" style={{ color: status.color }}>
          #{rank}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${status.color}, ${status.color}88)` }}
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ delay: 0.15, duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      {/* Status message */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: status.color }}>
          {status.emoji} {status.label}
        </span>
        <span className="text-xs" style={{ color: '#6b7280' }}>
          out of {total}
        </span>
      </div>
    </div>
  )
}
