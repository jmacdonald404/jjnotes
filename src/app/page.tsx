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
  const [showSortModal, setShowSortModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'color' | 'sort' | 'view'>('color');
  const { theme } = useTheme();

  // Get unique colors used in notes
  const usedColors = React.useMemo(() => {
    const colors = new Set(notes.filter(note => !note.isDeleted && !note.isArchived).map(note => note.color));
    return Array.from(colors);
  }, [notes]);

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

          <Button
            className="w-full"
            size="lg"
            variant="flat"
            onPress={() => setShowSortModal(true)}
          >
            Sort
          </Button>

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

      {showSortModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSortModal(false);
            }
          }}
        >
          <div 
            className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex w-full gap-2">
                <Button
                  className="flex-1"
                  color={activeTab === 'color' ? 'primary' : 'default'}
                  variant={activeTab === 'color' ? 'solid' : 'flat'}
                  onPress={() => setActiveTab('color')}
                >
                  Color
                </Button>
                <Button
                  className="flex-1"
                  color={activeTab === 'sort' ? 'primary' : 'default'}
                  variant={activeTab === 'sort' ? 'solid' : 'flat'}
                  onPress={() => setActiveTab('sort')}
                >
                  Sort
                </Button>
                <Button
                  className="flex-1"
                  color={activeTab === 'view' ? 'primary' : 'default'}
                  variant={activeTab === 'view' ? 'solid' : 'flat'}
                  onPress={() => setActiveTab('view')}
                >
                  View
                </Button>
              </div>
            </div>

            <div className="mt-4">
              {activeTab === 'color' && (
                <div className="grid grid-cols-4 gap-3">
                  <button
                    className="group relative flex flex-col items-center gap-1"
                    onClick={() => {
                      setFilterColor(undefined);
                      setShowSortModal(false);
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-lg transition-transform group-hover:scale-110 border-2 relative"
                      style={{
                        backgroundColor: 'var(--card-background)',
                        borderColor: filterColor === undefined ? 'var(--color-primary)' : 'var(--divider)',
                      }}
                    >
                      {filterColor === undefined && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs opacity-60">All</span>
                  </button>
                  {usedColors.map((color) => (
                    <button
                      key={color}
                      className="group relative flex flex-col items-center gap-1"
                      onClick={() => {
                        setFilterColor(color);
                        setShowSortModal(false);
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-lg transition-transform group-hover:scale-110 border-2 relative"
                        style={{
                          backgroundColor: color,
                          borderColor: filterColor === color ? 'var(--color-primary)' : COLORS.find(c => c.value === color)?.border,
                        }}
                      >
                        {filterColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs opacity-60">
                        {COLORS.find(c => c.value === color)?.label || 'Custom'}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'sort' && (
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant={settings.sortBy === SortBy.CREATED_DESC ? 'solid' : 'flat'}
                    color={settings.sortBy === SortBy.CREATED_DESC ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, sortBy: SortBy.CREATED_DESC });
                      setShowSortModal(false);
                    }}
                  >
                    Newest First
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant={settings.sortBy === SortBy.CREATED_ASC ? 'solid' : 'flat'}
                    color={settings.sortBy === SortBy.CREATED_ASC ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, sortBy: SortBy.CREATED_ASC });
                      setShowSortModal(false);
                    }}
                  >
                    Oldest First
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant={settings.sortBy === SortBy.MODIFIED_DESC ? 'solid' : 'flat'}
                    color={settings.sortBy === SortBy.MODIFIED_DESC ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, sortBy: SortBy.MODIFIED_DESC });
                      setShowSortModal(false);
                    }}
                  >
                    Last Modified
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant={settings.sortBy === SortBy.ALPHA_ASC ? 'solid' : 'flat'}
                    color={settings.sortBy === SortBy.ALPHA_ASC ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, sortBy: SortBy.ALPHA_ASC });
                      setShowSortModal(false);
                    }}
                  >
                    Title A-Z
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant={settings.sortBy === SortBy.ALPHA_DESC ? 'solid' : 'flat'}
                    color={settings.sortBy === SortBy.ALPHA_DESC ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, sortBy: SortBy.ALPHA_DESC });
                      setShowSortModal(false);
                    }}
                  >
                    Title Z-A
                  </Button>
                </div>
              )}

              {activeTab === 'view' && (
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant={settings.viewMode === ViewMode.GRID ? 'solid' : 'flat'}
                    color={settings.viewMode === ViewMode.GRID ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, viewMode: ViewMode.GRID });
                      setShowSortModal(false);
                    }}
                  >
                    Grid View
                  </Button>
                  <Button
                    className="w-full justify-start"
                    variant={settings.viewMode === ViewMode.LIST ? 'solid' : 'flat'}
                    color={settings.viewMode === ViewMode.LIST ? 'primary' : 'default'}
                    onPress={() => {
                      setSettings({ ...settings, viewMode: ViewMode.LIST });
                      setShowSortModal(false);
                    }}
                  >
                    List View
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
