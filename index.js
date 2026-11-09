const { PDFDocument, rgb, degrees } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    // 1. JPG Template Load করা
    const templatePath = path.join(process.cwd(), 'public', 'nid_template.jpg');
    
    // 2. New PDF Create করা (A4 Size)
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); 

    // 3. JPG Image Embed করা
    let jpgImage;
    try {
      const jpgImageBytes = fs.readFileSync(templatePath);
      jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
      
      // Image Fit to Page
      page.drawImage(jpgImage, {
        x: 0, 
        y: 0, 
        width: 612, 
        height: 792,
      });
    } catch (e) {
      console.warn("Template image not found.");
    }

    // 4. Bangla Font Load করা
    let font;
    try {
      const fontPath = path.join(process.cwd(), 'fonts', 'SolaimanLipi.ttf');
      const fontBytes = fs.readFileSync(fontPath);
      font = await pdfDoc.embedFont(fontBytes);
    } catch (err) {
      console.error("Font error:", err);
      // Fallback to standard font if custom font fails
      font = null; 
    }

    // 5. Data Extract করা
    const { name, nid, dob, fatherName, motherName, address, bloodGroup } = req.body;

    // 6. Text Drawing (Coordinates adjust your needs based on your JPG)
    // Note: Y=0 is bottom-left. You need to adjust these numbers based on your specific JPG layout.
    
    if (font) {
        // Example Coordinates - Adjust these!
        
        // Name
        page.drawText(name || 'নাম উল্লেখযোগ্য নয়', {
            x: 50, 
            y: 700,
            size: 18,
            font: font,
            color: rgb(0, 0, 0), // Black text
        });

        // NID Number
        page.drawText(nid || '000000000000', {
            x: 50,
            y: 650,
            size: 16,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Father's Name
        page.drawText(fatherName || 'পিতার নাম', {
            x: 50,
            y: 600,
            size: 14,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Mother's Name
        page.drawText(motherName || 'মাতার নাম', {
            x: 50,
            y: 570,
            size: 14,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Date of Birth
        page.drawText(dob || 'তারিখ', {
            x: 50,
            y: 540,
            size: 14,
            font: font,
            color: rgb(0, 0, 0),
        });

        // Address
        page.drawText(address || 'ঠিকানা', {
            x: 50,
            y: 500,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
        });
        
        // Blood Group
        page.drawText(bloodGroup || 'রক্তের গ্রুপ', {
            x: 50,
            y: 470,
            size: 14,
            font: font,
            color: rgb(0, 0, 0),
        });
    } else {
        // If font fails, show a warning in the PDF
        page.drawText("Bangla Font Missing", {
            x: 50,
            y: 700,
            size: 14,
            color: rgb(1, 0, 0),
        });
    }

    // 7. PDF Save and Send
    const pdfBytes = await pdfDoc.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=nid_card.pdf');
    res.send(pdfBytes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
  }
};
