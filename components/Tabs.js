export default function Tabs({ selectedTab, setSelectedTab }) {
  const tabs = ['all', 'altcoins', 'memecoins', 'profitable', 'predicted', 'future'];

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex justify-center space-x-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium ${
              selectedTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
