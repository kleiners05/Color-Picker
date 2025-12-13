// Service worker for Chrome Extension
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "toggleColorPicker" });
});
