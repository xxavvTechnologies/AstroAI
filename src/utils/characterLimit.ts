const DAILY_LIMIT = 9000;
const STORAGE_KEY = 'astro-character-usage';

interface UsageData {
  count: number;
  date: string;
}

export const getTodayKey = () => {
  return new Date().toISOString().split('T')[0];
};

export const getCharacterUsage = (): number => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return 0;

  const usage: UsageData = JSON.parse(data);
  if (usage.date !== getTodayKey()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 0, date: getTodayKey() }));
    return 0;
  }

  return usage.count;
};

export const updateCharacterUsage = (newChars: number): void => {
  const currentUsage = getCharacterUsage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    count: currentUsage + newChars,
    date: getTodayKey()
  }));
};

export const getRemainingCharacters = (): number => {
  return DAILY_LIMIT - getCharacterUsage();
};

export const hasReachedLimit = (): boolean => {
  return getCharacterUsage() >= DAILY_LIMIT;
};
