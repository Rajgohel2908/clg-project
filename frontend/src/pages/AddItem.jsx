import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import Button from '../components/ui/Button';
import { itemService } from '../services/itemService';
import toast from 'react-hot-toast'; // Make sure to install/import toast if used, otherwise replace with alert

const AddItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // 👇 Updated State with Location Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: '',
    condition: '',
    size: '',
    brand: '',
    color: '',
    tags: '',
    pointsValue: 10,
    images: [],
    latitude: '',
    longitude: '',
    locationName: ''
  });
  
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate points based on condition
    if (name === 'condition') {
      let points = 5; // default
      switch(value) {
        case 'new': points = 10; break;
        case 'like new': points = 8; break;
        case 'good': points = 6; break;
        case 'fair': points = 4; break;
        default: points = 5;
      }
      setFormData(prev => ({
        ...prev,
        [name]: value,
        pointsValue: points
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // 📍 Location Logic 1: GPS
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lon
        }));

        // Reverse Geocoding to get name
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();
          const address = data.address;
          const city = address.city || address.town || address.village || address.suburb || "Unknown Location";
          const state = address.state || "";
          const formattedLocation = `${city}${state ? `, ${state}` : ''}`;

          setFormData(prev => ({ ...prev, locationName: formattedLocation }));
          alert("Location Detected: " + formattedLocation);
        } catch (error) {
          setFormData(prev => ({ ...prev, locationName: "GPS Location Captured" }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        console.error(error);
        alert("Unable to retrieve location.");
      }
    );
  };

  // 🔍 Location Logic 2: Manual Search
  const searchLocation = async () => {
    if (!formData.locationName.trim()) {
      alert("Please enter a city name to search");
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.locationName)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        setFormData(prev => ({
          ...prev,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          locationName: result.display_name.split(',').slice(0, 2).join(',') 
        }));
        alert("Location Found! Coordinates updated.");
      } else {
        alert("Location not found. Try a major city name.");
      }
    } catch (error) {
      console.error(error);
      alert("Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData(prev => ({
      ...prev,
      images: files
    }));

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setImagePreviews(newPreviews);
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (formData.images.length === 0) newErrors.images = 'At least one image is required';
    } else if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    } else if (step === 3) {
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.condition) newErrors.condition = 'Condition is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const submitData = new FormData();

      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && formData[key]) {
          submitData.append(key, formData[key]);
        }
      });

      // Add images
      formData.images.forEach((image) => {
        submitData.append('images', image);
      });

      await itemService.createItem(submitData);
      alert('Item submitted for review! Admin will approve it shortly.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating item:', error);
      setErrors({ submit: 'Failed to create item. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 4) * 100;
  };

  return (
    <Layout>
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Item</h1>
            <p className="text-gray-600">List your item for swapping or redemption</p>
          </div>

          <div className="bg-white shadow-sm rounded-lg">
            {/* Progress Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of 4: {
                    currentStep === 1 ? 'Upload Images' :
                    currentStep === 2 ? 'Item Details' :
                    currentStep === 3 ? 'Specifications' :
                    'Review & Submit'
                  }
                </span>
                <span className="text-sm text-gray-500">{getProgressPercentage()}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>

            <div className="px-6 py-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                    {errors.submit}
                  </div>
                )}

                {/* Step 1: Upload Images */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Images</h3>
                      <p className="text-sm text-gray-600 mb-4">Add up to 5 clear photos of your item. The first image will be the cover photo.</p>
                    </div>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                      <input
                        type="file"
                        id="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label htmlFor="images" className="cursor-pointer">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-900">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB (Max 5 images)</p>
                      </label>
                    </div>
                    {errors.images && <p className="text-sm text-red-600">{errors.images}</p>}

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            {index === 0 && (
                              <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                                Cover
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Item Details - LOCATION ADDED HERE */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Item Details</h3>
                      <p className="text-sm text-gray-600 mb-4">Provide a clear title and detailed description of your item.</p>
                    </div>

                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Blue Cotton T-Shirt - Brand New"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={5}
                        value={formData.description}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                          errors.description ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Describe your item in detail: material, color, style, any wear or defects, why you're swapping it, etc."
                      />
                      <p className="mt-1 text-sm text-gray-500">{formData.description.length} characters (min 20)</p>
                      {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                    </div>

                    {/* 👇👇 NEW LOCATION FIELD INJECTED HERE TO MATCH UI 👇👇 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location (City/Area)
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          name="locationName"
                          value={formData.locationName}
                          onChange={handleChange}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="Enter city (e.g. Bhavnagar) or use Auto-Detect"
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={searchLocation}
                                disabled={searchLoading}
                                className="whitespace-nowrap px-3"
                            >
                                {searchLoading ? '...' : '🔍 Find'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={getLocation}
                                disabled={locationLoading}
                                className="whitespace-nowrap px-3"
                                title="Use GPS"
                            >
                                {locationLoading ? '...' : '📍 Auto'}
                            </Button>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.latitude 
                            ? `✅ Coordinates locked: ${parseFloat(formData.latitude).toFixed(4)}, ${parseFloat(formData.longitude).toFixed(4)}` 
                            : "Helps users find items near them."}
                      </p>
                    </div>
                    {/* 👆👆 END LOCATION FIELD 👆👆 */}

                    <div>
                      <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (Optional)
                      </label>
                      <input
                        type="text"
                        id="tags"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., vintage, summer, casual (comma-separated)"
                      />
                      <p className="mt-1 text-sm text-gray-500">Add relevant tags like brand, style, color, etc. (max 10 tags)</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Specifications */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Item Specifications</h3>
                      <p className="text-sm text-gray-600 mb-4">Provide specific details about your item's category, size, and condition.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                            errors.category ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select category</option>
                          <option value="clothing">Clothing</option>
                          <option value="shoes">Shoes</option>
                          <option value="accessories">Accessories</option>
                          <option value="bags">Bags</option>
                          <option value="other">Other</option>
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                      </div>

                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                          Type/Subtype
                        </label>
                        <input
                          type="text"
                          id="type"
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., T-shirt, Jeans, Sneakers"
                        />
                      </div>

                      <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                          Condition *
                        </label>
                        <select
                          id="condition"
                          name="condition"
                          value={formData.condition}
                          onChange={handleChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                            errors.condition ? 'border-red-300' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select condition</option>
                          <option value="new">New - Never worn</option>
                          <option value="like new">Like New - Worn once or twice</option>
                          <option value="good">Good - Gently used</option>
                          <option value="fair">Fair - Shows signs of wear</option>
                        </select>
                        {errors.condition && <p className="mt-1 text-sm text-red-600">{errors.condition}</p>}
                      </div>

                      <div>
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                          Size
                        </label>
                        <input
                          type="text"
                          id="size"
                          name="size"
                          value={formData.size}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., M, 32, 8, One Size"
                        />
                      </div>

                      <div>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                          Brand
                        </label>
                        <input
                          type="text"
                          id="brand"
                          name="brand"
                          value={formData.brand}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Nike, Zara, H&M"
                        />
                      </div>

                      <div>
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          id="color"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                          placeholder="e.g., Blue, Black, Multi-color"
                        />
                      </div>

                      <div>
                        <label htmlFor="pointsValue" className="block text-sm font-medium text-gray-700 mb-1">
                          Point Value
                        </label>
                        <input
                          type="number"
                          id="pointsValue"
                          name="pointsValue"
                          value={formData.pointsValue}
                          onChange={handleChange}
                          min="1"
                          max="20"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Auto-calculated based on condition (1-20 points). You can adjust if needed.
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-blue-800 mb-1">Point Value Guide:</p>
                          <ul className="text-xs text-blue-700 space-y-1">
                            <li>• <strong>New (10 points):</strong> Never worn, with tags</li>
                            <li>• <strong>Like New (8 points):</strong> Worn 1-2 times, perfect condition</li>
                            <li>• <strong>Good (6 points):</strong> Gently used, minimal wear</li>
                            <li>• <strong>Fair (4 points):</strong> Shows signs of wear, still functional</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Your Listing</h3>
                      <p className="text-sm text-gray-600 mb-4">Please review all details before submitting your item for approval.</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Images</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {imagePreviews.map((preview, index) => (
                              <img key={index} src={preview} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded" />
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Title</p>
                            <p className="text-gray-900">{formData.title}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Category</p>
                            <p className="text-gray-900 capitalize">{formData.category}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Condition</p>
                            <p className="text-gray-900 capitalize">{formData.condition}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Point Value</p>
                            <p className="text-green-600 font-semibold text-lg">{formData.pointsValue} points</p>
                          </div>
                          {formData.brand && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Brand</p>
                              <p className="text-gray-900">{formData.brand}</p>
                            </div>
                          )}
                          {formData.size && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Size</p>
                              <p className="text-gray-900">{formData.size}</p>
                            </div>
                          )}
                          {formData.color && (
                            <div>
                              <p className="text-sm font-medium text-gray-600">Color</p>
                              <p className="text-gray-900">{formData.color}</p>
                            </div>
                          )}
                          {/* Location in Review */}
                          <div>
                            <p className="text-sm font-medium text-gray-600">Location</p>
                            <p className="text-gray-900">{formData.locationName || (formData.latitude ? "Coordinates Captured" : "Not Provided")}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
                        <p className="text-gray-700 text-sm">{formData.description}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Your item will be submitted for admin review. Once approved, it will be visible to all users for swapping.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prevStep}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                    >
                      Cancel
                    </Button>
                  )}

                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                    >
                      Next
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      loading={loading}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Submit for Review
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddItem;