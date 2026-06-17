export interface UserSettings {
  githubToken?: string;
  isPrivate?: boolean;
  userId?: string;
  credits?: number;
  plan?: string;
}

export const getSettings = async (): Promise<UserSettings> => {
  return new Promise((resolve) => {
    if (!chrome?.storage?.sync) {
      resolve({} as UserSettings); // Fallback for dev mode
      return;
    }
    chrome.storage.sync.get(['githubToken', 'isPrivate', 'userId', 'credits', 'plan'], (result) => {
      resolve(result as UserSettings);
    });
  });
};

export const saveSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  return new Promise((resolve) => {
    if (!chrome?.storage?.sync) {
      resolve();
      return;
    }
    chrome.storage.sync.set(settings, () => {
      resolve();
    });
  });
};

export const clearSettings = async (): Promise<void> => {
  return new Promise((resolve) => {
    if (!chrome?.storage?.sync) {
      resolve();
      return;
    }
    chrome.storage.sync.clear(() => resolve());
  });
};

export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const getCachedPlan = async (key: string): Promise<string | null> => {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      resolve(localStorage.getItem(key));
      return;
    }
    chrome.storage.local.get([key], (result) => {
      resolve((result[key] as string) || null);
    });
  });
};

export const setCachedPlan = async (key: string, plan: string): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      localStorage.setItem(key, plan);
      resolve();
      return;
    }
    chrome.storage.local.set({ [key]: plan }, () => {
      resolve();
    });
  });
};

export interface GenerationStatus {
  status: 'idle' | 'loading' | 'success' | 'error';
  step: number;
  issueKey?: string;
  plan?: string;
  error?: string;
}

export const getGenerationStatus = async (): Promise<GenerationStatus | null> => {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      const data = localStorage.getItem('generationStatus');
      resolve(data ? JSON.parse(data) : null);
      return;
    }
    chrome.storage.local.get(['generationStatus'], (result) => {
      resolve((result.generationStatus as GenerationStatus) || null);
    });
  });
};

export const setGenerationStatus = async (status: GenerationStatus): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      localStorage.setItem('generationStatus', JSON.stringify(status));
      resolve();
      return;
    }
    chrome.storage.local.set({ generationStatus: status }, () => {
      resolve();
    });
  });
};


