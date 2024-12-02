import { useState } from 'react';
import Modal from '../components/common/Modal';
import PlayerRankingForm from '../components/forms/PlayerRankingForm';
import { LoadingSpinner } from '../components/common/Loading';

const PlayerRankings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rankings, setRankings] = useState([
    { id: 1, playerName: 'Player1', rank: 1, kd: '2.5' },
    { id: 2, playerName: 'Player2', rank: 2, kd: '2.1' },
    // Add more mock data as needed
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new ranking to the list
      setRankings(prev => [...prev, { id: prev.length + 1, ...formData }]);
      
      // Close modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error submitting ranking:', error);
    }
    setIsLoading(false);
  };

  return (
    <div className="py-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Player Rankings
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Submit Ranking
          </button>
        </div>

        {/* Rankings Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Player Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  K/D Ratio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rankings.map((player) => (
                <tr key={player.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.playerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {player.kd}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Form */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Submit Player Ranking"
        >
          {isLoading ? (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <PlayerRankingForm onSubmit={handleFormSubmit} />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PlayerRankings;