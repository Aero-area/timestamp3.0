import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { useToast } from './ToastProvider';

interface QueuedStamp {
  id: string;
  timestamp: string;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'offline_stamp_queue';
const MAX_RETRIES = 3;

export const [OfflineQueueProvider, useOfflineQueue] = createContextHook(() => {
  const { showToast } = useToast();
  const [queue, setQueue] = useState<QueuedStamp[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load queue from storage on init
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
        if (stored) {
          setQueue(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Failed to load offline queue:', error);
      }
    };
    loadQueue();
  }, []);

  // Save queue to storage whenever it changes
  const saveQueue = useCallback(async (newQueue: QueuedStamp[]) => {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(newQueue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }, []);

  // Add stamp to queue
  const queueStamp = useCallback(async (timestamp: string) => {
    const newStamp: QueuedStamp = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      retryCount: 0,
    };
    
    const newQueue = [...queue, newStamp];
    setQueue(newQueue);
    await saveQueue(newQueue);
    
    if (!isOnline) {
      showToast('Offline - stamps will sync when back online', 'info');
    }
  }, [queue, saveQueue, isOnline, showToast]);

  // Process queue (called when back online)
  const processQueue = useCallback(async (onStampCallback: (timestamp: string) => Promise<boolean>) => {
    if (isProcessing || queue.length === 0) return;
    
    setIsProcessing(true);
    const remainingQueue: QueuedStamp[] = [];
    
    for (const stamp of queue) {
      try {
        const success = await onStampCallback(stamp.timestamp);
        if (!success) {
          if (stamp.retryCount < MAX_RETRIES) {
            remainingQueue.push({ ...stamp, retryCount: stamp.retryCount + 1 });
          } else {
            console.warn('Max retries reached for stamp:', stamp);
          }
        }
      } catch (error) {
        console.error('Error processing queued stamp:', error);
        if (stamp.retryCount < MAX_RETRIES) {
          remainingQueue.push({ ...stamp, retryCount: stamp.retryCount + 1 });
        }
      }
    }
    
    setQueue(remainingQueue);
    await saveQueue(remainingQueue);
    setIsProcessing(false);
    
    if (queue.length > remainingQueue.length) {
      showToast(`Synced ${queue.length - remainingQueue.length} offline stamps`, 'success');
    }
  }, [queue, isProcessing, saveQueue, showToast]);

  // Listen for app state changes to detect when back online
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground, assume we might be back online
        setIsOnline(true);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Set offline status
  const setOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  const setOnline = useCallback(() => {
    setIsOnline(true);
  }, []);

  return useMemo(() => ({
    queue,
    isOnline,
    isProcessing,
    queueStamp,
    processQueue,
    setOffline,
    setOnline,
    hasQueuedItems: queue.length > 0,
  }), [queue, isOnline, isProcessing, queueStamp, processQueue, setOffline, setOnline]);
});