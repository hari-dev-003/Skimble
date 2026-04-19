const dynamoDB = require('../aws')
const {TABLE_NAME} = require('../models/details.model');
const {v4: uuidv4} = require('uuid');

const { 
  ScanCommand, 
  PutCommand, 
  GetCommand, 
  DeleteCommand, 
  UpdateCommand 
} = require("@aws-sdk/lib-dynamodb");

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
        ":uid": ownerId
      }
    });

    const data = await dynamoDB.send(command);
    
    const items = (data.Items || []).map((item) => {
      if (item.board_id && !item.boardId) {
        item.boardId = item.board_id;
      }
      return item;
    });

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "An error occurred while fetching items" });
  }
};



exports.addContent = async (req, res) => {
  const { title, content, favourite, category } = req.body;
  const ownerId = req.user?.sub;

  if (!title || !content || !ownerId) {
    return res.status(400).json({ error: "Missing required fields: title, content, or user authentication information." });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const generatedId = uuidv4();

  const params = {
    TableName: TABLE_NAME,
    Item: {
      [PARTITION_KEY]: generatedId,
      boardId: generatedId,
      userId: ownerId,
      title: title,
      content: content,
      category: category || 'General',
      updatedAt: timestamp,
      favourite: !!favourite,
    },
  };

  try {
    await dynamoDB.send(new PutCommand(params));
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
      [PARTITION_KEY]: boardId,
    },
  };
  try {
    await dynamoDB.send(new DeleteCommand(params));
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

  let updateExp = [];
  const expAttrValues = {
    ':updatedAt': timestamp,
  };
  if (title !== undefined) {
    updateExp.push('title = :title');
    expAttrValues[':title'] = title;
  }
  if (content !== undefined) {
    updateExp.push('content = :content');
    expAttrValues[':content'] = content;
  }
  if (favourite !== undefined) {
    updateExp.push('favourite = :favourite');
    expAttrValues[':favourite'] = !!favourite;
  }
  if (category !== undefined) {
    updateExp.push('category = :category');
    expAttrValues[':category'] = category;
  }
  updateExp.push('updatedAt = :updatedAt');

  if (updateExp.length === 1) {
    return res.status(400).json({ error: 'No fields to update.' });
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      [PARTITION_KEY]: boardId,
    },
    UpdateExpression: 'set ' + updateExp.join(', '),
    ExpressionAttributeValues: expAttrValues,
    ConditionExpression: `attribute_exists(${PARTITION_KEY})`
  };

  try {
    await dynamoDB.send(new UpdateCommand(params));
    res.status(200).json({ message: 'Content updated successfully' });
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      return res.status(404).json({ error: 'Item not found for update' });
    }
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'An error occurred while updating content' });
  }
};