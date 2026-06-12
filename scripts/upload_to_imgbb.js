const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
if (!IMGBB_API_KEY) {
    console.error('Missing IMGBB_API_KEY. Add it to the .env file in the project root.');
    process.exit(1);
}
const imageDir = path.join(__dirname, '..', 'images');
const htmlFile = path.join(__dirname, '..', 'index.html');

const images = [
    'hero-home.jpg',
    'product-andiamo.jpg',
    'product-orbit.jpg',
    'product-sardine.jpg',
    'product-shoes.jpg'
];

async function uploadImage(filename) {
    const filePath = path.join(imageDir, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });

    try {
        const formData = new URLSearchParams();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64Image);
        formData.append('name', filename.split('.')[0]);

        const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data && response.data.success) {
            console.log(`Success! ${filename} uploaded to: ${response.data.data.url}`);
            return response.data.data.url;
        } else {
            console.log(`Failed to upload ${filename}:`, response.data);
            return null;
        }
    } catch (error) {
        console.error(`Error uploading ${filename}:`, error.message);
        return null;
    }
}

async function run() {
    let indexHtml = fs.readFileSync(htmlFile, 'utf8');
    
    for (const img of images) {
        console.log(`Uploading ${img}...`);
        const url = await uploadImage(img);
        if (url) {
            // Replace local image path with Imgbb URL in index.html
            indexHtml = indexHtml.replace(new RegExp(`images\/${img}`, 'g'), url);
        }
    }
    
    fs.writeFileSync(htmlFile, indexHtml);
    console.log('Finished uploading and updating index.html!');
}

run();
