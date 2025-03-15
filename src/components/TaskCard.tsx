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
    transition: transition || undefined,
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
        className="bg-black/80 p-4 rounded-lg shadow-sm border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          className="w-full p-2 border rounded mb-2 text-sm bg-gray-900 text-white border-gray-700"
          placeholder="タスクのタイトル"
          autoFocus
        />
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full p-2 border rounded mb-2 text-sm resize-none bg-gray-900 text-white border-gray-700"
          placeholder="説明"
          rows={Math.max(2, editedDescription.split('\n').length)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            className="text-green-500 hover:text-green-400 p-2 rounded hover:bg-gray-800"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-300 p-2 rounded hover:bg-gray-800"
          >
            <X size={14} />
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
        relative bg-black/80 p-4 rounded-lg shadow-sm border border-gray-700 
        ${!isEditing ? 'cursor-move' : ''} hover:shadow-md transition-shadow
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''}
      `}
    >
      <div 
        {...attributes}
        {...listeners}
        className="flex justify-between items-start mb-2"
      >
        <h3 className="font-medium text-white text-sm">{task.title}</h3>
      </div>
      <div className="flex gap-1 absolute top-2 right-2 bg-black/80 rounded-lg">
        <button
          onClick={handleEdit}
          className="p-1 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={handleDelete}
          className="p-1 text-red-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="text-xs text-gray-300 mt-2 whitespace-pre-wrap break-words max-h-24 overflow-y-auto">{task.description}</p>
      <div className="flex items-center mt-4 text-xs text-gray-500">
        <Clock size={12} className="mr-1" />
        <span>
          {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}