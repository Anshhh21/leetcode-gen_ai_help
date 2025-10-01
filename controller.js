// Save solution in storage
async function saveSolution(tabId, type, answer) {
    return new Promise((resolve) => {
        chrome.storage.local.get(["solutions"], (res) => {
            const allSolutions = res.solutions || {};
            if (!allSolutions[tabId]) allSolutions[tabId] = {};
            allSolutions[tabId][type] = answer;
            chrome.storage.local.set({ solutions: allSolutions }, resolve);
        });
    });
}

// Load solution in storage
async function loadSolution(tabId, type) {
    return new Promise((resolve) => {
        chrome.storage.local.get(["solutions"], (res) => {
            const allSolutions = res.solutions || {};
            resolve(allSolutions[tabId]?.[type] || null);
        });
    });
}

// Get Gemini solution
async function getGeminiSolution(problem, type, lang, apiKey) {
    const promptMap = {
        hint: `${problem}\n\n Give only 3 hints to help solve the problem`,
        approach: `${problem}\n\n Explain the approach using one of the test case but not the exact code`,
        brute: `${problem}\n\n Give the brute force approach and code in ${lang} to help solve the problem`,
        optimized: `${problem}\n\n Give the optimized approach and code in ${lang} to help solve the problem`,
    };

    const prompt = promptMap[type] || promptMap.hint;

    const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.2 },
            }),
        }
    );

    if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error?.message || "Request failed");
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No solution";
}