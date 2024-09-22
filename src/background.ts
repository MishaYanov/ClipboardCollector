import { createActiveCollectionContextMenuParent } from "./background/activeCollectionContextMenu";
import {
  createClipboardContextMenuParent,
} from "./background/clipboardContextMenu";
import {
  addCopyRecord,
} from "./background/database";
import PortToPopup from "./background/portToPopup";
import { clipboardWrite, decodeId } from "./background/utils";
import { PortName } from "./models";

// USE THIS TO PURGE THE DATABASE
// clearAllData()


const bp = PortToPopup.getInstance();

chrome.runtime.onConnect.addListener((port) => {
  try {
    if (port.name !== PortName.POPUP) return;
    console.log(`Connected to port: ${port.name}`);
    bp.connect(port);
  } catch (error) {
    console.error("Error in onConnect:", error);
  }
});


chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      if (message.type === "copy") {
        await addCopyRecord(message.text, message.url, message.timestamp);
        rebuildContextMenus();
        sendResponse({ status: "recorded" });
      }
    }
  );
  rebuildContextMenus();
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


function rebuildContextMenus() {
  chrome.contextMenus.removeAll(() => {
    createClipboardContextMenuParent();
    createActiveCollectionContextMenuParent();
  });
}