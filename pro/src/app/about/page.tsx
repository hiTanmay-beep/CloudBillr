// Create this file: app/about/page.tsx

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            About CloudBillr
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Simplifying billing for businesses across India with smart, 
            cloud-based invoicing solutions
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                CloudBillr was created with a simple mission: to make professional 
                billing accessible to every business, regardless of size or technical expertise.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                We understand the challenges faced by Indian businesses - from GST compliance 
                to managing multiple customers and tracking payments. That's why we built 
                CloudBillr to be simple, powerful, and completely cloud-based.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                No more complicated software installations. No more manual calculations. 
                Just smart, efficient billing that works from anywhere.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-gray-800 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Simple & Intuitive
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      No training required. Start creating invoices in minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      GST Compliant
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      100% compliant with Indian GST regulations.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <span className="text-2xl">☁️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Cloud-First
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Access from anywhere, on any device, anytime.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-16">
            Why Choose CloudBillr?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Cost Effective
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                No expensive software licenses. No hidden fees. Just straightforward, 
                affordable billing.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Generate invoices in seconds. Auto-fill customer details. 
                Save time on every bill.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Secure & Reliable
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is safe with us. Regular backups and secure storage 
                ensure peace of mind.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Mobile Ready
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create invoices on the go. Works perfectly on smartphones, 
                tablets, and desktops.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">🇮🇳</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Made for India
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Built specifically for Indian businesses with GST, HSN codes, 
                and local requirements.
              </p>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Professional Design
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create beautiful, Tally-style invoices that make your business 
                look professional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Serve */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Perfect For Every Business
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-16 max-w-2xl mx-auto">
            Whether you're a freelancer, retailer, wholesaler, or service provider, 
            CloudBillr adapts to your needs
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-4xl mb-3">👔</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Wholesalers</h3>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-4xl mb-3">🏪</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Retailers</h3>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Freelancers</h3>
            </div>
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-4xl mb-3">🛠️</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Service Providers</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join CloudBillr Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start creating professional invoices in minutes
          </p>
          <a href="/signup">
            <button className="px-10 py-4 bg-white text-blue-600 text-lg font-semibold rounded-lg hover:bg-gray-100 shadow-xl transform hover:scale-105 transition">
              Get Started Free
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}