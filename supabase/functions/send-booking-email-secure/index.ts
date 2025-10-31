import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from "https://esm.sh/resend@3.2.0";

console.log("Edge Function 'send-booking-email-secure' (Simple Email + CORS) is starting up.");

// --- Environment Variables ---
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const WEBHOOK_SECRET = Deno.env.get('EMAIL_WEBHOOK_SECRET'); // Match the dashboard name

// --- Your Logo URL ---
const LOGO_URL = "https://lehpiptexuxbnxgdunmc.supabase.co/storage/v1/object/public/assets/tedxauc-logo-new.png"; 

// --- Initialize Resend ---
const resend = new Resend(RESEND_API_KEY!);

// --- CORS HEADERS ARE STILL NEEDED ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow any origin
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to create a response WITH CORS
const createResponse = (data: any, status: number, headers: Record<string, string> = {}) => {
  return new Response(JSON.stringify(data), {
    status: status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders, ...headers },
  });
};

serve(async (req) => {
  // Handle CORS preflight "OPTIONS" request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  // 1. Check secret
  const url = new URL(req.url);
  const secret = url.searchParams.get('secret');
  if (secret !== WEBHOOK_SECRET) {
    console.warn("Invalid webhook secret received.");
    return createResponse({ message: 'Invalid secret' }, 401);
  }

  // 2. Check method and get data
  if (req.method !== 'POST') {
    return createResponse({ message: 'Method not allowed' }, 405);
  }

  let record: any;
  try {
    const body = await req.json();
    record = body.record; // We ONLY expect the record now

    if (!record) {
      return createResponse({ message: 'Missing "record" in request body' }, 400);
    }
  } catch (err) {
    return createResponse({ message: `Failed to parse body: ${err.message}` }, 400);
  }

  // 3. Send Email (This is now the only job)
  try {
    const {
      customer_name,
      customer_email,
      event_title,
      event_date,
      event_time,
      selected_seats,
    } = record;

    if (!customer_email) {
      throw new Error("Customer email is missing from the booking record.");
    }

    console.log(`[Function] Attempting to send an email to ${customer_email}...`);

    // --- Your Original HTML Template ---
    const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your TEDxAUC Ticket</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #111111; color: #ffffff;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #111111;">
            <tr>
              <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 20px auto;">
                  <tr>
                    <td align="center" style="padding: 20px 0;">
                      <img src="${LOGO_URL}" alt="TEDxAUC Logo" width="150">
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #1c1c1c; padding: 40px; border-radius: 8px;">
                      <h1 style="color: #e62b1e; font-size: 28px; margin: 0 0 20px 0;">Booking Confirmed!</h1>
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${customer_name},</p>
                      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">Thank you for booking your ticket for <strong>${event_title}</strong>. We're excited to have you join us for this inspiring event.</p>
                      
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border: 1px solid #444; border-radius: 8px; overflow: hidden;">
                        <tr>
                          <td style="padding: 20px; background-color: #2a2a2a;">
                            <h2 style="font-size: 20px; color: #e62b1e; margin: 0 0 15px 0;">Your Ticket Details</h2>
                            <table width="100%" border="0" cellspacing="0" cellpadding="5">
                              <tr>
                                <td style="color: #aaaaaa; width: 100px;">Attendee:</td>
                                <td style="color: #ffffff; font-weight: bold;">${customer_name}</td>
                              </tr>
                              <tr>
                                <td style="color: #aaaaaa;">Event:</td>
                                <td style="color: #ffffff; font-weight: bold;">${event_title}</td>
                              </tr>
                              <tr>
                                <td style="color: #aaaaaa;">Date & Time:</td>
                                <td style="color: #ffffff; font-weight: bold;">${event_date} at ${event_time}</td>
                              </tr>
                               <tr>
                                <td style="color: #aaaaaa;">Seat(s):</td>
                                <td style="color: #ffffff; font-weight: bold;">${selected_seats.join(", ")}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 15px 20px; background-color: #333333; border-top: 1px solid #444;">
                            <p style="font-size: 12px; color: #aaaaaa; margin: 0;">
                              <strong>Important:</strong> Please show this email or the ticket in your profile on our website at the gate. Both are valid for entry.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 16px; line-height: 1.6; margin: 30px 0 0 0;">We can't wait to see you there!</p>
                      <p style="font-size: 16px; line-height: 1.6; margin: 10px 0 0 0;"><em>- The TEDxAUC Team</em></p>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 20px; font-size: 12px; color: #777777;">
                      <p style="margin: 0;">&copy; ${new Date().getFullYear()} TEDxAUC, Amity University Chhattisgarh. All rights reserved.</p>
                      <p style="margin: 5px 0 0 0;">This independent TEDx event is operated under license from TED.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

    const { data, error } = await resend.emails.send({
      // Replace 'bookings' with whatever you prefer (e.g., 'noreply', 'confirmations')
from: "TEDxAUC Confirmation <bookings@tedxamity.com>",
      to: [customer_email],
      subject: `Your Ticket Confirmation for ${event_title}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[Function] Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("[Function] Email sent successfully! Response:", data);
    return createResponse(data, 200);

  } catch (err) {
    console.error('[Function] Email sending failed:', err.message);
    return createResponse({ message: `Email sending failed: ${err.message}` }, 500);
  }
});