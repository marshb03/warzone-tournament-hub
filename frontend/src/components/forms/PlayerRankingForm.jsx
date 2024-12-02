import { useState } from 'react';

const PlayerRankingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    playerName: '',
    rank: '',
    kd: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="playerName" className="block text-sm font-medium text-gray-700">
          Player Name
        </label>
        <input
          type="text"
          id="playerName"
          name="playerName"
          value={formData.playerName}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
          Rank
        </label>
        <input
          type="number"
          id="rank"
          name="rank"
          value={formData.rank}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          min="1"
          required
        />
      </div>

      <div>
        <label htmlFor="kd" className="block text-sm font-medium text-gray-700">
          K/D Ratio
        </label>
        <input
          type="number"
          id="kd"
          name="kd"
          value={formData.kd}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          step="0.01"
          min="0"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Submit Ranking
      </button>
    </form>
  );
};

export default PlayerRankingForm;