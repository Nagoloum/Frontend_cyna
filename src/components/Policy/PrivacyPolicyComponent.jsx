import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicyComponent() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="mb-10 flex items-center gap-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors duration-200 group"
        >
          <ArrowLeft className="w-6 h-6 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* Main Title */}
        <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white text-center mb-12">
          Privacy Policy
        </h1>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 lg:p-14 space-y-12">
          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              CYNA takes your privacy seriously. This Privacy Policy explains how we collect, use, disclose, store, and protect your personal data when you use our website, mobile application, and SaaS cybersecurity services (SOC, EDR, XDR, etc.).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              This policy complies with the General Data Protection Regulation (GDPR – Regulation (EU) 2016/679) and other applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              2. Data Controller
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The data controller is:<br />
              <strong>CYNA-IT</strong><br />
              10 rue de Penthievre, 75008 Paris, France<br />
              SIRET: 913 711 032 00015<br />
              Email: <a href="mailto:contact@cyna-it.fr" className="text-indigo-400 hover:underline">contact@cyna-it.fr</a>
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Data Protection Officer (DPO): <a href="mailto:dpo@cyna-it.fr" className="text-indigo-400 hover:underline">dpo@cyna-it.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              3. Personal Data Collected
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We collect the following categories of personal data:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li><strong>Identity & contact data</strong>: name, email, phone, company name</li>
              <li><strong>Billing & payment data</strong>: billing address, payment method details (tokenized via our payment provider – we do not store full card numbers)</li>
              <li><strong>Account data</strong>: login credentials (hashed), subscription details</li>
              <li><strong>Usage & technical data</strong>: IP address, browser type, device information, connection logs, pages visited</li>
              <li><strong>Transaction data</strong>: order history, purchased SaaS plans, invoices</li>
              <li><strong>Cookies & trackers</strong>: strictly necessary cookies, functional cookies, analytics cookies (with consent)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              We do not collect sensitive data (health, political opinions, religion, etc.) unless you voluntarily provide it (e.g. in support messages).
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              4. Purposes and Legal Bases
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your data is processed for the following purposes and legal bases:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Performance of the contract</strong>: account creation, order processing, subscription management, service delivery (SaaS access)</li>
              <li><strong>Legitimate interest</strong>: fraud prevention, security (cybersecurity logs), service improvement (anonymized analytics)</li>
              <li><strong>Legal obligation</strong>: invoicing, accounting, tax compliance</li>
              <li><strong>Consent</strong>: marketing communications (newsletter), non-essential cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              5. Data Recipients
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your data may be shared with:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Internal CYNA teams (sales, support, billing)</li>
              <li>Payment processor (Stripe)</li>
              <li>Cloud hosting provider (EU-based or with GDPR safeguards)</li>
              <li>Email & analytics service providers (with DPA – Data Processing Agreements)</li>
              <li>Competent authorities when required by law</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              We never sell your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              6. Data Retention
            </h2>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Active account & transaction data: duration of the contractual relationship + 5 years (legal prescription)</li>
              <li>Invoicing & accounting data: 10 years (legal obligation)</li>
              <li>Technical logs: up to 6 months</li>
              <li>Deleted account: data permanently erased within 30 days (except legal retention obligations)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              7. Your Rights (GDPR)
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Access your data</li>
              <li>Rectify inaccurate data</li>
              <li>Erase your data (“right to be forgotten”)</li>
              <li>Restrict processing</li>
              <li>Data portability</li>
              <li>Object to processing (including marketing)</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href="mailto:dpo@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">dpo@cyna-it.fr</a>. We will respond within one month.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              You can also lodge a complaint with the CNIL: <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              8. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement state-of-the-art security measures aligned with our cybersecurity expertise: TLS encryption in transit, encryption at rest, access controls, regular security audits, EDR/XDR monitoring, and incident response procedures.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              In case of a personal data breach, we will notify the competent supervisory authority and affected individuals within 72 hours when required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              9. Cookies and Trackers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use strictly necessary cookies for authentication and site functionality. Analytics and marketing cookies are only placed with your explicit consent via our cookie banner. You can manage your preferences at any time.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              See our <a href="/cookie-policy" className="text-indigo-600 dark:text-indigo-400 underline">Cookie Policy</a> for more details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              10. Changes to this Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy. Material changes will be notified by email or prominent notice on the platform. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Last updated: February 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}