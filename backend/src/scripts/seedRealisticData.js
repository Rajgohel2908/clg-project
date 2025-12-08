require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

// --- DATA CONFIGURATION ---

const CITIES = [
  { name: "Mumbai, Maharashtra", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi, India", lat: 28.7041, lon: 77.1025 },
  { name: "Bangalore, Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Ahmedabad, Gujarat", lat: 23.0225, lon: 72.5714 },
  { name: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567 },
];

const SAMPLE_USERS = [
  { name: "Aniket (Admin)", email: "aniket@gmail.com", pass: "aniket", role: "admin" }, // Your Admin
  { name: "Rahul Sharma", email: "rahul@example.com", pass: "password123", role: "user" },
  { name: "Priya Patel", email: "priya@example.com", pass: "password123", role: "user" },
  { name: "Vikram Singh", email: "vikram@example.com", pass: "password123", role: "user" },
  { name: "Neha Gupta", email: "neha@example.com", pass: "password123", role: "user" },
  { name: "Arjun Verma", email: "arjun@example.com", pass: "password123", role: "user" },
  { name: "Pooja Reddy", email: "pooja@example.com", pass: "password123", role: "user" },
  { name: "Rohan Das", email: "rohan@example.com", pass: "password123", role: "user" },
  { name: "Simran Kaur", email: "simran@example.com", pass: "password123", role: "user" },
  { name: "Kabir Khan", email: "kabir@example.com", pass: "password123", role: "user" },
];

const SAMPLE_ITEMS = [
  // CLOTHING
  { title: "Mens Cotton Jacket", category: "clothing", type: "Jacket", brand: "Zara", color: "Beige", size: "M", condition: "like new", image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg", desc: "Great jacket for casual outings. Worn only twice." },
  { title: "Slim Fit T-Shirt", category: "clothing", type: "T-Shirt", brand: "H&M", color: "White", size: "L", condition: "new", image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", desc: "Brand new slim fit t-shirt, tags still attached." },
  { title: "Casual V-Neck", category: "clothing", type: "T-Shirt", brand: "Levis", color: "Red", size: "S", condition: "good", image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg", desc: "Comfortable red tee, good for daily wear." },
  { title: "Denim Jacket", category: "clothing", type: "Jacket", brand: "Levis", color: "Blue", size: "XL", condition: "fair", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=600&q=80", desc: "Vintage denim jacket, slightly faded which gives a cool look." },
  { title: "Women's Rain Jacket", category: "clothing", type: "Jacket", brand: "Columbia", color: "Purple", size: "M", condition: "like new", image: "https://fakestoreapi.com/img/71HblAHs5xL._AC_UY879_-2.jpg", desc: "Waterproof jacket, perfect for monsoons." },
  { title: "Printed Summer Dress", category: "clothing", type: "Dress", brand: "Forever 21", color: "Pink", size: "S", condition: "good", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80", desc: "Beautiful floral print dress for summer." },
  { title: "Biylaculegy Hooded Coat", category: "clothing", type: "Coat", brand: "Generic", color: "Red", size: "L", condition: "new", image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_.jpg", desc: "Warm winter coat with hood. Never used." },
  { title: "Short Sleeve Shirt", category: "clothing", type: "Shirt", brand: "Roadster", color: "Green", size: "M", condition: "good", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80", desc: "Casual green shirt, comfortable fabric." },
  
  // ACCESSORIES & BAGS
  { title: "Fjallraven Backpack", category: "bags", type: "Backpack", brand: "Fjallraven", color: "Grey", size: "Free", condition: "new", image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", desc: "Foldsack No. 1 Backpack, fits 15 Laptops." },
  { title: "Leather Handbag", category: "bags", type: "Handbag", brand: "Gucci", color: "Brown", size: "Free", condition: "like new", image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80", desc: "Premium leather handbag, barely used." },
  { title: "School Backpack", category: "bags", type: "Backpack", brand: "Skybags", color: "Blue", size: "L", condition: "fair", image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", desc: "Used for one semester, still very sturdy." },
  { title: "Gold Plated Ring", category: "accessories", type: "Jewelry", brand: "Tanishq", color: "Gold", size: "Free", condition: "new", image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_.jpg", desc: "White Gold Plated Princess ring." },
  { title: "Silver Bracelet", category: "accessories", type: "Jewelry", brand: "Giva", color: "Silver", size: "Free", condition: "good", image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg", desc: "Solid silver dragon chain bracelet." },
  { title: "Rayban Sunglasses", category: "accessories", type: "Glasses", brand: "Rayban", color: "Black", size: "Free", condition: "like new", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", desc: "Classic wayfarer sunglasses, no scratches." },
  
  // SHOES (Using distinct placeholders as FakeStoreAPI lacks shoes)
  { title: "Nike Air Max", category: "shoes", type: "Sneakers", brand: "Nike", color: "White", size: "9", condition: "good", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", desc: "Super comfy sneakers, white with red swoosh." },
  { title: "Adidas Running Shoes", category: "shoes", type: "Sneakers", brand: "Adidas", color: "Black", size: "10", condition: "new", image: "https://images.unsplash.com/photo-1527634311077-9943f7be34e6?auto=format&fit=crop&w=600&q=80", desc: "Brand new running shoes, box included." },
  { title: "Leather Formal Shoes", category: "shoes", type: "Formal", brand: "Bata", color: "Brown", size: "8", condition: "fair", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80", desc: "Classic brown leather shoes, need a polish." },
  { title: "High Top Converse", category: "shoes", type: "Sneakers", brand: "Converse", color: "Black", size: "7", condition: "like new", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80", desc: "All star converse, worn twice." },
  { title: "Canvas Loafers", category: "shoes", type: "Loafers", brand: "Vans", color: "Grey", size: "9", condition: "good", image: "https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&w=600&q=80", desc: "Easy slip-on shoes for daily wear." },

  // OTHERS / MIX
  { title: "Gaming Headset", category: "other", type: "Electronics", brand: "Logitech", color: "Blue", size: "Free", condition: "new", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", desc: "Noise cancelling gaming headphones." },
  { title: "Analog Watch", category: "accessories", type: "Watch", brand: "Fossil", color: "Brown", size: "Free", condition: "good", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80", desc: "Leather strap analog watch." },
  { title: "Smart Band", category: "accessories", type: "Watch", brand: "Mi", color: "Black", size: "Free", condition: "like new", image: "https://images.unsplash.com/photo-1576243345690-8e4b7328b417?auto=format&fit=crop&w=600&q=80", desc: "Tracks steps and heart rate accurately." },
  { title: "Winter Beanie", category: "clothing", type: "Hat", brand: "Puma", color: "Grey", size: "Free", condition: "new", image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80", desc: "Warm woolen beanie." },
  { title: "Baseball Cap", category: "clothing", type: "Hat", brand: "Nike", color: "Black", size: "Free", condition: "good", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80", desc: "Adjustable cap, good for sports." },
  
  // FILLERS to reach ~30
  { title: "Cotton Chinos", category: "clothing", type: "Trousers", brand: "Gap", color: "Khaki", size: "32", condition: "like new", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80", desc: "Formal chinos, perfect fit." },
  { title: "Silk Scarf", category: "accessories", type: "Scarf", brand: "FabIndia", color: "Red", size: "Free", condition: "new", image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?auto=format&fit=crop&w=600&q=80", desc: "Pure silk scarf with ethnic prints." },
  { title: "Denim Shorts", category: "clothing", type: "Shorts", brand: "Levis", color: "Blue", size: "30", condition: "fair", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80", desc: "Rugged denim shorts for beach wear." },
  { title: "Sports Jersey", category: "clothing", type: "T-Shirt", brand: "Adidas", color: "Blue", size: "L", condition: "good", image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", desc: "Team India jersey copy." },
  { title: "Running Socks", category: "clothing", type: "Socks", brand: "Nike", color: "White", size: "Free", condition: "new", image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=600&q=80", desc: "Pack of 3 running socks." },
  { title: "Yoga Mat Bag", category: "bags", type: "Bag", brand: "Decathlon", color: "Purple", size: "Free", condition: "good", image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg", desc: "Carry your yoga mat easily." }
];

const seedData = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI missing in .env');
    
    console.log('🔌 Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected.');

    // 1. Clear Old Data
    console.log('🧹 Clearing Collections...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Swap.deleteMany({}),
      Notification.deleteMany({})
    ]);

    // 2. Create Users
    console.log('👤 Creating 10 Users...');
    const userDocs = [];
    const salt = await bcrypt.genSalt(10);

    for (const u of SAMPLE_USERS) {
      const hashedPassword = await bcrypt.hash(u.pass, salt);
      const user = new User({
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        points: Math.floor(Math.random() * 50) + 10 // Random points 10-60
      });
      const savedUser = await user.save();
      userDocs.push(savedUser);
    }
    console.log(`✅ ${userDocs.length} Users Created.`);

    // 3. Create Items
    console.log('📦 Creating 30 Items...');
    const itemDocs = [];

    for (const itemData of SAMPLE_ITEMS) {
      // Randomly assign a user (but try not to assign to Admin if possible, or just random)
      // Let's exclude the first user (Aniket) from being an uploader mostly, so he can browse/swap
      const randomUserIndex = Math.floor(Math.random() * (userDocs.length - 1)) + 1; 
      const uploader = userDocs[randomUserIndex];
      
      // Random Location from CITIES
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      
      // Points logic
      let points = 5;
      if (itemData.condition === 'new') points = 10;
      else if (itemData.condition === 'like new') points = 8;
      else if (itemData.condition === 'good') points = 6;
      else points = 4;

      const newItem = new Item({
        title: itemData.title,
        description: itemData.desc,
        category: itemData.category,
        type: itemData.type,
        brand: itemData.brand,
        color: itemData.color,
        size: itemData.size,
        condition: itemData.condition,
        pointsValue: points,
        status: 'approved', // Auto approve seed data
        uploader: uploader._id,
        images: [itemData.image], // Single image in array
        locationName: city.name,
        location: {
          type: 'Point',
          coordinates: [city.lon + (Math.random() * 0.01), city.lat + (Math.random() * 0.01)] // Slight variation
        },
        tags: [itemData.category, itemData.condition, itemData.color.toLowerCase()]
      });

      const savedItem = await newItem.save();
      itemDocs.push(savedItem);
    }

    console.log(`✅ ${itemDocs.length} Items Created.`);
    console.log('\n=============================================');
    console.log('🎉 REALISTIC SEEDING COMPLETE');
    console.log('=============================================');
    console.log('Admin Login: aniket@gmail.com / aniket');
    console.log('User Login:  rahul@example.com / password123');
    console.log('=============================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedData();