import { NextResponse } from 'next/server';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const MEMORY_PATH = join(process.cwd(), '..', 'memory');

export async function GET() {
  try {
    const reflectionsPath = join(MEMORY_PATH, 'memory', 'reflections');
    const files = readdirSync(reflectionsPath).filter(f => f.endsWith('.json'));
    
    const reflections = files.map(file => {
      const content = readFileSync(join(reflectionsPath, file), 'utf8');
      return JSON.parse(content);
    });
    
    reflections.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json(reflections);
  } catch (error) {
    return NextResponse.json([]);
  }
}
