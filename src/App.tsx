import { useState, useEffect } from 'react'
import './App.css'

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt?: string;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/todos')
      const data = await response.json()
      setTodos(data)
    } catch (error) {
      console.error('获取待办事项失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (input.trim() !== '') {
      try {
        const response = await fetch('http://localhost:5001/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: input.trim() }),
        })
        const newTodo = await response.json()
        setTodos([newTodo, ...todos])
        setInput('')
      } catch (error) {
        console.error('添加待办事项失败:', error)
      }
    }
  }

  const toggleTodo = async (id: string) => {
    try {
      const todo = todos.find(t => t.id === id)
      const response = await fetch(`http://localhost:5001/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo?.completed }),
      })
      const updatedTodo = await response.json()
      setTodos(todos.map(todo =>
        todo.id === id ? updatedTodo : todo
      ))
    } catch (error) {
      console.error('更新待办事项失败:', error)
    }
  }

  const deleteTodo = async (id: string) => {
    try {
      await fetch(`http://localhost:5001/api/todos/${id}`, {
        method: 'DELETE',
      })
      setTodos(todos.filter(todo => todo.id !== id))
    } catch (error) {
      console.error('删除待办事项失败:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h1 className="text-3xl font-bold text-center mb-8">待办事项</h1>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="添加新的待办事项..."
                  />
                  <button
                    onClick={addTodo}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    添加
                  </button>
                </div>
                <ul className="mt-4 space-y-2">
                  {loading ? (
                    <div className="text-center text-gray-500">加载中...</div>
                  ) : todos.length === 0 ? (
                    <div className="text-center text-gray-500">暂无待办事项</div>
                  ) : todos.map(todo => (
                    <li key={todo.id} className="flex items-center gap-2 p-2 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="h-5 w-5 text-blue-500"
                      />
                      <span className={`flex-1 ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="px-2 py-1 text-red-500 hover:text-red-600 transition-colors"
                      >
                        删除
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
