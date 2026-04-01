const nodemailer = require('nodemailer');
const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const generateTicketPDF = (bookingDetails, qrCodeDataURL) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // --- PDF Content ---

        // Header
        doc.fillColor('#ff3366').fontSize(26).font('Helvetica-Bold').text('MOVIE TICKET', { align: 'center' });
        doc.moveDown();
        doc.fillColor('#333333').fontSize(12).font('Helvetica').text('Thank you for booking with Movie-Booking!', { align: 'center' });
        doc.moveDown(2);

        // Movie Title
        doc.fillColor('#000000').fontSize(20).font('Helvetica-Bold').text(bookingDetails.movieName, { align: 'center' });
        doc.moveDown();

        // Details Box (Simulated with text positioning)
        doc.rect(50, 180, 495, 180).stroke('#e0e0e0');

        const startX = 70;
        let currentY = 200;
        const gap = 25;

        doc.fontSize(12).font('Helvetica');

        doc.text(`Booking ID:`, startX, currentY);
        doc.font('Helvetica-Bold').text(bookingDetails.transactionId, startX + 100, currentY);
        currentY += gap;

        doc.font('Helvetica').text(`Date:`, startX, currentY);
        doc.font('Helvetica-Bold').text(bookingDetails.showDate, startX + 100, currentY);
        currentY += gap;

        doc.font('Helvetica').text(`Time:`, startX, currentY);
        doc.font('Helvetica-Bold').text(bookingDetails.showTime, startX + 100, currentY);
        currentY += gap;

        doc.font('Helvetica').text(`Seats:`, startX, currentY);
        doc.font('Helvetica-Bold').text(bookingDetails.seats.join(', '), startX + 100, currentY);
        currentY += gap;

        doc.font('Helvetica').text(`Amount:`, startX, currentY);
        doc.fillColor('#ff3366').font('Helvetica-Bold').text(`Rs. ${bookingDetails.amount}`, startX + 100, currentY);

        // QR Code Image
        doc.image(qrCodeDataURL, 220, 400, { width: 150, height: 150 });

        doc.fillColor('#777777').fontSize(10).font('Helvetica-Oblique').text('Scan this QR code at the entrance.', 50, 560, { align: 'center' });

        // Footer
        doc.fontSize(10).text('Enjoy the show!', 50, 700, { align: 'center' });

        doc.end();
    });
};

const sendTicketEmail = async (toEmail, bookingDetails) => {
    try {
        const { movieName, showDate, showTime, seats, amount, transactionId, user } = bookingDetails;
        const ticketId = transactionId || Date.now().toString();

        // Generate QR Code
        const qrCodeDataURL = await QRCode.toDataURL(ticketId);

        // Generate PDF
        const pdfBuffer = await generateTicketPDF(bookingDetails, qrCodeDataURL);

        const mailOptions = {
            from: `"Angel CineWorld" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Your Ticket for ${movieName} - Movie-Booking`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #ff3366; padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0;">Ticket Confirmed!</h1>
                        <p>Get ready for the show!</p>
                    </div>
                    
                    <div style="padding: 20px; background-color: #f9f9f9;">
                        <p>Hi <strong>${user}</strong>,</p>
                        <p>Your booking for <strong>${movieName}</strong> has been confirmed.</p>
                        <p>Please find your ticket attached as a PDF.</p>
                        
                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #ff3366;">
                            <p><strong>Booking ID:</strong> ${ticketId}</p>
                            <p><strong>Seats:</strong> ${seats.join(', ')}</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                             <img src="${qrCodeDataURL}" alt="Ticket QR Code" style="width: 150px; height: 150px;" />
                        </div>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `Ticket-${movieName}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Ticket Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending ticket email:', error);
        return false;
    }
};

const sendCancellationEmail = async (toEmail, bookingDetails) => {
    try {
        const { movieName, showDate, showTime, seats, amount, refundAmount, reason, user } = bookingDetails;

        const mailOptions = {
            from: `"Angel CineWorld" <${process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: `Booking Cancelled - ${movieName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
                    <div style="background-color: #333; padding: 20px; text-align: center; color: white;">
                        <h1 style="margin: 0;">Booking Cancelled</h1>
                    </div>
                    
                    <div style="padding: 20px; background-color: #fff;">
                        <p>Hi <strong>${user}</strong>,</p>
                        <p>As requested, your booking for <strong>${movieName}</strong> has been cancelled.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Date:</strong> ${showDate}</p>
                            <p><strong>Seats:</strong> ${seats.join(', ')}</p>
                            <p><strong>Reason:</strong> ${reason || 'User Request'}</p>
                            <hr style="border: 0; border-top: 1px solid #ddd;" />
                            <p><strong>Refund Amount:</strong> Rs. ${refundAmount} (Will be processed within 5-7 days)</p>
                        </div>

                        <p style="color: #777; font-size: 12px;">We hope to see you back at the movies soon!</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Cancellation Email sent:', info.response);
        return true;
    } catch (error) {
        console.error('Error sending cancellation email:', error);
        return false;
    }
};

module.exports = { sendTicketEmail, sendCancellationEmail };
