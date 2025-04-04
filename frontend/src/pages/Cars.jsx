import { useState, useEffect, useMemo } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const Cars = () => {
  const { showNotification } = useNotification();
  const [cars, setCars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [newFeature, setNewFeature] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    type: '',
    fuelType: '',
    pricePerDay: '',
    image: null,
    features: []
  });
  // Add new state for filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    fuelType: '',
    priceRange: '',
    availability: ''
  });
  const [sortBy, setSortBy] = useState('brand'); // brand, price, type

  // Add filtered and sorted cars logic
  const filteredAndSortedCars = useMemo(() => {
    // Ensure cars is always an array
    let result = Array.isArray(cars) ? [...cars] : [];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(car => 
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (filters.type) {
      result = result.filter(car => car.type === filters.type);
    }

    // Apply fuel type filter
    if (filters.fuelType) {
      result = result.filter(car => car.fuelType === filters.fuelType);
    }

    // Apply price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      result = result.filter(car => car.pricePerDay >= min && car.pricePerDay <= max);
    }

    // Apply availability filter
    if (filters.availability !== '') {
      result = result.filter(car => car.isAvailable === (filters.availability === 'true'));
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.pricePerDay - b.pricePerDay;
        case 'type':
          return a.type.localeCompare(b.type);
        case 'brand':
        default:
          return a.brand.localeCompare(b.brand);
      }
    });

    return result;
  }, [cars, searchTerm, filters, sortBy]);

  // Fetch cars on component mount
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Ensure we always set an array
      const carsData = response.data?.data || [];
      setCars(Array.isArray(carsData) ? carsData : []);
    } catch (err) {
      console.error('Error fetching cars:', err);
      showNotification('Failed to fetch cars. Please try again later.');
      setCars([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddFeature = (e) => {
    e.preventDefault();
    if (newFeature.trim() && !formData.features?.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter(feature => feature !== featureToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Format and append other form data
      const formattedData = {
        ...formData,
        seats: parseInt(formData.seats) || 0,
        luggageCapacity: parseInt(formData.luggageCapacity) || 0,
        mileage: parseInt(formData.mileage) || 0,
        pricePerDay: parseFloat(formData.pricePerDay) || 0,
        isAvailable: true,
        type: formData.type
      };
      
      // Remove imageUrl from formattedData as we'll handle the image separately
      delete formattedData.imageUrl;
      
      // Validate required fields
      if (!formattedData.pricePerDay || formattedData.pricePerDay <= 0) {
        showNotification('Price per day must be greater than 0');
        return;
      }
      
      // Append each field individually to FormData
      Object.keys(formattedData).forEach(key => {
        if (Array.isArray(formattedData[key])) {
          submitData.append(key, JSON.stringify(formattedData[key]));
        } else if (key === 'type') {
          submitData.append(key, formattedData[key].trim());
        } else {
          submitData.append(key, formattedData[key]);
        }
      });

      // Append the image file if selected
      if (selectedImage) {
        submitData.append('image', selectedImage);
      }

      const response = await axios.post('http://localhost:5000/api/cars', submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setIsModalOpen(false);
        fetchCars();
        resetForm();
        showNotification('Car added successfully', 'success');
      } else {
        showNotification(response.data.message);
      }
    } catch (err) {
      console.error('Error adding car:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add car. Please try again.';
      showNotification(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      brand: '',
      model: '',
      type: '',
      fuelType: '',
      pricePerDay: '',
      image: null,
      features: []
    });
    setSelectedImage(null);
    setImagePreview(null);
    setNewFeature('');
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      if (window.confirm('Are you sure you want to delete this car?')) {
        const response = await axios.delete(`http://localhost:5000/api/cars/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          fetchCars();
          showNotification('Car deleted successfully', 'success');
        } else {
          showNotification(response.data.message);
        }
      }
    } catch (err) {
      console.error('Error deleting car:', err);
      showNotification(err.response?.data?.message || 'Failed to delete car. Please try again.');
    }
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      const token = localStorage.getItem('token');
      
      // If trying to make the car available, check for active bookings
      if (isAvailable) {
        const bookingsResponse = await axios.get(`http://localhost:5000/api/bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const activeBookings = bookingsResponse.data.data.filter(booking => 
          booking.car._id === id && 
          (booking.status === 'active' || booking.status === 'confirmed')
        );
        
        if (activeBookings.length > 0) {
          showNotification('Cannot make car available while it has active or confirmed bookings');
          return;
        }
      }

      const response = await axios.put(`http://localhost:5000/api/cars/${id}/availability`, { isAvailable }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        fetchCars();
        showNotification(response.data.message, 'success');
      } else {
        showNotification(response.data.message);
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
      showNotification(err.response?.data?.message || 'Failed to toggle availability. Please try again.');
    }
  };

  // Update the car card to show availability toggle state
  const renderAvailabilityToggle = (car) => {
    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
          car.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {car.isAvailable ? 'Available' : 'Not Available'}
        </span>
        <button
          onClick={() => handleToggleAvailability(car._id, !car.isAvailable)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
            car.isAvailable ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              car.isAvailable ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    );
  };

  // Update the car card to show delete button state
  const renderDeleteButton = (car) => {
    return (
      <button
        onClick={() => handleDelete(car._id)}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Delete car"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    );
  };

  const modalContent = isModalOpen && (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        style={{ zIndex: 9998 }}
        onClick={() => {
          setIsModalOpen(false);
          resetForm();
        }}
      />
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
          <div className="bg-blue-600 text-white rounded-t-xl p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Car</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <form id="car-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select car type</option>
                      <option value="City car">City car</option>
                      <option value="Family car">Family car</option>
                      <option value="Sports car">Sports car</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Full electric">Full electric</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Transmission</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                      <input
                        type="number"
                        value={formData.seats}
                        onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="1"
                        max="8"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Luggage</label>
                      <input
                        type="number"
                        value={formData.luggageCapacity}
                        onChange={(e) => setFormData({ ...formData, luggageCapacity: e.target.value })}
                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
                      <input
                        type="number"
                        value={formData.mileage}
                        onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price per Day (£)</label>
                      <input
                        type="number"
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                        className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance</label>
                    <input
                      type="date"
                      value={formData.lastMaintenance}
                      onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Car Image</label>
                    <div className="mt-1 flex flex-col space-y-4">
                      <div className="w-full aspect-video bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PhotoIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2.5 file:px-4
                          file:rounded-lg file:border-2
                          file:border-gray-300
                          file:text-sm file:font-semibold
                          file:bg-white file:text-blue-700
                          hover:file:border-blue-500
                          hover:file:bg-blue-50
                          transition-all"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 bg-gray-50 rounded-lg border border-gray-200">
                        {(!formData.features || formData.features.length === 0) ? (
                          <span className="text-gray-400 text-sm">No features added yet</span>
                        ) : (
                          formData.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                            >
                              {feature}
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(feature)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFeature();
                            }
                          }}
                          placeholder="Add a feature (e.g., Air Conditioning)"
                          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddFeature}
                          disabled={!newFeature.trim()}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="car-form"
                className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Car
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cars...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Cars Management</h1>
        <button
          onClick={() => {
            setSelectedCar(null);
            setFormData({
              brand: '',
              model: '',
              type: '',
              fuelType: '',
              pricePerDay: '',
              image: null
            });
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add New Car
        </button>
      </div>

      {/* Add Search, Filter, and Sort Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Cars
            </label>
            <input
              type="text"
              placeholder="Search by brand or model..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Car Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Car Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="City car">City Car</option>
              <option value="Family car">Family Car</option>
              <option value="Sports car">Sports Car</option>
              <option value="SUV">SUV</option>
            </select>
          </div>

          {/* Fuel Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuel Type
            </label>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Full electric">Full Electric</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="brand">Brand</option>
              <option value="price">Price (Low to High)</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>

        {/* Price Range and Availability Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Prices</option>
              <option value="0-50">Under £50</option>
              <option value="50-100">£50 - £100</option>
              <option value="100-200">£100 - £200</option>
              <option value="200-999999">Over £200</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Availability
            </label>
            <select
              value={filters.availability}
              onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Cars</option>
              <option value="true">Available</option>
              <option value="false">Not Available</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilters({
                type: '',
                fuelType: '',
                priceRange: '',
                availability: ''
              });
              setSortBy('brand');
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Clear All Filters
          </button>
        </div>
      </div>

      {/* Update the cars grid to use filteredAndSortedCars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedCars.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cars found</h3>
            <p className="text-gray-500 text-center max-w-sm">
              {searchTerm 
                ? `No cars found matching "${searchTerm}". Try adjusting your search terms.`
                : filters.type || filters.fuelType || filters.priceRange || filters.availability
                ? "No cars match your current filters. Try adjusting your filter criteria."
                : "No cars available at the moment."}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  type: '',
                  fuelType: '',
                  priceRange: '',
                  availability: ''
                });
                setSortBy('brand');
              }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredAndSortedCars.map((car) => (
            <div key={car._id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="relative h-56 overflow-hidden rounded-t-lg">
                <img
                  src={car.imageUrl}
                  alt={`${car.brand} ${car.model}`}
                  className="h-full w-full object-contain bg-gray-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <span className="text-blue-600">{car.brand}</span>{' '}
                      <span className="text-gray-700">{car.model}</span>
                    </h3>
                    <p className="text-sm text-gray-500">{car.type}</p>
                  </div>
                  {renderAvailabilityToggle(car)}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Fuel:</span>
                    {car.fuelType}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium mr-2">Price:</span>
                    £{car.pricePerDay}/day
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Mileage:</span>
                      {car.mileage} miles
                    </div>
                    {renderDeleteButton(car)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Portal */}
      {modalContent && createPortal(modalContent, document.body)}
    </div>
  );
};

export default Cars; 