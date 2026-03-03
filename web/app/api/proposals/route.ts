import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const MEMORY_PATH = join(process.cwd(), '..', 'memory');

export async function GET() {
  try {
    const proposalsPath = join(MEMORY_PATH, 'proposals');
    const files = readdirSync(proposalsPath).filter(f => f.endsWith('.json'));
    
    const proposals = files.map(file => {
      const content = readFileSync(join(proposalsPath, file), 'utf8');
      return JSON.parse(content);
    });
    
    // Sort by timestamp descending
    proposals.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json([]);
  }
}
