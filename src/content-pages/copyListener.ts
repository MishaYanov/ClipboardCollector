document.addEventListener("copy", (event) => {
  const selectedText = window.getSelection()?.toString() || "";

  chrome.runtime.sendMessage({
    type: "copy",
    text: selectedText,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
});

// check if the element is an input field, textarea, or contenteditable element
function isEditableElement(element: HTMLElement): boolean {
  if (!element) return false;

  const tagName = element.tagName.toLowerCase();
  const isInput = tagName === "input" || tagName === "textarea";
  const isContentEditable = element.isContentEditable;

  return isInput || isContentEditable;
}
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PASTE_TEXT") {
    const textToPaste = message.payload.text;
    pasteTextIntoFocusedElement(textToPaste);
    sendResponse({ status: "success" });
  }
});

function pasteTextIntoFocusedElement(text: string) {
  const activeElement = document.activeElement as HTMLElement;

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
    console.warn("No editable element is focused.");
    alert(
      "Please focus on an input field, textarea, or contenteditable element to paste the text."
    );
  }
}

function insertTextAtCursor(
  element: HTMLInputElement | HTMLTextAreaElement,
  text: string
) {
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;
  const value = element.value;

  element.value = value.substring(0, start) + text + value.substring(end);

  const newCursorPosition = start + text.length;
  element.setSelectionRange(newCursorPosition, newCursorPosition);

  const event = new Event("input", { bubbles: true });
  element.dispatchEvent(event);
}

// insert text into the focused contenteditable element
function insertTextInContentEditable(text: string) {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const textNode = document.createTextNode(text);
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
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
