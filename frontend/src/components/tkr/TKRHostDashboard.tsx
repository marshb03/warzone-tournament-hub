// src/components/tkr/TKRHostDashboard.tsx - Complete updated version with all changes 1-4
import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, DollarSign, CheckCircle, XCircle, 
  AlertCircle, Edit, Trash2, Eye, Calendar, Trophy,
  RefreshCw, Target, Timer, Search, ArrowUpDown,
  Square, User
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../services/api';
import { tkrService } from '../../services/tkr';
import { 
  TKRTournamentDetails, TKRTeamRegistration, TKRGameSubmission,
  PaymentStatus, SubmissionStatus
} from '../../types/tkr';

interface TKRHostDashboardProps {
  tournamentId: number;
  tournament: any;
}

// Enhanced interface to include team creator information
interface TeamWithCreator extends TKRTeamRegistration {
  team?: {
    id: number;
    name: string;
    creator?: {
      id: number;
      username: string;
      email: string;
    } | null;
  };
}

const TKRHostDashboard: React.FC<TKRHostDashboardProps> = ({ tournamentId, tournament }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [details, setDetails] = useState<TKRTournamentDetails | null>(null);
  const [registrations, setRegistrations] = useState<TeamWithCreator[]>([]);
  const [submissions, setSubmissions] = useState<TKRGameSubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'submissions'>('overview');
  const [error, setError] = useState('');

  // Edit states
  const [editingRegistration, setEditingRegistration] = useState<number | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    status: PaymentStatus.UNPAID,
    amount: '',
    paid_to: '',
    notes: ''
  });

  const [editingSubmission, setEditingSubmission] = useState<number | null>(null);
  const [submissionForm, setSubmissionForm] = useState({
    status: SubmissionStatus.PENDING,
    notes: ''
  });

  // NEW: Bulk verification states
  const [selectedSubmissions, setSelectedSubmissions] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkConfirmation, setShowBulkConfirmation] = useState(false);

  // NEW: Search and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'team' | 'score' | 'date' | 'status'>('team');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadDashboardData();
  }, [tournamentId]);

  // Helper function for 12-hour time format
  const formatTime12Hour = (time24: string) => {
    if (!time24) return 'Not specified';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // NEW: Helper function to format date and time together
  const formatDateAndTime = (dateTimeString: string) => {
    try {
      const date = new Date(dateTimeString);
      const dateStr = date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
      });
      const timeStr = formatTime12Hour(date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
      return `${dateStr} at ${timeStr}`;
    } catch (error) {
      return 'Invalid date';
    }
  };

  // ENHANCED: Load dashboard data with team creator information
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [detailsData, registrationsData, submissionsData] = await Promise.all([
        tkrService.getTournamentDetails(tournamentId),
        tkrService.getTournamentRegistrations(tournamentId),
        tkrService.getTournamentSubmissions(tournamentId)
      ]);

      setDetails(detailsData);
      
      // Backend now includes team.creator information directly
      setRegistrations(registrationsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const startEditingPayment = (registration: TeamWithCreator) => {
    setEditingRegistration(registration.id);
    setPaymentForm({
      status: registration.payment_status,
      amount: registration.payment_amount.toString(),
      paid_to: registration.paid_to || '',
      notes: registration.payment_notes || ''
    });
  };

  const updatePaymentStatus = async () => {
    if (!editingRegistration) return;

    try {
      const updateData = {
        payment_status: paymentForm.status,
        payment_amount: parseFloat(paymentForm.amount) || 0,
        paid_to: paymentForm.paid_to,
        payment_notes: paymentForm.notes
      };

      await tkrService.updateTeamRegistration(editingRegistration, updateData);
      
      setEditingRegistration(null);
      setPaymentForm({ status: PaymentStatus.UNPAID, amount: '', paid_to: '', notes: '' });
      
      await refreshData();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setError('Failed to update payment status');
    }
  };

  const startEditingSubmission = (submission: TKRGameSubmission) => {
    setEditingSubmission(submission.id);
    setSubmissionForm({
      status: submission.status,
      notes: submission.verification_notes || ''
    });
  };

  const updateSubmissionStatus = async () => {
    if (!editingSubmission) return;

    try {
      await tkrService.updateGameSubmission(editingSubmission, {
        status: submissionForm.status,
        verification_notes: submissionForm.notes
      });
      
      setEditingSubmission(null);
      setSubmissionForm({ status: SubmissionStatus.PENDING, notes: '' });
      
      await refreshData();
    } catch (error) {
      console.error('Failed to update submission status:', error);
      setError('Failed to update submission status');
    }
  };

  // NEW: Bulk verification functions
  const handleSelectSubmission = (submissionId: number) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
    setSelectAll(newSelected.size === filteredAndSortedSubmissions.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSubmissions(new Set());
    } else {
      const allIds = new Set(filteredAndSortedSubmissions.map(s => s.id));
      setSelectedSubmissions(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleBulkVerify = async () => {
    try {
      const updatePromises = Array.from(selectedSubmissions).map(submissionId =>
        tkrService.updateGameSubmission(submissionId, {
          status: SubmissionStatus.VERIFIED,
          verification_notes: 'Bulk verified by host'
        })
      );

      await Promise.all(updatePromises);
      
      setSelectedSubmissions(new Set());
      setSelectAll(false);
      setShowBulkConfirmation(false);
      
      await refreshData();
    } catch (error) {
      console.error('Failed to bulk verify submissions:', error);
      setError('Failed to bulk verify submissions');
    }
  };

  // NEW: Search and sort functionality
  const filteredAndSortedSubmissions = React.useMemo(() => {
    let filtered = submissions;

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = submissions.filter(submission => {
        const registration = registrations.find(r => r.id === submission.team_registration_id);
        const teamName = registration?.team_name?.toLowerCase() || '';
        const creatorName = registration?.team?.creator?.username?.toLowerCase() || '';
        const status = submission.status.toLowerCase();
        const score = submission.final_score?.toString() || '';
        
        return teamName.includes(term) || 
               creatorName.includes(term) || 
               status.includes(term) || 
               score.includes(term);
      });
    }

    // Apply sort
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case 'team':
          const regA = registrations.find(r => r.id === a.team_registration_id);
          const regB = registrations.find(r => r.id === b.team_registration_id);
          valueA = regA?.team_name || '';
          valueB = regB?.team_name || '';
          break;
        case 'score':
          valueA = a.final_score || 0;
          valueB = b.final_score || 0;
          break;
        case 'date':
          valueA = new Date(a.submitted_at);
          valueB = new Date(b.submitted_at);
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        default:
          valueA = '';
          valueB = '';
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [submissions, registrations, searchTerm, sortBy, sortDirection]);

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID_FULL: return 'text-green-500';
      case PaymentStatus.PARTIAL: return 'text-yellow-500';
      case PaymentStatus.FREE_ENTRY: return 'text-blue-500';
      case PaymentStatus.UNPAID: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getSubmissionStatusColor = (status: SubmissionStatus) => {
    switch (status) {
      case SubmissionStatus.VERIFIED: return 'text-green-500';
      case SubmissionStatus.PENDING: return 'text-yellow-500';
      case SubmissionStatus.REJECTED: return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getTeamStatus = (registration: TeamWithCreator) => {
    const now = new Date();
    const startTime = new Date(registration.start_time);
    const endTime = registration.end_time ? new Date(registration.end_time) : null;
    
    if (endTime && now > endTime) {
      return { status: 'Completed', color: 'text-green-400' };
    } else if (now >= startTime && (!endTime || now <= endTime)) {
      return { status: 'Playing Now', color: 'text-blue-400' };
    } else {
      return { status: 'Scheduled', color: 'text-gray-400' };
    }
  };

  const getTournamentStatus = () => {
    if (!details || !tournament) return { status: 'Unknown', color: 'text-gray-400' };
    
    const now = new Date();
    const startDate = new Date(tournament.start_date);
    const endDate = tournament.end_date ? new Date(tournament.end_date) : null;
    
    if (details.active_teams > 0) {
      return { status: `${details.active_teams} teams playing`, color: 'bg-green-500/20 text-green-400' };
    } else if (now < startDate) {
      return { status: 'Starting soon', color: 'bg-yellow-500/20 text-yellow-400' };
    } else if (endDate && now > endDate) {
      return { status: 'Tournament ended', color: 'bg-gray-500/20 text-gray-400' };
    } else {
      return { status: 'Tournament ongoing', color: 'bg-blue-500/20 text-blue-400' };
    }
  };

  const TabButton = ({ active, onClick, children, count }: { 
    active: boolean, 
    onClick: () => void, 
    children: React.ReactNode,
    count?: number 
  }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium rounded-lg transition-colors flex items-center ${
        active 
          ? 'bg-[#2979FF] text-white' 
          : 'text-gray-400 hover:bg-gray-800'
      }`}
    >
      {children}
      {count !== undefined && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
          active ? 'bg-white/20' : 'bg-gray-700'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  const tournamentStatus = getTournamentStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Host Dashboard</h2>
        <Button 
          onClick={refreshData}
          variant="outline"
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <Card className="p-4 border-red-500/20 bg-red-500/10">
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-[#2979FF]" />
            <div>
              <p className="text-sm text-gray-400">Total Teams</p>
              <p className="text-2xl font-bold">{details?.total_registrations || 0}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-[#2979FF]" />
            <div>
              <p className="text-sm text-gray-400">Currently Playing</p>
              <p className="text-2xl font-bold text-blue-400">{details?.active_teams || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <Trophy className="h-8 w-8 text-[#2979FF]" />
            <div>
              <p className="text-sm text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-400">{details?.completed_teams || 0}</p>
            </div>
          </div>
        </Card>

        {details?.prize_pool && (
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <DollarSign className="h-8 w-8 text-[#2979FF]" />
              <div>
                <p className="text-sm text-gray-400">Prize Pool</p>
                <p className="text-2xl font-bold text-green-400">
                  ${details.prize_pool.final_prize_pool.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="flex space-x-4 overflow-x-auto">
          <TabButton 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Overview
          </TabButton>
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')}
            count={registrations.length}
          >
            <Users className="h-4 w-4 mr-2" />
            Teams
          </TabButton>
          <TabButton 
            active={activeTab === 'submissions'} 
            onClick={() => setActiveTab('submissions')}
            count={submissions.length}
          >
            <Target className="h-4 w-4 mr-2" />
            Submissions
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tournament Schedule & Configuration</h3>
            
            <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-white">Tournament Schedule</h4>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${tournamentStatus.color}`}>
                  {tournamentStatus.status}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="text-gray-400">Start Date & Time:</p>
                    <p className="text-white font-medium">
                        {tournament ? (
                        `${new Date(tournament.start_date).toLocaleDateString()} at ${formatTime12Hour(tournament.start_time)}`
                        ) : (
                        'Loading...'
                        )}
                    </p>
                </div>
                <div>
                    <p className="text-gray-400">End Date & Time:</p>
                    <p className="text-white font-medium">
                        {tournament && tournament.end_date ? (
                        `${new Date(tournament.end_date).toLocaleDateString()} at ${formatTime12Hour(tournament.end_time)}`
                        ) : (
                        'Not specified'
                        )}
                    </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ENHANCED: Teams Tab with Creator Column and Combined Date/Time */}
      {activeTab === 'teams' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Team Registrations</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Team</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Registered By</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Start Date & Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {registrations.map((registration) => {
                  const teamStatus = getTeamStatus(registration);
                  const isEditing = editingRegistration === registration.id;
                  
                  return (
                    <tr key={registration.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{registration.team_name}</p>
                          <p className="text-sm text-gray-400">
                            Rank: {registration.team_rank} | {registration.players.length} players
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <p className="font-medium text-white">
                            {registration.team?.creator?.username || 'Legacy Team'}
                          </p>
                          <p className="text-gray-400 text-xs">Team Creator</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${teamStatus.color}`}>
                          {teamStatus.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <select
                              value={paymentForm.status}
                              onChange={(e) => setPaymentForm({...paymentForm, status: e.target.value as PaymentStatus})}
                              className="w-full text-xs bg-gray-800 rounded px-2 py-1"
                            >
                              <option value={PaymentStatus.UNPAID}>Unpaid</option>
                              <option value={PaymentStatus.PARTIAL}>Partial</option>
                              <option value={PaymentStatus.PAID_FULL}>Paid Full</option>
                              <option value={PaymentStatus.FREE_ENTRY}>Free Entry</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Amount"
                              value={paymentForm.amount}
                              onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                              className="w-full text-xs bg-gray-800 rounded px-2 py-1"
                            />
                            <input
                              type="text"
                              placeholder="Paid to"
                              value={paymentForm.paid_to}
                              onChange={(e) => setPaymentForm({...paymentForm, paid_to: e.target.value})}
                              className="w-full text-xs bg-gray-800 rounded px-2 py-1"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className={`text-sm font-medium ${getPaymentStatusColor(registration.payment_status)}`}>
                              {registration.payment_status}
                            </span>
                            {registration.payment_amount > 0 && (
                              <p className="text-xs text-gray-400">${registration.payment_amount}</p>
                            )}
                            {registration.paid_to && (
                              <p className="text-xs text-gray-400">via {registration.paid_to}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="text-white">
                          {formatDateAndTime(registration.start_time)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={updatePaymentStatus}
                                className="text-green-500"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingRegistration(null)}
                                className="text-red-500"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingPayment(registration)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {registrations.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No team registrations yet
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ENHANCED: Submissions Tab with Bulk Verification, Search, and Sort */}
      {activeTab === 'submissions' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Game Submissions</h3>
            
            {/* Bulk Actions */}
            {selectedSubmissions.size > 0 && (
              <Button
                onClick={() => setShowBulkConfirmation(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Verify Selected ({selectedSubmissions.size})
              </Button>
            )}
          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams, creators, scores, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Sort by:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('team')}
                className={`flex items-center ${sortBy === 'team' ? 'border-blue-500' : ''}`}
              >
                Team
                {sortBy === 'team' && <ArrowUpDown className="ml-1 h-3 w-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('score')}
                className={`flex items-center ${sortBy === 'score' ? 'border-blue-500' : ''}`}
              >
                Score
                {sortBy === 'score' && <ArrowUpDown className="ml-1 h-3 w-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('date')}
                className={`flex items-center ${sortBy === 'date' ? 'border-blue-500' : ''}`}
              >
                Date
                {sortBy === 'date' && <ArrowUpDown className="ml-1 h-3 w-3" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSort('status')}
                className={`flex items-center ${sortBy === 'status' ? 'border-blue-500' : ''}`}
              >
                Status
                {sortBy === 'status' && <ArrowUpDown className="ml-1 h-3 w-3" />}
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Team</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Game</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Performance</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Score</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAndSortedSubmissions.map((submission) => {
                  const team = registrations.find(r => r.id === submission.team_registration_id);
                  const isEditing = editingSubmission === submission.id;
                  
                  return (
                    <tr key={submission.id} className="hover:bg-gray-800/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedSubmissions.has(submission.id)}
                          onChange={() => handleSelectSubmission(submission.id)}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{team?.team_name || 'Unknown Team'}</p>
                          <p className="text-sm text-gray-400">
                            by {team?.team?.creator?.username || 'Unknown'}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        Game #{submission.game_number}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p>{submission.kills} kills</p>
                          <p className="text-gray-400">#{submission.placement} place</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <p className="font-medium">{submission.final_score?.toFixed(1) || 'N/A'}</p>
                          {submission.bonus_points > 0 && (
                            <p className="text-green-400 text-xs">+{submission.bonus_points} bonus</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="space-y-2">
                            <select
                              value={submissionForm.status}
                              onChange={(e) => setSubmissionForm({...submissionForm, status: e.target.value as SubmissionStatus})}
                              className="w-full text-xs bg-gray-800 rounded px-2 py-1"
                            >
                              <option value={SubmissionStatus.PENDING}>Pending</option>
                              <option value={SubmissionStatus.VERIFIED}>Verified</option>
                              <option value={SubmissionStatus.REJECTED}>Rejected</option>
                            </select>
                            <textarea
                              placeholder="Verification notes..."
                              value={submissionForm.notes}
                              onChange={(e) => setSubmissionForm({...submissionForm, notes: e.target.value})}
                              className="w-full text-xs bg-gray-800 rounded px-2 py-1 h-16 resize-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className={`text-sm font-medium ${getSubmissionStatusColor(submission.status)}`}>
                              {submission.status}
                            </span>
                            {submission.verification_notes && (
                              <p className="text-xs text-gray-400 mt-1">{submission.verification_notes}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {isEditing ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={updateSubmissionStatus}
                                className="text-green-500"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingSubmission(null)}
                                className="text-red-500"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditingSubmission(submission)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredAndSortedSubmissions.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                {searchTerm ? 'No submissions match your search' : 'No game submissions yet'}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bulk Verification Confirmation Modal */}
      {showBulkConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Verification</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to verify {selectedSubmissions.size} submission{selectedSubmissions.size !== 1 ? 's' : ''}? 
              This action will mark them as verified with the note "Bulk verified by host".
            </p>
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleBulkVerify}
                className="bg-green-600 hover:bg-green-700"
              >
                Yes, Verify All
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkConfirmation(false)}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TKRHostDashboard;