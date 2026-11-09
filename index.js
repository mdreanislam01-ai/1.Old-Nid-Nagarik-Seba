const { PDFDocument, rgb } = require('pdf-lib');
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
    let jpgImage;
    try {
        const jpgImageBytes = fs.readFileSync(templatePath);
        jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
        page.drawImage(jpgImage, { x: 0, y: 0, width: 612, height: 792 });
    } catch (e) {
        console.log("Template image not found, creating blank page.");
    }

    // 4. বাংলা ফন্ট লোড করা
    let font;
    try {
      const fontPath = path.join(process.cwd(), 'fonts', 'bangla_font.ttf');
      const fontBytes = fs.readFileSync(fontPath);
      font = await pdfDoc.embedFont(fontBytes);
    } catch (err) {
      console.warn("Bangla font missing, using default");
      font = null; // Fallback to default if needed, though pdf-lib needs a font object.
      // If font is null, you might need to embed a standard font or handle error.
      // For now, we assume the font file exists.
    }

    // 5. ডাটা নেওয়া
    const { name, nid, dob, fatherName, address } = req.body;

    // 6. টেক্সট আঁকা (Coordinates ঠিক করুন)
    // X এবং Y মানগুলো আপনার ইমেজ অনুযায়ী ঠিক করতে হবে।
    
    if (font) {
        page.drawText(name || 'নাম উল্লেখযোগ্য নয়', {
            x: 100, 
            y: 600,
            size: 14,
            font: font,
            color: rgb(0, 0, 0),
        });

        page.drawText(nid || '00000000000000000', {
            x: 100,
            y: 580,
            size: 12,
            font: font,
        });

        page.drawText(fatherName || 'পিতার নাম', {
            x: 100,
            y: 560,
            size: 12,
            font: font,
        });
        
        // Address Line
        page.drawText(address || 'ঠিকানা', {
            x: 100,
            y: 540,
            size: 12,
            font: font,
        });
    } else {
        // Fallback if font fails
        page.drawText("Font Error", { x: 100, y: 600, size: 14 });
    }

    // 7. PDF Bytes তৈরি করা
    const pdfBytes = await pdfDoc.save();

    // 8. Response পাঠানো
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
    res.send(pdfBytes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
};
