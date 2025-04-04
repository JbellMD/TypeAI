import ChatContainer from './components/ChatContainer'
import ThemeToggle from './components/ThemeToggle'
import './App.css'

function App() {
  return (
    <div className="app-container">
      <ThemeToggle />
      <ChatContainer />
    </div>
  )
}

export default App
