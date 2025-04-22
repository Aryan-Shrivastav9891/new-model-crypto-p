import { FiMoon, FiSun, FiSearch } from 'react-icons/fi';

export default function Header({ darkMode, setDarkMode, search, setSearch }) {
  return (
    <header className={`py-6 px-4 sm:px-6 sticky top-0 z-10 ${darkMode ? 'bg-gray-800' : 'bg-white shadow-md'}`}>
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
          CryptoTracker Pro
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <div className={`relative rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full sm:w-80 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'
              }`}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
