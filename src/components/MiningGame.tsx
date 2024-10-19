import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Pause, Play, RotateCcw, Home } from 'lucide-react'
import BloodSplatter from './BloodSplatter'
import SparkleEffect from './SparkleEffect'
import '../styles/MiningGame.css'

interface GameObject {
  id: number
  x: number
  y: number
  type: 'reward' | 'rock' | 'fastRock'
  imageIndex?: number
  rotation: number
  rotationSpeed: number
}

interface PlayerPosition {
  x: number
  y: number
}

interface MiningGameProps {
  onGameOver: () => void;
  onRestart: () => void;
}

const MiningGame: React.FC<MiningGameProps> = ({ onGameOver, onRestart }) => {
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(5)
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 0, y: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [bloodSplatters, setBloodSplatters] = useState<{ id: number; x: number; y: number }[]>([])
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([])
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [playerSizeMultiplier, setPlayerSizeMultiplier] = useState(1)
  const [fastRocks, setFastRocks] = useState<GameObject[]>([])
  const gameLoopRef = useRef<number | null>(null)
  const lastSpeedIncreaseRef = useRef(Date.now())
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const [gameSize, setGameSize] = useState({ width: 900, height: 400 })
  const [scale, setScale] = useState(1)

  const minSize = Math.min(gameSize.width, gameSize.height)
  const playerWidth = minSize * 0.15 * playerSizeMultiplier // Increased from 0.1 to 0.15
  const playerHeight = minSize * 0.15 * playerSizeMultiplier // Increased from 0.1 to 0.15
  const rewardSize = minSize * 0.08
  const obstacleSize = minSize * 0.1

  const obstacleCount = 2

  const [isPaused, setIsPaused] = useState(false)
  const [showGameOver, setShowGameOver] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (gameAreaRef.current) {
        const { width, height } = gameAreaRef.current.getBoundingClientRect()
        const aspectRatio = 16 / 9 // Desired aspect ratio
        let newWidth, newHeight

        if (width / height > aspectRatio) {
          // If the container is wider than the desired aspect ratio
          newHeight = height
          newWidth = height * aspectRatio
        } else {
          // If the container is taller than the desired aspect ratio
          newWidth = width
          newHeight = width / aspectRatio
        }

        setGameSize({ width: newWidth, height: newHeight })
        setScale(newWidth / 900) // Assuming 900 is the original base width
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const createGameObject = useCallback((): GameObject => {
    const isReward = Math.random() > 0.5
    const size = isReward ? rewardSize : obstacleSize
    return {
      id: Math.random(),
      x: Math.random() * (gameSize.width - size),
      y: 0,
      type: isReward ? 'reward' : 'rock',
      imageIndex: isReward ? undefined : Math.floor(Math.random() * obstacleCount) + 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    }
  }, [gameSize.width, rewardSize, obstacleSize])

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const restartGame = () => {
    setScore(0)
    setHealth(5)
    setGameObjects([])
    setFastRocks([])
    setGameOver(false)
    setShowGameOver(false)
    setPlayerPosition({ x: gameSize.width / 2, y: gameSize.height - playerHeight })
    setSpeedMultiplier(1)
    setPlayerSizeMultiplier(1)
    lastSpeedIncreaseRef.current = Date.now()
    onRestart()
  }

  const updateGameState = useCallback(() => {
    if (gameOver || isPaused) return

    const now = Date.now()
    const timeSinceLastIncrease = now - lastSpeedIncreaseRef.current

    if (timeSinceLastIncrease >= 30000) {
      setSpeedMultiplier(prev => prev + 0.2)
      setPlayerSizeMultiplier(prev => Math.min(prev + 0.1, 2))
      lastSpeedIncreaseRef.current = now
      setCountdown(null)
    } else if (timeSinceLastIncrease >= 25000 && timeSinceLastIncrease < 30000) {
      setCountdown(Math.ceil((30000 - timeSinceLastIncrease) / 1000))
    } else {
      setCountdown(null)
    }

    setGameObjects(prevObjects => {
      const newObjects = prevObjects
        .map(obj => ({
          ...obj,
          y: obj.y + 5 * speedMultiplier * scale,
          rotation: (obj.rotation + obj.rotationSpeed) % 360
        }))
        .filter(obj => obj.y < gameSize.height)

      if (Math.random() < 0.1) {
        newObjects.push(createGameObject())
      }

      return newObjects
    })

    setFastRocks(prevRocks => {
      return prevRocks
        .map(rock => ({
          ...rock,
          y: rock.y + 20 * speedMultiplier * scale,
          rotation: (rock.rotation + rock.rotationSpeed * 2) % 360
        }))
        .filter(rock => rock.y < gameSize.height)
    })

    const allObjects = [...gameObjects, ...fastRocks]
    const playerLeft = playerPosition.x
    const playerRight = playerPosition.x + playerWidth
    const playerTop = playerPosition.y
    const playerBottom = playerPosition.y + playerHeight

    allObjects.forEach(obj => {
      const objLeft = obj.x
      const objRight = obj.x + obstacleSize
      const objTop = obj.y
      const objBottom = obj.y + obstacleSize

      if (
        objLeft < playerRight &&
        objRight > playerLeft &&
        objTop < playerBottom &&
        objBottom > playerTop
      ) {
        if (obj.type === 'reward') {
          setScore(prevScore => prevScore + 1)
          setSparkles(prev => [
            ...prev,
            { id: Math.random(), x: obj.x + rewardSize / 2, y: obj.y + rewardSize / 2 }
          ])
        } else {
          setHealth(prevHealth => {
            const newHealth = prevHealth - 1
            if (newHealth <= 0) {
              setGameOver(true)
              setShowGameOver(true)
            }
            return newHealth
          })
          setBloodSplatters(prev => [
            ...prev,
            { id: Math.random(), x: obj.x + rewardSize / 2, y: obj.y + rewardSize / 2 }
          ])
        }
        // Remove the collided object
        if (obj.type === 'fastRock') {
          setFastRocks(prev => prev.filter(rock => rock.id !== obj.id))
        } else {
          setGameObjects(prev => prev.filter(gameObj => gameObj.id !== obj.id))
        }
      }
    })

    gameLoopRef.current = requestAnimationFrame(updateGameState)
  }, [gameOver, speedMultiplier, scale, createGameObject, gameObjects, fastRocks, playerPosition, playerWidth, playerHeight, gameSize.height, rewardSize, obstacleSize, isPaused])

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(updateGameState)
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGameState])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameOver) return
    const gameRect = e.currentTarget.getBoundingClientRect()
    const newX = (e.clientX - gameRect.left - playerWidth / 2) / scale
    const newY = (e.clientY - gameRect.top - playerHeight / 2) / scale
    setPlayerPosition({
      x: Math.max(0, Math.min(newX, gameSize.width / scale - playerWidth)),
      y: Math.max(0, Math.min(newY, gameSize.height / scale - playerHeight))
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-gray-900">
      <div className="w-full max-w-4xl bg-gray-100 rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-lg text-gray-800 mr-2">Health:</div>
            <div className="flex">
              {Array(5).fill(0).map((_, i) => (
                <Heart
                  key={i}
                  size={24}
                  fill={i < health ? '#ff0000' : 'none'}
                  color={i < health ? '#ff0000' : '#ff0000'}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center flex-col justify-center">
            <div className="text-2xl font-bold text-gray-800">Score: {score}</div>
            <div className="text-lg font-semibold text-blue-600">
              Speed: x{speedMultiplier.toFixed(1)}
            </div>
          </div>
          <button 
            onClick={togglePause} 
            className={`bg-blue-500 text-white p-2 rounded ${gameOver ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={gameOver}
          >
            {isPaused ? <Play size={24} /> : <Pause size={24} />}
          </button>
        </div>
      </div>

      <div 
        className="relative bg-gray-400 rounded-lg overflow-hidden shadow-lg border border-gray-600 w-full max-w-4xl"
        style={{ aspectRatio: '16/9' }}
        onMouseMove={handleMouseMove}
      >
        <div style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left', 
          width: gameSize.width / scale, 
          height: gameSize.height / scale,
          position: 'relative'
        }}>
          {[...gameObjects, ...fastRocks].map((obj) => (
            obj.type === 'reward' ? (
              <img
                key={obj.id}
                src="/images/moxie.png"
                alt="Reward"
                className="absolute game-object reward transition-transform duration-300 hover:scale-110"
                style={{ 
                  left: obj.x, 
                  top: obj.y, 
                  width: rewardSize, 
                  height: rewardSize,
                  boxShadow: '0 0 5px 3px #9333ea, 0 0 10px 6px rgba(147, 51, 234, 0.5)', // Glow effect
                  borderRadius: '50%', // Make the glow effect circular
                }}
              />
            ) : (
              <img
                key={obj.id}
                src={`/images/obstacles/daggers${obj.imageIndex}.png`}
                alt="Obstacle"
                className={`absolute game-object ${obj.type === 'fastRock' ? 'fast-rock' : 'rock'} transition-transform duration-300 hover:scale-110`}
                style={{ 
                  left: obj.x, 
                  top: obj.y, 
                  width: obstacleSize, 
                  height: obstacleSize,
                  transform: `rotate(${obj.rotation}deg)`,
                  transition: 'transform 0.1s linear'
                }}
              />
            )
          ))}
          <img
            src="/images/player-icon.png"
            alt="Player"
            className="absolute player"
            style={{
              left: playerPosition.x,
              top: playerPosition.y,
              width: playerWidth,
              height: playerHeight,
              transition: 'width 0.3s, height 0.3s'
            }}
          />
          {bloodSplatters.map((splatter) => (
            <BloodSplatter key={splatter.id} x={splatter.x} y={splatter.y} />
          ))}
          {sparkles.map((sparkle) => (
            <SparkleEffect key={sparkle.id} x={sparkle.x} y={sparkle.y} />
          ))}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-70 text-white text-6xl font-bold rounded-full w-32 h-32 flex items-center justify-center">
                {countdown}
              </div>
            </div>
          )}
        </div>
        
        <AnimatePresence>
          {(isPaused || showGameOver) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              <div className="bg-white p-8 rounded-lg text-center text-gray-950">
                {isPaused && <h2 className="text-3xl font-bold mb-4">Game Paused</h2>}
                {showGameOver && (
                  <>
                    <h2 className="text-3xl font-bold mb-4">Game Over</h2>
                    <p className="text-xl mb-4">Final Score: {score}</p>
                  </>
                )}
                <div className="flex justify-center space-x-4">
                  <button onClick={restartGame} className="bg-green-500 text-white p-2 rounded hover:bg-green-600">
                    <RotateCcw size={24} />
                  </button>
                  <button onClick={onGameOver} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                    <Home size={24} />
                  </button>
                  {isPaused && (
                    <button onClick={togglePause} className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600">
                      <Play size={24} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add a semi-transparent overlay when the game is over */}
        {gameOver && (
          <div className="absolute inset-0pointer-events-none"></div>
        )}
      </div>
    </div>
  )
}

export default MiningGame
