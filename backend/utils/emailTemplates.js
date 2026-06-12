// HTML email templates for different types of notifications

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .button { 
            display: inline-block; 
            padding: 10px 20px; 
            background-color: #4CAF50; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 20px 0; 
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Smile Bright Dental Clinic</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>This is an automated message from Smile Bright Dental Clinic.</p>
            <p>Please do not reply to this email. For any questions, please contact us through our website.</p>
        </div>
    </div>
</body>
</html>
`;

export const templates = {
    // Appointment Confirmation
    appointmentConfirmation: (appointment) => baseTemplate(`
        <h2>Appointment Confirmed!</h2>
        <p>Dear ${appointment.patientName},</p>
        <p>Your dental appointment has been confirmed with the following details:</p>
        <ul>
            <li><strong>Service:</strong> ${appointment.service}</li>
            <li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${appointment.time}</li>
        </ul>
        <p>Please arrive 10 minutes before your scheduled time.</p>
        <p>If you need to reschedule or cancel your appointment, please do so at least 24 hours in advance.</p>
        <a href="${process.env.FRONTEND_URL}/my-appointments" class="button">View My Appointments</a>
    `),

    // Appointment Cancellation
    appointmentCancellation: (appointment) => baseTemplate(`
        <h2>Appointment Cancelled</h2>
        <p>Dear ${appointment.patientName},</p>
        <p>Your dental appointment has been cancelled:</p>
        <ul>
            <li><strong>Service:</strong> ${appointment.service}</li>
            <li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${appointment.time}</li>
        </ul>
        <p>If you would like to schedule a new appointment, please visit our website.</p>
        <a href="${process.env.FRONTEND_URL}/booking" class="button">Book New Appointment</a>
    `),

    // Appointment Reminder
    appointmentReminder: (appointment) => baseTemplate(`
        <h2>Appointment Reminder</h2>
        <p>Dear ${appointment.patientName},</p>
        <p>This is a friendly reminder about your upcoming dental appointment:</p>
        <ul>
            <li><strong>Service:</strong> ${appointment.service}</li>
            <li><strong>Date:</strong> ${new Date(appointment.date).toLocaleDateString()}</li>
            <li><strong>Time:</strong> ${appointment.time}</li>
        </ul>
        <p>Please remember to:</p>
        <ul>
            <li>Arrive 10 minutes before your scheduled time</li>
            <li>Bring your ID and insurance information</li>
            <li>Wear a mask when entering the clinic</li>
        </ul>
        <p>If you need to reschedule or cancel, please do so as soon as possible.</p>
        <a href="${process.env.FRONTEND_URL}/my-appointments" class="button">View Appointment Details</a>
    `),

    // Message Reply
    messageReply: (appointment, replyBody) => baseTemplate(`
        <h2>Reply to Your Message</h2>
        <p>Dear ${appointment.patientName},</p>
        <p>You have received a reply regarding your message about ${appointment.service}:</p>
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
            ${replyBody}
        </div>
        <p>If you have any further questions, please reply to this email or contact us through our website.</p>
        <a href="${process.env.FRONTEND_URL}/contact" class="button">Contact Us</a>
    `)
}; 