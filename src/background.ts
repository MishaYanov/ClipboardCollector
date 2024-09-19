import browser from "webextension-polyfill";
import { addCopyRecord, getLast100Records } from "./background/database";
import PortToPopup from "./background/portToPopup";


// USE THIS TO PURGE THE DATABASE
// clearAllData()


browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
  // this is from the content script
  // TODO: add types and listeners for content script messages
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === "copy") {
        await addCopyRecord(message.text, message.url, message.timestamp);
      }
    }
  );
});

const bp = PortToPopup.getInstance();

chrome.runtime.onConnect.addListener((port) => {
  bp.connect(port);
});
