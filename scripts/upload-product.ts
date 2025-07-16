#!/usr/bin/env tsx

import readline from 'readline';
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function uploadToCloudinary(imagePath: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error('Missing CLOUDINARY_CLOUD_NAME or CLOUDINARY_UPLOAD_PRESET in .env.local');
  }
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('upload_preset', uploadPreset);
  const response = await fetch(url, {
    method: 'POST',
    body: form as any,
  });
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('No secure_url returned from Cloudinary');
  }
  return data.secure_url;
}

async function main() {
  try {
    const name = await ask('Product name: ');
    const description = await ask('Description: ');
    const priceStr = await ask('Price: ');
    const price = Number(priceStr);
    if (isNaN(price)) throw new Error('Price must be a number');
    const category = await ask('Category: ');
    const sizesStr = await ask('Sizes (comma-separated): ');
    const sizes = sizesStr.split(',').map((s) => s.trim()).filter(Boolean);
    const imagePath = await ask('Path to local image file: ');
    if (!fs.existsSync(imagePath)) throw new Error('Image file does not exist');
    console.log('Uploading image to Cloudinary...');
    const imageUrl = await uploadToCloudinary(imagePath);
    console.log('Image uploaded:', imageUrl);
    const payload = {
      name,
      description,
      price,
      category,
      sizes,
      image: [imageUrl],
      variants: [],
    };
    const apiUrl = 'http://localhost:3000/api/products';
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API error: ${res.status} ${res.statusText}\n${err}`);
    }
    console.log('Product uploaded successfully!');
  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main(); 