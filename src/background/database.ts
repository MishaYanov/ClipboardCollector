// Open or create the IndexedDB database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("CopyDB", 1);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("copyHistory")) {
        const objectStore = db.createObjectStore("copyHistory", {
          keyPath: "id",
          autoIncrement: true,
        });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
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

export async function addCopyRecord(text: string, url: string, timestamp: string) {
  const db = await openDatabase();
  const transaction = db.transaction("copyHistory", "readwrite");
  const store = transaction.objectStore("copyHistory");

  store.add({ text, url, timestamp });

  transaction.oncomplete = () => {
    maintainRecordLimit(db);
  };

  transaction.onerror = () => {
    console.error("Transaction failed:", transaction.error);
  };
}

function maintainRecordLimit(db: IDBDatabase) {
  const transaction = db.transaction("copyHistory", "readwrite");
  const store = transaction.objectStore("copyHistory");

  const countRequest = store.count();

  countRequest.onsuccess = () => {
    const count = countRequest.result;
    if (count > 100) {
      let recordsToDelete = count - 100;

      const keyRequest = store.openCursor();

      keyRequest.onsuccess = () => {
        const cursor = keyRequest.result;
        if (cursor && recordsToDelete > 0) {
          store.delete(cursor.primaryKey);
          recordsToDelete--;
          cursor.continue();
        }
      };
    }
  };

  countRequest.onerror = () => {
    console.error("Count request failed:", countRequest.error);
  };
}

export async function getLast100Records(): Promise<any[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("copyHistory", "readonly");
    const store = transaction.objectStore("copyHistory");
    const index = store.index("timestamp");

    const request = index.openCursor(null, "prev"); // Open cursor in reverse order
    const records: any[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && records.length < 100) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        resolve(records);
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
