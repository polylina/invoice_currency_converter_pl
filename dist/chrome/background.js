// Background service worker – handles toolbar button click
// Sends a toggle message to the active tab's content script.

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return
  chrome.tabs.sendMessage(tab.id, { type: 'ICC_TOGGLE_SIDEBAR' }).catch(() => {
    // Content script may not be injected yet on restricted pages (e.g. chrome:// URLs)
  })
})
