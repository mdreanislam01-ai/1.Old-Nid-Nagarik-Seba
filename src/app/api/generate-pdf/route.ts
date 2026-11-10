import { NextResponse } from 'next/server';
import { PDFDocument } from 'pdf-lib';

// এই ফাংশনটি POST রিকোয়েস্ট হ্যান্ডেল করবে
export async function POST(request: Request) {
  try {
    // 1. ডেটা পড়া
    const body = await request.json();
    
    // 2. টেমপ্লেট ইমেজ URL (নিশ্চিত হোন এই ইমেজটি আপনার প্রজেক্টের public ফোল্ডারে আছে)
    // উদাহরণস্বরূপ: /nid_template.jpg
    const imageUrl = '/nid_template.jpg'; 

    console.log('Fetching template:', imageUrl);

    // 3. ইমেজ ডাউনলোড
    const imageResponse = await fetch(`https://sgeduufs.vercel.app${imageUrl}`);
    if (!imageResponse.ok) throw new Error(`Image fetch failed: ${imageResponse.statusText}`);
    
    const arrayBuffer = await imageResponse.arrayBuffer();
    
    // 4. PDF তৈরি
    const pdfDoc = await PDFDocument.create();
    const jpgImage = await pdfDoc.embedJpg(new Uint8Array(arrayBuffer));
    
    const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
    page.drawImage(jpgImage, {
      x: 0, y: 0, width: jpgImage.width, height: jpgImage.height,
    });

    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="certificate.pdf"',
      },
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error.message },
      { status: 500 }
    );
  }
}

// ⚠️ গুরুত্বপূর্ণ: Vercel-কে জানান যে এই রুটে POST মেথড সাপোর্ট করে
export const dynamic = 'force-dynamic';
export const revalidate = false;
