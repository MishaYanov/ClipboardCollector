// write text to clipboard and paste it into the active tab
export async function clipboardWrite(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error("Failed to write to clipboard:", error);
    }
  
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "PASTE_TEXT", payload: { text } },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error sending message to content script:",
              chrome.runtime.lastError
            );
          }
        }
      );
    }
  }