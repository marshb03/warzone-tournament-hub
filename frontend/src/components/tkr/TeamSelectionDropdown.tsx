// src/components/tkr/TeamSelectionDropdown.tsx - COMPLETE with timezone fixes
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, Trophy, ChevronDown, CheckCircle, 
  AlertCircle, Play, Square, Timer, User, Target
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { tkrService } from '../../services/tkr';
import { TKRTeamRegistration } from '../../types/tkr';

interface TeamSelectionDropdownProps {
  tournamentId: number;
  onTeamSelected: (registration: TKRTeamRegistration) => void;
  selectedTeam?: TKRTeamRegistration;
  showSubmissionStatus?: boolean;
}

const TeamSelectionDropdown: React.FC<TeamSelectionDropdownProps> = ({
  tournamentId,
  onTeamSelected,
  selectedTeam,
  showSubmissionStatus = false
}) => {
  const [userRegistrations, setUserRegistrations] = useState<TKRTeamRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [submissionStatuses, setSubmissionStatuses] = useState<{[key: number]: any}>({});
  const [teamSubmissions, setTeamSubmissions] = useState<{[key: number]: any[]}>({});

  // FIXED: Helper function to parse EST times correctly
  const parseESTTime = (timeString: string): Date => {
    // Backend stores EST times as raw timestamps without timezone info
    // We need to explicitly treat them as EST and convert to user's local time
    
    // Add EST timezone indicator to the time string
    const estTimeString = timeString.includes('T') 
      ? timeString.replace('T', 'T').replace(/Z?$/, '-05:00') // EST is UTC-5
      : timeString + '-05:00';
    
    return new Date(estTimeString);
  };

  // FIXED: Enhanced time display function
  const displayTimeWithTimezone = (timeString: string): string => {
    const estTime = parseESTTime(timeString);
    
    // Show the time in both EST and user's local timezone for clarity
    const estDisplay = estTime.toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const localDisplay = estTime.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric', 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // If times are the same (user is in EST), only show once
    if (estDisplay === localDisplay) {
      return `${estDisplay} EST`;
    } else {
      return `${estDisplay} EST (${localDisplay} local)`;
    }
  };

  // FIXED: Submission status with EST timezone handling
  const createSimpleSubmissionStatus = (registration: TKRTeamRegistration) => {
    const now = new Date();
    const startTime = parseESTTime(registration.start_time);
    const endTime = registration.end_time ? parseESTTime(registration.end_time) : null;
    
    if (!endTime) {
      return {
        can_submit: true,
        registration: registration,
        message: "Ready to submit scores"
      };
    }

    // Grace period is 24 hours from END of competition window
    const gracePeriodEnd = new Date(endTime.getTime() + (24 * 60 * 60 * 1000));
    
    if (now > gracePeriodEnd) {
      return {
        can_submit: false,
        registration: registration,
        message: "Submission deadline has passed",
        submission_deadline: gracePeriodEnd.toISOString()
      };
    } else if (now >= endTime) {
      // In grace period - show detailed countdown with minutes
      const diff = gracePeriodEnd.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        can_submit: true,
        registration: registration,
        message: `${hours}h ${minutes}m to submit scores`,
        submission_deadline: gracePeriodEnd.toISOString()
      };
    } else if (now >= startTime) {
      return {
        can_submit: true,
        registration: registration,
        message: "Competition window active"
      };
    } else {
      return {
        can_submit: false,
        registration: registration,
        message: `Competition starts ${displayTimeWithTimezone(registration.start_time)}`
      };
    }
  };

  // FIXED: Team status with proper EST timezone handling
  const getTeamStatus = (registration: TKRTeamRegistration) => {
    const now = new Date();
    const startTime = parseESTTime(registration.start_time);
    const endTime = registration.end_time ? parseESTTime(registration.end_time) : null;
    
    if (now < startTime) {
      return { 
        status: 'upcoming', 
        label: 'Upcoming', 
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        icon: Clock
      };
    } else if (endTime && now >= endTime) {
      // Check if in grace period (24 hours from end of competition)
      const gracePeriodEnd = new Date(endTime.getTime() + (24 * 60 * 60 * 1000));
      
      if (now <= gracePeriodEnd) {
        return { 
          status: 'grace', 
          label: 'Grace Period', 
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10 border-yellow-500/20',
          icon: Timer
        };
      } else {
        return { 
          status: 'expired', 
          label: 'Expired', 
          color: 'text-red-400',
          bgColor: 'bg-red-500/10 border-red-500/20',
          icon: Square
        };
      }
    } else {
      // Competition is active (between start and end time)
      return { 
        status: 'active', 
        label: 'Active', 
        color: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/20',
        icon: Play
      };
    }
  };

  // FIXED: Proper countdown calculation with EST timezone handling
  const formatTimeRemaining = (registration: TKRTeamRegistration) => {
    const now = new Date(); // Current time in user's local timezone
    
    // Parse start and end times as EST
    const startTime = parseESTTime(registration.start_time);
    const endTime = registration.end_time ? parseESTTime(registration.end_time) : null;
    
    // DEBUG: Log times for verification
    console.log('=== TIMEZONE DEBUG ===');
    console.log('Raw start_time from API:', registration.start_time);
    console.log('Parsed as EST:', startTime.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    console.log('Parsed as your local:', startTime.toLocaleString());
    console.log('Current time (your local):', now.toLocaleString());
    console.log('Current time (EST):', now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    
    if (now < startTime) {
      // Competition hasn't started yet
      const diff = startTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `Starts in ${hours}h ${minutes}m`;
    } else if (endTime && now < endTime) {
      // Competition is active
      const diff = endTime.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours}h ${minutes}m remaining`;
    } else if (endTime && now >= endTime) {
      // Competition ended, in grace period (24 hours from end)
      const gracePeriodEnd = new Date(endTime.getTime() + (24 * 60 * 60 * 1000));
      
      if (now <= gracePeriodEnd) {
        const diff = gracePeriodEnd.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m to submit scores`;
      } else {
        return 'Submission deadline passed';
      }
    }
    
    return null;
  };

  // Get submission indicator for team
  const getSubmissionIndicator = (registrationId: number) => {
    const submissions = teamSubmissions[registrationId] || [];
    const submissionCount = submissions.length;
    
    if (submissionCount === 0) {
      return {
        icon: Target,
        color: 'text-gray-400',
        label: 'No submissions',
        bgColor: 'bg-gray-500/10'
      };
    } else {
      return {
        icon: CheckCircle,
        color: 'text-green-400',
        label: `${submissionCount} game${submissionCount > 1 ? 's' : ''} submitted`,
        bgColor: 'bg-green-500/10'
      };
    }
  };

  // Calculate the height needed for dropdown based on number of teams
  const getDropdownHeight = () => {
    const teamCount = userRegistrations.length;
    const baseHeight = 80; // Base height per team item
    const statusHeight = showSubmissionStatus ? 30 : 0; // Extra height if showing status
    const submissionHeight = 25; // Extra height for submission indicators
    const totalHeight = teamCount * (baseHeight + statusHeight + submissionHeight);
    
    // Cap at reasonable max height
    return Math.min(totalHeight, 400);
  };

  const dynamicDropdownHeight = getDropdownHeight();

  useEffect(() => {
    const loadUserRegistrations = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Loading registrations for tournament:', tournamentId);
        
        // Get user's registrations
        let registrations: TKRTeamRegistration[] = [];
        try {
          registrations = await tkrService.getMyRegistrations(tournamentId);
          console.log('Found registrations:', registrations);
        } catch (error) {
          console.log('getMyRegistrations failed, trying fallback:', error);
          try {
            const singleReg = await tkrService.getMyRegistration(tournamentId);
            if (singleReg) {
              registrations = [singleReg];
              console.log('Fallback found single registration:', singleReg);
            }
          } catch (fallbackError) {
            console.log('Both registration methods failed:', fallbackError);
            registrations = [];
          }
        }
        
        setUserRegistrations(registrations);
        
        // Auto-select if only one team
        if (registrations.length === 1) {
          console.log('Auto-selecting single team:', registrations[0]);
          onTeamSelected(registrations[0]);
        }

        // Load submissions for each team to show indicators
        const submissions: {[key: number]: any[]} = {};
        for (const reg of registrations) {
          try {
            const teamSubmissions = await tkrService.getSubmissionsForTeam(tournamentId, reg.id);
            submissions[reg.id] = teamSubmissions;
            console.log(`Team ${reg.team_name} has ${teamSubmissions.length} submissions`);
          } catch (error) {
            console.log(`Failed to load submissions for team ${reg.id}:`, error);
            submissions[reg.id] = [];
          }
        }
        setTeamSubmissions(submissions);

        // UPDATED: Use frontend calculation for submission statuses
        if (showSubmissionStatus && registrations.length > 0) {
          console.log('Creating submission statuses using frontend calculation...');
          const statuses: {[key: number]: any} = {};
          for (const reg of registrations) {
            statuses[reg.id] = createSimpleSubmissionStatus(reg);
          }
          setSubmissionStatuses(statuses);
          console.log('Submission statuses created:', statuses);
        }
      } catch (error) {
        console.error('Failed to load user registrations:', error);
        setError('Failed to load your team registrations');
      } finally {
        setLoading(false);
      }
    };

    loadUserRegistrations();
  }, [tournamentId, showSubmissionStatus, onTeamSelected]);

  // Real-time countdown updates every minute
  useEffect(() => {
    if (!showSubmissionStatus || userRegistrations.length === 0) return;

    const interval = setInterval(() => {
      const statuses: {[key: number]: any} = {};
      for (const reg of userRegistrations) {
        statuses[reg.id] = createSimpleSubmissionStatus(reg);
      }
      setSubmissionStatuses(statuses);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [userRegistrations, showSubmissionStatus]);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2979FF]" />
          <span className="ml-2">Loading your teams...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-red-500/20">
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (userRegistrations.length === 0) {
    return (
      <Card className="p-6 text-center border-red-500/20">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Teams Registered</h3>
        <p className="text-gray-400 mb-4">
          You must register a team for this tournament before submitting scores.
        </p>
        <Button
          variant="primary"
          onClick={() => window.location.href = `/tournaments/${tournamentId}/register-tkr`}
          className="flex items-center mx-auto"
        >
          <Users className="h-4 w-4 mr-2" />
          Register Team
        </Button>
      </Card>
    );
  }

  console.log('Rendering with registrations:', userRegistrations);
  console.log('Selected team:', selectedTeam);
  console.log('Is open:', isOpen);

  return (
    <div className="relative">
      <Card className="p-6 overflow-visible relative z-10">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-[#2979FF]" />
          {userRegistrations.length === 1 ? 'Your Team' : 'Select Team to Submit Scores For'}
          {userRegistrations.length > 1 && (
            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
              {userRegistrations.length} teams
            </span>
          )}
        </h3>

        {userRegistrations.length === 1 ? (
        // Single team - show as selected card with submission indicator
        <div className="space-y-4">
            {(() => {
            const registration = userRegistrations[0];
            const teamStatus = getTeamStatus(registration);
            const submissionIndicator = getSubmissionIndicator(registration.id);
            const StatusIcon = teamStatus.icon;
            const SubmissionIcon = submissionIndicator.icon;
            
            return (
                <div className={`p-4 rounded-lg border ${teamStatus.bgColor}`}>
                <div className="flex items-center justify-between mb-3">
                    <div>
                    <h4 className="font-semibold text-white">{registration.team_name}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-400 mt-1">
                        <span className="flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        Rank: {registration.team_rank}
                        </span>
                        <span className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {registration.players.length} players
                        </span>
                    </div>
                    </div>
                    <div className="text-right">
                    <div className={`flex items-center ${teamStatus.color}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{teamStatus.label}</span>
                    </div>
                    {/* ENHANCED: Show submission status message with minutes */}
                    {submissionStatuses[registration.id] && (
                        <p className="text-xs text-gray-400 mt-1">
                        {submissionStatuses[registration.id].message}
                        </p>
                    )}
                    </div>
                </div>
                
                {/* Submission Status Indicator */}
                <div className={`flex items-center space-x-2 p-2 rounded ${submissionIndicator.bgColor} mb-3`}>
                    <SubmissionIcon className={`h-4 w-4 ${submissionIndicator.color}`} />
                    <span className={`text-sm ${submissionIndicator.color}`}>
                    {submissionIndicator.label}
                    </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                    <span className="text-gray-400">Start Time:</span>
                    <p className="text-white">
                        {displayTimeWithTimezone(registration.start_time)}
                    </p>
                    </div>
                    {registration.end_time && (
                    <div>
                        <span className="text-gray-400">End Time:</span>
                        <p className="text-white">
                        {displayTimeWithTimezone(registration.end_time)}
                        </p>
                    </div>
                    )}
                </div>
                </div>
            );
            })()}
        </div>
        ) : (
        // UPDATED MULTIPLE TEAMS DROPDOWN (replace the existing dropdown section):
        <div className="space-y-2">
            <div 
            className="relative" 
            style={{ 
                marginBottom: isOpen ? `${dynamicDropdownHeight + 20}px` : '0px',
                transition: 'margin-bottom 0.2s ease-in-out'
            }}
            >
            <button
                onClick={() => {
                console.log('Dropdown clicked, current isOpen:', isOpen);
                setIsOpen(!isOpen);
                }}
                className="w-full p-3 bg-gray-800 rounded-lg border border-gray-600 flex items-center justify-between hover:border-gray-500 transition-colors"
            >
                <div className="text-left">
                {selectedTeam ? (
                    <div>
                    <div className="flex items-center space-x-2">
                        <p className="font-medium text-white">{selectedTeam.team_name}</p>
                        {/* Submission indicator in dropdown button */}
                        {(() => {
                        const indicator = getSubmissionIndicator(selectedTeam.id);
                        const IndicatorIcon = indicator.icon;
                        return (
                            <div className="flex items-center space-x-1">
                            <IndicatorIcon className={`h-3 w-3 ${indicator.color}`} />
                            <span className={`text-xs ${indicator.color}`}>
                                {teamSubmissions[selectedTeam.id]?.length || 0} submitted
                            </span>
                            </div>
                        );
                        })()}
                    </div>
                    <p className="text-sm text-gray-400">
                        Rank: {selectedTeam.team_rank} | Players: {selectedTeam.players.length}
                    </p>
                    {/* ENHANCED: Show countdown in dropdown button */}
                    {submissionStatuses[selectedTeam.id] && (
                        <p className="text-xs text-yellow-400">
                        {submissionStatuses[selectedTeam.id].message}
                        </p>
                    )}
                    </div>
                ) : (
                    <span className="text-gray-400">Select a team...</span>
                )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div 
                className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl overflow-y-auto"
                style={{ 
                    zIndex: 9999,
                    maxHeight: `${dynamicDropdownHeight}px`,
                    position: 'absolute',
                    top: '100%',
                    width: '100%'
                }}
                >
                {userRegistrations.map((registration, index) => {
                    const teamStatus = getTeamStatus(registration);
                    const submissionIndicator = getSubmissionIndicator(registration.id);
                    const StatusIcon = teamStatus.icon;
                    const SubmissionIcon = submissionIndicator.icon;
                    
                    return (
                    <button
                        key={`team-${registration.id}-${index}`}
                        onClick={() => {
                        console.log('Team selected:', registration);
                        onTeamSelected(registration);
                        setIsOpen(false);
                        }}
                        className="w-full p-4 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0 transition-colors focus:outline-none focus:bg-gray-700"
                    >
                        <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-medium text-white">{registration.team_name}</p>
                            <div className="flex items-center space-x-3 text-sm text-gray-400 mt-1">
                            <span>Rank: {registration.team_rank}</span>
                            <span>Players: {registration.players.length}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                            Start: {displayTimeWithTimezone(registration.start_time)}
                            </p>
                        </div>
                        <div className="text-right ml-4">
                            <div className={`flex items-center ${teamStatus.color}`}>
                            <StatusIcon className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">{teamStatus.label}</span>
                            </div>
                            {/* ENHANCED: Show countdown in dropdown options */}
                            {submissionStatuses[registration.id] && (
                            <p className="text-xs text-gray-400 mt-1">
                                {submissionStatuses[registration.id].message}
                            </p>
                            )}
                        </div>
                        </div>
                        
                        {/* Submission indicator in dropdown options */}
                        <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="flex items-center space-x-2">
                            <SubmissionIcon className={`h-3 w-3 ${submissionIndicator.color}`} />
                            <span className={`text-xs ${submissionIndicator.color}`}>
                            {submissionIndicator.label}
                            </span>
                        </div>
                        </div>
                    </button>
                    );
                })}
                </div>
            )}
            </div>

            {selectedTeam && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg mt-4">
                <h4 className="text-sm font-medium text-blue-400 mb-3">Selected Team Details</h4>
                <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <span className="text-gray-400">Competition Window:</span>
                    <p className="text-white">
                        {displayTimeWithTimezone(selectedTeam.start_time)}
                        {selectedTeam.end_time && ` - ${displayTimeWithTimezone(selectedTeam.end_time)}`}
                    </p>
                    </div>
                    <div>
                    <span className="text-gray-400">Status:</span>
                    <p className={getTeamStatus(selectedTeam).color}>
                        {getTeamStatus(selectedTeam).label}
                    </p>
                    </div>
                </div>
                <div>
                    <span className="text-gray-400">Team Members:</span>
                    <p className="text-white">
                    {selectedTeam.players.map(p => p.name).join(', ')}
                    </p>
                </div>
                <div>
                    <span className="text-gray-400">Submissions:</span>
                    <p className="text-white">
                    {teamSubmissions[selectedTeam.id]?.length || 0} games submitted
                    </p>
                </div>
                {/* ENHANCED: Show countdown in selected team details */}
                {submissionStatuses[selectedTeam.id] && (
                    <div>
                    <span className="text-gray-400">Submission Status:</span>
                    <p className="text-white">
                        {submissionStatuses[selectedTeam.id].message}
                    </p>
                    </div>
                )}
                </div>
            </div>
            )}
        </div>
        )}
      </Card>
    </div>
  );
};

export default TeamSelectionDropdown;