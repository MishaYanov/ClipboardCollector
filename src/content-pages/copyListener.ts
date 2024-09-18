document.addEventListener('copy', (event) => {
    const selectedText = window.getSelection()?.toString() || '';
    
    chrome.runtime.sendMessage({
        type: 'copy',
        text: selectedText,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
  });