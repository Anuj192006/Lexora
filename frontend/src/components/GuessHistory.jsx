import { motion } from 'framer-motion'

function getRankColor(rank, total) {
  const ratio = rank / total
  if (ratio <= 0.1) return '#22c55e'   // green — very close
  if (ratio <= 0.3) return '#06b6d4'   // cyan — warm
  if (ratio <= 0.5) return '#6366f1'   // indigo — medium
  if (ratio <= 0.7) return '#a855f7'   // purple — cool
  return '#6b7280'                      // gray — cold
}

function getRankEmoji(rank, total) {
  const ratio = rank / total
  if (ratio <= 0.1) return '🔥'
  if (ratio <= 0.3) return '🎯'
  if (ratio <= 0.5) return '💡'
  return '❄️'
}

export default function GuessHistory({ guesses, total }) {
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
      {guesses.map((guess, idx) => {
        const barWidth = Math.max(5, ((total - guess.rank) / total) * 100)
        const color = getRankColor(guess.rank, total)
        const emoji = getRankEmoji(guess.rank, total)

        return (
          <motion.div
            key={`${guess.guessed_word}-${idx}`}
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            {/* Rank badge */}
            <div className="w-12 text-center flex-shrink-0">
              <span className="text-xs font-bold px-2 py-1 rounded-md" style={{
                background: `${color}20`,
                color: color,
              }}>
                #{guess.rank}
              </span>
            </div>

            {/* Word */}
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-sm capitalize" style={{ color: '#e5e7eb' }}>
                {guess.guessed_word}
              </span>
            </div>

            {/* Visual bar */}
            <div className="w-24 flex-shrink-0">
              <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                />
              </div>
            </div>

            {/* Emoji */}
            <span className="text-sm flex-shrink-0">{emoji}</span>
          </motion.div>
        )
      })}
    </div>
  )
}
