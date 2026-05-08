const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { Certificate } = require('../models/Others');
const Intern = require('../models/Intern');
const cloudinary = require('../config/cloudinary');
const emailService = require('../services/emailService');
const { Readable } = require('stream');

const uploadPDFToCloudinary = (buffer, publicId) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    { resource_type: 'raw', public_id: publicId, folder: 'certificates' },
    (err, result) => err ? reject(err) : resolve(result)
  );
  Readable.from(buffer).pipe(stream);
});

exports.generateCertificate = async (req, res) => {
  try {
    const { internId, type = 'completion' } = req.body;
    const intern = await Intern.findById(internId).populate('user', 'name email');
    if (!intern) return res.status(404).json({ success: false, message: 'Intern not found' });

    const certId = 'CERT-' + uuidv4().split('-')[0].toUpperCase();
    const verifyUrl = `${process.env.CLIENT_URL}/verify/${certId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl);
    const qrBase64 = qrDataUrl.replace('data:image/png;base64,', '');

    // Generate PDF
    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 50 });
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    await new Promise((resolve) => {
      doc.on('end', resolve);

      // Background
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#0f172a');
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke('#3b82f6').lineWidth(3);
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60).stroke('#1e40af').lineWidth(1);

      // Header
      doc.fillColor('#3b82f6').fontSize(14).font('Helvetica-Bold')
        .text('INTERNSHIP LEARNING MANAGEMENT SYSTEM', 0, 60, { align: 'center' });
      doc.fillColor('#94a3b8').fontSize(10).font('Helvetica')
        .text('IT Company — Official Document', 0, 80, { align: 'center' });

      // Title
      const title = type === 'completion' ? 'Certificate of Completion' : 'Experience Letter';
      doc.fillColor('#ffffff').fontSize(36).font('Helvetica-Bold')
        .text(title, 0, 120, { align: 'center' });
      doc.moveTo(200, 168).lineTo(doc.page.width - 200, 168).stroke('#3b82f6').lineWidth(2);

      // Body
      doc.fillColor('#94a3b8').fontSize(14).font('Helvetica')
        .text('This is to certify that', 0, 185, { align: 'center' });
      doc.fillColor('#3b82f6').fontSize(28).font('Helvetica-Bold')
        .text(intern.user.name, 0, 205, { align: 'center' });
      doc.fillColor('#94a3b8').fontSize(12).font('Helvetica')
        .text(`(Intern ID: ${intern.internId})`, 0, 240, { align: 'center' });

      const body = type === 'completion'
        ? `has successfully completed the internship program in ${intern.department} department\nfrom ${intern.internshipStart.toDateString()} to ${intern.internshipEnd.toDateString()}.`
        : `worked as an intern in the ${intern.department} department\nfor the duration of ${intern.internshipDuration}.`;
      doc.fillColor('#e2e8f0').fontSize(13).font('Helvetica').text(body, 80, 265, { align: 'center', width: doc.page.width - 160 });

      // Footer info
      doc.fillColor('#64748b').fontSize(10)
        .text(`Certificate ID: ${certId}`, 60, 360)
        .text(`Issue Date: ${new Date().toDateString()}`, 60, 375)
        .text(`Verify at: ${verifyUrl}`, 60, 390);

      // QR
      const qrBuf = Buffer.from(qrBase64, 'base64');
      doc.image(qrBuf, doc.page.width - 130, 340, { width: 80, height: 80 });

      doc.end();
    });

    const pdfBuffer = Buffer.concat(buffers);
    const uploadResult = await uploadPDFToCloudinary(pdfBuffer, `cert_${certId}`);

    const certificate = await Certificate.create({
      intern: intern._id, type, certificateId: certId,
      pdfUrl: uploadResult.secure_url, pdfPublicId: uploadResult.public_id,
      qrCode: qrDataUrl, generatedBy: req.user._id
    });

    intern.certificateGenerated = true;
    await intern.save();

    await emailService.sendCertificateEmail(intern.user.email, intern.user.name, uploadResult.secure_url, type);

    res.json({ success: true, data: certificate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ certificateId: req.params.id })
      .populate({ path: 'intern', populate: { path: 'user', select: 'name email' } });
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
    res.json({ success: true, data: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const intern = await Intern.findOne({ user: req.user._id });
    const certs = await Certificate.find({ intern: intern._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
