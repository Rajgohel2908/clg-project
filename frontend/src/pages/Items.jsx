import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../layouts/Layout';
import ItemCard from '../components/common/ItemCard';
import FilterBar from '../components/items/FilterBar';
import { itemService } from '../services/itemService';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    condition: '',
    type: '',
    search: '',
  });

  const fetchItems = useCallback(async (opts = { page: 1, append: false }) => {
    const { page: reqPage = 1, append = false } = opts;
    try {
      if (append) setLoadingMore(true); else setLoading(true);
      const data = await itemService.getAllItems({ ...filters, page: reqPage });
      const fetchedItems = data.items || data || [];
      if (append) {
        setItems(prev => [...prev, ...fetchedItems]);
      } else {
        setItems(fetchedItems);
      }
      setPage(data.currentPage || reqPage);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filters]);

  useEffect(() => {
    // whenever filters change, load page 1
    fetchItems({ page: 1, append: false });
  }, [fetchItems]);

  const clearFilters = () => {
    setFilters({
      category: '',
      condition: '',
      type: '',
      search: '',
    });
  };

  const handleLoadMore = () => {
    if (page >= totalPages) return;
    const next = page + 1;
    fetchItems({ page: next, append: true });
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Items</h1>
            <p className="text-gray-600">Discover amazing items available for swap in our community.</p>
          </div>

          {/* Filters */}
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            onClear={clearFilters}
          />

          {/* Items Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                  <ItemCard key={item._id} item={item} />
                ))}
              </div>
              {page < totalPages && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    {loadingMore ? 'Loading...' : 'Load more'}
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