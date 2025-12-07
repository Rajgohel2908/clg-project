import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'users'
  
  // Data States
  const [pendingItems, setPendingItems] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    pendingItems: 0,
    totalSwaps: 0
  });
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUserItems, setSelectedUserItems] = useState([]);
  const [loadingSelectedUserItems, setLoadingSelectedUserItems] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardStats();
    fetchPendingItems();
  }, [user, navigate]);

  // Tab change hone par data fetch karega
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/items/pending');
      setPendingItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsersList(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Item Actions
  const handleApprove = async (itemId) => {
    try {
      await api.post(`/admin/items/${itemId}/approve`);
      setPendingItems(pendingItems.filter(item => item._id !== itemId));
      setStats(prev => ({ ...prev, pendingItems: prev.pendingItems - 1 }));
      setSelectedItem(null);
      alert('Item approved successfully!');
    } catch (error) {
      alert('Failed to approve item');
    }
  };

  const handleReject = async (itemId) => {
    try {
      await api.post(`/admin/items/${itemId}/reject`);
      setPendingItems(pendingItems.filter(item => item._id !== itemId));
      setStats(prev => ({ ...prev, pendingItems: prev.pendingItems - 1 }));
      setSelectedItem(null);
      alert('Item rejected!');
    } catch (error) {
      alert('Failed to reject item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      setPendingItems(pendingItems.filter(item => item._id !== itemId));
      setStats(prev => ({ ...prev, pendingItems: prev.pendingItems - 1 }));
      setSelectedItem(null);
      alert('Deleted!');
    } catch (error) {
      alert('Failed to delete item');
    }
  };

  // User Actions
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their items?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList(usersList.filter(u => u._id !== userId));
      setSelectedUser(null);
      alert('User deleted successfully!');
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const fetchSelectedUserItems = async (userId) => {
    try {
      setLoadingSelectedUserItems(true);
      const response = await api.get(`/admin/users/${userId}/items`);
      setSelectedUserItems(response.data || []);
    } catch (error) {
      console.error('Error fetching selected user items:', error);
      setSelectedUserItems([]);
    } finally {
      setLoadingSelectedUserItems(false);
    }
  };


  if (!user || user.role !== 'admin') return null;

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Real-time overview of platform activity</p>
          </div>

          {/* Stats Grid (Real Data) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'blue', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
              { label: 'Total Items', value: stats.totalItems, color: 'green', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
              { label: 'Pending Review', value: stats.pendingItems, color: 'yellow', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Total Swaps', value: stats.totalSwaps, color: 'purple', icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center">
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg text-${stat.color}-600`}>
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} /></svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('items')}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'items' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Item Reviews
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === 'users' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              User Management
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : activeTab === 'items' ? (
              // --- ITEMS VIEW ---
              pendingItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No pending items to review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pendingItems.map((item) => (
                    <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md">
                      <img
                        src={item.images[0] ? `http://localhost:5000/uploads/${item.images[0]}` : 'https://via.placeholder.com/300x200'}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 mb-3">By {item.uploader?.name}</p>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                        {item.locationName && <p className="text-xs text-green-600 mb-2">📍 {item.locationName}</p>}
                        <Button size="small" onClick={() => setSelectedItem(item)} className="w-full">Review</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              // --- USERS VIEW ---
              <div className="space-y-4">
                {usersList.length === 0 ? (
                  <p className="text-center text-gray-600 py-12">No users found</p>
                ) : (
                  <div className="grid gap-4">
                    {usersList.map((u) => (
                      <div key={u._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{u.name}</h3>
                            <p className="text-sm text-gray-500">{u.email}</p>
                            <p className="text-xs text-gray-400 mt-1">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-green-600">{u.points}</p>
                            <p className="text-xs text-gray-500">Points</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                          {/* Edit Points and Security options removed per request */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              fetchSelectedUserItems(u._id);
                            }}
                            className="px-3 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium hover:bg-orange-200"
                          >
                            View Items
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200"
                          >
                            Delete User
                          </button>
                        </div>

                        {/* points editing removed */}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-2xl font-bold">Review: {selectedItem.title}</h3>
              <button onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <img src={`http://localhost:5000/uploads/${selectedItem.images[0]}`} className="rounded-lg w-full h-48 object-cover" />
              <div className="space-y-2">
                <p><span className="font-bold">Desc:</span> {selectedItem.description}</p>
                <p><span className="font-bold">Category:</span> {selectedItem.category}</p>
                <p><span className="font-bold">Condition:</span> {selectedItem.condition}</p>
                <p><span className="font-bold">Location:</span> {selectedItem.locationName || 'N/A'}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleApprove(selectedItem._id)} className="flex-1">Approve</Button>
              <Button variant="outline" onClick={() => handleReject(selectedItem._id)} className="flex-1 text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
              <Button variant="outline" onClick={() => handleDelete(selectedItem._id)} className="text-red-600 border-red-200 hover:bg-red-50">Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal - View User Items */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="text-2xl font-bold">{selectedUser.name}'s Items</h3>
              <button onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Email: {selectedUser.email}</p>
            {loadingSelectedUserItems ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              </div>
            ) : selectedUserItems.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No items found for this user.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedUserItems.map(item => (
                  <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={item.images && item.images.length > 0 ? `http://localhost:5000/uploads/${item.images[0]}` : 'https://via.placeholder.com/300x200'}
                      alt={item.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-xs text-gray-500">Status: {item.status}</p>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security modal removed per request */}
    </Layout>
  );
};

export default AdminDashboard;