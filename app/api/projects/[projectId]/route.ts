import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  console.log('📥 PUT /api/projects/[projectId] - Project update request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    console.log('🔄 Updating project:', projectId);

    const body = await request.json();
    const { answers } = body;
    
    console.log('📝 Update data received:', { projectId, answers });

    if (!answers) {
      console.log('❌ Missing answers in request body');
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    // First verify the project exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: { projectId, userId },
    });

    const existingProject = await docClient.send(getCommand);
    
    if (!existingProject.Item) {
      console.log('❌ Project not found for update:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (existingProject.Item.userId !== userId) {
      console.log('❌ Unauthorized update attempt on project:', projectId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the project
    const updateCommand = new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { projectId, userId },
      UpdateExpression: 'SET answers = :answers, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':answers': answers,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);
    console.log('✅ Project updated successfully:', projectId);

    return NextResponse.json({ 
      success: true, 
      project: result.Attributes,
      message: 'Project updated successfully' 
    });

  } catch (error) {
    console.error('❌ Error in PUT /api/projects/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
