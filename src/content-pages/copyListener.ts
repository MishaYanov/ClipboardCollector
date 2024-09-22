// Listen for the 'copy' event and send a message to the background script
document.addEventListener("copy", (event) => {
  const selectedText = window.getSelection()?.toString() || "";
  try {
    chrome.runtime.sendMessage({
      type: "copy",
      text: selectedText,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error sending copy message:", error);
  }
});

// Utility function to check if an element is editable
function isEditableElement(element: HTMLElement | null): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === "input" || tagName === "textarea";
  const isContentEditable = element.isContentEditable;

  return isInput || isContentEditable;
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PASTE_TEXT") {
    const textToPaste = message.payload?.text;

    if (typeof textToPaste === "string") {
      pasteTextIntoFocusedElement(textToPaste);
      sendResponse({ status: "success" });
    } else {
      console.error("Invalid payload for PASTE_TEXT message:", message.payload);
      sendResponse({ status: "failure", error: "Invalid text payload." });
    }
  }

});

/**
 * Pastes the provided text into the currently focused editable element.
 * @param text - The text to paste.
 */
function pasteTextIntoFocusedElement(text: string) {
  const activeElement = document.activeElement as HTMLElement | null;

  if (!activeElement) {
    console.warn("No active element is focused.");
    alert(
      "Please focus on an input field, textarea, or contenteditable element to paste the text."
    );
    return;
  }

  if (isEditableElement(activeElement)) {
    if (
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement
    ) {
      insertTextAtCursor(activeElement, text);
    } else {
      insertTextInContentEditable(text);
    }
  } else {
    console.warn("Focused element is not editable.");
    alert(
      "Please focus on an input field, textarea, or contenteditable element to paste the text."
    );
  }
}

/**
 * Inserts text at the current cursor position within an input or textarea element.
 * @param element - The input or textarea element.
 * @param text - The text to insert.
 */
function insertTextAtCursor(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string
) {
  const start = element.selectionStart ?? 0;
  const end = element.selectionEnd ?? 0;
  const value = element.value;

  element.value = value.substring(0, start) + text + value.substring(end);

  const newCursorPosition = start + text.length;
  element.setSelectionRange(newCursorPosition, newCursorPosition);

  const event = new Event("input", { bubbles: true });
  element.dispatchEvent(event);
}

/**
 * Inserts text into a contenteditable element at the current cursor position.
 * @param text - The text to insert.
 */
function insertTextInContentEditable(text: string) {
  const selection = window.getSelection();

  if (!selection) {
    console.warn("No selection available for contenteditable element.");
    alert("Please select a position in a contenteditable element to paste the text.");
    return;
  }

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);

    // Delete any selected content
    range.deleteContents();

    // Create a text node with the text to paste
    const textNode = document.createTextNode(text);

    // Insert the text node at the cursor position
    range.insertNode(textNode);

    // Move the cursor after the inserted text node
    range.setStartAfter(textNode);
    range.collapse(true);

    // Update the selection to reflect the new cursor position
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    // If there's no selection range, attempt to focus the last contenteditable element
    const editableElements = document.querySelectorAll<HTMLElement>(
      '[contenteditable="true"]'
    );

    if (editableElements.length > 0) {
      const lastEditable = editableElements[editableElements.length - 1];
      lastEditable.focus();

      const newSelection = window.getSelection();
      if (newSelection) {
        const newRange = document.createRange();
        newRange.selectNodeContents(lastEditable);
        newRange.collapse(false); // Collapse to the end
        newSelection.removeAllRanges();
        newSelection.addRange(newRange);

        // Insert the text at the new cursor position
        insertTextAtRange(newRange, text);
      }
    } else {
      console.warn("No contenteditable element found to paste the text.");
      alert("Please focus on a contenteditable element to paste the text.");
    }
  }
}

/**
 * Inserts text at a specified range within a contenteditable element.
 * @param range - The Range object representing the insertion point.
 * @param text - The text to insert.
 */
function insertTextAtRange(range: Range, text: string) {
  if (!range) return;

  range.deleteContents();

  const textNode = document.createTextNode(text);

  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.collapse(true);

  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
