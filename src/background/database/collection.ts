import type { ICollection, ICollectionRecord } from '../../models';
import { generateUUID } from '../../utils';
import { createActiveCollectionContextMenuParent, removeActiveCollectionContextMenuParent } from '../activeCollectionContextMenu';
import { openDatabase } from './';


export async function addCollection(name: string, timestamp: string): Promise<string> {
  const db = await openDatabase();
  const id = generateUUID();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('collections', 'readwrite');
    const store = transaction.objectStore('collections');

    const collection: ICollection = { id, name, timestamp };
    const request = store.add(collection);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = () => {
      console.error('Failed to add collection:', request.error);
      reject(request.error);
    };
  });
}

export async function getCollections(): Promise<ICollection[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('collections', 'readonly');
    const store = transaction.objectStore('collections');

    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as ICollection[]);
    };

    request.onerror = () => {
      console.error('Failed to get collections:', request.error);
      reject(request.error);
    };
  });
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['collections', 'collectionRecords'], 'readwrite');
    const collectionsStore = transaction.objectStore('collections');
    const collectionRecordsStore = transaction.objectStore('collectionRecords');

    // Delete the collection
    const deleteCollectionRequest = collectionsStore.delete(collectionId);

    deleteCollectionRequest.onsuccess = () => {
      // Delete all collectionRecords with this collectionId
      const index = collectionRecordsStore.index('collectionId');
      const range = IDBKeyRange.only(collectionId);
      const cursorRequest = index.openCursor(range);

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          collectionRecordsStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      cursorRequest.onerror = () => {
        console.error('Failed to delete collection records:', cursorRequest.error);
      };
    };

    transaction.oncomplete = () => {
      resolve();
    };

    transaction.onerror = () => {
      console.error('Transaction failed:', transaction.error);
      reject(transaction.error);
    };
  });
}

export async function addCollectionRecord(
  collectionId: string,
  text: string,
  url: string,
  timestamp: string,
  shortcut: string
): Promise<string> {
  const db = await openDatabase();
  const id = generateUUID();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('collectionRecords', 'readwrite');
    const store = transaction.objectStore('collectionRecords');

    const record: ICollectionRecord = {
      id,
      collectionId,
      text,
      url,
      timestamp,
      shortcut,
    };

    const request = store.add(record);

    request.onsuccess = () => {
      resolve(collectionId);
    };

    request.onerror = () => {
      console.error('Failed to add collection record:', request.error);
      reject(request.error);
    };
  });
}

export async function getCollectionRecords(collectionId: string): Promise<ICollectionRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('collectionRecords', 'readonly');
    const store = transaction.objectStore('collectionRecords');
    const index = store.index('collectionId');

    const request = index.getAll(IDBKeyRange.only(collectionId));

    request.onsuccess = () => {
      resolve(request.result as ICollectionRecord[]);
    };

    request.onerror = () => {
      console.error('Failed to get collection records:', request.error);
      reject(request.error);
    };
  });
}

export async function deleteCollectionRecord(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('collectionRecords', 'readwrite');
    const store = transaction.objectStore('collectionRecords');

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error('Failed to delete collection record:', request.error);
      reject(request.error);
    };
  });
}

export async function setActiveCollectionId(collectionId: string | null): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    if (collectionId === null) {
      //delete active collection id
      const request = store.delete('activeCollectionId');
      request.onsuccess = () => {
        // TODO: find a better place to put this
        removeActiveCollectionContextMenuParent();
        resolve();
      };
      request.onerror = () => {
        console.error('Failed to delete active collection id:', request.error);
        reject(request.error);
      };
      return;
    }
    const request = store.put({ key: 'activeCollectionId', value: collectionId });

    request.onsuccess = () => {
      createActiveCollectionContextMenuParent();
      resolve();
    };

    request.onerror = () => {
      console.error('Failed to set active collection id:', request.error);
      reject(request.error);
    };
  });
}

export async function getActiveCollectionId(): Promise<string | null> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');

    const request = store.get('activeCollectionId');

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result.value as string);
      } else {
        resolve(null);
      }
    };

    request.onerror = () => {
      console.error('Failed to get active collection id:', request.error);
      reject(request.error);
    };
  });
}
