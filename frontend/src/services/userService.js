import api from './api';

export const userService = {
    // Get top 10 users on leaderboard
    getLeaderboard: async () => {
        try {
            const response = await api.get('/users/leaderboard');
            return response.data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            throw error;
        }
    },

    // Get public profile of a user
    getUserPublicProfile: async (userId) => {
        try {
            const response = await api.get(`/users/${userId}/profile`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }
};
