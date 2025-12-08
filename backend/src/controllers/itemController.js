const Item = require('../models/Item');
const User = require('../models/User');

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
        { description: { $regex: search, $options: 'i' } },
        { locationName: { $regex: search, $options: 'i' } } 
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
    // 👇 Yahan 'brand' aur 'color' add kiya
    const { title, description, category, type, size, condition, tags, latitude, longitude, locationName, brand, color } = req.body;
    const images = req.files ? req.files.map(file => file.filename) : [];

    if (!title || !description || !category || !condition) {
      return res.status(400).json({ message: 'Title, description, category, and condition are required' });
    }

    const itemData = {
      title,
      description,
      images,
      category,
      type,
      size,
      condition,
      
      // 👇 Inko save object mein dala
      brand,
      color,

      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      uploader: req.user.id,
      pointsValue: calculatePoints(condition),
      locationName: locationName, 
      status: 'pending' 
    };

    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0) {
        itemData.location = {
          type: 'Point',
          coordinates: [lon, lat]
        };
      }
    }

    const item = new Item(itemData);
    await item.save();
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
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.uploader.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!['pending', 'available'].includes(item.status)) {
      return res.status(400).json({ message: 'Cannot update item in current status' });
    }

    // 👇 Yahan bhi 'brand' aur 'color' add kiya
    const { title, description, category, type, size, condition, tags, locationName, brand, color } = req.body;
    const images = req.files && req.files.length > 0 ? req.files.map(file => file.filename) : item.images;

    item.title = title || item.title;
    item.description = description || item.description;
    item.images = images;
    item.category = category || item.category;
    item.type = type || item.type;
    item.size = size || item.size;
    item.condition = condition || item.condition;
    
    // 👇 Update logic
    if (brand) item.brand = brand;
    if (color) item.color = color;

    item.tags = tags ? tags.split(',').map(tag => tag.trim()) : item.tags;
    item.pointsValue = calculatePoints(item.condition);
    
    if (locationName) item.locationName = locationName; 

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
    if (!item) return res.status(404).json({ message: 'Item not found' });

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