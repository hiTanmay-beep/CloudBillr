// Create this file: app/page.tsx

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Create Professional Invoices
            <span className="block text-blue-600 dark:text-blue-400 mt-2">
              From Anywhere, Anytime
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            CloudBillr is your complete billing solution. Generate GST-compliant invoices, 
            manage customers, track payments, and grow your business effortlessly.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/signup">
              <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 shadow-lg transform hover:scale-105 transition">
                Get Started Free
              </button>
            </a>
            <a href="/about">
              <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:border-blue-600 dark:hover:border-blue-400 transition">
                Learn More
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Everything You Need to Bill Smarter
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-blue-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">📄</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                GST Invoices
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate professional GST-compliant invoices with CGST, SGST, and IGST calculations. 
                Perfect for Indian businesses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-green-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">👥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Customer Management
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Store customer details, GST numbers, and addresses. Auto-fetch business details 
                from GST portal.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-purple-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">☁️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Cloud-Based
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access your invoices from anywhere. No installation required. 
                Works on desktop, tablet, and mobile.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-yellow-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-yellow-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Broker Reports
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track broker-wise sales and generate year-end reports. 
                Export to CSV for accounting.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-red-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-red-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">💾</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                PDF Download
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Download professional invoices as PDF. Print or email directly to customers. 
                Tally-style format.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-indigo-50 dark:bg-gray-700 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-indigo-600 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Product Library
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save frequently used products with HSN codes, prices, and GST rates. 
                Add them to invoices with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            How CloudBillr Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Sign Up
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create your free account in seconds
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Add Customers
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Save customer details with GST numbers
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Create Invoice
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select customer, add items, and generate
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Download & Share
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Print or email professional invoices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-700">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Simplify Your Billing?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using CloudBillr to manage their invoicing
          </p>
          <a href="/signup">
            <button className="px-10 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 shadow-xl transform hover:scale-105 transition">
              Start Free Today
            </button>
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">100%</p>
              <p className="text-gray-600 dark:text-gray-300">GST Compliant</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">₹0</p>
              <p className="text-gray-600 dark:text-gray-300">Setup Cost</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</p>
              <p className="text-gray-600 dark:text-gray-300">Access Anywhere</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}