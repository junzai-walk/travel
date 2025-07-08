import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import Home from './components/Home'
import TravelPlan from './components/TravelPlan'
import Transportation from './components/Transportation'
import Food from './components/Food'
import Accommodation from './components/Accommodation'
import Map from './components/Map'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home setActiveSection={setActiveSection} />
      case 'plan':
        return <TravelPlan />
      case 'transport':
        return <Transportation />
      case 'food':
        return <Food />
      case 'accommodation':
        return <Accommodation />
      case 'map':
        return <Map />
      default:
        return <Home setActiveSection={setActiveSection} />
    }
  }

  return (
    <div className="app">
      <Header activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  )
}

export default App
