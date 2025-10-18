// app/api/brokers/route.ts

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

    const year = request.nextUrl.searchParams.get('year');
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${Number(year) + 1}-01-01`);

    // Fetch invoices for the selected year AND current user
    const invoices = await db
      .collection('invoices')
      .find({
        userId: new ObjectId(userId),
        invoiceDate: { $gte: startDate.toISOString(), $lt: endDate.toISOString() },
      })
      .toArray();

    // Group invoices by broker
    const brokerMap: Record<string, any> = {};

    invoices.forEach(inv => {
      const brokerName = inv.brokerName || 'No Broker';
      if (!brokerMap[brokerName]) {
        brokerMap[brokerName] = {
          brokerName,
          totalInvoices: 0,
          totalAmount: 0,
          invoices: [],
        };
      }

      const amount = inv.totalAmount || 0;

      brokerMap[brokerName].totalInvoices += 1;
      brokerMap[brokerName].totalAmount += amount;
      brokerMap[brokerName].invoices.push({
        brokerName,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        customerName: inv.customerName,
        amount,
      });
    });

    const brokerSummary = Object.values(brokerMap);

    return NextResponse.json({ brokerSummary }, { status: 200 });
  } catch (error) {
    console.error('Error fetching broker ledger:', error);
    return NextResponse.json({ brokerSummary: [] }, { status: 500 });
  }
}