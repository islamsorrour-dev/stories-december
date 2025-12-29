const fs = require('fs');

try {
    const content = fs.readFileSync('stories-data.js', 'utf8');

    // Simple regex to find "ID: { ... name: "Name" ... }"
    // This assumes specific formatting which seems consistent
    // We'll look for lines starting with "    X: {" and then find the "name" property

    const lines = content.split('\n');
    const stories = {};
    let currentId = null;

    lines.forEach(line => {
        // Match "    4: {" or "    50: {"
        const idMatch = line.match(/^\s*(\d+):\s*\{/);
        if (idMatch) {
            currentId = parseInt(idMatch[1]);
        }

        // Match 'name: "Name",' or 'name: "Name"'
        const nameMatch = line.match(/^\s*name:\s*"([^"]+)"/);
        if (currentId !== null && nameMatch) {
            stories[currentId] = nameMatch[1];
            currentId = null; // Reset to avoid overwriting or mixing
        }
    });

    // Check for gaps
    const foundIds = Object.keys(stories).map(Number).sort((a, b) => a - b);
    const gaps = [];
    for (let i = 1; i <= 50; i++) {
        if (!foundIds.includes(i)) {
            gaps.push(i);
        }
    }

    console.log(JSON.stringify({
        stories: stories,
        gaps: gaps,
        total: foundIds.length
    }, null, 2));

} catch (e) {
    console.error(e);
}
