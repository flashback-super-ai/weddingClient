import NavBar from '../../components/navBar'
import WeddingCalculator from '../../components/WeddingCalculator'

export default function Calculator() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 bg-gradient-to-br from-pink-100 to-purple-100">
        <WeddingCalculator />
      </div>
    </div>
  );
}
