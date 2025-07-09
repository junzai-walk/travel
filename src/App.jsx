import { useState, useEffect } from 'react'
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

  // 监听页面切换，自动滚动到顶部
  useEffect(() => {
    // 使用 setTimeout 确保在 DOM 更新后执行滚动
    const scrollToTop = () => {
      // 平滑滚动到页面顶部
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })

      // 同时重置 document.documentElement 和 document.body 的滚动位置
      // 以确保在不同浏览器中都能正常工作
      if (document.documentElement) {
        document.documentElement.scrollTop = 0
      }
      if (document.body) {
        document.body.scrollTop = 0
      }

      // 开发环境下的调试信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`页面切换到: ${activeSection}，滚动位置已重置到顶部`)
      }
    }

    // 使用 requestAnimationFrame 确保在下一帧执行，避免与页面渲染冲突
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(scrollToTop)
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [activeSection]) // 依赖 activeSection，当页面切换时触发

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
