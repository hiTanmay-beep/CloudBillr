// app/api/customers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
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

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const customers = await db
      .collection('customers')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Convert _id to id for frontend compatibility
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      id: customer._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ customers: formattedCustomers }, { status: 200 });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const customers = db.collection('customers');

    // Check for existing customer with same GST number for this user
    const existing = await customers.findOne({
      userId: new ObjectId(userId),
      gstNumber: data.gstNumber,
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Customer with this GST number already exists' },
        { status: 400 }
      );
    }

    const newCustomer = {
      ...data,
      userId: new ObjectId(userId),
      createdAt: new Date(),
    };

    const result = await customers.insertOne(newCustomer);

    return NextResponse.json(
      {
        message: 'Customer added successfully',
        customer: { ...newCustomer, id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding customer:', error);
    return NextResponse.json({ error: 'Error adding customer' }, { status: 500 });
  }
}