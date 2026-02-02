import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfUseComponent() {
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
          Terms of Use
        </h1>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 lg:p-14 space-y-12">
          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms of Use govern your access to and use of the CYNA website, mobile application, and SaaS cybersecurity services. By accessing or using our services, you agree to be bound by these terms. If you do not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              2. Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              CYNA provides SaaS cybersecurity solutions (SOC, EDR, XDR, etc.) through subscription plans. Detailed features, SLAs, and pricing are described on the product pages and/or in the specific order confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              3. Account & Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You must create an account to purchase services. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              4. Subscriptions & Payments
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Subscriptions are billed monthly or annually and renew automatically unless canceled before the renewal date via your account. All payments are processed securely via our payment provider. Prices are in EUR, exclusive and inclusive of applicable taxes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              All content, software, trademarks, and services on the platform are owned by CYNA or its licensors. You may not copy, modify, distribute, or create derivative works without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              CYNA provides services “as is”. We are not liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              7. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You may cancel your subscription at any time (effective at the end of the current billing period). We may suspend or terminate your access for non-payment, violation of these terms, or security reasons.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              8. Governing Law & Dispute Resolution
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These terms are governed by French law. Any dispute shall be submitted to the exclusive jurisdiction of the courts of Paris, France, after an attempt at amicable resolution.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update these Terms of Use. Significant changes will be notified by email or in-app notice. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              For any questions: <a href="mailto:support@cyna-it.fr" className="text-indigo-600 dark:text-indigo-400 underline">support@cyna-it.fr</a><br />
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