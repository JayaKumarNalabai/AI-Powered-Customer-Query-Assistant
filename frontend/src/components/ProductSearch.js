import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import axiosInstance from '../components/axiosInstance';
const ProductSearch = () => {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axiosInstance.get('/api/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data);
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };
    fetchProducts();
  }, []);

  const handleAsk = async () => {
    if (!query.trim()) return;
    const token = localStorage.getItem('token');
    try {
      const res = await axiosInstance.post(
        '/api/chat',
        { message: query },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChatResponse(res.data.reply);
    } catch (err) {
      console.error('Chat error:', err);
      setChatResponse('⚠️ Error contacting assistant.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Product Explorer</h2>

        {/* Product List */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Available Products</h3>
          {products.length === 0 ? (
            <p className="text-gray-500">No products available.</p>
          ) : (
            <ul className="space-y-2">
              {products.map((p) => (
                <li
                  key={p._id}
                  className="flex justify-between items-center border-b pb-2 text-gray-700"
                >
                  <span>{p.name}</span>
                  <span className="font-medium text-blue-600">${p.price}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Chat Assistant */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Ask AI about a product</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <input
              type="text"
              placeholder="e.g. What is the return policy on X product?"
              className="w-full sm:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              onClick={handleAsk}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Ask
            </button>
          </div>
          {chatResponse && (
            <div className="mt-6 text-gray-700 bg-gray-100 p-4 rounded-lg">
              <p><strong>🤖 Assistant:</strong> {chatResponse}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductSearch;
