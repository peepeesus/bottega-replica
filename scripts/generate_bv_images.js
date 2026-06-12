const axios = require('axios');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const KIE_API_KEY = process.env.KIE_API_KEY;
if (!KIE_API_KEY) {
    console.error('Missing KIE_API_KEY. Add it to the .env file in the project root.');
    process.exit(1);
}
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${KIE_API_KEY}`
};

const imagesToGenerate = [
    {
        filename: 'hero-home.jpg',
        aspect_ratio: '16:9',
        prompt: {
            "prompt": "Ultra-realistic high fashion editorial photography capturing an elegant summer campaign for a premier luxury brand. Wide cinematic composition. Subject is styled in minimalist high-fashion summer attire, muted tones. Background features vast architectural elements or remote nature scenery. Shot on 35mm lens, f/8, vivid clarity, documentary realism, hard natural lighting, visible film grain. Do not beautify or alter facial features.",
            "negative_prompt": "plastic skin, airbrushed, cartoon, CGI, artificial, typography, watermark, text"
        }
    },
    {
        filename: 'product-andiamo.jpg',
        aspect_ratio: '3:4',
        prompt: {
            "prompt": "Ultra-realistic studio product photography of a premium luxury leather woven tote bag. Intrecciato woven leather technique. Rich deep burgundy or dark brown tone. Placed elegantly on a seamless minimalist white background. Soft diffused top down lighting emphasizing the organic leather texture and metallic brass knot detailing. Tack sharp macro lens focus, 85mm. Highly detailed, visible leather grain.",
            "negative_prompt": "plastic, CGI, fake, illustrated, low resolution, multiple bags, people, hands"
        }
    },
    {
        filename: 'product-orbit.jpg',
        aspect_ratio: '3:4',
        prompt: {
            "prompt": "Ultra-realistic studio product photography of a modern high-fashion luxury sneaker. Silver, grey, and green metallic mesh sports aesthetic. Dynamic subtle lighting. Placed elegantly on a seamless minimalist white background. Tack sharp macro lens focus, 85mm. Highly detailed, visible mesh texture.",
            "negative_prompt": "plastic, CGI, fake, illustrated, low resolution, multiple shoes, people, hands"
        }
    },
    {
        filename: 'product-sardine.jpg',
        aspect_ratio: '3:4',
        prompt: {
            "prompt": "Ultra-realistic studio product photography of a premium luxury leather hobo bag. Distinctive sculptural metallic brass handle shaped like a sardine. Supple folded leather body in deep black or chocolate brown. Placed elegantly on a seamless minimalist white background. Soft diffused top down lighting emphasizing the metallic reflection and soft leather. Tack sharp macro lens focus, 85mm. Highly detailed.",
            "negative_prompt": "plastic, CGI, fake, illustrated, low resolution, multiple bags, people, hands"
        }
    },
    {
        filename: 'product-shoes.jpg',
        aspect_ratio: '3:4',
        prompt: {
            "prompt": "Ultra-realistic studio product photography of a pair of high-fashion pointed-toe leather pumps. Intrecciato woven leather detailing on the toe. Glossy black finish. Placed elegantly on a seamless minimalist white background. Soft diffused lighting emphasizing specular highlights on the leather. Tack sharp macro lens focus, 85mm. Highly detailed.",
            "negative_prompt": "plastic, CGI, fake, illustrated, low resolution, feet, models, people"
        }
    }
];

async function pollTask(taskId) {
    let attempts = 0;
    while (attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 4000));
        attempts++;
        try {
            const res = await axios.get(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, { headers: HEADERS });
            const data = res.data.data;
            if (!data) continue;
            console.log(`Poll ${attempts}: state = ${data.state}`);
            if (data.state === 'success' || data.state === 'completed') {
                const resultJson = JSON.parse(data.resultJson || '{}');
                if (resultJson.resultUrls && resultJson.resultUrls.length > 0) {
                    return resultJson.resultUrls[0];
                }
            } else if (data.state === 'failed' || data.state === 'error') {
                throw new Error('Task failed on server side.');
            }
        } catch (e) {
            console.log(`Polling error: ${e.message}`);
        }
    }
    throw new Error('Timeout waiting for job completion');
}

async function generateImage(job) {
    const payload = {
        model: 'nano-banana-2',
        input: {
            prompt: JSON.stringify(job.prompt),
            aspect_ratio: job.aspect_ratio,
            resolution: '1K',
            output_format: 'jpg'
        }
    };

    console.log(`\nStarting generation for ${job.filename}...`);
    try {
        const createTaskRes = await axios.post('https://api.kie.ai/api/v1/jobs/createTask', payload, { headers: HEADERS });
        const taskId = createTaskRes.data.data.taskId;
        console.log(`Task created. ID: ${taskId}`);

        const imageUrl = await pollTask(taskId);
        console.log(`Downloading image from: ${imageUrl}`);
        
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const outPath = path.join(__dirname, '..', 'images', job.filename);
        fs.writeFileSync(outPath, imgRes.data);
        console.log(`Saved successfully to ${outPath}`);
    } catch (e) {
        console.error(`Error generating ${job.filename}:`, e.message);
    }
}

async function runAll() {
    for (const job of imagesToGenerate) {
        await generateImage(job);
    }
    console.log('\nAll images generated!');
}

runAll();
