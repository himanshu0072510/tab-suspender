# Tab Suspender — Save Memory

Website: https://himanshu0072510.github.io/tab-suspender/

A Chrome extension that automatically suspends inactive tabs to free up memory. Click to restore. Free, private, no data collection.

## Features
- Auto-suspend tabs after configurable inactivity (default 30 min)
- Never suspends pinned tabs or tabs playing audio
- Whitelist domains that should never be suspended
- Manual "suspend now" from the popup
- One-click restore
- Settings page for full configuration

## Install (developer mode)
1. Open Chrome → `chrome://extensions`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked" → select this folder
4. The extension icon appears in your toolbar

## How it works
- A service worker checks tabs every minute.
- Tabs inactive longer than the threshold are replaced with a lightweight suspended page.
- The original URL is stored in the query string; clicking "Restore" navigates back.
- Suspended tabs use ~0 MB of memory.

## Tech
Manifest V3 · Service Worker · Chrome Storage API · Alarms API

## Privacy
No data is collected or sent anywhere. All settings stored locally in Chrome sync storage.
