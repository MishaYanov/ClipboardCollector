import { openDatabase } from './db';

// DEVELOPMENT ONLY: Clear all data from all object stores
export async function clearAllData(): Promise<void> {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const storeNames = Array.from(db.objectStoreNames);

    if (storeNames.length === 0) {
      resolve();
      return;
    }

    const transaction = db.transaction(storeNames, 'readwrite');

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      console.error('Error clearing object stores:', transaction.error);
      reject(transaction.error);
    };

    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      store.clear();
    }
  });
}
