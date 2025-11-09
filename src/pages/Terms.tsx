import { FC } from "react";
import { Link } from "react-router-dom"; 

const Terms: FC = () => {
  return (
    <div className="pt-24">
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in prose prose-invert">
            <h1 className="text-5xl font-bold mb-8 text-center">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-center">
              Last Updated: 24th Oct 2025
            </p>

            <h2>1. Introduction</h2>
            <p>Welcome to TEDxAUC. These Terms and Conditions govern your use of our website and services, including ticket purchases for our events. By accessing our website or purchasing tickets, you agree to be bound by these terms.</p>

            <h2>2. Ticket Purchases</h2>
            <p>All ticket sales are final. Tickets are non-transferable. Please review our Refund Policy for details on exceptional circumstances.</p>

            {/* --- MODIFIED AND ENHANCED SECTION --- */}
            <h2>3. Attendee Conduct & Event Rules</h2>
            <p>
              Our event is about community, learning, and respect. All attendees, speakers, and staff agree to abide by the following code of conduct.
            </p>

            <h3>Do:</h3>
            <ul>
              <li>
                <strong>Be Respectful:</strong> Treat all fellow attendees, speakers, and event staff with courtesy and respect. Harassment, discrimination, or disruptive behavior will not be tolerated.
              </li>
              <li>
                <strong>Be Punctual:</strong> Arrive on time for check-in and for the talks. Auditorium doors may be closed during sessions to avoid disturbing the speakers and other attendees.
              </li>
              <li>
                <strong>Silence Devices:</strong> Please ensure all mobile phones, smartwatches, and other electronic devices are switched to silent mode inside the auditorium.
              </li>
              <li>
                <strong>Engage & Connect:</strong> The "x" in TEDx stands for connection. We encourage you to network with other attendees and engage in constructive discussions during breaks.
              </li>
              <li>
                <strong>Join the Group:</strong> All confirmed attendees will be added to an official communication group (e.g., WhatsApp) for real-time updates and event information. If you have purchased a ticket and are not in this group 24 hours before the event, please contact us at <strong>8926265583</strong> or via our <Link to="/contact" className="text-primary hover:underline">Contact Page</Link>.
              </li>
            </ul>

            <h3>Don't:</h3>
            <ul>
              <li>
                <strong>No Food or Beverages:</strong> To maintain the cleanliness of the venue and respect venue policies, food and beverages are <strong>strictly prohibited</strong> inside the auditorium. You may consume refreshments in designated areas only.
              </li>
              <li>
                <strong>Consequences:</strong> Please be aware that you may be asked to leave the auditorium if you are found with food or drink. Repeated disregard for this rule may result in your removal from the event without a refund.
              </li>
              <li>
                <strong>No Unauthorized Recording:</strong> While you are welcome to take photos, the unauthorized video or audio recording of talks is strictly prohibited, as per TED guidelines.
              </li>
              <li>
                <strong>No Smoking:</strong> The event venue is a strict no-smoking and no-vaping area.
              </li>
              <li>
                <strong>No Disruptions:</strong> Avoid talking loudly, blocking aisles, or any other behavior that could disrupt the talks or the experience of other attendees.
              </li>
            </ul>
            <p>
              TEDxAUC reserves the right to remove any individual from the event for failing to adhere to these rules, without any warning or refund.
            </p>
            {/* --- END MODIFIED SECTION --- */}


            <h2>4. Intellectual Property</h2>
            <p>All content, including talks, videos, and materials, are the intellectual property of TEDxAUC and TED. Unauthorized recording, reproduction, or distribution is strictly prohibited.</p>

            <h2>5. Limitation of Liability</h2>
            <p>TEDxAUC is not liable for any personal injury, loss, or damage to personal property during the event. Attendees are responsible for their own belongings.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
