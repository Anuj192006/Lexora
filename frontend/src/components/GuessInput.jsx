import { useState } from 'react'
import { motion } from 'framer-motion'

export default function GuessInput({ onSubmit, disabled, placeholder }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      onSubmit(input.trim().toLowerCase())
      setInput('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-brand-indigo/50 focus:outline-none transition"
        autoFocus
      />
      
      <motion.button
        type="submit"
        disabled={disabled || !input.trim()}
        className="px-8 py-3 bg-gradient-accent text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-indigo/30 hover:shadow-brand-indigo/50 transition"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {disabled ? 'Submitting...' : 'Guess'}
      </motion.button>
    </form>
  )
}
