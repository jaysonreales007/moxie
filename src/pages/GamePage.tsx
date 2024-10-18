import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import MiningGame from '../components/MiningGame'
import { PlayIcon, GiftIcon, HomeIcon } from '@heroicons/react/24/solid'
import { HistoryIcon } from 'lucide-react'

const GamePage: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'countdown' | 'playing'>('menu')
  const [countdown, setCountdown] = useState(5)
  const navigate = useNavigate()

  const menuItems = [
    { label: 'New Game', action: () => setGameState('countdown'), icon: PlayIcon },
    { label: 'Rewards', action: () => navigate('/rewards'), icon: GiftIcon },
    { label: 'History', action: () => navigate('/game-history'), icon: HistoryIcon },
    { label: 'Back To Home', action: () => navigate('/'), icon: HomeIcon }
  ]

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing')
    }
  }, [gameState, countdown])

  if (gameState === 'playing') {
    return (
      <motion.div 
        className="flex-grow mt-16 p-4"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <MiningGame />
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="flex-grow mt-16 p-4 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800 p-8 rounded-lg shadow-xl"
          >
            <h2 className="text-3xl font-bold mb-6 text-blue-400">Game Menu</h2>
            <div className="space-y-4">
              {menuItems.map((item, index) => (
                <motion.button
                  key={index}
                  className="flex items-center justify-center max-w-96 w-96 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={item.action}
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
        {gameState === 'countdown' && (
          <motion.div
            key="countdown"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="text-9xl font-bold text-blue-400"
          >
            {countdown === 0 ? 'GO!' : countdown}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default GamePage
