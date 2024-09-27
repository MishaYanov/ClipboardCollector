class MessageService {
  public static instance: MessageService;

  constructor() { }

  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  public sendMessage(message: any, callback?: (response: any) => void) {
    chrome.runtime.sendMessage(message, callback);
  }

  public onMessage(
    callback: (
      message: any,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response: any) => void
    ) => void
  ) {
    chrome.runtime.onMessage.addListener(callback);
  }
}

export default MessageService;
