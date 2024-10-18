import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlayIcon } from '@heroicons/react/24/solid'

function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen relative overflow-hidden px-4 lg:px-0">
      {/* Animated Background Image */}
      <motion.div 
        className="absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 2 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          backgroundImage: 'url("/moxie-4.png")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></motion.div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 lg:mb-8 text-white shadow-text"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          Welcome to Moxie Miner
        </motion.h1>
        <motion.p 
          className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 text-white shadow-text"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Discover hidden treasures and collect Fan Tokens in this exciting puzzle game!
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Link 
            to="/game" 
            className="px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white font-bold rounded-full hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center space-x-2 group shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-base sm:text-lg lg:text-xl"
          >
            <span>Start Playing</span>
            <motion.div
              animate={{
                rotate: [0, 15, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <PlayIcon className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white group-hover:text-yellow-300 transition-colors duration-200" />
            </motion.div>
          </Link>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <motion.img
        src="/moxie-2.png"
        alt="Moxie Character"
        className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      />
      <motion.img
        src="/moxie-1.png"
        alt="Moxie Character"
        className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 lg:w-64 lg:h-64 object-contain"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      />
    </div>
  )
}

export default Home