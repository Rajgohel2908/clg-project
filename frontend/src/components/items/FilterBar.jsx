import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterBar = ({ filters, onFilterChange, onClear }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isSearchAnimating, setIsSearchAnimating] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    const toggleFilters = () => setIsFilterOpen(!isFilterOpen);

    const handleSearchClick = () => {
        setIsSearchAnimating(true);
        setTimeout(() => setIsSearchAnimating(false), 500); // Reset animation
    };

    return (
        <div className="relative z-50 mb-10 mx-auto max-w-5xl">
            {/* Main Floating Bar (Water Drop Style) */}
            <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center gap-3 p-2 bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full"
            >
                {/* 1. Animated Search Icon & Input */}
                <div className="flex-1 flex items-center relative pl-2">
                    <motion.button
                        onClick={handleSearchClick}
                        animate={isSearchAnimating ? { rotate: 360, scale: 1.2 } : { rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                        className="text-gray-500 p-2 hover:text-green-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </motion.button>
                    <input
                        type="text"
                        name="search"
                        placeholder="Search for treasures..."
                        value={filters.search || ''}
                        onChange={handleChange}
                        className="w-full bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 font-medium ml-2 outline-none"
                    />
                </div>

                {/* 2. Single Attractive Filter Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleFilters}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold tracking-wide transition-all shadow-md ${
                        isFilterOpen 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-200' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                    Filters
                </motion.button>

                {/* 3. Reset Button */}
                {(filters.category || filters.condition || filters.search) && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={onClear}
                        className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                        title="Reset Filters"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </motion.button>
                )}
            </motion.div>

            {/* 6. Filter Menu Animation (Water Drop Dropdown) */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 10, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.2, type: "spring" }}
                        className="absolute top-full right-0 w-full md:w-2/3 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 z-40 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            {/* Category - Classic Blue Tone */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-blue-900/60 uppercase tracking-wider ml-4">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={filters.category || ''}
                                        onChange={handleChange}
                                        className="w-full appearance-none bg-blue-50/50 hover:bg-blue-50 border border-blue-100 rounded-2xl px-6 py-4 text-blue-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer"
                                    >
                                        <option value="">All Categories</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="shoes">Shoes</option>
                                        <option value="accessories">Accessories</option>
                                        <option value="bags">Bags</option>
                                        <option value="other">Other</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Condition - Classic Amber/Gold Tone */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-amber-900/60 uppercase tracking-wider ml-4">Condition</label>
                                <div className="relative">
                                    <select
                                        name="condition"
                                        value={filters.condition || ''}
                                        onChange={handleChange}
                                        className="w-full appearance-none bg-amber-50/50 hover:bg-amber-50 border border-amber-100 rounded-2xl px-6 py-4 text-amber-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all cursor-pointer"
                                    >
                                        <option value="">All Conditions</option>
                                        <option value="new">New (Brand New)</option>
                                        <option value="like new">Like New</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-amber-400 pointer-events-none">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterBar;