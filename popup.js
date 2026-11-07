document.getElementById("settings").addEventListener("click", () => chrome.runtime.openOptionsPage());

document.getElementById("suspendNow").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "suspendNow" }, () => {
    document.getElementById("status").textContent = "Suspended.";
    setTimeout(() => window.close(), 600);
  });
});

chrome.runtime.sendMessage({ action: "getSettings" }, (s) => {
  document.getElementById("threshold").textContent = (s.suspendAfterMinutes || 30) + " min";
});

chrome.tabs.query({}, (tabs) => {
  document.getElementById("tabs").textContent = tabs.length;
  const suspended = tabs.filter((t) => t.url && t.url.includes("suspended.html")).length;
  document.getElementById("suspended").textContent = suspended;
});
