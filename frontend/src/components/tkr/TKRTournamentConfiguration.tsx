// src/components/tkr/TKRTournamentConfiguration.tsx - Fixed Version
import React, { useState, useEffect } from 'react';
import { 
  Save, Plus, Trash2, Download, AlertCircle, 
  CheckCircle, Settings, Target, Users, Trophy,
  Edit, X, DollarSign
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { tkrService } from '../../services/tkr';
import { 
  TKRTournamentConfig,
  TKRTournamentConfigCreate,
  TKRTournamentConfigUpdate,
  TKRTeamSize,
  TEAM_SIZE_CONFIG,
  TKRTemplate,
  TKRTemplateCreate
} from '../../types/tkr';

interface TKRTournamentConfigurationProps {
  tournamentId: number;
  onConfigurationComplete?: (config: TKRTournamentConfig) => void;
}

interface PlacementRow {
  placement: string;
  multiplier: string;
}

interface BonusRow {
  kills: string;
  bonus: string;
}

const TKRTournamentConfiguration: React.FC<TKRTournamentConfigurationProps> = ({
  tournamentId,
  onConfigurationComplete
}) => {
  // State management
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingConfig, setExistingConfig] = useState<TKRTournamentConfig | null>(null);
  
  // Configuration state - REMOVED tournament_days
  const [configData, setConfigData] = useState({
    map_name: '',
    team_size: TKRTeamSize.QUADS,
    consecutive_hours: '',
    best_games_count: '',
    max_points_per_map: '',
    host_percentage: '0', // Set default to '0' string
    show_prize_pool: true
  });

  // Placement multipliers state
  const [placementMultipliers, setPlacementMultipliers] = useState<PlacementRow[]>([
    { placement: '1', multiplier: '' },
    { placement: '2', multiplier: '' },
    { placement: '3', multiplier: '' },
    { placement: '4', multiplier: '' },
    { placement: '5', multiplier: '' }
  ]);

  // Bonus points state
  const [bonusPoints, setBonusPoints] = useState<BonusRow[]>([
    { kills: '', bonus: '' }
  ]);

  // Template management state
  const [templates, setTemplates] = useState<TKRTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [saveTemplateData, setSaveTemplateData] = useState({
    name: '',
    description: '',
    showForm: false
  });

  useEffect(() => {
    loadInitialData();
  }, [tournamentId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError('');

      // Try to load existing configuration
      try {
        const config = await tkrService.getTournamentConfig(tournamentId);
        setExistingConfig(config);
        populateFormFromConfig(config);
      } catch (configError) {
        console.log('No existing TKR configuration found');
      }

      // Load user templates
      try {
        const userTemplates = await tkrService.getMyTemplates();
        setTemplates(userTemplates);
      } catch (templateError) {
        console.log('Failed to load templates');
      }

    } catch (error) {
      console.error('Failed to load TKR configuration data:', error);
      setError('Failed to load configuration data');
    } finally {
      setLoading(false);
    }
  };

  const populateFormFromConfig = (config: TKRTournamentConfig) => {
    setConfigData({
      map_name: config.map_name,
      team_size: config.team_size,
      consecutive_hours: config.consecutive_hours.toString(),
      best_games_count: config.best_games_count.toString(),
      max_points_per_map: config.max_points_per_map?.toString() || '',
      host_percentage: (config.host_percentage * 100).toString(),
      show_prize_pool: config.show_prize_pool
    });

    // Populate placement multipliers
    const placementRows = Object.entries(config.placement_multipliers).map(([placement, multiplier]) => ({
      placement,
      multiplier: multiplier.toString()
    }));
    setPlacementMultipliers(placementRows);

    // Populate bonus points
    if (config.bonus_point_thresholds) {
      const bonusRows = Object.entries(config.bonus_point_thresholds).map(([kills, bonus]) => ({
        kills,
        bonus: bonus.toString()
      }));
      setBonusPoints(bonusRows);
    }
  };

  const loadTemplate = async (templateId: string) => {
    if (!templateId) return;
    
    try {
      const template = await tkrService.getTemplate(parseInt(templateId));
      
      // Populate form with template data
      setConfigData({
        map_name: template.map_name,
        team_size: template.team_size,
        consecutive_hours: template.consecutive_hours.toString(),
        best_games_count: template.best_games_count.toString(),
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
        setBonusPoints([{ kills: '', bonus: '' }]);
      }

      setSuccess('Template loaded successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to load template:', error);
      setError('Failed to load template');
    }
  };

  // FIXED: Template save function with proper data handling
  const saveAsTemplate = async () => {
    if (!saveTemplateData.name.trim()) {
      setError('Template name is required');
      return;
    }

    try {
      // Build placement multipliers object, only include valid entries
      const placementMultipliersObj: { [key: string]: number } = {};
      placementMultipliers.forEach(row => {
        if (row.placement && row.multiplier && !isNaN(parseFloat(row.multiplier))) {
          placementMultipliersObj[row.placement] = parseFloat(row.multiplier);
        }
      });

      // Build bonus points object, only include if there are valid entries
      let bonusPointsObj: { [key: string]: number } | undefined = undefined;
      const validBonusPoints = bonusPoints.filter(row => row.kills && row.bonus);
      if (validBonusPoints.length > 0) {
        bonusPointsObj = {};
        validBonusPoints.forEach(row => {
          if (row.kills && row.bonus && !isNaN(parseInt(row.bonus))) {
            bonusPointsObj![row.kills] = parseInt(row.bonus);
          }
        });
      }

      const templateData: TKRTemplateCreate = {
        template_name: saveTemplateData.name,
        description: saveTemplateData.description || '',
        map_name: configData.map_name,
        team_size: configData.team_size, // Already a string enum value
        consecutive_hours: parseInt(configData.consecutive_hours),
        tournament_days: 7, // Default value
        best_games_count: parseInt(configData.best_games_count),
        placement_multipliers: placementMultipliersObj,
        bonus_point_thresholds: bonusPointsObj,
        max_points_per_map: configData.max_points_per_map ? parseInt(configData.max_points_per_map) : undefined,
        host_percentage: parseFloat(configData.host_percentage) / 100,
        show_prize_pool: configData.show_prize_pool
      };

      console.log('Template data being sent:', JSON.stringify(templateData, null, 2));
      await tkrService.createTemplate(templateData);
      await loadInitialData(); // Refresh templates
      
      setSaveTemplateData({ name: '', description: '', showForm: false });
      setSuccess('Template saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to save template:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to save template');
    }
  };

  const deleteTemplate = async (templateId: number) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      await tkrService.deleteTemplate(templateId);
      await loadInitialData();
      setSuccess('Template deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to delete template:', error);
      setError('Failed to delete template');
    }
  };

  const validateConfiguration = (): string[] => {
    const errors: string[] = [];

    if (!configData.map_name.trim()) errors.push('Map name is required');
    if (!configData.consecutive_hours || parseInt(configData.consecutive_hours) < 1) {
      errors.push('Consecutive hours must be at least 1');
    }
    if (!configData.best_games_count || parseInt(configData.best_games_count) < 1) {
      errors.push('Best games count must be at least 1');
    }
    if (configData.host_percentage === '' || parseFloat(configData.host_percentage) < 0) {
      errors.push('Host percentage must be 0 or greater');
    }

    // Validate placement multipliers
    const validPlacements = placementMultipliers.filter(row => 
      row.placement && row.multiplier && 
      parseInt(row.placement) > 0 && 
      parseFloat(row.multiplier) >= 0
    );
    if (validPlacements.length === 0) {
      errors.push('At least one placement multiplier is required');
    }

    // Check for duplicate placements
    const placements = validPlacements.map(row => row.placement);
    const duplicates = placements.filter((placement, index) => placements.indexOf(placement) !== index);
    if (duplicates.length > 0) {
      errors.push('Duplicate placement values found');
    }

    return errors;
  };

  // FIXED: Configuration save function with proper data handling
  const handleSaveConfiguration = async () => {
    const validationErrors = validateConfiguration();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Build placement multipliers object, only include valid entries
      const placementMultipliersObj: { [key: string]: number } = {};
      placementMultipliers.forEach(row => {
        if (row.placement && row.multiplier && !isNaN(parseFloat(row.multiplier))) {
          placementMultipliersObj[row.placement] = parseFloat(row.multiplier);
        }
      });

      // Build bonus points object, only include if there are valid entries
      let bonusPointsObj: { [key: string]: number } | undefined = undefined;
      const validBonusPoints = bonusPoints.filter(row => row.kills && row.bonus);
      if (validBonusPoints.length > 0) {
        bonusPointsObj = {};
        validBonusPoints.forEach(row => {
          if (row.kills && row.bonus && !isNaN(parseInt(row.bonus))) {
            bonusPointsObj![row.kills] = parseInt(row.bonus);
          }
        });
      }

      const configPayload = {
        map_name: configData.map_name,
        team_size: configData.team_size, // Already a string enum value
        consecutive_hours: parseInt(configData.consecutive_hours),
        tournament_days: 7, // Default value
        best_games_count: parseInt(configData.best_games_count),
        placement_multipliers: placementMultipliersObj,
        bonus_point_thresholds: bonusPointsObj,
        max_points_per_map: configData.max_points_per_map ? parseInt(configData.max_points_per_map) : undefined,
        host_percentage: parseFloat(configData.host_percentage) / 100,
        show_prize_pool: configData.show_prize_pool
      };

      console.log('Configuration data being sent:', JSON.stringify(configPayload, null, 2));

      let savedConfig: TKRTournamentConfig;

      if (existingConfig) {
        savedConfig = await tkrService.updateTournamentConfig(tournamentId, configPayload);
        setSuccess('Configuration updated successfully! Scores have been recalculated.');
      } else {
        savedConfig = await tkrService.createTournamentConfig(tournamentId, configPayload);
        setSuccess('Configuration created successfully!');
      }

      setExistingConfig(savedConfig);
      
      if (onConfigurationComplete) {
        onConfigurationComplete(savedConfig);
      }

      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for managing rows
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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]" />
          <span className="ml-2">Loading configuration...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {success && (
        <Card className="p-4 border-green-500/20 bg-green-500/10">
          <div className="flex items-center space-x-2 text-green-500">
            <CheckCircle className="h-5 w-5" />
            <p>{success}</p>
          </div>
        </Card>
      )}

      {/* Template Management Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Settings className="h-5 w-5 mr-2 text-[#2979FF]" />
            Template Management
          </h2>
          <Button
            variant="secondary"
            onClick={() => setShowTemplateManager(!showTemplateManager)}
            className="flex items-center"
          >
            {showTemplateManager ? <X className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
            {showTemplateManager ? 'Hide Templates' : 'Manage Templates'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Load Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => {
                setSelectedTemplate(e.target.value);
                if (e.target.value) loadTemplate(e.target.value);
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
            <div className="w-full text-sm text-gray-400">
              {templates.length > 0 ? `${templates.length} template(s) available` : 'No templates saved yet'}
            </div>
          </div>
        </div>

        {/* Save Template Form */}
        {saveTemplateData.showForm && (
          <Card className="p-4 border-blue-500/20 bg-blue-500/5">
            <h3 className="font-semibold mb-3">Save as Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Template name (e.g., Battle Royale Setup)"
                value={saveTemplateData.name}
                onChange={(e) => setSaveTemplateData({ ...saveTemplateData, name: e.target.value })}
                className="px-3 py-2 bg-gray-800 rounded-lg"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={saveTemplateData.description}
                onChange={(e) => setSaveTemplateData({ ...saveTemplateData, description: e.target.value })}
                className="px-3 py-2 bg-gray-800 rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-3">
              <Button
                variant="ghost"
                onClick={() => setSaveTemplateData({ name: '', description: '', showForm: false })}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={saveAsTemplate}>
                Save Template
              </Button>
            </div>
          </Card>
        )}

        {/* Template Manager */}
        {showTemplateManager && templates.length > 0 && (
          <Card className="p-4 bg-gray-800/50">
            <h3 className="font-semibold mb-3">Your Templates</h3>
            <div className="space-y-2">
              {templates.map(template => (
                <div key={template.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium">{template.template_name}</p>
                    <p className="text-sm text-gray-400">{template.description || 'No description'}</p>
                    <p className="text-xs text-gray-500">
                      {template.map_name} • {template.team_size} • {template.consecutive_hours}h
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadTemplate(template.id.toString())}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </Card>

      {/* Basic Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-[#2979FF]" />
          Basic Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Map Name *</label>
            <input
              type="text"
              value={configData.map_name}
              onChange={(e) => setConfigData({ ...configData, map_name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              placeholder="e.g., Verdansk, Ashika Island"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Team Size *</label>
            <select
              value={configData.team_size}
              onChange={(e) => setConfigData({ ...configData, team_size: e.target.value as TKRTeamSize })}
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
            <label className="block text-sm font-medium mb-2">Consecutive Hours *</label>
            <input
              type="number"
              value={configData.consecutive_hours}
              onChange={(e) => setConfigData({ ...configData, consecutive_hours: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              min="1"
              max="24"
              placeholder="3"
            />
            <p className="text-xs text-gray-400 mt-1">
              How long teams have to compete in the tournament
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Best Games Count *</label>
            <input
              type="number"
              value={configData.best_games_count}
              onChange={(e) => setConfigData({ ...configData, best_games_count: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              min="1"
              max="20"
              placeholder="3"
            />
            <p className="text-xs text-gray-400 mt-1">
              Number of top-scoring games that count toward final leaderboard score
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max Points Per Map (Optional)</label>
            <input
              type="number"
              value={configData.max_points_per_map}
              onChange={(e) => setConfigData({ ...configData, max_points_per_map: e.target.value })}
              className="w-full px-3 py-2 bg-gray-800 rounded-lg"
              placeholder="43"
            />
            <p className="text-xs text-gray-400 mt-1">
              Point cap per game (leave empty for no limit)
            </p>
          </div>
        </div>
      </Card>

      {/* Prize Pool Settings Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-[#2979FF]" />
          Prize Pool Settings
        </h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-800/30 rounded-lg">
            <h3 className="font-medium mb-2">How Prize Pools Work</h3>
            <p className="text-sm text-gray-400 mb-3">
              The prize pool is calculated from team entry fees. You can take a percentage as host cut, 
              and choose whether to display the total prize pool to players.
            </p>
            <div className="text-xs text-gray-500">
              <p>• Total collected from entry fees</p>
              <p>• Minus your host percentage</p>
              <p>• Equals final prize pool for winners</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Host Percentage (%) *</label>
              <input
                type="number"
                value={configData.host_percentage}
                onChange={(e) => setConfigData({ ...configData, host_percentage: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Percentage of entry fees you keep as host (e.g., 10 = 10%)
              </p>
            </div>
            
            <div className="flex items-center">
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="show_prize_pool"
                    checked={configData.show_prize_pool}
                    onChange={(e) => setConfigData({ ...configData, show_prize_pool: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="show_prize_pool" className="text-sm font-medium">
                    Display Prize Pool to Players
                  </label>
                </div>
                <p className="text-xs text-gray-400">
                  When enabled, players can see the current prize pool amount on the leaderboard
                </p>
              </div>
            </div>
          </div>

          {/* Prize Pool Preview */}
          {configData.host_percentage && parseFloat(configData.host_percentage) >= 0 && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-green-400 mb-1">Example Calculation</h4>
              <div className="text-xs text-gray-400 space-y-1">
                <p>If 10 teams pay $5 each = $50 total collected</p>
                <p>Your host cut ({configData.host_percentage}%) = ${((50 * parseFloat(configData.host_percentage)) / 100).toFixed(2)}</p>
                <p className="text-green-400 font-medium">
                  Prize pool for winners = ${(50 - (50 * parseFloat(configData.host_percentage)) / 100).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Placement Multipliers */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-[#2979FF]" />
            Placement Multipliers *
          </h2>
          <Button variant="secondary" onClick={addPlacementRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add Placement
          </Button>
        </div>
        <div className="space-y-2">
          {placementMultipliers.map((row, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="number"
                value={row.placement}
                onChange={(e) => updatePlacementRow(index, 'placement', e.target.value)}
                placeholder="Placement"
                className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                min="1"
              />
              <span className="text-gray-400">×</span>
              <input
                type="number"
                value={row.multiplier}
                onChange={(e) => updatePlacementRow(index, 'multiplier', e.target.value)}
                placeholder="Multiplier"
                className="w-32 px-3 py-2 bg-gray-800 rounded-lg"
                step="0.1"
                min="0"
              />
              <Button
                variant="ghost"
                onClick={() => removePlacementRow(index)}
                className="text-red-500 hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Define kill multipliers for different placements. Lower placements typically have lower multipliers.
        </p>
      </Card>

      {/* Bonus Points */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center">
            <Target className="h-5 w-5 mr-2 text-[#2979FF]" />
            Bonus Points (Optional)
          </h2>
          <Button variant="secondary" onClick={addBonusRow}>
            <Plus className="h-4 w-4 mr-2" />
            Add Bonus
          </Button>
        </div>
        <div className="space-y-2">
          {bonusPoints.map((row, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="number"
                value={row.kills}
                onChange={(e) => updateBonusRow(index, 'kills', e.target.value)}
                placeholder="Kills"
                className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                min="1"
              />
              <span className="text-gray-400">kills = +</span>
              <input
                type="number"
                value={row.bonus}
                onChange={(e) => updateBonusRow(index, 'bonus', e.target.value)}
                placeholder="Bonus"
                className="w-24 px-3 py-2 bg-gray-800 rounded-lg"
                min="1"
              />
              <span className="text-gray-400">points</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Award bonus points for reaching certain kill thresholds. Leave empty if not using bonus points.
        </p>
      </Card>

      {/* Save Configuration Section */}
      <div className="flex flex-col space-y-4">
        {/* Save as Template Option */}
        <Card className="p-4 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Save as Template</h3>
              <p className="text-sm text-gray-400">Save this configuration to reuse for future tournaments</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setSaveTemplateData({ ...saveTemplateData, showForm: true })}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save as Template
            </Button>
          </div>
        </Card>

        {/* Main Save Button */}
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleSaveConfiguration}
            disabled={saving}
            className="flex items-center px-8 py-3 text-lg"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Saving Configuration...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                {existingConfig ? 'Update Tournament Configuration' : 'Save Tournament Configuration'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration Preview */}
      {existingConfig && (
        <Card className="p-6 bg-gray-800/30">
          <h3 className="font-semibold mb-3">Current Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Map:</span>
              <span className="text-white ml-2 font-medium">{existingConfig.map_name}</span>
            </div>
            <div>
              <span className="text-gray-400">Team Size:</span>
              <span className="text-white ml-2 font-medium">{existingConfig.team_size}</span>
            </div>
            <div>
              <span className="text-gray-400">Time Window:</span>
              <span className="text-white ml-2 font-medium">{existingConfig.consecutive_hours}h</span>
            </div>
            <div>
              <span className="text-gray-400">Best Games:</span>
              <span className="text-white ml-2 font-medium">{existingConfig.best_games_count}</span>
            </div>
            <div>
              <span className="text-gray-400">Host Cut:</span>
              <span className="text-white ml-2 font-medium">{(existingConfig.host_percentage * 100).toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Prize Pool Display:</span>
              <span className="text-white ml-2 font-medium">{existingConfig.show_prize_pool ? 'Visible' : 'Hidden'}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TKRTournamentConfiguration;