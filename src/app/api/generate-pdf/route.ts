import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// POST রিকোয়েস্ট হ্যান্ডল করার ফাংশন
export async function POST(request: Request) {
  try {
    // ১. JSON ডেটা পাঠ করা
    const body = await request.json();
    
    // ২. টেমপ্লেট ইমেজ লোড করা
    // /public/folder থেকে ইমেজ ফেচ করা হচ্ছে
    const templateUrl = '/nid_template.jpg'; 
    
    let imgBytes;
    try {
      const res = await fetch(`https://sgeduufs.vercel.app${templateUrl}`);
      if (!res.ok) throw new Error(`Image fetch failed: ${res.status} ${res.statusText}`);
      imgBytes = await res.arrayBuffer();
    } catch (e: any) {
      return NextResponse.json({ error: 'Template image not found', details: e.message }, { status: 404 });
    }

    // ৩. PDF ডকুমেন্ট তৈরি
    const pdfDoc = await PDFDocument.create();
    
    // ইমেজ এমবেড করা
    let embeddedImg;
    try {
      embeddedImg = await pdfDoc.embedJpg(imgBytes);
    } catch (e: any) {
       return NextResponse.json({ error: 'Image format error', details: e.message }, { status: 500 });
    }

    // ৪. পেজ যোগ করা (ইমেজ সাইজ অনুযায়ী)
    const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
    page.drawImage(embeddedImg, {
      x: 0, y: 0, width: embeddedImg.width, height: embeddedImg.height,
    });

    // ৫. টেক্সট যোগ করা (টেমপ্লেটের খালি জায়গায়)
    // নোট: X এবং Y কোঅর্ডিনেট আপনার টেমপ্লেট অনুযায়ী ঠিক করতে হবে
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    // উদাহরণ: নাম প্রিন্ট করা
    page.drawText(body.nameEnglish || 'Name Not Provided', {
      x: 50, 
      y: 500, // এই Y মানটি আপনার টেমপ্লেটের সাথে মিলিয়ে পরিবর্তন করুন
      size: 12, 
      font: timesRomanFont, 
      color: rgb(0, 0, 0),
    });

    // ৬. PDF সেভ করা
    const pdfBytes = await pdfDoc.save();

    // ৭. PDF রেসপন্স হিসেবে ফেরত দেওয়া
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

// GET রিকোয়েস্ট (টেস্ট করার জন্য)
export async function GET() {
  return new Response("API is working", { status: 200 });
}

// স্ট্যাটিক জেনারেশন বন্ধ করা
export const dynamic = 'force-dynamic';
export const revalidate = 0;
