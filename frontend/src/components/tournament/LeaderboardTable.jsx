// src/components/tournament/LeaderboardTable.jsx
import React from 'react';
import Card from '../ui/Card';

const LeaderboardTable = ({ rankings }) => {
  return (
    <Card className="overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-800">
            <th className="px-4 py-2 text-left">Rank</th>
            <th className="px-4 py-2 text-left">Team</th>
            <th className="px-4 py-2 text-center">Match History</th>
            <th className="px-4 py-2 text-center">W-L</th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((team) => (
            <tr key={team.teamId} className="border-t border-gray-700">
              <td className="px-4 py-2">{team.rank}</td>
              <td className="px-4 py-2">{team.teamName}</td>
              <td className="px-4 py-2">
                <div className="flex justify-center gap-1">
                  {team.matchHistory.map((match, index) => (
                    <span
                      key={index}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        match.result === 'W' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      {match.result}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-2 text-center">
                {team.wins}-{team.losses}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

export default LeaderboardTable;