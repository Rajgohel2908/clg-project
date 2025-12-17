import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { swapService } from '../services/swapService';
import Layout from '../layouts/Layout';

const SwapDetail = () => {
    const { id } = useParams();
    const [swap, setSwap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSwap = async () => {
            try {
                setLoading(true);
                const data = await swapService.getSwapDetails(id);
                setSwap(data);
            } catch (error) {
                console.error('Error fetching swap details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSwap();
    }, [id]);

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/150';
        return img.startsWith('http') ? img : `http://localhost:5000/uploads/${img}`;
    };

    if (loading) {
        return <Layout><div>Loading...</div></Layout>;
    }

    if (!swap) {
        return <Layout><div>Swap not found.</div></Layout>;
    }

    return (
        <Layout>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Swap Details</h1>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <p><strong>Status:</strong> {swap.status}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <h2 className="text-xl font-semibold">Item Requested</h2>
                            <img src={getImageUrl(swap.itemRequested.images[0])} alt={swap.itemRequested.title} className="w-full h-48 object-cover mt-2" />
                            <p><strong>Title:</strong> {swap.itemRequested.title}</p>
                            <p><strong>Description:</strong> {swap.itemRequested.description}</p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Item Offered</h2>
                            <img src={getImageUrl(swap.itemOffered.images[0])} alt={swap.itemOffered.title} className="w-full h-48 object-cover mt-2" />
                            <p><strong>Title:</strong> {swap.itemOffered.title}</p>
                            <p><strong>Description:</strong> {swap.itemOffered.description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SwapDetail;
