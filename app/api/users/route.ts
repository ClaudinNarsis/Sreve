import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

console.log('🔧 Users API endpoint loaded');
console.log('🔧 Environment variables check:', {
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'MISSING',
  ENVIRONMENT: process.env.ENVIRONMENT,
});

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `Users_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB table name:', TABLE_NAME);

export async function POST(request: NextRequest) {
  console.log('📥 POST /api/users - User creation request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 Request data:', requestData);
    
    const { userName, email } = requestData;

    if (!userName || !email) {
      console.log('❌ Missing required fields:', { userName: !!userName, email: !!email });
      return NextResponse.json({ error: 'userName and email are required' }, { status: 400 });
    }

    const userItem = {
      userId,
      userName,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('💾 Attempting to save user to DynamoDB:', userItem);
    console.log('💾 Table name:', TABLE_NAME);

    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: userItem,
      ConditionExpression: 'attribute_not_exists(userId)',
    });

    const result = await docClient.send(putCommand);
    console.log('✅ User created in DynamoDB successfully:', result);

    return NextResponse.json({ 
      message: 'User created successfully',
      user: userItem,
      success: true
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error in POST /api/users:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('ℹ️ User already exists');
      return NextResponse.json({ 
        error: 'User already exists',
        success: false 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 GET /api/users - User fetch request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Fetching user from DynamoDB');
    console.log('🔍 Table name:', TABLE_NAME);
    console.log('🔍 User ID:', userId);

    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        userId,
      },
    });

    const result = await docClient.send(getCommand);
    console.log('📋 DynamoDB query result:', result);

    if (!result.Item) {
      console.log('❌ User not found in DynamoDB');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found:', result.Item);
    return NextResponse.json({ user: result.Item });

  } catch (error) {
    console.error('❌ Error in GET /api/users:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}