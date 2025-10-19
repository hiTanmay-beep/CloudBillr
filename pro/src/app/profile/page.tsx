// app/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    companyType: '',
    companyAddress: '',
    gstin: '',
    phone1: '',
    phone2: '',
    numBankAccounts: 1,
    bank1Name: '',
    bank1Account: '',
    bank1IFSC: '',
    bank2Name: '',
    bank2Account: '',
    bank2IFSC: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();

      if (response.ok) {
        const user = data.user;
        setFormData({
          email: user.email || '',
          password: '',
          confirmPassword: '',
          companyName: user.companyName || '',
          companyType: user.companyType || '',
          companyAddress: user.companyAddress || '',
          gstin: user.gstin || '',
          phone1: user.phone1 || '',
          phone2: user.phone2 || '',
          numBankAccounts: user.bankAccounts?.length || 1,
          bank1Name: user.bankAccounts?.[0]?.bankName || '',
          bank1Account: user.bankAccounts?.[0]?.accountNumber || '',
          bank1IFSC: user.bankAccounts?.[0]?.ifscCode || '',
          bank2Name: user.bankAccounts?.[1]?.bankName || '',
          bank2Account: user.bankAccounts?.[1]?.accountNumber || '',
          bank2IFSC: user.bankAccounts?.[1]?.ifscCode || ''
        });
      } else {
        setError('Failed to load profile');
        scrollToTop();
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
      scrollToTop();
    } finally {
      setFetchLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.companyName || !formData.gstin) {
      setError('Company name and GSTIN are required');
      scrollToTop();
      return;
    }

    if (!formData.phone1) {
      setError('Primary phone number is required');
      scrollToTop();
      return;
    }

    if (!formData.bank1Name || !formData.bank1Account || !formData.bank1IFSC) {
      setError('Bank Account 1 details are required');
      scrollToTop();
      return;
    }

    if (formData.numBankAccounts === 2 && (!formData.bank2Name || !formData.bank2Account || !formData.bank2IFSC)) {
      setError('Bank Account 2 details are required');
      scrollToTop();
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      scrollToTop();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: formData.password || undefined,
          companyName: formData.companyName,
          companyType: formData.companyType,
          companyAddress: formData.companyAddress,
          gstin: formData.gstin,
          phone1: formData.phone1,
          phone2: formData.phone2,
          numBankAccounts: formData.numBankAccounts,
          bank1Name: formData.bank1Name,
          bank1Account: formData.bank1Account,
          bank1IFSC: formData.bank1IFSC,
          bank2Name: formData.bank2Name,
          bank2Account: formData.bank2Account,
          bank2IFSC: formData.bank2IFSC
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Update failed');
      }

      setSuccess('Profile updated successfully!');
      scrollToTop();
      
      // Clear password fields after successful update
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message);
      scrollToTop();
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Profile Settings
            </h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Back to Dashboard
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Email (cannot be changed)
              </label>
              <input
                type="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Change Password */}
            <div className="border-t pt-6 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Change Password (Leave blank to keep current)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="border-t pt-6 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Company Details
              </h3>

              {/* Company Name */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              {/* Company Type & GSTIN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Type
                  </label>
                  <input
                    type="text"
                    value={formData.companyType}
                    onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Wholesaler, Retailer"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    GSTIN *
                  </label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                    maxLength={15}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Company Address */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Address
                </label>
                <textarea
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Full company address"
                />
              </div>
            </div>

            {/* Contact Numbers */}
            <div className="border-t pt-6 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Numbers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone1}
                    onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+91 9876543210"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Secondary Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone2}
                    onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="border-t pt-6 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Bank Details
              </h3>

              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of Bank Accounts *
                </label>
                <select
                  value={formData.numBankAccounts}
                  onChange={(e) => setFormData({ ...formData, numBankAccounts: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={1}>1 Bank Account</option>
                  <option value={2}>2 Bank Accounts</option>
                </select>
              </div>

              {/* Bank 1 */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                <h4 className="font-medium text-gray-900 dark:text-white">Bank Account 1</h4>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bank1Name}
                    onChange={(e) => setFormData({ ...formData, bank1Name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., PUNJAB NATIONAL BANK"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bank1Account}
                    onChange={(e) => setFormData({ ...formData, bank1Account: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0030002100090414"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    value={formData.bank1IFSC}
                    onChange={(e) => setFormData({ ...formData, bank1IFSC: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="PUNB0003000"
                    required
                  />
                </div>
              </div>

              {/* Bank 2 */}
              {formData.numBankAccounts === 2 && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">Bank Account 2</h4>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Bank Name *
                    </label>
                    <input
                      type="text"
                      value={formData.bank2Name}
                      onChange={(e) => setFormData({ ...formData, bank2Name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="e.g., CANARA BANK"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Account Number *
                    </label>
                    <input
                      type="text"
                      value={formData.bank2Account}
                      onChange={(e) => setFormData({ ...formData, bank2Account: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="3306214000016"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      IFSC Code *
                    </label>
                    <input
                      type="text"
                      value={formData.bank2IFSC}
                      onChange={(e) => setFormData({ ...formData, bank2IFSC: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="CNRB0006030"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}