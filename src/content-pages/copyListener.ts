// Listen for copy events on the document
document.addEventListener('copy', (event) => {
    // Get the copied text
    const selectedText = window.getSelection()?.toString() || '';
  
    // Send a message to the background script
    chrome.runtime.sendMessage({
      type: 'copy',
      text: selectedText,
      url: window.location.href,
    });
  });