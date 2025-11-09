import { FC } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation

const Terms: FC = () => {
  return (
    <div className="pt-24">
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* This `prose` class automatically styles all the h2, h3, p, and ul tags below for perfect spacing */}
          <div className="mx-auto max-w-4xl animate-fade-in prose prose-invert">

            <h1 className="text-5xl font-bold mb-8 text-center">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-center">
              Last Updated: 9th NOV 2025
            </p>

            <h2>1. Introduction</h2>
            <p>Welcome to TEDxAUC. These Terms and Conditions govern your use of our website and services, including ticket purchases for our events. By accessing our website or purchasing tickets, you agree to be bound by these terms.</p>

            <h2>2. Ticket Purchases</h2>
            <p>All ticket sales are final and non-transferable. Please review our Refund Policy for details on exceptional circumstances.</p>

            {/* --- NEW SECTION FOR ID REQUIREMENTS --- */}
            <h2>3. Event Access & Security Requirements</h2>
            <p>
              For the safety and security of all attendees, you must present a valid photo ID at the check-in counter to receive your event pass.
            </p>
            <ul>
              <li>
                <strong>Amity University Chhattisgarh Students:</strong> You must present your valid Amity University Student ID Card AND your Aadhar Card (or other government-issued photo ID).
              </li>
              <li>
                <strong>Guests & External Attendees:</strong> You must present your Aadhar Card or another valid government-issued photo ID (e.g., Driver's License, Passport).
              </li>
            </ul>
            <p>
              Entry may be denied if you fail to provide the required identification.
            </p>
            {/* --- END NEW SECTION --- */}


            {/* --- ENHANCED CONDUCT SECTION --- */}
            <h2>4. Attendee Conduct & Event Rules</h2>
            <p>
              Our event is about community, learning, and respect. All attendees agree to abide by the following code of conduct.
            </p>

            <h3>Do:</h3>
            <ul>
              <li>
                <strong>Be Respectful:</strong> Treat all fellow attendees, speakers, and event staff with courtesy. Harassment, discrimination, or disruptive behavior will not be tolerated.
              </li>
              <li>
                <strong>Be Punctual:</strong> Arrive on time for check-in and for the talks. Auditorium doors may be closed during sessions to avoid disturbances.
              </li>
              <li>
                <strong>Silence Devices:</strong> Please ensure all mobile phones and other electronic devices are switched to silent mode inside the auditorium.
              </li>
              <li>
                <strong>Engage & Connect:</strong> We encourage you to network with other attendees and engage in constructive discussions during breaks.
              </li>
              <li>
                <strong>Join the Group:</strong> All confirmed attendees will be added to an official communication group (e.g., WhatsApp) for real-time updates. If you have purchased a ticket and are not in this group 24 hours before the event, please contact us at <strong>8926265583</strong> or via our <Link to="/contact" className="text-primary hover:underline">Contact Page</Link>.
              </li>
            </ul>

            <h3>Don't:</h3>
            <ul>
              <li>
                <strong>No Food or Beverages:</strong> To maintain venue cleanliness, food and beverages are <strong>strictly prohibited</strong> inside the main auditorium. You may consume refreshments in designated break areas only.
              </li>
              <li>
                <strong>No Unauthorized Recording:</strong> While you are welcome to take photos, the unauthorized video or audio recording of talks is strictly prohibited, as per TED guidelines.
              </li>
              <li>
                <strong>No Smoking:</strong> The event venue is a strict no-smoking and no-vaping area, including all indoor and outdoor campus spaces.
              </li>
            </ul>
            
            <p>
              <strong>Consequences:</strong> Failure to comply with these rules (especially regarding food/drink or disruptive behavior) may result in you being asked to leave the venue by event staff or security. TEDxAUC reserves the right to remove any individual without refund.
            </p>
            {/* --- END ENHANCED SECTION --- */}

            <h2>5. Intellectual Property</h2>
            <p>All content, including talks, videos, and materials, are the intellectual property of TEDxAUC and TED. Unauthorized reproduction or distribution is strictly prohibited.</p>

            <h2>6. Limitation of Liability</h2>
            <p>TEDxAUC is not liable for any personal injury, loss, or damage to personal property during the event. Attendees are responsible for their own belongings.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
