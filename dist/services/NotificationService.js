"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
class NotificationService {
    /**
     * Send booking confirmation notification
     */
    static async sendBookingConfirmation(email, details) {
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
    static async sendSessionMeetingLink(email, details) {
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
    static async sendShipmentTracking(email, details) {
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
exports.NotificationService = NotificationService;
