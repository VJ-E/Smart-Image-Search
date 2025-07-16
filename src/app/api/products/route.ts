import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/libs/mongodb';
import { Product } from '@/models/Products';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, description, price, category, sizes, image, variants } = body;
    if (!name || !description || !price || !category || !sizes || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const product = new Product({
      name,
      description,
      price,
      category,
      sizes,
      image,
      variants: variants || [],
    });
    const saved = await product.save();
    return NextResponse.json(saved, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
} 