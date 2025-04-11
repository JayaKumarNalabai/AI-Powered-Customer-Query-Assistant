import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance';
import ProductList from './admin/ProductList';
// ✅ Main Admin Dashboard Component
const AdminDashboard = () => {
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeTab, setActiveTab] = useState('chats');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axiosInstance.get('/api/admin/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(response.data);
      setFilteredChats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chats:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setError('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      await axiosInstance.delete(`/api/admin/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      setFilteredChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    if (value) {
      const filtered = chats.filter(chat => 
        chat.messages.some(msg => 
          msg.content.toLowerCase().includes(value)
        )
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = chats.filter(chat => 
        chat.messages.some(msg => 
          msg.content.toLowerCase().includes(search.toLowerCase())
        )
      );
      setFilteredChats(filtered);
    } else {
      setFilteredChats(chats);
    }
  }, [search, chats]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">Admin Panel</h2>
        <ul className="space-y-3">
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'chats' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('chats')}
            >
              Chats
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'users' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </li>
          <li>
            <button
              className={`w-full text-left px-4 py-2 rounded ${
                activeTab === 'products' ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => setActiveTab('products')}
            >
              Products
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

        {activeTab === 'chats' && (
          <>
            <input
              type="text"
              placeholder="Search by Chat ID"
              value={search}
              onChange={handleSearch}
              className="mb-6 w-full md:w-1/2 p-2 border border-gray-300 rounded-md"
            />

            {error && <p className="text-red-600">{error}</p>}

            {loading ? (
              <p className="text-gray-600">Loading chats...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredChats.length === 0 ? (
                  <p className="col-span-full text-gray-500">No chats found.</p>
                ) : (
                  filteredChats.map(chat => (
                    <div key={chat._id} className="bg-white p-4 rounded-xl shadow-md flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Chat ID: {chat._id}</h3>
                        <p className="text-sm text-gray-600">Messages: {chat.messages.length}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(chat.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteChat(chat._id)}
                        className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <div className="text-gray-700">
            <h2 className="text-xl font-semibold mb-4">Users Section</h2>
            <p>This section will be implemented soon.</p>
          </div>
        )}

        {activeTab === 'products' && (
          <ProductList />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
