import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

console.log('🔧 Webhook endpoint loaded');
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

export async function POST(req: NextRequest) {
  console.log('📥 Webhook received');
  
  const body = await req.text();
  console.log('📥 Webhook body length:', body.length);
  
  const headerPayload = headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  console.log('📥 Svix headers:', {
    svixId: svixId ? 'PRESENT' : 'MISSING',
    svixTimestamp: svixTimestamp ? 'PRESENT' : 'MISSING',
    svixSignature: svixSignature ? 'PRESENT' : 'MISSING',
  });

  if (!svixId || !svixTimestamp || !svixSignature) {
    console.error('❌ Missing svix headers');
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  let event: WebhookEvent;

  try {
    event = JSON.parse(body);
    console.log('✅ Webhook parsed successfully, event type:', event.type);
  } catch (err) {
    console.error('❌ Error parsing webhook:', err);
    return new Response('Invalid JSON', { status: 400 });
  }

  const eventType = event.type;
  console.log('📋 Processing event type:', eventType);

  if (eventType === 'user.created') {
    const { id, email_addresses, username, first_name, last_name } = event.data;
    console.log('👤 User data received:', {
      id,
      email: email_addresses?.[0]?.email_address,
      username,
      first_name,
      last_name,
    });

    try {
      const userItem = {
        userId: id,
        userName: username || `${first_name} ${last_name}`.trim() || 'User',
        email: email_addresses[0]?.email_address || '',
        firstName: first_name || '',
        lastName: last_name || '',
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
      console.log('✅ User ID:', id);
      
    } catch (error: any) {
      console.error('❌ Error creating user in DynamoDB:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Full error:', JSON.stringify(error, null, 2));
      
      if (error.name !== 'ConditionalCheckFailedException') {
        return new Response('Error creating user', { status: 500 });
      }
      console.log('ℹ️ User already exists in DynamoDB:', id);
    }
  } else {
    console.log('ℹ️ Ignoring event type:', eventType);
  }

  console.log('✅ Webhook processed successfully');
  return new Response('OK', { status: 200 });
}