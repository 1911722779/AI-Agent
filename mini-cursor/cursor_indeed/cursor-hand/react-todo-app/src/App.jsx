import { useState, useEffect } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'

  // Load todos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      setTodos(JSON.parse(saved));
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim() === '') return;
    const newTodo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    setTodos(
      todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim() === '') return;
    setTodos(
      todos.map(todo =>
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      )
    );
    setEditingId(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>✨ TodoList Pro ✨</h1>
        <p>Organize your life with style & persistence</p>
      </header>

      <main className="main">
        {/* Add Todo Input */}
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What needs to be done?"
            className="todo-input"
          />
          <button onClick={addTodo} className="add-btn">
            ➕ Add
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button 
            className={`tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({activeCount})
          </button>
          <button 
            className={`tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({completedCount})
          </button>
        </div>

        {/* Todo List */}
        <ul className="todo-list">
          {filteredTodos.length === 0 ? (
            <li className="empty-state">
              {filter === 'all' && 'No tasks yet — add your first one!'}
              {filter === 'active' && 'All tasks are done! 🎉'}
              {filter === 'completed' && 'No completed tasks yet.'}
            </li>
          ) : (
            filteredTodos.map((todo) => (
              <li 
                key={todo.id} 
                className={`todo-item ${todo.completed ? 'completed' : ''} transition-all duration-300`}
              >
                {editingId === todo.id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      autoFocus
                      className="edit-input"
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                    />
                    <div className="edit-actions">
                      <button onClick={saveEdit} className="save-btn">✓ Save</button>
                      <button onClick={cancelEdit} className="cancel-btn">✕ Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="todo-content">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleComplete(todo.id)}
                        className="todo-checkbox"
                      />
                      <span className="todo-text">{todo.text}</span>
                    </div>
                    <div className="todo-actions">
                      <button 
                        onClick={() => startEditing(todo)}
                        className="action-btn edit-btn"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteTodo(todo.id)}
                        className="action-btn delete-btn"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))
          )}
        </ul>

        {/* Stats & Clear Completed */}
        <div className="stats-bar">
          <span className="stats">
            {activeCount} {activeCount === 1 ? 'task' : 'tasks'} left
          </span>
          {completedCount > 0 && (
            <button 
              onClick={() => setTodos(todos.filter(todo => !todo.completed))}
              className="clear-btn"
            >
              Clear Completed
            </button>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>✅ Data persists in localStorage • Smooth animations • Fully responsive</p>
      </footer>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 1.5rem;
          color: #333;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-weight: 700;
          font-size: 2.5rem;
          margin: 0;
          background: linear-gradient(to right, #ff6b6b, #4ecdc4, #44b884);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .header p {
          font-weight: 400;
          opacity: 0.85;
          margin-top: 0.5rem;
        }

        .main {
          max-width: 600px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }

        .input-section {
          display: flex;
          padding: 1.25rem;
          background: #ffffff;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .todo-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px 0 0 8px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .todo-input:focus {
          border-color: #4facfe;
          box-shadow: 0 0 0 3px rgba(79, 172, 254, 0.2);
        }

        .add-btn {
          padding: 0.75rem 1.25rem;
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
          border: none;
          border-radius: 0 8px 8px 0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79, 172, 254, 0.35);
        }

        .filter-tabs {
          display: flex;
          justify-content: center;
          padding: 0.75rem 0;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .tab {
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          border: none;
          background: transparent;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab.active {
          background: linear-gradient(135deg, #4facfe, #00f2fe);
          color: white;
        }

        .tab:hover:not(.active) {
          background: #e9ecef;
        }

        .todo-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .todo-item {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f1f1f1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: fadeIn 0.3s ease-out;
          transition: all 0.3s ease;
        }

        .todo-item:hover {
          background: #f8f9ff;
        }

        .todo-item.completed {
          opacity: 0.7;
        }

        .todo-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .todo-checkbox {
          width: 1.4rem;
          height: 1.4rem;
          cursor: pointer;
        }

        .todo-text {
          font-size: 1.05rem;
          font-weight: 500;
        }

        .todo-item.completed .todo-text {
          text-decoration: line-through;
          color: #888;
        }

        .todo-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 2.2rem;
          height: 2.2rem;
          border-radius: 50%;
          border: none;
          background: #f1f1f1;
          cursor: pointer;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          transform: scale(1.1);
        }

        .edit-btn:hover {
          background: #4facfe;
          color: white;
        }

        .delete-btn:hover {
          background: #ff6b6b;
          color: white;
        }

        .edit-mode {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .edit-input {
          padding: 0.5rem;
          border: 2px solid #4facfe;
          border-radius: 6px;
          font-size: 1rem;
          margin-bottom: 0.5rem;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .save-btn, .cancel-btn {
          padding: 0.35rem 0.75rem;
          border: none;
          border-radius: 4px;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .save-btn {
          background: #4facfe;
          color: white;
        }

        .cancel-btn {
          background: #e0e0e0;
          color: #666;
        }

        .empty-state {
          padding: 1.5rem;
          text-align: center;
          color: #888;
          font-style: italic;
        }

        .stats-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1.25rem;
          background: #f8f9fa;
          border-top: 1px solid #e9ecef;
        }

        .stats {
          font-weight: 500;
          color: #555;
        }

        .clear-btn {
          background: none;
          border: none;
          color: #ff6b6b;
          font-weight: 500;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .clear-btn:hover {
          background: rgba(255, 107, 107, 0.1);
        }

        .footer {
          text-align: center;
          margin-top: 2rem;
          padding: 1rem;
          color: rgba(0,0,0,0.65);
          font-size: 0.85rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 600px) {
          .app { padding: 1rem; }
          .header h1 { font-size: 2rem; }
          .input-section { flex-direction: column; }
          .todo-input { border-radius: 8px; }
          .add-btn { border-radius: 8px; margin-top: 0.5rem; }
          .stats-bar { flex-direction: column; gap: 0.5rem; }
        }
      `}</style>
    </div>
  );
}

export default App;
