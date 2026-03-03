import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const MEMORY_PATH = join(process.cwd(), '..', 'memory');

export async function GET() {
  try {
    const outcomesPath = join(MEMORY_PATH, 'outcomes');
    const files = readdirSync(outcomesPath).filter(f => f.endsWith('.json'));
    
    const outcomes = files.map(file => {
      const content = readFileSync(join(outcomesPath, file), 'utf8');
      return JSON.parse(content);
    });
    
    return NextResponse.json(outcomes);
  } catch (error) {
    return NextResponse.json([]);
  }
}
