const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    // 1. Template Image Load করা
    const templatePath = path.join(process.cwd(), 'public', 'template_front.jpg');
    
    // 2. New PDF Create করা
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // A4 Size
    
    // 3. Background Image Add করা
    const jpgImageBytes = fs.readFileSync(templatePath);
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    page.drawImage(jpgImage, {
      x: 0, y: 0, width: 612, height: 792,
    });

    // 4. বাংলা ফন্ট লোড করা (এখানেই মূল কাজ)
    let font;
    try {
      // fonts/bangla_font.ttf পাথ চেক করা হচ্ছে
      const fontPath = path.join(process.cwd(), 'fonts', 'bangla_font.ttf');
      const fontBytes = fs.readFileSync(fontPath);
      font = await pdfDoc.embedFont(fontBytes);
      console.log("Bangla font loaded successfully");
    } catch (err) {
      console.error("Font not found, using default Helvetica");
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    // 5. টেক্সট ডাটা নেওয়া
    const { name, nid, dob, fatherName, address } = req.body;

    // 6. টেক্সট আঁকা (Coordinates ঠিক করুন)
    // X এবং Y মানগুলো আপনার ইমেজ অনুযায়ী ঠিক করতে হবে।
    // সাধারণত: X বাম দিক থেকে, Y উপর থেকে নিচের দিকে (0 from bottom)।
    
    page.drawText(name || 'নাম উল্লেখযোগ্য নয়', {
      x: 100, 
      y: 600,
      size: 14,
      font: font, // বাংলা ফন্ট ব্যবহার করা হলো
      color: rgb(0, 0, 0),
    });

    page.drawText(nid || '00000000000000000', {
      x: 100,
      y: 580,
      size: 12,
      font: font,
    });

    // অন্যান্য ফিল্ড...
    page.drawText(fatherName || 'পিতার নাম', {
      x: 100,
      y: 560,
      size: 12,
      font: font,
    });

    // PDF Bytes তৈরি করা
    const pdfBytes = await pdfDoc.save();

    // Response পাঠানো
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=nid_card.pdf');
    res.send(pdfBytes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
};
