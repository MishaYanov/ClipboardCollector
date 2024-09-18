import { clipboard } from "webextension-polyfill"

export function CopyListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'copy') {
            const copiedText = message.text;
            console.log('Copied text:', copiedText); 
        }
    });
}

export function CopyHandler() {}


 
