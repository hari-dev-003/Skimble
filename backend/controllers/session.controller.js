const dynamoDB = require('../aws');
const { SESSION_TABLE_NAME } = require('../models/session.model');
const crypto = require('crypto');

const { 
  ScanCommand, 
  PutCommand, 
  GetCommand, 
  DeleteCommand, 
  UpdateCommand 
} = require('@aws-sdk/lib-dynamodb');

const PARTITION_KEY = 'session_id';

function generateSessionCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

exports.createSession = async (req, res) => {
  const userId = req.user?.sub;
  const hostEmail = req.user?.email || req.user?.username || '';

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const initialElements = req.body?.initialElements;
  const canvasData = Array.isArray(initialElements) ? JSON.stringify(initialElements) : '[]';

  const code = generateSessionCode();
  const now = Math.floor(Date.now() / 1000);

  const params = {
    TableName: SESSION_TABLE_NAME,
    Item: {
      [PARTITION_KEY]: code,
      userId: userId,
      hostUserId: userId, // Legacy support
      hostEmail: hostEmail,
      participants: new Set([userId]),
      canvasElements: canvasData,
      createdAt: now,
      isActive: true,
    },
    ConditionExpression: 'attribute_not_exists(session_id)',
  };

  try {
    await dynamoDB.send(new PutCommand(params));
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
    Key: { [PARTITION_KEY]: code.toUpperCase() },
  };

  try {
    const result = await dynamoDB.send(new GetCommand(params));
    if (!result.Item) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const session = result.Item;
    res.status(200).json({
      code: session.session_id,
      userId: session.userId || session.hostUserId,
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

exports.joinSession = async (req, res) => {
  const { code } = req.params;
  const userId = req.user?.sub;

  if (!userId) return res.status(401).json({ error: 'Authentication required.' });

  try {
    await exports.recordParticipant(code, userId);
    res.status(200).json({ message: 'Joined successfully' });
  } catch (error) {
    console.error('Error joining session:', error);
    res.status(500).json({ error: 'Failed to join session.' });
  }
};

exports.recordParticipant = async (code, userId) => {
  if (!userId || userId.startsWith('anonymous-')) return;
  
  const params = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: code.toUpperCase() },
    UpdateExpression: 'ADD participants :u',
    ExpressionAttributeValues: {
      ':u': new Set([userId])
    },
    ConditionExpression: 'attribute_exists(session_id)'
  };
  
  try {
    await dynamoDB.send(new UpdateCommand(params));
  } catch (err) {
    // Session might not exist yet or other issues, ignore silently
  }
};

exports.listUserSessions = async (req, res) => {
  const userId = req.user?.sub;
  if (!userId) return res.status(401).json({ error: 'Authentication required.' });

  try {
    // Paginate through the full scan so no sessions are missed.
    // ConsistentRead ensures we see canvas saves that just completed.
    let items = [];
    let lastKey = undefined;

    do {
      const params = {
        TableName: SESSION_TABLE_NAME,
        FilterExpression: 'userId = :uid OR hostUserId = :uid',
        ExpressionAttributeValues: { ':uid': userId },
        ConsistentRead: true,
        ...(lastKey && { ExclusiveStartKey: lastKey }),
      };
      const result = await dynamoDB.send(new ScanCommand(params));
      items = items.concat(result.Items || []);
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);

    const sessions = items
      .filter(s => s.session_id)
      .map(s => ({
        code: s.session_id,
        hostEmail: s.hostEmail || '',
        createdAt: s.createdAt || 0,
        isActive: s.isActive ?? true,
        elementCount: (() => {
          try { return JSON.parse(s.canvasElements || '[]').length; } catch { return 0; }
        })(),
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    res.json(sessions);
  } catch (error) {
    console.error('Error listing sessions:', error);
    res.status(500).json({ error: 'Failed to list sessions.' });
  }
};

exports.deleteSession = async (req, res) => {
  const { code } = req.params;
  const currentUserId = req.user?.sub;

  const params = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: code.toUpperCase() },
  };

  try {
    const result = await dynamoDB.send(new GetCommand(params));
    if (!result.Item) {
      return res.status(404).json({ error: 'Session not found.' });
    }
    const session = result.Item;
    if (session.userId !== currentUserId && session.hostUserId !== currentUserId) {
      return res.status(403).json({ error: 'Only the host can delete this session.' });
    }

    await dynamoDB.send(new DeleteCommand(params));
    res.status(200).json({ message: 'Session deleted.' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session.' });
  }
};

exports.saveCanvasState = async (code, elements) => {
  const params = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: code },
    UpdateExpression: 'set canvasElements = :el',
    ExpressionAttributeValues: {
      ':el': JSON.stringify(elements),
    },
    ConditionExpression: 'attribute_exists(session_id)',
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
  } catch (error) {
    if (error.name !== 'ConditionalCheckFailedException') {
      console.error(`Error saving canvas for session ${code}:`, error);
    }
  }
};

exports.fetchSessionElements = async (code) => {
  const params = {
    TableName: SESSION_TABLE_NAME,
    Key: { [PARTITION_KEY]: code.toUpperCase() },
  };

  try {
    const result = await dynamoDB.send(new GetCommand(params));
    if (!result.Item) return null;
    return JSON.parse(result.Item.canvasElements || '[]');
  } catch (error) {
    console.error(`Error fetching elements for session ${code}:`, error);
    return null;
  }
};
