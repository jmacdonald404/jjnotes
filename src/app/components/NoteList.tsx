'use client';

import React, { useState, useRef } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Checkbox } from '@heroui/react';
import { TrashIcon, ArchiveBoxIcon, PlusIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { Note, ViewMode, SortBy, NoteType, TodoItem } from '../types';
import ColorPicker, { COLORS } from './ColorPicker';

interface NoteListProps {
  notes: Note[];
  viewMode: ViewMode;
  sortBy: SortBy;
  onUpdateNote: (note: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
  onArchiveNote: (id: string) => void;
  filterColor?: string;
}

export default function NoteList({
  notes,
  viewMode,
  sortBy,
  onUpdateNote,
  onDeleteNote,
  onArchiveNote,
  filterColor,
}: NoteListProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const colorButtonRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  const getColorPickerPosition = (noteId: string) => {
    const buttonEl = colorButtonRefs.current.get(noteId);
    if (!buttonEl) return { top: 0, left: 0 };

    const rect = buttonEl.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
    };
  };

  const sortedNotes = React.useMemo(() => {
    let sorted = [...notes];
    switch (sortBy) {
      case SortBy.CREATED_ASC:
        sorted.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case SortBy.CREATED_DESC:
        sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case SortBy.MODIFIED_ASC:
        sorted.sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime());
        break;
      case SortBy.MODIFIED_DESC:
        sorted.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        break;
      case SortBy.ALPHA_ASC:
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case SortBy.ALPHA_DESC:
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }
    if (filterColor) {
      sorted = sorted.filter(note => note.color === filterColor);
    }
    return sorted;
  }, [notes, sortBy, filterColor]);

  const handleAddTodoItem = (note: Note) => {
    if (note.type !== NoteType.TODO) return;
    
    const newTodoItem: TodoItem = {
      id: Math.random().toString(36).substr(2, 9),
      content: '',
      completed: false,
    };

    onUpdateNote({
      ...note,
      todoItems: [...(note.todoItems || []), newTodoItem],
    });
  };

  const handleUpdateTodoItem = (note: Note, itemId: string, updates: Partial<TodoItem>) => {
    if (note.type !== NoteType.TODO || !note.todoItems) return;

    onUpdateNote({
      ...note,
      todoItems: note.todoItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    });
  };

  const handleDeleteTodoItem = (note: Note, itemId: string) => {
    if (note.type !== NoteType.TODO || !note.todoItems) return;

    onUpdateNote({
      ...note,
      todoItems: note.todoItems.filter(item => item.id !== itemId),
    });
  };

  return (
    <div className={`grid gap-4 ${viewMode === ViewMode.GRID ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
      {sortedNotes.map((note) => (
        <Card
          key={note.id}
          className="card hover:shadow-lg transition-shadow bg-card relative"
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-2 transition-colors"
            style={{ 
              backgroundColor: note.color !== COLORS[0].value ? note.color : 'var(--divider)'
            }} 
          />
          <CardHeader className="flex justify-between items-start gap-2 pl-4">
            <input
              type="text"
              value={note.title}
              onChange={(e) => onUpdateNote({ ...note, title: e.target.value })}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none flex-grow text-foreground"
              placeholder={note.type === NoteType.TODO ? "Checklist title" : "Note title"}
            />
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  ref={(el) => {
                    if (el) colorButtonRefs.current.set(note.id, el);
                  }}
                  onClick={() => setShowColorPicker(showColorPicker === note.id ? null : note.id)}
                >
                  <SwatchIcon className="w-5 h-5" />
                </Button>
                {showColorPicker === note.id && (
                  <div 
                    className="fixed inset-0 z-[100]" 
                    onClick={() => setShowColorPicker(null)}
                  >
                    <div 
                      className="absolute z-[101]"
                      style={{
                        top: getColorPickerPosition(note.id).top + 'px',
                        left: getColorPickerPosition(note.id).left + 'px',
                        transform: 'translateX(-75%)',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <ColorPicker
                        selectedColor={note.color}
                        onChange={(color) => {
                          onUpdateNote({ ...note, color });
                          setShowColorPicker(null);
                        }}
                        onClose={() => setShowColorPicker(null)}
                      />
                    </div>
                  </div>
                )}
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={() => onArchiveNote(note.id)}
                className="text-foreground"
              >
                <ArchiveBoxIcon className="w-5 h-5" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onClick={() => onDeleteNote(note.id)}
              >
                <TrashIcon className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardBody className="pl-4">
            {note.type === NoteType.TODO ? (
              <div className="space-y-2">
                {note.todoItems?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      isSelected={item.completed}
                      onValueChange={(checked) => handleUpdateTodoItem(note, item.id, { completed: checked })}
                    />
                    <input
                      type="text"
                      value={item.content}
                      onChange={(e) => handleUpdateTodoItem(note, item.id, { content: e.target.value })}
                      className={`flex-grow bg-transparent border-none focus:outline-none text-foreground ${
                        item.completed ? 'line-through opacity-50' : ''
                      }`}
                      placeholder="Todo item"
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      color="danger"
                      onClick={() => handleDeleteTodoItem(note, item.id)}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="light"
                  startContent={<PlusIcon className="w-4 h-4" />}
                  onClick={() => handleAddTodoItem(note)}
                >
                  Add Item
                </Button>
              </div>
            ) : (
              <textarea
                value={note.content}
                onChange={(e) => onUpdateNote({ ...note, content: e.target.value })}
                className="w-full bg-transparent border-none focus:outline-none resize-none text-foreground"
                rows={4}
                placeholder="Note content"
              />
            )}
          </CardBody>
          <CardFooter className="pl-4">
            <div className="text-sm opacity-60">
              Last updated: {new Date(note.updatedAt).toLocaleString()}
            </div>
          </CardFooter>
        </Card>
      ))}
      {sortedNotes.length === 0 && (
        <div className="col-span-full text-center opacity-60 py-8">
          No notes found
        </div>
      )}
    </div>
  );
} 