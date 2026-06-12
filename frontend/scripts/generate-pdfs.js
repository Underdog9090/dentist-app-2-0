const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF(htmlFile, outputFile) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Read the HTML file
  const html = fs.readFileSync(htmlFile, 'utf8');
  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });

  // Generate PDF
  await page.pdf({
    path: outputFile,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });

  await browser.close();
  console.log(`Generated PDF: ${outputFile}`);
}

async function main() {
  const resources = [
    // Forms
    { dir: '../public/resources/forms', files: ['registration.html', 'medical-history.html', 'insurance.html'] },
    // Care
    { dir: '../public/resources/care', files: ['daily-guide.html', 'children.html', 'seniors.html'] },
    // FAQ
    { dir: '../public/resources/faq', files: ['general.html', 'treatments.html', 'insurance.html'] },
    // Emergency
    { dir: '../public/resources/emergency', files: ['contact.html', 'common.html', 'after-hours.html'] },
    // Insurance info
    { dir: '../public/resources/insurance', files: ['accepted-plans.html', 'payment-plans.html', 'financing.html'] },
  ];

  for (const section of resources) {
    for (const file of section.files) {
      const htmlFile = path.join(__dirname, section.dir, file);
      const outputFile = path.join(__dirname, section.dir, file.replace('.html', '.pdf'));
      await generatePDF(htmlFile, outputFile);
    }
  }
}

main().catch(console.error); 