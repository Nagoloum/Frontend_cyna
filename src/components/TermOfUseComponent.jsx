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
              By using RememberMe, you agree to these Terms of Use and our Privacy Policy. If you do not agree, please do not use the app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The app allows you to create, manage, and delete tasks. The service is free but may be limited or modified at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              3. User Account
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You must create an account with a valid email address. You are responsible for the security of your password. We may suspend your account in the event of a violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              4. Permitted Use
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You may not use the app for illegal activities, harassment, or spam. You grant us a non-exclusive license to your tasks for the purpose of providing the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              5. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The app and its content are protected by copyright. You may not copy, distribute, or modify it without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              6. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              The app is provided “as is”. We are not liable for data loss or indirect damages. To the extent permitted by law, our liability is limited to the amount paid (0€ for the free version).
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              7. GDPR and Personal Data
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We comply with the GDPR. Please refer to our Privacy Policy for details about your rights and how we process your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              8. Changes to the Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may modify these terms. You will be notified by email. Continued use constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              9. Termination
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You may delete your account at any time. We may terminate it in case of violation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl lg:text-3xl font-semibold text-indigo-600 dark:text-indigo-400 mb-4">
              10. Governing Law
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These terms are governed by French law. Any dispute will be submitted to the courts of Paris.
            </p>
          </section>

          {/* Last Update */}
          <div className="pt-12 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Last updated: January 05, 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}