// Tab Suspender — background service worker (Manifest V3)

const DEFAULTS = {
  suspendAfterMinutes: 30,
  whitelist: [],
  neverSuspendPinned: true,
  neverSuspendAudible: true,
  checkIntervalMinutes: 1,
};

let settings = { ...DEFAULTS };
let lastActive = {}; // tabId -> timestamp

// Load settings
chrome.storage.sync.get(DEFAULTS, (s) => { settings = { ...DEFAULTS, ...s }; });

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    for (const k in changes) settings[k] = changes[k].newValue;
  }
});

// Track tab activity
function markActive(tabId) {
  lastActive[tabId] = Date.now();
}

chrome.tabs.onActivated.addListener((info) => markActive(info.tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete" || changeInfo.url) markActive(tabId);
});
chrome.tabs.onCreated.addListener((tab) => markActive(tab.id));

// Periodic check
chrome.alarms.create("check", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "check") checkTabs();
});

async function checkTabs() {
  // reload settings
  const s = await chrome.storage.sync.get(DEFAULTS);
  settings = { ...DEFAULTS, ...s };

  const tabs = await chrome.tabs.query({});
  const now = Date.now();
  const threshold = settings.suspendAfterMinutes * 60 * 1000;

  for (const tab of tabs) {
    if (!tab.id || !tab.url) continue;
    if (tab.active) { markActive(tab.id); continue; }
    if (tab.pinned && settings.neverSuspendPinned) continue;
    if (tab.audible && settings.neverSuspendAudible) continue;
    if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("edge://")) continue;
    if (tab.url.includes("suspended.html")) continue; // already suspended

    // whitelist check
    if (settings.whitelist.some((w) => tab.url.includes(w))) continue;

    const last = lastActive[tab.id] || tab.lastAccessed || now;
    if (now - last >= threshold) {
      suspendTab(tab);
    }
  }
}

function suspendTab(tab) {
  const url = encodeURIComponent(tab.url);
  const title = encodeURIComponent(tab.title || "");
  const suspendedUrl = chrome.runtime.getURL(`suspended.html?url=${url}&title=${title}`);
  chrome.tabs.update(tab.id, { url: suspendedUrl });
}

// Restore: handled by suspended.js, but also handle direct navigation
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "restore") {
    chrome.tabs.update(sender.tab.id, { url: decodeURIComponent(msg.url) });
    sendResponse({ ok: true });
  }
  if (msg.action === "suspendNow") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) suspendTab(tabs[0]);
    });
    sendResponse({ ok: true });
  }
  if (msg.action === "getSettings") {
    chrome.storage.sync.get(DEFAULTS, (s) => sendResponse({ ...DEFAULTS, ...s }));
  }
  if (msg.action === "saveSettings") {
    chrome.storage.sync.set(msg.settings, () => sendResponse({ ok: true }));
  }
  return true;
});

// Clean up lastActive on tab close
chrome.tabs.onRemoved.addListener((tabId) => { delete lastActive[tabId]; });
