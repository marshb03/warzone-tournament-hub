import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, Download, Loader2, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../services/api';

const TimeInput = ({ onTimeSet }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');

  const handleSubmit = () => {
    const totalSeconds = (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
    onTimeSet(totalSeconds);
    setShowCustomInput(false);
    setMinutes('');
    setSeconds('');
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setShowCustomInput(!showCustomInput)}
        className="w-24"
      >
        Custom
      </Button>
      
      {showCustomInput && (
        <div className="absolute top-full mt-2 bg-gray-800 rounded-lg p-4 shadow-lg z-50 w-64">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div>
                <label className="block text-sm text-gray-400">Minutes</label>
                <input
                  type="number"
                  min="0"
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-20 px-2 py-1 bg-gray-700 rounded"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400">Seconds</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={seconds}
                  onChange={(e) => setSeconds(e.target.value)}
                  className="w-20 px-2 py-1 bg-gray-700 rounded"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setShowCustomInput(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSubmit}>
                Set Time
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TournamentTeamGenerator = () => {
  // Core team generator state
  const [lists, setLists] = useState([[]]);
  const [teamSize, setTeamSize] = useState(2);
  const [generatedTeams, setGeneratedTeams] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Tournament mode state
  const [tournamentMode, setTournamentMode] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [spinHistory, setSpinHistory] = useState([]);
  const [currentSpin, setCurrentSpin] = useState({
    contributions: [],
    totalAmount: 0
  });
  
  // Tournament settings state
  const [settings, setSettings] = useState({
    baseRespin: 20,
    increment: 5,
    timer: {
      minutes: 5,
      seconds: 0,
      isRunning: false,
      timeLeft: 300 // 5 minutes in seconds
    }
  });

  // Timer interval reference
  const timerIntervalRef = useRef(null);

  // Timer presets in seconds
  const timerPresets = [
    { label: '5m', value: 300 },
    { label: '3m', value: 180 },
    { label: '1m', value: 60 },
    { label: '30s', value: 30 }
  ];

  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const getCurrentRespinCost = () => {
    return settings.baseRespin + (spinCount * settings.increment);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer controls
  const startTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    setSettings(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        isRunning: true
      }
    }));

    timerIntervalRef.current = setInterval(() => {
      setSettings(prev => {
        const newTimeLeft = prev.timer.timeLeft - 1;
        
        if (newTimeLeft <= 0) {
          clearInterval(timerIntervalRef.current);
          return {
            ...prev,
            timer: {
              ...prev.timer,
              isRunning: false,
              timeLeft: 0
            }
          };
        }

        return {
          ...prev,
          timer: {
            ...prev.timer,
            timeLeft: newTimeLeft
          }
        };
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setSettings(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        isRunning: false
      }
    }));
  };

  const resetTimer = () => {
    setSettings(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        timeLeft: (prev.timer.minutes * 60) + prev.timer.seconds,
        isRunning: false
      }
    }));
  };

  const handleTimerPresetClick = (seconds) => {
    setSettings(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        minutes: Math.floor(seconds / 60),
        seconds: seconds % 60,
        timeLeft: seconds,
        isRunning: false
      }
    }));
  };

  // Contribution handling
  const addContribution = (name, amount) => {
    const numAmount = parseFloat(amount);
    if (!name || isNaN(numAmount)) return;

    setCurrentSpin(prev => ({
      contributions: [
        ...prev.contributions,
        { name, amount: numAmount }
      ],
      totalAmount: prev.totalAmount + numAmount
    }));
  };

  const removeContribution = (index) => {
    setCurrentSpin(prev => ({
      contributions: prev.contributions.filter((_, idx) => idx !== index),
      totalAmount: prev.contributions.reduce((sum, contrib, idx) => 
        idx === index ? sum : sum + contrib.amount, 0)
    }));
  };

  const completeSpin = () => {
    setSpinHistory(prev => [...prev, {
      ...currentSpin,
      spinNumber: spinCount + 1
    }]);
    setSpinCount(prev => prev + 1);
    setCurrentSpin({
      contributions: [],
      totalAmount: 0
    });
  };

  // Generate Teams
  const generateTeams = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/api/v1/team-generator/generate', {
        lists,
        team_size: teamSize
      });
      setGeneratedTeams(response.data.teams);
      if (tournamentMode) {
        setSpinCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error generating teams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle tournament mode
  const handleTournamentModeToggle = () => {
    if (tournamentMode) {
      if (window.confirm('Disable tournament mode? All current tournament data will be lost.')) {
        setTournamentMode(false);
        resetTournamentState();
      }
    } else {
      setTournamentMode(true);
    }
  };

  const resetTournamentState = () => {
    setSpinCount(0);
    setSpinHistory([]);
    setCurrentSpin({
      contributions: [],
      totalAmount: 0
    });
    setSettings({
      baseRespin: 20,
      increment: 5,
      timer: {
        minutes: 5,
        seconds: 0,
        isRunning: false,
        timeLeft: 300
      }
    });
  };
  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Top Navigation */}
      <div className="border-b border-gray-800">
        <div className="max-w-[2400px] mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Generator</h1>
          <Button
            variant={tournamentMode ? 'primary' : 'ghost'}
            onClick={handleTournamentModeToggle}
          >
            Tournament Mode {tournamentMode ? 'On' : 'Off'}
          </Button>
        </div>
      </div>

      <div className="max-w-[2400px] mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Content Area - Team Generator */}
          <div className="col-span-8">
            {/* Timer Section - Only show when tournament mode is on */}
            {tournamentMode && (
              <Card className="p-6 mb-6">
                <div className="space-y-6">
                  {/* Timer Presets */}
                  <div className="flex justify-center space-x-4">
                    {timerPresets.map(preset => (
                      <Button
                        key={preset.value}
                        variant="ghost"
                        onClick={() => handleTimerPresetClick(preset.value)}
                        className="w-24 h-12 text-lg"
                      >
                        {preset.label}
                      </Button>
                    ))}
                    <TimeInput 
                      onTimeSet={seconds => handleTimerPresetClick(seconds)}
                    />
                  </div>

                  {/* Timer Display */}
                  <div className="flex flex-col items-center justify-center">
                    <div className={`text-8xl font-bold tracking-wider ${
                      settings.timer.timeLeft <= 10 ? 'text-red-500 animate-pulse scale-110 transition-transform' : ''
                    }`}>
                      {formatTime(settings.timer.timeLeft)}
                    </div>
                    
                    {/* Timer Controls */}
                    <div className="flex items-center space-x-4 mt-6">
                      {!settings.timer.isRunning ? (
                        <Button 
                          variant="primary" 
                          size="lg" 
                          onClick={startTimer}
                          className="text-xl px-8 py-3"
                        >
                          Start
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="lg" 
                          onClick={stopTimer}
                          className="text-xl px-8 py-3"
                        >
                          Stop
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="lg" 
                        onClick={resetTimer}
                        className="text-xl px-8 py-3"
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Team Generator Card */}
            <Card className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Team Size</label>
                <div className="flex space-x-2">
                  {[2, 3, 4].map(size => (
                    <Button
                      key={size}
                      variant={teamSize === size ? 'primary' : 'ghost'}
                      onClick={() => setTeamSize(size)}
                      className="w-16"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Player Lists */}
              <div className="space-y-6">
                {lists.map((list, listIndex) => (
                  <div key={listIndex} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium">List {listIndex + 1}</h3>
                        <span className="text-sm text-gray-400">
                          ({list.length} players)
                        </span>
                      </div>
                      {lists.length > 1 && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            const newLists = lists.filter((_, idx) => idx !== listIndex);
                            setLists(newLists);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Enter player name"
                        className="flex-1 px-4 py-2 bg-gray-800/50 rounded-lg"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            const newLists = [...lists];
                            newLists[listIndex] = [...newLists[listIndex], e.target.value.trim()];
                            setLists(newLists);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button variant="ghost">
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {list.map((player, playerIndex) => (
                        <span
                          key={playerIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A237E] text-white"
                        >
                          {player}
                          <button
                            onClick={() => {
                              const newLists = [...lists];
                              newLists[listIndex] = newLists[listIndex].filter(
                                (_, idx) => idx !== playerIndex
                              );
                              setLists(newLists);
                            }}
                            className="ml-2 text-white hover:text-red-500 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {lists.length < 4 && (
                  <Button
                    variant="ghost"
                    onClick={() => setLists([...lists, []])}
                    className="w-full"
                  >
                    Add Another List
                  </Button>
                )}

                <Button
                  variant="primary"
                  onClick={generateTeams}
                  className="w-full"
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

            {/* Generated Teams */}
            {generatedTeams && (
              <Card className="mt-6 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Generated Teams</h2>
                  {tournamentMode && (
                    <div className="flex items-center space-x-4">
                      <span className="text-lg text-[#2979FF]">
                        Spin #{spinCount}
                      </span>
                      <Button variant="ghost" onClick={() => setGeneratedTeams(null)}>
                        Clear
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {generatedTeams.map((team, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-800/50 rounded-lg"
                    >
                      <h3 className="text-lg font-medium text-[#2979FF] mb-2">
                        Team {index + 1}
                      </h3>
                      <p className="text-gray-300">
                        {team.join(' × ')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <Button variant="secondary" onClick={() => {
                    const teamText = generatedTeams
                      .map((team, index) => `Team ${index + 1}: ${team.join(' × ')}`)
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
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Teams
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Tournament Controls */}
          {tournamentMode && (
            <div className="col-span-4">
              {/* Combined Respin Amount and Current Spin Card */}
              <Card className="p-6">
                <div className="space-y-6">
                  {/* Respin Amount Section */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Respin Amount</h3>
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-1">Base:</label>
                        <input
                          type="number"
                          value={settings.baseRespin}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            baseRespin: parseInt(e.target.value) || 0
                          }))}
                          className="w-28 px-3 py-2 bg-gray-800/50 rounded-lg text-xl font-medium"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm text-gray-400 mb-1">Next Spin Increase:</label>
                        <input
                          type="number"
                          value={settings.increment}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            increment: parseInt(e.target.value) || 0
                          }))}
                          className="w-28 px-3 py-2 bg-gray-800/50 rounded-lg text-xl font-medium"
                        />
                      </div>
                    </div>

                    <div className="bg-[#1A237E]/20 rounded-lg p-4">

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
                        <div
                          className="bg-[#2979FF] h-3 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (currentSpin.totalAmount / getCurrentRespinCost()) * 100,
                              100
                            )}%`
                          }}
                        />
                      </div>

                      {/* Progress Tracker */}
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                          <div className="text-xl text-gray-400 mb-1">Required</div>
                          <div className="text-5xl font-bold text-[#2979FF]">
                            ${getCurrentRespinCost()}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-800/30 rounded-lg">
                          <div className="text-xl text-gray-400 mb-1">Collected</div>
                          <div className="text-5xl font-bold text-[#2979FF]">
                            ${currentSpin.totalAmount}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Spin Section */}
                  <div className="pt-6 border-t border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">Current Spin #{spinCount + 1}</h3>
                      <Button
                        variant="primary"
                        onClick={completeSpin}
                        disabled={currentSpin.contributions.length === 0}
                      >
                        Complete Spin
                      </Button>
                    </div>

                    {/* Contribution Form */}
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Player name"
                          className="flex-1 px-4 py-2 bg-gray-800/50 rounded-lg"
                          id="contributorName"
                        />
                        <input
                          type="number"
                          placeholder="$"
                          className="w-24 px-4 py-2 bg-gray-800/50 rounded-lg"
                          id="contributionAmount"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const name = document.getElementById('contributorName').value;
                          const amount = document.getElementById('contributionAmount').value;
                          addContribution(name, amount);
                          document.getElementById('contributorName').value = '';
                          document.getElementById('contributionAmount').value = '';
                        }}
                        className="w-full"
                      >
                        Add Contribution
                      </Button>
                    </div>

                    {/* Contributions List */}
                    <div className="mt-4 space-y-2">
                      {currentSpin.contributions.map((contribution, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-2 bg-gray-800/50 rounded-lg"
                        >
                          <span>{contribution.name}</span>
                          <div className="flex items-center space-x-2">
                            <span>${contribution.amount}</span>
                            <button
                              onClick={() => removeContribution(index)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Spin History */}
              {spinHistory.length > 0 && (
                <Card className="mt-6 p-6">
                  <h3 className="text-xl font-bold mb-4">Spin History</h3>
                  <div className="space-y-4">
                    {spinHistory.map((spin, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-800/50 rounded-lg"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">Spin #{spin.spinNumber}</h4>
                          <span className="text-[#2979FF]">Total: ${spin.totalAmount}</span>
                        </div>
                        <div className="space-y-1">
                          {spin.contributions.map((contribution, cIndex) => (
                            <div
                              key={cIndex}
                              className="flex justify-between text-sm text-gray-400"
                            >
                              <span>{contribution.name}</span>
                              <span>${contribution.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentTeamGenerator;