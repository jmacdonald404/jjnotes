'use client';

import React, { useState, useRef } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Button, Checkbox, Modal, ModalContent } from '@heroui/react';
import { TrashIcon, ArchiveBoxIcon, PlusIcon, SwatchIcon } from '@heroicons/react/24/solid';
import { Note, ViewMode, SortBy, NoteType, TodoItem } from '../types';
import ColorPicker, { COLORS } from './ColorPicker';
import Portal from './Portal';

interface NoteListProps {
  notes: Note[];
  viewMode: ViewMode;
  sortBy: SortBy;
  onNoteClick: (note: Note) => void;
  onUpdateNote: (note: Partial<Note>) => void;
  filterColor?: string;
}

export default function NoteList({
  notes,
  viewMode,
  sortBy,
  onNoteClick,
  onUpdateNote,
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
          isPressable
          className="card hover:shadow-lg transition-shadow bg-card relative cursor-pointer"
          onPress={() => onNoteClick(note)}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-2 transition-colors"
            style={{ 
              backgroundColor: note.color !== COLORS[0].value ? note.color : 'var(--divider)'
            }} 
          />
          <CardHeader className="pl-4">
            <h3 className="text-lg font-semibold truncate">
              {note.title || "Untitled"}
            </h3>
          </CardHeader>
          <CardBody className="pl-4">
            {note.type === NoteType.TODO ? (
              <div className="space-y-2">
                {note.todoItems?.map((item) => (
                  <div 
                    key={item.id} 
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateTodoItem(note, item.id, { completed: !item.completed });
                    }}
                  >
                    <Checkbox
                      isSelected={item.completed}
                      isReadOnly
                    />
                    <span className={`flex-grow ${item.completed ? 'line-through opacity-50' : ''}`}>
                      {item.content || "Empty todo item"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="line-clamp-3 opacity-60">
                {note.content || "Empty note"}
              </p>
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