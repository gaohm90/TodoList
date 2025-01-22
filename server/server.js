import express from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());

// 配置 SQLite 数据库
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite')
});

// 定义 Todo 模型
const Todo = sequelize.define('Todo', {
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// 同步数据库模型
sequelize.sync()
  .then(() => console.log('数据库同步成功'))
  .catch(err => console.error('数据库同步失败:', err));

// API 路由
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    const todo = await Todo.create({
      text: req.body.text,
      completed: false
    });
    res.status(201).json(todo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/todos/:id', async (req, res) => {
  try {
    const [updated] = await Todo.update(
      { completed: req.body.completed },
      { where: { id: req.params.id } }
    );
    if (updated) {
      const todo = await Todo.findByPk(req.params.id);
      res.json(todo);
    } else {
      res.status(404).json({ message: '待办事项未找到' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    const deleted = await Todo.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: '删除成功' });
    } else {
      res.status(404).json({ message: '待办事项未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});