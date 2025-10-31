require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { createClient } = require('@supabase/supabase-js'); // Import Supabase client

const app = express();

// Middleware to use raw body for webhook verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));


// Configure CORS for your frontend URLs
app.use(cors({
  origin: [
    'http://localhost:8080', // Keep for local development
    'https://ted-x-auc.vercel.app', // Your Vercel deployment
    'https://www.tedxamity.com', // Your custom domain
    'https://tedxamity.com'      // Your custom domain without www
    // Add any other origins if necessary
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'] // Only allow Content-Type
}));

const PORT = process.env.PORT || 3001; // Use environment port or default
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const EMAIL_WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET; // Email function secret

// Basic validation for environment variables
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET || !RAZORPAY_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !EMAIL_WEBHOOK_SECRET) {
  console.error("❌ Critical environment variables are missing! Check RAZORPAY keys, SUPABASE_URL, SUPABASE_SERVICE_KEY, EMAIL_WEBHOOK_SECRET.");
  process.exit(1); // Exit if keys are missing
}

// Initialize Razorpay client
const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

// Initialize Supabase client for backend operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// --- Endpoint to Create Razorpay Order ---
app.post('/api/payment/create-order', async (req, res) => {
  const { amount, currency = 'INR', notes } = req.body;

  // Validate required fields
  if (typeof amount !== 'number' || !notes || typeof notes !== 'object') {
    console.error("Validation Error: Amount (number) and notes (object) are required.", { amount, notes });
    return res.status(400).json({ success: false, message: 'Amount (must be a number) and notes (must be an object) are required' });
  }

  // Validate specific notes fields for booking
  if (notes.type === 'booking' && (!notes.event_title || !notes.customer_email || !notes.selected_seats)) {
     console.error("Validation Error: Missing required booking notes.", notes);
     return res.status(400).json({ success: false, message: 'Missing required booking details in notes (event_title, customer_email, selected_seats)' });
  }

  // Ensure amount is at least 1 INR (Razorpay minimum is 100 paise)
  const amountInPaise = Math.round(amount * 100); // Ensure it's an integer
  if (amountInPaise < 100) {
    console.warn("Validation Warning: Amount less than ₹1 attempted.", { amount });
    return res.status(400).json({ success: false, message: 'Minimum amount is ₹1.00' });
  }

  const options = {
    amount: amountInPaise, // Amount in paise
    currency: currency,
    receipt: `receipt_${notes.type || 'generic'}_${Date.now()}`, // More descriptive receipt
    notes: notes // Pass all the booking/donation details here
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log("✅ Razorpay Order Created:", { id: order.id, amount: order.amount, receipt: order.receipt });
    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount, // Amount in paise
      currency: order.currency,
      key_id: RAZORPAY_KEY_ID // Send key_id to frontend
    });
  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error.message || error);
    res.status(500).json({
      success: false,
      message: 'Error creating Razorpay order',
      error: error.message || 'Unknown error'
    });
  }
});

// --- Endpoint to Handle Razorpay Webhooks ---
 app.post('/api/payment/verify', async (req, res) => {
  const secret = RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  // Use the raw body saved by the middleware for verification
  const rawBody = req.rawBody;

  console.log("ℹ️ Webhook received...");

  // 1. Verify webhook signature
  try {
     const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody) // Use the raw body string
        .digest('hex');

     if (expectedSignature !== signature) {
       console.warn("⚠️ Webhook signature mismatch!");
       // Don't reveal signature failure details to potential attackers
       return res.status(400).json({ success: false, message: 'Invalid request signature' });
     }
     console.log("✅ Webhook signature verified.");

  } catch (error) {
     console.error("❌ Error verifying webhook signature:", error);
     return res.status(500).json({ success: false, message: 'Webhook signature verification failed'});
  }

  const body = req.body; // Now use the parsed body

  // 2. Process the event (interested in order.paid)
  // Using order.paid is generally more reliable as it confirms the order status
  if (body.event === 'order.paid') {
     const orderEntity = body.payload.order.entity;
     const paymentEntity = body.payload.payment.entity; // Payment details are included here

     if (!orderEntity || !paymentEntity) {
         console.error("❌ Webhook Error: Order or Payment entity missing in order.paid event.");
         return res.status(400).json({ success: false, message: 'Order or Payment entity missing' });
     }

     const razorpay_payment_id = paymentEntity.id;
     const razorpay_order_id = orderEntity.id;
     const bookingNotes = orderEntity.notes; // Notes are reliably on the order entity

     console.log(`ℹ️ Processing order.paid event for Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`);

     if (!bookingNotes || Object.keys(bookingNotes).length === 0) {
         console.error(`❌ Webhook Error: Notes are empty for order ${razorpay_order_id}. Cannot process.`);
         // Acknowledge receipt but log error, maybe notify admin
         return res.status(200).json({ success: true, message: 'Webhook received, but notes missing.' });
     }

     // 3. Check if it's a booking based on notes
     // You requested specific notes fields, let's use them
     if (bookingNotes.type === 'booking') {
         console.log("ℹ️ Processing as BOOKING...");
         // Construct the booking record for Supabase
         // Ensure selected_seats from notes is treated as an array
         let seatsArray = [];
         if (typeof bookingNotes.selected_seats === 'string') {
             seatsArray = bookingNotes.selected_seats.split(',').map(s => s.trim()).filter(s => s);
         } else if (Array.isArray(bookingNotes.selected_seats)) {
             seatsArray = bookingNotes.selected_seats; // Assume it's already an array
         }

         const bookingRecord = {
             event_title: bookingNotes.event_title || 'N/A',
             event_date: bookingNotes.event_date || 'N/A',
             event_time: bookingNotes.event_time || 'N/A',
             selected_seats: seatsArray,
             seat_count: parseInt(bookingNotes.seat_count, 10) || seatsArray.length, // Fallback to array length
             customer_name: bookingNotes.customer_name || 'N/A',
             customer_email: bookingNotes.customer_email || 'N/A', // Email is crucial
             customer_phone: bookingNotes.customer_phone || null,
             total_amount: orderEntity.amount / 100, // Convert paise back to rupees for DB
             razorpay_payment_id: razorpay_payment_id,
             razorpay_order_id: razorpay_order_id,
             is_ticket_active: true // Payment successful
         };

         // Basic validation before saving
         if (!bookingRecord.customer_email || bookingRecord.customer_email === 'N/A') {
             console.error("❌ Webhook Error: Customer email is missing in notes. Cannot save booking.", bookingNotes);
             return res.status(400).json({ success: false, message: 'Customer email missing in booking notes.' });
         }

         // 4. Save to Supabase
         console.log("ℹ️ Attempting to save booking to Supabase:", { order_id: razorpay_order_id, email: bookingRecord.customer_email });
         try {
           const { data: savedBooking, error: dbError } = await supabase
             .from('bookings')
             .insert(bookingRecord)
             .select() // Select the inserted row
             .single(); // Expecting only one row

           if (dbError) {
             // Handle potential duplicate insertion if webhook retries
             if (dbError.code === '23505') { // PostgreSQL unique violation code
                console.warn(`⚠️ Duplicate booking detected for Order ID ${razorpay_order_id}. Skipping insertion.`);
                // Optionally fetch existing booking to send email again if needed, or just acknowledge
             } else {
                 throw dbError; // Rethrow other database errors
             }
           } else {
              console.log(`✅ Booking saved successfully: ID ${savedBooking.id}`);

              // 5. Trigger Email Function (using fetch)
              const emailWebhookUrl = `${SUPABASE_URL}/functions/v1/send-booking-email-secure?secret=${EMAIL_WEBHOOK_SECRET}`;
              try {
                 console.log(`📧 Invoking email function for booking ${savedBooking.id}`);
                 const emailResponse = await fetch(emailWebhookUrl, {
                     method: 'POST',
                     headers: {
                       'Content-Type': 'application/json',
                       // Supabase Edge Functions often need the Authorization header even if verify_jwt=false, using the service key
                       'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
                      },
                     body: JSON.stringify({ record: savedBooking }) // Send the saved record
                 });

                  if (!emailResponse.ok) {
                     const errorBodyText = await emailResponse.text(); // Get raw text for better debugging
                     console.error(`❌ Email function failed with status ${emailResponse.status}:`, errorBodyText);
                     // Log the failure but don't fail the webhook response
                  } else {
                      console.log("✅ Email function invoked successfully.");
                  }
              } catch (emailError) {
                  console.error(`❌ Email function invocation failed for booking ${savedBooking.id}:`, emailError);
                  // Log the failure
              }
           } // end of !dbError else

         } catch (supabaseError) {
           console.error("❌ Webhook Error: Failed to save booking to Supabase:", supabaseError);
           // Acknowledge receipt but log error, maybe notify admin
           return res.status(200).json({ success: true, message: 'Webhook received, DB error occurred.' });
         }
         console.log("✅ Webhook processing complete for booking.");

     // Add handling for 'donation' type if needed, similar to booking
     } else if (bookingNotes.type === 'donation') {
          console.log("ℹ️ Processing as DONATION...");
          // ... (Add donation saving logic here if required) ...
          console.log("✅ Webhook processing complete for donation.");
     }
      else {
         console.warn(`⚠️ Webhook Warning: Received order.paid for unknown type or missing notes type in Order ID ${razorpay_order_id}.`);
     }

  } else {
     console.log(`ℹ️ Webhook received unhandled event: ${body.event}`);
  }

  // Acknowledge receipt to Razorpay successfully
  res.status(200).json({ success: true, message: 'Webhook received' });
});


