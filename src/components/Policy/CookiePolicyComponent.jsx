import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CookiePolicyComponent() {
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
          Cookie Policy
        </h1>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 lg:p-14 space-y-12">
          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              This Cookie Policy explains how CYNA uses cookies and similar technologies (collectively "cookies") on our website, mobile application, and SaaS platform (www.cyna-it.fr and related services). Cookies are small text files placed on your device to help provide a better user experience, analyze usage, and enable certain functionalities.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              We comply with the EU GDPR, the ePrivacy Directive (as transposed in French law), and CNIL guidelines (updated 2025-2026). This policy supplements our <a href="/privacy-policy" className="text-indigo-600 dark:text-indigo-400 underline">Privacy Policy</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              2. What Are Cookies and Similar Technologies?
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Cookies are small data files stored on your browser or device. Similar technologies include pixels, web beacons, local storage, and device fingerprinting. They can be session cookies (deleted when you close your browser) or persistent cookies (remain until expiration or deletion).
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              3. Types of Cookies We Use
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We classify cookies into the following categories:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-3 text-gray-700 dark:text-gray-300">
              <li><strong>Strictly Necessary Cookies</strong> (no consent required): Essential for site operation, such as authentication, session management, security (fraud prevention), shopping cart functionality, and remembering language preferences. These are exempt from consent under Article 82 of the French Data Protection Act.</li>
              <li><strong>Functional Cookies</strong> (consent optional but improves experience): Remember user choices (e.g., dark mode, viewed products), enable live chat support, and improve navigation.</li>
              <li><strong>Performance / Analytics Cookies</strong> (consent required): Measure site performance, visitor numbers, popular pages, and user journeys (e.g., Google Analytics, Matomo, or similar anonymized tools). Data is aggregated and anonymized where possible.</li>
              <li><strong>Advertising / Marketing Cookies</strong> (consent required): Deliver personalized ads, retargeting, and track marketing campaign effectiveness (e.g., via Meta Pixel, LinkedIn Insight Tag, or Google Ads if used). We do not use intrusive behavioral advertising by default.</li>
              <li><strong>Third-Party Cookies</strong>: From partners such as payment providers (Stripe), analytics tools, social media plugins (LinkedIn, Twitter/X), or embedded content. We only enable them with your consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              4. How We Obtain Your Consent
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We use a cookie consent banner (CMP – Consent Management Platform) on first visit. You can:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Accept all cookies</li>
              <li>Reject all non-essential cookies</li>
              <li>Customize your preferences (granular choices per category)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Consent is freely given, specific, informed, and unambiguous. Refusal is as easy as acceptance (no dark patterns). You can withdraw or change consent at any time via the link in the footer ("Cookie Preferences") or by clearing browser cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              5. Managing and Deleting Cookies
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You can manage cookies via:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Our cookie banner / preferences center</li>
              <li>Your browser settings (e.g., Chrome, Firefox, Safari – block third-party cookies, private browsing)</li>
              <li>Tools like Global Privacy Control (GPC) signals (honored where applicable)</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Note: Blocking necessary cookies may prevent site functionality (e.g., login, checkout).
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              6. Third-Party Services and International Transfers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Some cookies involve third parties (e.g., Google Analytics, Stripe, social networks). These may transfer data outside the EU/EEA. Transfers are safeguarded by Standard Contractual Clauses (SCCs), adequacy decisions, or other GDPR mechanisms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              7. Updates to This Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Cookie Policy to reflect changes in technology, law, or our practices. Material changes will be notified via email, in-app notice, or updated banner. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              8. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For questions about cookies or to exercise your rights: <a href="mailto:dpo@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">dpo@cyna-it.fr</a><br />
              CYNA-IT – 10 rue de Penthievre, 75008 Paris, France
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