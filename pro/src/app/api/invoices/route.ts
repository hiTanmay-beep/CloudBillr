// app/api/invoices/route.ts

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

// GET - Fetch all invoices for current user
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await getDatabase();
    const invoices = await db
      .collection('invoices')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich with customer names
    const enrichedInvoices = await Promise.all(
      invoices.map(async (invoice: any) => {
        let customerName = 'Unknown';
        
        if (invoice.customerId) {
          try {
            const customer = await db
              .collection('customers')
              .findOne({ _id: new ObjectId(invoice.customerId) });
            
            if (customer) {
              customerName = customer.businessName || customer.name || 'Unknown';
            }
          } catch (error) {
            console.error('Error fetching customer:', error);
          }
        }

        return {
          id: invoice._id.toString(),
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate,
          customerId: invoice.customerId,
          customerName,
          totalAmount: invoice.totalAmount,
          ewayBillNo: invoice.ewaybillNo || invoice.ewayBillNo || '',
          createdAt: invoice.createdAt || new Date().toISOString(),
        };
      })
    );

    return NextResponse.json({ invoices: enrichedInvoices });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      invoiceNumber,
      invoiceDate,
      customerId,
      brokerName,
      ewaybillNo,
      items,
      discountRate,
      isSameState,
      subtotal,
      discount,
      taxableAmount,
      gstAmount,
      roundOff,
      totalAmount,
    } = body;

    // Validate required fields
    if (!invoiceNumber || !customerId || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: invoiceNumber, customerId, items' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Fetch customer from database
    let customer;
    try {
      // Try to find by ObjectId first
      customer = await db
        .collection('customers')
        .findOne({ _id: new ObjectId(customerId) });
      
      // If not found, try to find by id field
      if (!customer) {
        customer = await db
          .collection('customers')
          .findOne({ id: customerId });
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }

    if (!customer) {
      console.error('Customer not found. ID:', customerId);
      return NextResponse.json(
        {
          error: 'Customer not found in database',
          customerId,
        },
        { status: 404 }
      );
    }

    // Create new invoice document with userId
    const newInvoice = {
      userId: new ObjectId(userId),
      invoiceNumber,
      invoiceDate,
      customerId,
      customerName: customer.businessName || customer.name || 'Unknown',
      brokerName: brokerName || '',
      ewaybillNo: ewaybillNo || '',
      ewayBillNo: ewaybillNo || '',
      items,
      discountRate,
      isSameState,
      subtotal,
      discount,
      taxableAmount,
      gstAmount,
      roundOff,
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert into database
    const result = await db.collection('invoices').insertOne(newInvoice);

    console.log('Invoice created successfully:', result.insertedId);

    return NextResponse.json(
      {
        message: 'Invoice created successfully',
        invoiceId: result.insertedId.toString(),
        invoice: {
          ...newInvoice,
          _id: result.insertedId,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create invoice', details: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice (for adding eWayBill)
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invoiceId, ewayBillNo } = body;

    if (!invoiceId || ewayBillNo === undefined) {
      return NextResponse.json(
        { error: 'Missing invoiceId or ewayBillNo' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Verify the invoice belongs to the current user
    const invoice = await db.collection('invoices').findOne({
      _id: new ObjectId(invoiceId),
      userId: new ObjectId(userId),
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found or you do not have permission to modify it' },
        { status: 404 }
      );
    }

    // Find and update invoice
    const result = await db.collection('invoices').findOneAndUpdate(
      { _id: new ObjectId(invoiceId), userId: new ObjectId(userId) },
      {
        $set: {
          ewaybillNo: ewayBillNo,
          ewayBillNo: ewayBillNo,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    console.log('E-Way Bill updated for invoice:', invoiceId);

    return NextResponse.json(
      {
        message: 'E-Way Bill number updated successfully',
        invoice: result.value,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update invoice', details: errorMessage },
      { status: 500 }
    );
  }
}