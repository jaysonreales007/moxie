import React, { useState } from 'react'
import { motion } from 'framer-motion'

const RewardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'balance' | 'history'>('balance')

  const tabVariants = {
    active: { backgroundColor: '#3182ce', color: 'white' },
    inactive: { backgroundColor: '#4a5568', color: '#a0aec0' }
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="flex-grow mt-16 p-4 flex items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h2 className="text-4xl font-bold mb-6 text-white">Rewards</h2>
        
        <div className="flex mb-6">
          <motion.button
            className="flex-1 py-2 px-4 rounded-tl-md rounded-bl-md"
            variants={tabVariants}
            animate={activeTab === 'balance' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('balance')}
          >
            Current Balance
          </motion.button>
          <motion.button
            className="flex-1 py-2 px-4 rounded-tr-md rounded-br-md"
            variants={tabVariants}
            animate={activeTab === 'history' ? 'active' : 'inactive'}
            onClick={() => setActiveTab('history')}
          >
            Withdrawal History
          </motion.button>
        </div>

        <motion.div
          key={activeTab}
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'balance' && (
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4 text-green-400">Current Balance</h3>
              <p className="text-4xl font-bold text-white">1000 MOXIE</p>
              <button className="relative mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                Withdraw
              </button>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">Withdrawal History</h3>
              <ul className="space-y-4">
                <li className="bg-gray-700 p-4 rounded flex flex-row items-center justify-between">
                    <p className="text-white">1</p>
                    <p className="text-white">500 MOXIE</p>
                    <p className="text-sm text-gray-400">Withdrawn on 2023-04-15</p>
                </li>
                <li className="bg-gray-700 p-4 rounded flex flex-row items-center justify-between">
                    <p className="text-white">2</p>
                    <p className="text-white">500 MOXIE</p>
                    <p className="text-sm text-gray-400">Withdrawn on 2023-04-15</p>
                </li>
                {/* Add more history items as needed */}
              </ul>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default RewardsPage
