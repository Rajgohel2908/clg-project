require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Item = require('../models/Item');
const Swap = require('../models/Swap');
const Notification = require('../models/Notification');

const seedLargeData = async () => {
    try {
        // 1. Database Connection
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined in .env');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📦 MongoDB Connected...');

        // 2. Clear Old Data
        console.log('🧹 Cleaning database...');
        await Promise.all([
            User.deleteMany({}),
            Item.deleteMany({}),
            Swap.deleteMany({}),
            Notification.deleteMany({})
        ]);

        // 3. Create 10 Real Users
        console.log('👤 Creating 10 Users...');
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);

        const usersData = [
            { name: 'Raj Gohel', email: 'raj@rewear.com', role: 'admin', points: 500 },
            { name: 'Priya Sharma', email: 'priya@rewear.com', role: 'user', points: 150 },
            { name: 'Amit Patel', email: 'amit@rewear.com', role: 'user', points: 80 },
            { name: 'Sneha Gupta', email: 'sneha@rewear.com', role: 'user', points: 200 },
            { name: 'Rahul Verma', email: 'rahul@rewear.com', role: 'user', points: 40 },
            { name: 'Anjali Singh', email: 'anjali@rewear.com', role: 'user', points: 120 },
            { name: 'Vikram Malhotra', email: 'vikram@rewear.com', role: 'user', points: 60 },
            { name: 'Neha Kapoor', email: 'neha@rewear.com', role: 'user', points: 300 },
            { name: 'Arjun Reddy', email: 'arjun@rewear.com', role: 'user', points: 90 },
            { name: 'Kavita Iyer', email: 'kavita@rewear.com', role: 'user', points: 110 }
        ];

        const createdUsers = await User.insertMany(usersData.map(u => ({ ...u, password })));
        console.log(`✓ ${createdUsers.length} Users created.`);

        const getRandomUser = () => createdUsers[Math.floor(Math.random() * createdUsers.length)]._id;
        
        const getRandomLocation = () => {
            const cities = [
                { name: 'Mumbai, Maharashtra', coords: [72.8777, 19.0760] },
                { name: 'Delhi, NCR', coords: [77.1025, 28.7041] },
                { name: 'Bangalore, Karnataka', coords: [77.5946, 12.9716] },
                { name: 'Ahmedabad, Gujarat', coords: [72.5714, 23.0225] },
                { name: 'Pune, Maharashtra', coords: [73.8567, 18.5204] },
                { name: 'Jaipur, Rajasthan', coords: [75.7873, 26.9124] },
                { name: 'Surat, Gujarat', coords: [72.8311, 21.1702] },
                { name: 'Bhavnagar, Gujarat', coords: [72.1502, 21.7645] }
            ];
            const city = cities[Math.floor(Math.random() * cities.length)];
            return {
                name: city.name,
                geo: { type: 'Point', coordinates: [city.coords[0] + Math.random() * 0.05, city.coords[1] + Math.random() * 0.05] }
            };
        };

        // 4. Create Items (Using lowercase categories to match AddItem.jsx)
        console.log('👕 Creating 50 Items...');
        
        const itemsList = [
            // --- clothing ---
            {
                title: 'Vintage Denim Jacket',
                description: 'Classic blue denim jacket, slightly distressed. Men\'s size M.',
                category: 'clothing', type: 'Jacket', condition: 'good', pointsValue: 15,
                images: ['https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Red Flannel Shirt',
                description: 'Checkered flannel shirt, very warm. Size L.',
                category: 'clothing', type: 'Shirt', condition: 'like new', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Floral Summer Dress',
                description: 'Light and breezy floral dress. Knee-length.',
                category: 'clothing', type: 'Dress', condition: 'like new', pointsValue: 18,
                images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Silk Saree with Border',
                description: 'Traditional red silk saree. Worn once for a wedding.',
                category: 'clothing', type: 'Ethnic', condition: 'like new', pointsValue: 40,
                images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Beige Trench Coat',
                description: 'Classic trench coat for winters. Very stylish.',
                category: 'clothing', type: 'Coat', condition: 'good', pointsValue: 30,
                images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Kids Denim Overalls',
                description: 'Cute dungarees for 3-4 year olds.',
                category: 'clothing', type: 'Kids', condition: 'good', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'White Cotton T-Shirt',
                description: 'Basic white tee, 100% cotton. Brand new.',
                category: 'clothing', type: 'T-Shirt', condition: 'new', pointsValue: 8,
                images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Black Slim Jeans',
                description: 'Men\'s black denim jeans, size 32.',
                category: 'clothing', type: 'Jeans', condition: 'good', pointsValue: 12,
                images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Grey Hoodie',
                description: 'Unisex grey hoodie, fleece lined.',
                category: 'clothing', type: 'Hoodie', condition: 'fair', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Kids Yellow Raincoat',
                description: 'Waterproof raincoat for age 6.',
                category: 'clothing', type: 'Kids', condition: 'like new', pointsValue: 12,
                images: ['https://images.unsplash.com/photo-1623602927233-a3b04394e773?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Formal Navy Blazer',
                description: 'Men\'s formal blazer, size 40.',
                category: 'clothing', type: 'Blazer', condition: 'like new', pointsValue: 25,
                images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Yoga Leggings',
                description: 'Women\'s black gym leggings. Size M.',
                category: 'clothing', type: 'Activewear', condition: 'good', pointsValue: 8,
                images: ['https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?auto=format&fit=crop&w=600&q=80']
            },

            // --- shoes ---
            {
                title: 'Nike Running Shoes',
                description: 'Black sports shoes, size 9. Good condition.',
                category: 'shoes', type: 'Sneakers', condition: 'good', pointsValue: 20,
                images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Brown Leather Boots',
                description: 'Men\'s rugged boots, size 10.',
                category: 'shoes', type: 'Boots', condition: 'fair', pointsValue: 25,
                images: ['https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'White Converse',
                description: 'Classic Chuck Taylors. Size 8.',
                category: 'shoes', type: 'Sneakers', condition: 'fair', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1607522370275-f14206abe5d3?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Black High Heels',
                description: 'Elegant stilettos for parties. Size 7.',
                category: 'shoes', type: 'Heels', condition: 'like new', pointsValue: 22,
                images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Formal Oxfords',
                description: 'Tan leather office shoes. Size 9.',
                category: 'shoes', type: 'Formal', condition: 'good', pointsValue: 18,
                images: ['https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Kids Velcro Sneakers',
                description: 'Easy wear shoes for kids.',
                category: 'shoes', type: 'Kids', condition: 'good', pointsValue: 8,
                images: ['https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Running Trainers',
                description: 'Blue athletic shoes, barely used.',
                category: 'shoes', type: 'Sneakers', condition: 'like new', pointsValue: 22,
                images: ['https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Summer Sandals',
                description: 'Comfortable flat sandals.',
                category: 'shoes', type: 'Sandals', condition: 'good', pointsValue: 8,
                images: ['https://images.unsplash.com/photo-1562273138-f46be4ebdf6c?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Hiking Boots',
                description: 'Sturdy boots for trekking. Size 11.',
                category: 'shoes', type: 'Boots', condition: 'good', pointsValue: 30,
                images: ['https://images.unsplash.com/photo-1520048480367-7a6a4b6efb2a?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Red Slip-ons',
                description: 'Casual canvas slip-on shoes.',
                category: 'shoes', type: 'Casual', condition: 'new', pointsValue: 12,
                images: ['https://images.unsplash.com/photo-1463100099107-aa0980c362e6?auto=format&fit=crop&w=600&q=80']
            },

            // --- accessories ---
            {
                title: 'RayBan Aviators',
                description: 'Original gold frame sunglasses.',
                category: 'accessories', type: 'Eyewear', condition: 'like new', pointsValue: 25,
                images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Gold Necklace',
                description: 'Minimalist gold plated chain.',
                category: 'accessories', type: 'Jewelry', condition: 'new', pointsValue: 15,
                images: ['https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Casio Digital Watch',
                description: 'Retro silver digital watch.',
                category: 'accessories', type: 'Watch', condition: 'good', pointsValue: 12,
                images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Leather Wallet',
                description: 'Men\'s dark brown bi-fold wallet.',
                category: 'accessories', type: 'Wallet', condition: 'new', pointsValue: 15,
                images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Winter Scarf',
                description: 'Checkered wool scarf.',
                category: 'accessories', type: 'Scarf', condition: 'new', pointsValue: 8,
                images: ['https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Baseball Cap',
                description: 'Black cap with NY logo.',
                category: 'accessories', type: 'Hat', condition: 'good', pointsValue: 5,
                images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Leather Belt',
                description: 'Genuine leather belt, black.',
                category: 'accessories', type: 'Belt', condition: 'good', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Silver Earrings',
                description: 'Small hoop earrings, sterling silver.',
                category: 'accessories', type: 'Jewelry', condition: 'like new', pointsValue: 12,
                images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80']
            },

            // --- bags ---
            {
                title: 'Leather Backpack',
                description: 'Vintage brown leather backpack. Fits 15" laptop.',
                category: 'bags', type: 'Backpack', condition: 'good', pointsValue: 30,
                images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Canvas Tote Bag',
                description: 'Eco-friendly shopping tote with print.',
                category: 'bags', type: 'Tote', condition: 'new', pointsValue: 5,
                images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Travel Suitcase',
                description: 'Blue cabin luggage, hard shell.',
                category: 'bags', type: 'Luggage', condition: 'fair', pointsValue: 20,
                images: ['https://images.unsplash.com/photo-1565026057447-bc072a8713d7?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Crossbody Bag',
                description: 'Small black crossbody bag for daily use.',
                category: 'bags', type: 'Handbag', condition: 'like new', pointsValue: 18,
                images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Gym Duffle Bag',
                description: 'Spacious bag for gym clothes and shoes.',
                category: 'bags', type: 'Duffle', condition: 'good', pointsValue: 12,
                images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Laptop Messenger Bag',
                description: 'Professional grey messenger bag.',
                category: 'bags', type: 'Messenger', condition: 'like new', pointsValue: 22,
                images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80']
            },

            // --- other ---
            {
                title: 'Wireless Headphones',
                description: 'Over-ear noise cancelling headphones.',
                category: 'other', type: 'Electronics', condition: 'good', pointsValue: 35,
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Harry Potter Books',
                description: 'Set of first 3 books. Paperback.',
                category: 'other', type: 'Books', condition: 'good', pointsValue: 20,
                images: ['https://images.unsplash.com/photo-1610466024868-90d350d74b64?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Acoustic Guitar',
                description: 'Yamaha guitar. Good for beginners.',
                category: 'other', type: 'Music', condition: 'good', pointsValue: 50,
                images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Mechanical Keyboard',
                description: 'RGB gaming keyboard, blue switches.',
                category: 'other', type: 'Electronics', condition: 'like new', pointsValue: 40,
                images: ['https://images.unsplash.com/photo-1587829741301-dc798b91add1?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Ceramic Plant Pots',
                description: 'Set of 3 white pots for home decor.',
                category: 'other', type: 'Home', condition: 'new', pointsValue: 15,
                images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Yoga Mat',
                description: 'Purple anti-slip mat.',
                category: 'other', type: 'Sports', condition: 'good', pointsValue: 8,
                images: ['https://images.unsplash.com/photo-1599447292180-45fd84092ef0?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Polaroid Camera',
                description: 'Instant film camera. Fun for parties.',
                category: 'other', type: 'Electronics', condition: 'good', pointsValue: 30,
                images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Atomic Habits Book',
                description: 'Best selling self-help book.',
                category: 'other', type: 'Books', condition: 'like new', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Bluetooth Speaker',
                description: 'Waterproof portable speaker.',
                category: 'other', type: 'Electronics', condition: 'good', pointsValue: 15,
                images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Skateboard',
                description: 'Street skateboard with graphic.',
                category: 'other', type: 'Sports', condition: 'fair', pointsValue: 20,
                images: ['https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'LED Desk Lamp',
                description: 'Adjustable study lamp.',
                category: 'other', type: 'Home', condition: 'good', pointsValue: 10,
                images: ['https://images.unsplash.com/photo-1534073828943-f801091a7d58?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Tennis Racket',
                description: 'Wilson racket with cover.',
                category: 'other', type: 'Sports', condition: 'fair', pointsValue: 15,
                images: ['https://images.unsplash.com/photo-1617083934555-ac7d4fee8909?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Smart Watch',
                description: 'Fitness tracker watch.',
                category: 'other', type: 'Electronics', condition: 'fair', pointsValue: 20,
                images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80']
            },
            {
                title: 'Vinyl Records',
                description: 'Collection of old rock records.',
                category: 'other', type: 'Music', condition: 'fair', pointsValue: 40,
                images: ['https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=600&q=80']
            }
        ];

        const itemDocs = [];
        
        for (const item of itemsList) {
            const locData = getRandomLocation();
            const status = Math.random() > 0.1 ? 'approved' : 'pending'; 

            itemDocs.push({
                ...item,
                uploader: getRandomUser(),
                status: status,
                locationName: locData.name,
                location: locData.geo,
                // Add tags based on properties for search
                tags: [item.category.toLowerCase(), item.condition, item.type.toLowerCase(), 'swap'],
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) 
            });
        }

        await Item.insertMany(itemDocs);
        console.log(`✓ ${itemDocs.length} Items seeded successfully with lowercase categories (matches AddItem.jsx).`);

        console.log('\n=============================================');
        console.log('🎉 DATABASE SEEDED SUCCESSFULLY');
        console.log('=============================================');
        console.log('Use these credentials to login (Password: password123):');
        console.log('1. raj@rewear.com (Admin)');
        console.log('2. priya@rewear.com (User)');
        console.log('3. amit@rewear.com (User)');
        console.log('=============================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedLargeData();