# Security Policy

## Supported Versions

Critical security patches are applied to the active production branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Security Architecture & Defenses

This platform was built to handle public ticketing, high-concurrency seat locking, and live financial transactions. The following safeguards are enforced:

1. **HMAC-SHA256 Webhook Verification**:
   - Inbound payment notifications from Razorpay require strict cryptographic signature validation using `RAZORPAY_WEBHOOK_SECRET`.
   - Raw request bodies are preserved to avoid JSON parsing discrepancies that could invalidate digests.

2. **Idempotent Transaction Processing**:
   - The database enforces uniqueness on `razorpay_order_id`. Retried webhooks or network race conditions cannot trigger duplicate ticket dispatches or multiple database insertions.

3. **Secrets Isolation**:
   - `RAZORPAY_KEY_SECRET`, `SUPABASE_SERVICE_KEY`, and `RESEND_API_KEY` are isolated to server environments and Supabase vault secrets. They are never exposed in frontend client bundles.

4. **Row Level Security (RLS)**:
   - Supabase tables enforce granular RLS policies. Client queries can only read authorized public event metadata; sensitive booking mutations are strictly mediated through backend service-role API endpoints.

5. **Origin & CORS Control**:
   - Cross-origin HTTP requests are strictly whitelisted to production domains (`https://ted-x-auc.vercel.app`, `https://tedxamity.com`, and approved local dev ports).

---

## Reporting a Vulnerability

If you discover a potential vulnerability or security flaw:

1. **Do not open a public issue.**
2. Send an email to [nikhilyadav200530@gmail.com](mailto:nikhilyadav200530@gmail.com) with:
   - Description of the vulnerability.
   - Proof of concept (PoC) or steps to reproduce.
   - Potential impact.
3. You will receive an acknowledgement within 24–48 hours. Valid vulnerabilities will be addressed immediately.
