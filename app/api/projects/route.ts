import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

console.log('🔧 Projects API endpoint loaded');
console.log('🔧 Environment variables check:', {
  REGION_AWS: process.env.REGION_AWS,
  ACCESS_KEY_ID_AWS: process.env.ACCESS_KEY_ID_AWS ? 'SET' : 'MISSING',
  SECRET_ACCESS_KEY_AWS: process.env.SECRET_ACCESS_KEY_AWS ? 'SET' : 'MISSING',
  ENVIRONMENT: process.env.ENVIRONMENT,
});

const client = new DynamoDBClient({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS!,
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = `Projects_${process.env.ENVIRONMENT}`;

console.log('🔧 DynamoDB Projects table name:', TABLE_NAME);

export async function POST(request: NextRequest) {
  console.log('📥 POST /api/projects - Project creation request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json();
    console.log('📋 Request data received:', {
      dataKeys: Object.keys(requestData),
      questionsCount: Object.keys(requestData.answers || {}).length
    });
    
    const { answers, questions } = requestData;

    if (!answers || !questions) {
      console.log('❌ Missing required data:', { answers: !!answers, questions: !!questions });
      return NextResponse.json({ 
        error: 'Missing answers or questions data',
        success: false 
      }, { status: 400 });
    }

    // Validate required fields
    console.log('🔍 Validating required fields...');
    const missingRequired = [];
    
    for (const question of questions) {
      if (question.required) {
        const answer = answers[question.step];
        const isEmpty = answer === undefined || answer === null || answer === '' || 
                       (Array.isArray(answer) && answer.length === 0);
        
        if (isEmpty) {
          missingRequired.push({
            step: question.step,
            title: question.sidebarTitle,
            question: question.question
          });
          console.log(`❌ Missing required field - Step ${question.step}: ${question.sidebarTitle}`);
        }
      }
    }

    if (missingRequired.length > 0) {
      console.log('❌ Validation failed - missing required fields:', missingRequired);
      return NextResponse.json({
        error: 'Please fill in all required fields',
        missingFields: missingRequired,
        success: false
      }, { status: 400 });
    }

    console.log('✅ All required fields validated successfully');

    // Generate unique project ID
    const projectId = uuidv4();
    console.log('🆔 Generated project ID:', projectId);

    // Prepare project data
    const projectData = {
      projectId,
      userId,
      answers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'created'
    };

    console.log('💾 Attempting to save project to DynamoDB:', {
      projectId,
      userId,
      tableName: TABLE_NAME,
      answersCount: Object.keys(answers).length
    });

    const putCommand = new PutCommand({
      TableName: TABLE_NAME,
      Item: projectData,
      ConditionExpression: 'attribute_not_exists(projectId)',
    });

    const result = await docClient.send(putCommand);
    console.log('✅ Project created in DynamoDB successfully:', result);
    console.log('✅ Project ID:', projectId);
    console.log('✅ User ID:', userId);

    return NextResponse.json({ 
      message: 'Project created successfully',
      project: {
        projectId,
        userId,
        createdAt: projectData.createdAt,
        status: projectData.status
      },
      success: true
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Error in POST /api/projects:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    
    if (error.name === 'ConditionalCheckFailedException') {
      console.log('ℹ️ Project already exists (duplicate projectId - should be rare with UUID)');
      return NextResponse.json({ 
        error: 'Project creation conflict. Please try again.',
        success: false 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create project. Please try again.',
      success: false 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  console.log('📥 GET /api/projects - Project fetch request received');
  
  try {
    const { userId } = await auth();
    console.log('👤 Authenticated user ID:', userId);
    
    if (!userId) {
      console.log('❌ User not authenticated');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (projectId) {
      // Get specific project
      console.log('🔍 Fetching specific project:', projectId);
      
      const getCommand = new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          projectId,
        },
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

    } else {
      // Get all projects for user
      console.log('🔍 Fetching all projects for user:', userId);
      
      try {
        const scanCommand = new ScanCommand({
          TableName: TABLE_NAME,
          FilterExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        });

        const scanResult = await docClient.send(scanCommand);
        console.log('📋 Projects found via scan:', scanResult.Items?.length || 0);
        
        // Sort by createdAt descending (latest first)
        const sortedProjects = (scanResult.Items || []).sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return NextResponse.json({ 
          projects: sortedProjects,
          success: true 
        });
        
      } catch (error) {
        console.error('❌ Error scanning projects:', error);
        return NextResponse.json({ 
          error: 'Failed to fetch projects',
          projects: [],
          success: false 
        }, { status: 500 });
      }
    }

  } catch (error) {
    console.error('❌ Error in GET /api/projects:', error);
    console.error('❌ Error message:', error.message);
    console.error('❌ Full error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}