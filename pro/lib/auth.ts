// lib/auth.ts

import { NextRequest } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getCurrentUser(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const client = await clientPromise;
    const db = client.db('cloudbillr');
    const users = db.collection('users');

    // Find user by email (you need to store token mapping or use JWT)
    // For now, we'll use a simpler approach - store userId in a sessions collection
    const sessions = db.collection('sessions');
    const session = await sessions.findOne({ token });

    if (!session) {
      return null;
    }

    const user = await users.findOne({ _id: new ObjectId(session.userId) });
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

export async function getCurrentUserId(request: NextRequest) {
  const user = await getCurrentUser(request);
  return user?._id?.toString();
}