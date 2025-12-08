// backend/src/controllers/swapController.js
const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createSwap = async (req, res) => {
  try {
    const { itemRequestedId, itemOfferedId, type } = req.body; // type: 'swap' or 'redeem'

    const itemRequested = await Item.findById(itemRequestedId);
    if (!itemRequested || !['approved', 'available'].includes(itemRequested.status)) {
      return res.status(400).json({ message: 'Invalid or unavailable item requested' });
    }

    if (itemRequested.uploader.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot request swap for your own item' });
    }

    if (type === 'redeem') {
      // Points redemption
      const user = await User.findById(req.user.id);
      if (user.points < itemRequested.pointsValue) {
        return res.status(400).json({ message: 'Insufficient points' });
      }

      // Deduct points
      user.points -= itemRequested.pointsValue;
      await user.save();

      // Mark item as swapped
      itemRequested.status = 'swapped';
      await itemRequested.save();

      // Create swap record
      const swap = new Swap({
        requester: req.user.id,
        owner: itemRequested.uploader,
        itemRequested: itemRequestedId,
        status: 'completed'
      });
      await swap.save();

      res.status(201).json({ message: 'Item redeemed successfully', swap });
    } else {
      // Direct swap request
      if (!itemOfferedId) {
        return res.status(400).json({ message: 'Item offered is required for swap' });
      }

      const itemOffered = await Item.findById(itemOfferedId);
      if (!itemOffered || itemOffered.uploader.toString() !== req.user.id || !['approved', 'available'].includes(itemOffered.status)) {
        return res.status(400).json({ message: 'Invalid item offered' });
      }

      const swap = new Swap({
        requester: req.user.id,
        owner: itemRequested.uploader,
        itemRequested: itemRequestedId,
        itemOffered: itemOfferedId,
        status: 'pending'
      });
      await swap.save();

      // Create Notification for swap request
      await Notification.create({
        recipient: itemRequested.uploader,
        sender: req.user.id,
        type: 'swap_request',
        message: `Someone requested to swap your item: ${itemRequested.title}`
      });

      // GET THE IO INSTANCE
      const io = req.app.get('io');

      // EMIT TO THE OWNER
      io.to(itemRequested.uploader.toString()).emit('new_notification', {
        type: 'swap_request',
        message: `Someone requested to swap your item: ${itemRequested.title}`,
        swapId: swap._id
      });

      res.status(201).json(swap);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSwapById = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id)
      .populate('requester', 'name email')
      .populate('owner', 'name email')
      .populate('itemRequested')
      .populate('itemOffered');

    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Security check: only participants or admin can view
    const userId = req.user.id.toString();
    const isParticipant = swap.requester._id.toString() === userId || swap.owner._id.toString() === userId;

    if (req.user.role !== 'admin' && !isParticipant) {
      return res.status(403).json({ message: 'Not authorized to view this swap' });
    }

    res.json(swap);
  } catch (error) {
    console.error('getSwapById error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const listUserSwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requester: req.user.id }, { owner: req.user.id }]
    })
      .populate('requester', 'name _id')
      .populate('owner', 'name _id')
      .populate({
        path: 'itemRequested',
        select: 'title images uploader description status',
        populate: { path: 'uploader', select: 'name _id' }
      })
      .populate({
        path: 'itemOffered',
        select: 'title images uploader description status',
        populate: { path: 'uploader', select: 'name _id' }
      })
      .sort({ createdAt: -1 });

    // Map swaps to include 'myItem' and normalize owner on requestedItem/requestedItem.owner
    const mapped = swaps.map(s => {
      const obj = s.toObject({ virtuals: false });

      // Ensure status is present and normalized (lowercase)
      obj.status = (obj.status || '').toString().toLowerCase();

      // requestedItem.owner -> uploader
      if (obj.itemRequested && obj.itemRequested.uploader) {
        obj.requestedItem = { ...obj.itemRequested, owner: obj.itemRequested.uploader };
      } else {
        obj.requestedItem = obj.itemRequested || null;
      }

      if (obj.itemOffered && obj.itemOffered.uploader) {
        obj.offeredItem = { ...obj.itemOffered, owner: obj.itemOffered.uploader };
      } else {
        obj.offeredItem = obj.itemOffered || null;
      }

      // Determine myItem for the current user
      const currentUserId = req.user.id.toString();
      const requesterId = obj.requester?._id?.toString() || obj.requester?.toString();
      const ownerId = obj.owner?._id?.toString() || obj.owner?.toString();

      if (requesterId && requesterId === currentUserId) {
        // requester offered itemOffered (their own item)
        obj.myItem = obj.offeredItem || null;
      } else if (ownerId && ownerId === currentUserId) {
        // owner is current user; their item is the requested item
        obj.myItem = obj.requestedItem || null;
      } else {
        obj.myItem = null;
      }

      // Provide convenient fields for frontend
      obj.requestedItem = obj.requestedItem || null;
      obj.offeredItem = obj.offeredItem || null;

      return obj;
    });

    // Diagnostics: log user id and counts for troubleshooting
    try {
      console.log('listUserSwaps - user:', req.user.id);
      console.log('listUserSwaps - swaps found:', swaps.length);
      console.log('listUserSwaps - mapped sample:', mapped[0] || null);
    } catch (e) {
      console.error('Diagnostics logging error in listUserSwaps', e);
    }

    res.json(mapped);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const acceptSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not pending' });
    }

    // Mark swap as accepted (do not mark items as swapped yet)
    swap.status = 'accepted';
    await swap.save();

    // Create Notification for swap acceptance
    await Notification.create({
      recipient: swap.requester,
      sender: req.user.id,
      type: 'swap_accepted',
      message: `Your swap request was accepted!`
    });

    // GET THE IO INSTANCE
    const io = req.app.get('io');

    // EMIT TO THE REQUESTER
    io.to(swap.requester.toString()).emit('new_notification', {
      type: 'swap_accepted',
      message: `Your swap request was accepted!`,
      swapId: swap._id
    });

    res.json({ message: 'Swap accepted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const rejectSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    if (swap.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap is not pending' });
    }

    swap.status = 'rejected';
    await swap.save();

    // Create Notification for swap rejection
    await Notification.create({
      recipient: swap.requester,
      sender: req.user.id,
      type: 'swap_rejected',
      message: `Your swap request was rejected.`
    });

    // GET THE IO INSTANCE
    const io = req.app.get('io');

    // EMIT TO THE REQUESTER
    io.to(swap.requester.toString()).emit('new_notification', {
      type: 'swap_rejected',
      message: `Your swap request was rejected.`,
      swapId: swap._id
    });

    res.json({ message: 'Swap rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const completeSwap = async (req, res) => {
  try {
    const swap = await Swap.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap not found' });
    }

    // Only participants can mark completed
    const userId = req.user.id.toString();
    if (swap.requester.toString() !== userId && swap.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (swap.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted swaps can be completed' });
    }

    // Mark swap as completed
    swap.status = 'completed';
    await swap.save();

    // Mark related items as swapped (if present)
    if (swap.itemRequested) {
      const reqItem = await Item.findById(swap.itemRequested);
      if (reqItem) {
        reqItem.status = 'swapped';
        await reqItem.save();
      }
    }
    if (swap.itemOffered) {
      const offItem = await Item.findById(swap.itemOffered);
      if (offItem) {
        offItem.status = 'swapped';
        await offItem.save();
      }
    }

    // Notify both parties
    await Notification.create({
      recipient: swap.requester,
      sender: req.user.id,
      type: 'swap_completed',
      message: 'Swap has been marked completed.'
    });

    const io = req.app.get('io');
    io.to(swap.requester.toString()).emit('new_notification', {
      type: 'swap_completed',
      message: 'Swap has been marked completed.',
      swapId: swap._id
    });
    io.to(swap.owner.toString()).emit('new_notification', {
      type: 'swap_completed',
      message: 'Swap has been marked completed.',
      swapId: swap._id
    });

    res.json({ message: 'Swap marked as completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createSwap, getSwapById, listUserSwaps, acceptSwap, rejectSwap, completeSwap };

// Debug helper: return raw swaps for a user (only in non-production or when DEBUG=true)
const debugSwaps = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.DEBUG !== 'true') {
      return res.status(403).json({ message: 'Debug endpoint disabled in production' });
    }

    const userId = req.params.userId;
    if (!userId) return res.status(400).json({ message: 'userId required' });

    const swaps = await Swap.find({ $or: [{ requester: userId }, { owner: userId }] })
      .populate('requester', 'name _id')
      .populate('owner', 'name _id')
      .populate({ path: 'itemRequested', populate: { path: 'uploader', select: 'name _id' } })
      .populate({ path: 'itemOffered', populate: { path: 'uploader', select: 'name _id' } })
      .sort({ createdAt: -1 });

    return res.json({ count: swaps.length, swaps });
  } catch (error) {
    console.error('debugSwaps error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.debugSwaps = debugSwaps;