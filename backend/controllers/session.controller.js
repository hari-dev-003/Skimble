const dynamoDB = require('../aws');
const { SESSION_TABLE_NAME } = require('../models/session.model');
const crypto = require('crypto');

const { ScanCommand, PutItemCommand, GetItemCommand, DeleteItemCommand, UpdateItemCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const PARTITION_KEY = 'session_id';

function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

exports.createSession = async (req, res) => {
  const hostUserId = req.user?.sub;
  const hostEmail = req.user?.email || req.user?.username || '';

  if (!hostUserId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const initialElements = req.body?.initialElements;
  const canvasData = Array.isArray(initialElements) ? JSON.stringify(initialElements) : '[]';

  const code = generateSessionCode();
  const now = Math.floor(Date.now() / 1000);

  const params = {
    TableName: SESSION_TABLE_NAME,
    Item: {
      [PARTITION_KEY]: { S: code },
      hostUserId: { S: hostUserId },
      hostEmail: { S: hostEmail },
      canvasElements: { S: canvasData },
      createdAt: { N: now.toString() },
      isActive: { BOOL: true },
    },
    ConditionExpression: 'attribute_not_exists(session_id)',
  };

  try {
    const command = new PutItemCommand(params);
    await dynamoDB.send(command);
    res.status(201).json({ code, hostEmail, createdAt: now });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return exports.createSession(req, res);
    }
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session.' });
  }
};

exports.getSession = async (req, res) => {
  const { code } = req.params;
  if (!code || code.length !== 6) {
    return res.status(400).json({ error: 'Invalid session code.' });
  }

  const params = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: { S: code.toUpperCase() } },
  };

  try {
    const command = new GetItemCommand(params);
    const result = await dynamoDB.send(command);
    if (!result.Item) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const session = unmarshall(result.Item);
    res.status(200).json({
      code: session.session_id,
      hostUserId: session.hostUserId,
      hostEmail: session.hostEmail,
      canvasElements: JSON.parse(session.canvasElements || '[]'),
      createdAt: session.createdAt,
      isActive: session.isActive,
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session.' });
  }
};

exports.deleteSession = async (req, res) => {
  const { code } = req.params;
  const userId = req.user?.sub;

  const getParams = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: { S: code.toUpperCase() } },
  };

  try {
    const getResult = await dynamoDB.send(new GetItemCommand(getParams));
    if (!getResult.Item) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const session = unmarshall(getResult.Item);
    if (session.hostUserId !== userId) {
      return res.status(403).json({ error: 'Only the host can delete this session.' });
    }

    const deleteParams = {
      TableName: SESSION_TABLE_NAME,
      Key: { [PARTITION_KEY]: { S: code.toUpperCase() } },
    };
    await dynamoDB.send(new DeleteItemCommand(deleteParams));
    res.status(200).json({ message: 'Session deleted.' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session.' });
  }
};

exports.listUserSessions = async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: 'Authentication required.' });

  const params = {
    TableName: SESSION_TABLE_NAME,
    FilterExpression: 'hostUserId = :uid',
    ExpressionAttributeValues: {
      ':uid': { S: userId },
    },
  };

  try {
    const result = await dynamoDB.send(new ScanCommand(params));
    const sessions = (result.Items || [])
      .map(item => {
        const s = unmarshall(item);
        return {
          code: s.session_id,
          hostEmail: s.hostEmail,
          createdAt: s.createdAt,
          isActive: s.isActive,
          elementCount: (() => { try { return JSON.parse(s.canvasElements || '[]').length; } catch { return 0; } })(),
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(sessions);
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions.' });
  }
};

exports.saveCanvasState = async (code, elements) => {
  const params = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: { S: code } },
    UpdateExpression: 'set canvasElements = :el',
    ExpressionAttributeValues: {
      ':el': { S: JSON.stringify(elements) },
    },
    ConditionExpression: 'attribute_exists(session_id)',
  };

  try {
    await dynamoDB.send(new UpdateItemCommand(params));
  } catch (error) {
    if (error.name !== 'ConditionalCheckFailedException') {
      console.error(`Error saving canvas for session ${code}:`, error);
    }
  }
};
