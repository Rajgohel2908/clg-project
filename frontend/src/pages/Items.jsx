import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layouts/Layout';
import ItemCard from '../components/common/ItemCard';
import FilterBar from '../components/items/FilterBar';
import { itemService } from '../services/itemService';
import { motion } from 'framer-motion';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    type: '',
    search: '',
  });

  const fetchItems = useCallback(async (currPage) => {
    try {
      setLoading(true);
      // Pass page to API
      const data = await itemService.getAllItems({ ...filters, page: currPage, limit: 12 });
      const fetchedItems = data.items || data || [];
      
      setItems(fetchedItems);
      setPage(data.currentPage || currPage);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Reset to page 1 on filter change
    setPage(1);
    fetchItems(1);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchItems(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearFilters = () => {
    setFilters({ category: '', condition: '', type: '', search: '' });
  };

  return (
    <Layout>
      {/* 4. Pure Background with Blurry Touch */}
      <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
        {/* Background Blobs for Premium Feel */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-green-200/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-500">Unique Finds</span>
            </h1>
            <p className="text-gray-500 font-medium">Explore the best swapped items in your community</p>
          </div>

          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearFilters}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
               {[...Array(8)].map((_, i) => (
                 <div key={i} className="h-[400px] bg-white/60 rounded-3xl animate-pulse shadow-sm" />
               ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[3rem] border border-white/60 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
            </div>
          ) : (
            <>
              {/* Items Grid with animation stagger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {items.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ItemCard item={item} />
                  </motion.div>
                ))}
              </div>

              {/* 7. Modern Numbered Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>

                  <div className="flex gap-2 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/50">
                    {[...Array(totalPages)].map((_, i) => {
                        const p = i + 1;
                        return (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={`w-10 h-10 rounded-full font-bold text-sm transition-all relative ${
                                    page === p 
                                    ? 'text-white shadow-lg shadow-green-500/30 scale-110' 
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                                }`}
                            >
                                {page === p && (
                                    <motion.div 
                                        layoutId="page-indicator"
                                        className="absolute inset-0 bg-gradient-to-tr from-green-500 to-teal-500 rounded-full -z-10" 
                                    />
                                )}
                                {p}
                            </button>
                        )
                    })}
                  </div>

                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-3 rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-110"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Items;