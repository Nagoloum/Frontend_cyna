// src/layouts/admin/AdminFooter.jsx

const APP_VERSION = '1.0.0'; // Sync with your package.json if needed

export default function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="
      h-10 flex-shrink-0 flex items-center justify-between
      px-6
      bg-white dark:bg-gray-900
      border-t border-gray-200 dark:border-gray-700/60
    ">
      {/* Left: version */}
      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
        Back-office v{APP_VERSION}
      </span>

      {/* Center: copyright */}
      <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
        © {year} Cyna — Internal use only
      </span>

      {/* Droite : liens */}
      <div className="flex items-center gap-4">
        <a
          href="mailto:it@cyna.fr"
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
        >
          Contact IT
        </a>
        <a
          href="/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
        >
          Legal Notice
        </a>
      </div>
    </footer>
  );
}
