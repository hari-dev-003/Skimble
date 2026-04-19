const dynamoDB = require('../aws')
const {TABLE_NAME} = require('../models/details.model');
const {v4: uuidv4} = require('uuid');

const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const { PutItemCommand, DeleteItemCommand, UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const PARTITION_KEY = 'board_id';

exports.getContent = async (req, res) => {
  try {
    const ownerId = req.user?.sub;
    
    if (!ownerId) {
      return res.status(401).json({ error: "Authentication required to fetch notes." });
    }

    const command = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "userId = :uid",
      ExpressionAttributeValues: {
        ":uid": { S: ownerId }
      }
    });

    const data = await dynamoDB.send(command);
    
    const unmarshalledItems = data.Items.map((item) => {
      const unmarshalled = unmarshall(item);
      if (unmarshalled.board_id && !unmarshalled.boardId) {
        unmarshalled.boardId = unmarshalled.board_id;
      }
      return unmarshalled;
    });

    res.status(200).json(unmarshalledItems);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "An error occurred while fetching items" });
  }
};



exports.addContent = async (req, res) => {
  const { title, content, favourite, category } = req.body;
  const ownerId = req.user?.sub; // Use optional chaining for safety

  // Validate input
  if (!title || !content || !ownerId) {
    return res.status(400).json({ error: "Missing required fields: title, content, or user authentication information." });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const generatedId = uuidv4();

  const params = {
    TableName: TABLE_NAME,
    Item: {
      [PARTITION_KEY]: { S: generatedId },
      boardId: { S: generatedId },
      userId: { S: ownerId },
      title: { S: title },
      content: { S: content },
      category: { S: category || 'General' },
      updatedAt: { N: timestamp.toString() },
      favourite: { BOOL: !!favourite },
    },
  };

  try {
    const command = new PutItemCommand(params);
    await dynamoDB.send(command);
    res.status(201).json({ message: 'Details added successfully', boardId: generatedId });
  } catch (error) {
    console.error("Error adding details:", error);
    res.status(500).json({ error: "An error occurred while adding details" });
  }
};

exports.deleteContent = async (req, res) => {
  const { boardId } = req.params;
  if (!boardId) {
    return res.status(400).json({ error: "Missing required field: boardId." });
  }
  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY]: { S: boardId },
    },
    ReturnValues: 'ALL_OLD'
  };
  try {
    const command = new DeleteItemCommand(params);
    const result = await dynamoDB.send(command);
    if (!result.Attributes) {
      return res.status(404).json({ error: 'Item not found or already deleted' });
    }
    res.status(200).json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error("Error deleting content:", error);
    res.status(500).json({ error: "An error occurred while deleting content" });
  }
};

exports.updateContent = async (req, res) => {
  const { boardId } = req.params;
  const { title, content, favourite, category } = req.body;
  const timestamp = Math.floor(Date.now() / 1000);
  // Build dynamic UpdateExpression and ExpressionAttributeValues
  let updateExp = [];
  const expAttrValues = {
    ':updatedAt': { N: timestamp.toString() },
  };
  if (title !== undefined) {
    updateExp.push('title = :title');
    expAttrValues[':title'] = { S: title };
  }
  if (content !== undefined) {
    updateExp.push('content = :content');
    expAttrValues[':content'] = { S: content };
  }
  if (favourite !== undefined) {
    updateExp.push('favourite = :favourite');
    expAttrValues[':favourite'] = { BOOL: !!favourite };
  }
  if (category !== undefined) {
    updateExp.push('category = :category');
    expAttrValues[':category'] = { S: category };
  }
  updateExp.push('updatedAt = :updatedAt');
  if (updateExp.length === 1) {
    return res.status(400).json({ error: 'No fields to update.' });
  }
  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY]: { S: boardId },
    },
    UpdateExpression: 'set ' + updateExp.join(', '),
    ExpressionAttributeValues: expAttrValues,
    ReturnValues: 'ALL_NEW',
    ConditionExpression: `attribute_exists(${PARTITION_KEY})`
  };
  try {
    const command = new UpdateItemCommand(params);
    const result = await dynamoDB.send(command);
    res.status(200).json({ message: 'Content updated successfully', updated: result.Attributes });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(404).json({ error: 'Item not found for update' });
    }
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'An error occurred while updating content' });
  }
};
