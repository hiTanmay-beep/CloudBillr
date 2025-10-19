//customers/page.tsx

'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// --- Type Definitions ---
interface Customer {
  id: string;
  gstNumber: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

interface FormData {
  gstNumber: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

// --- Main Component ---
export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gstLoading, setGstLoading] = useState(false);
  const [gstError, setGstError] = useState<string | null>(null);
  
  const initialFormData: FormData = {
    gstNumber: '',
    businessName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  };
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error: unknown) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'gstNumber' ? value.toUpperCase() : value }));
  };
  
  // --- GST LOOKUP FUNCTIONALITY ---
  const fetchGSTDetails = async () => {
    if (formData.gstNumber.length !== 15) {
      setGstError('GST Number must be 15 characters long.');
      return;
    }
    
    setGstLoading(true);
    setGstError(null);

    try {
      const response = await fetch(`/api/gst-lookup?gstNumber=${formData.gstNumber}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch GST details.');
      }
      
      // Auto-fill the form with the fetched data
      setFormData(prev => ({
        ...prev,
        businessName: data.businessName || '',
        address: data.address || '',
      }));

    } catch (err: unknown) {
      if (err instanceof Error) {
        setGstError(err.message);
      } else {
        setGstError('An unexpected error occurred during GST lookup.');
      }
    } finally {
      setGstLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Customer added successfully!');
        setShowForm(false);
        setFormData(initialFormData);
        fetchCustomers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add customer.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
          alert(`Error: ${error.message}`);
      }
      console.error('Error adding customer:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {showForm ? 'Cancel' : '+ Add Customer'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add New Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2">
                <div className="flex-1 w-full">
                  <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    GST Number *
                  </label>
                  <input
                    id="gstNumber"
                    name="gstNumber"
                    type="text"
                    value={formData.gstNumber}
                    onChange={handleInputChange}
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchGSTDetails}
                  disabled={gstLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                >
                  {gstLoading ? 'Fetching...' : 'Fetch Details'}
                </button>
              </div>
              {gstError && <p className="text-sm text-red-500 mt-1">{gstError}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* --- Other form fields remain the same --- */}
                <InputField label="Business Name *" name="businessName" value={formData.businessName} onChange={handleInputChange} required />
                <InputField label="Contact Person *" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} required />
                <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                <InputField label="Phone *" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address *</label>
                    <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" rows={2} required />
                </div>
                <InputField label="City *" name="city" value={formData.city} onChange={handleInputChange} required />
                <InputField label="State *" name="state" value={formData.state} onChange={handleInputChange} required />
                <InputField label="Pincode *" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
              </div>

              <button type="submit" disabled={loading} className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                {loading ? 'Saving...' : 'Save Customer'}
              </button>
            </form>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Add horizontal scroll wrapper for mobile */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap">GST Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase whitespace-nowrap">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {customers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">No customers found.</td></tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{customer.businessName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{customer.gstNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{customer.contactPerson}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{customer.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">{customer.city}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Component for Form Inputs ---
interface InputFieldProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    required?: boolean;
}

const InputField = ({ label, name, value, onChange, type = 'text', required = false }: InputFieldProps) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" required={required} />
    </div>
);

