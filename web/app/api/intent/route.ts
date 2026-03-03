import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

const MEMORY_PATH = join(process.cwd(), '..', 'memory');

export async function GET() {
  try {
    const intentPath = join(MEMORY_PATH, 'user-intent.json');
    const data = JSON.parse(readFileSync(intentPath, 'utf8'));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load intent' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const intent = await request.json();
    // In a real implementation, you would write to the file here
    // For now, just return the updated intent
    return NextResponse.json(intent);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update intent' },
      { status: 500 }
    );
  }
}
