// src/components/tkr/TKRTournamentCreate.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users, Trophy, DollarSign, Save, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { tournamentService } from '../../services/tournament';
import { tkrService } from '../../services/tkr';
import {
  TKRTeamSize,
  TKRTournamentConfigCreate,
  TKRTemplate,
  DEFAULT_PLACEMENT_MULTIPLIERS,
  TEAM_SIZE_CONFIG
} from '../../types/tkr';

interface PlacementRow {
  placement: string;
  multiplier: string;
}

interface BonusRow {
  kills: string;
  bonus: string;
}

const TKRTournamentCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [templates, setTemplates] = useState<TKRTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Basic tournament fields
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    description: '',
    rules: '',
    entry_fee: 'Free',
    entry_fee_amount: '',
    game: 'Call of Duty: Warzone',
    custom_game: '',
    game_mode: 'Battle Royale',
    custom_game_mode: '',
    start_date: '',
    start_time: '18:00',
    end_date: '',
    end_time: '23:00'
  });

  // TKR specific configuration
  const [tkrConfig, setTkrConfig] = useState({
    map_name: '',
    team_size: TKRTeamSize.QUADS,
    consecutive_hours: 3,
    tournament_days: 5,
    best_games_count: 3,
    max_points_per_map: '',
    host_percentage: '0',
    show_prize_pool: true
  });

  // Placement multipliers
  const [placementMultipliers, setPlacementMultipliers] = useState<PlacementRow[]>([
    { placement: '1', multiplier: '2.5' },
    { placement: '2', multiplier: '2.0' },
    { placement: '3', multiplier: '1.5' },
    { placement: '4', multiplier: '1.0' },
    { placement: '5', multiplier: '1.0' },
    { placement: '6', multiplier: '0.75' },
    { placement: '7', multiplier: '0.75' },
    { placement: '8', multiplier: '0.75' },
    { placement: '9', multiplier: '0.75' },
    { placement: '10', multiplier: '0.75' },
    { placement: '11', multiplier: '0.5' }
  ]);

  // Bonus points
  const [bonusPoints, setBonusPoints] = useState<BonusRow[]>([
    { kills: '60', bonus: '1' }
  ]);

  // Template management
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const userTemplates = await tkrService.getMyTemplates();
      setTemplates(userTemplates);
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const loadTemplate = async (templateId: string) => {
    if (!templateId) return;
    
    try {
      const template = await tkrService.getTemplate(parseInt(templateId));
      
      // Load template data into form
      setTkrConfig({
        map_name: template.map_name,
        team_size: template.team_size,
        consecutive_hours: template.consecutive_hours,
        tournament_days: template.tournament_days,
        best_games_count: template.best_games_count,
        max_points_per_map: template.max_points_per_map?.toString() || '',
        host_percentage: (template.host_percentage * 100).toString(),
        show_prize_pool: template.show_prize_pool
      });

      // Load placement multipliers
      const placementRows = Object.entries(template.placement_multipliers).map(([placement, multiplier]) => ({
        placement,
        multiplier: multiplier.toString()
      }));
      setPlacementMultipliers(placementRows);

      // Load bonus points
      if (template.bonus_point_thresholds) {
        const bonusRows = Object.entries(template.bonus_point_thresholds).map(([kills, bonus]) => ({
          kills,
          bonus: bonus.toString()
        }));
        setBonusPoints(bonusRows);
      } else {
        setBonusPoints([{ kills: '60', bonus: '1' }]);
      }

      setTemplateName(template.template_name);
      setTemplateDescription(template.description || '');
    } catch (error) {
      console.error('Failed to load template:', error);
      setError('Failed to load template');
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      const templateData = {
        template_name: templateName,
        description: templateDescription,
        map_name: tkrConfig.map_name,
        team_size: tkrConfig.team_size,
        consecutive_hours: tkrConfig.consecutive_hours,
        tournament_days: tkrConfig.tournament_days,
        best_games_count: tkrConfig.best_games_count,
        placement_multipliers: placementMultipliers.reduce((acc, row) => {
          if (row.placement && row.multiplier) {
            acc[row.placement] = parseFloat(row.multiplier);
          }
          return acc;
        }, {} as { [key: string]: number }),
        bonus_point_thresholds: bonusPoints.reduce((acc, row) => {
          if (row.kills && row.bonus) {
            acc[row.kills] = parseInt(row.bonus);
          }
          return acc;
        }, {} as { [key: string]: number }),
        max_points_per_map: tkrConfig.max_points_per_map ? parseInt(tkrConfig.max_points_per_map) : undefined,
        host_percentage: parseFloat(tkrConfig.host_percentage) / 100,
        show_prize_pool: tkrConfig.show_prize_pool
      };

      await tkrService.createTemplate(templateData);
      await loadTemplates(); // Refresh templates list
      setSaveAsTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Failed to save template:', error);
      setError('Failed to save template');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!basicInfo.name.trim()) {
        setError('Tournament name is required');
        return;
      }
      if (!tkrConfig.map_name.trim()) {
        setError('Map name is required');
        return;
      }
      if (!basicInfo.start_date || !basicInfo.end_date) {
        setError('Start and end dates are required');
        return;
      }

      // Create basic tournament first
      const entryFee = basicInfo.entry_fee === 'Free' ? 'Free' : 
                       basicInfo.entry_fee === 'Paid' && basicInfo.entry_fee_amount ? 
                       `$${parseFloat(basicInfo.entry_fee_amount).toFixed(2)}` : 'Free';

      const game = basicInfo.game === 'Other' ? basicInfo.custom_game : basicInfo.game;
      const gameMode = basicInfo.game_mode === 'Other' ? basicInfo.custom_game_mode : basicInfo.game_mode;

      const tournament = await tournamentService.createTournament({
        name: basicInfo.name,
        format: 'TKR',
        start_date: basicInfo.start_date,
        start_time: basicInfo.start_time,
        end_date: basicInfo.end_date,
        end_time: basicInfo.end_time,
        team_size: TEAM_SIZE_CONFIG[tkrConfig.team_size].value,
        max_teams: null, // TKR tournaments don't have max teams
        description: basicInfo.description,
        rules: basicInfo.rules,
        entry_fee: entryFee,
        game,
        game_mode: gameMode
      });

      // Create TKR configuration
      const configData: TKRTournamentConfigCreate = {
        tournament_id: tournament.id,
        map_name: tkrConfig.map_name,
        team_size: tkrConfig.team_size,
        consecutive_hours: tkrConfig.consecutive_hours,
        tournament_days: tkrConfig.tournament_days,
        best_games_count: tkrConfig.best_games_count,
        placement_multipliers: placementMultipliers.reduce((acc, row) => {
          if (row.placement && row.multiplier) {
            acc[row.placement] = parseFloat(row.multiplier);
          }
          return acc;
        }, {} as { [key: string]: number }),
        bonus_point_thresholds: bonusPoints.reduce((acc, row) => {
          if (row.kills && row.bonus) {
            acc[row.kills] = parseInt(row.bonus);
          }
          return acc;
        }, {} as { [key: string]: number }),
        max_points_per_map: tkrConfig.max_points_per_map ? parseInt(tkrConfig.max_points_per_map) : undefined,
        host_percentage: parseFloat(tkrConfig.host_percentage) / 100,
        show_prize_pool: tkrConfig.show_prize_pool
      };

      await tkrService.createTournamentConfig(tournament.id, configData);

      // Save as template if requested
      if (saveAsTemplate && templateName.trim()) {
        try {
          await saveTemplate();
        } catch (templateError) {
          console.error('Failed to save template, but tournament created successfully');
        }
      }

      navigate(`/tournaments/${tournament.id}`);
    } catch (error) {
      console.error('Failed to create tournament:', error);
      setError(error.response?.data?.detail || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  const addPlacementRow = () => {
    setPlacementMultipliers([...placementMultipliers, { placement: '', multiplier: '' }]);
  };

  const removePlacementRow = (index: number) => {
    setPlacementMultipliers(placementMultipliers.filter((_, i) => i !== index));
  };

  const updatePlacementRow = (index: number, field: keyof PlacementRow, value: string) => {
    const updated = [...placementMultipliers];
    updated[index] = { ...updated[index], [field]: value };
    setPlacementMultipliers(updated);
  };

  const addBonusRow = () => {
    setBonusPoints([...bonusPoints, { kills: '', bonus: '' }]);
  };

  const removeBonusRow = (index: number) => {
    setBonusPoints(bonusPoints.filter((_, i) => i !== index));
  };

  const updateBonusRow = (index: number, field: keyof BonusRow, value: string) => {
    const updated = [...bonusPoints];
    updated[index] = { ...updated[index], [field]: value };
    setBonusPoints(updated);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Create TKR Tournament</h1>
        <Button
          variant="ghost"
          onClick={() => navigate('/tournaments')}
        >
          Cancel
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/10">
          <p className="text-red-500">{error}</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Management */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Load Template</label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  loadTemplate(e.target.value);
                }}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                <option value="">Select a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.template_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {saveAsTemplate ? 'Cancel Save' : 'Save as Template'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Save Template Modal */}
        {saveAsTemplate && (
          <Card className="p-6 border-blue-500/20">
            <h3 className="text-lg font-semibold mb-4">Save Configuration as Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Template Name</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  placeholder="My TKR Configuration"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                  placeholder="Description of this configuration..."
                />
              </div>
            </div>
          </Card>
        )}

        {/* Basic Tournament Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tournament Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tournament Name *</label>
              <input
                type="text"
                value={basicInfo.name}
                onChange={(e) => setBasicInfo({...basicInfo, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Entry Fee</label>
              <div className="flex space-x-2">
                <select
                  value={basicInfo.entry_fee}
                  onChange={(e) => setBasicInfo({...basicInfo, entry_fee: e.target.value})}
                  className="w-32 px-3 py-2 bg-gray-800 rounded-lg"
                >
                  <option value="Free">Free</option>
                  <option value="Paid">Paid</option>
                </select>
                {basicInfo.entry_fee === 'Paid' && (
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-2 text-gray-400">$</span>
                    <input
                      type="text"
                      value={basicInfo.entry_fee_amount}
                      onChange={(e) => setBasicInfo({...basicInfo, entry_fee_amount: e.target.value})}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 bg-gray-800 rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={basicInfo.description}
                onChange={(e) => setBasicInfo({...basicInfo, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                placeholder="Describe your tournament..."
              />
            </div>
          </div>
        </Card>

        {/* TKR Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">TKR Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Map Name *</label>
              <input
                type="text"
                value={tkrConfig.map_name}
                onChange={(e) => setTkrConfig({...tkrConfig, map_name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                placeholder="e.g., Verdansk, Ashika Island"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Team Size</label>
              <select
                value={tkrConfig.team_size}
                onChange={(e) => setTkrConfig({...tkrConfig, team_size: e.target.value as TKRTeamSize})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              >
                {Object.entries(TEAM_SIZE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label} ({config.value} players)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Consecutive Hours</label>
              <input
                type="number"
                value={tkrConfig.consecutive_hours}
                onChange={(e) => setTkrConfig({...tkrConfig, consecutive_hours: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                min="1"
                max="24"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Tournament Days</label>
              <input
                type="number"
                value={tkrConfig.tournament_days}
                onChange={(e) => setTkrConfig({...tkrConfig, tournament_days: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                min="1"
                max="30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Best Games Count</label>
              <input
                type="number"
                value={tkrConfig.best_games_count}
                onChange={(e) => setTkrConfig({...tkrConfig, best_games_count: parseInt(e.target.value)})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                min="1"
                max="20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Max Points Per Map (Optional)</label>
              <input
                type="number"
                value={tkrConfig.max_points_per_map}
                onChange={(e) => setTkrConfig({...tkrConfig, max_points_per_map: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                placeholder="e.g., 43"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Host Percentage (%)</label>
              <input
                type="number"
                value={tkrConfig.host_percentage}
                onChange={(e) => setTkrConfig({...tkrConfig, host_percentage: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show_prize_pool"
                checked={tkrConfig.show_prize_pool}
                onChange={(e) => setTkrConfig({...tkrConfig, show_prize_pool: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="show_prize_pool" className="text-sm font-medium">
                Show Prize Pool
              </label>
            </div>
          </div>
        </Card>

        {/* Tournament Dates */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Tournament Schedule</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                value={basicInfo.start_date}
                onChange={(e) => setBasicInfo({...basicInfo, start_date: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Time (EST)</label>
              <input
                type="time"
                value={basicInfo.start_time}
                onChange={(e) => setBasicInfo({...basicInfo, start_time: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <input
                type="date"
                value={basicInfo.end_date}
                onChange={(e) => setBasicInfo({...basicInfo, end_date: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time (EST)</label>
              <input
                type="time"
                value={basicInfo.end_time}
                onChange={(e) => setBasicInfo({...basicInfo, end_time: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Placement Multipliers */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Placement Multipliers</h2>
            <Button type="button" variant="secondary" onClick={addPlacementRow}>
              Add Row
            </Button>
          </div>
          <div className="space-y-2">
            {placementMultipliers.map((row, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={row.placement}
                  onChange={(e) => updatePlacementRow(index, 'placement', e.target.value)}
                  placeholder="Placement"
                  className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                />
                <span className="text-gray-400">×</span>
                <input
                  type="text"
                  value={row.multiplier}
                  onChange={(e) => updatePlacementRow(index, 'multiplier', e.target.value)}
                  placeholder="Multiplier"
                  className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removePlacementRow(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Bonus Points */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Bonus Points</h2>
            <Button type="button" variant="secondary" onClick={addBonusRow}>
              Add Bonus
            </Button>
          </div>
          <div className="space-y-2">
            {bonusPoints.map((row, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={row.kills}
                  onChange={(e) => updateBonusRow(index, 'kills', e.target.value)}
                  placeholder="Kills"
                  className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                />
                <span className="text-gray-400">kills = +</span>
                <input
                  type="text"
                  value={row.bonus}
                  onChange={(e) => updateBonusRow(index, 'bonus', e.target.value)}
                  placeholder="Bonus"
                  className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                />
                <span className="text-gray-400">points</span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeBonusRow(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/tournaments')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Create TKR Tournament
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TKRTournamentCreate;