import { getRecords } from "./clipboardContextMenu";
import { getActiveCollectionId, getCollectionRecords } from "./database";
import { sanitizeId } from "./utils";


export async function createActiveCollectionContextMenuParent(){
    // verify active collection exists
    const activeCollectionId = await getActiveCollectionId();
    if (!activeCollectionId) return;
    removeActiveCollectionContextMenuParent();
    chrome.contextMenus.create(
      {
        id: "contextMenuManagerActiveCollection",
        title: "Clipboard Manager: Active Collection",
        contexts: ["all"],
      },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Error creating context menu:", chrome.runtime.lastError);
        } else {
          console.log("Clipboard Manager context menu created successfully.");
          createActiveCollectionChildMenus(activeCollectionId);
        }
      }
    );
  }

  async function createActiveCollectionChildMenus(activeCollectionId: string) {
    const options: string[] = [];
    const records = await getCollectionRecords(activeCollectionId);
    records.forEach((record: any) => {
      options.push(record.text);
    });
    
    if (options.length === 0) {
      options.push("No records found");
    }
    options.forEach((option) => {
      chrome.contextMenus.create(
        {
          id: `activeCollectionContextMenu-${sanitizeId(option)}`,
          parentId: "contextMenuManagerActiveCollection",
          title: option,
          contexts: ["all"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              `Error creating child context menu '${option}':`,
              chrome.runtime.lastError
            );
          } else {
            console.log(`Child context menu '${option}' created successfully.`);
          }
        }
      );
    });
  }


  export function removeActiveCollectionContextMenuParent(){
    chrome.contextMenus.remove("contextMenuManagerActiveCollection");
  }