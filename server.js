import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース接続設定
const dbConfig = {
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'kanban',
  password: process.env.DB_PASSWORD || 'kanban_password',
  database: process.env.DB_NAME || 'kanban_board',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true // 複数のSQLステートメントを許可
};

// 接続プールの作成
const pool = mysql.createPool(dbConfig);

// 接続テスト
app.get('/api/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.status(200).json({ status: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// カラム一覧取得
app.get('/api/columns', async (req, res) => {
  try {
    const [columns] = await pool.query('SELECT * FROM columns ORDER BY position');
    const [tasks] = await pool.query('SELECT * FROM tasks ORDER BY position');
    
    // カラムにタスクを関連付ける
    const columnsWithTasks = columns.map(column => ({
      ...column,
      tasks: tasks.filter(task => task.column_id === column.id)
    }));
    
    res.json(columnsWithTasks);
  } catch (error) {
    console.error('Error fetching columns:', error);
    res.status(500).json({ error: 'Failed to fetch columns' });
  }
});

// 新しいカラムを追加
app.post('/api/columns', async (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM columns'
    );
    const position = result[0].count;
    
    const id = uuidv4();
    await pool.query(
      'INSERT INTO columns (id, title, position) VALUES (?, ?, ?)',
      [id, title, position]
    );
    
    res.status(201).json({ id, title, position, tasks: [] });
  } catch (error) {
    console.error('Error creating column:', error);
    res.status(500).json({ error: 'Failed to create column' });
  }
});

// カラムを更新
app.put('/api/columns/:id', async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    await pool.query(
      'UPDATE columns SET title = ? WHERE id = ?',
      [title, id]
    );
    
    res.json({ id, title });
  } catch (error) {
    console.error('Error updating column:', error);
    res.status(500).json({ error: 'Failed to update column' });
  }
});

// カラムを削除
app.delete('/api/columns/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM columns WHERE id = ?', [id]);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting column:', error);
    res.status(500).json({ error: 'Failed to delete column' });
  }
});

// タスク一覧取得
app.get('/api/tasks', async (req, res) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM tasks ORDER BY position');
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// 新しいタスクを追加
app.post('/api/tasks', async (req, res) => {
  const { title, description, column_id } = req.body;
  
  if (!title || !column_id) {
    return res.status(400).json({ error: 'Title and column_id are required' });
  }
  
  try {
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM tasks WHERE column_id = ?',
      [column_id]
    );
    const position = result[0].count;
    
    const id = uuidv4();
    await pool.query(
      'INSERT INTO tasks (id, title, description, column_id, position) VALUES (?, ?, ?, ?, ?)',
      [id, title, description || '', column_id, position]
    );
    
    res.status(201).json({ 
      id, 
      title, 
      description: description || '', 
      column_id, 
      position,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// タスクを更新
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  try {
    await pool.query(
      'UPDATE tasks SET title = ?, description = ? WHERE id = ?',
      [title, description || '', id]
    );
    
    res.json({ id, title, description: description || '' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// タスクを移動
app.put('/api/tasks/:id/move', async (req, res) => {
  const { id } = req.params;
  const { from_column_id, to_column_id } = req.body;
  
  if (!from_column_id || !to_column_id) {
    return res.status(400).json({ error: 'From and to column IDs are required' });
  }
  
  try {
    // トランザクション開始
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // 現在のタスク情報を取得
      const [tasks] = await connection.query(
        'SELECT * FROM tasks WHERE id = ?',
        [id]
      );
      
      if (tasks.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // 移動先のカラムの最終位置を取得
      const [positions] = await connection.query(
        'SELECT COUNT(*) as count FROM tasks WHERE column_id = ?',
        [to_column_id]
      );
      const newPosition = positions[0].count;
      
      // タスクを移動
      await connection.query(
        'UPDATE tasks SET column_id = ?, position = ? WHERE id = ?',
        [to_column_id, newPosition, id]
      );
      
      // 移動元カラムのタスク位置を再調整 - 別々のステートメントとして実行
      await connection.query('SET @pos := -1');
      await connection.query(
        'UPDATE tasks SET position = (@pos := @pos + 1) WHERE column_id = ? ORDER BY position',
        [from_column_id]
      );
      
      await connection.commit();
      connection.release();
      
      res.json({ id, column_id: to_column_id, position: newPosition });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error moving task:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

// タスクを削除
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // タスクの所属カラムを取得
    const [tasks] = await pool.query(
      'SELECT column_id FROM tasks WHERE id = ?',
      [id]
    );
    
    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const columnId = tasks[0].column_id;
    
    // トランザクション開始
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // タスクを削除
      await connection.query('DELETE FROM tasks WHERE id = ?', [id]);
      
      // 同じカラム内のタスク位置を再調整 - 別々のステートメントとして実行
      await connection.query('SET @pos := -1');
      await connection.query(
        'UPDATE tasks SET position = (@pos := @pos + 1) WHERE column_id = ? ORDER BY position',
        [columnId]
      );
      
      await connection.commit();
      connection.release();
      
      res.status(204).end();
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});