'use client';

import React from 'react';
import {
  Card,
  Select,
  SelectItem,
  Switch,
  Slider,
  Button,
} from '@heroui/react';
import { UserSettings, Theme } from '../types';
import { useTheme } from './ThemeProvider';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}

export default function Settings({ settings, onUpdate }: SettingsProps) {
  const { setTheme } = useTheme();

  const handleChange = (key: keyof UserSettings, value: any) => {
    if (key === 'theme') {
      setTheme(value as Theme);
    }
    onUpdate({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Settings</h2>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Theme</h3>
          <Select
            label="Select theme"
            selectedKeys={[settings.theme]}
            onSelectionChange={(keys) => handleChange('theme', Array.from(keys)[0])}
          >
            {Object.values(Theme).map((theme) => (
              <SelectItem key={theme}>
                {theme.charAt(0) + theme.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </Select>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Font Size</h3>
          <Slider
            label="Font size"
            step={1}
            maxValue={24}
            minValue={12}
            value={settings.fontSize}
            onChange={(value) => handleChange('fontSize', value)}
            className="max-w-md"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Backup</h3>
          <Switch
            isSelected={settings.backupEnabled}
            onValueChange={(checked) => handleChange('backupEnabled', checked)}
          >
            Enable automatic backup
          </Switch>
        </div>
      </div>
    </div>
  );
} 