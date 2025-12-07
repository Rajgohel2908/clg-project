import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/Layout';
import { itemService } from '../services/itemService';
import { motion, AnimatePresence } from 'framer-motion';

// --- UI COMPONENTS (Moved OUTSIDE the main component to fix focus issue) ---

const InputGroup = ({ label, error, children, subtext }) => (
  <div className="mb-5">
    <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{label}</label>
    {children}
    {subtext && <p className="text-xs text-gray-400 mt-1 ml-1">{subtext}</p>}
    {error && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">⚠️ {error}</p>}
  </div>
);

const ModernInput = (props) => (
  <input 
    {...props} 
    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-gray-900 placeholder-gray-400"
  />
);

const ModernSelect = (props) => (
  <div className="relative">
    <select {...props} className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none appearance-none text-gray-900 cursor-pointer">
      {props.children}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const AddItem = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-calculate points logic
    if (name === 'condition') {
      let points = 5;
      switch(value) {
        case 'new': points = 10; break;
        case 'like new': points = 8; break;
        case 'good': points = 6; break;
        case 'fair': points = 4; break;
        default: points = 5;
      }
      setFormData(prev => ({ ...prev, [name]: value, pointsValue: points }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear errors
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setFormData(prev => ({ ...prev, latitude: lat, longitude: lon }));
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          const data = await response.json();
          const address = data.address;
          const city = address.city || address.town || address.village || address.suburb || "Unknown Location";
          const state = address.state || "";
          setFormData(prev => ({ ...prev, locationName: `${city}${state ? `, ${state}` : ''}` }));
        } catch (error) {
          setFormData(prev => ({ ...prev, locationName: "GPS Location Captured" }));
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        alert("Unable to retrieve location.");
      }
    );
  };

  const searchLocation = async () => {
    if (!formData.locationName.trim()) {
      alert("Please enter a city name");
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
      } else {
        alert("Location not found.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    setFormData(prev => ({ ...prev, images: files }));
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
    if (step === 1 && formData.images.length === 0) newErrors.images = 'At least one image is required';
    if (step === 2) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
    }
    if (step === 3) {
      if (!formData.category) newErrors.category = 'Category is required';
      if (!formData.condition) newErrors.condition = 'Condition is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep(currentStep)) setCurrentStep(prev => prev + 1); };
  const prevStep = () => { setCurrentStep(prev => prev - 1); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'images' && formData[key]) submitData.append(key, formData[key]);
      });
      formData.images.forEach(image => submitData.append('images', image));
      await itemService.createItem(submitData);
      alert('Item submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      setErrors({ submit: 'Failed to create item.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gray-50/50 min-h-screen py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors font-medium">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">List an Item</h1>
            <div className="w-16"></div>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Progress Bar */}
            <div className="bg-gray-50/80 px-8 py-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-gray-800">Step {currentStep} of 4</span>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  {currentStep === 1 ? 'Photos' : currentStep === 2 ? 'Details' : currentStep === 3 ? 'Specs' : 'Review'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / 4) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    
                    {/* STEP 1: IMAGES */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center mb-8">
                          <h2 className="text-xl font-bold text-gray-900">Upload Photos</h2>
                          <p className="text-gray-500 text-sm mt-1">Showcase your item with clear images</p>
                        </div>

                        <div className="relative group">
                          <input type="file" id="images" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                          <label htmlFor="images" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50/50 hover:bg-green-50/50 hover:border-green-400 transition-all duration-300 group-hover:shadow-sm">
                            <div className="p-4 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">Click to upload or drag & drop</p>
                            <p className="text-xs text-gray-400 mt-1">Max 5 photos (JPG, PNG)</p>
                          </label>
                        </div>
                        {errors.images && <p className="text-red-500 text-sm text-center font-medium animate-pulse">{errors.images}</p>}

                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
                            {imagePreviews.map((preview, index) => (
                              <div key={index} className="relative group rounded-xl overflow-hidden shadow-sm aspect-square bg-gray-100">
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-red-500/90 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                {index === 0 && <span className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center py-1 font-medium backdrop-blur-sm">Cover</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 2: DETAILS */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <div className="text-center mb-6">
                          <h2 className="text-xl font-bold text-gray-900">Basic Details</h2>
                          <p className="text-gray-500 text-sm">Tell us what you're listing</p>
                        </div>

                        <InputGroup label="Title *" error={errors.title}>
                          <ModernInput type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Vintage Denim Jacket" />
                        </InputGroup>

                        <InputGroup label="Description *" error={errors.description} subtext={`${formData.description.length} characters (min 20)`}>
                          <textarea 
                            name="description" rows={4} value={formData.description} onChange={handleChange}
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-gray-900 placeholder-gray-400 resize-none"
                            placeholder="Describe condition, material, fit..."
                          />
                        </InputGroup>

                        <InputGroup label="Location">
                          <div className="flex gap-2">
                            <ModernInput type="text" name="locationName" value={formData.locationName} onChange={handleChange} placeholder="City or Area" />
                            <button type="button" onClick={searchLocation} disabled={searchLoading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 transition-colors">
                              {searchLoading ? '...' : '🔍'}
                            </button>
                            <button type="button" onClick={getLocation} disabled={locationLoading} className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl transition-colors font-medium">
                              {locationLoading ? '...' : '📍 Auto'}
                            </button>
                          </div>
                        </InputGroup>

                        <InputGroup label="Tags (Optional)">
                          <ModernInput type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="summer, casual, zara" />
                        </InputGroup>
                      </div>
                    )}

                    {/* STEP 3: SPECS */}
                    {currentStep === 3 && (
                      <div className="space-y-5">
                        <div className="text-center mb-6">
                          <h2 className="text-xl font-bold text-gray-900">Specifications</h2>
                          <p className="text-gray-500 text-sm">Help others find your item</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <InputGroup label="Category *" error={errors.category}>
                            <ModernSelect name="category" value={formData.category} onChange={handleChange}>
                              <option value="">Select Category</option>
                              <option value="clothing">Clothing</option>
                              <option value="shoes">Shoes</option>
                              <option value="accessories">Accessories</option>
                              <option value="bags">Bags</option>
                              <option value="other">Other</option>
                            </ModernSelect>
                          </InputGroup>

                          <InputGroup label="Condition *" error={errors.condition}>
                            <ModernSelect name="condition" value={formData.condition} onChange={handleChange}>
                              <option value="">Select Condition</option>
                              <option value="new">New (Tags on)</option>
                              <option value="like new">Like New (Worn once)</option>
                              <option value="good">Good (Minor wear)</option>
                              <option value="fair">Fair (Visible wear)</option>
                            </ModernSelect>
                          </InputGroup>

                          <InputGroup label="Size">
                            <ModernInput type="text" name="size" value={formData.size} onChange={handleChange} placeholder="e.g. M, 32, 8" />
                          </InputGroup>

                          <InputGroup label="Brand">
                            <ModernInput type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. H&M, Nike" />
                          </InputGroup>

                          <InputGroup label="Color">
                            <ModernInput type="text" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Navy Blue" />
                          </InputGroup>

                          <InputGroup label="Point Value">
                            <div className="relative">
                              <ModernInput type="number" name="pointsValue" value={formData.pointsValue} onChange={handleChange} min="1" max="20" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">PTS</span>
                            </div>
                          </InputGroup>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h2 className="text-xl font-bold text-gray-900">Review & Submit</h2>
                          <p className="text-gray-500 text-sm">Ready to post your listing?</p>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                          <div className="flex gap-4 mb-6">
                            {imagePreviews[0] && (
                              <img src={imagePreviews[0]} alt="Cover" className="w-24 h-24 rounded-xl object-cover shadow-sm bg-white" />
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{formData.title}</h3>
                              <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 capitalize">{formData.category}</span>
                                <span className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs font-medium text-gray-600 capitalize">{formData.condition}</span>
                              </div>
                              <div className="mt-2 text-green-600 font-bold text-sm">{formData.pointsValue} Points</div>
                            </div>
                          </div>
                          
                          <div className="space-y-3 text-sm border-t border-gray-200 pt-4">
                            <div className="flex justify-between"><span className="text-gray-500">Location</span> <span className="font-medium text-gray-900 truncate max-w-[200px]">{formData.locationName || 'N/A'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Brand</span> <span className="font-medium text-gray-900">{formData.brand || '-'}</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Size</span> <span className="font-medium text-gray-900">{formData.size || '-'}</span></div>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                  {currentStep > 1 ? (
                    <button type="button" onClick={prevStep} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                      Back
                    </button>
                  ) : (
                    <button type="button" onClick={() => navigate('/dashboard')} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  )}

                  {currentStep < 4 ? (
                    <button type="button" onClick={nextStep} className="flex-1 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]">
                      Next Step
                    </button>
                  ) : (
                    <button type="submit" disabled={loading} className="flex-1 py-3.5 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Publish Item'}
                    </button>
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