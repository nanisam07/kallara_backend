export class NotificationService {
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
