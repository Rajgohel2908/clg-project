import React from 'react';
import Button from '../ui/Button';

const FilterBar = ({ filters, onFilterChange, onClear }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ ...filters, [name]: value });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
            {/* Search Input */}
            <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                    type="text"
                    name="search"
                    placeholder="Search items..."
                    value={filters.search || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                    name="category"
                    value={filters.category || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                    <option value="">All Categories</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                </select>
            </div>

            {/* Condition Filter */}
            <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                    name="condition"
                    value={filters.condition || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                    <option value="">All Conditions</option>
                    <option value="new">New</option>
                    <option value="like new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                </select>
            </div>

            {/* Type Filter */}
            <div className="w-full md:w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                    name="type"
                    value={filters.type || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                    <option value="">All Types</option>
                    <option value="Top">Top</option>
                    <option value="Bottom">Bottom</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Accessory">Accessory</option>
                </select>
            </div>

            {/* Clear Button */}
            <div className="w-full md:w-auto">
                <Button variant="secondary" onClick={onClear} className="w-full">
                    Clear
                </Button>
            </div>
        </div>
    );
};

export default FilterBar;
