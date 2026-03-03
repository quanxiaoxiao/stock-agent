import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const MEMORY_PATH = join(process.cwd(), '..', 'memory');

export async function GET() {
  try {
    const pendingPath = join(MEMORY_PATH, 'approvals', 'pending');
    const files = readdirSync(pendingPath).filter(f => f.endsWith('.json'));
    
    const proposals = files.map(file => {
      const content = readFileSync(join(pendingPath, file), 'utf8');
      return JSON.parse(content);
    });
    
    proposals.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json([]);
  }
}
