import type { IPopupMessage } from "../models/IPopupMessage";
import { PopupToBackGroundMessageType } from "../models/PopupToBackGroundMessageTypes";
import { PortName } from "../models/PortName";
import { getLast100Records } from "./database";

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
      if (message.type === PopupToBackGroundMessageType.GREET){
        getLast100Records().then((records) => {
          this.port.postMessage({
            type: PopupToBackGroundMessageType.GET_ALL,
            records,
          });
        });
      }
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
        break;
      default:
        break;
    }
  }
}


export default PortToPopup;
