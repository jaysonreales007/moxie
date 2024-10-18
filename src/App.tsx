import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import RewardsPage from './pages/RewardsPage'
import GameHistory from './pages/GameHistory'

function App() {
  return (
    <Router>
      <div className="App h-screen flex flex-col bg-gray-900 text-white overflow-hidden">
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/game-history" element={<GameHistory />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  )
}

export default App
