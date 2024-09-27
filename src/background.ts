import { createActiveCollectionContextMenuParent } from "./background/activeCollectionContextMenu";
import { createClipboardContextMenuParent } from "./background/clipboardContextMenu";
import { addCopyRecord } from "./background/database";
import MessageHandler from "./background/MessageHandler";
import { clipboardWrite, decodeId } from "./background/utils";

// USE THIS TO PURGE THE DATABASE
// clearAllData()

const bp = MessageHandler.getInstance();

chrome.runtime.onConnect.addListener((port) => {
  const mh = MessageHandler.getInstance();
});

chrome.runtime.onInstalled.addListener((details) => {
  rebuildContextMenus();


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
