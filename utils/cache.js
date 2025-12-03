import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'football_';
const CACHE_DURATION = 60 * 60 * 1000; 

export const setCache = async (key, data) => {
  try {
    const item = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(item));
  } catch (err) {
    console.log('Cache set error:', err);
  }
};

export const getCache = async (key) => {
  try {
    const itemStr = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!itemStr) return null;
    const item = JSON.parse(itemStr);
    if (Date.now() - item.timestamp > CACHE_DURATION) {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    return item.data;
  } catch (err) {
    console.log('Cache get error:', err);
    return null;
  }
};

export const clearCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const footballKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
    await AsyncStorage.multiRemove(footballKeys);
  } catch (err) {
    console.log('Cache clear error:', err);
  }
};