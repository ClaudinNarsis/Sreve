import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

console.log('🔧 Single Project API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `Projects_${process.env.ENVIRONMENT}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  console.log('📥 GET /api/projects/[projectId] - Single project fetch request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    console.log('🔍 Fetching specific project:', projectId);
    
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { projectId, userId },
    });

    const result = await docClient.send(getCommand);
    console.log('📋 DynamoDB query result:', result);

    if (!result.Item) {
      console.log('❌ Project not found:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if project belongs to user
    if (result.Item.userId !== userId) {
      console.log('❌ Unauthorized access to project:', projectId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    console.log('✅ Project found:', projectId);
    return NextResponse.json({ project: result.Item });

  } catch (error) {
    console.error('❌ Error in GET /api/projects/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
