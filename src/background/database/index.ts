import { openDatabase } from "./db";
import {
  addCopyRecord,
  deleteCopyRecord,
  getLast100Records,
} from "./copyHistory";
import {
  addCollection,
  getCollections,
  deleteCollection,
  addCollectionRecord,
  getCollectionRecords,
  deleteCollectionRecord,
  setActiveCollectionId,
  getActiveCollectionId,
} from "./collection";

export {
  openDatabase,
  addCopyRecord,
  deleteCopyRecord,
  getLast100Records,
  addCollection,
  getCollections,
  deleteCollection,
  addCollectionRecord,
  getCollectionRecords,
  deleteCollectionRecord,
  setActiveCollectionId,
  getActiveCollectionId,
};
