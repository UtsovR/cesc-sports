import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const ABOUT_IMAGES = [
    'src/assets/about/33.JPG',
    'src/assets/about/44.JPG',
    'src/assets/about/3.jpg',
    'src/assets/about/11.JPG',
    'src/assets/about/15.JPG'
];

const VISION_IMAGES = [
    'src/assets/vision/2.jpg',
    'src/assets/vision/23.JPG',
    'src/assets/vision/13.JPG',
    'src/assets/vision/6.jpg',
    'src/assets/vision/10.JPG'
];

async function uploadImages(type, list) {
    const bucket = `${type}-images`;
    const table = `${type}_images`;

    console.log(`\n--- Migrating ${type} images ---`);

    // We read them sequentially to maintain order in the DB (created_at)
    for (const relativePath of list) {
        const filePath = path.resolve(relativePath);
        if (!fs.existsSync(filePath)) {
            console.warn(`File not found: ${filePath}`);
            continue;
        }

        const fileName = path.basename(filePath);
        const fileContent = fs.readFileSync(filePath);

        console.log(`Uploading ${fileName}...`);

        // 1. Upload to Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, fileContent, {
                upsert: true,
                contentType: fileName.toLowerCase().endsWith('.jpg') ? 'image/jpeg' : 'image/png'
            });

        if (uploadError) {
            console.error(`Error uploading ${fileName}:`, uploadError.message);
            continue;
        }

        // 2. Get Public URL
        const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        const publicUrl = publicUrlData.publicUrl;

        // 3. Insert into Database
        const { error: dbError } = await supabase
            .from(table)
            .insert([{ image_url: publicUrl }]);

        if (dbError) {
            console.error(`Error saving ${fileName} to DB:`, dbError.message);
        } else {
            console.log(`Successfully migrated ${fileName}`);
        }

        // Small delay to ensure created_at ordering
        await new Promise(r => setTimeout(r, 100));
    }
}

async function main() {
    await uploadImages('about', ABOUT_IMAGES);
    await uploadImages('vision', VISION_IMAGES);
    console.log('\nMigration complete!');
}

main();
