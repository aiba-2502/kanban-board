import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { Column as ColumnType } from '../types';
import { useBoardStore } from '../store/boardStore';

interface ColumnProps {
  column: ColumnType;
}

export function Column({ column }: ColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [editedTitle, setEditedTitle] = useState(column.title);
  const { addTask, editColumn, deleteColumn } = useBoardStore();
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(column.id, newTaskTitle, newTaskDescription);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsAdding(false);
    }
  };

  const handleEditColumn = () => {
    if (editedTitle.trim() && editedTitle !== column.title) {
      editColumn(column.id, editedTitle);
      setIsEditing(false);
    }
  };

  const handleDeleteColumn = () => {
    if (confirm('このカラムとすべてのタスクを削除してもよろしいですか？')) {
      deleteColumn(column.id);
    }
  };

  return (
    <div className={`
      bg-white/80 backdrop-blur-sm rounded-lg p-4
      ${isAdding ? 'h-fit' : 'h-fit'}
      w-80 flex flex-col
    `}>
      <div className="flex items-center justify-between mb-4">
        {isEditing ? (
          <div className="flex gap-2 items-center flex-1">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="px-2 py-1 border rounded flex-1"
              autoFocus
            />
            <button
              onClick={handleEditColumn}
              className="text-green-600 hover:text-green-700"
            >
              保存
            </button>
            <button
              onClick={() => {
                setEditedTitle(column.title);
                setIsEditing(false);
              }}
              className="text-gray-600 hover:text-gray-700"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-semibold text-gray-700">{column.title}</h2>
            <div className="flex items-center gap-2">
              <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded">
                {column.tasks.length}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={handleDeleteColumn}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>
      
      <div ref={setNodeRef} className="space-y-3 flex-1">
        {column.tasks.map((task) => (
          <TaskCard key={task.id} task={task} columnId={column.id} />
        ))}
      </div>

      {isAdding ? (
        <div className="mt-3">
          <input
            type="text"
            placeholder="タスクのタイトル"
            className="w-full p-2 border rounded mb-2"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <textarea
            placeholder="説明"
            className="w-full p-2 border rounded mb-2"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTask}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              追加
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewTaskTitle('');
                setNewTaskDescription('');
              }}
              className="text-gray-600 px-3 py-1 rounded hover:bg-gray-100"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center mt-3 text-gray-600 hover:text-gray-900"
        >
          <Plus size={20} className="mr-1" />
          タスクを追加
        </button>
      )}
    </div>
  );
}