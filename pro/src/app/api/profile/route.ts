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
      console.log('No auth token found');
      return null;
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const sessions = db.collection('sessions');
    const session = await sessions.findOne({ token });

    if (!session) {
      console.log('No session found for token');
      return null;
    }

    console.log('Session found, userId:', session.userId);
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

    // Try to find user by ObjectId or string ID
    let user;
    try {
      user = await users.findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0 } }
      );
    } catch (e) {
      // If ObjectId conversion fails, try with string
      user = await users.findOne(
        { _id: userId as any },
        { projection: { password: 0 } }
      );
    }

    if (!user) {
      console.log('User not found with userId:', userId);
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
    console.log('='.repeat(60));
    console.log('PUT request - userId from session:', userId);
    console.log('userId type:', typeof userId);

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

    // First, let's check if user exists
    console.log('Checking if user exists with userId:', userId);
    let existingUser;
    try {
      existingUser = await users.findOne({ _id: new ObjectId(userId) });
      console.log('Found user with ObjectId:', existingUser ? 'YES' : 'NO');
    } catch (e) {
      console.log('ObjectId search failed, trying string...');
      existingUser = await users.findOne({ _id: userId as any });
      console.log('Found user with string ID:', existingUser ? 'YES' : 'NO');
    }

    if (!existingUser) {
      console.log('❌ User not found in database!');
      console.log('Available users in collection:');
      const allUsers = await users.find({}, { projection: { _id: 1, email: 1 } }).limit(5).toArray();
      console.log(allUsers);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found, proceeding with update');

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

    // Update user using the same _id format as found
    console.log('Updating user with _id:', existingUser._id);
    console.log('Update data:', JSON.stringify(updateData, null, 2));
    
    const result = await users.updateOne(
      { _id: existingUser._id },
      { $set: updateData }
    );

    console.log('Update result:', result);

    if (!result.acknowledged || result.matchedCount === 0) {
      console.log('❌ Update failed - no documents matched');
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    console.log('✅ Profile updated successfully');
    
    // Fetch the updated user
    const updatedUser = await users.findOne(
      { _id: existingUser._id },
      { projection: { password: 0 } }
    );

    if (!updatedUser) {
      console.log('❌ Could not fetch updated user');
      return NextResponse.json({ error: 'Update succeeded but could not fetch user' }, { status: 500 });
    }

    console.log('✅ Fetched updated user');
    console.log('='.repeat(60));

    const userWithoutPassword = updatedUser;

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: userWithoutPassword
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}