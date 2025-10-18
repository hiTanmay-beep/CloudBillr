// app/api/products/route.ts

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
    const products = await db
      .collection('products')
      .find({ userId: new ObjectId(userId) })
      .toArray();

    // Convert _id to id
    const formattedProducts = products.map(product => ({
      ...product,
      id: product._id.toString(),
      _id: undefined,
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error fetching products' }, { status: 500 });
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
    const products = db.collection('products');

    const newProduct = {
      name: data.name,
      hsnCode: data.hsnCode,
      defaultPrice: data.defaultPrice || 0,
      defaultGst: data.defaultGst || 5,
      userId: new ObjectId(userId),
      createdAt: new Date(),
    };

    const result = await products.insertOne(newProduct);

    return NextResponse.json(
      {
        message: 'Product added successfully',
        product: { ...newProduct, id: result.insertedId.toString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ error: 'Error adding product' }, { status: 500 });
  }
}