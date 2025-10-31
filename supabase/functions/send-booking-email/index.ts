import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

console.log("Edge Function 'send-booking-email' is starting up.");

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

// --- THIS IS THE LINE TO CHANGE ---
// Replace the placeholder with the public URL you copied from Supabase Storage.
const LOGO_URL = "https://<your-project-ref>.supabase.co/storage/v1/object/public/assets/tedxauc-logo-new.png"; 

serve(async (req) => {
  try {
    const { record } = await req.json();
    console.log("Received a new booking record:", record);

    const { 
      customer_name, 
      customer_email, 
      selected_seats, 
      event_title, 
      event_date, 
      event_time 
    } = record;

    if (!customer_email) {
      throw new Error("Customer email is missing from the booking record.");
    }

    console.log(`Attempting to send an email to ${customer_email}...`);

    const { data, error } = await resend.emails.send({
      from: "TEDxAUC Confirmation <onboarding@resend.dev>",
      to: [customer_email],
      subject: `Your Ticket Confirmation for ${event_title}`,
      html: `
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
      `,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(error.message);
    }

    console.log("Email sent successfully! Response:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("An error occurred in the Edge Function:", err);
    return new Response(String(err?.message ?? err), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});