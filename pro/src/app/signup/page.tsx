// app/signup/page.tsx

'use client';

import { useState } from 'react';

export default function SignupPage() {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Validation
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Email and password fields are required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!formData.companyName || !formData.gstin) {
      setError('Company name and GSTIN are required');
      return;
    }

    if (!formData.phone1) {
      setError('Primary phone number is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
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
        throw new Error(data.error || 'Signup failed');
      }

      // Show success message and clear form
      setSuccess('Account created successfully! You can now log in.');
      setFormData({
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

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="dark:bg-gray-900 min-h-screen py-8">
      <div className="flex flex-col items-center justify-center px-2">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Create an account
            </h1>

            {success && (
              <div className="p-3 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
                {success}
              </div>
            )}
            {error && (
              <div className="p-3 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                {error}
              </div>
            )}

            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@company.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Confirm password *
                  </label>
                  <input
                    type="password"
                    name="confirm-password"
                    id="confirm-password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    required
                  />
                </div>
              </div>



              {/* Company Details */}
              <div className="border-t pt-4 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Company Details
                </h3>

                <div className="space-y-4">
                  {/* Company Name */}
                  <div>
                    <label
                      htmlFor="companyName"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Company Name *
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Your Company Name"
                      required
                    />
                  </div>

                  {/* Company Type & GSTIN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="companyType"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Company Type
                      </label>
                      <input
                        type="text"
                        name="companyType"
                        id="companyType"
                        value={formData.companyType}
                        onChange={(e) => setFormData({ ...formData, companyType: e.target.value })}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="e.g., Wholesaler, Retailer"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="gstin"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        GSTIN *
                      </label>
                      <input
                        type="text"
                        name="gstin"
                        id="gstin"
                        value={formData.gstin}
                        onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                        maxLength={15}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="09AADFS1992C1Z6"
                        required
                      />
                    </div>
                  </div>

                  {/* Company Address */}
                  <div>
                    <label
                      htmlFor="companyAddress"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Company Address
                    </label>
                    <textarea
                      name="companyAddress"
                      id="companyAddress"
                      value={formData.companyAddress}
                      onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                      rows={3}
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Full company address"
                    />
                  </div>

                  {/* Phone Numbers */}
                  <div className="border-t pt-4 dark:border-gray-600">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Contact Numbers
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="phone1"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Primary Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone1"
                          id="phone1"
                          value={formData.phone1}
                          onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="+91 9876543210"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="phone2"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Secondary Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone2"
                          id="phone2"
                          value={formData.phone2}
                          onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="+91 9876543210"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="border-t pt-4 dark:border-gray-600">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                      Bank Details
                    </h4>
                    <div className="mb-4">
                      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                        Number of Bank Accounts *
                      </label>
                      <select
                        value={formData.numBankAccounts}
                        onChange={(e) => setFormData({ ...formData, numBankAccounts: parseInt(e.target.value) })}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option value={1}>1 Bank Account</option>
                        <option value={2}>2 Bank Accounts</option>
                      </select>
                    </div>

                    {/* Bank 1 */}
                    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
                      <h5 className="font-medium text-gray-900 dark:text-white">Bank Account 1</h5>
                      <div>
                        <label
                          htmlFor="bank1Name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Bank Name *
                        </label>
                        <input
                          type="text"
                          name="bank1Name"
                          id="bank1Name"
                          value={formData.bank1Name}
                          onChange={(e) => setFormData({ ...formData, bank1Name: e.target.value })}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="e.g., PUNJAB NATIONAL BANK"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bank1Account"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Account Number *
                        </label>
                        <input
                          type="text"
                          name="bank1Account"
                          id="bank1Account"
                          value={formData.bank1Account}
                          onChange={(e) => setFormData({ ...formData, bank1Account: e.target.value })}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="0030002100090414"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="bank1IFSC"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          IFSC Code *
                        </label>
                        <input
                          type="text"
                          name="bank1IFSC"
                          id="bank1IFSC"
                          value={formData.bank1IFSC}
                          onChange={(e) => setFormData({ ...formData, bank1IFSC: e.target.value.toUpperCase() })}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          placeholder="PUNB0003000"
                          required
                        />
                      </div>
                    </div>

                    {/* Bank 2 */}
                    {formData.numBankAccounts === 2 && (
                      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h5 className="font-medium text-gray-900 dark:text-white">Bank Account 2</h5>
                        <div>
                          <label
                            htmlFor="bank2Name"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Bank Name *
                          </label>
                          <input
                            type="text"
                            name="bank2Name"
                            id="bank2Name"
                            value={formData.bank2Name}
                            onChange={(e) => setFormData({ ...formData, bank2Name: e.target.value })}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="e.g., CANARA BANK"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="bank2Account"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            Account Number *
                          </label>
                          <input
                            type="text"
                            name="bank2Account"
                            id="bank2Account"
                            value={formData.bank2Account}
                            onChange={(e) => setFormData({ ...formData, bank2Account: e.target.value })}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="3306214000016"
                            required
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="bank2IFSC"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                          >
                            IFSC Code *
                          </label>
                          <input
                            type="text"
                            name="bank2IFSC"
                            id="bank2IFSC"
                            value={formData.bank2IFSC}
                            onChange={(e) => setFormData({ ...formData, bank2IFSC: e.target.value.toUpperCase() })}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="CNRB0006030"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create an account'}
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <a
                  href="/signin"
                  className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                >
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}