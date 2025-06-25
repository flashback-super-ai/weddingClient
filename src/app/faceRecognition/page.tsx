import { Scan, Wand2 } from 'lucide-react';
import NavBar from '../../components/navBar'

export default function FaceRecognition() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Face Recognition</h1>
          <p className="text-lg text-gray-600">Advanced face recognition features</p>
          
          <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105">
            <Scan className="w-5 h-5" />
            <span>Start Face Recognition</span>
            <Wand2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
