// update-stories.js
const fs = require('fs');
const path = require('path');

// Path to the stories data file
const filePath = path.join(__dirname, 'stories-data.js');

// Read the current content
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Extract the stories data
        const storiesMatch = data.match(/const storiesData = (\{[\s\S]*?\});/);
        if (!storiesMatch) {
            throw new Error('Could not find storiesData in the file');
        }

        // Parse the stories data
        const storiesData = eval(`(${storiesMatch[1]})`);

        // Get the source story (ID 2)
        const sourceStory = JSON.parse(JSON.stringify(storiesData[2])); // Deep clone

        // Update all stories except 1 and 3
        Object.keys(storiesData).forEach(storyId => {
            const id = parseInt(storyId);
            if (id !== 1 && id !== 3) {  // Skip stories with ID 1 and 3
                // Keep the original story name
                const originalName = storiesData[id].name;

                // Replace all content except the name
                storiesData[id] = {
                    ...sourceStory,
                    name: originalName
                };
            }
        });

        // Create the new file content
        const newContent = `// stories-data.js
// ملف يحتوي على بيانات جميع القصص

const storiesData = ${JSON.stringify(storiesData, null, 4)};

// Export the stories data if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = storiesData;
}`;

        // Write the updated content back to the file
        fs.writeFile(filePath, newContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log('Successfully updated stories data!');
        });

    } catch (error) {
        console.error('Error processing stories:', error);
    }
});
