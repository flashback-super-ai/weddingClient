import NavBar from '../../components/navBar'

export default function Gift() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Gift Registry</h1>
          <p className="text-lg text-gray-600">Browse and select your perfect wedding gifts</p>
        </div>
      </div>
    </div>
  );
}
