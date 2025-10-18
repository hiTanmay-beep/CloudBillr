// app/api/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const users = db.collection('users');

    const user = await users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);

    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const {
      password,
      companyName,
      companyType,
      companyAddress,
      gstin,
      phone1,
      phone2,
      numBankAccounts,
      bank1Name,
      bank1Account,
      bank1IFSC,
      bank2Name,
      bank2Account,
      bank2IFSC
    } = await request.json();

    // Validation
    if (!companyName || !gstin) {
      return NextResponse.json(
        { error: 'Company name and GSTIN are required' },
        { status: 400 }
      );
    }

    if (!phone1) {
      return NextResponse.json(
        { error: 'Primary phone number is required' },
        { status: 400 }
      );
    }

    if (!bank1Name || !bank1Account || !bank1IFSC) {
      return NextResponse.json(
        { error: 'Bank Account 1 details are required' },
        { status: 400 }
      );
    }

    if (numBankAccounts === 2 && (!bank2Name || !bank2Account || !bank2IFSC)) {
      return NextResponse.json(
        { error: 'Bank Account 2 details are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const users = db.collection('users');

    // Build update object
    const updateData: any = {
      companyName,
      companyType: companyType || '',
      companyAddress: companyAddress || '',
      gstin: gstin.toUpperCase(),
      phone1,
      phone2: phone2 || '',
      updatedAt: new Date()
    };

    // Add password if provided
    if (password) {
      updateData.password = hashPassword(password);
    }

    // Create bank accounts array
    const bankAccounts = [
      {
        bankName: bank1Name,
        accountNumber: bank1Account,
        ifscCode: bank1IFSC
      }
    ];

    if (numBankAccounts === 2) {
      bankAccounts.push({
        bankName: bank2Name,
        accountNumber: bank2Account,
        ifscCode: bank2IFSC
      });
    }

    updateData.bankAccounts = bankAccounts;

    // Update user
    const result = await users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result || !result.value) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = result.value;

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: userWithoutPassword
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}