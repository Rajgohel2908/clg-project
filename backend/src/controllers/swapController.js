const Swap = require('../models/Swap');
const Item = require('../models/Item');
const Notification = require('../models/Notification');
const User = require('../models/User');

// 1. Define createSwap
const createSwap = async (req, res) => {
    try {
        const { ownerId, itemRequestedId, itemOfferedId } = req.body;
        const requesterId = req.user.id; // Use authenticated user's ID
        const user = await User.findById(requesterId);

        if (!user) {
            return res.status(404).json({ message: "Requester not found" });
        }

        // Create new swap
        const newSwap = await Swap.create({
            requester: requesterId,
            owner: ownerId,
            itemRequested: itemRequestedId,
            itemOffered: itemOfferedId
        });

        // Create notification for the owner of the requested item
        await Notification.create({
            recipient: ownerId,
            sender: requesterId,
            type: 'swap_request',
            message: `You have a new swap request from ${user.name}.`,
        });

        // Update status of the involved items to 'pending'
        await Item.findByIdAndUpdate(itemRequestedId, { status: 'pending' });
        await Item.findByIdAndUpdate(itemOfferedId, { status: 'pending' });

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
        const swap = await Swap.findById(swapId);

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
            notificationMessage = 'Your swap request has been accepted.';
        } else if (newStatus === 'rejected') {
            itemStatus = 'available';
            notificationType = 'swap_rejected';
            notificationMessage = 'Your swap request has been rejected.';
        } else {
            // For other statuses, we might not need to change item status or send a notification
            return res.status(200).json({ message: `Swap status updated to ${newStatus}`, swap });
        }

        // Update status of the involved items
        await Item.findByIdAndUpdate(swap.itemRequested, { status: itemStatus });
        await Item.findByIdAndUpdate(swap.itemOffered, { status: itemStatus });

        // Create notification for the requester
        await Notification.create({
            recipient: swap.requester,
            sender: swap.owner,
            type: notificationType,
            message: notificationMessage,
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

        // Update status of the involved items back to 'available'
        await Item.findByIdAndUpdate(swap.itemRequested, { status: 'available' });
        await Item.findByIdAndUpdate(swap.itemOffered, { status: 'available' });

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