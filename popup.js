"use strict";
const KEY = "tms_enabled";
const btn = document.getElementById("toggle");
function render(on) {
  btn.textContent = on ? "ON" : "OFF";
  btn.classList.toggle("on", !!on);
}
chrome.storage.local.get(KEY, (r) => render(r && r[KEY]));
btn.addEventListener("click", () => {
  chrome.storage.local.get(KEY, (r) => {
    const next = !(r && r[KEY]);
    chrome.storage.local.set({ [KEY]: next }, () => render(next));
  });
});
