function getProblemStatement() {
    const desc = document.querySelector(`div[data-track-load="description_content"]`);
    return desc ? desc.innerText.trim() : "No problem found";
}
// Create toggle button
const toggleBtn = document.createElement("button");
toggleBtn.innerText = "🌙 Toggle Theme";
toggleBtn.style.position = "absolute";
toggleBtn.style.top = "10px";
toggleBtn.style.right = "10px";
toggleBtn.style.zIndex = "9999";
toggleBtn.style.padding = "5px 10px";
toggleBtn.style.cursor = "pointer";
// Default theme
container.classList.add(localStorage.getItem("theme") || "light-theme");

// CSS for themes
const style = document.createElement("style");
style.innerHTML = `
  #ai-helper-container.light-theme { background-color: #fff; color: #000; }
  #ai-helper-container.dark-theme { background-color: #121212; color: #fff; }
`;
document.head.appendChild(style);
toggleBtn.addEventListener("click", () => {
  if (container.classList.contains("light-theme")) {
    container.classList.remove("light-theme");
    container.classList.add("dark-theme");
    localStorage.setItem("theme", "dark");
  } else {
    container.classList.remove("dark-theme");
    container.classList.add("light-theme");
    localStorage.setItem("theme", "light");
  }
});


// Append to container
const container = document.getElementById("ai-helper-container");
container.appendChild(toggleBtn);

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.action === "getProblem") {
        sendResponse({ problem: getProblemStatement() });
    }
});
