'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  customerId: string;
  customerName: string; 
  totalAmount: number;
  ewayBillNo?: string; // E-Way Bill is optional
  createdAt: string;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [ewayBills, setEwayBills] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      const fetchedInvoices = data.invoices || [];
      setInvoices(fetchedInvoices);
      
      const initialEwayBills: { [key: string]: string } = {};
      fetchedInvoices.forEach((invoice: Invoice) => {
        if (invoice.ewayBillNo) {
          initialEwayBills[invoice.id] = invoice.ewayBillNo;
        }
      });
      setEwayBills(initialEwayBills);

    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = useMemo(() => {
    if (!searchQuery) {
      return invoices;
    }
    return invoices.filter(invoice => {
        const query = searchQuery.toLowerCase();
        const invoiceNumMatch = invoice.invoiceNumber.toLowerCase().includes(query);
        const customerNameMatch = invoice.customerName ? invoice.customerName.toLowerCase().includes(query) : false;
        return invoiceNumMatch || customerNameMatch;
    });
  }, [invoices, searchQuery]);


  const viewInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/invoices/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const html = await response.text();
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (error) {
      console.error(error);
      alert('Error viewing invoice');
    }
  };
  
  const handleEwayBillChange = (invoiceId: string, value: string) => {
    setEwayBills(prev => ({ ...prev, [invoiceId]: value }));
  };

  // FIX: This function has been corrected to use the right API endpoint and method.
  const handleSaveEwayBill = async (invoiceId: string) => {
    const ewayBillNo = ewayBills[invoiceId] || '';
    try {
      // This now correctly points to your main API route with the PATCH method
      const response = await fetch(`/api/invoices`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, ewayBillNo }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save E-Way Bill number.');
      }
      
      const result = await response.json();
      alert(result.message); // Show a success message from the API

      // Refetch the data to confirm the save and update the UI
      fetchInvoices();

    } catch (error) {
      console.error(error);
      alert('Error saving E-Way Bill number.');
    }
  };

  const handleGenerateReport = () => {
    if (!reportStartDate || !reportEndDate) {
      alert('Please select both a start and end date.');
      return;
    }
    const startDate = new Date(reportStartDate);
    const endDate = new Date(reportEndDate);
    const reportData = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.invoiceDate);
        return invoiceDate >= startDate && invoiceDate <= endDate;
    });

    if (reportData.length === 0) {
        alert('No invoices found in the selected date range.');
        return;
    }
    
    const headers = ['Invoice Number', 'Date', 'Biller Name', 'Amount', 'E-Way Bill No.'];
    const csvContent = [
        headers.join(','),
        ...reportData.map(inv => [
            inv.invoiceNumber,
            new Date(inv.invoiceDate).toLocaleDateString('en-IN'),
            `"${inv.customerName}"`,
            inv.totalAmount,
            inv.ewayBillNo || 'N/A'
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Invoice_Report_${reportStartDate}_to_${reportEndDate}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    setIsReportModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
            <div className="flex gap-4">
               <button onClick={() => setIsReportModalOpen(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">📊 Generate Report</button>
              <button onClick={() => router.push('/invoices/create')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">+ Create New Invoice</button>
            </div>
          </div>
          
          <div className="mb-6 max-w-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Invoice No or Biller Name..."
              className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Loading invoices...</p></div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Invoice #</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Biller Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">E-Way Bill No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <p className="text-lg mb-2">No invoices found</p>
                          <p className="text-sm">{searchQuery ? 'Try adjusting your search query.' : 'Create your first invoice!'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{invoice.customerName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">₹{invoice.totalAmount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                           <div className="flex items-center gap-2">
                               <input 
                                   type="text"
                                   value={ewayBills[invoice.id] || ''}
                                   onChange={(e) => handleEwayBillChange(invoice.id, e.target.value)}
                                   placeholder="Enter E-Way Bill No."
                                   className="w-full px-2 py-1 border rounded-md text-xs dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                               />
                               <button 
                                   onClick={() => handleSaveEwayBill(invoice.id)}
                                   className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                                >
                                   Save
                                </button>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button onClick={() => viewInvoice(invoice.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">View PDF</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Generate Invoice Report</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                        <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                        <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"/>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-4">
                    <button onClick={() => setIsReportModalOpen(false)} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
                    <button onClick={handleGenerateReport} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Download Report (CSV)</button>
                </div>
            </div>
        </div>
      )}
    </>
  );
}

