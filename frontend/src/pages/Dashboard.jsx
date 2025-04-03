const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="mt-2 text-3xl font-bold text-blue-900">£0.00</p>
            </div>
          </div>
        </div>

        {/* Available Cars */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Available Cars</h3>
              <p className="mt-2 text-3xl font-bold text-blue-900">0</p>
            </div>
          </div>
        </div>

        {/* Active Rentals */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500">Active Rentals</h3>
              <p className="mt-2 text-3xl font-bold text-blue-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-blue-900">Recent Bookings</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-gray-500">No recent bookings found.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 