const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');

/**
 * GET /api/users/leaderboard
 * Returns top 10 users sorted by Karma Score
 * Karma = (Items Listed * 5) + (Completed Swaps * 10)
 */
const getLeaderboard = async (req, res) => {
    try {
        // Aggregate karma scores for all users
        const leaderboard = await User.aggregate([
            {
                $lookup: {
                    from: 'items',
                    localField: '_id',
                    foreignField: 'uploader',
                    as: 'items'
                }
            },
            {
                $lookup: {
                    from: 'swaps',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $or: [{ $eq: ['$requester', '$$userId'] }, { $eq: ['$owner', '$$userId'] }] },
                                        { $eq: ['$status', 'completed'] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'completedSwaps'
                }
            },
            {
                $project: {
                    name: 1,
                    createdAt: 1,
                    itemsCount: { $size: '$items' },
                    completedSwapsCount: { $size: '$completedSwaps' },
                    karma: {
                        $add: [
                            { $multiply: [{ $size: '$items' }, 5] },
                            { $multiply: [{ $size: '$completedSwaps' }, 10] }
                        ]
                    }
                }
            },
            {
                $sort: { karma: -1, name: 1 }
            },
            {
                $limit: 10
            }
        ]);

        // Format response with avatar (first letter of name)
        const formattedLeaderboard = leaderboard.map((user, index) => ({
            _id: user._id,
            name: user.name,
            avatar: user.name.charAt(0).toUpperCase(),
            karma: user.karma,
            rank: index + 1,
            itemsCount: user.itemsCount,
            completedSwapsCount: user.completedSwapsCount
        }));

        res.json(formattedLeaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error fetching leaderboard' });
    }
};

/**
 * GET /api/users/:userId/profile
 * Returns public profile of a user with their available items
 */
const getUserPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch user
        const user = await User.findById(userId).select('name createdAt');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch user's items and swaps for karma calculation
        const [items, completedSwaps] = await Promise.all([
            Item.find({ uploader: userId }),
            Swap.countDocuments({
                $or: [{ requester: userId }, { owner: userId }],
                status: 'completed'
            })
        ]);

        // Calculate karma
        const karma = (items.length * 5) + (completedSwaps * 10);

        // Filter only available items
        const availableItems = items.filter(item => item.status === 'available' || item.status === 'approved');

        // Format response
        const profileData = {
            user: {
                _id: user._id,
                name: user.name,
                avatar: user.name.charAt(0).toUpperCase(),
                joinDate: user.createdAt,
                karma: karma
            },
            items: availableItems
        };

        res.json(profileData);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error fetching user profile' });
    }
};

module.exports = {
    getLeaderboard,
    getUserPublicProfile
};
