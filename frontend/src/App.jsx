import { useState } from 'react'
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

  const API_BASE = 'http://localhost:8000'

  const startNewGame = async () => {
    try {
      const response = await fetch(`${API_BASE}/start-game`, { method: 'POST' })
      const data = await response.json()
      setSessionId(data.session_id)
      setGameData(data)
      setGameState('playing')
      setGuessCount(0)
    } catch (error) {
      console.error('Failed to start game:', error)
      alert('Failed to connect to server. Make sure the backend is running on localhost:8000')
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

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex items-center justify-center"
          >
            <MenuScreen onStart={startNewGame} />
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
            <WinScreen onPlayAgain={startNewGame} guessCount={guessCount} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuScreen({ onStart }) {
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
        className="relative px-14 py-4 rounded-2xl text-white font-bold text-lg"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
        }}
        whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(99, 102, 241, 0.6)' }}
        whileTap={{ scale: 0.95 }}
      >
        Play Now
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

function WinScreen({ onPlayAgain, guessCount }) {
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
        className="px-12 py-4 rounded-2xl text-white font-bold text-lg"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Play Again
      </motion.button>
    </motion.div>
  )
}

export default App
