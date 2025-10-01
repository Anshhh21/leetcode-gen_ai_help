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

// Append to container
const container = document.getElementById("ai-helper-container");
container.appendChild(toggleBtn);

chrome.runtime.onMessage.addListener((req, _sender, sendResponse) => {
    if (req.action === "getProblem") {
        sendResponse({ problem: getProblemStatement() });
    }
});
