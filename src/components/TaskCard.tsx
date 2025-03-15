import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';
import { Clock, Edit2, Trash2, X, Check } from 'lucide-react';
import { useBoardStore } from '../store/boardStore';

export interface TaskCardProps {
  task: Task;
  columnId: string;
  isDragging?: boolean;
}

export function TaskCard({ task, columnId, isDragging = false }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);
  const { editTask, deleteTask } = useBoardStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: task.id,
    disabled: isEditing 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (editedTitle.trim()) {
      editTask(columnId, task.id, editedTitle, editedDescription);
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('タスクを削除してもよろしいですか？')) {
      deleteTask(columnId, task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditedTitle(task.title);
    setEditedDescription(task.description);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div 
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="タスクのタイトル"
          autoFocus
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full p-2 border rounded mb-2"
          placeholder="説明"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="text-green-600 hover:text-green-700 p-2 rounded hover:bg-gray-100"
          >
            <Check size={16} />
          </button>
          <button
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative bg-white p-4 rounded-lg shadow-sm border border-gray-200 
        ${!isEditing ? 'cursor-move' : ''} hover:shadow-md transition-shadow
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
      `}
    >
      <div 
        {...attributes}
        {...listeners}
        className="flex justify-between items-start mb-2"
      >
        <h3 className="font-medium text-gray-900">{task.title}</h3>
      </div>
      <div className="flex gap-1 absolute top-2 right-2 bg-white/80 rounded-lg">
        <button
          onClick={handleEdit}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2">{task.description}</p>
      <div className="flex items-center mt-4 text-xs text-gray-500">
        <Clock size={14} className="mr-1" />
        <span>
          {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}