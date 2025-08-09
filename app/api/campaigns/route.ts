import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Campaigns API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `Campaigns_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB Campaigns table name:', TABLE_NAME);

export async function POST(request: NextRequest) {
  console.log('📥 POST /api/campaigns - Campaign creation request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 Request data:', requestData);
    
    const { projectId, name, description } = requestData;

    if (!projectId || !name) {
      console.log('❌ Missing required data:', { projectId: !!projectId, name: !!name });
      return NextResponse.json({ 
        error: 'Project ID and campaign name are required',
        success: false 
      }, { status: 400 });
    }

    // Generate unique campaign ID
    const campaignId = uuidv4();
    console.log('🆔 Generated campaign ID:', campaignId);

    // Prepare campaign data
    const campaignData = {
      campaignId,
      projectId,
      userId,
      name,
      description: description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'created'
    };

    console.log('💾 Attempting to save campaign to DynamoDB:', {
      campaignId,
      projectId,
      userId,
      name,
      tableName: TABLE_NAME
    });

    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: campaignData,
      ConditionExpression: 'attribute_not_exists(campaignId)',
    });

    const result = await docClient.send(putCommand);
    console.log('✅ Campaign created in DynamoDB successfully:', result);

    return NextResponse.json({ 
      message: 'Campaign created successfully',
      campaign: {
        campaignId,
        projectId,
        userId,
        name,
        description: campaignData.description,
        createdAt: campaignData.createdAt,
        status: campaignData.status
      },
      success: true
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error in POST /api/campaigns:', error);
    
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('ℹ️ Campaign already exists (duplicate campaignId)');
      return NextResponse.json({ 
        error: 'Campaign creation conflict. Please try again.',
        success: false 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create campaign. Please try again.',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 GET /api/campaigns - Campaign fetch request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const campaignId = searchParams.get('campaignId');

    if (campaignId) {
      // Get specific campaign
      console.log('🔍 Fetching specific campaign:', campaignId);
      
      const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: { campaignId },
      });

      const result = await docClient.send(getCommand);

      if (!result.Item) {
        console.log('❌ Campaign not found:', campaignId);
        return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
      }

      if (result.Item.userId !== userId) {
        console.log('❌ Unauthorized access to campaign:', campaignId);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      return NextResponse.json({ campaign: result.Item });

    } else if (projectId) {
      // Get all campaigns for a project
      console.log('🔍 Fetching campaigns for project:', projectId);
      
      try {
        const scanCommand = new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'projectId = :projectId AND userId = :userId',
          ExpressionAttributeValues: {
            ':projectId': projectId,
            ':userId': userId
          }
        });

        const result = await docClient.send(scanCommand);
        console.log('📋 Campaigns found:', result.Items?.length || 0);
        
        // Sort by createdAt descending (latest first)
        const sortedCampaigns = (result.Items || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ 
          campaigns: sortedCampaigns,
          success: true 
        });

      } catch (error) {
        console.error('❌ Error fetching campaigns for project:', error);
        return NextResponse.json({ 
          error: 'Failed to fetch campaigns',
          campaigns: [],
          success: false 
        }, { status: 500 });
      }

    } else {
      // Get all campaigns for user
      console.log('🔍 Fetching all campaigns for user:', userId);
      
      try {
        const scanCommand = new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        });

        const result = await docClient.send(scanCommand);
        console.log('📋 Total campaigns found:', result.Items?.length || 0);
        
        const sortedCampaigns = (result.Items || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ 
          campaigns: sortedCampaigns,
          success: true 
        });

      } catch (error) {
        console.error('❌ Error fetching user campaigns:', error);
        return NextResponse.json({ 
          error: 'Failed to fetch campaigns',
          campaigns: [],
          success: false 
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('❌ Error in GET /api/campaigns:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}