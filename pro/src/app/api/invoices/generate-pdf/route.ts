// app/api/invoices/generate-pdf/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = process.env.MONGODB_DB || 'cloudbillr';

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

async function getDatabase() {
  const client = await connectToDatabase();
  return client.db(DB_NAME);
}

async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const db = await getDatabase();
    const sessions = db.collection('sessions');
    const session = await sessions.findOne({ token });

    if (!session) {
      return null;
    }

    return session.userId;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('PDF Generation Request:', { invoiceId, userId });

    const db = await getDatabase();

    let invoice;
    try {
      invoice = await db
        .collection('invoices')
        .findOne({ _id: new ObjectId(invoiceId) });
    } catch (error) {
      console.error('Invalid invoice ID format:', error);
      return NextResponse.json({ error: 'Invalid invoice ID format' }, { status: 400 });
    }

    if (!invoice) {
      return NextResponse.json(
        { error: `Invoice with ID ${invoiceId} not found` },
        { status: 404 }
      );
    }

    let customer;
    try {
      customer = await db
        .collection('customers')
        .findOne({ _id: new ObjectId(invoice.customerId) });

      if (!customer) {
        customer = await db
          .collection('customers')
          .findOne({ id: invoice.customerId });
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }

    if (!customer) {
      return NextResponse.json(
        { error: `Customer for invoice ID ${invoiceId} not found` },
        { status: 404 }
      );
    }

    let company = null;
    try {
      company = await db
        .collection('users')
        .findOne({ _id: new ObjectId(userId) });
      console.log('Company data fetched:', company);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }

    // Get the base URL for absolute image paths
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    
    const html = generateInvoiceHTML(invoice, customer, company, baseUrl);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Error generating PDF', details: errorMessage },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any, customer: any, company: any, baseUrl: string) {
  const cgst = invoice.isSameState ? (invoice.gstAmount / 2).toFixed(2) : '0.00';
  const sgst = invoice.isSameState ? (invoice.gstAmount / 2).toFixed(2) : '0.00';
  const igst = !invoice.isSameState ? invoice.gstAmount.toFixed(2) : '0.00';

  const companyName = company?.companyName || 'Shiv Sahai Shri Kishan';
  const companyType = company?.companyType || 'WHOLESALER CLOTH MERCHANT';
  const companyAddress = company?.companyAddress || '1st Floor, Mukherjee Market, Subhash Bazaar, Agra 282003 U.P., INDIA';
  const gstin = company?.gstin || '09AADFS1992C1Z6';
  const phone1 = company?.phone1 || '9411924901';
  const phone2 = company?.phone2 || '9410003450';

  // Use absolute URL for the logo
  const logoUrl = `${baseUrl}/ganesh.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 15px; background: #fff; }
    .invoice { max-width: 210mm; margin: 0 auto; border: 2px solid #000; background: white; position: relative; }

    .invoice-wrapper {
      border: 2px solid #000;
      max-width: 210mm;
      margin: 0 auto;
      background: #fff;
      position: relative;
      padding: 0;
    }
    .invoice {
      width: 100%;
      border: none;
    }

    .copy-label { text-align: left; padding: 8px 15px; font-weight: bold; font-size: 11px; color: #8B0000; border-bottom: 1px solid #000; }
    
    .top-header { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #000; align-items: center; }
    .top-left { font-size: 10px; }
    .top-center { text-align: center; font-size: 14px; font-weight: bold; background: #003366; color: white; padding: 4px 20px; border-radius: 3px; letter-spacing: 1px; }
    .top-right { font-size: 9px; text-align: right; line-height: 1.5; white-space: nowrap; }
    
    .company-header { display: flex; padding: 15px 20px; border-bottom: 2px solid #000; align-items: center; gap: 15px; }
    .company-logo { width: 70px; height: 70px; flex-shrink: 0; object-fit: contain; }
    .company-info { flex: 1; text-align: center; }
    .company-name { font-size: 32px; font-weight: bold; color: #8B0000; margin-bottom: 2px; }
    .company-type { font-size: 11px; margin-bottom: 3px; color: #000; font-weight: bold; }
    .company-address { font-size: 9px; color: #000; }
    
    .info-section { display: flex; border-bottom: 2px solid #000; min-height: 120px; }
    .info-box { flex: 1; padding: 10px 15px; border-right: 2px solid #000; }
    .info-box:last-child { border-right: none; }
    .info-box-title { font-size: 10px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; }
    .info-detail { display: flex; font-size: 10px; line-height: 1.6; margin: 2px 0; }
    .info-label { width: 90px; font-weight: 600; flex-shrink: 0; }
    .info-value { flex: 1; }
    
    table { width: 100%; border-collapse: collapse; }
    th { background: #fff; padding: 6px; text-align: center; border: 1px solid #000; font-size: 9px; font-weight: bold; }
    td { padding: 5px 8px; border: 1px solid #000; font-size: 10px; vertical-align: top; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .gross-amount-row td { border-top: 2px solid #000; font-weight: bold; padding: 8px; }
    
    .bottom-table { width: 100%; border-collapse: collapse; }
    .bottom-table td { padding: 8px; border: 1px solid #000; font-size: 10px; }
    .bottom-left-cell { width: 60%; vertical-align: top; border-right: 2px solid #000; }
    .bottom-right-cell { width: 40%; vertical-align: top; }
    
    .amount-words { padding: 10px; border-bottom: 1px solid #000; }
    .amount-words-title { font-size: 10px; font-weight: bold; margin-bottom: 5px; }
    .amount-words-text { font-size: 10px; font-style: italic; }
    
    .bank-details { padding: 10px; border-bottom: 1px solid #000; }
    .bank-details h3 { font-size: 10px; margin-bottom: 8px; font-weight: bold; }
    .bank-row { display: flex; font-size: 9px; margin-bottom: 3px; }
    .bank-label { width: 140px; font-weight: 600; }
    .bank-value { flex: 1; }
    .bank-divider { height: 1px; background: #ccc; margin: 8px 0; }
    
    .terms { padding: 10px; }
    .terms h3 { font-size: 10px; font-weight: bold; margin-bottom: 5px; }
    .terms ul { list-style: none; padding: 0; }
    .terms li { font-size: 9px; line-height: 1.5; margin-bottom: 3px; padding-left: 15px; position: relative; }
    .terms li:before { content: "•"; position: absolute; left: 0; }
    
    .totals-table { width: 100%; border-collapse: collapse; }
    .totals-table td { padding: 6px; font-size: 10px; border: 1px solid #000; }
    .totals-table td:first-child { font-weight: 600; width: 70%; }
    .totals-table td:last-child { text-align: right; width: 30%; }
    .total-row td { font-weight: bold; border-top: 2px solid #000; }
    
    .signature-area { padding: 15px; text-align: right; border-top: 2px solid #000; min-height: 80px; }
    .signature-label { font-size: 10px; font-weight: bold; margin-bottom: 40px; }
    .signature-line { font-size: 9px; margin-top: 10px; }
    
    .footer-text { font-size: 8px; padding: 8px; text-align: center; color: #666; border-top: 1px solid #000; }
    
    .no-print { text-align: center; margin: 20px 0; }
    .btn { padding: 12px 30px; margin: 0 10px; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; font-weight: bold; }
    .btn-print { background: #4CAF50; color: white; }
    .btn-download { background: #2196F3; color: white; }
    .btn-close { background: #f44336; color: white; }
    
    .copy-selector { margin-bottom: 20px; padding: 15px; background: #f5f5f5; border-radius: 5px; }
    .copy-selector-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; }
    .checkbox-group { display: flex; flex-direction: column; gap: 8px; }
    .checkbox-item { display: flex; align-items: center; }
    .checkbox-item input { width: 18px; height: 18px; margin-right: 8px; cursor: pointer; }
    .checkbox-item label { font-size: 14px; cursor: pointer; }
    
    @media print {
      body { padding: 0; margin: 0; background: #fff; }
      .no-print { display: none; }
      @page { margin: 0.5cm; size: A4; }
      .invoice { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="invoice-wrapper">
  <div class="invoice">
  <div id="invoiceContainer">
    <div class="invoice">
      <div class="top-header">
        <div class="top-left"><strong>GSTIN:</strong> ${gstin}</div>
        <div class="top-center">TAX INVOICE</div>
        <div class="top-right">
          <div>Phone no: ${phone1}</div>
          ${phone2 ? `<div>Phone no: ${phone2}</div>` : ''}
        </div>
      </div>
      
      <div class="company-header">
        <img class="company-logo" src="${logoUrl}" alt="Company Logo" onerror="this.style.display='none'" />
        <div class="company-info">
          <div class="company-name">${companyName}</div>
          <div class="company-type">${companyType}</div>
          <div class="company-address">${companyAddress}</div>
        </div>
      </div>
      
      <div class="info-section">
        <div class="info-box">
          <div class="info-box-title">Detail of Recipient (Purchaser)</div>
          <div class="info-detail"><div class="info-label">Name:</div><div class="info-value">${customer.businessName || customer.name}</div></div>
          <div class="info-detail"><div class="info-label">Address:</div><div class="info-value">${customer.address}</div></div>
          <div class="info-detail"><div class="info-label">City:</div><div class="info-value">${customer.city}, ${customer.state}</div></div>
          <div class="info-detail"><div class="info-label">GSTIN/UIN:</div><div class="info-value">${customer.gstNumber || 'N/A'}</div></div>
        </div>
        <div class="info-box">
          <div class="info-box-title">Invoice Details</div>
          <div class="info-detail"><div class="info-label">Invoice No:</div><div class="info-value">${invoice.invoiceNumber}</div></div>
          ${invoice.ewaybillNo || invoice.ewayBillNo ? `<div class="info-detail"><div class="info-label">eWayBill No:</div><div class="info-value">${invoice.ewaybillNo || invoice.ewayBillNo}</div></div>` : ''}
          <div class="info-detail"><div class="info-label">Invoice Date:</div><div class="info-value">${new Date(invoice.invoiceDate).toLocaleDateString('en-GB')}</div></div>
          ${invoice.brokerName ? `<div class="info-detail"><div class="info-label">Broker Name:</div><div class="info-value">${invoice.brokerName}</div></div>` : ''}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">Sr.</th>
            <th style="width: 40%;">Description of Goods</th>
            <th style="width: 10%;">HSN</th>
            <th style="width: 10%;">Unit</th>
            <th style="width: 10%;">Qty</th>
            <th style="width: 10%;">Rate</th>
            <th style="width: 15%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any, index: number) => `
            <tr>
              <td class="text-center">${index + 1}</td>
              <td>${item.productName}</td>
              <td class="text-center">${item.hsnCode || ''}</td>
              <td class="text-center">${item.unit}</td>
              <td class="text-center">${item.quantity}</td>
              <td class="text-right">₹${(item.rate || 0).toFixed(2)}</td>
              <td class="text-right">₹${(item.quantity * item.rate).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr class="gross-amount-row">
            <td colspan="6" class="text-right">Gross Amount</td>
            <td class="text-right">₹${invoice.subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <table class="bottom-table">
        <tr>
          <td class="bottom-left-cell">
            <div class="amount-words">
              <div class="amount-words-title">Grand Total of Invoice (in Words):</div>
              <div class="amount-words-text">${numberToWords(invoice.totalAmount)} Rupees Only</div>
            </div>
            <div class="bank-details">
              <h3>BANK DETAILS</h3>
              ${company?.bankAccounts && company.bankAccounts.length > 0 ? `
                ${company.bankAccounts.map((bank: any, idx: number) => `
                  <div class="bank-row"><div class="bank-label">Bank Name</div><div class="bank-value">${bank.bankName}</div></div>
                  <div class="bank-row"><div class="bank-label">Bank Account Number</div><div class="bank-value">${bank.accountNumber}</div></div>
                  <div class="bank-row"><div class="bank-label">Bank Branch IFSC</div><div class="bank-value">${bank.ifscCode}</div></div>
                  ${idx < company.bankAccounts.length - 1 ? '<div class="bank-divider"></div>' : ''}
                `).join('')}
              ` : `
                <div class="bank-row"><div class="bank-label">Bank Name</div><div class="bank-value">PUNJAB NATIONAL BANK</div></div>
                <div class="bank-row"><div class="bank-label">Bank Account Number</div><div class="bank-value">0030002100090414</div></div>
                <div class="bank-row"><div class="bank-label">Bank Branch IFSC</div><div class="bank-value">PUNB0003000</div></div>
                <div class="bank-divider"></div>
                <div class="bank-row"><div class="bank-label">Bank Name</div><div class="bank-value">CANARA BANK, SIKANDRA, AGRA</div></div>
                <div class="bank-row"><div class="bank-label">Bank Account Number</div><div class="bank-value">3306214000016</div></div>
                <div class="bank-row"><div class="bank-label">Bank Branch IFSC</div><div class="bank-value">CNRB0006030</div></div>
              `}
            </div>
            <div class="terms">
              <h3>Terms & Conditions:</h3>
              <ul>
                <li>All subject to Agra Jurisdiction.</li>
                <li>Our goods once sold will not be taken back or exchanged.</li>
                <li>If the bill is not paid within 45 days, interest @24% P.A will be charged extra.</li>
              </ul>
            </div>
          </td>
          <td class="bottom-right-cell">
            <table class="totals-table">
              <tr>
                 <td>Subtotal</td>
                 <td class="text-right">₹${invoice.subtotal.toFixed(2)}</td>
              </tr>
              ${invoice.discount > 0 ? `
              <tr>
                <td>Less: Discount (${invoice.discountRate}%)</td>
                <td class="text-right">-₹${invoice.discount.toFixed(2)}</td>
              </tr>` : ''}
              <tr>
                <td>Taxable Amount</td>
                <td class="text-right">₹${invoice.taxableAmount.toFixed(2)}</td>
              </tr>
              ${invoice.isSameState ? `
              <tr>
                <td>Add: CGST @ 2.5%</td>
                <td class="text-right">₹${cgst}</td>
              </tr>
              <tr>
                <td>Add: SGST @ 2.5%</td>
                <td class="text-right">₹${sgst}</td>
              </tr>` : `
              <tr>
                <td>Add: IGST @ 5%</td>
                <td class="text-right">₹${igst}</td>
              </tr>`}
              <tr>
                <td>Round off</td>
                <td class="text-right">${invoice.roundOff >= 0 ? '+' : ''}₹${Math.abs(invoice.roundOff).toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td><strong>Total Amount</strong></td>
                <td class="text-right"><strong>₹${invoice.totalAmount.toFixed(2)}</strong></td>
              </tr>
            </table>
            <div class="signature-area">
              <div class="signature-label">For ${companyName}</div>
              <div class="signature-line">Authorized Signatory</div>
            </div>
          </td>
        </tr>
      </table>

      <div class="footer-text">
        Certified that the particulars given above are true & correct.<br>
        This is a computer-generated invoice. Thank you for your business!
      </div>
    </div>
  </div>
 </div>
</div>
  <div class="no-print">
    <div class="copy-selector">
      <div class="copy-selector-title">Select Copies to Print:</div>
      <div class="checkbox-group">
        <div class="checkbox-item">
          <input type="checkbox" id="copy1" checked disabled>
          <label for="copy1">Original for Recipient (Default)</label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="copy2">
          <label for="copy2">Duplicate for Transporter </label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="copy3">
          <label for="copy3">Duplicate for Transporter </label>
        </div>
        <div class="checkbox-item">
          <input type="checkbox" id="copy4">
          <label for="copy4">Triplicate for Supplier</label>
        </div>
      </div>
    </div>
    <button onclick="printMultipleCopies()" class="btn btn-print">🖨️ Print Invoice</button>
    <button onclick="downloadPDF()" class="btn btn-download">💾 Save as PDF</button>
    <button onclick="window.close()" class="btn btn-close">❌ Close</button>
  </div>

  <script>
    const invoiceHTML = document.querySelector('.invoice').innerHTML;
    const logoUrl = '${logoUrl}';

    function printMultipleCopies() {
      let pages = [];
      pages.push({ name: 'Original for Recipient', html: invoiceHTML });
      
      if (document.getElementById('copy2').checked) {
        pages.push({ name: 'Duplicate for Transporter ', html: invoiceHTML });
      }
      if (document.getElementById('copy3').checked) {
        pages.push({ name: 'Duplicate for Transporter ', html: invoiceHTML });
      }
      if (document.getElementById('copy4').checked) {
        pages.push({ name: 'Triplicate for Supplier', html: invoiceHTML });
      }

      let printHTML = '';
      pages.forEach((page, index) => {
        const copyLabel = '<div class="copy-label">' + page.name + '</div>';
        printHTML += copyLabel + page.html;
        
        if (index < pages.length - 1) {
          printHTML += '<div style="page-break-after: always;"></div>';
        }
      });

      const printWindow = window.open('', '', 'width=900,height=700');
      const printCSS = \`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 10px; margin: 0; background: #fff; }
        .invoice { max-width: 210mm; margin: 0 auto; border: 2px solid #000; background: white; width: 100%; }
        .copy-label { text-align: left; padding: 8px 15px; font-weight: bold; font-size: 11px; color: #8B0000; border-bottom: 1px solid #000; }
        .top-header { display: flex; justify-content: space-between; padding: 8px 15px; border-bottom: 1px solid #000; align-items: center; }
        .top-left { font-size: 10px; }
        .top-center { text-align: center; font-size: 14px; font-weight: bold; background: #003366; color: white; padding: 4px 20px; }
        .top-right { font-size: 9px; text-align: right; white-space: nowrap; }
        .company-header { display: flex; padding: 15px 20px; border-bottom: 2px solid #000; align-items: center; gap: 15px; }
        .company-logo { width: 70px; height: 70px; flex-shrink: 0; object-fit: contain; }
        .company-info { text-align: center; flex: 1; }
        .company-name { font-size: 32px; font-weight: bold; color: #8B0000; margin-bottom: 2px; }
        .company-type { font-size: 11px; font-weight: bold; }
        .company-address { font-size: 9px; }
        .info-section { display: flex; border-bottom: 2px solid #000; }
        .info-box { flex: 1; padding: 10px 15px; border-right: 2px solid #000; }
        .info-box:last-child { border-right: none; }
        .info-box-title { font-size: 10px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 3px; }
        .info-detail { display: flex; font-size: 10px; line-height: 1.6; margin: 2px 0; }
        .info-label { width: 120px; font-weight: 600; }
        .info-value { flex: 1; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #fff; padding: 6px; text-align: center; border: 1px solid #000; font-size: 9px; font-weight: bold; }
        td { padding: 5px 8px; border: 1px solid #000; font-size: 10px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .gross-amount-row td { border-top: 2px solid #000; font-weight: bold; padding: 8px; }
        .bottom-table { width: 100%; border-collapse: collapse; border-top: 2px solid #000; }
        .bottom-table td { padding: 8px; border: 1px solid #000; font-size: 10px; vertical-align: top; }
        .bottom-left-cell { width: 60%; border-right: 2px solid #000; }
        .bottom-right-cell { width: 40%; }
        .amount-words { padding: 10px; border-bottom: 1px solid #000; }
        .amount-words-title { font-size: 10px; font-weight: bold; margin-bottom: 5px; }
        .amount-words-text { font-size: 10px; font-style: italic; }
        .bank-details { padding: 10px; border-bottom: 1px solid #000; }
        .bank-details h3 { font-size: 10px; margin-bottom: 8px; font-weight: bold; }
        .bank-row { display: flex; font-size: 9px; margin-bottom: 3px; }
        .bank-label { width: 140px; font-weight: 600; }
        .bank-value { flex: 1; }
        .bank-divider { height: 1px; background: #ccc; margin: 8px 0; }
        .terms { padding: 10px; }
        .terms h3 { font-size: 10px; font-weight: bold; margin-bottom: 5px; }
        .terms ul { list-style: none; padding: 0; }
        .terms li { font-size: 9px; line-height: 1.5; margin-bottom: 3px; padding-left: 15px; position: relative; }
        .terms li:before { content: "•"; position: absolute; left: 0; }
        .totals-table { width: 100%; border-collapse: collapse; }
        .totals-table td { padding: 6px; border: 1px solid #000; font-size: 10px; }
        .totals-table td:first-child { font-weight: 600; width: 70%; }
        .totals-table td:last-child { text-align: right; width: 30%; }
        .total-row td { font-weight: bold; border-top: 2px solid #000; }
        .signature-area { padding: 15px; text-align: right; border-top: 2px solid #000; min-height: 80px; }
        .signature-label { font-size: 10px; font-weight: bold; margin-bottom: 40px; }
        .signature-line { font-size: 9px; margin-top: 10px; }
        .footer-text { font-size: 8px; padding: 8px; text-align: center; color: #666; border-top: 1px solid #000; }
        @media print { body { margin: 0; padding: 10px; } @page { margin: 10px; size: A4; } .invoice { page-break-inside: avoid; border: 2px solid #000; width: 100%; } }
      \`;

      printWindow.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Invoice-${invoice.invoiceNumber}</title><style>' + printCSS + '</style></head><body>');
      printWindow.document.write(printHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
      }, 250);
    }

    function downloadPDF() {
      printMultipleCopies();
    }
  </script>
</body>
</html>
  `;
}

function numberToWords(num: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    function convertBelowThousand(n: number): string {
        if (n === 0) return '';
        let result = '';
        if (n >= 100) {
            result += ones[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            result += teens[n - 10] + ' ';
            return result;
        }
        if (n > 0) {
            result += ones[n] + ' ';
        }
        return result;
    }

    if (num === 0) return 'Zero';
    const integerPart = Math.floor(num);
    let words = '';
    if (integerPart >= 10000000) {
        words += convertBelowThousand(Math.floor(integerPart / 10000000)) + 'Crore ';
    }
    const remainderAfterCrores = integerPart % 10000000;
    if (remainderAfterCrores >= 100000) {
        words += convertBelowThousand(Math.floor(remainderAfterCrores / 100000)) + 'Lakh ';
    }
    const remainderAfterLakhs = integerPart % 100000;
    if (remainderAfterLakhs >= 1000) {
        words += convertBelowThousand(Math.floor(remainderAfterLakhs / 1000)) + 'Thousand ';
    }
    const remainderAfterThousands = integerPart % 1000;
    if (remainderAfterThousands > 0) {
        words += convertBelowThousand(remainderAfterThousands);
    }
    return words.trim();
}