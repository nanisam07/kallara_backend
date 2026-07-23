import nodemailer from "nodemailer";

export class NotificationService {
  /**
   * Send new Book Live Form Submission email
   */
  public static async sendIntakeSubmission(data: {
    fullName: string;
    country: string;
    city: string;
    timezone: string;
    whatsapp: string;
    language: string;
    categories: string[];
    bespokeRequest?: string;
    gender?: string;
    internationalSize?: string;
    measurements?: {
      bust?: string;
      waist?: string;
      shoulders?: string;
      height?: string;
    };
    colorPalette?: string;
    designStyle?: string;
    inspirationUrl?: string;
    deliveryDate?: string;
    budget: string;
    shippingNotes?: string;
    digitalSignature: string;
  }): Promise<void> {
    const categoriesText = data.categories && data.categories.length > 0
      ? data.categories.join("\n")
      : "None";

    const measurementsText = data.measurements
      ? `Bust:\n${data.measurements.bust || "N/A"}\n\nWaist:\n${data.measurements.waist || "N/A"}\n\nShoulders:\n${data.measurements.shoulders || "N/A"}\n\nHeight:\n${data.measurements.height || "N/A"}`
      : "Bust:\nN/A\n\nWaist:\nN/A\n\nShoulders:\nN/A\n\nHeight:\nN/A";

    const submittedDateStr = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
      dateStyle: "long",
      timeStyle: "short",
    });

    const emailBody = `New Book Live Form Submission

------------------------------------
PERSONAL INFORMATION
------------------------------------

Full Name:
${data.fullName}

Country:
${data.country}

City:
${data.city}

Timezone:
${data.timezone}

WhatsApp Number:
${data.whatsapp}

Preferred Language:
${data.language}

------------------------------------
SOURCING CATEGORIES
------------------------------------

${categoriesText}

Bespoke Request:
${data.bespokeRequest || "None"}

------------------------------------
APPAREL & MEASUREMENTS
------------------------------------

Gender:
${data.gender || "N/A"}

International Size:
${data.internationalSize || "N/A"}

${measurementsText}

------------------------------------
STYLE PREFERENCES
------------------------------------

Color Palette:
${data.colorPalette || "N/A"}

Design Philosophy:
${data.designStyle || "N/A"}

Inspiration URL:
${data.inspirationUrl || "None"}

------------------------------------
DELIVERY & BUDGET
------------------------------------

Preferred Delivery Date:
${data.deliveryDate || "N/A"}

Budget Tier:
${data.budget}

Shipping Notes:
${data.shippingNotes || "None"}

------------------------------------
AUTHORIZATION
------------------------------------

Consent:
Accepted

Digital Signature:
${data.digitalSignature}

Submitted At:
${submittedDateStr} (IST)
`;

    console.log("Formulating Book Live submission email...");
    console.log(emailBody);

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const smtpUser = process.env.SMTP_USER || "";
    const smtpPass = process.env.SMTP_PASS || "";
    const smtpFromEmail = process.env.SMTP_FROM_EMAIL || "kallaraservices@gmail.com";
    const smtpFromName = process.env.SMTP_FROM_NAME || "Kallara Global Concierge";

    // Fallback: If credentials are not configured, print to stdout only.
    if (!smtpUser || !smtpPass || smtpPass === "your_app_password_here" || smtpPass === "your_smtp_password_here") {
      console.log("[EMAIL NOTIFICATION] SMTP credentials not configured. Email logged to console.");
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions = {
      from: `"${smtpFromName}" <${smtpFromEmail}>`,
      to: "kallaraservices@gmail.com",
      subject: "🎉 New Book Live Form Submission",
      text: emailBody,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email successfully sent: ${info.messageId}`);
    } catch (err) {
      console.error("Failed to send email via SMTP transporter:", err);
      throw err;
    }
  }

  /**
   * Send booking confirmation notification
   */
  public static async sendBookingConfirmation(email: string, details: {
    bookingId: string;
    customerName: string;
    packageType: string;
    packagePrice: number;
    date: string;
    time: string;
  }): Promise<void> {
    console.log(`
=========================================
[EMAIL NOTIFICATION] - BOOKING CONFIRMED
To: ${email}
Subject: Kallara Sourcing Slot Secured - ID: ${details.bookingId}

Dear ${details.customerName},

Your ground concierge slot in India has been successfully booked!
Details:
- Package: ${details.packageType} ($${details.packagePrice})
- Date: ${details.date}
- Time: ${details.time}

Our team is already preparing to scout the markets for your upcoming session.
You will receive styling details and a meeting links within 24 hours.

Thank you,
The Kallara Global Concierge Team
=========================================
    `);
  }

  /**
   * Send meeting invitation link notification
   */
  public static async sendSessionMeetingLink(email: string, details: {
    bookingId: string;
    customerName: string;
    meetingLink: string;
    date: string;
    time: string;
    stylistName: string;
  }): Promise<void> {
    console.log(`
=========================================
[EMAIL NOTIFICATION] - SESSION SCHEDULED
To: ${email}
Subject: Your Live Sourcing Session is Scheduled! - ID: ${details.bookingId}

Dear ${details.customerName},

Your dedicated procurement specialist, ${details.stylistName}, has been assigned to your booking.
Your live video call details are as follows:
- Date: ${details.date}
- Time: ${details.time}
- Meeting Link: ${details.meetingLink}

Please make sure you have the styling draft finalized in your profile.

Thank you,
The Kallara Global Concierge Team
=========================================
    `);
  }

  /**
   * Send shipment dispatch / tracking notification
   */
  public static async sendShipmentTracking(email: string, details: {
    bookingId: string;
    customerName: string;
    courierName: string;
    trackingNumber: string;
  }): Promise<void> {
    console.log(`
=========================================
[EMAIL NOTIFICATION] - SHIPMENT SHIPPED
To: ${email}
Subject: Your consolidated Kallara package is on the way!

Dear ${details.customerName},

Good news! Sourced items from booking ${details.bookingId} have passed our 12-point quality check and volumetric packaging compression.
Your consignment has been handed over for international express delivery.
- Courier: ${details.courierName}
- Tracking Number: ${details.trackingNumber}

Track your shipment progress in your shipping courier website directly.

Thank you,
The Kallara Global Concierge Team
=========================================
    `);
  }
}
