import { getLast100Records } from "./database";
import { sanitizeId } from "./utils";

const menuPrefix = "clipboardContextMenu-";


export function createClipboardContextMenuParent(){
    chrome.contextMenus.create(
      {
        id: "contextMenuManagerClipboard",
        title: "Clipboard Manager: Clipboard History",
        contexts: ["all"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Error creating context menu:", chrome.runtime.lastError);
        } else {
          createClipboardChildMenus();
        }
      }
    );
  }


export async function createClipboardChildMenus() {
    // 
    const options = [];
    options.push(...(await getRecords()));
    if (options.length === 0) {
      options.push("No recent clipboard history");
    }
    options.forEach((option) => {
      chrome.contextMenus.create(
        {
          id: `clipboardContextMenu-${sanitizeId(option)}`,
          parentId: "contextMenuManagerClipboard",
          title: option,
          contexts: ["all"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error creating child context menu '${option}':`,
              chrome.runtime.lastError
            );
          } 
        }
      );
    });
  }
  
  
  export async function getRecords(): Promise<string[]> {
    const records = await getLast100Records(10);
    const options: string[] = [];
    records.forEach((record: any) => {
      options.push(record.text);
    });
    return options;
  }