export const DATABASE_NAME = 'CopyDB';
export const DATABASE_VERSION = 2;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion || 0;

      if (oldVersion < 1) {
        // Version 1: Create copyHistory store
        if (!db.objectStoreNames.contains('copyHistory')) {
          const objectStore = db.createObjectStore('copyHistory', {
            keyPath: 'id',
          });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      }

      if (oldVersion < 2) {
        // Version 2: Create collections and collectionRecords stores

        // Create collections store
        if (!db.objectStoreNames.contains('collections')) {
          const collectionsStore = db.createObjectStore('collections', {
            keyPath: 'id',
          });
          collectionsStore.createIndex('timestamp', 'timestamp', { unique: false });
          collectionsStore.createIndex('name', 'name', { unique: false });
        }

        // Create collectionRecords store
        if (!db.objectStoreNames.contains('collectionRecords')) {
          const collectionRecordsStore = db.createObjectStore('collectionRecords', {
            keyPath: 'id',
          });
          collectionRecordsStore.createIndex('collectionId', 'collectionId', { unique: false });
          collectionRecordsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Optional: Create settings store for active collection reference
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
