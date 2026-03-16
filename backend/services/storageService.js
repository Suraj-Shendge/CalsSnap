
import { supabase } from '../server.js';
import sharp from 'sharp';

/**
 * Upload an image buffer to Supabase Storage (bucket: food-images) after JPEG compression.
 * @param {string} path – e.g. `${userId}/${Date.now()}.jpg`
 * @param {Buffer} buffer – raw file data from Multer
 * @returns {{ publicUrl: string }}
 */
export async function uploadImage(path, buffer) {
  const compressed = await sharp(buffer).jpeg({ quality: 70 }).toBuffer();

  const { data, error } = await supabase.storage
    .from('food-images')
    .upload(path, compressed, {
      upsert: false,
      contentType: 'image/jpeg'
    });

  if (error) throw error;

  const { publicUrl } = supabase.storage.from('food-images').getPublicUrl(data.path);
  return { publicUrl };
}
