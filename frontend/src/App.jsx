import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameContainer from './components/GameContainer'
import BackgroundAnimation from './components/BackgroundAnimation'
import Confetti from './components/Confetti'

function App() {
  const [gameState, setGameState] = useState('menu')
  const [sessionId, setSessionId] = useState(null)
  const [gameData, setGameData] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const [guessCount, setGuessCount] = useState(0)
  const [isStarting, setIsStarting] = useState(false)
  const [startupElapsed, setStartupElapsed] = useState(0)

  const API_BASE = 'https://lexora-tzoz.onrender.com'

  useEffect(() => {
    if (!isStarting) {
      setStartupElapsed(0)
      return
    }

    const interval = window.setInterval(() => {
      setStartupElapsed((prev) => prev + 1)
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isStarting])

  const startNewGame = async () => {
    if (isStarting) return

    setIsStarting(true)
    try {
      const response = await fetch(`${API_BASE}/start-game`, { method: 'POST' })
      const data = await response.json()
      setSessionId(data.session_id)
      setGameData(data)
      setGameState('playing')
      setGuessCount(0)
    } catch (error) {
      console.error('Failed to start game:', error)
      alert('Failed to connect to the backend. If Render is waking up, give it about 50 seconds and try again.')
    } finally {
      setIsStarting(false)
    }
  }

  const handleGuess = async (word) => {
    const response = await fetch(`${API_BASE}/guess`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, word })
    })
    const result = await response.json()

    // If backend returned an error (word not in list), bubble it up
    if (result.error) {
      return result
    }

    setGuessCount(prev => prev + 1)

    if (result.is_correct) {
      setShowConfetti(true)
      setGameState('won')
      setTimeout(() => setShowConfetti(false), 5000)
    }

    return result
  }

  const handleGiveUp = async () => {
    try {
      const response = await fetch(`${API_BASE}/give-up/${sessionId}`, { method: 'POST' })
      const data = await response.json()
      return data
    } catch {
      return null
    }
  }

  return (
    <div className="w-full h-screen overflow-hidden relative" style={{background: 'linear-gradient(135deg, #0a0e27 0%, #1e1b4b 50%, #0f172a 100%)'}}>
      <BackgroundAnimation />

      {showConfetti && <Confetti />}

      <AnimatePresence>
        {isStarting && <ColdStartOverlay elapsed={startupElapsed} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <MenuScreen onStart={startNewGame} isStarting={isStarting} />
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <GameContainer
              sessionId={sessionId}
              gameData={gameData}
              onGuess={handleGuess}
              onGiveUp={handleGiveUp}
              onGameEnd={() => setGameState('menu')}
            />
          </motion.div>
        )}

        {gameState === 'won' && (
          <motion.div
            key="won"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <WinScreen onPlayAgain={startNewGame} guessCount={guessCount} isStarting={isStarting} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuScreen({ onStart, isStarting }) {
  return (
    <motion.div
      className="text-center px-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-7xl font-black mb-2" style={{
        background: 'linear-gradient(135deg, #c7d2fe 0%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>Lexora</h1>
      <p className="text-lg mb-10 max-w-md mx-auto" style={{color: '#c7d2fe', opacity: 0.85}}>
        Guess the secret word. Each guess shows how close you are.
      </p>

      <motion.button
        onClick={onStart}
        disabled={isStarting}
        className="relative px-14 py-4 rounded-2xl text-white font-bold text-lg"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
        }}
        whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(99, 102, 241, 0.6)' }}
        whileTap={{ scale: 0.95 }}
      >
        {isStarting ? 'Waking Server...' : 'Play Now'}
      </motion.button>

      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-xl mx-auto">
        <FeatureCard icon="🎯" title="Guess Words" desc="Type any word and see your rank" />
        <FeatureCard icon="🔥" title="Get Closer" desc="Lower rank = warmer guess" />
        <FeatureCard icon="🏆" title="Rank #1 Wins" desc="Find the secret word to win" />
      </div>

      <p className="mt-10 text-xs opacity-30">Think of a fruit, place, animal, or everyday object</p>
    </motion.div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass p-5 rounded-xl text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-sm mb-1" style={{color: '#e5e7eb'}}>{title}</h3>
      <p className="text-xs" style={{color: '#a5b4fc'}}>{desc}</p>
    </div>
  )
}

function WinScreen({ onPlayAgain, guessCount, isStarting }) {
  return (
    <motion.div
      className="text-center px-6"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <div className="text-8xl mb-6">🎉</div>
      <h2 className="text-5xl font-black mb-4" style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>
        You Won!
      </h2>
      <p className="text-xl mb-2" style={{color: '#c7d2fe'}}>
        You found the secret word!
      </p>
      {guessCount > 0 && (
        <p className="text-sm mb-8" style={{color: '#a5b4fc', opacity: 0.7}}>
          Solved in {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}
        </p>
      )}

      <motion.button
        onClick={onPlayAgain}
        disabled={isStarting}
        className="px-12 py-4 rounded-2xl text-white font-bold text-lg"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isStarting ? 'Waking Server...' : 'Play Again'}
      </motion.button>
    </motion.div>
  )
}

function ColdStartOverlay({ elapsed }) {
  const progress = Math.min((elapsed / 50) * 100, 95)
  const secondsLeft = Math.max(0, 50 - elapsed)

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: 'rgba(5, 10, 24, 0.7)', backdropFilter: 'blur(14px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="glass w-full max-w-md rounded-2xl p-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mx-auto mb-5 h-14 w-14 rounded-full border-4 border-white/10 border-t-cyan-400 animate-spin" />
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#e5e7eb' }}>
          Waking up the backend
        </h2>
        <p className="text-sm mb-5" style={{ color: '#c7d2fe', opacity: 0.9 }}>
          Render free instances can take up to 50 seconds to start. Keep this tab open while Lexora gets ready.
        </p>

        <div className="h-2 w-full rounded-full overflow-hidden mb-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)' }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs" style={{ color: '#a5b4fc' }}>
          <span>{elapsed}s elapsed</span>
          <span>{secondsLeft > 0 ? `about ${secondsLeft}s left` : 'almost there'}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default App
