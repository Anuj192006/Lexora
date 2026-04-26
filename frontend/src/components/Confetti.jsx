import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Confetti() {
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    const newPieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.2,
      duration: Math.random() * 2 + 2,
      rotation: Math.random() * 360,
      color: ['#c7d2fe', '#06b6d4', '#7c3aed'][Math.floor(Math.random() * 3)],
    }))
    setPieces(newPieces)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${piece.left}%`,
            top: -10,
            background: piece.color,
          }}
          animate={{
            y: [0, window.innerHeight + 10],
            x: [0, (Math.random() - 0.5) * 200],
            rotate: [0, piece.rotation],
            opacity: [1, 0],
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
