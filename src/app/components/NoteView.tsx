import React, { useState } from 'react';
import { 
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { 
  ArrowLeftIcon,
  PencilIcon,
  EllipsisVerticalIcon,
  SwatchIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/solid';
import { Note, NoteType } from '../types';
import ColorPicker, { COLORS } from './ColorPicker';

interface NoteViewProps {
  note: Note;
  onBack: () => void;
  onUpdate: (note: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
}

export default function NoteView({ note, onBack, onUpdate, onDelete, onArchive }: NoteViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate({
      ...note,
      title,
      content,
      updatedAt: new Date()
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleSave();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Note View Navbar */}
      <div className="h-16 border-b border-divider flex items-center justify-between px-4 gap-4">
        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
            onClick={onBack}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              className="text-lg font-medium bg-transparent border-none focus:outline-none"
              placeholder="Note title"
              autoFocus
            />
          ) : (
            <h1 className="text-lg font-medium truncate">
              {title || "Untitled"}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            variant={isEditing ? "solid" : "light"}
            color={isEditing ? "primary" : "default"}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            <PencilIcon className="w-5 h-5" />
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button isIconOnly variant="light">
                <EllipsisVerticalIcon className="w-5 h-5" />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Note actions">
              <DropdownItem
                key="color"
                startContent={<SwatchIcon className="w-5 h-5" />}
                onClick={() => setShowColorPicker(true)}
              >
                Change Color
              </DropdownItem>
              <DropdownItem
                key="archive"
                startContent={<ArchiveBoxIcon className="w-5 h-5" />}
                onClick={() => onArchive(note.id)}
              >
                {note.isArchived ? 'Unarchive' : 'Archive'}
              </DropdownItem>
              <DropdownItem
                key="delete"
                className="text-danger"
                color="danger"
                startContent={<TrashIcon className="w-5 h-5" />}
                onClick={() => onDelete(note.id)}
              >
                Delete
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Note Content */}
      <div className="flex-1 p-4">
        {note.type === NoteType.TODO ? (
          <div className="space-y-2">
            {/* TODO: Implement todo list editing */}
            <p className="opacity-60">Todo list editing coming soon...</p>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isEditing}
            className="w-full h-full bg-transparent border-none focus:outline-none resize-none disabled:opacity-100"
            placeholder="Note content"
          />
        )}
      </div>

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowColorPicker(false)}
        >
          <div 
            className="relative"
            onClick={e => e.stopPropagation()}
          >
            <ColorPicker
              selectedColor={note.color}
              onChange={(color) => {
                onUpdate({ ...note, color });
                setShowColorPicker(false);
              }}
              onClose={() => setShowColorPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
} 