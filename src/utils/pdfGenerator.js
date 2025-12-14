import jsPDF from 'jspdf';
import { FileText } from 'lucide-react';

// Helper: Convert URL to Base64 Image
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/jpeg');
      resolve(dataURL);
    };

    img.onerror = () => {
      // Return null or a placeholder if image fails (CORS or 404)
      resolve(null); 
    };

    img.src = url;
  });
};

// Main PDF Generation Function
export const generateSurveyPDF = async (surveys) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title
  doc.setFontSize(18);
  doc.setTextColor(109, 40, 217); // Violet color
  doc.text('Survey Data Report', 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 26);
  doc.line(14, 30, pageWidth - 14, 30);

  let yPos = 40; // Starting Y position

  // Loop through selected surveys
  for (let i = 0; i < surveys.length; i++) {
    const item = surveys[i];

    // Check if we need a new page (Card height is approx 65mm)
    if (yPos + 65 > 280) {
      doc.addPage();
      yPos = 20;
    }

    // --- PRELOAD IMAGES ---
    // We fetch all 3 images in parallel before drawing the card
    const [citizenImg, otImg, zcImg] = await Promise.all([
      getBase64ImageFromURL(item.citizen_image),
      getBase64ImageFromURL(item.otProfile),
      getBase64ImageFromURL(item.zcProfile || item.ot_parent_profile)
    ]);

    // --- DRAW CARD BACKGROUND ---
    doc.setDrawColor(220, 220, 220); // Light gray border
    doc.setFillColor(249, 250, 251); // Very light gray bg
    doc.roundedRect(14, yPos, pageWidth - 28, 60, 3, 3, 'FD');

    // --- COLUMN 1: CITIZEN INFO (Left) ---
    // Image
    if (citizenImg) {
      try {
        doc.addImage(citizenImg, 'JPEG', 20, yPos + 10, 30, 30); // x, y, w, h
      } catch (e) { console.warn('Img err', e); }
    } else {
        // Placeholder box if no image
        doc.rect(20, yPos + 10, 30, 30); 
        doc.setFontSize(8);
        doc.text("No Image", 25, yPos + 25);
    }

    // Text Details
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(item.name || "Unknown Citizen", 55, yPos + 15);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80);
    doc.text(`Mobile: ${item.mobile || 'N/A'}`, 55, yPos + 22);
    doc.text(`Date: ${item.date}`, 55, yPos + 28);
    
    // Zone/Location (Wrapped text)
    const splitZone = doc.splitTextToSize(`Zone: ${item.zoneName || 'N/A'}`, 60);
    doc.text(splitZone, 55, yPos + 34);


    // --- VERTICAL DIVIDER ---
    doc.setDrawColor(200);
    doc.line(120, yPos + 5, 120, yPos + 55);


    // --- COLUMN 2: TEAM INFO (Right) ---
    
    // -- Operator (OT) --
    doc.setFontSize(8);
    doc.setTextColor(124, 58, 237); // Violet Text
    doc.setFont("helvetica", "bold");
    doc.text("FIELD OPERATOR (OT)", 125, yPos + 12);
    
    // OT Image
    if (otImg) {
        doc.addImage(otImg, 'JPEG', 125, yPos + 15, 12, 12);
    } else {
        doc.rect(125, yPos + 15, 12, 12);
    }
    
    // OT Details
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text(item.otName || 'N/A', 140, yPos + 20);
    doc.setFont("helvetica", "normal");
    doc.text(item.otMobile || '', 140, yPos + 25);


    // -- Coordinator (ZC) --
    doc.setTextColor(124, 58, 237); // Violet Text
    doc.setFont("helvetica", "bold");
    doc.text("ZONAL COORDINATOR (ZC)", 125, yPos + 38);

    // ZC Image
    if (zcImg) {
        doc.addImage(zcImg, 'JPEG', 125, yPos + 41, 12, 12);
    } else {
        doc.rect(125, yPos + 41, 12, 12);
    }

    // ZC Details
    doc.setTextColor(60);
    doc.setFont("helvetica", "bold");
    doc.text(item.zcName || item.ot_parent_name || 'N/A', 140, yPos + 46);
    doc.setFont("helvetica", "normal");
    doc.text(item.zcMobile || item.ot_parent_mobile || '', 140, yPos + 51);

    // Increment Y position for next card
    yPos += 70;
  }

  // Save the PDF
  doc.save(`survey_report_${new Date().toISOString().slice(0,10)}.pdf`);
};