'use client';

import { useState, useEffect } from 'react';

interface BrokerEntry {
  brokerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  amount: number;
}

interface BrokerSummary {
  brokerName: string;
  totalInvoices: number;
  totalAmount: number;
  invoices: BrokerEntry[];
}

export default function BrokerLedgerPage() {
  const [brokerData, setBrokerData] = useState<BrokerSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(true);
  const [expandedBroker, setExpandedBroker] = useState<string | null>(null);

  useEffect(() => {
    fetchBrokerLedger();
  }, [selectedYear]);

  const fetchBrokerLedger = async () => {
    setLoading(true);
    try {
      // UPDATED: The URL now points to the correct API route location.
      const response = await fetch(`/api/broker?year=${selectedYear}`);
      const data = await response.json();
      setBrokerData(data.brokerSummary || []);
    } catch (error) {
      console.error('Error fetching broker ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBroker = (brokerName: string) => {
    setExpandedBroker(expandedBroker === brokerName ? null : brokerName);
  };

  const exportToCSV = () => {
    let csv = 'Broker Name,Invoice Number,Invoice Date,Customer Name,Amount\n';
    
    brokerData.forEach(broker => {
      broker.invoices.forEach(invoice => {
        csv += `${broker.brokerName},${invoice.invoiceNumber},${invoice.invoiceDate},"${invoice.customerName}",${invoice.amount}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `broker-ledger-${selectedYear}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Broker Ledger
          </h1>
          <div className="flex gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              📊 Export to CSV
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading broker data...</p>
          </div>
        ) : brokerData.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No broker data found for {selectedYear}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {brokerData.map((broker) => (
              <div key={broker.brokerName} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div
                  onClick={() => toggleBroker(broker.brokerName)}
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {broker.brokerName || 'No Broker'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {broker.totalInvoices} invoices
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">
                      ₹{broker.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {expandedBroker === broker.brokerName ? '▼' : '▶'} View Details
                    </p>
                  </div>
                </div>

                {expandedBroker === broker.brokerName && (
                  <div className="border-t dark:border-gray-700">
                    <table className="min-w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Invoice No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {broker.invoices.map((invoice, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {invoice.invoiceNumber}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                              {invoice.customerName}
                            </td>
                            <td className="px-6 py-4 text-sm text-right text-gray-900 dark:text-white">
                              ₹{invoice.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}

            {/* Grand Total */}
            <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Grand Total ({selectedYear})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {brokerData.reduce((sum, b) => sum + b.totalInvoices, 0)} total invoices
                  </p>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">
                  ₹{brokerData.reduce((sum, b) => sum + b.totalAmount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
