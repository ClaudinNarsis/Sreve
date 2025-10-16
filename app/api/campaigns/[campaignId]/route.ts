import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, DeleteCommand, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

// Force dynamic behavior to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

console.log('🔧 Single Campaign API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const CAMPAIGNS_TABLE = `Campaigns_${process.env.ENVIRONMENT}`;
const CHAT_MESSAGES_TABLE = `ChatMessages_${process.env.ENVIRONMENT}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  console.log('📥 GET /api/campaigns/[campaignId] - Single campaign fetch request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await params;
    console.log('🔍 Fetching specific campaign:', campaignId);
    
    const getCommand = new GetCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: { userId, campaignId },
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

    console.log('✅ Campaign found:', campaignId);
    return NextResponse.json({ campaign: result.Item });

  } catch (error) {
    console.error('❌ Error in GET /api/campaigns/[campaignId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  console.log('🔄 PATCH /api/campaigns/[campaignId] - Campaign update request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await params;
    const body = await request.json();
    console.log('🔄 Updating campaign:', campaignId, 'with data:', body);

    // Verify the campaign exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: { userId, campaignId },
    });

    const existingCampaign = await docClient.send(getCommand);

    if (!existingCampaign.Item) {
      console.log('❌ Campaign not found:', campaignId);
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.Item.userId !== userId) {
      console.log('❌ Unauthorized update attempt on campaign:', campaignId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the campaign with selected idea
    const updateCommand = new UpdateCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: { userId, campaignId },
      UpdateExpression: 'SET selectedIdea = :selectedIdea, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':selectedIdea': body.selectedIdea,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);
    console.log('✅ Campaign updated successfully:', campaignId);

    return NextResponse.json({
      success: true,
      message: 'Campaign updated successfully',
      campaign: result.Attributes
    });

  } catch (error) {
    console.error('❌ Error in PATCH /api/campaigns/[campaignId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  console.log('🗑️ DELETE /api/campaigns/[campaignId] - Campaign deletion request received');

  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);

    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { campaignId } = await params;
    console.log('🗑️ Deleting campaign:', campaignId);

    // First verify the campaign exists and belongs to the user
    const getCommand = new GetCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: { userId, campaignId },
    });

    const existingCampaign = await docClient.send(getCommand);

    if (!existingCampaign.Item) {
      console.log('❌ Campaign not found for deletion:', campaignId);
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (existingCampaign.Item.userId !== userId) {
      console.log('❌ Unauthorized deletion attempt on campaign:', campaignId);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete all chat messages for this campaign
    console.log('🔍 Finding chat messages for campaign:', campaignId);
    const chatScanCommand = new ScanCommand({
      TableName: CHAT_MESSAGES_TABLE,
      FilterExpression: 'campaignId = :campaignId AND userId = :userId',
      ExpressionAttributeValues: {
        ':campaignId': campaignId,
        ':userId': userId
      }
    });

    const chatResult = await docClient.send(chatScanCommand);
    const chatMessages = chatResult.Items || [];
    console.log(`💬 Found ${chatMessages.length} chat messages to delete`);

    // Delete each chat message
    for (const message of chatMessages) {
      const deleteChatCommand = new DeleteCommand({
        TableName: CHAT_MESSAGES_TABLE,
        Key: { chatMessageId: message.chatMessageId }
      });
      await docClient.send(deleteChatCommand);
      console.log('🗑️ Deleted chat message:', message.chatMessageId);
    }

    // Delete the campaign
    const deleteCampaignCommand = new DeleteCommand({
      TableName: CAMPAIGNS_TABLE,
      Key: { userId, campaignId },
    });

    await docClient.send(deleteCampaignCommand);
    console.log('✅ Campaign deleted successfully:', campaignId);

    return NextResponse.json({
      success: true,
      message: `Campaign and all related chat messages deleted successfully`,
      summary: {
        campaignDeleted: true,
        chatMessagesDeleted: chatMessages.length
      }
    });

  } catch (error) {
    console.error('❌ Error in DELETE /api/campaigns/[campaignId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
