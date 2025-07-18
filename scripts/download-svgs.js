const fs = require('fs');
const path = require('path');
const https = require('https');

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, '..', 'downloads', 'svgs');
if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
}

// Function to download a file
function downloadFile(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(downloadsDir, filename));

        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }

            response.pipe(file);

            file.on('finish', () => {
                file.close();
                console.log(`✓ Downloaded: ${filename}`);
                resolve();
            });

            file.on('error', (err) => {
                fs.unlink(path.join(downloadsDir, filename), () => { }); // Delete partial file
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to fetch SVG data from API
function fetchSVGs() {
    return new Promise((resolve, reject) => {
        https.get('https://api.svgl.app', (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    if (response.statusCode !== 200) {
                        reject(new Error(`API returned status ${response.statusCode}: ${data}`));
                        return;
                    }

                    const svgs = JSON.parse(data);
                    resolve(svgs);
                } catch (error) {
                    console.error('Failed to parse JSON:', error.message);
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

// Main function
async function downloadAllSVGs() {
    try {
        console.log('🚀 Fetching SVG list from svgl.app API...');
        const svgs = await fetchSVGs();

        console.log(`📦 Found ${svgs.length} SVGs to download`);
        console.log(`📁 Saving to: ${downloadsDir}`);

        let downloaded = 0;
        let failed = 0;

        // Download SVGs in batches to avoid overwhelming the server
        const batchSize = 10;
        for (let i = 0; i < svgs.length; i += batchSize) {
            const batch = svgs.slice(i, i + batchSize);

            const promises = batch.map(async (svg) => {
                try {
                    // Handle different route formats
                    if (typeof svg.route === 'string') {
                        // Simple string route
                        const filename = `${svg.title.replace(/[^a-zA-Z0-9]/g, '_')}_${svg.id}.svg`;
                        await downloadFile(svg.route, filename);
                        downloaded++;
                    } else if (typeof svg.route === 'object') {
                        // Object with light/dark variants
                        if (svg.route.light) {
                            const filename = `${svg.title.replace(/[^a-zA-Z0-9]/g, '_')}_${svg.id}_light.svg`;
                            await downloadFile(svg.route.light, filename);
                            downloaded++;
                        }
                        if (svg.route.dark) {
                            const filename = `${svg.title.replace(/[^a-zA-Z0-9]/g, '_')}_${svg.id}_dark.svg`;
                            await downloadFile(svg.route.dark, filename);
                            downloaded++;
                        }
                    }
                } catch (error) {
                    console.error(`✗ Failed to download ${svg.title}: ${error.message}`);
                    failed++;
                }
            });

            await Promise.all(promises);

            // Small delay between batches
            if (i + batchSize < svgs.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log('\n🎉 Download complete!');
        console.log(`✓ Successfully downloaded: ${downloaded} SVGs`);
        console.log(`✗ Failed downloads: ${failed} SVGs`);
        console.log(`📁 Files saved to: ${downloadsDir}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
downloadAllSVGs();