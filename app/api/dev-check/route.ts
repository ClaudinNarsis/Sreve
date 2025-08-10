import { NextResponse } from 'next/server';

export async function GET() {
  // Check if we're in development environment
  const isDev = process.env.ENVIRONMENT === 'Dev' || process.env.NODE_ENV === 'development';
  
  console.log('🔍 Environment check:', {
    ENVIRONMENT: process.env.ENVIRONMENT,
    NODE_ENV: process.env.NODE_ENV,
    isDev
  });

  return NextResponse.json({ 
    isDev,
    environment: process.env.ENVIRONMENT,
    nodeEnv: process.env.NODE_ENV
  });
}