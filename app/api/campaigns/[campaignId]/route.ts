import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

console.log('🔧 Single Campaign API endpoint loaded');

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `Campaigns_${process.env.ENVIRONMENT}`;

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
      TableName: TABLE_NAME,
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
