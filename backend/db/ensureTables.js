require('dotenv').config();
const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require('@aws-sdk/client-dynamodb');
const { SESSION_TABLE_NAME } = require('../models/session.model');

const client = new DynamoDBClient({
  region: process.env.SERVICE_REGION,
  credentials: {
    accessKeyId: process.env.SERVICE_ACCESS_KEY_ID,
    secretAccessKey: process.env.SERVICE_SECRET_ACCESS_KEY,
  },
});

async function tableExists(tableName) {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') return false;
    throw err;
  }
}

async function ensureSessionTable() {
  if (await tableExists(SESSION_TABLE_NAME)) {
    console.log(`Table "${SESSION_TABLE_NAME}" already exists.`);
    return;
  }

  console.log(`Creating DynamoDB table "${SESSION_TABLE_NAME}"…`);
  await client.send(new CreateTableCommand({
    TableName: SESSION_TABLE_NAME,
    AttributeDefinitions: [
      { AttributeName: 'session_id', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'session_id', KeyType: 'HASH' },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  }));

  // Wait until table is ACTIVE
  let status = 'CREATING';
  while (status !== 'ACTIVE') {
    await new Promise(r => setTimeout(r, 2000));
    const desc = await client.send(new DescribeTableCommand({ TableName: SESSION_TABLE_NAME }));
    status = desc.Table.TableStatus;
    console.log(`  Table status: ${status}`);
  }
  console.log(`Table "${SESSION_TABLE_NAME}" is ready.`);
}

async function ensureAllTables() {
  await ensureSessionTable();
}

module.exports = { ensureAllTables };
