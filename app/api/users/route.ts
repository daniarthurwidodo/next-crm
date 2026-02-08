import { NextRequest, NextResponse } from 'next/server';
import { getUsers, createUser } from '@/lib/controllers/userController';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ route: 'api/users' });

export async function GET(req: NextRequest) {
  // List all users
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : error }, 'GET /api/users failed');
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Failed to fetch users', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Create new user
  try {
    const body = await req.json();
    const user = await createUser(body);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    logger.error({ err: error instanceof Error ? error.message : error }, 'POST /api/users failed');
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: 'Failed to create user', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
