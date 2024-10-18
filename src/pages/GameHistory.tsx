import React from 'react'
import { motion } from 'framer-motion'

const RewardsPage: React.FC = () => {
  return (
    <motion.div 
      className="flex-grow mt-8 p-4 flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl">
        <motion.h2 
          className="text-4xl font-bold mb-4 text-blue-400"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          Game History
        </motion.h2>
        <motion.p 
          className="text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your game history will be displayed here.
        </motion.p>
      </div>
    </motion.div>
  )
}

export default RewardsPage
