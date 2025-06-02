export enum ViewMode {
  LIST = 'LIST',
  DETAILED_LIST = 'DETAILED_LIST',
  GRID = 'GRID',
  LARGE_GRID = 'LARGE_GRID'
}

export enum SortBy {
  CREATED_ASC = 'CREATED_ASC',
  CREATED_DESC = 'CREATED_DESC',
  MODIFIED_ASC = 'MODIFIED_ASC',
  MODIFIED_DESC = 'MODIFIED_DESC',
  ALPHA_ASC = 'ALPHA_ASC',
  ALPHA_DESC = 'ALPHA_DESC',
  REMINDER_ASC = 'REMINDER_ASC',
  REMINDER_DESC = 'REMINDER_DESC',
  COLOR = 'COLOR'
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SOFT = 'SOFT',
  SYSTEM = 'SYSTEM'
}

export enum NoteType {
  STANDARD = 'STANDARD',
  TODO = 'TODO'
}

export enum AttachType {
  IMAGE = 'IMAGE',
  VOICE = 'VOICE',
  FILE = 'FILE'
}

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  type: AttachType;
  url: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  color: string;
  todoItems?: TodoItem[];
  attachments?: Attachment[];
  reminder?: Date;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  theme: Theme;
  fontSize: number;
  viewMode: ViewMode;
  sortBy: SortBy;
  encryptionKey?: string;
  backupEnabled: boolean;
  lastBackupDate?: Date;
} 