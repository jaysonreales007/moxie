import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Heart } from 'lucide-react'
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

const MiningGame: React.FC = () => {
  const [score, setScore] = useState(0)
  const [health, setHealth] = useState(5)
  const [gameObjects, setGameObjects] = useState<GameObject[]>([])
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>({ x: 450, y: 350 })
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
  const [fastRocks, setFastRocks] = useState<GameObject[]>([])
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  })

  const baseGameWidth = windowSize.width
  const baseGameHeight = windowSize.height
  const basePlayerWidth = baseGameWidth * 0.075
  const basePlayerHeight = baseGameHeight * 0.15
  const baseObjectSize = baseGameWidth * 0.033

  const [gameSize, setGameSize] = useState({ width: baseGameWidth, height: baseGameHeight })

  const gameWidth = gameSize.width
  const gameHeight = gameSize.height
  const playerWidth = basePlayerWidth * scale
  const playerHeight = basePlayerHeight * scale
  const objectSize = baseObjectSize * scale

  const obstacleCount = 2

  const createGameObject = useCallback((type: 'reward' | 'rock' | 'fastRock' = 'rock'): GameObject => {
    const isReward = type === 'reward'
    return {
      id: Math.random(),
      x: Math.random() * (gameWidth - objectSize),
      y: 0,
      type,
      imageIndex: isReward ? undefined : Math.floor(Math.random() * obstacleCount) + 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
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
      setFastRocks([]) // Clear fast rocks after speed increase
    } else if (timeSinceLastIncrease >= 25000 && timeSinceLastIncrease < 30000) {
      setCountdown(Math.ceil((30000 - timeSinceLastIncrease) / 1000))
      
      // Add fast rocks if player size is >= 1.4
      if (playerSizeMultiplier >= 1.4 && fastRocks.length === 0) {
        const newFastRocks = Array(3).fill(null).map(() => createGameObject('fastRock'))
        setFastRocks(newFastRocks)
      }
    } else {
      setCountdown(null)
    }

    setGameObjects((prevObjects) => {
      const newObjects = prevObjects
        .map((obj) => ({
          ...obj,
          y: obj.y + 5 * speedMultiplier * scale,
          rotation: (obj.rotation + obj.rotationSpeed) % 360
        }))
        .filter((obj) => obj.y < gameHeight)

      if (Math.random() < 0.1) {
        newObjects.push(createGameObject(Math.random() > 0.5 ? 'reward' : 'rock'))
      }

      return newObjects
    })

    // Update fast rocks position and rotation
    setFastRocks((prevFastRocks) => {
      return prevFastRocks
        .map((rock) => ({
          ...rock,
          y: rock.y + speedMultiplier * scale, // Move fast rocks 20 times faster than normal rocks
          rotation: (rock.rotation + rock.rotationSpeed * 2) % 360 // Spin fast rocks twice as fast as normal rocks
        }))
        .filter((rock) => rock.y < gameHeight) // Remove rocks that have moved off the screen
    })

    const allObjects = [...gameObjects, ...fastRocks]
    const playerCenterX = playerPosition.x + (playerWidth * playerSizeMultiplier) / 2
    const playerCenterY = playerPosition.y + (playerHeight * playerSizeMultiplier) / 2

    allObjects.forEach((obj) => {
      const objCenterX = obj.x + objectSize / 2
      const objCenterY = obj.y + objectSize / 2
      const distance = Math.sqrt(
        Math.pow(playerCenterX - objCenterX, 2) + Math.pow(playerCenterY - objCenterY, 2)
      )

      if (distance < (playerWidth * playerSizeMultiplier + objectSize) / 2) {
        if (obj.type === 'reward') {
          setScore((prevScore) => prevScore + 1)
          setSparkles((prev) => [
            ...prev,
            { id: Math.random(), x: obj.x + objectSize / 2, y: obj.y + objectSize / 2 }
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
            { id: Math.random(), x: obj.x + objectSize / 2, y: obj.y + objectSize / 2 }
          ])
        }
        // Remove the collided object
        if (obj.type === 'fastRock') {
          setFastRocks((prev) => prev.filter((rock) => rock.id !== obj.id))
        } else {
          setGameObjects((prev) => prev.filter((gameObj) => gameObj.id !== obj.id))
        }
      }
    })

    gameLoopRef.current = requestAnimationFrame(updateGameState)
  }, [playerPosition, createGameObject, gameOver, speedMultiplier, playerSizeMultiplier, gameHeight, playerWidth, playerHeight, objectSize, scale, gameObjects, fastRocks])

  useEffect(() => {
    const handleResize = () => {
      const container = gameAreaRef.current
      if (container) {
        const { width, height } = container.getBoundingClientRect()
        const newScale = Math.min(width / baseGameWidth, height / baseGameHeight)
        setScale(newScale)
        setGameSize({
          width: width / newScale,
          height: height / newScale
        })
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
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
    const newX = (e.clientX - gameRect.left - (playerWidth * playerSizeMultiplier) / 2) / scale
    const newY = (e.clientY - gameRect.top - (playerHeight * playerSizeMultiplier) / 2) / scale
    setPlayerPosition({
      x: Math.max(0, Math.min(newX, gameWidth - playerWidth * playerSizeMultiplier)),
      y: Math.max(0, Math.min(newY, gameHeight - playerHeight * playerSizeMultiplier))
    })
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (gameOver) return
    const gameRect = e.currentTarget.getBoundingClientRect()
    const touch = e.touches[0]
    const newX = (touch.clientX - gameRect.left - (playerWidth * playerSizeMultiplier) / 2) / scale
    const newY = (touch.clientY - gameRect.top - (playerHeight * playerSizeMultiplier) / 2) / scale
    setPlayerPosition({
      x: Math.max(0, Math.min(newX, gameWidth - playerWidth * playerSizeMultiplier)),
      y: Math.max(0, Math.min(newY, gameHeight - playerHeight * playerSizeMultiplier))
    })
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
    <div className="flex flex-col items-center justify-center min-h-screen w-full p-4 bg-gray-900">
      <div className="w-full max-w-4xl bg-gray-100 rounded-lg shadow-lg mb-4">
        <div className="text-2xl md:text-4xl font-bold text-center text-gray-950">Score: {score}</div>
        <div className="flex justify-center items-center mt-2">
          <div className="text-base md:text-lg text-gray-950">Health:</div>
          <div className="flex ml-2">
            {renderHearts()}
          </div>
        </div>
        <div className="text-xs md:text-sm text-gray-950 mt-2">Speed: x{speedMultiplier.toFixed(1)}</div>
        <div className="text-xs md:text-sm text-gray-950">Player Size: x{playerSizeMultiplier.toFixed(1)}</div>
      </div>
      <div 
        ref={gameAreaRef}
        className="relative bg-gray-400 rounded-lg overflow-hidden shadow-lg border border-gray-600 w-full max-w-4xl"
        style={{ aspectRatio: `${baseGameWidth} / ${baseGameHeight}` }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <div style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top left', 
          width: gameWidth, 
          height: gameHeight 
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
                  width: objectSize, 
                  height: objectSize 
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
                  width: objectSize * 2, 
                  height: objectSize * 2,
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
              width: playerWidth * playerSizeMultiplier,
              height: playerHeight * playerSizeMultiplier,
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
              <div className="bg-black bg-opacity-70 text-white text-4xl md:text-6xl font-bold rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                {countdown}
              </div>
            </div>
          )}
        </div>
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-90">
            <div className="bg-gray-900 rounded-lg p-6 md:p-8 text-center shadow-lg border border-gray-600">
              <h2 className="text-3xl md:text-5xl font-bold text-red-500 mb-4">Game Over</h2>
              <p className="text-xl md:text-2xl text-gray-300 mb-6">Final Score: <span className="font-semibold text-white">{score}</span></p>
              <button onClick={restartGame} className="bg-blue-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-full text-lg md:text-xl hover:bg-blue-700 transition duration-300 ease-in-out shadow-md">Restart</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MiningGame
