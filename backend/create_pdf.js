const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument();
doc.pipe(fs.createWriteStream('test_resume.pdf'));

doc.fontSize(25).text('Candidate Resume', 100, 100);
doc.fontSize(15).text('John Doe', 100, 150);
doc.fontSize(12).text('Skills: JavaScript, Node.js, React, Tailwind, Python, AWS', 100, 200);
doc.fontSize(12).text('Education: B.Tech Computer Science', 100, 250);
doc.fontSize(12).text('Passout Year: 2024', 100, 300);
doc.fontSize(12).text('CGPA: 8.75', 100, 350);

doc.end();
console.log("PDF created successfully as test_resume.pdf");
