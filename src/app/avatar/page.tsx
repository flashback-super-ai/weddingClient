import NavBar from '../../components/navBar'

export default function Avatar() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Avatar</h1>
          <p className="text-lg text-gray-600">Create and customize your wedding avatar</p>
        </div>
      </div>
    </div>
  );
}
