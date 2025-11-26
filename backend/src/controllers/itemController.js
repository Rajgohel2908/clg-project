const Item = require('../models/Item');
const User = require('../models/User');

// Simple points calculation based on condition
const calculatePoints = (condition) => {
  switch (condition) {
    case 'new': return 10;
    case 'like new': return 8;
    case 'good': return 6;
    case 'fair': return 4;
    default: return 5;
  }
};

const listItems = async (req, res) => {
  try {
    const { search, category, type, condition, page = 1, limit = 10 } = req.query;
    const query = { status: 'approved' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (type) query.type = type;
    if (condition) query.condition = condition;

    const items = await Item.find(query)
      .populate('uploader', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Item.countDocuments(query);

    res.json({
      items,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('uploader', 'name email');
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createItem = async (req, res) => {
  try {
    const { title, description, category, type, size, condition, tags, latitude, longitude } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    // Basic validation
    if (!title || !description || !category || !condition) {
      return res.status(400).json({ message: 'Title, description, category, and condition are required' });
    }

    // Create item object
    const itemData = {
      title,
      description,
      images,
      category,
      type,
      size,
      condition,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploader: req.user.id,
      pointsValue: calculatePoints(condition)
    };

    // Add location if coordinates are provided
    // GeoJSON format: [longitude, latitude] (NOT [latitude, longitude]!)
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      // Only add location if valid coordinates
      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        itemData.location = {
          type: 'Point',
          coordinates: [lon, lat] // [longitude, latitude]
        };
      }
    }

    const item = new Item(itemData);
    await item.save();

    // Populate uploader for response
    await item.populate('uploader', 'name');

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the uploader
    if (item.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Only allow update if status is pending or available
    if (!['pending', 'available'].includes(item.status)) {
      return res.status(400).json({ message: 'Cannot update item in current status' });
    }

    const { title, description, category, type, size, condition, tags } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : item.images;

    item.title = title || item.title;
    item.description = description || item.description;
    item.images = images;
    item.category = category || item.category;
    item.type = type || item.type;
    item.size = size || item.size;
    item.condition = condition || item.condition;
    item.tags = tags ? tags.split(',').map(tag => tag.trim()) : item.tags;
    item.pointsValue = calculatePoints(item.condition);

    await item.save();
    await item.populate('uploader', 'name');

    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if user is the uploader or admin
    if (item.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getUserItems = async (req, res) => {
  try {
    const items = await Item.find({ uploader: req.user.id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { listItems, getItem, createItem, updateItem, deleteItem, getUserItems };