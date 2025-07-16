// Backend API Updates for Enhanced Homework Data
// This is an example implementation for Node.js/Express with MySQL

const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Updated homework model with new fields
const HomeworkModel = {
  // Get homework by parent with enhanced data
  async getByParent(parentId, childId = null) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    try {
      let query = `
        SELECT 
          h.id,
          h.title,
          h.description,
          h.subject,
          h.due_date,
          h.status,
          h.score,
          h.content_type,
          h.teacher_id,
          h.class_id,
          -- NEW ENHANCED FIELDS
          h.objectives,
          h.activities,
          h.materials,
          h.parent_guidance,
          h.caps_alignment,
          h.duration,
          h.difficulty,
          h.grade,
          h.term,
          h.created_at,
          h.updated_at,
          -- Teacher info
          CONCAT(u.first_name, ' ', u.last_name) as teacher_name,
          u.email as teacher_email
        FROM homework h
        LEFT JOIN users u ON h.teacher_id = u.id
        LEFT JOIN children c ON c.class_id = h.class_id
        WHERE c.parent_id = ?
      `;
      
      const params = [parentId];
      
      if (childId) {
        query += ` AND c.id = ?`;
        params.push(childId);
      }
      
      query += ` ORDER BY h.due_date ASC`;
      
      const [rows] = await connection.execute(query, params);
      
      // Parse JSON fields
      const homework = rows.map(row => ({
        ...row,
        objectives: row.objectives ? JSON.parse(row.objectives) : null,
        activities: row.activities ? JSON.parse(row.activities) : null,
        materials: row.materials ? JSON.parse(row.materials) : null,
        // Format dates
        due_date: row.due_date ? new Date(row.due_date).toISOString() : null,
        created_at: row.created_at ? new Date(row.created_at).toISOString() : null,
        updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : null
      }));
      
      return homework;
    } finally {
      await connection.end();
    }
  },

  // Create homework with enhanced data
  async create(homeworkData) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    try {
      const query = `
        INSERT INTO homework (
          title, description, subject, due_date, status, teacher_id, class_id,
          objectives, activities, materials, parent_guidance, caps_alignment,
          duration, difficulty, grade, term, content_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        homeworkData.title,
        homeworkData.description,
        homeworkData.subject,
        homeworkData.due_date,
        homeworkData.status || 'pending',
        homeworkData.teacher_id,
        homeworkData.class_id,
        // JSON fields
        JSON.stringify(homeworkData.objectives || []),
        JSON.stringify(homeworkData.activities || []),
        JSON.stringify(homeworkData.materials || []),
        homeworkData.parent_guidance,
        homeworkData.caps_alignment,
        homeworkData.duration || 30,
        homeworkData.difficulty || 'intermediate',
        homeworkData.grade,
        homeworkData.term,
        homeworkData.content_type || 'regular'
      ];
      
      const [result] = await connection.execute(query, params);
      
      return {
        id: result.insertId,
        ...homeworkData,
        created_at: new Date().toISOString()
      };
    } finally {
      await connection.end();
    }
  },

  // Update homework with enhanced data
  async update(homeworkId, updateData) {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    
    try {
      const setParts = [];
      const params = [];
      
      // Handle regular fields
      const regularFields = ['title', 'description', 'subject', 'due_date', 'status', 'parent_guidance', 'caps_alignment', 'duration', 'difficulty', 'grade', 'term'];
      
      regularFields.forEach(field => {
        if (updateData[field] !== undefined) {
          setParts.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      });
      
      // Handle JSON fields
      const jsonFields = ['objectives', 'activities', 'materials'];
      jsonFields.forEach(field => {
        if (updateData[field] !== undefined) {
          setParts.push(`${field} = ?`);
          params.push(JSON.stringify(updateData[field]));
        }
      });
      
      if (setParts.length === 0) {
        throw new Error('No fields to update');
      }
      
      // Add updated_at
      setParts.push('updated_at = NOW()');
      
      const query = `UPDATE homework SET ${setParts.join(', ')} WHERE id = ?`;
      params.push(homeworkId);
      
      const [result] = await connection.execute(query, params);
      
      if (result.affectedRows === 0) {
        throw new Error('Homework not found');
      }
      
      return { id: homeworkId, ...updateData };
    } finally {
      await connection.end();
    }
  }
};

// API Routes
router.get('/api/homework/parent/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    const { childId } = req.query;
    
    const homework = await HomeworkModel.getByParent(parentId, childId);
    
    res.json({
      success: true,
      homework: homework,
      count: homework.length
    });
  } catch (error) {
    console.error('Error fetching homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch homework',
      error: error.message
    });
  }
});

router.post('/api/homework', async (req, res) => {
  try {
    const homework = await HomeworkModel.create(req.body);
    
    res.status(201).json({
      success: true,
      homework: homework,
      message: 'Homework created successfully'
    });
  } catch (error) {
    console.error('Error creating homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create homework',
      error: error.message
    });
  }
});

router.put('/api/homework/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const homework = await HomeworkModel.update(id, req.body);
    
    res.json({
      success: true,
      homework: homework,
      message: 'Homework updated successfully'
    });
  } catch (error) {
    console.error('Error updating homework:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update homework',
      error: error.message
    });
  }
});

// Example validation middleware
const validateHomeworkData = (req, res, next) => {
  const { title, subject, due_date, objectives, activities, materials } = req.body;
  
  if (!title || !subject || !due_date) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: title, subject, due_date'
    });
  }
  
  // Validate JSON fields
  if (objectives && !Array.isArray(objectives)) {
    return res.status(400).json({
      success: false,
      message: 'Objectives must be an array'
    });
  }
  
  if (activities && !Array.isArray(activities)) {
    return res.status(400).json({
      success: false,
      message: 'Activities must be an array'
    });
  }
  
  if (materials && !Array.isArray(materials)) {
    return res.status(400).json({
      success: false,
      message: 'Materials must be an array'
    });
  }
  
  next();
};

// Apply validation to create and update routes
router.post('/api/homework', validateHomeworkData, async (req, res) => {
  // ... create logic
});

router.put('/api/homework/:id', validateHomeworkData, async (req, res) => {
  // ... update logic
});

module.exports = router;

// Example usage in your main app.js:
// const homeworkRoutes = require('./backend_api_updates');
// app.use(homeworkRoutes);
