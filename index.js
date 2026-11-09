const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

// ফ্রেঞ্চ ফন্ট লোড করার জন্য একটি ইউটিলিটি (Optional for Bangla if you have a .ttf file)
// সাধারণত Node.js এ টিএফএফ ফন্ট লোড করা যায়।

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    // 1. Template Image Load করা (Public folder থেকে)
    const templatePath = path.join(process.cwd(), 'public', 'template_front.jpg');
    
    // 2. New PDF Create করা
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // A4 Size
    
    // 3. Background Image Add করা (আপনার Original PDF এর ইমেজ)
    const jpgImageBytes = fs.readFileSync(templatePath);
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: 612,
      height: 792,
    });

    // 4. Text Add করা (নতুন তথ্য)
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // এখানে X এবং Y কординатস ঠিক করতে হবে। 
    // আপনি ইমেজ ওপেন করে দেখবেন কোন জায়গায় কোন নাম বসবে।
    
    const { name, nid, dob, fatherName, address } = req.body;

    // উদাহরণস্বরূপ:
    page.drawText(name || 'Unknown Name', {
      x: 100, // এই সংখ্যাগুলো ইমেজ অনুযায়ী ঠিক করুন
      y: 600,
      size: 12,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(nid || '00000000000000000', {
      x: 100,
      y: 580,
      size: 10,
      font: helveticaFont,
    });

    // PDF Bytes তৈরি করা
    const pdfBytes = await pdfDoc.save();

    // Response পাঠানো
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=nid_card.pdf');
    res.send(pdfBytes);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};
