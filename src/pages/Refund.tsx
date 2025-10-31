import { FC } from "react";

const Refund: FC = () => {
  return (
    <div className="pt-24">
      <section className="section-padding bg-gradient-to-br from-background to-primary/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl animate-fade-in prose prose-invert">
            <h1 className="text-5xl font-bold mb-8 text-center">
              Refund <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-center">
              Last Updated: 24th Oct 2025
            </p>

            <h2>1. General Policy</h2>
            <p>All tickets purchased for TEDxAUC events are non-refundable. We do not offer refunds or exchanges for any reason, including but not limited to, non-attendance, change of mind, or scheduling conflicts.</p>

            <h2>2. Event Cancellation</h2>
            <p>In the unlikely event that TEDxAUC is canceled, we will offer a full refund to all ticket holders. The refund will be processed to the original method of payment within 30 business days of the cancellation announcement.</p>

            <h2>3. Speaker or Schedule Changes</h2>
            <p>The lineup of speakers and the event schedule are subject to change and you will be informed of these changes timely. Such changes do not qualify for a refund.</p>

            <h2>4. Contact Us</h2>
            <p>If you have any questions regarding our Refund Policy, please contact us through our contact page.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Refund;
