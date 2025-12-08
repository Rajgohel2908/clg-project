require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

// --- 1. Locations (For Map/Filter) ---
const CITIES = [
  { name: "Mumbai, Maharashtra", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi, India", lat: 28.7041, lon: 77.1025 },
  { name: "Bangalore, Karnataka", lat: 12.9716, lon: 77.5946 },
  { name: "Pune, Maharashtra", lat: 18.5204, lon: 73.8567 },
  { name: "Hyderabad, Telangana", lat: 17.3850, lon: 78.4867 },
];

// --- 2. Users (5 Real + 1 Admin) ---
const ADMIN_USER = { name: "Super Admin", email: "admin@gmail.com", pass: "admin123", role: "admin" };

const REAL_USERS = [
  { name: "Rohan Das", email: "rohan@example.com" },
  { name: "Priya Sharma", email: "priya@example.com" },
  { name: "Amit Verma", email: "amit@example.com" },
  { name: "Sneha Patel", email: "sneha@example.com" },
  { name: "Vikram Singh", email: "vikram@example.com" },
  // ... (purane users ke baad comma lagakar ye paste karein)
  { name: "Kavita Singh", email: "kavita@example.com" },
  { name: "Manish Gupta", email: "manish@example.com" },
  { name: "Zara Khan", email: "zara@example.com" },
  { name: "Ishaan Roy", email: "ishaan@example.com" },
  { name: "Meera Nair", email: "meera@example.com" }
];
const COMMON_PASS = "pass123";

// --- 3. Items (30 Professional, Clean Items) ---
const ITEMS_DATA = [
  // CLOTHING (Shirts, T-Shirts, Jackets)
  { title: "Classic White Shirt", category: "clothing", type: "Shirt", brand: "Zara", color: "White", condition: "new", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80", desc: "Crisp white formal shirt, 100% cotton. Perfect for office wear." },
  { title: "Navy Blue Blazer", category: "clothing", type: "Blazer", brand: "Raymond", color: "Blue", condition: "like new", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80", desc: "Slim fit navy blazer. Worn once for an event." },
  { title: "Beige Chinos", category: "clothing", type: "Pants", brand: "H&M", color: "Beige", condition: "good", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&q=80", desc: "Comfortable beige chinos, size 32. Great for casual fridays." },
  { title: "Black Turtleneck", category: "clothing", type: "T-Shirt", brand: "Uniqlo", color: "Black", condition: "new", image: "https://images.unsplash.com/photo-1624225206272-3539cb9eb20e?auto=format&fit=crop&w=600&q=80", desc: "Premium quality turtleneck sweater. Never worn." },
  { title: "Denim Jacket", category: "clothing", type: "Jacket", brand: "Levis", color: "Blue", condition: "fair", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=600&q=80", desc: "Vintage look denim jacket. Rugged and durable." },
  { title: "Grey Hoodie", category: "clothing", type: "Hoodie", brand: "Nike", color: "Grey", condition: "good", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80", desc: "Fleece lined grey hoodie. Very warm." },
  { title: "Plaid Flannel Shirt", category: "clothing", type: "Shirt", brand: "Gap", color: "Red", condition: "good", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=600&q=80", desc: "Red checkered flannel shirt. Soft fabric." },
  { title: "Black Formal Trousers", category: "clothing", type: "Pants", brand: "Van Heusen", color: "Black", condition: "new", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80", desc: "Formal black trousers, slim fit. Unaltered." },
  { title: "Summer Floral Dress", category: "clothing", type: "Dress", brand: "Forever 21", color: "Yellow", condition: "like new", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80", desc: "Bright yellow floral dress, perfect for summer brunch." },
  { title: "Olive Green Jacket", category: "clothing", type: "Jacket", brand: "Zara", color: "Green", condition: "good", image: "https://images.unsplash.com/photo-1559551409-dadc959f76b8?auto=format&fit=crop&w=600&q=80", desc: "Lightweight olive green bomber jacket." },

  // SHOES
  { title: "White Sneakers", category: "shoes", type: "Sneakers", brand: "Adidas", color: "White", condition: "like new", image: "https://images.unsplash.com/photo-1560769629-975e13f0c470?auto=format&fit=crop&w=600&q=80", desc: "Clean white sneakers. Worn twice indoors." },
  { title: "Brown Leather Loafers", category: "shoes", type: "Formal", brand: "Clarks", color: "Brown", condition: "good", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80", desc: "Classic leather loafers. Genuine leather." },
  { title: "Running Shoes", category: "shoes", type: "Sports", brand: "Nike", color: "Black", condition: "new", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", desc: "High performance running shoes with box." },
  { title: "Tan Chelsea Boots", category: "shoes", type: "Boots", brand: "Woodland", color: "Tan", condition: "fair", image: "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=600&q=80", desc: "Suede finish boots. Stylish rustic look." },
  { title: "Canvas Slip-ons", category: "shoes", type: "Casual", brand: "Vans", color: "Black", condition: "good", image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80", desc: "Comfortable canvas shoes for daily use." },
  { title: "High Heels", category: "shoes", type: "Heels", brand: "Steve Madden", color: "Red", condition: "like new", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", desc: "Red pumps, 3 inch heel. Excellent condition." },

  // ACCESSORIES (Watches, Bags, etc.)
  { title: "Leather Watch", category: "accessories", type: "Watch", brand: "Fossil", color: "Brown", condition: "new", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80", desc: "Minimalist analog watch with leather strap." },
  { title: "Aviator Sunglasses", category: "accessories", type: "Glasses", brand: "Rayban", color: "Gold", condition: "like new", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80", desc: "Classic aviators. Scratch-free lens." },
  { title: "Smart Watch", category: "accessories", type: "Watch", brand: "Apple", color: "Black", condition: "good", image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80", desc: "Series 5 smartwatch. Includes charger." },
  { title: "Leather Belt", category: "accessories", type: "Belt", brand: "Tommy", color: "Black", condition: "new", image: "https://images.unsplash.com/photo-1542062700-94f32d949d83?auto=format&fit=crop&w=600&q=80", desc: "Genuine leather belt with silver buckle." },
  { title: "Leather Laptop Bag", category: "bags", type: "Messenger", brand: "Hidesign", color: "Brown", condition: "like new", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", desc: "Fits 15 inch laptops. Professional look." },
  { title: "Travel Backpack", category: "bags", type: "Backpack", brand: "Samsonite", color: "Grey", condition: "good", image: "https://images.unsplash.com/photo-1581605405669-fdaf81177145?auto=format&fit=crop&w=600&q=80", desc: "Sturdy travel bag with multiple pockets." },
  { title: "Canvas Tote", category: "bags", type: "Tote", brand: "Generic", color: "Beige", condition: "new", image: "https://images.unsplash.com/photo-1597484662317-c9253e602531?auto=format&fit=crop&w=600&q=80", desc: "Eco-friendly tote bag for shopping." },
  { title: "Slim Wallet", category: "accessories", type: "Wallet", brand: "Titan", color: "Tan", condition: "new", image: "https://images.unsplash.com/photo-1627123424574-18bd75847b72?auto=format&fit=crop&w=600&q=80", desc: "Slim leather card holder and wallet." },

  // OTHER
  { title: "Wireless Headphones", category: "other", type: "Electronics", brand: "Sony", color: "Black", condition: "like new", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", desc: "Noise cancelling headphones. Amazing bass." },
  { title: "Vintage Camera", category: "other", type: "Electronics", brand: "Canon", color: "Black", condition: "fair", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80", desc: "Film camera for collectors. Functional." },
  { title: "Steel Water Bottle", category: "other", type: "Bottle", brand: "Milton", color: "Silver", condition: "new", image: "https://images.unsplash.com/photo-1602143407151-11115cd4e69b?auto=format&fit=crop&w=600&q=80", desc: "Insulated bottle, keeps water cold for 12h." },
  { title: "Leather Journal", category: "other", type: "Stationery", brand: "Generic", color: "Brown", condition: "new", image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80", desc: "Handmade paper diary. Premium feel." },
  { title: "Desk Plant Pot", category: "other", type: "Decor", brand: "Home", color: "White", condition: "new", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80", desc: "Minimalist ceramic pot for succulents." },
  { title: "Bluetooth Speaker", category: "other", type: "Electronics", brand: "JBL", color: "Blue", condition: "good", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80", desc: "Portable waterproof speaker." },
  // --- NEW CLOTHING ---
  { title: "Silk Saree", category: "clothing", type: "Saree", brand: "FabIndia", color: "Red", condition: "new", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80", desc: "Elegant Banarasi silk saree with gold border. Unworn." },
  { title: "Men's Linen Kurta", category: "clothing", type: "Kurta", brand: "Manyavar", color: "Yellow", condition: "good", image: "https://images.unsplash.com/photo-1598263720743-98a287a9883f?auto=format&fit=crop&w=600&q=80", desc: "Traditional yellow kurta, comfortable for festivities." },
  { title: "Puffer Jacket", category: "clothing", type: "Jacket", brand: "North Face", color: "Black", condition: "like new", image: "https://images.unsplash.com/photo-1545594861-3bef43ff22c7?auto=format&fit=crop&w=600&q=80", desc: "Heavy winter jacket, water resistant. Size L." },
  { title: "Cargo Pants", category: "clothing", type: "Pants", brand: "Superdry", color: "Green", condition: "fair", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80", desc: "Rugged utility pants with 6 pockets." },
  { title: "Yoga Leggings", category: "clothing", type: "Activewear", brand: "Lululemon", color: "Purple", condition: "good", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80", desc: "High waist stretchable yoga pants." },
  { title: "Woolen Scarf", category: "clothing", type: "Scarf", brand: "Burberry", color: "Checkered", condition: "new", image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80", desc: "Soft cashmere feel scarf for winter." },
  { title: "Summer Shorts", category: "clothing", type: "Shorts", brand: "H&M", color: "Blue", condition: "good", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80", desc: "Cotton casual shorts, perfect for beach." },
  { title: "Leather Jacket", category: "clothing", type: "Jacket", brand: "AllSaints", color: "Black", condition: "like new", image: "https://images.unsplash.com/photo-1551028919-ac7675cf5063?auto=format&fit=crop&w=600&q=80", desc: "Genuine leather biker jacket. Size M." },

  // --- NEW SHOES ---
  { title: "Hiking Boots", category: "shoes", type: "Boots", brand: "Timberland", color: "Brown", condition: "good", image: "https://images.unsplash.com/photo-1605034313761-73ea4a0cfbf3?auto=format&fit=crop&w=600&q=80", desc: "Waterproof boots for trekking. Size 9." },
  { title: "Ballet Flats", category: "shoes", type: "Flats", brand: "H&M", color: "Pink", condition: "new", image: "https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80", desc: "Comfortable slip-on flats for daily wear." },
  { title: "Oxford Shoes", category: "shoes", type: "Formal", brand: "Hush Puppies", color: "Tan", condition: "like new", image: "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&w=600&q=80", desc: "Formal shoes with memory foam sole." },
  { title: "Sport Sandals", category: "shoes", type: "Sandals", brand: "Crocs", color: "Grey", condition: "good", image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80", desc: "All-terrain sandals with adjustable straps." },

  // --- NEW ACCESSORIES ---
  { title: "Gold Pendant", category: "accessories", type: "Jewelry", brand: "CaratLane", color: "Gold", condition: "new", image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=600&q=80", desc: "18k gold plated simple pendant chain." },
  { title: "Duffle Bag", category: "bags", type: "Travel", brand: "American Tourister", color: "Blue", condition: "good", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", desc: "Gym and travel duffle bag. Spacious." }, // (Using generic bag image that works well)
  { title: "Snapback Cap", category: "accessories", type: "Hat", brand: "New Era", color: "Black", condition: "new", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80", desc: "Trendy cap with flat brim." },
  { title: "Winter Gloves", category: "accessories", type: "Gloves", brand: "Generic", color: "Brown", condition: "new", image: "https://images.unsplash.com/photo-1520023023023-455b80613233?auto=format&fit=crop&w=600&q=80", desc: "Leather finish warm gloves." },

  // --- NEW OTHER ITEMS ---
  { title: "Polaroid Camera", category: "other", type: "Electronics", brand: "Fujifilm", color: "Mint", condition: "like new", image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80", desc: "Instax mini instant camera. Comes with film." },
  { title: "Study Lamp", category: "other", type: "Decor", brand: "Philips", color: "White", condition: "good", image: "https://images.unsplash.com/photo-1534234828563-0af9c5a73b74?auto=format&fit=crop&w=600&q=80", desc: "LED desk lamp with adjustable brightness." },
  { title: "Ukulele", category: "other", type: "Music", brand: "Kadence", color: "Wood", condition: "like new", image: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=600&q=80", desc: "Soprano ukulele, perfect for beginners." },
  { title: "Art Set", category: "other", type: "Stationery", brand: "Faber Castell", color: "Multicolor", condition: "new", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80", desc: "Complete sketching and color pencil set." }
];

const seed = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error('MONGO_URI is undefined in .env');
    
    console.log('🔌 Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ DB Connected.');

    // 1. CLEANUP
    console.log('🧹 Clearing old data...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Swap.deleteMany({});
    await Notification.deleteMany({});

    // 2. CREATE ADMIN
    console.log('👑 Creating Admin...');
    const adminSalt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash(ADMIN_USER.pass, adminSalt);
    
    await User.create({
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      password: adminHash,
      role: 'admin',
      points: 1000
    });

    // 3. CREATE USERS
    console.log('👥 Creating 5 Real Users...');
    const userSalt = await bcrypt.genSalt(10);
    const userHash = await bcrypt.hash(COMMON_PASS, userSalt);
    
    const userDocs = [];
    for (const u of REAL_USERS) {
      const newUser = await User.create({
        name: u.name,
        email: u.email,
        password: userHash, // Hashed password "pass123"
        role: 'user',
        points: 50 + Math.floor(Math.random() * 50)
      });
      userDocs.push(newUser);
    }

    // 4. CREATE ITEMS
    console.log('📦 Creating 30 Items...');
    
    const itemDocs = [];
    for (const item of ITEMS_DATA) {
      // Points Logic
      let points = 5;
      if (item.condition === 'new') points = 10;
      else if (item.condition === 'like new') points = 8;
      else if (item.condition === 'good') points = 6;
      
      // Random User & City
      const randomUser = userDocs[Math.floor(Math.random() * userDocs.length)];
      const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];

      const newItem = new Item({
        title: item.title,
        description: item.desc,
        images: [item.image], // Array mein image
        category: item.category,
        type: item.type,
        brand: item.brand,
        color: item.color,
        size: item.category === 'shoes' ? '9' : 'M', // Basic logic
        condition: item.condition,
        pointsValue: points,
        status: 'approved',
        uploader: randomUser._id,
        locationName: randomCity.name,
        tags: [item.category, item.condition, "verified"],
        location: {
          type: 'Point',
          coordinates: [randomCity.lon, randomCity.lat]
        }
      });

      await newItem.save();
      itemDocs.push(newItem);
    }

    console.log('\n=======================================');
    console.log('✅ SEEDING COMPLETE WITH NO ERRORS');
    console.log('=======================================');
    console.log('🔑 Admin Login:  admin@gmail.com / admin123');
    console.log(`🔑 User Login:   rohan@example.com / ${COMMON_PASS}`);
    console.log(`📦 Total Items:  ${itemDocs.length}`);
    console.log('=======================================');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error Seeding Data:', error);
    process.exit(1);
  }
};

seed();