// --- Endpoint to Check Booking Status from DB ---
app.get('/api/payment/booking-status/:orderId', async (req, res) => {
  const { orderId } = req.params;

  if (!orderId) {
    return res.status(400).json({ success: false, message: 'Razorpay Order ID is required' });
  }

  console.log(`ℹ️ Checking booking status for Razorpay Order ID: ${orderId}`);

  try {
    // Query Supabase for a booking with the matching razorpay_order_id
    const { data: booking, error: dbError } = await supabase
      .from('bookings')
      .select('*') // Select all columns you might need on the status page
      .eq('razorpay_order_id', orderId)
      .maybeSingle(); // Use maybeSingle() as it might not exist yet or failed

    if (dbError) {
      console.error(`❌ Supabase error fetching booking status for ${orderId}:`, dbError);
      throw new Error('Database query failed');
    }

    if (booking && booking.is_ticket_active) {
      // Booking found and marked active (meaning webhook likely succeeded)
      console.log(`✅ Booking found and active for Order ID ${orderId}`);
      res.json({
        success: true,
        status: 'SUCCESS',
        message: 'Booking confirmed successfully.',
        data: {
          // Only send necessary, non-sensitive data
          transactionId: booking.razorpay_payment_id, // Use payment ID as transaction ID
          amount: booking.total_amount * 100, // Convert back to paise if needed, or keep as rupees
          event_title: booking.event_title,
          selected_seats: booking.selected_seats,
          customer_name: booking.customer_name
          // Add other details if needed on status page
        }
      });
    } else if (booking && !booking.is_ticket_active) {
      // Booking might exist but wasn't marked active (unlikely with current webhook logic, but good practice)
       console.warn(`⚠️ Booking found but NOT active for Order ID ${orderId}`);
       res.json({
        success: false,
        status: 'FAILED',
        message: 'Payment received, but booking confirmation is pending or failed. Please contact support.',
        data: null
       });
    }
     else {
      // No booking found for this order ID yet
      console.log(`⏳ Booking not yet found for Order ID ${orderId}. Payment might be processing or webhook delayed.`);
      // Check if the frontend hinted at a failure
      const clientStatusHint = req.query.status;
      if (clientStatusHint === 'failed') {
         res.json({
            success: false,
            status: 'FAILED',
            message: 'Payment failed or was cancelled.',
            data: null
         });
      } else {
         // Treat as processing if no failure hint and not found yet
         res.json({
            success: false, // Indicate data isn't fully confirmed yet
            status: 'PROCESSING',
            message: 'Payment received. Finalizing booking details...',
            data: null
         });
      }
    }
  } catch (error) {
    console.error(`❌ Error checking booking status for ${orderId}:`, error);
    res.status(500).json({
      success: false,
      status: 'FAILED',
      message: 'An error occurred while checking booking status.',
      error: error.message || 'Unknown server error'
    });
  }
});





// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`🔑 Razorpay Key ID: ${RAZORPAY_KEY_ID ? 'Loaded' : 'MISSING!'}`);
  // Avoid logging secrets in production environments
  // console.log(`🔒 Razorpay Key Secret: ${RAZORPAY_KEY_SECRET ? 'Loaded' : 'MISSING!'}`);
  // console.log(`🪝 Razorpay Webhook Secret: ${RAZORPAY_WEBHOOK_SECRET ? 'Loaded' : 'MISSING!'}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL ? 'Loaded' : 'MISSING!'}`);
});