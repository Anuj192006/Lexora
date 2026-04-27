import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GuessInput from './GuessInput'
import GuessHistory from './GuessHistory'
import SimilarityMeter from './SimilarityMeter'

const STARTER_EXAMPLES = [
  'water',
  'house',
  'plant',
  'table',
  'bread',
  'stone'
]

export default function GameContainer({ sessionId, gameData, onGuess, onGiveUp, onGameEnd }) {
  const [guesses, setGuesses] = useState([])
  const [loading, setLoading] = useState(false)
  const [hint, setHint] = useState(gameData?.hint || '')
  const [toast, setToast] = useState(null)
  const [revealedWord, setRevealedWord] = useState(null)

  const showToast = (msg, type = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmitGuess = async (word) => {
    // Check for duplicate guesses
    if (guesses.some(g => g.guessed_word === word.toLowerCase())) {
      showToast("You already guessed that word!", 'warn')
      return
    }

    setLoading(true)
    try {
      const result = await onGuess(word)

      // Backend returned an error (word not in vocabulary)
      if (result.error) {
        showToast(result.message, 'error')
        return
      }

      setGuesses(prev => [...prev, result])
    } catch (error) {
      showToast("Something went wrong. Try again!", 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGiveUp = async () => {
    const data = await onGiveUp()
    if (data?.secret_word) {
      setRevealedWord(data.secret_word)
    }
  }

  const bestGuess = guesses.length > 0
    ? guesses.reduce((best, g) => g.rank < best.rank ? g : best)
    : null

  // Sort guesses by rank (best first) for the history
  const sortedGuesses = [...guesses].sort((a, b) => a.rank - b.rank)

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 relative overflow-y-auto">
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 left-1/2 z-50 px-6 py-3 rounded-xl text-sm font-medium shadow-lg"
            style={{
              transform: 'translateX(-50%)',
              background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(234, 179, 8, 0.9)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="max-w-2xl w-full space-y-5 py-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-black mb-1" style={{
            background: 'linear-gradient(135deg, #c7d2fe 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Lexora</h1>
          <p className="text-sm" style={{ color: '#a5b4fc', opacity: 0.7 }}>{hint}</p>
        </div>

        <motion.div
          className="glass ml-auto w-full max-w-xs rounded-2xl p-4"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
        >
          <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: '#06b6d4' }}>
            Starter Example
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STARTER_EXAMPLES.map((word) => (
              <span
                key={word}
                className="rounded-full px-3 py-1 text-xs font-semibold capitalize"
                style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#67e8f9' }}
              >
                {word}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5" style={{ color: '#a5b4fc', opacity: 0.82 }}>
            Try broad everyday nouns first, then follow the warmer ranks.
          </p>
        </motion.div>

        {/* Input Area */}
        <motion.div
          className="glass p-6 rounded-2xl space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GuessInput
            onSubmit={handleSubmitGuess}
            disabled={loading || !!revealedWord}
            placeholder="Type a word and press Enter..."
          />

          <div className="flex items-center justify-between text-sm" style={{ color: '#a5b4fc' }}>
            <span>{guesses.length} {guesses.length === 1 ? 'guess' : 'guesses'}</span>
            {!revealedWord && (
              <button
                onClick={handleGiveUp}
                className="text-xs px-4 py-1.5 rounded-lg transition hover:bg-white/5"
                style={{ color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
              >
                Give Up
              </button>
            )}
          </div>
        </motion.div>

        {/* Revealed word after giving up */}
        <AnimatePresence>
          {revealedWord && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-6 rounded-2xl text-center"
            >
              <p className="text-sm mb-2" style={{ color: '#a5b4fc' }}>The secret word was</p>
              <p className="text-3xl font-black capitalize" style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>{revealedWord}</p>
              <motion.button
                onClick={onGameEnd}
                className="mt-4 px-8 py-2 rounded-xl text-white text-sm font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                New Game
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Closest Guess Card */}
        <AnimatePresence>
          {bestGuess && !revealedWord && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-6 rounded-2xl"
            >
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#06b6d4' }}>🎯 Closest Guess</h3>
              <SimilarityMeter
                word={bestGuess.guessed_word}
                similarity={bestGuess.similarity_score}
                rank={bestGuess.rank}
                total={bestGuess.total_vocabulary}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guess History */}
        {sortedGuesses.length > 0 && (
          <motion.div
            className="glass p-6 rounded-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: '#c7d2fe' }}>
              Your Guesses — sorted by rank
            </h2>
            <GuessHistory guesses={sortedGuesses} total={sortedGuesses[0]?.total_vocabulary || 89} />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
