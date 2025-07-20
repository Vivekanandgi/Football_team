import React, { useState, useMemo } from 'react';

// --- Configuration Constants ---
const MAX_PLAYERS_IN_SQUAD = 15;
const MAX_PLAYERS_PER_COUNTRY = 4;
const POSITION_LIMITS = {
  Goalkeeper: 2,
  Defender: 5,
  Midfielder: 5,
  Forward: 5,
};

// --- Data for Players ---
const playersData = {
  "Brazil": [
    { id: 1, name: "Alisson", position: "Goalkeeper" },
    { id: 2, name: "Marquinhos", position: "Defender" },
    { id: 3, name: "Éder Militão", position: "Defender" },
    { id: 4, name: "Casemiro", position: "Midfielder" },
    { id: 5, name: "Neymar Jr.", position: "Forward" },
    { id: 6, name: "Vinícius Jr.", position: "Forward" },
  ],
  "Argentina": [
    { id: 7, name: "E. Martínez", position: "Goalkeeper" },
    { id: 8, name: "C. Romero", position: "Defender" },
    { id: 9, name: "L. Martínez", position: "Defender" },
    { id: 10, name: "R. De Paul", position: "Midfielder" },
    { id: 11, name: "Lionel Messi", position: "Forward" },
    { id: 12, name: "J. Álvarez", position: "Forward" },
  ],
  "France": [
    { id: 13, name: "Mike Maignan", position: "Goalkeeper" },
    { id: 14, name: "W. Saliba", position: "Defender" },
    { id: 15, name: "J. Koundé", position: "Defender" },
    { id: 16, name: "A. Tchouaméni", position: "Midfielder" },
    { id: 17, name: "K. Mbappé", position: "Forward" },
    { id: 18, name: "A. Griezmann", position: "Forward" },
  ],
  "Germany": [
    { id: 19, name: "M. ter Stegen", position: "Goalkeeper" },
    { id: 20, name: "A. Rüdiger", position: "Defender" },
    { id: 21, name: "J. Tah", position: "Defender" },
    { id: 22, name: "Joshua Kimmich", position: "Midfielder" },
    { id: 23, name: "Jamal Musiala", position: "Midfielder" },
    { id: 24, name: "Kai Havertz", position: "Forward" },
  ]
};


// --- Helper Components ---

