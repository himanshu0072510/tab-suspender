const params = new URLSearchParams(location.search);
const url = params.get("url") || "";
const title = params.get("title") || "Tab";
document.title = "Suspended: " + decodeURIComponent(title);
document.getElementById("url").textContent = decodeURIComponent(url);

const btn = document.getElementById("restore");
btn.addEventListener("click", restore);
document.addEventListener("keydown", (e) => { if (e.key === "Enter") restore(); });

function restore() {
  btn.textContent = "Restoring…";
  btn.disabled = true;
  chrome.runtime.sendMessage({ action: "restore", url }, () => {
    // tab will navigate; nothing else needed
  });
}

// Show memory hint
if (performance && performance.memory) {
  const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1);
  document.getElementById("stats").textContent = `Suspended tab uses ~0 MB (was using memory).`;
}
