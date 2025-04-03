import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import carImage from '../../assets/image.png';
import { XMarkIcon, CurrencyDollarIcon, KeyIcon, TruckIcon, BoltIcon, CogIcon } from '@heroicons/react/24/outline';

const SplashScreen = () => {
  const location = useLocation();
  const [shouldRender, setShouldRender] = useState(true);

  const handleClose = () => {
    setShouldRender(false);
  };

  useEffect(() => {
    // Show splash screen only on root path
    if (location.pathname === '/') {
      setShouldRender(true);
    } else {
      setShouldRender(false);
    }
  }, [location.pathname]);

  if (!shouldRender) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
      }}
    >
      <div 
        className="bg-gradient-to-br from-white to-blue-50 rounded-2xl overflow-hidden w-[95%] h-[85vh] max-w-6xl mx-auto shadow-2xl relative"
      >
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
        >
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        </button>

        <div className="flex h-full">
          {/* Left Content */}
          <div className="w-1/2 p-8 flex flex-col justify-center">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to WeAreCars
                <span className="block text-lg text-blue-600 mt-1">Staff Portal</span>
              </h1>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mt-6 backdrop-blur-sm max-w-md mx-auto">
                <div className="flex items-center justify-center mb-2">
                  <KeyIcon className="w-4 h-4 text-blue-600 mr-2" />
                  <p className="text-blue-900 font-medium">Staff Login Credentials</p>
                </div>
                <div className="space-y-2 text-center">
                  <div className="font-mono bg-white px-3 py-1.5 rounded text-sm">Username: sta001</div>
                  <div className="font-mono bg-white px-3 py-1.5 rounded text-sm">Password: givemethekeys123</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-center mb-3">
                  <TruckIcon className="w-4 h-4 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Car Options</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-gray-700 font-medium text-center text-sm mb-2">Vehicle Types</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">City</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Family</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Sports</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">SUV</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-center mb-2">
                      <BoltIcon className="w-3.5 h-3.5 text-green-600 mr-1" />
                      <p className="text-gray-700 font-medium text-sm">Fuel Types</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Petrol</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Diesel</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Hybrid</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Electric</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex items-center justify-center mb-3">
                  <CurrencyDollarIcon className="w-4 h-4 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Pricing</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-gray-700 font-medium text-sm mb-1">Base Rate</p>
                    <p className="text-2xl font-bold text-blue-600">£25<span className="text-xs text-gray-600 font-normal"> / day</span></p>
                    <p className="text-xs text-gray-500">Rental duration: 1-28 days</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <div className="flex items-center justify-center mb-2">
                      <CogIcon className="w-3.5 h-3.5 text-purple-600 mr-1" />
                      <p className="text-gray-700 font-medium text-sm">Optional Extras</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Unlimited Mileage</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Breakdown Cover</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-1/2 p-8 relative h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent)]" />
            <img
              src={carImage}
              alt="Luxury Car"
              className="relative z-10 w-[90%] h-auto object-contain transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
