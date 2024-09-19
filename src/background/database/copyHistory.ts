import type { IRecord } from "../../models";
import { generateUUID } from "../../utils";
import { openDatabase } from "./db";

export async function addCopyRecord(
  text: string,
  url: string,
  timestamp: string
): Promise<void> {
  const db = await openDatabase();
  const id = generateUUID();
  const transaction = db.transaction("copyHistory", "readwrite");
  const store = transaction.objectStore("copyHistory");

  const record: IRecord = { id, text, url, timestamp };
  store.add(record);

  transaction.oncomplete = () => {
    maintainRecordLimit(db);
  };

  transaction.onerror = () => {
    console.error("Transaction failed:", transaction.error);
  };
}

export async function deleteCopyRecord(id: string): Promise<void> {
  const db = await openDatabase();
  const transaction = db.transaction("copyHistory", "readwrite");
  const store = transaction.objectStore("copyHistory");

  store.delete(id);

  transaction.oncomplete = () => {
    console.log("Record deleted");
  };

  transaction.onerror = () => {
    console.error("Transaction failed:", transaction.error);
  };
}
//TODO: rename this function to getRecords
export async function getLast100Records(limit: number = 100): Promise<IRecord[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("copyHistory", "readonly");
    const store = transaction.objectStore("copyHistory");
    const index = store.index("timestamp");

    const request = index.openCursor(null, "prev"); // Open cursor in reverse order
    const records: IRecord[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && records.length < limit) {
        records.push(cursor.value as IRecord);
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

function maintainRecordLimit(db: IDBDatabase): void {
  const transaction = db.transaction("copyHistory", "readwrite");
  const store = transaction.objectStore("copyHistory");

  const countRequest = store.count();

  countRequest.onsuccess = () => {
    const count = countRequest.result;
    if (count > 100) {
      let recordsToDelete = count - 100;

      const cursorRequest = store.openCursor();

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
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
