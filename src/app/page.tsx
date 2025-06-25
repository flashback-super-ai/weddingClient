import NavBar from '../components/navBar'
import Home from './home'

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 relative">
        <Home />
      </div>
    </div>
  )
}
