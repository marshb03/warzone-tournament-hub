import React, { useState } from 'react';
import { PlusCircle, X, Download, Loader2, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/common/Modal';
import api from '../services/api';

const TeamGenerator = () => {
  const [lists, setLists] = useState([[]]);
  const [teamSize, setTeamSize] = useState(2);
  const [generatedTeams, setGeneratedTeams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputMode, setInputMode] = useState('manual');

  const handleAddPlayer = (listIndex, playerName) => {
    if (!playerName.trim()) return;
    const newLists = [...lists];
    newLists[listIndex] = [...newLists[listIndex], playerName.trim()];
    setLists(newLists);
  };

  const handleRemovePlayer = (listIndex, playerIndex) => {
    const newLists = [...lists];
    newLists[listIndex] = newLists[listIndex].filter((_, idx) => idx !== playerIndex);
    setLists(newLists);
  };

  const handlePasteNames = (listIndex, text) => {
    const names = text.split(/[\n,]/).map(name => name.trim()).filter(name => name);
    const newLists = [...lists];
    newLists[listIndex] = names;
    setLists(newLists);
  };

  const handleAddList = () => {
    if (lists.length < 4) {
      setLists([...lists, []]);
    }
  };

  const handleRemoveList = (index) => {
    const newLists = lists.filter((_, idx) => idx !== index);
    setLists(newLists);
  };

  const generateTeams = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/v1/team-generator/generate', {
        lists,
        team_size: teamSize
      });
      setGeneratedTeams(response.data.teams);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error generating teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const TeamsDisplay = () => (
    <div className="space-y-16 p-4">

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {generatedTeams.map((team, index) => (
          <Card
            key={index}
            className="p-3 transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#2979FF]/10"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            <h3 className="text-xl font-medium mb-3 text-[#2979FF]">Team {index + 1}</h3>
            <p className="text-gray-300 text-lg">
              {team.join(' x ')}
            </p>
          </Card>
        ))}
      </div>
      <div className="flex justify-end">
        <Button 
          variant="secondary" 
          onClick={exportTeams}
          className="transform transition-all duration-300 hover:scale-105"
        >
          <Download className="h-4 w-4 mr-1" />
          Export Teams
        </Button>
      </div>
    </div>
  );

  const exportTeams = () => {
    if (!generatedTeams) return;
    
    const teamText = generatedTeams
      .map((team, index) => `Team ${index + 1}: ${team.join(' x ')}`)
      .join('\n');
    
    const blob = new Blob([teamText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-teams.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getListCount = (list) => {
    return list.length > 0 ? (
      <div className="flex items-center space-x-1 text-sm font-medium text-[#2979FF]">
        <Users className="h-4 w-4" />
        <span className="animate-pulse-soft">{list.length}</span>
        <span className="text-gray-400">players</span>
      </div>
    ) : (
      <div className="text-sm text-gray-400">No players added</div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Team Generator</h1>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Generated Teams"
      >
        <TeamsDisplay />
      </Modal>

      <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#2979FF]/10">
        <div className="space-y-6">
          {/* Team Size Selector with animation */}
          <div className="transition-all duration-300">
            <label className="block text-sm font-medium mb-2">Team Size</label>
            <div className="flex space-x-2">
              {[2, 3, 4].map(size => (
                <Button
                  key={size}
                  variant={teamSize === size ? 'primary' : 'ghost'}
                  onClick={() => setTeamSize(size)}
                  className={`w-16 transition-all duration-300 transform ${
                    teamSize === size ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* List Management with enhanced counters */}
          <div className="space-y-4">
            {lists.map((list, listIndex) => (
              <div 
                key={listIndex} 
                className="space-y-4 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-medium">List {listIndex + 1}</h3>
                    {getListCount(list)}
                  </div>
                  {lists.length > 1 && (
                    <Button
                      variant="ghost"
                      onClick={() => handleRemoveList(listIndex)}
                      className="text-red-500 hover:text-red-600 transform transition-all duration-300 hover:scale-110"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Input Mode Toggle */}
                <div className="flex space-x-2 mb-4">
                  <Button
                    variant={inputMode === 'manual' ? 'primary' : 'ghost'}
                    onClick={() => setInputMode('manual')}
                  >
                    Manual Entry
                  </Button>
                  <Button
                    variant={inputMode === 'paste' ? 'primary' : 'ghost'}
                    onClick={() => setInputMode('paste')}
                  >
                    Paste Names
                  </Button>
                </div>

                {inputMode === 'manual' ? (
                  <div className="animate-fadeIn">
                    <div className="flex space-x-2 mb-4">
                      <input
                        type="text"
                        placeholder="Enter player name"
                        className="flex-1 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all duration-300"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddPlayer(listIndex, e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        variant="primary"
                        onClick={(e) => {
                          const input = e.target.previousSibling;
                          handleAddPlayer(listIndex, input.value);
                          input.value = '';
                        }}
                        className="transform transition-all duration-300 hover:scale-105"
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {list.map((player, playerIndex) => (
                        <span
                          key={playerIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A237E] text-white transform transition-all duration-300 hover:bg-[#1A237E]/90 hover:scale-105"
                        >
                          {player}
                          <button
                            onClick={() => handleRemovePlayer(listIndex, playerIndex)}
                            className="ml-2 text-white hover:text-red-500 transition-colors duration-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <textarea
                    className="w-full h-32 px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF] transition-all duration-300"
                    placeholder="Paste names (separated by commas or new lines)"
                    onChange={(e) => handlePasteNames(listIndex, e.target.value)}
                  />
                )}
              </div>
            ))}

            {lists.length < 4 && (
              <Button 
                variant="ghost" 
                onClick={handleAddList} 
                className="w-full mt-4 transform transition-all duration-300 hover:scale-105"
              >
                Add Another List
              </Button>
            )}
          </div>

          {/* Generate Button with enhanced animation */}
          <Button
            variant="primary"
            onClick={generateTeams}
            className={`w-full transform transition-all duration-300 ${
              !isLoading && lists.some(list => list.length > 0) ? 'hover:scale-105' : ''
            }`}
            disabled={isLoading || lists.every(list => list.length === 0)}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Generate Teams'
            )}
          </Button>
        </div>
      </Card>

    </div>
  );
};

export default TeamGenerator;