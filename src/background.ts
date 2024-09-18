import browser from "webextension-polyfill";
import { addCopyRecord, getLast100Records } from "./background/database";
import type { IPopupMessage } from "./models/IPopupMessage";
import PortToPopup from "./background/portToPopup";
import { PopupToBackGroundMessageType } from "./models/PopupToBackGroundMessageTypes";

browser.runtime.onInstalled.addListener((details) => {
  //create port to popup

  console.log("Extension installed:", details);
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === "copy") {
        await addCopyRecord(message.text, message.url, message.timestamp);
        getLast100Records()
          .then((records) => {
            console.log("Last 100 Copy Records:", records);
          })
          .catch((error) => {
            console.error("Error retrieving records:", error);
          });
      }
    }
  );
});

const bp = PortToPopup.getInstance();

chrome.runtime.onConnect.addListener((port) => {
  bp.connect(port);
});
