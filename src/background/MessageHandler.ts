// MessageHandler.ts
import type { IPopupMessage } from "../models";
import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
import {
  getLast100Records,
  addCollection,
  deleteCollection,
  addCollectionRecord,
  getCollectionRecords,
  deleteCollectionRecord,
  getCollections,
  setActiveCollectionId,
  getActiveCollectionId,
  deleteCopyRecord,
} from "./database";

class MessageHandler {
  private static instance: MessageHandler;

  private constructor() {
    this.initListener();
  }

  public static getInstance(): MessageHandler {
    if (!MessageHandler.instance) {
      MessageHandler.instance = new MessageHandler();
    }
    return MessageHandler.instance;
  }

  private initListener() {
    chrome.runtime.onMessage.addListener(
      (
        message: IPopupMessage,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: any) => void
      ) => {
        this.onMessageListener(message, sender, sendResponse);
        // Indicate that we will respond asynchronously
        return true;
      }
    );
  }

  private onMessageListener(
    message: IPopupMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void
  ) {
    debugger
    switch (message.type) {
      case PopupToBackGroundMessageType.GREET:
        getLast100Records().then((records) => {
          sendResponse({
            type: PopupToBackGroundMessageType.GET_ALL,
            records,
          });
        });
        break;

      case PopupToBackGroundMessageType.DELETE:
        debugger
        const recordId = message.payload.id;
        deleteCopyRecord(recordId)
          .then(() => {
            sendResponse({
              type: PopupToBackGroundMessageType.COPY_RECORD_DELETED,
            });
            
          })
          .catch((error) => {
            console.error("Failed to delete record:", error);
          });
        break;

      // Collections
      case PopupToBackGroundMessageType.GET_ALL_COLLECTIONS:
        this.getAllCollections(sendResponse);
        break;

      case PopupToBackGroundMessageType.ADD_COLLECTION:
        const payload = message.payload;
        addCollection(payload.name, payload.timestamp)
          .then(() => this.getAllCollections(sendResponse))
          .catch((error) => {
            console.error("Failed to add collection:", error);
          });
        break;

      case PopupToBackGroundMessageType.DELETE_COLLECTION:
        const collectionId = message.payload.collectionId;
        deleteCollection(collectionId)
          .then(() => getActiveCollectionId())
          .then((activeCollectionId) => {
            if (activeCollectionId === collectionId) {
              return setActiveCollectionId(null);
            }
          })
          .then(() => this.getAllCollections(sendResponse))
          .catch((error) => {
            console.error("Failed to delete collection:", error);
          });
        break;

      case PopupToBackGroundMessageType.ADD_COLLECTION_RECORD:
        const collectionRecord = message.payload;
        addCollectionRecord(
          collectionRecord.collectionId,
          collectionRecord.text,
          collectionRecord.url,
          collectionRecord.timestamp,
          collectionRecord.shortcut
        )
          .then(() => {
            sendResponse({
              type: PopupToBackGroundMessageType.COLLECTION_RECORD_ADDED,
              payload: { collectionId: collectionRecord.collectionId },
            });
            
          })
          .catch((error) => {
            sendResponse({
              type: PopupToBackGroundMessageType.ERROR,
              payload: error,
            });
            console.error("Failed to add collection record:", error);
          });
        break;

      case PopupToBackGroundMessageType.GET_COLLECTION_RECORDS:
        this.getAllCollectionRecords(message, sendResponse);
        break;

      case PopupToBackGroundMessageType.DELETE_COLLECTION_RECORD:
        const collectionRecordId = message.payload.collectionRecordId;
        deleteCollectionRecord(collectionRecordId)
          .then(() => {
            sendResponse({
              type: PopupToBackGroundMessageType.COLLECTION_RECORD_DELETED,
              payload: { collectionRecordId },
            });
          })
          .catch((error) => {
            console.error("Failed to delete collection record:", error);
          });
        break;

      case PopupToBackGroundMessageType.SET_ACTIVE_COLLECTION:
        const collectionIdToActivate = message.payload.id;
        setActiveCollectionId(collectionIdToActivate)
          .then(() => this.getActiveCollection(sendResponse))
          .catch((error) => {
            console.error("Failed to set active collection:", error);
          });
        break;

      case PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION:
        this.getActiveCollection(sendResponse);
        break;

      default:
        break;
    }
  }

  private getActiveCollection(sendResponse: (response: any) => void) {
    getActiveCollectionId()
      .then((activeCollectionId) => {
        sendResponse({
          type: PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION,
          payload: {
            id: activeCollectionId,
          },
        });
      })
      .catch((error) => {
        console.error("Failed to get active collection:", error);
      });
  }

  private getAllCollectionRecords(
    message: IPopupMessage,
    sendResponse: (response: any) => void
  ) {
    const collectionRecordsId = message.payload.collectionId;
    getCollectionRecords(collectionRecordsId)
      .then((collectionRecords) => {
        sendResponse({
          type: PopupToBackGroundMessageType.GET_COLLECTION_RECORDS,
          payload: {
            collectionRecords,
            collectionId: collectionRecordsId,
          },
        });
      })
      .catch((error) => {
        console.error("Failed to get collection records:", error);
      });
  }

  private getAllCollections(sendResponse: (response: any) => void) {
    getCollections()
      .then((collections) => {
        sendResponse({
          type: PopupToBackGroundMessageType.GET_ALL_COLLECTIONS,
          collections,
        });
      })
      .catch((error) => {
        console.error("Failed to get collections:", error);
      });
  }
}

export default MessageHandler;
