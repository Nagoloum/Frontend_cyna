export default function Footer() {
  return (
<<<<<<< HEAD
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
=======
    <footer className="bg-[#3A3F51] text-gray-300 mt-auto"> 
      {/* mt-auto assure que le footer est poussé vers le bas si la page est courte, 
          mais descend normalement si la page est longue */}
      
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Contact */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Contact</h4>
          <p className="text-sm mb-2">Support: support@cyna.dev</p>
          <p className="text-sm">Tél: 01 23 45 67 89</p>
        </div>

        {/* Mentions Légales & CGU */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Informations</h4>
          <ul className="text-sm space-y-2">
            <li><a href="#" className="hover:text-[#8000FF]">Mentions Légales</a></li>
            <li><a href="#" className="hover:text-[#8000FF]">CGU / CGV</a></li>
            <li><a href="#" className="hover:text-[#8000FF]">Politique de confidentialité</a></li>
          </ul>
        </div>

        {/* Réseaux Sociaux */}
        <div>
          <h4 className="text-white font-bold mb-4 uppercase text-sm tracking-wider">Suivez-nous</h4>
          <div className="flex space-x-4">
            {/* Placeholders pour icônes */}
            <span className="w-8 h-8 bg-white/10 rounded flex items-center justify-center cursor-pointer hover:bg-[#0078C7]">In</span>
            <span className="w-8 h-8 bg-white/10 rounded flex items-center justify-center cursor-pointer hover:bg-[#0078C7]">X</span>
            <span className="w-8 h-8 bg-white/10 rounded flex items-center justify-center cursor-pointer hover:bg-[#0078C7]">Fb</span>
          </div>
        </div>
        
        {/* Logo / Copyright */}
        <div className="flex flex-col items-start md:items-end justify-between">
           <span className="text-2xl font-bold text-white lowercase">cyna</span>
           <p className="text-xs text-gray-500">© 2026 CYNA DEV</p>
        </div>

      </div>
    </footer>
  );
}
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46
