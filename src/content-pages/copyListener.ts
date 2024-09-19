document.addEventListener("copy", (event) => {
  const selectedText = window.getSelection()?.toString() || "";

  chrome.runtime.sendMessage({
    type: "copy",
    text: selectedText,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Checks if the given element is editable (input, textarea, or contenteditable).
 * @param element The element to check.
 * @returns True if editable, false otherwise.
 */
function isEditableElement(element: HTMLElement): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === "input" || tagName === "textarea";
  const isContentEditable = element.isContentEditable;

  return isInput || isContentEditable;
}
// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PASTE_TEXT") {
    const textToPaste = message.payload.text;
    pasteTextIntoFocusedElement(textToPaste);
    sendResponse({ status: "success" });
  }
});

/**
 * Pastes the given text into the currently focused input, textarea, or contenteditable element.
 * @param text The text to paste.
 */
function pasteTextIntoFocusedElement(text: string) {
  const activeElement = document.activeElement as HTMLElement;

  if (isEditableElement(activeElement)) {
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement
    ) {
      // For input and textarea elements
      insertTextAtCursor(activeElement, text);
    } else {
      // For contenteditable elements
      insertTextInContentEditable(text);
    }
  } else {
    // If no editable element is focused, optionally notify the user
    console.warn("No editable element is focused.");
    alert(
      "Please focus on an input field, textarea, or contenteditable element to paste the text."
    );
  }
}

/**
 * Inserts text at the cursor position within an input or textarea element.
 * @param element The input or textarea element.
 * @param text The text to insert.
 */
function insertTextAtCursor(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string
) {
    debugger
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;
  const value = element.value;

  // Insert the text at the cursor position
  element.value = value.substring(0, start) + text + value.substring(end);

  // Move the cursor to the end of the inserted text
  const newCursorPosition = start + text.length;
  element.setSelectionRange(newCursorPosition, newCursorPosition);

  // Dispatch input events to notify any listeners
  const event = new Event("input", { bubbles: true });
  element.dispatchEvent(event);
}

/**
 * Inserts text at the cursor position within a contenteditable element.
 * @param text The text to insert.
 */
function insertTextInContentEditable(text: string) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    // Move the cursor to the end of the inserted text
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    // If no selection, append at the end
    const editableElements = document.querySelectorAll<HTMLElement>(
      '[contenteditable="true"]'
    );
    if (editableElements.length > 0) {
      const lastEditable = editableElements[editableElements.length - 1];
      lastEditable.focus();
      const newRange = document.createRange();
      newRange.selectNodeContents(lastEditable);
      newRange.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(newRange);
      insertTextInContentEditable(text);
    } else {
      console.warn("No contenteditable element found to paste the text.");
      alert("Please focus on a contenteditable element to paste the text.");
    }
  }
}
