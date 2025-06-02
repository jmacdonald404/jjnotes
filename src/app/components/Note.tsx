import React, { useState } from 'react';
import { format } from 'date-fns';
import { HexColorPicker } from 'react-colorful';
import { TrashIcon, ArchiveBoxIcon, CalendarIcon, PaperClipIcon } from '@heroicons/react/24/solid';
import CryptoJS from 'crypto-js';
import { Note as NoteType, TodoItem, Attachment, NoteType as NoteTypeEnum } from '../types';

interface NoteProps extends Omit<NoteType, 'isDeleted' | 'deletedAt'> {
  onUpdate: (note: Partial<NoteType>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  encryptionKey?: string;
}

const Note: React.FC<NoteProps> = ({
  id,
  title,
  content,
  type,
  color,
  todoItems = [],
  attachments = [],
  reminder,
  isArchived,
  onUpdate,
  onDelete,
  onArchive,
  encryptionKey
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [noteColor, setNoteColor] = useState(color);
  const [noteTitle, setNoteTitle] = useState(title);
  const [noteContent, setNoteContent] = useState(content);
  const [noteTodos, setNoteTodos] = useState(todoItems);

  const encryptContent = (text: string) => {
    if (!encryptionKey) return text;
    return CryptoJS.AES.encrypt(text, encryptionKey).toString();
  };

  const decryptContent = (text: string) => {
    if (!encryptionKey) return text;
    const bytes = CryptoJS.AES.decrypt(text, encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const handleSave = () => {
    const encryptedContent = encryptContent(noteContent);
    onUpdate({
      id,
      title: noteTitle,
      content: encryptedContent,
      color: noteColor,
      todoItems: noteTodos,
      type
    });
    setIsEditing(false);
  };

  const handleTodoToggle = (todoId: string) => {
    const updatedTodos = noteTodos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setNoteTodos(updatedTodos);
    handleSave();
  };

  const handleAddTodo = () => {
    const newTodo: TodoItem = {
      id: Math.random().toString(36).substr(2, 9),
      content: '',
      completed: false
    };
    setNoteTodos([...noteTodos, newTodo]);
  };

  return (
    <div
      className="relative p-4 rounded-lg shadow-md transition-all duration-200"
      style={{ backgroundColor: noteColor }}
    >
      <div className="flex justify-between items-start mb-2">
        <input
          type="text"
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          disabled={!isEditing}
          className="text-lg font-semibold bg-transparent border-none focus:outline-none"
          placeholder="Note title"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200"
          >
            <div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: noteColor }} />
          </button>
          {showColorPicker && (
            <div className="absolute right-0 mt-8 z-10">
              <HexColorPicker color={noteColor} onChange={setNoteColor} />
            </div>
          )}
        </div>
      </div>

      {type === NoteTypeEnum.STANDARD ? (
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          disabled={!isEditing}
          className="w-full bg-transparent border-none focus:outline-none resize-none"
          rows={4}
          placeholder="Note content"
        />
      ) : (
        <div className="space-y-2">
          {noteTodos.map((todo) => (
            <div key={todo.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleTodoToggle(todo.id)}
                disabled={!isEditing}
                className="rounded"
              />
              <input
                type="text"
                value={todo.content}
                onChange={(e) => {
                  const updatedTodos = noteTodos.map(t =>
                    t.id === todo.id ? { ...t, content: e.target.value } : t
                  );
                  setNoteTodos(updatedTodos);
                }}
                disabled={!isEditing}
                className="flex-1 bg-transparent border-none focus:outline-none"
                placeholder="Todo item"
              />
            </div>
          ))}
          {isEditing && (
            <button
              onClick={handleAddTodo}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              + Add todo item
            </button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-2">
          {reminder && (
            <CalendarIcon className="w-5 h-5 text-gray-600" title={format(reminder, 'PPp')} />
          )}
          {attachments.length > 0 && (
            <PaperClipIcon className="w-5 h-5 text-gray-600" title={`${attachments.length} attachments`} />
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onArchive(id)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <ArchiveBoxIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-1 rounded hover:bg-gray-200"
          >
            <TrashIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className="px-3 py-1 text-sm rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Note; 