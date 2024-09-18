import browser from "webextension-polyfill";
import { CopyListener } from "./background/CopyHandler";

console.log("Hello from the background!");

browser.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed:", details);
  CopyListener();
});
