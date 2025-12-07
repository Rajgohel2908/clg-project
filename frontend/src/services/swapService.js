import api from './api';

export const swapService = {
  getAllSwaps: async () => {
    const response = await api.get('/swaps');
    return response.data;
  },

  getSwapById: async (id) => {
    const response = await api.get(`/swaps/${id}`);
    return response.data;
  },

  createSwap: async (swapData) => {
    const response = await api.post('/swaps', swapData);
    return response.data;
  },

  updateSwap: async (id, swapData) => {
    const response = await api.put(`/swaps/${id}`, swapData);
    return response.data;
  },

  deleteSwap: async (id) => {
    const response = await api.delete(`/swaps/${id}`);
    return response.data;
  },

  getMySwaps: async () => {
    const response = await api.get('/swaps/my-swaps');
    return response.data;
  },

  acceptSwap: async (id) => {
    const response = await api.put(`/swaps/${id}/accept`);
    return response.data;
  },

  rejectSwap: async (id) => {
    const response = await api.put(`/swaps/${id}/reject`);
    return response.data;
  },

  completeSwap: async (id) => {
    const response = await api.put(`/swaps/${id}/complete`);
    return response.data;
  },
};