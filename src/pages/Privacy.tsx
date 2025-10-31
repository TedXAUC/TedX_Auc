import { FC } from "react";

const Privacy: FC = () => {
  return (
    <div className="pt-24">
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in prose prose-invert">
            <h1 className="text-5xl font-bold mb-8 text-center">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-center">
              Last Updated: 24th Oct 2025
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect personal information such as your name, email, and phone number when you register for an event, sign up, or contact us. We also collect payment information through our secure payment gateway partner.</p>

            <h2>2. How We Use Your Information</h2>
            <p>Your information is used to process your ticket bookings, send you event-related communications, and improve our services. We do not sell or share your personal data with third parties for marketing purposes.</p>

            <h2>3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted and processed by our trusted payment gateway provider.</p>

            <h2>4. Your Rights</h2>
            <p>You have the right to access, update, or delete your personal information. Please contact us if you wish to exercise these rights.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
