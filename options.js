const DEFAULTS = { suspendAfterMinutes: 30, whitelist: [], neverSuspendPinned: true, neverSuspendAudible: true };

function load() {
  chrome.storage.sync.get(DEFAULTS, (s) => {
    const v = { ...DEFAULTS, ...s };
    document.getElementById("minutes").value = v.suspendAfterMinutes;
    document.getElementById("pinned").checked = v.neverSuspendPinned;
    document.getElementById("audible").checked = v.neverSuspendAudible;
    document.getElementById("whitelist").value = (v.whitelist || []).join("\n");
  });
}

document.getElementById("save").addEventListener("click", () => {
  const settings = {
    suspendAfterMinutes: parseInt(document.getElementById("minutes").value) || 30,
    neverSuspendPinned: document.getElementById("pinned").checked,
    neverSuspendAudible: document.getElementById("audible").checked,
    whitelist: document.getElementById("whitelist").value.split("\n").map((s) => s.trim()).filter(Boolean),
  };
  chrome.storage.sync.set(settings, () => {
    const el = document.getElementById("saved");
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 1500);
  });
});

load();
