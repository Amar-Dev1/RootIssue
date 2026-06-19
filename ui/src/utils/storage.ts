export interface UserSettings {
  githubToken?: string;
  provider?: string;
  model?: string;
  apiKey?: string;
  credits?: number; // fallback free credits
  currentIssueUrl?: string;
  generatedPlan?: string;
  panelState?: 'idle' | 'loading' | 'result' | 'error';
  loadingStep?: number;
  errorMessage?: string;
}

const SETTINGS_KEY = 'rootissue_settings';

export const getSettings = async (): Promise<UserSettings> => {
  return new Promise((resolve) => {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data) {
      resolve(JSON.parse(data));
    } else {
      resolve({} as UserSettings);
    }
  });
};

export const saveSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  return new Promise(async (resolve) => {
    const current = await getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    resolve();
  });
};

export const clearSettings = async (): Promise<void> => {
  return new Promise((resolve) => {
    localStorage.removeItem(SETTINGS_KEY);
    resolve();
  });
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
