'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Button, 
  Card, 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@heroui/react';
import { PlusIcon, Cog6ToothIcon, ListBulletIcon, DocumentTextIcon, SwatchIcon } from '@heroicons/react/24/solid';
import NoteList from './components/NoteList';
import Settings from './components/Settings';
import ColorPicker, { COLORS } from './components/ColorPicker';
import { Note, UserSettings, ViewMode, SortBy, Theme, NoteType } from './types';
import { useTheme } from './components/ThemeProvider';

const defaultSettings: UserSettings = {
  theme: Theme.SYSTEM,
  fontSize: 16,
  viewMode: ViewMode.GRID,
  sortBy: SortBy.CREATED_DESC,
  backupEnabled: false,
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [filterColor, setFilterColor] = useState<string | undefined>();
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({ ...parsedSettings, theme }); // Use theme from context
    }

    // Load notes from localStorage
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({ ...settings, theme }));
  }, [settings, theme]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const handleCreateNote = (type: NoteType = NoteType.STANDARD) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      content: '',
      type,
      color: selectedColor,
      isArchived: false,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      todoItems: type === NoteType.TODO ? [] : undefined,
    };
    setNotes([newNote, ...notes]);
    setShowNewNoteModal(false);
    setSelectedColor(COLORS[0].value);
    setShowColorPicker(false);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  const handleCloseModal = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setShowNewNoteModal(false);
      setSelectedColor(COLORS[0].value);
      setShowColorPicker(false);
    }
  };

  const getColorPickerPosition = () => {
    const buttonEl = colorButtonRef.current;
    if (!buttonEl) return { top: 0, left: 0 };

    const rect = buttonEl.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isBordered>
        <NavbarBrand>
          <h1 className="text-xl font-bold">JJNotes</h1>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem>
            <Button
              color="primary"
              startContent={<PlusIcon className="w-5 h-5" />}
              onPress={() => setShowNewNoteModal(true)}
            >
              New Note
            </Button>
          </NavbarItem>
          <NavbarItem>
            <Button
              isIconOnly
              variant={showSettings ? "solid" : "light"}
              color={showSettings ? "primary" : "default"}
              aria-label="Settings"
              onPress={() => setShowSettings(!showSettings)}
            >
              <Cog6ToothIcon className="w-6 h-6" />
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {showSettings && (
            <Card className="p-6">
              <Settings
                settings={settings}
                onUpdate={handleUpdateSettings}
              />
            </Card>
          )}

          <div className="flex justify-between items-center gap-4">
            <div className="flex gap-4 items-center">
              <Select
                label="View"
                selectedKeys={[settings.viewMode]}
                onSelectionChange={(keys) => setSettings({
                  ...settings,
                  viewMode: Array.from(keys)[0] as ViewMode
                })}
              >
                <SelectItem key={ViewMode.GRID}>Grid</SelectItem>
                <SelectItem key={ViewMode.LIST}>List</SelectItem>
              </Select>

              <Select
                label="Sort by"
                selectedKeys={[settings.sortBy]}
                onSelectionChange={(keys) => setSettings({
                  ...settings,
                  sortBy: Array.from(keys)[0] as SortBy
                })}
              >
                <SelectItem key={SortBy.CREATED_DESC}>Newest First</SelectItem>
                <SelectItem key={SortBy.CREATED_ASC}>Oldest First</SelectItem>
                <SelectItem key={SortBy.ALPHA_ASC}>Title A-Z</SelectItem>
                <SelectItem key={SortBy.ALPHA_DESC}>Title Z-A</SelectItem>
                <SelectItem key={SortBy.MODIFIED_DESC}>Last Modified</SelectItem>
              </Select>
            </div>
          </div>

          <div className="space-y-8">
            <NoteList
              notes={notes.filter(note => !note.isDeleted && !note.isArchived)}
              viewMode={settings.viewMode}
              sortBy={settings.sortBy}
              onUpdateNote={(updatedNote) => {
                setNotes(notes.map(note =>
                  note.id === updatedNote.id
                    ? { ...note, ...updatedNote, updatedAt: new Date() }
                    : note
                ));
              }}
              onDeleteNote={(id) => {
                setNotes(notes.map(note =>
                  note.id === id
                    ? { ...note, isDeleted: true, deletedAt: new Date() }
                    : note
                ));
              }}
              onArchiveNote={(id) => {
                setNotes(notes.map(note =>
                  note.id === id
                    ? { ...note, isArchived: !note.isArchived }
                    : note
                ));
              }}
              filterColor={filterColor}
            />

            {notes.some(note => !note.isDeleted && note.isArchived) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Archived Notes</h2>
                <NoteList
                  notes={notes.filter(note => !note.isDeleted && note.isArchived)}
                  viewMode={settings.viewMode}
                  sortBy={settings.sortBy}
                  onUpdateNote={(updatedNote) => {
                    setNotes(notes.map(note =>
                      note.id === updatedNote.id
                        ? { ...note, ...updatedNote, updatedAt: new Date() }
                        : note
                    ));
                  }}
                  onDeleteNote={(id) => {
                    setNotes(notes.map(note =>
                      note.id === id
                        ? { ...note, isDeleted: true, deletedAt: new Date() }
                        : note
                    ));
                  }}
                  onArchiveNote={(id) => {
                    setNotes(notes.map(note =>
                      note.id === id
                        ? { ...note, isArchived: !note.isArchived }
                        : note
                    ));
                  }}
                  filterColor={filterColor}
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {showNewNoteModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg relative"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-foreground">Create New Note</h2>
              <div className="relative">
                <button
                  ref={colorButtonRef}
                  className="w-10 h-10 rounded-lg border-2 hover:opacity-80 transition-opacity relative"
                  style={{ 
                    backgroundColor: selectedColor,
                    borderColor: COLORS.find(c => c.value === selectedColor)?.border 
                  }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                >
                  <SwatchIcon className="w-5 h-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-foreground/50" />
                </button>
                {showColorPicker && (
                  <div 
                    className="fixed inset-0 z-[100]" 
                    onClick={() => setShowColorPicker(false)}
                  >
                    <div 
                      className="absolute z-[101]"
                      style={{
                        top: getColorPickerPosition().top + 'px',
                        left: getColorPickerPosition().left + 'px',
                        transform: 'translateX(-75%)',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <ColorPicker
                        selectedColor={selectedColor}
                        onChange={(color) => {
                          setSelectedColor(color);
                          setShowColorPicker(false);
                        }}
                        onClose={() => setShowColorPicker(false)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2 transition-colors"
                  style={{ 
                    backgroundColor: selectedColor !== COLORS[0].value ? selectedColor : 'var(--divider)'
                  }} 
                />
                <button
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 bg-card hover:bg-primary/5 active:bg-primary/10 transition-colors"
                  onClick={() => handleCreateNote(NoteType.STANDARD)}
                >
                  <DocumentTextIcon className="w-8 h-8 text-foreground" />
                  <span className="text-foreground font-medium">Note</span>
                </button>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-2 transition-colors"
                  style={{ 
                    backgroundColor: selectedColor !== COLORS[0].value ? selectedColor : 'var(--divider)'
                  }} 
                />
                <button
                  className="w-full h-24 flex flex-col items-center justify-center gap-2 rounded-lg border-2 bg-card hover:bg-primary/5 active:bg-primary/10 transition-colors"
                  onClick={() => handleCreateNote(NoteType.TODO)}
                >
                  <ListBulletIcon className="w-8 h-8 text-foreground" />
                  <span className="text-foreground font-medium">Checklist</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
