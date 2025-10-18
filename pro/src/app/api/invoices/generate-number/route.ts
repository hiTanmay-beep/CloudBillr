// app/api/invoices/generate-number/route.ts

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
    const invoices = db.collection('invoices');

    // Count invoices only for current user
    const count = await invoices.countDocuments({ userId: new ObjectId(userId) });
    const invoiceCount = count + 1;

    // Generate invoice number format: INV-2025-0001
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String(invoiceCount).padStart(4, '0')}`;

    return NextResponse.json({ invoiceNumber }, { status: 200 });
  } catch (error) {
    console.error('Error generating invoice number:', error);
    return NextResponse.json(
      { invoiceNumber: `INV-${Date.now()}` },
      { status: 200 }
    );
  }
}