// Notification Component
const Notification = ({ message, type, onClose }) => {
  if (!message) return null;
  
  const baseStyle = "p-4 rounded-lg shadow-lg mb-4 text-white text-center animate-fade-in-down";
  const typeStyles = {
    error: "bg-red-500",
    success: "bg-green-500",
    info: "bg-blue-500"
  };

  return (
    <div className={`${baseStyle} ${typeStyles[type]}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">X</button>
    </div>
  );
};

// Player Card Component
const PlayerCard = ({ player, onAction, actionType, country, isSelected, isDisabled }) => {
  const buttonStyles = {
    add: "bg-blue-500 hover:bg-blue-600",
    remove: "bg-red-500 hover:bg-red-600",
  };
  
  const buttonText = {
    add: "+ Add",
    remove: "− Remove"
  };

  return (
    <div className={`p-3 rounded-lg shadow-md transition-all duration-300 ${isSelected ? 'bg-green-100' : 'bg-white'} ${isDisabled && actionType === 'add' ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-gray-800">{player.name}</p>
          <p className="text-sm text-gray-500">{player.position} ({country})</p>
        </div>
        <button
          onClick={() => onAction(player, country)}
          disabled={isDisabled}
          className={`px-3 py-1 text-white text-sm font-semibold rounded-full shadow-sm transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[actionType]}`}
        >
          {buttonText[actionType]}
        </button>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [myTeam, setMyTeam] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  // Memoize team counts to avoid recalculating on every render
  const { countryCounts, positionCounts } = useMemo(() => {
    const cCounts = {};
    const pCounts = { Goalkeeper: 0, Defender: 0, Midfielder: 0, Forward: 0 };
    
    for (const player of myTeam) {
      cCounts[player.country] = (cCounts[player.country] || 0) + 1;
      pCounts[player.position] = (pCounts[player.position] || 0) + 1;
    }
    return { countryCounts: cCounts, positionCounts: pCounts };
  }, [myTeam]);
  
  const selectedPlayerIds = useMemo(() => new Set(myTeam.map(p => p.id)), [myTeam]);

  // Function to show a notification and have it fade
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  // --- Core Logic ---
  const handleAddPlayer = (player, country) => {
    // Rule 1: Squad cannot exceed max size
    if (myTeam.length >= MAX_PLAYERS_IN_SQUAD) {
      showNotification(`Your squad is full! (${MAX_PLAYERS_IN_SQUAD} players maximum)`, "error");
      return;
    }

    // Rule 2: Cannot have more players than the country limit
    if ((countryCounts[country] || 0) >= MAX_PLAYERS_PER_COUNTRY) {
      showNotification(`You can't select more than ${MAX_PLAYERS_PER_COUNTRY} players from ${country}.`, "error");
      return;
    }
    
    // Rule 3: Cannot exceed position limits
    const currentPositionCount = positionCounts[player.position] || 0;
    const maxForPosition = POSITION_LIMITS[player.position];
    if (currentPositionCount >= maxForPosition) {
        showNotification(`You can't select more than ${maxForPosition} ${player.position}s.`, "error");
        return;
    }
    
    // Rule 4: Player cannot be added twice
    if (selectedPlayerIds.has(player.id)) {
        showNotification(`${player.name} is already in your squad.`, "info");
        return;
    }

    setMyTeam([...myTeam, { ...player, country }]);
    showNotification(`${player.name} has been added to your squad!`, "success");
  };

  const handleRemovePlayer = (playerToRemove) => {
    setMyTeam(myTeam.filter(player => player.id !== playerToRemove.id));
    showNotification(`${playerToRemove.name} has been removed.`, "info");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
      `}</style>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">Football Squad Builder</h1>
          <p className="text-gray-600 mt-2">Build a {MAX_PLAYERS_IN_SQUAD}-player squad with positional and national limits.</p>
        </header>

        {/* Notification Area */}
        <div className="fixed top-5 right-5 z-50 w-80">
            <Notification 
                message={notification.message} 
                type={notification.type}
                onClose={() => setNotification({ message: '', type: '' })}
            />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Panel: Player Selection */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 border-b pb-3 mb-4">Available Players</h2>
            <div className="space-y-6">
              {Object.entries(playersData).map(([country, players]) => (
                <div key={country}>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                    <img src={`https://flagcdn.com/w40/${country === 'Brazil' ? 'br' : country === 'Argentina' ? 'ar' : country === 'France' ? 'fr' : 'de'}.png`} alt={`${country} flag`} className="w-6 h-auto mr-3 rounded-sm"/>
                    {country}
                    <span className="ml-auto text-sm font-normal bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                      {countryCounts[country] || 0} / {MAX_PLAYERS_PER_COUNTRY} selected
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {players.map(player => {
                      const isSelected = selectedPlayerIds.has(player.id);
                      const isCountryFull = (countryCounts[country] || 0) >= MAX_PLAYERS_PER_COUNTRY;
                      const isPositionFull = (positionCounts[player.position] || 0) >= POSITION_LIMITS[player.position];
                      const isSquadFull = myTeam.length >= MAX_PLAYERS_IN_SQUAD;
                      const isDisabled = isSelected || isCountryFull || isPositionFull || isSquadFull;
                      
                      return (
                        <PlayerCard
                          key={player.id}
                          player={player}
                          country={country}
                          onAction={handleAddPlayer}
                          actionType="add"
                          isSelected={isSelected}
                          isDisabled={isDisabled}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: My Team */}
          <div className="bg-white p-6 rounded-xl shadow-lg lg:sticky top-8">
             <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-700">My Squad</h2>
                <div className="text-right">
                    <span className={`text-2xl font-bold ${myTeam.length > MAX_PLAYERS_IN_SQUAD ? 'text-red-500' : 'text-blue-600'}`}>
                        {myTeam.length}
                    </span>
                    <span className="text-gray-500"> / {MAX_PLAYERS_IN_SQUAD} Players</span>
                </div>
            </div>
            
            {/* Positional Breakdown */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                {Object.entries(POSITION_LIMITS).map(([position, limit]) => (
                    <div key={position} className="bg-gray-50 p-3 rounded-lg text-center">
                        <p className="text-sm text-gray-500">{position}s</p>
                        <p className="font-bold text-lg text-gray-800">
                            {positionCounts[position] || 0} / {limit}
                        </p>
                    </div>
                ))}
            </div>
            
            {myTeam.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Your squad is empty.</p>
                <p className="text-gray-400 text-sm">Start by adding players from the list.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
                {myTeam.map(player => (
                  <PlayerCard
                    key={`team-${player.id}`}
                    player={player}
                    country={player.country}
                    onAction={handleRemovePlayer}
                    actionType="remove"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
