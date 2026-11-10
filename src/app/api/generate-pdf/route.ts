import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// GET মেথডও এক্সপোর্ট করুন যাতে ডিরেক্ট URL চেক করা যায়
export async function GET() {
  return new Response("API is working", { status: 200 });
}

export async function POST(request: Request) {
  try {
    // 1. ডেটা পাarsing
    const body = await request.json();
    
    // 2. টেমপ্লেট ইমেজ URL (নিশ্চিত হোন public/folder/image.jpg নামে ইমেজটি আছে)
    // উদাহরণ: /nid_template.jpg
    const templateUrl = '/nid_template.jpg'; 
    
    console.log('Starting PDF generation...');

    // 3. টেমপ্লেট ইমেজ ডাউনলোড
    let imgBytes;
    try {
      const res = await fetch(`https://sgeduufs.vercel.app${templateUrl}`);
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
      imgBytes = await res.arrayBuffer();
    } catch (e: any) {
      return NextResponse.json({ error: 'Template image not found', details: e.message }, { status: 404 });
    }

    // 4. PDF ডকুমেন্ট তৈরি
    const pdfDoc = await PDFDocument.create();
    
    // ইমেজ ইমবেড করা (JPG বা PNG)
    let embeddedImg;
    try {
      embeddedImg = await pdfDoc.embedPng(imgBytes); // যদি PNG হয়
      // অথবা embedJpg(imgBytes) যদি JPG হয়
    } catch (e: any) {
       return NextResponse.json({ error: 'Image format error', details: e.message }, { status: 500 });
    }

    // পেজ যোগ করা
    const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
    page.drawImage(embeddedImg, {
      x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height,
    });

    // 5. টেক্সট যোগ করা (Optional - যদি টেমপ্লেটে খালি জায়গা থাকে)
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    page.drawText(body.nameEnglish || 'Name', {
      x: 50, y: 500, size: 12, font: timesRomanFont, color: rgb(0, 0, 0),
    });

    // 6. PDF সেভ করা
    const pdfBytes = await pdfDoc.save();

    // 7. রেসপন্স ফেরত দেওয়া
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="certificate.pdf"',
      },
    });

  } catch (error: any) {
    console.error('Full Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}

// Vercel-এর জন্য Dynamic Route সেটিংস
export const dynamic = 'force-dynamic';
export const revalidate = 0;
