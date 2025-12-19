const Swap = require('../models/Swap');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');

// 1. Define createSwap with dual swap options
const createSwap = async (req, res) => {
    try {
        const { ownerId, itemRequestedId, itemOfferedId, swapType } = req.body;
        const requesterId = req.user.id;

        // Validate swapType
        if (!swapType || !['points', 'item'].includes(swapType)) {
            return res.status(400).json({ message: "Invalid swap type. Must be 'points' or 'item'" });
        }

        // Fetch requester and item details
        const user = await User.findById(requesterId);
        const itemRequested = await Item.findById(itemRequestedId);

        if (!user) {
            return res.status(404).json({ message: "Requester not found" });
        }

        if (!itemRequested) {
            return res.status(404).json({ message: "Requested item not found" });
        }

        let swapData = {
            requester: requesterId,
            owner: ownerId,
            itemRequested: itemRequestedId,
            swapType: swapType,
            pointsValue: itemRequested.pointsValue
        };

        let notificationMessage = '';

        // Handle points-based swap
        if (swapType === 'points') {
            // Validate user has sufficient points
            if (user.points < itemRequested.pointsValue) {
                return res.status(400).json({
                    message: `Insufficient points. You have ${user.points}, but need ${itemRequested.pointsValue}`
                });
            }

            // Deduct points from requester
            await User.findByIdAndUpdate(requesterId, {
                $inc: { points: -itemRequested.pointsValue }
            });

            notificationMessage = `${user.name} wants to swap "${itemRequested.title}" for ${itemRequested.pointsValue} points.`;

        } else if (swapType === 'item') {
            // Validate itemOfferedId is provided
            if (!itemOfferedId) {
                return res.status(400).json({ message: "Item offered is required for item exchange" });
            }

            const itemOffered = await Item.findById(itemOfferedId);

            if (!itemOffered) {
                return res.status(404).json({ message: "Offered item not found" });
            }

            // Validate point values match (exact matching)
            if (itemOffered.pointsValue !== itemRequested.pointsValue) {
                return res.status(400).json({
                    message: `Item values don't match. Your item is worth ${itemOffered.pointsValue} points, but the requested item is worth ${itemRequested.pointsValue} points.`
                });
            }

            // Validate offered item belongs to requester
            if (itemOffered.uploader.toString() !== requesterId) {
                return res.status(403).json({ message: "You can only offer items you own" });
            }

            swapData.itemOffered = itemOfferedId;

            // Update status of offered item to pending
            await Item.findByIdAndUpdate(itemOfferedId, { status: 'pending' });

            notificationMessage = `${user.name} wants to exchange "${itemOffered.title}" for your "${itemRequested.title}".`;
        }

        // Create new swap
        const newSwap = await Swap.create(swapData);

        // Create notification for the owner of the requested item
        await Notification.create({
            recipient: ownerId,
            sender: requesterId,
            type: 'swap_request',
            message: notificationMessage,
            relatedItem: itemRequestedId,
            relatedSwap: newSwap._id
        });

        // Update status of the requested item to 'pending'
        await Item.findByIdAndUpdate(itemRequestedId, { status: 'pending' });

        res.status(201).json({ message: "Swap request sent successfully", swap: newSwap });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 2. Define listUserSwaps
const listUserSwaps = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find all swaps where the user is either the requester or the owner
        const swaps = await Swap.find({ $or: [{ requester: userId }, { owner: userId }] })
            .populate('requester', 'name')
            .populate('owner', 'name')
            .populate('itemRequested', 'title description images category brand color type size condition')
            .populate('itemOffered', 'title description images category brand color type size condition');

        res.status(200).json(swaps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to update swap status and handle related logic
const updateSwapStatus = async (swapId, newStatus, res) => {
    try {
        const swap = await Swap.findById(swapId)
            .populate('itemRequested', 'title pointsValue')
            .populate('itemOffered', 'title');

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Update swap status
        swap.status = newStatus;
        await swap.save();

        let itemStatus;
        let notificationType;
        let notificationMessage;

        if (newStatus === 'accepted') {
            itemStatus = 'swapped';
            notificationType = 'swap_accepted';

            // Handle points-based swap
            if (swap.swapType === 'points') {
                // Credit owner with points
                await User.findByIdAndUpdate(swap.owner, {
                    $inc: { points: swap.pointsValue }
                });

                notificationMessage = `Your swap request for "${swap.itemRequested.title}" was accepted. You received the item!`;

                // Only update requested item status (no offered item)
                await Item.findByIdAndUpdate(swap.itemRequested, { status: itemStatus });

            } else if (swap.swapType === 'item') {
                // Transfer item ownership for both items
                await Item.findByIdAndUpdate(swap.itemRequested, {
                    status: itemStatus,
                    uploader: swap.requester  // Transfer to requester
                });
                await Item.findByIdAndUpdate(swap.itemOffered, {
                    status: itemStatus,
                    uploader: swap.owner  // Transfer to owner
                });

                notificationMessage = `Your swap request for "${swap.itemRequested.title}" was accepted. Check your items!`;
            }

        } else if (newStatus === 'rejected') {
            itemStatus = 'available';
            notificationType = 'swap_rejected';
            notificationMessage = `Your swap request for "${swap.itemRequested.title}" was rejected.`;

            // Handle points refund for points-based swap
            if (swap.swapType === 'points') {
                // Refund points to requester
                await User.findByIdAndUpdate(swap.requester, {
                    $inc: { points: swap.pointsValue }
                });

                // Only update requested item status
                await Item.findByIdAndUpdate(swap.itemRequested, { status: itemStatus });

            } else if (swap.swapType === 'item') {
                // Update status of both items back to available
                await Item.findByIdAndUpdate(swap.itemRequested, { status: itemStatus });
                await Item.findByIdAndUpdate(swap.itemOffered, { status: itemStatus });
            }

        } else {
            // For other statuses, we might not need to change item status or send a notification
            return res.status(200).json({ message: `Swap status updated to ${newStatus}`, swap });
        }

        // Create notification for the requester
        await Notification.create({
            recipient: swap.requester,
            sender: swap.owner,
            type: notificationType,
            message: notificationMessage,
            relatedItem: swap.itemRequested._id,
            relatedSwap: swap._id
        });

        res.status(200).json({ message: `Swap ${newStatus} successfully`, swap });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// 3. Define acceptSwap
const acceptSwap = async (req, res) => {
    await updateSwapStatus(req.params.swapId, 'accepted', res);
};

// 4. Define rejectSwap
const rejectSwap = async (req, res) => {
    await updateSwapStatus(req.params.swapId, 'rejected', res);
};
// 5. Define completeSwap
const completeSwap = async (req, res) => {
    try {
        const { swapId } = req.params;

        // Find and update swap status to 'completed'
        const swap = await Swap.findByIdAndUpdate(swapId, { status: 'completed' }, { new: true });

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Create notification for the requester
        await Notification.create({
            recipient: swap.requester,
            sender: swap.owner,
            type: 'swap_completed',
            message: 'Your swap has been marked as completed by the owner.'
        });

        res.status(200).json({ message: 'Swap completed successfully', swap });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// 6. Define getSwapDetails
const getSwapDetails = async (req, res) => {
    try {
        const { swapId } = req.params;

        // Find the swap by ID and populate related data
        const swap = await Swap.findById(swapId)
            .populate('requester', 'name')
            .populate('owner', 'name')
            .populate('itemRequested')
            .populate('itemOffered');

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        res.status(200).json(swap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// 7. Define deleteSwap
const deleteSwap = async (req, res) => {
    try {
        const { swapId } = req.params;
        const userId = req.user.id;

        const swap = await Swap.findById(swapId);

        if (!swap) {
            return res.status(404).json({ message: 'Swap not found' });
        }

        // Ensure only the requester can delete the swap
        if (swap.requester.toString() !== userId) {
            return res.status(403).json({ message: 'You are not authorized to cancel this swap' });
        }

        // Ensure that only pending swaps can be deleted
        if (swap.status !== 'pending') {
            return res.status(400).json({ message: 'This swap cannot be cancelled as it is not in pending state' });
        }

        // Handle points refund for points-based swap
        if (swap.swapType === 'points') {
            // Refund points to requester
            await User.findByIdAndUpdate(userId, {
                $inc: { points: swap.pointsValue }
            });

            // Update requested item status back to 'available'
            await Item.findByIdAndUpdate(swap.itemRequested, { status: 'available' });

        } else if (swap.swapType === 'item') {
            // Update status of both items back to 'available'
            await Item.findByIdAndUpdate(swap.itemRequested, { status: 'available' });
            await Item.findByIdAndUpdate(swap.itemOffered, { status: 'available' });
        }

        // Finally, delete the swap
        await Swap.findByIdAndDelete(swapId);

        res.status(200).json({ message: 'Swap cancelled successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- EXPORT SECTION ---
module.exports = {
    createSwap,
    listUserSwaps,
    acceptSwap,
    rejectSwap,
    completeSwap,
    getSwapDetails,
    deleteSwap
};