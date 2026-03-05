export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Navigation : Mentions légales, CGU, Contact */}
        <nav className="flex flex-wrap justify-center gap-6 mb-4 md:mb-0">
          <a
            href="/mentions-legales"
            className="hover:text-white transition-colors duration-200"
          >
            Mentions légales
          </a>
          <a
            href="/cgu"
            className="hover:text-white transition-colors duration-200"
          >
            CGU
          </a>
          <a
            href="/contact"
            className="hover:text-white transition-colors duration-200"
          >
            Contact
          </a>
        </nav>

        {/* Réseaux Sociaux */}
        <div className="flex gap-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            Facebook
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            X (Twitter)
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
