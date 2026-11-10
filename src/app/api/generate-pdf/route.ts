import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts } from 'pdf-lib';

// এই ফাংশনটি POST রিকোয়েস্ট হ্যান্ডল করবে
export async function POST(request: Request) {
  try {
    // ১. ডেটা পাঠানো হয়েছে কিনা চেক করা
    const body = await request.json();
    
    if (!body.nameEnglish) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // ২. PDF ডকুমেন্ট তৈরি করা
    const pdfDoc = await PDFDocument.create();
    
    // A4 সাইজের পেজ যোগ করা
    const page = pdfDoc.addPage([595, 842]); // A4 size in points
    
    // টেক্সট ফন্ট লোড করা
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // ৩. টেক্সট বসানো (উদাহরণ হিসেবে)
    // X এবং Y কোঅর্ডিনেট আপনার টেমপ্লেট অনুযায়ী ঠিক করতে হবে
    page.drawText('Death Certificate', {
      x: 200,
      y: 750,
      size: 20,
      font: helveticaFont,
    });

    page.drawText(`Name: ${body.nameEnglish}`, {
      x: 50,
      y: 700,
      size: 12,
      font: helveticaFont,
    });

    // ৪. PDF সেভ করা
    const pdfBytes = await pdfDoc.save();

    // ৫. PDF ডাউনলোডের জন্য রেসপন্স দেওয়া
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="certificate.pdf"',
      },
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET রিকোয়েস্ট (টেস্ট করার জন্য)
export async function GET() {
  return new Response("API is working! Send a POST request to generate PDF.", { status: 200 });
}

// স্ট্যাটিক জেনারেশন বন্ধ করা
export const dynamic = 'force-dynamic';
export const revalidate = 0;
