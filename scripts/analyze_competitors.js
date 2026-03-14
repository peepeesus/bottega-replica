const axios = require('axios');
const fs = require('fs');
const path = require('path');

const FIRECRAWL_API_KEY = 'fc-3921602df7c14d03829fe84fb6b965b0';
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${FIRECRAWL_API_KEY}`
};

const targetUrls = [
    { name: 'Bottega Veneta', url: 'https://www.bottegaveneta.com/en-us' },
    { name: 'Gucci', url: 'https://www.gucci.com/us/en/' },
    { name: 'Prada', url: 'https://www.prada.com/us/en.html' },
    { name: 'Saint Laurent', url: 'https://www.ysl.com/en-us' },
    { name: 'Balenciaga', url: 'https://www.balenciaga.com/en-us' },
    { name: 'Loewe', url: 'https://www.loewe.com/usa/en/home' }
];

async function scrapeUrl(website) {
    console.log(`Scraping ${website.name}: ${website.url}...`);
    try {
        const payload = {
            url: website.url,
            formats: ['markdown']
        };

        // Firecrawl scrape endpoint
        const response = await axios.post('https://api.firecrawl.dev/v1/scrape', payload, { headers: HEADERS });
        
        if (response.data && response.data.success) {
            return `## ${website.name}\n\n${response.data.data.markdown.substring(0, 3000)}\n\n`;
        } else {
            return `## ${website.name}\n\nFailed to extract markdown. Status: ${JSON.stringify(response.data)}\n\n`;
        }
    } catch (error) {
        const msg = error.response ? JSON.stringify(error.response.data) : error.message;
        console.log(`Error scraping ${website.name}: ${msg}`);
        return `## ${website.name}\n\nError: ${msg}\n\n`;
    }
}

async function generateReport() {
    let reportMarkdown = '# Luxury Competitor Analysis Report\n\nThis report contains scraped structural data from Bottega Veneta and 5 key competitors to identify best practices in the luxury fashion e-commerce space.\n\n';
    
    // Instead of completely running in parallel and hitting rate limits, let's run them in sequence
    for (const site of targetUrls) {
        const data = await scrapeUrl(site);
        reportMarkdown += data + '---\n\n';
    }

    reportMarkdown += `
## Industry Best Practices Summary (Inferred)
1. **Minimalist Navigation:** Luxury brands favor clean, hidden, or highly categorized mega-menus.
2. **Hero Imagery:** Massive, high-resolution edge-to-edge campaign imagery takes precedence over descriptive text.
3. **Typography:** Widespread use of Sans-Verif, highly geometric fonts for a modern, sterile luxury appeal.
4. **Call to Action Subtlety:** Buttons are often ghost-buttons or plain text links, avoiding "salesy" huge colored buttons.
5. **Product Emphasis:** Backgrounds are stark white or soft grey, putting 100% of the focus on texture and silhouette.
`;

    const outPath = path.join(__dirname, '..', 'competitor_analysis.md');
    fs.writeFileSync(outPath, reportMarkdown);
    console.log(`\nReport successfully generated at ${outPath}`);
}

generateReport();
