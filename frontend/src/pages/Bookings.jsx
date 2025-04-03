import { useState, useEffect, useMemo } from 'react';
import { PlusIcon, TrashIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const Bookings = () => {
  const { showNotification } = useNotification();
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    customer: {
      firstName: '',
      surname: '',
      address: '',
      age: '',
      drivingLicense: ''
    },
    car: '',
    rentalDetails: {
      numberOfDays: '',
      pickupLocation: '',
      dropoffLocation: '',
      extras: {
        unlimitedMileage: false,
        breakdownCover: false
      }
    }
  });
  const [summary, setSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: '',
    customerName: ''
  });

  useEffect(() => {
    fetchBookings();
    fetchCars();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch bookings. Please try again later.';
      showNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/cars', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter to only show available cars
      const availableCars = response.data.data.filter(car => car.isAvailable);
      setCars(availableCars);
    } catch (err) {
      console.error('Error fetching cars:', err);
      showNotification('Failed to fetch cars. Please try again later.');
    }
  };

  const calculatePrice = () => {
    if (!formData.car || !formData.rentalDetails.numberOfDays) return 0;

    const selectedCar = cars.find(car => car._id === formData.car);
    if (!selectedCar) return 0;

    let totalPrice = 0;
    const days = parseInt(formData.rentalDetails.numberOfDays);

    // Base price per day
    totalPrice += days * 25;

    // Car type extras
    switch (selectedCar.type) {
      case 'Family car':
        totalPrice += 50;
        break;
      case 'Sports car':
        totalPrice += 75;
        break;
      case 'SUV':
        totalPrice += 65;
        break;
    }

    // Fuel type extras
    switch (selectedCar.fuelType) {
      case 'Hybrid':
        totalPrice += 30;
        break;
      case 'Full electric':
        totalPrice += 50;
        break;
    }

    // Optional extras
    if (formData.rentalDetails.extras.unlimitedMileage) {
      totalPrice += 10 * days;
    }
    if (formData.rentalDetails.extras.breakdownCover) {
      totalPrice += 2 * days;
    }

    return totalPrice;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      if (parent === 'customer') {
        setFormData(prev => ({
          ...prev,
          customer: {
            ...prev.customer,
            [child]: value
          }
        }));
      } else if (parent === 'rentalDetails') {
        if (child === 'extras') {
          const extraName = e.target.dataset.extra;
          setFormData(prev => ({
            ...prev,
            rentalDetails: {
              ...prev.rentalDetails,
              extras: {
                ...prev.rentalDetails.extras,
                [extraName]: checked
              }
            }
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            rentalDetails: {
              ...prev.rentalDetails,
              [child]: value
            }
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Customer validation
    if (!formData.customer.firstName.trim()) {
      errors.customer = { ...errors.customer, firstName: 'First name is required' };
    }
    if (!formData.customer.surname.trim()) {
      errors.customer = { ...errors.customer, surname: 'Surname is required' };
    }
    if (!formData.customer.address.trim()) {
      errors.customer = { ...errors.customer, address: 'Address is required' };
    }
    if (!formData.customer.age || parseInt(formData.customer.age) < 18) {
      errors.customer = { ...errors.customer, age: 'Must be at least 18 years old' };
    }
    if (!formData.customer.drivingLicense.trim()) {
      errors.customer = { ...errors.customer, drivingLicense: 'Valid driving license is required' };
    }

    // Car validation
    if (!formData.car) {
      errors.car = 'Please select a car';
    }

    // Rental details validation
    if (!formData.rentalDetails.numberOfDays || 
        parseInt(formData.rentalDetails.numberOfDays) < 1 || 
        parseInt(formData.rentalDetails.numberOfDays) > 28) {
      errors.rentalDetails = { 
        ...errors.rentalDetails, 
        numberOfDays: 'Number of days must be between 1 and 28' 
      };
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePreview = () => {
    if (!validateForm()) {
      return;
    }

    const selectedCar = cars.find(car => car._id === formData.car);
    if (!selectedCar) {
      showNotification('Selected car not found');
      return;
    }

    setSummary({
      customer: formData.customer,
      car: selectedCar,
      rentalDetails: formData.rentalDetails,
      totalPrice: calculatePrice()
    });
    setShowSummary(true);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Calculate start and end dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(formData.rentalDetails.numberOfDays));
      
      // Create a proper booking object matching the backend model
      const bookingData = {
        customer: {
          firstName: formData.customer.firstName.trim(),
          surname: formData.customer.surname.trim(),
          address: formData.customer.address.trim(),
          age: parseInt(formData.customer.age),
          drivingLicense: formData.customer.drivingLicense.trim()
        },
        car: formData.car,
        rentalDetails: {
          numberOfDays: parseInt(formData.rentalDetails.numberOfDays),
          pickupLocation: formData.rentalDetails.pickupLocation.trim(),
          dropoffLocation: formData.rentalDetails.dropoffLocation.trim(),
          extras: formData.rentalDetails.extras,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      };
      
      const response = await axios.post('http://localhost:5000/api/bookings', bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        setIsModalOpen(false);
        setShowSummary(false);
        resetForm();
        await fetchBookings();
      } else {
        showNotification(response.data.message);
      }
    } catch (err) {
      console.error('Error creating booking:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create booking. Please try again.';
      showNotification(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      customer: {
        firstName: '',
        surname: '',
        address: '',
        age: '',
        drivingLicense: ''
      },
      car: '',
      rentalDetails: {
        numberOfDays: '',
        pickupLocation: '',
        dropoffLocation: '',
        extras: {
          unlimitedMileage: false,
          breakdownCover: false
        }
      }
    });
    setSummary(null);
    setShowSummary(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/bookings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          showNotification(response.data.message, 'success');
          fetchBookings();
        } else {
          showNotification(response.data.message);
        }
      } catch (err) {
        console.error('Error deleting booking:', err);
        const errorMessage = err.response?.data?.message || 'Failed to delete booking. Please try again.';
        showNotification(errorMessage);
      }
    }
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
              <h2 className="text-xl font-semibold">New Booking</h2>
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
            {!showSummary ? (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer.firstName"
                        value={formData.customer.firstName}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.customer?.firstName ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.customer?.firstName && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.customer.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Surname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer.surname"
                        value={formData.customer.surname}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.customer?.surname ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.customer?.surname && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.customer.surname}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="customer.address"
                        value={formData.customer.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.customer?.address ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.customer?.address && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.customer.address}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="customer.age"
                        value={formData.customer.age}
                        onChange={handleInputChange}
                        min="18"
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.customer?.age ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.customer?.age && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.customer.age}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Driving License <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="customer.drivingLicense"
                        value={formData.customer.drivingLicense}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.customer?.drivingLicense ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.customer?.drivingLicense && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.customer.drivingLicense}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Days <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="rentalDetails.numberOfDays"
                        value={formData.rentalDetails.numberOfDays}
                        onChange={handleInputChange}
                        min="1"
                        max="28"
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.rentalDetails?.numberOfDays ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.rentalDetails?.numberOfDays && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.rentalDetails.numberOfDays}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pickup Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rentalDetails.pickupLocation"
                        value={formData.rentalDetails.pickupLocation}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.rentalDetails?.pickupLocation ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.rentalDetails?.pickupLocation && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.rentalDetails.pickupLocation}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dropoff Location <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="rentalDetails.dropoffLocation"
                        value={formData.rentalDetails.dropoffLocation}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.rentalDetails?.dropoffLocation ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      />
                      {formErrors.rentalDetails?.dropoffLocation && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.rentalDetails.dropoffLocation}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Car <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="car"
                        value={formData.car}
                        onChange={handleInputChange}
                        className={`block w-full rounded-lg border-2 ${
                          formErrors.car ? 'border-red-500' : 'border-gray-300'
                        } px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
                        required
                      >
                        <option value="">Select a car</option>
                        {cars.map(car => (
                          <option key={car._id} value={car._id}>
                            {car.brand} {car.model} - {car.type} ({car.fuelType})
                          </option>
                        ))}
                      </select>
                      {formErrors.car && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.car}</p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="rentalDetails.extras"
                          data-extra="unlimitedMileage"
                          checked={formData.rentalDetails.extras.unlimitedMileage}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Unlimited Mileage (+£10/day)
                        </span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="rentalDetails.extras"
                          data-extra="breakdownCover"
                          checked={formData.rentalDetails.extras.breakdownCover}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Breakdown Cover (+£2/day)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePreview}
                    className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Preview Booking
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Booking Summary</h3>
                  <div className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                    Preview
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    {/* Left Column */}
                    <div className="p-6 space-y-6">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Customer Details
                        </h4>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Full Name</span>
                            <span className="font-medium text-gray-900">{summary.customer.firstName} {summary.customer.surname}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Address</span>
                            <span className="font-medium text-gray-900">{summary.customer.address}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Age</span>
                            <span className="font-medium text-gray-900">{summary.customer.age} years</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">License No.</span>
                            <span className="font-medium text-gray-900">{summary.customer.drivingLicense}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                          </svg>
                          Rental Details
                        </h4>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Duration</span>
                            <span className="font-medium text-gray-900">{summary.rentalDetails.numberOfDays} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Pickup</span>
                            <span className="font-medium text-gray-900">{summary.rentalDetails.pickupLocation}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Drop-off</span>
                            <span className="font-medium text-gray-900">{summary.rentalDetails.dropoffLocation}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Extras</span>
                            <div className="text-right">
                              {summary.rentalDetails.extras.unlimitedMileage && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Unlimited Mileage
                                </span>
                              )}
                              {summary.rentalDetails.extras.breakdownCover && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 ml-1">
                                  Breakdown Cover
                                </span>
                              )}
                              {!summary.rentalDetails.extras.unlimitedMileage && !summary.rentalDetails.extras.breakdownCover && (
                                <span className="text-gray-500">None selected</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="p-6 space-y-6 bg-gray-50">
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Selected Vehicle
                        </h4>
                        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-xl font-semibold text-gray-900">{summary.car.brand}</span>
                              <span className="text-lg text-gray-600">{summary.car.model}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {summary.car.type}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {summary.car.fuelType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Price Breakdown
                        </h4>
                        <div className="mt-4 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Base Rate ({summary.rentalDetails.numberOfDays} days)</span>
                            <span className="font-medium text-gray-900">£{summary.rentalDetails.numberOfDays * 25}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Vehicle Type Extra</span>
                            <span className="font-medium text-gray-900">£{
                              summary.car.type === 'Family car' ? 50 :
                              summary.car.type === 'Sports car' ? 75 :
                              summary.car.type === 'SUV' ? 65 : 0
                            }</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Fuel Type Extra</span>
                            <span className="font-medium text-gray-900">£{
                              summary.car.fuelType === 'Hybrid' ? 30 :
                              summary.car.fuelType === 'Full electric' ? 50 : 0
                            }</span>
                          </div>
                          {summary.rentalDetails.extras.unlimitedMileage && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Unlimited Mileage</span>
                              <span className="font-medium text-gray-900">£{summary.rentalDetails.numberOfDays * 10}</span>
                            </div>
                          )}
                          {summary.rentalDetails.extras.breakdownCover && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Breakdown Cover</span>
                              <span className="font-medium text-gray-900">£{summary.rentalDetails.numberOfDays * 2}</span>
                            </div>
                          )}
                          <div className="pt-4 mt-4 border-t border-gray-200">
                            <div className="flex justify-between">
                              <span className="text-base font-semibold text-gray-900">Total Price</span>
                              <span className="text-base font-semibold text-gray-900">£{summary.totalPrice}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">20% deposit required: £{(summary.totalPrice * 0.2).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSummary(false)}
                    className="px-6 py-2.5 text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <span>Confirm Booking</span>
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Add filtered bookings logic
  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    // Apply status filter
    if (filters.status) {
      result = result.filter(booking => booking.status === filters.status);
    }

    // Apply payment status filter
    if (filters.paymentStatus) {
      result = result.filter(booking => booking.paymentStatus === filters.paymentStatus);
    }

    // Apply date range filter
    if (filters.dateRange) {
      const today = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          result = result.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate.toDateString() === today.toDateString();
          });
          break;
        case 'week':
          startDate.setDate(today.getDate() - 7);
          result = result.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= startDate;
          });
          break;
        case 'month':
          startDate.setMonth(today.getMonth() - 1);
          result = result.filter(booking => {
            const bookingDate = new Date(booking.createdAt);
            return bookingDate >= startDate;
          });
          break;
      }
    }

    // Apply customer name filter
    if (filters.customerName) {
      result = result.filter(booking => {
        const fullName = `${booking.customer.firstName} ${booking.customer.surname}`.toLowerCase();
        return fullName.includes(filters.customerName.toLowerCase());
      });
    }

    return result;
  }, [bookings, filters]);

  // Update status update function
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        fetchBookings();
      } else {
        showNotification(response.data.message);
      }
    } catch (err) {
      console.error('Error updating booking status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update booking status. Please try again.';
      showNotification(errorMessage);
    }
  };

  // Update payment status update function
  const handlePaymentStatusUpdate = async (bookingId, newPaymentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/bookings/${bookingId}/payment-status`,
        { paymentStatus: newPaymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        showNotification(response.data.message, 'success');
        fetchBookings();
      } else {
        showNotification(response.data.message);
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update payment status. Please try again.';
      showNotification(errorMessage);
    }
  };

  // Add status badge component
  const StatusBadge = ({ status }) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Update status update dropdown component
  const StatusUpdateDropdown = ({ booking }) => {
    // Only show options that can be manually set
    const getAvailableStatuses = () => {
      const statuses = [];
      
      // Can always set to cancelled
      statuses.push('cancelled');
      
      // Can set to completed only if rental period is over
      const endDate = new Date(booking.rentalDetails.endDate);
      const today = new Date();
      if (today >= endDate) {
        statuses.push('completed');
      }
      
      // Can set to active only if payment is paid
      if (booking.paymentStatus === 'paid') {
        statuses.push('active');
      }
      
      return statuses;
    };

    const availableStatuses = getAvailableStatuses();
    
    // Define status colors
    const statusColors = {
      pending: 'text-yellow-700 bg-yellow-50 border-yellow-300',
      active: 'text-green-700 bg-green-50 border-green-300',
      completed: 'text-gray-700 bg-gray-50 border-gray-300',
      cancelled: 'text-red-700 bg-red-50 border-red-300'
    };

    const getStatusColor = (status) => statusColors[status] || 'text-gray-700 bg-gray-50 border-gray-300';
    
    return (
      <select
        value={booking.status}
        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
        className={`block w-full rounded-lg border-2 px-3 py-1.5 text-sm shadow-sm focus:ring-1 focus:ring-blue-500 ${getStatusColor(booking.status)}`}
        disabled={availableStatuses.length === 0}
      >
        <option value={booking.status} className={getStatusColor(booking.status)}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </option>
        {availableStatuses
          .filter(status => status !== booking.status)
          .map(status => (
            <option key={status} value={status} className={getStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
      </select>
    );
  };

  // Update payment status dropdown component
  const PaymentStatusDropdown = ({ booking }) => {
    // Only show options that can be manually set
    const getAvailablePaymentStatuses = () => {
      const statuses = [];
      
      // Can set to paid if currently pending
      if (booking.paymentStatus === 'pending') {
        statuses.push('paid');
      }
      
      // Can set to refunded if currently paid and booking is cancelled
      if (booking.paymentStatus === 'paid' && booking.status === 'cancelled') {
        statuses.push('refunded');
      }
      
      return statuses;
    };

    const availableStatuses = getAvailablePaymentStatuses();
    
    // Define payment status colors
    const paymentStatusColors = {
      pending: 'text-yellow-700 bg-yellow-50 border-yellow-300',
      paid: 'text-green-700 bg-green-50 border-green-300',
      refunded: 'text-red-700 bg-red-50 border-red-300'
    };

    const getPaymentStatusColor = (status) => paymentStatusColors[status] || 'text-gray-700 bg-gray-50 border-gray-300';
    
    return (
      <select
        value={booking.paymentStatus}
        onChange={(e) => handlePaymentStatusUpdate(booking._id, e.target.value)}
        className={`block w-full rounded-lg border-2 px-3 py-1.5 text-sm shadow-sm focus:ring-1 focus:ring-blue-500 ${getPaymentStatusColor(booking.paymentStatus)}`}
        disabled={availableStatuses.length === 0}
      >
        <option value={booking.paymentStatus} className={getPaymentStatusColor(booking.paymentStatus)}>
          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
        </option>
        {availableStatuses
          .filter(status => status !== booking.paymentStatus)
          .map(status => (
            <option key={status} value={status} className={getPaymentStatusColor(status)}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
      </select>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Booking
        </button>
      </div>

      {/* Add Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={() => setFilters({
              status: '',
              paymentStatus: '',
              dateRange: '',
              customerName: ''
            })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Booking Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="active">Active Bookings</option>
              <option value="upcoming">Upcoming Bookings</option>
            </select>
          </div>

          {/* Customer Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Customer
            </label>
            <input
              type="text"
              placeholder="Search by name or license..."
              value={filters.customerName}
              onChange={(e) => setFilters(prev => ({ ...prev, customerName: e.target.value }))}
              className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Update the bookings table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-500 text-center max-w-sm">
              {filters.customerName 
                ? `No bookings found for customer "${filters.customerName}". Try adjusting your search terms.`
                : filters.status || filters.paymentStatus || filters.dateRange
                ? "No bookings match your current filters. Try adjusting your filter criteria."
                : "No bookings available at the moment."}
            </p>
            <button
              onClick={() => setFilters({
                status: '',
                paymentStatus: '',
                dateRange: '',
                customerName: ''
              })}
              className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Car
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.customer.firstName} {booking.customer.surname}
                    </div>
                    <div className="text-sm text-gray-500">{booking.customer.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {booking.car ? `${booking.car.brand} ${booking.car.model}` : 'Car not found'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {booking.car ? booking.car.type : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.rentalDetails.numberOfDays} days</div>
                    <div className="text-sm text-gray-500">
                      {booking.rentalDetails.startDate && booking.rentalDetails.endDate ? (
                        `${new Date(booking.rentalDetails.startDate).toLocaleDateString()} - ${new Date(booking.rentalDetails.endDate).toLocaleDateString()}`
                      ) : (
                        'Dates not set'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusUpdateDropdown booking={booking} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusDropdown booking={booking} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">£{booking.pricing.totalPrice}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(booking._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Portal */}
      {modalContent && createPortal(modalContent, document.body)}
    </div>
  );
};

export default Bookings; 