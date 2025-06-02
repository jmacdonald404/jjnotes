export interface ElectronWindow {
  electron: {
    setReminder(title: string, date: Date): Promise<void>;
    selectFile(): Promise<string | undefined>;
    startRecording(): Promise<void>;
    stopRecording(): Promise<string | undefined>;
    addToCalendar(title: string, date: Date, description: string): Promise<void>;
  };
}

declare global {
  interface Window extends ElectronWindow {}
} 