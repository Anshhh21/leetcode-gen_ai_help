document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
        const output = document.getElementById("output");
        const lang = document.getElementById("language").value;
        output.textContent = `Generating ${btn.id}...`;

        // get user's api key
        chrome.storage.sync.get(["geminiApiKey"], ({ geminiApiKey }) => {
            if (!geminiApiKey) {
                output.textContent = "No API key set, click the gear icon to add one.";
                return;
            }

            // current tab
            chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
                if (!tab || !tab.id) {
                    output.textContent = "No active tab found.";
                    return;
                }

                try {
                    const url = new URL(tab.url);
                    if (url.hostname !== "leetcode.com" && url.hostname !== "www.leetcode.com") {
                        output.textContent = "This extension only works on LeetCode problem pages.";
                        return;
                    }
                } catch (e) {
                    output.textContent = "Invalid tab URL.";
                    return;
                }

                // send message to content script
                chrome.tabs.sendMessage(
                    tab.id,
                    { action: "getProblem" },
                    async (response) => {
                        if (chrome.runtime.lastError) {
                            output.textContent = "Please reload the page";
                            return;
                        }
                        if (!response) {
                            output.textContent = "No response from content script.";
                            return;
                        }
                        const { problem } = response;
                        if (!problem) {
                            output.textContent = "Couldn't extract text from this page.";
                            return;
                        }

                        // check if solution already saved
                        const saved = await loadSolution(tab.id, btn.id);
                        if (saved) {
                            output.textContent = saved;
                            return;
                        }

                        // otherwise call Gemini
                        try {
                            const answer = await getGeminiSolution(problem, btn.id, lang, geminiApiKey);
                            output.textContent = answer;

                            // save solution
                            saveSolution(tab.id, btn.id, answer);
                        } catch (error) {
                            output.textContent = "Gemini Error: " + error.message;
                        }
                    }
                );
            });
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async ([tab]) => {
        if (!tab || !tab.id) return;
        
        // load all four options if available
        const savedHint = await loadSolution(tab.id, "hint");
        const savedApproach = await loadSolution(tab.id, "approach");
        const savedBrute = await loadSolution(tab.id, "brute");
        const savedOptimized = await loadSolution(tab.id, "optimized");

        const output = document.getElementById("output");
        if (savedHint || savedApproach || savedBrute || savedOptimized) {
            output.textContent =
                (savedHint ? "Hint:\n" + savedHint + "\n\n" : "") +
                (savedApproach ? "Approach:\n" + savedApproach + "\n\n" : "") +
                (savedBrute ? "Brute Force:\n" + savedBrute + "\n\n" : "") +
                (savedOptimized ? "Optimized:\n" + savedOptimized : "");
        }
    });
});
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("themeToggle");
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light";
  body.classList.add(savedTheme + "-theme");

  toggleBtn.addEventListener("click", () => {
    if (body.classList.contains("light-theme")) {
      body.classList.remove("light-theme");
      body.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      body.classList.remove("dark-theme");
      body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
    }
  });
});
