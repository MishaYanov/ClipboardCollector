import type { IPopupMessage } from "../models";
import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
import { PortName } from "../models/PortName";
import { getLast100Records, addCollection, deleteCollection, addCollectionRecord, getCollectionRecords, deleteCollectionRecord, getCollections } from "./database";

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
    }
    );

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

  private onMessageListener(message : IPopupMessage){
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

      // collections
      case PopupToBackGroundMessageType.GET_ALL_COLLECTIONS:
        this.getAllCollections();
        break;
      case PopupToBackGroundMessageType.ADD_COLLECTION:
        const payload = message.payload;
        addCollection(payload.name, payload.timestamp).then((id) => {
          this.getAllCollections();
        }).catch((error) => {
          // TODO: pass error to client
          console.error("Failed to add collection:", error);
        });
        break;
      case PopupToBackGroundMessageType.DELETE_COLLECTION:
        const collectionId = message.payload.collectionId;
        deleteCollection(collectionId).then(() => {
          this.getAllCollections();
        }).catch((error) => {
           // TODO: pass error to client
          console.error("Failed to delete collection:", error);
        });
        break;
      case PopupToBackGroundMessageType.ADD_COLLECTION_RECORD:
        const collectionRecord = message.payload.collectionRecord;
        addCollectionRecord(
          collectionRecord.collectionId,
          collectionRecord.text,
          collectionRecord.url,
          collectionRecord.timestamp,
          collectionRecord.shortcut
        ).then(() => {
          this.port.postMessage({
            type: PopupToBackGroundMessageType.GET_COLLECTION_RECORDS,
            collectionId: collectionRecord.collectionId,
          });
        }).catch((error) => {
           // TODO: pass error to client
          console.error("Failed to add collection record:", error);
        });
        break;
      case PopupToBackGroundMessageType.GET_COLLECTION_RECORDS:
        this.getAllCollectionRecords(message);
        break;
      case PopupToBackGroundMessageType.DELETE_COLLECTION_RECORD:
        const collectionRecordId = message.payload.collectionRecordId;
        deleteCollectionRecord(collectionRecordId).then(() => {
          this.getAllCollectionRecords(payload.collectionId)
        }).catch((error) => {
           // TODO: pass error to client
          console.error("Failed to delete collection record:", error);
        });
        break;
      case PopupToBackGroundMessageType.SET_ACTIVE_COLLECTION:
        break;
      case PopupToBackGroundMessageType.GET_ACTIVE_COLLECTION:
        break;

      default:
        break;
    }
  }

  private getAllCollectionRecords(message: IPopupMessage) {
    const collectionRecordsId = message.payload.collectionId;
    getCollectionRecords(collectionRecordsId).then((collectionRecords) => {
      this.port.postMessage({
        type: PopupToBackGroundMessageType.GET_COLLECTION_RECORDS,
        collectionRecords,
      });
    }).catch((error) => {
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
