const Swap = require('../models/Swap');
const Item = require('../models/Item');
const User = require('../models/User');

const createSwap = async (req, res) => {
  try {
    const { itemRequestedId, itemOfferedId, type } = req.body; // type: 'swap' or 'redeem'

    const itemRequested = await Item.findById(itemRequestedId);
    if (!itemRequested || itemRequested.status !== 'approved') {
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
      if (!itemOffered || itemOffered.uploader.toString() !== req.user.id || itemOffered.status !== 'approved') {
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

      res.status(201).json(swap);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const listUserSwaps = async (req, res) => {
  try {
    const swaps = await Swap.find({
      $or: [{ requester: req.user.id }, { owner: req.user.id }]
    })
      .populate('requester', 'name')
      .populate('owner', 'name')
      .populate('itemRequested', 'title images')
      .populate('itemOffered', 'title images')
      .sort({ createdAt: -1 });

    res.json(swaps);
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

    // Mark items as swapped
    await Item.findByIdAndUpdate(swap.itemRequested, { status: 'swapped' });
    await Item.findByIdAndUpdate(swap.itemOffered, { status: 'swapped' });

    swap.status = 'completed';
    await swap.save();

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

    res.json({ message: 'Swap rejected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createSwap, listUserSwaps, acceptSwap, rejectSwap };