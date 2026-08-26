export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
              Total Members
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">342</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
              Active Classes
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">24</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
              Monthly Revenue
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">$15,680</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wide">
              Today's Check-ins
            </h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">68</p>
          </div>
        </div>
      </div>
    </div>
  );
}
