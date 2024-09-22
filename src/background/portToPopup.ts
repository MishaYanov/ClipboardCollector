import type { IPopupMessage } from "../models";
import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
import { PortName } from "../models/PortName";
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

class PortToPopup {
  private static instance: PortToPopup;
  private port: chrome.runtime.Port = chrome.runtime.connect({
    name: PortName.POPUP,
  });

  private constructor() {}

  public static getInstance(): PortToPopup {
    if (!PortToPopup.instance) {
      PortToPopup.instance = new PortToPopup();
    }
    return PortToPopup.instance;
  }

  public connect(port: chrome.runtime.Port): void {
    this.port = port;
    this.port.onMessage.addListener((message) => {
      this.onMessageListener(message);
    });

    this.port.onDisconnect.addListener(() => {
      console.log("port disconnected");
    });
  }

  public sendMessage(message: any) {
    this.port.postMessage(message);
  }

  public onMessage(callback: (message: any) => void) {
    this.port.onMessage.addListener(callback);
  }

  public close() {
    this.port.disconnect();
  }

  private onMessageListener(message: IPopupMessage) {
    switch (message.type) {
      //clipboard
      case PopupToBackGroundMessageType.GREET:
        getLast100Records().then((records) => {
          this.port.postMessage({
            type: PopupToBackGroundMessageType.GET_ALL,
            records,
          });
        });
        break;
      case PopupToBackGroundMessageType.DELETE:
        const recordId = message.payload.id;
        deleteCopyRecord(recordId)
          .then(() => {
            getLast100Records().then((records) => {
              this.port.postMessage({
                type: PopupToBackGroundMessageType.GET_ALL,
                records,
              });
            });
          })
          .catch((error) => {
            console.error("Failed to delete record:", error);
          });

      // collections
      case PopupToBackGroundMessageType.GET_ALL_COLLECTIONS:
        this.getAllCollections();
        break;
      case PopupToBackGroundMessageType.ADD_COLLECTION:
        const payload = message.payload;
        addCollection(payload.name, payload.timestamp)
          .then((id) => {
            this.getAllCollections();
          })
          .catch((error) => {
            // TODO: pass error to client
            console.error("Failed to add collection:", error);
          });
        break;
      case PopupToBackGroundMessageType.DELETE_COLLECTION:
        const collectionId = message.payload.collectionId;
        deleteCollection(collectionId)
          .then(() => {
            getActiveCollectionId().then((activeCollectionId) => {
              if (activeCollectionId === collectionId) {
                setActiveCollectionId(null);
              }
            });
            this.getAllCollections();
          })
          .catch((error) => {
            // TODO: pass error to client
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
            this.port.postMessage({
              type: PopupToBackGroundMessageType.COLLECTION_RECORD_ADDED,
              payload: { collectionId: collectionRecord.collectionId },
            });
          })
          .catch((error) => {
            this.port.postMessage({
              type: PopupToBackGroundMessageType.ERROR,
              payload: error,
            });
            console.error("Failed to add collection record:", error);
          });
        break;
      case PopupToBackGroundMessageType.GET_COLLECTION_RECORDS:
        this.getAllCollectionRecords(message);
        break;
      case PopupToBackGroundMessageType.DELETE_COLLECTION_RECORD:
        const collectionRecordId = message.payload.collectionRecordId;
        deleteCollectionRecord(collectionRecordId)
          .then(() => {
            this.getAllCollectionRecords(payload.collectionId);
          })
          .catch((error) => {
            // TODO: pass error to client
            console.error("Failed to delete collection record:", error);
          });
        break;
      case PopupToBackGroundMessageType.SET_ACTIVE_COLLECTION:
        const collectionIdToActivate = message.payload.id;
        setActiveCollectionId(collectionIdToActivate)
          .then(() => {
            this.getActiveCollection();
          })
          .catch((error) => {
            console.error("Failed to set active collection:", error);
          });
        break;
      case PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION:
        this.getActiveCollection();
        break;
      default:
        break;
    }
  }

  private getActiveCollection() {
    getActiveCollectionId()
      .then((activeCollectionId) => {
        this.port.postMessage({
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

  private getAllCollectionRecords(message: IPopupMessage) {
    const collectionRecordsId = message.payload.collectionId;
    getCollectionRecords(collectionRecordsId)
      .then((collectionRecords) => {
        this.port.postMessage({
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

  private getAllCollections() {
    getCollections().then((collections) => {
      this.port.postMessage({
        type: PopupToBackGroundMessageType.GET_ALL_COLLECTIONS,
        collections,
      });
    });
  }
}

export default PortToPopup;
