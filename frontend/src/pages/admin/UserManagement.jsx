// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { adminService } from '../../services';
import { UserRole } from '../../types/user';

const UserRow = ({ user, onPromote, onToggleActive }) => {
  return (
    <tr className="border-b border-gray-800">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div>
            <div className="text-sm font-medium">{user.username}</div>
            <div className="text-sm text-gray-400">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.role === UserRole.HOST 
            ? 'bg-blue-500/20 text-blue-500'
            : user.role === UserRole.SUPER_ADMIN
            ? 'bg-purple-500/20 text-purple-500'
            : 'bg-gray-500/20 text-gray-500'
        }`}>
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.is_active 
            ? 'bg-green-500/20 text-green-500' 
            : 'bg-red-500/20 text-red-500'
        }`}>
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          {user.role !== UserRole.SUPER_ADMIN && (
            <>
              <Button
                variant="ghost"
                onClick={() => onPromote(user)}
                className="text-sm"
              >
                {user.role === UserRole.HOST ? 'Demote' : 'Promote to Host'}
              </Button>
              <Button
                variant={user.is_active ? "ghost" : "primary"}
                onClick={() => onToggleActive(user)}
                className="text-sm"
              >
                {user.is_active ? 'Deactivate' : 'Activate'}
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminService.getAllUsers();
        // The response is already the array of users, no need to access .users
        setUsers(response);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handlePromote = async (user) => {
    try {
      const isHost = user.role === UserRole.HOST;
      const response = await adminService[isHost ? 'demoteUser' : 'promoteUser'](user.id);
      setUsers(users.map(u => u.id === user.id ? response : u));
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const response = await adminService.toggleUserActive(user.id);
      setUsers(users.map(u => u.id === user.id ? response : u));
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' ? user.is_active : !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-400 mt-2">Manage user roles and permissions</p>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.USER}>Users</option>
              <option value={UserRole.HOST}>Hosts</option>
              <option value={UserRole.SUPER_ADMIN}>Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#2979FF]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    onPromote={handlePromote}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default UserManagement;