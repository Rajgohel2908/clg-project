import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layouts/Layout';
import ItemCard from '../components/common/ItemCard';
import Button from '../components/ui/Button';
import { itemService } from '../services/itemService';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { motion } from 'framer-motion'; // Animation ke liye import kiya

const Landing = () => {
  const { user } = useAuth();
  const { openAuthModal } = useUI();
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedItems();
  }, []);

  const fetchFeaturedItems = async () => {
    try {
      const data = await itemService.getAllItems({ limit: 6 });
      const items = Array.isArray(data) ? data : (data?.items || []);
      setFeaturedItems(items);
    } catch (error) {
      console.error('Error fetching featured items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen relative overflow-hidden">
        
        {/* --- WATER DROP BLURRY BACKGROUND ANIMATION --- */}
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          {/* Top Left Blob */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1], 
              rotate: [0, 90, 0],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-green-200/40 rounded-full blur-3xl mix-blend-multiply filter"
          />
          
          {/* Bottom Right Blob */}
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1], 
              rotate: [0, -60, 0],
              x: [0, -50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] -right-[10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply filter"
          />

          {/* Bottom Left Blob */}
          <motion.div 
            animate={{ 
              scale: [1, 1.1, 1], 
              x: [0, 30, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] left-[10%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply filter"
          />
        </div>

        {/* --- HERO SECTION --- */}
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36 text-center">
            
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight"
              >
                Sustainable Fashion
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500 drop-shadow-sm mt-2">
                  Through Community Swaps
                </span>
              </motion.h1>
              
              <motion.p 
                variants={fadeInUp}
                className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
              >
                Exchange unused clothing and reduce textile waste. Join our community of eco-conscious fashion lovers.
              </motion.p>
              
              <motion.div 
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/items">
                  <Button size="large" className="shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all transform hover:-translate-y-1">
                    Browse Items
                  </Button>
                </Link>
                
                {!user && (
                  <Button 
                    variant="outline" 
                    size="large" 
                    onClick={() => openAuthModal('signup')}
                    className="bg-white/50 backdrop-blur-sm border-gray-300 hover:bg-white transition-all transform hover:-translate-y-1"
                  >
                    Join Community
                  </Button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* --- FEATURES SECTION --- */}
        <div className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose ReWear?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                We're building a sustainable fashion ecosystem where quality meets community.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  color: "green",
                  title: "Sustainable Fashion",
                  desc: "Reduce textile waste by giving clothes a second life through community swaps.",
                  icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                },
                {
                  color: "blue",
                  title: "Community Driven",
                  desc: "Connect with like-minded fashion enthusiasts in your local community.",
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                },
                {
                  color: "purple",
                  title: "Quality Assured",
                  desc: "All items are verified and rated by our community for quality and condition.",
                  icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -10 }}
                  className="text-center p-8 bg-white/60 backdrop-blur-lg rounded-3xl border border-white/50 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner`}>
                    <svg className={`w-8 h-8 text-${feature.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* --- FEATURED ITEMS SECTION --- */}
        <div className="py-24 bg-white/50 backdrop-blur-sm relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Items</h2>
              <p className="text-lg text-gray-600">
                Discover amazing pieces available for swap right now.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : featuredItems.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items available</h3>
                <p className="text-gray-600">Check back soon for new listings!</p>
              </div>
            ) : (
              <>
                <motion.div 
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={staggerContainer}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                >
                  {featuredItems.map((item) => (
                    <motion.div key={item._id} variants={fadeInUp}>
                      <ItemCard item={item} />
                    </motion.div>
                  ))}
                </motion.div>
                <div className="text-center">
                  <Link to="/items">
                    <Button size="large" variant="outline" className="bg-white hover:bg-gray-50">
                      View All Items
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* --- CTA SECTION --- */}
        {!user && (
          <div className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-green-600 -z-10"></div>
            {/* Overlay pattern or effect */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Start Swapping?
              </h2>
              <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
                Join thousands of fashion lovers making a positive impact on the environment today.
              </p>
              <Button 
                size="large" 
                className="bg-white text-green-700 hover:bg-green-50 shadow-xl border-none text-lg px-8 py-4 font-bold"
                onClick={() => openAuthModal('signup')}
              >
                Get Started Today
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Landing;