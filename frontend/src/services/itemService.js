import api from './api';

export const itemService = {
  getAllItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/items?${params}`);
    return response.data.items || [];
  },

  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  createItem: async (itemData) => {
    const response = await api.post('/items', itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateItem: async (id, itemData) => {
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