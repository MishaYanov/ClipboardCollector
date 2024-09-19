import { createActiveCollectionContextMenuParent } from "./background/activeCollectionContextMenu";
import {
  createClipboardChildMenus,
  createClipboardContextMenuParent,
} from "./background/clipboardContextMenu";
import {
  addCopyRecord,
  getActiveCollectionId,
  getLast100Records,
} from "./background/database";
import PortToPopup from "./background/portToPopup";
import { clipboardWrite, decodeId, sanitizeId } from "./background/utils";

// USE THIS TO PURGE THE DATABASE
// clearAllData()

chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      debugger;
      if (message.type === "copy") {
        await addCopyRecord(message.text, message.url, message.timestamp);
        createClipboardChildMenus();
        sendResponse({ status: "recorded" });
      }
    }
  );

  const bp = PortToPopup.getInstance();

  chrome.runtime.onConnect.addListener((port) => {
    bp.connect(port);
  });

  createClipboardContextMenuParent();

  //get active collection -> if exists, get all records -> create collection context menu
  getActiveCollectionId().then((activeCollectionId) => {
    if (activeCollectionId) {
      createActiveCollectionContextMenuParent();
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (
    typeof info.menuItemId === "string" &&
    (info.menuItemId.startsWith("clipboardContextMenu-") ||
      info.menuItemId.startsWith("activeCollectionContextMenu-"))
  ) {
    const sanitizedText = info.menuItemId.startsWith(
      "activeCollectionContextMenu-"
    )
      ? info.menuItemId.replace("activeCollectionContextMenu-", "")
      : info.menuItemId.replace("clipboardContextMenu-", "");
    const text = decodeId(sanitizedText);
    clipboardWrite(text);
  }
});
