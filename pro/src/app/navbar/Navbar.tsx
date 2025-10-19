// app/components/navbar.tsx

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/profile');
      setIsLoggedIn(response.ok);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Only run on client side after mount
  useEffect(() => {
    setMounted(true);
    checkAuth();
  }, []);

  // Re-check auth when pathname changes
  useEffect(() => {
    if (mounted) {
      checkAuth();
    }
  }, [pathname, mounted]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsLoggedIn(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Redirect logged-in users away from public pages
  useEffect(() => {
    if (mounted && !loading && isLoggedIn && ['/', '/about', '/contact', '/signin', '/signup'].includes(pathname)) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, pathname, router, loading, mounted]);

  // Return skeleton while loading to prevent hydration mismatch
  if (!mounted) {
    return (
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <span style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'sifonn, sans-serif',
              letterSpacing: '0.5px',
            }}>
              CloudBillr
            </span>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-gray-900 dark:to-gray-800 shadow-xl" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center flex-shrink-0">
            <span style={{
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'sifonn, sans-serif',
              letterSpacing: '0.5px',
              transition: 'transform 0.3s ease'
            }} className="hover:scale-105 transform transition-transform duration-300">
              CloudBillr
            </span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  Contact
                </Link>
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-blue-400">
                  <Link
                    href="/signin"
                    className="px-6 py-2 text-white border-2 border-blue-600 rounded-lg hover:bg-blue-800 hover:to-blue-800 font-semibold transition-all duration-300"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-400 font-semibold shadow-lg transition-all duration-300"
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <Link
                  href="/invoices"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  Invoices
                </Link>
                <Link
                  href="/customers"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  Customers
                </Link>
                <Link
                  href="/productmanager"
                  className="text-white hover:text-blue-200 font-medium transition-colors duration-300"
                >
                  Products
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all duration-300"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white hover:text-blue-100 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 space-y-3 bg-blue-700 dark:bg-gray-800 rounded-lg p-4 mt-3">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                <div className="border-t border-blue-500 pt-3 mt-3 space-y-2">
                  <Link
                    href="/signin"
                    className="block px-4 py-2 text-white border-2 border-blue-600 rounded font-semibold text-center hover:bg-blue-800 hover:text-blue-900 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 bg-blue-600 text-white rounded font-semibold text-center hover:bg-blue-400 transition-all duration-300"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                 <Link
                  href="/invoices"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Invoices
                </Link>
                <Link
                  href="/customers"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Customers
                </Link>
                <Link
                  href="/productmanager"
                  className="block px-4 py-2 text-white hover:bg-blue-600 dark:hover:bg-gray-700 rounded transition-colors duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/profile"
                  className="block px-4 py-2 bg-green-500 text-white rounded font-semibold text-center hover:bg-green-600 transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full px-4 py-2 bg-red-500 text-white rounded font-semibold text-center hover:bg-red-600 transition-all duration-300"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}