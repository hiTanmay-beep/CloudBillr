'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  gstNumber: string;
  businessName: string;
  contactPerson: string;
  phone: string;
  address: string;
  city: string;
  state: string;
}

interface Product {
  id: string;
  name: string;
  hsnCode: string;
  defaultPrice: number;
  defaultGst: number;
}

interface Broker {
  id: string;
  name: string;
}

interface InvoiceItem {
  id: string;
  productName: string;
  hsnCode: string;
  unit: string;
  quantity: number;
  rate: number;
  gstRate: number;
  amount: number;
}

const GST_RATES = [0, 5, 12, 18, 28];
const DISCOUNT_RATES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
const UNITS = ['Pcs', 'Kg', 'Than', 'Meter', 'Box'];

export default function CreateInvoicePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [brokerName, setBrokerName] = useState('');
  const [ewaybillNo, setEwaybillNo] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', productName: '', hsnCode: '', unit: 'Pcs', quantity: 1, rate: 0, gstRate: 5, amount: 0 }
  ]);
  const [discountRate, setDiscountRate] = useState(0);
  const [isSameState, setIsSameState] = useState(true);
  const [loading, setLoading] = useState(false);
  const [invoiceCopies, setInvoiceCopies] = useState<string[]>(['original']);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchBrokers();
    generateInvoiceNumber();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const response = await fetch('/api/brokers');
      const data = await response.json();
      setBrokers(data.brokers || []);
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const response = await fetch('/api/invoices/generate-number');
      const data = await response.json();
      setInvoiceNumber(data.invoiceNumber);
    } catch (error) {
      setInvoiceNumber(`INV-${Date.now()}`);
    }
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      productName: '',
      hsnCode: '',
      unit: 'Pcs',
      quantity: 1,
      rate: 0,
      gstRate: 5,
      amount: 0
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setItems(currentItems =>
      currentItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, ...updates };
          updatedItem.amount = (updatedItem.quantity || 0) * (updatedItem.rate || 0);
          return updatedItem;
        }
        return item;
      })
    );
  };

  const selectProduct = (id: string, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      updateItem(id, {
        productName: product.name,
        hsnCode: product.hsnCode,
        rate: product.defaultPrice,
        gstRate: product.defaultGst,
      });
    }
  };
  
  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.amount, 0);
  const calculateDiscount = () => (calculateSubtotal() * discountRate) / 100;
  const calculateTaxableAmount = () => calculateSubtotal() - calculateDiscount();
  const calculateGST = () => {
    let totalGST = 0;
    items.forEach(item => {
      const itemTaxableAmount = (item.quantity * item.rate) * (1 - discountRate / 100);
      const gstAmount = (itemTaxableAmount * item.gstRate) / 100;
      totalGST += gstAmount;
    });
    return totalGST;
  };
  const calculateTotal = () => calculateTaxableAmount() + calculateGST();
  const getRoundOff = () => {
    const total = calculateTotal();
    return Math.round(total) - total;
  };
  const getFinalTotal = () => Math.round(calculateTotal());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer');
      return;
    }
    if (items.some(item => !item.productName || item.quantity <= 0 || item.rate < 0)) {
      alert('Please fill all item details correctly (Product Name, Quantity, and Rate).');
      return;
    }
    setLoading(true);

    try {
      const invoiceData = {
        invoiceNumber,
        invoiceDate,
        customerId: selectedCustomer.id,
        brokerName,
        ewaybillNo,
        items: items.map(({ id, amount, ...rest }) => ({ ...rest })),
        discountRate,
        isSameState,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        taxableAmount: calculateTaxableAmount(),
        gstAmount: calculateGST(),
        roundOff: getRoundOff(),
        totalAmount: getFinalTotal()
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Invoice created successfully!');

        const pdfResponse = await fetch('/api/invoices/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invoiceId: data.invoiceId })
        });
        
        const html = await pdfResponse.text();
        
        // Generate PDFs for each selected copy
        invoiceCopies.forEach((copyType, index) => {
          const newWindow = window.open('', '_blank');
          if (newWindow) {
            const modifiedHtml = html.replace(
              '<div class="top-center">TAX INVOICE</div>',
              `<div class="top-center">TAX INVOICE</div>`
            );

            
            newWindow.document.write(modifiedHtml);
            newWindow.document.close();
          }
        });
        
        router.push('/invoices');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      alert('An error occurred while creating the invoice.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:border-x-4 print:border-black print:px-8 print:py-6">

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Invoice</h1>

        <form onSubmit={handleSubmit} className="space-y-6 print:border-x-4 print:border-black print:px-8 print:py-6">
          {/* Invoice Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Customer *</label>
                <select
                  value={selectedCustomer?.id || ''}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === e.target.value);
                    setSelectedCustomer(customer || null);
                  }}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.businessName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Broker Name</label>
                <input
                  type="text"
                  list="broker-list"
                  value={brokerName}
                  onChange={(e) => setBrokerName(e.target.value)}
                  placeholder="Select or enter broker"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <datalist id="broker-list">
                  {brokers.map(broker => (
                    <option key={broker.id} value={broker.name} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">eWayBill No</label>
                <input
                  type="text"
                  value={ewaybillNo}
                  onChange={(e) => setEwaybillNo(e.target.value)}
                  placeholder="Enter eWayBill number"
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            {selectedCustomer && (
              <div className="p-4 bg-blue-50 dark:bg-gray-800/50 rounded-lg">
                 <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{selectedCustomer.businessName}</h3>
                 <p className="text-sm text-gray-600 dark:text-gray-300">
                   GST: {selectedCustomer.gstNumber}<br />
                   {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}<br />
                   Contact: {selectedCustomer.contactPerson} | {selectedCustomer.phone}
                 </p>
                 <div className="mt-4 space-y-3">
                   <div>
                     <label className="flex items-center">
                       <input
                         type="checkbox"
                         checked={isSameState}
                         onChange={(e) => setIsSameState(e.target.checked)}
                         className="mr-2"
                       />
                       <span className="text-sm text-gray-700 dark:text-gray-300">Same state transaction (CGST + SGST) | Uncheck for IGST</span>
                     </label>
                   </div>
                 </div>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Items</h2>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >+ Add Item</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs">Product</th>
                    <th className="px-2 py-2 text-left text-xs">HSN</th>
                    <th className="px-2 py-2 text-left text-xs">Unit</th>
                    <th className="px-2 py-2 text-left text-xs">Qty</th>
                    <th className="px-2 py-2 text-left text-xs">Rate</th>
                    <th className="px-2 py-2 text-left text-xs">GST%</th>
                    <th className="px-2 py-2 text-left text-xs">Amount</th>
                    <th className="px-2 py-2 text-left text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t dark:border-gray-700">
                      <td className="px-2 py-2 min-w-[200px]">
                        <select
                          value=""
                          onChange={(e) => selectProduct(item.id, e.target.value)}
                          className="w-full px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <option value="">Select Product...</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>{product.name}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.productName}
                          onChange={(e) => updateItem(item.id, { productName: e.target.value })}
                          placeholder="Or type product name"
                          className="w-full px-2 py-1 border rounded text-xs mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={item.hsnCode}
                          onChange={(e) => updateItem(item.id, { hsnCode: e.target.value })}
                          placeholder="HSN"
                          className="w-20 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                          className="w-20 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {UNITS.map(unit => (<option key={unit} value={unit}>{unit}</option>))}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="any"
                          className="w-16 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                          min="0"
                          step="any"
                          className="w-20 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={item.gstRate}
                          onChange={(e) => updateItem(item.id, { gstRate: parseFloat(e.target.value) })}
                          className="w-16 px-2 py-1 border rounded text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {GST_RATES.map(rate => (<option key={rate} value={rate}>{rate}%</option>))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-xs">₹{item.amount.toFixed(2)}</td>
                      <td className="px-2 py-2">
                        {items.length > 1 && (
                          <button type="button" onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700 text-xs">Remove</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Calculations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div></div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-3">
                  <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Subtotal:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{calculateSubtotal().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <span className="text-gray-700 dark:text-gray-300">Discount:</span>
                          <select
                              value={discountRate}
                              onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
                              className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          >
                              {DISCOUNT_RATES.map(rate => (
                                  <option key={rate} value={rate}>{rate}%</option>
                              ))}
                          </select>
                      </div>
                      <span className="font-semibold text-red-600">-₹{calculateDiscount().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t dark:border-gray-700 pt-2">
                      <span className="text-gray-700 dark:text-gray-300">Taxable Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">₹{calculateTaxableAmount().toFixed(2)}</span>
                  </div>

                  {isSameState ? (
                      <>
                          <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">CGST:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">₹{(calculateGST() / 2).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-gray-700 dark:text-gray-300">SGST:</span>
                              <span className="font-semibold text-gray-900 dark:text-white">₹{(calculateGST() / 2).toFixed(2)}</span>
                          </div>
                      </>
                  ) : (
                      <div className="flex justify-between">
                          <span className="text-gray-700 dark:text-gray-300">IGST:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">₹{calculateGST().toFixed(2)}</span>
                      </div>
                  )}

                  <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">Round Off:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{getRoundOff() >= 0 ? '+' : '-'}₹{Math.abs(getRoundOff()).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between border-t-2 border-gray-300 dark:border-gray-600 pt-3 text-lg">
                      <span className="font-bold text-gray-900 dark:text-white">Total Amount:</span>
                      <span className="font-bold text-green-600 text-xl">₹{getFinalTotal().toFixed(2)}</span>
                  </div>
              </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {loading ? 'Creating Invoice...' : '📄 Create Invoice & Generate PDF'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <style jsx global>{`
  @media print {
    @page {
      margin: 0;
    }
    .max-w-7xl {
      border-left: 3px solid #000;
      border-right: 3px solid #000;
      padding-left: 20px;
      padding-right: 20px;
      box-sizing: border-box;
    }
  }
`}</style>


          </div>
        </form>
      </div>
    </div>
  );
}