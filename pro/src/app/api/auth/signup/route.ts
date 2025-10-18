// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\d\s+\-()]*\d[\d\s+\-()]*\d[\d\s+\-()]*\d$/;
  const digitsOnly = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

export async function POST(request: NextRequest) {
  try {
    const {
      email,
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

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

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

    if (!validatePhoneNumber(phone1)) {
      return NextResponse.json(
        { error: 'Invalid primary phone number format' },
        { status: 400 }
      );
    }

    if (phone2 && !validatePhoneNumber(phone2)) {
      return NextResponse.json(
        { error: 'Invalid secondary phone number format' },
        { status: 400 }
      );
    }

    // Validate bank details
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

    // Check if user exists
    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
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

    // Create new user with company details and bank details
    const newUser = {
      email: email.toLowerCase(),
      password: hashPassword(password),
      companyName,
      companyType: companyType || '',
      companyAddress: companyAddress || '',
      gstin: gstin.toUpperCase(),
      phone1,
      phone2: phone2 || '',
      bankAccounts,
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: {
          id: result.insertedId,
          email: newUser.email,
          companyName: newUser.companyName,
          phone1: newUser.phone1
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}