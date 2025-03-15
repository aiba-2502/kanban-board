import React, { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners } from '@dnd-kit/core';
import { Column } from './components/Column';
import { useBoardStore } from './store/boardStore';
import { Plus } from 'lucide-react';
import { TaskCard } from './components/TaskCard';
import { Task } from './types';

function App() {
  const { columns, moveTask, addColumn } = useBoardStore();
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const taskId = event.active.id as string;
    const columnId = columns.find(col => 
      col.tasks.some(task => task.id === taskId)
    )?.id || null;
    
    if (columnId) {
      const task = columns.find(col => col.id === columnId)?.tasks.find(t => t.id === taskId);
      if (task) {
        setActiveTask(task);
        setActiveColumnId(columnId);
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    // カラム以外の場所にドロップした場合は移動をキャンセル
    if (!over || !columns.some(col => col.id === over.id)) {
      setActiveTask(null);
      setActiveColumnId(null);
      return;
    }

    if (active.id !== over.id) {
      const taskId = active.id as string;
      const fromColumnId = columns.find(col => 
        col.tasks.some(task => task.id === taskId)
      )?.id;
      const toColumnId = over.id as string;

      if (fromColumnId && fromColumnId !== toColumnId) {
        moveTask(taskId, fromColumnId, toColumnId);
      }
    }

    setActiveTask(null);
    setActiveColumnId(null);
  };

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      addColumn(newColumnTitle);
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  return (
    <div 
      className="min-h-screen p-8 bg-cover bg-center bg-no-repeat bg-fixed"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80")',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
          {!isAddingColumn && (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={20} className="mr-2" />
              Add Column
            </button>
          )}
        </div>

        {isAddingColumn && (
          <div className="mb-6 flex gap-2 items-center bg-white/80 backdrop-blur-sm p-4 rounded-lg">
            <input
              type="text"
              placeholder="Column title"
              className="px-4 py-2 border rounded-lg"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
            />
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingColumn(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}

        <DndContext 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd} 
          collisionDetection={closestCorners}
        >
          <div className="flex gap-6 overflow-x-auto pb-4">
            {columns.map((column) => (
              <Column key={column.id} column={column} />
            ))}
          </div>
          <DragOverlay>
            {activeTask && activeColumnId && (
              <div className="transform-none">
                <TaskCard task={activeTask} columnId={activeColumnId} isDragging />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export default App;