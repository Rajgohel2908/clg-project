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
  const [activeTab, setActiveTab] = useState('items'); 
  
  const [pendingItems, setPendingItems] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalItems: 0, pendingItems: 0, totalSwaps: 0 });
  
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

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) { console.error(error); }
  };

  const fetchPendingItems = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/items/pending');
      setPendingItems(Array.isArray(response.data) ? response.data : (response.data.items || []));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsersList(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/300x200?text=No+Image';
    return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
  };

  // --- ACTIONS ---

  const handleApprove = async (itemId) => {
    try {
      await api.post(`/admin/items/${itemId}/approve`);
      setPendingItems(prev => prev.filter(item => item._id !== itemId));
      setStats(prev => ({ ...prev, pendingItems: prev.pendingItems - 1 }));
      setSelectedItem(null);
      alert('Approved!');
    } catch (error) { alert('Failed'); }
  };

  const handleReject = async (itemId) => {
    try {
      await api.post(`/admin/items/${itemId}/reject`);
      setPendingItems(prev => prev.filter(item => item._id !== itemId));
      setStats(prev => ({ ...prev, pendingItems: prev.pendingItems - 1 }));
      setSelectedItem(null);
      alert('Rejected!');
    } catch (error) { alert('Failed'); }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Delete this item completely?')) return;
    try {
      await api.delete(`/admin/items/${itemId}`);
      setPendingItems(prev => prev.filter(item => item._id !== itemId));
      // Also update user items list if open
      setSelectedUserItems(prev => prev.filter(item => item._id !== itemId));
      alert('Deleted!');
    } catch (error) { alert('Failed'); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete user and all data?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsersList(prev => prev.filter(u => u._id !== userId));
      setSelectedUser(null);
      alert('User deleted!');
    } catch (error) { alert('Failed'); }
  };

  // 👇 NEW: Delete Image Function
  const handleDeleteImage = async (itemId, imageName) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      await api.delete(`/admin/items/${itemId}/images`, { data: { imageName } });
      
      // UI Update: Remove image from local state
      setSelectedUserItems(prevItems => prevItems.map(item => {
        if (item._id === itemId) {
          return { ...item, images: item.images.filter(img => img !== imageName) };
        }
        return item;
      }));
      alert('Image deleted');
    } catch (error) {
      console.error(error);
      alert('Failed to delete image');
    }
  };

  const fetchSelectedUserItems = async (userId) => {
    try {
      setLoadingSelectedUserItems(true);
      const response = await api.get(`/admin/users/${userId}/items`);
      setSelectedUserItems(Array.isArray(response.data) ? response.data : (response.data.items || []));
    } catch (error) {
      console.error(error);
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Platform Overview</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'blue' },
              { label: 'Total Items', value: stats.totalItems, color: 'green' },
              { label: 'Pending', value: stats.pendingItems, color: 'yellow' },
              { label: 'Swaps', value: stats.totalSwaps, color: 'purple' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{ borderColor: stat.color }}>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button onClick={() => setActiveTab('items')} className={`py-2 px-4 border-b-2 font-medium transition-colors ${activeTab === 'items' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}>Item Reviews</button>
            <button onClick={() => setActiveTab('users')} className={`py-2 px-4 border-b-2 font-medium transition-colors ${activeTab === 'users' ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'}`}>User Management</button>
          </div>

          {/* Content */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            {loading ? <div className="text-center py-10">Loading...</div> : 
             activeTab === 'items' ? (
              // PENDING ITEMS LIST
              pendingItems.length === 0 ? <p className="text-center text-gray-500 py-10">No pending items.</p> :
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pendingItems.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <img src={getImageUrl(item.images[0])} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 truncate">{item.title}</h3>
                      <p className="text-xs text-gray-500 mb-2">By {item.uploader?.name}</p>
                      <Button size="small" onClick={() => setSelectedItem(item)} className="w-full mt-2">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // USERS LIST
              <div className="space-y-4">
                {usersList.map((u) => (
                  <div key={u._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900">{u.name}</h3>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedUser(u); fetchSelectedUserItems(u._id); }} className="bg-blue-50 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-100">View Items</button>
                      <button onClick={() => handleDeleteUser(u._id)} className="bg-red-50 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-100">Delete User</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: REVIEW PENDING ITEM */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4">{selectedItem.title}</h3>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <img src={getImageUrl(selectedItem.images[0])} className="rounded-lg w-full h-64 object-cover" />
              <div className="space-y-2 text-sm">
                <p><strong>Desc:</strong> {selectedItem.description}</p>
                <p><strong>Category:</strong> {selectedItem.category}</p>
                <p><strong>Brand:</strong> {selectedItem.brand || '-'}</p>
                <p><strong>Condition:</strong> {selectedItem.condition}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => handleApprove(selectedItem._id)} className="flex-1">Approve</Button>
              <Button variant="outline" onClick={() => handleReject(selectedItem._id)} className="flex-1 text-red-600 border-red-200">Reject</Button>
              <button onClick={() => setSelectedItem(null)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW USER ITEMS (Updated with Image Delete) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}'s Inventory</h3>
                <p className="text-sm text-gray-500">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {loadingSelectedUserItems ? <div className="text-center py-10">Loading items...</div> : 
             selectedUserItems.length === 0 ? <div className="text-center py-10 text-gray-500">No items found.</div> :
             
             <div className="space-y-6">
               {selectedUserItems.map(item => (
                 <div key={item._id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row gap-4 bg-gray-50">
                   
                   {/* Left: Item Info */}
                   <div className="flex-1">
                     <div className="flex justify-between">
                        <h4 className="font-bold text-lg text-gray-800">{item.title}</h4>
                        <button onClick={() => handleDelete(item._id)} className="text-red-500 text-xs hover:underline">Delete Entire Item</button>
                     </div>
                     <p className="text-xs text-gray-500 mb-2">Status: <span className="uppercase font-semibold">{item.status}</span></p>
                     <p className="text-sm text-gray-600">{item.description}</p>
                   </div>

                   {/* Right: Images Gallery (Editable) */}
                   <div className="flex-1">
                     <p className="text-xs font-bold text-gray-400 mb-2 uppercase">Images ({item.images.length})</p>
                     <div className="flex gap-2 overflow-x-auto pb-2">
                       {item.images.length === 0 && <span className="text-xs text-gray-400">No images</span>}
                       {item.images.map((img, idx) => (
                         <div key={idx} className="relative group flex-shrink-0">
                           <img 
                             src={getImageUrl(img)} 
                             alt="Item" 
                             className="w-20 h-20 object-cover rounded-md border border-gray-200"
                           />
                           {/* DELETE IMAGE BUTTON */}
                           <button
                             onClick={() => handleDeleteImage(item._id, img)}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                             title="Delete this image"
                           >
                             &times;
                           </button>
                         </div>
                       ))}
                     </div>
                   </div>

                 </div>
               ))}
             </div>
            }
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;