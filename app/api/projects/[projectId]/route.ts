import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Force dynamic behavior to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

console.log('🔧 Single Project API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const PROJECTS_TABLE = `Projects_${process.env.ENVIRONMENT}`;
const CAMPAIGNS_TABLE = `Campaigns_${process.env.ENVIRONMENT}`;
const CHAT_MESSAGES_TABLE = `ChatMessages_${process.env.ENVIRONMENT}`;

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
      TableName: PROJECTS_TABLE,
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
      TableName: PROJECTS_TABLE,
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

    // Extract individual fields from answers object
    const brand_name = answers[1] || '';
    const offering = answers[2] || '';
    const usp = answers[3] || '';
    const brand_voice = answers[4] || '';
    const icp = answers[5] || '';
    const competitors = answers[6] || '';
    const additional_information = answers[7] || '';

    // Update the project with both answers and individual fields
    const updateCommand = new UpdateCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId, userId },
      UpdateExpression: `SET
        answers = :answers,
        brand_name = :brand_name,
        offering = :offering,
        usp = :usp,
        brand_voice = :brand_voice,
        icp = :icp,
        competitors = :competitors,
        additional_information = :additional_information,
        updatedAt = :updatedAt`,
      ExpressionAttributeValues: {
        ':answers': answers,
        ':brand_name': brand_name,
        ':offering': offering,
        ':usp': usp,
        ':brand_voice': brand_voice,
        ':icp': icp,
        ':competitors': competitors,
        ':additional_information': additional_information,
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  console.log('🗑️ DELETE /api/projects/[projectId] - Project deletion request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    console.log('🗑️ Deleting project:', projectId);

    // First verify the project exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId, userId },
    });

    const existingProject = await docClient.send(getCommand);
    
    if (!existingProject.Item) {
      console.log('❌ Project not found for deletion:', projectId);
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (existingProject.Item.userId !== userId) {
      console.log('❌ Unauthorized deletion attempt on project:', projectId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all campaigns for this project
    console.log('🔍 Finding campaigns for project:', projectId);
    const campaignScanCommand = new ScanCommand({
      TableName: CAMPAIGNS_TABLE,
      FilterExpression: 'projectId = :projectId AND userId = :userId',
      ExpressionAttributeValues: {
        ':projectId': projectId,
        ':userId': userId
      }
    });

    const campaignResult = await docClient.send(campaignScanCommand);
    const campaigns = campaignResult.Items || [];
    console.log(`📋 Found ${campaigns.length} campaigns to delete`);

    // Delete all chat messages for all campaigns
    for (const campaign of campaigns) {
      console.log('🔍 Finding chat messages for campaign:', campaign.campaignId);
      const chatScanCommand = new ScanCommand({
        TableName: CHAT_MESSAGES_TABLE,
        FilterExpression: 'campaignId = :campaignId AND userId = :userId',
        ExpressionAttributeValues: {
          ':campaignId': campaign.campaignId,
          ':userId': userId
        }
      });

      const chatResult = await docClient.send(chatScanCommand);
      const chatMessages = chatResult.Items || [];
      console.log(`💬 Found ${chatMessages.length} chat messages to delete for campaign ${campaign.campaignId}`);

      // Delete each chat message
      for (const message of chatMessages) {
        const deleteChatCommand = new DeleteCommand({
          TableName: CHAT_MESSAGES_TABLE,
          Key: { chatMessageId: message.chatMessageId }
        });
        await docClient.send(deleteChatCommand);
        console.log('🗑️ Deleted chat message:', message.chatMessageId);
      }
    }

    // Delete all campaigns
    for (const campaign of campaigns) {
      const deleteCampaignCommand = new DeleteCommand({
        TableName: CAMPAIGNS_TABLE,
        Key: { userId: campaign.userId, campaignId: campaign.campaignId }
      });
      await docClient.send(deleteCampaignCommand);
      console.log('🗑️ Deleted campaign:', campaign.campaignId);
    }

    // Finally delete the project
    const deleteProjectCommand = new DeleteCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId, userId },
    });

    await docClient.send(deleteProjectCommand);
    console.log('✅ Project deleted successfully:', projectId);

    const deletionSummary = {
      projectDeleted: true,
      campaignsDeleted: campaigns.length,
      chatMessagesDeleted: campaigns.reduce((total, campaign) => {
        // We'll approximate this since we don't track exact count during deletion
        return total + (campaign.chatMessageCount || 0);
      }, 0)
    };

    return NextResponse.json({ 
      success: true, 
      message: `Project and all related data deleted successfully`,
      summary: deletionSummary
    });

  } catch (error) {
    console.error('❌ Error in DELETE /api/projects/[projectId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
