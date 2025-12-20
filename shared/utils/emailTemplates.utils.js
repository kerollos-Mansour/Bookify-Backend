exports.forgotPasswordTemplate = (resetLink) => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        .logo { height: 40px; width: auto; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 20px; }
        .button-container { text-align: center; margin: 30px 0; }
        .button { display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; }
        .footer { background-color: #0F172A; padding: 30px; text-align: center; color: #9CA3AF; font-size: 12px; }
        .footer-links { margin-bottom: 10px; }
        .footer-link { color: #9CA3AF; text-decoration: none; margin: 0 8px; }
        .footer-link:hover { color: #ffffff; }
        .social-icon { display: inline-block; margin: 0 8px; width: 24px; height: 24px; }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://res.cloudinary.com/diftkhbq5/image/upload/v1766224001/bookify/xhpqapkgewozwf1csgwk.png" alt="Bookify Logo" class="logo">
            </div>
            <!-- Content -->
            <div class="content">
                <h1 class="h1">Reset Your Password</h1>
                <p>Hello,</p>
                <p>We received a request to reset the password for your Bookify account. If you didn't make this request, you can safely ignore this email.</p>
                
                <div class="button-container">
                    <a href="{{reset_link}}" class="button">Reset Password</a>
                </div>
                <p>This link will expire in 24 hours for your security.</p>
                <p>Best regards,<br>The Bookify Team</p>
            </div>
            <!-- Footer -->
            <div class="footer">
                <div class="footer-links">
                    <a href="#" class="footer-link">Privacy Policy</a> • 
                    <a href="#" class="footer-link">Contact Support</a>
                </div>
                <p>123 Travel Street, Cairo, Egypt</p>
                <p>&copy; 2025 Bookify. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
`
}

exports.confirmReservationTemplate = (data) => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmed</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #2563EB; padding: 40px 30px; text-align: center; color: #ffffff; }
        .logo { height: 40px; width: auto; filter: brightness(0) invert(1); } /* Makes logo white for blue bg */
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .h1 { font-size: 24px; font-weight: 700; color: #ffffff; margin: 0; }
        .booking-details { background-color: #F3F4F6; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #E5E7EB; padding-bottom: 10px; }
        .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .detail-label { font-weight: 600; color: #4B5563; }
        .detail-value { color: #111827; }
        .button { display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; text-align: center; display: block; margin-top: 20px; }
        .footer { background-color: #0F172A; padding: 30px; text-align: center; color: #9CA3AF; font-size: 12px; }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://res.cloudinary.com/diftkhbq5/image/upload/v1766224001/bookify/xhpqapkgewozwf1csgwk.png" alt="Bookify Logo" class="logo">
                <h1 class="h1" style="margin-top: 20px;">Booking Confirmed!</h1>
                <p style="margin-top: 10px; opacity: 0.9;">You're all set for your trip.</p>
            </div>
            <!-- Content -->
            <div class="content">
                <p>Hi {{user_name}},</p>
                <p>Great news! Your reservation at <strong>{{hotel_name}}</strong> has been confirmed.</p>
                
                <div class="booking-details">
                    <div class="detail-row">
                        <span class="detail-label">Check-in</span>
                        <span class="detail-value">{{check_in_date}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-out</span>
                        <span class="detail-value">{{check_out_date}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Guests</span>
                        <span class="detail-value">{{guest_count}}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Total Price</span>
                        <span class="detail-value" style="font-weight: 700; color: #2563EB;">{{total_price}}</span>
                    </div>
                </div>
                <p>We've attached your receipt to this email.</p>
                
                <a href="{{booking_link}}" class="button">View Booking Details</a>
            </div>
            <!-- Footer -->
            <div class="footer">
                <p>Need help? Contact us at support@bookify.com</p>
                <p>123 Travel Street, Cairo, Egypt</p>
                <p>&copy; 2025 Bookify. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `
}

exports.welcomeTemplate = (userName, exploreLink) => {
    return `
    <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Bookify</title>
    <style>
        body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 1px solid #e5e7eb; }
        .logo { height: 40px; width: auto; }
        .hero { background-color: #EFF6FF; padding: 40px 30px; text-align: center; }
        .hero-title { color: #1E40AF; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
        .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
        .button { display: inline-block; background-color: #2563EB; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: 600; font-size: 16px; margin-top: 10px; }
        .footer { background-color: #0F172A; padding: 30px; text-align: center; color: #9CA3AF; font-size: 12px; }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <img src="https://res.cloudinary.com/diftkhbq5/image/upload/v1766224001/bookify/xhpqapkgewozwf1csgwk.png" alt="Bookify Logo" class="logo">
            </div>
            <!-- Hero Section -->
            <div class="hero">
                <h1 class="hero-title">Welcome to Bookify! 🌍</h1>
                <p>Your journey to the world's best stays starts here.</p>
            </div>
            <!-- Content -->
            <div class="content">
                <p>Hi {{user_name}},</p>
                <p>We're thrilled to have you on board. At Bookify, we make it easy to find and book unique accommodations around the globe, from cozy apartments to luxury hotels.</p>
                
                <h3>What you can do next:</h3>
                <ul>
                    <li>Browse thousands of properties</li>
                    <li>Save your favorites to your wishlist</li>
                    <li>Get exclusive deals and offers</li>
                </ul>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="{{explore_link}}" class="button">Start Exploring</a>
                </div>
            </div>
            <!-- Footer -->
            <div class="footer">
                <p>Follow us for travel inspiration:</p>
                <div style="margin-bottom: 20px;">
                    <a href="#" style="color: white; margin: 0 5px; text-decoration: none;">Facebook</a>
                    <a href="#" style="color: white; margin: 0 5px; text-decoration: none;">Instagram</a>
                    <a href="#" style="color: white; margin: 0 5px; text-decoration: none;">Twitter</a>
                </div>
                <p>123 Travel Street, Cairo, Egypt</p>
                <p>&copy; 2025 Bookify. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>

    `
}