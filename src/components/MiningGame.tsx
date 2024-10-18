import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
import BloodSplatter from './BloodSplatter'
import SparkleEffect from './SparkleEffect'
import '../styles/MiningGame.css'

interface GameObject {
  id: number
  x: number
  y: number
  type: 'reward' | 'rock'
  imageIndex?: number
}

const MiningGame: React.FC = () => {
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(5)
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [playerPosition, setPlayerPosition] = useState(50)
  const [gameOver, setGameOver] = useState(false)
  const [bloodSplatters, setBloodSplatters] = useState<{ id: number; x: number; y: number }[]>([])
  const [sparkles, setSparkles] = useState<{ id: number; x: number; y: number }[]>([])
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [playerSizeMultiplier, setPlayerSizeMultiplier] = useState(1)
  const [scale, setScale] = useState(1)
  const gameLoopRef = useRef<number | null>(null)
  const lastSpeedIncreaseRef = useRef(Date.now())
  const gameAreaRef = useRef<HTMLDivElement>(null)

  const baseGameWidth = 900
  const baseGameHeight = 400
  const basePlayerWidth = 50
  const basePlayerHeight = 50
  const baseObjectSize = 30

  const gameWidth = baseGameWidth * scale
  const gameHeight = baseGameHeight * scale
  const playerWidth = basePlayerWidth * scale
  const playerHeight = basePlayerHeight * scale
  const objectSize = baseObjectSize * scale

  const obstacleCount = 2

  const createGameObject = useCallback((): GameObject => {
    const isReward = Math.random() > 0.5
    return {
      id: Math.random(),
      x: Math.random() * (gameWidth - objectSize),
      y: 0,
      type: isReward ? 'reward' : 'rock',
      imageIndex: isReward ? undefined : Math.floor(Math.random() * obstacleCount) + 1
    }
  }, [gameWidth, objectSize])

  const updateGameState = useCallback(() => {
    if (gameOver) return

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

    setGameObjects((prevObjects) => {
      const newObjects = prevObjects
        .map((obj) => ({ ...obj, y: obj.y + 5 * speedMultiplier * scale }))
        .filter((obj) => obj.y < gameHeight)

      if (Math.random() < 0.1) {
        newObjects.push(createGameObject())
      }

      const playerLeft = playerPosition
      const playerRight = playerPosition + playerWidth * playerSizeMultiplier

      return newObjects.filter((obj) => {
        if (
          obj.y + objectSize >= gameHeight - playerHeight * playerSizeMultiplier &&
          obj.x < playerRight &&
          obj.x + objectSize > playerLeft
        ) {
          if (obj.type === 'reward') {
            setScore((prevScore) => prevScore + 1)
            setSparkles((prev) => [
              ...prev,
              { id: Math.random(), x: obj.x + objectSize / 2, y: gameHeight - playerHeight * playerSizeMultiplier }
            ])
          } else {
            setHealth((prevHealth) => {
              const newHealth = prevHealth - 1
              if (newHealth <= 0) {
                setGameOver(true)
              }
              return newHealth
            })
            setBloodSplatters((prev) => [
              ...prev,
              { id: Math.random(), x: obj.x, y: gameHeight - playerHeight * playerSizeMultiplier }
            ])
          }
          return false
        }
        return true
      })
    })

    gameLoopRef.current = requestAnimationFrame(updateGameState)
  }, [playerPosition, createGameObject, gameOver, speedMultiplier, playerSizeMultiplier, gameHeight, playerWidth, playerHeight, objectSize, scale])

  useEffect(() => {
    const handleResize = () => {
      if (gameAreaRef.current) {
        const { width, height } = gameAreaRef.current.getBoundingClientRect()
        const newScale = Math.min(width / baseGameWidth, height / baseGameHeight)
        setScale(newScale)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(updateGameState)
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
    }
  }, [updateGameState])

  useEffect(() => {
    if (bloodSplatters.length > 0) {
      const timer = setTimeout(() => {
        setBloodSplatters([])
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [bloodSplatters])

  useEffect(() => {
    if (sparkles.length > 0) {
      const timer = setTimeout(() => {
        setSparkles([])
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [sparkles])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameOver) return
    const gameRect = e.currentTarget.getBoundingClientRect()
    const newPosition = (e.clientX - gameRect.left - playerWidth * playerSizeMultiplier / 2) / scale
    setPlayerPosition(Math.max(0, Math.min(newPosition, gameWidth - playerWidth * playerSizeMultiplier)))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameOver) return
    const gameRect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const newPosition = (touch.clientX - gameRect.left - playerWidth * playerSizeMultiplier / 2) / scale
    setPlayerPosition(Math.max(0, Math.min(newPosition, gameWidth - playerWidth * playerSizeMultiplier)))
  }

  const restartGame = () => {
    setScore(0)
    setHealth(5)
    setGameObjects([])
    setGameOver(false)
    setSpeedMultiplier(1)
    setPlayerSizeMultiplier(1)
    lastSpeedIncreaseRef.current = Date.now()
    gameLoopRef.current = requestAnimationFrame(updateGameState)
  }

  const renderHearts = () => {
    const hearts = []
    for (let i = 0; i < 5; i++) {
      hearts.push(
        <Heart
          key={i}
          size={24}
          fill={i < health ? '#ff0000' : 'none'}
          color={i < health ? '#ff0000' : '#ff0000'}
        />
      )
    }
    return hearts
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-500 p-4">
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4 w-full max-w-md">
        <div className="text-xl md:text-2xl font-bold text-center text-gray-800">Score: {score}</div>
        <div className="flex justify-center items-center mt-2">
          <div className="text-base md:text-lg text-gray-800">Health:</div>
          <div className="flex ml-2">
            {renderHearts()}
          </div>
        </div>
        <div className="text-xs md:text-sm text-gray-600 mt-2">Speed: x{speedMultiplier.toFixed(1)}</div>
        <div className="text-xs md:text-sm text-gray-600">Player Size: x{playerSizeMultiplier.toFixed(1)}</div>
      </div>
      <div 
        ref={gameAreaRef}
        className="relative bg-gray-200 rounded-lg overflow-hidden touch-none"
        style={{ width: '100%', maxWidth: `${baseGameWidth}px`, aspectRatio: `${baseGameWidth} / ${baseGameHeight}` }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: baseGameWidth, height: baseGameHeight }}>
          {gameObjects.map((obj) => (
            obj.type === 'reward' ? (
              <img
                key={obj.id}
                src="/images/moxie.png"
                alt="Reward"
                className="absolute game-object reward transition-transform duration-300 hover:scale-110"
                style={{ left: obj.x / scale, top: obj.y / scale, width: baseObjectSize, height: baseObjectSize }}
              />
            ) : (
              <img
                key={obj.id}
                src={`/images/obstacles/daggers${obj.imageIndex}.png`}
                alt="Obstacle"
                className="absolute game-object rock transition-transform duration-300 hover:scale-110"
                style={{ left: obj.x / scale, top: obj.y / scale, width: baseObjectSize * 2, height: baseObjectSize * 2 }}
              />
            )
          ))}
          <img
            src="/images/player-icon.png"
            alt="Player"
            className="absolute player"
            style={{
              left: playerPosition / scale,
              width: basePlayerWidth * playerSizeMultiplier,
              height: basePlayerHeight * playerSizeMultiplier,
              bottom: 0,
              transition: 'width 0.3s, height 0.3s'
            }}
          />
          {bloodSplatters.map((splatter) => (
            <BloodSplatter key={splatter.id} x={splatter.x / scale} y={splatter.y / scale} />
          ))}
          {sparkles.map((sparkle) => (
            <SparkleEffect key={sparkle.id} x={sparkle.x / scale} y={sparkle.y / scale} />
          ))}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 text-white text-4xl md:text-6xl font-bold rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                {countdown}
              </div>
            </div>
          )}
        </div>
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-4 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-red-600">Game Over</h2>
              <p className="text-base md:text-lg">Final Score: {score}</p>
              <button onClick={restartGame} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Restart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MiningGame
