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
              {/* We take your privacy very seriously. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use the <span className="font-semibold text-indigo-400">RememberMe</span> application. */}
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {/* This policy complies with the General Data Protection Regulation (GDPR) and applicable data protection laws. */}
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              2. Data Controller
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {/* The data controller is:<br />
              <strong>NAGOLOUM TALLA DANIEL PARFAIT</strong><br />
              Address: 93160 - Noisy Le Grand<br />
              Email: <a href="mailto:danielnagoloum@gmail.com" target="_blank" className='text-indigo-400'>danielnagoloum@gmail.com</a> */}
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              3. Personal Data Collected
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {/* We collect the following data: */}
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              {/* <li><strong>Identity data</strong>: email address, username (optional).</li>
              <li><strong>Account data</strong>: hashed password (never stored in plain text).</li>
              <li><strong>User content</strong>: task titles and descriptions, dates, categories, notes.</li>
              <li><strong>Technical data</strong>: IP address, device type, browser, connection logs (for security and troubleshooting).</li>
              <li><strong>Usage data</strong>: frequency of use, features used (anonymized where possible).</li> */}
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {/* We do not collect any sensitive data (ethnic origin, political opinions, health, etc.) unless you voluntarily include it in your tasks — in which case you assume responsibility. */}
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              4. Purposes and Legal Bases
            </h2>
            {/* <p className="text-gray-700 dark:text-gray-300 leading-relaxed">Your data is processed for the following purposes:</p>
            <ul className="list-disc list-inside mt-4 space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Service delivery</strong> (contract performance): account creation and management, task synchronization.</li>
              <li><strong>Security</strong> (legitimate interest): fraud detection, suspicious login attempts.</li>
              <li><strong>Service improvement</strong> (legitimate interest): anonymized usage analysis to fix bugs and add features.</li>
              <li><strong>Communication</strong> (consent or legitimate interest): sending important emails (security updates, terms changes).</li>
            </ul> */}
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              5. Data Recipients
            </h2>
            {/* <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Your data may be accessed by:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Our technical subcontractors (cloud hosting, database, anonymized analytics) located in the EU or with adequate GDPR safeguards.</li>
              <li>Competent authorities when required by law.</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              We never sell or rent your data to third parties for marketing purposes.
            </p> */}
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              6. Data Retention Period
            </h2>
            {/* <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Account and task data: kept as long as your account is active.</li>
              <li>After account deletion: permanently deleted within 30 days (except legal obligations).</li>
              <li>Technical logs: maximum 6 months.</li>
              <li>Backups: automatically deleted after 90 days.</li>
            </ul> */}
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              7. Your GDPR Rights
            </h2>
            {/* <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You have the following rights:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Right of access</li>
              <li>Right to rectification</li>
              <li>Right to erasure (“right to be forgotten”)</li>
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to object</li>
              <li>Right to withdraw consent at any time</li>
              <li>Right to provide instructions for data after death</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              To exercise these rights, contact us at <a href="mailto:danielnagoloum@gmail.com" target="_blank" className="text-indigo-600 dark:text-indigo-400 underline">danielnagoloum@gmail.com</a>. We will respond within one month (extendable to two months if complex).
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              You may also lodge a complaint with the CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline">www.cnil.fr</a>) or your local data protection authority.
            </p> */}
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              8. Data Security
            </h2>
            {/* <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We implement appropriate technical and organizational measures: encryption in transit (HTTPS) and at rest, password hashing, restricted access, regular audits.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              In the event of a data breach posing a risk, we will notify the supervisory authority and, if necessary, affected individuals within 72 hours.
            </p> */}
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              9. Cookies and Trackers
            </h2>
            {/* <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The application uses only strictly necessary cookies (authentication, interface preferences). No advertising or third-party tracking cookies are used.
            </p> */}
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              10. Changes to this Policy
            </h2>
            {/* <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this policy. Significant changes will be notified by email or via an in-app banner. Continued use constitutes acceptance of the new policy.
            </p> */}
          </section>

          {/* Last Update */}
          <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Last updated: December 30, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}