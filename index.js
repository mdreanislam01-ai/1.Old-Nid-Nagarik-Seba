import { PDFDocument } from 'pdf-lib';

export async function POST(req) {
  // 1. ডেটা পড়া
  const body = await req.json();
  
  // 2. টেমপ্লেট ইমেজ URL (Vercel Raw URL)
  // নিশ্চিত হোন এই ফাইলটি আপনার Vercel ডোমেইনে আপলোড করা আছে
  const imageUrl = 'https://sgeduufs.vercel.app/nid_template.jpg'; 

  try {
    console.log('Fetching template from:', imageUrl);

    // 3. ইমেজ ডাউনলোড করা
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    
    // 4. PDF ডকুমেন্ট তৈরি
    const pdfDoc = await PDFDocument.create();
    
    // 5. ইমেজ এমবেড করা (JPG হিসেবে)
    const jpgImage = await pdfDoc.embedJpg(new Uint8Array(arrayBuffer));
    
    // 6. পেজ যোগ করা এবং ইমেজ বসানো
    const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: jpgImage.width,
      height: jpgImage.height,
    });

    // 7. PDF সেভ করা
    const pdfBytes = await pdfDoc.save();

    // 8. রেসপন্স পাঠানো
    return new Response(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="certificate.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
