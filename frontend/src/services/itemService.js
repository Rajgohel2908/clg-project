// frontend/src/services/itemService.js

import api from './api';

export const itemService = {
  getAllItems: async (filters = {}) => {
    // Accept pagination params in filters: page, limit
    const paramsObj = { ...filters };
    if (!paramsObj.page) paramsObj.page = 1;
    if (!paramsObj.limit) paramsObj.limit = 12;
    const params = new URLSearchParams(paramsObj);
    const response = await api.get(`/items?${params}`);
    // Return full response data (items + pagination metadata)
    return response.data;
  },

  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  createItem: async (itemData) => {
    // REMOVED the manual 'Content-Type' header here. Let the browser do its job.
    const response = await api.post('/items', itemData); 
    return response.data;
  },

  updateItem: async (id, itemData) => {
    // Same here, if you're sending files, don't force the header
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  getMyItems: async () => {
    const response = await api.get('/items/my-items');
    return response.data;
  },
};