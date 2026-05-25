import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl text-center">
          <h1 className="text-5xl font-extrabold text-gray-800">Welcome to the Home Page</h1>
          <p className="mt-4 text-lg text-gray-600">
            This page is styled beautifully using Tailwind CSS. Explore and enjoy the design!
          </p>
          <div className="mt-6">
            <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}