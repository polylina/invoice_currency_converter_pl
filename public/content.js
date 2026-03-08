// Content script – injects/removes the currency converter sidebar iframe.

;(function () {
  const SIDEBAR_ID = 'icc-sidebar-container'
  const SIDEBAR_WIDTH = '400px'

  function createSidebar() {
    const container = document.createElement('div')
    container.id = SIDEBAR_ID
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      right: '0',
      width: SIDEBAR_WIDTH,
      height: '100%',
      zIndex: '2147483647',
      boxShadow: '-3px 0 12px rgba(0,0,0,0.18)',
      border: 'none',
      overflow: 'hidden',
    })

    const iframe = document.createElement('iframe')
    iframe.src = chrome.runtime.getURL('sidebar.html')
    Object.assign(iframe.style, {
      width: '100%',
      height: '100%',
      border: 'none',
      display: 'block',
    })
    container.appendChild(iframe)
    document.documentElement.appendChild(container)

    // Shift page content to make room for the sidebar
    document.documentElement.style.marginRight = SIDEBAR_WIDTH
    document.documentElement.style.boxSizing = 'border-box'
  }

  function removeSidebar() {
    const container = document.getElementById(SIDEBAR_ID)
    if (container) {
      container.remove()
      document.documentElement.style.marginRight = ''
    }
  }

  // Toggle on toolbar button click (message from background.js)
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'ICC_TOGGLE_SIDEBAR') {
      if (document.getElementById(SIDEBAR_ID)) {
        removeSidebar()
      } else {
        createSidebar()
      }
    }
  })

  // Handle close button inside the sidebar iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ICC_CLOSE_SIDEBAR') {
      // Validate origin: only accept messages from the extension's own sidebar
      const sidebarOrigin = new URL(chrome.runtime.getURL('sidebar.html')).origin
      if (event.origin === sidebarOrigin) {
        removeSidebar()
      }
    }
  })
})()
