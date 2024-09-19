import { addCopyRecord, getLast100Records } from "./background/database";
import PortToPopup from "./background/portToPopup";

// USE THIS TO PURGE THE DATABASE
// clearAllData()

chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
  chrome.runtime.onMessage.addListener(
    async (message, sender, sendResponse) => {
      debugger
      if (message.type === "copy") {
        await addCopyRecord(message.text, message.url, message.timestamp);
        createChildMenus();
        sendResponse({ status: "recorded" });
      }
    }
  );

  chrome.contextMenus.create(
    {
      id: "contextMenuManager",
      title: "Clipboard Manager",
      contexts: ["all"]
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error("Error creating context menu:", chrome.runtime.lastError);
      } else {
        console.log("Clipboard Manager context menu created successfully.");
        createChildMenus();
      }
    }
  );
});

const bp = PortToPopup.getInstance();

chrome.runtime.onConnect.addListener((port) => {
  bp.connect(port);
});

async function createChildMenus() {
  const options = await getRecords();

  if (options.length === 0) {
    options.push("No recent clipboard history");
  }
  options.forEach((option) => {
    chrome.contextMenus.create(
      {
        id: `clipboardContextMenu-${sanitizeId(option)}`, 
        parentId: "contextMenuManager", 
        title: option, 
        contexts: ["all"]
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error(`Error creating child context menu '${option}':`, chrome.runtime.lastError);
        } else {
          console.log(`Child context menu '${option}' created successfully.`);
        }
      }
    );
  });
}

function sanitizeId(option: string): string {
  return option.replace(/\s+/g, '-').toLowerCase().substring(0, 100);
}

async function getRecords(): Promise<string[]> {
  const records = await getLast100Records(10);
  const options: string[] = [];
  records.forEach((record: any) => {
    options.push(record.text);
  });
  return options;
}

async function clipboardWrite(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    console.log("Text written to clipboard:", text);
  } catch (error) {
    console.error("Failed to write to clipboard:", error);
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { type: "PASTE_TEXT", payload: { text } }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending message to content script:", chrome.runtime.lastError);
      } else {
        console.log("Pasted text into the page:", response?.status);
      }
    });
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (typeof info.menuItemId === 'string' && info.menuItemId.startsWith("clipboardContextMenu-")) {
    const sanitizedText = info.menuItemId.replace("clipboardContextMenu-", "");
    const text = decodeId(sanitizedText);
    clipboardWrite(text);
  }
});

function decodeId(id: string): string {
  return id.replace(/-/g, ' ');
}
