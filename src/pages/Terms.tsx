import { FC } from "react";

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
            <p>All ticket sales are final. Please review our Refund Policy for details on exceptional circumstances.</p>

            <h2>3. Event Conduct</h2>
            <p>Attendees are expected to conduct themselves in a respectful and professional manner. TEDxAUC reserves the right to remove any individual for disruptive behavior without a refund.</p>

            <h2>4. Intellectual Property</h2>
            <p>All content, including talks, videos, and materials, are the intellectual property of TEDxAUC and TED. Unauthorized recording, reproduction, or distribution is strictly prohibited.</p>

            <h2>5. Limitation of Liability</h2>
            <p>TEDxAUC is not liable for any personal injury, loss, or damage to personal property during the event.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
