import { ShoppingCart, User, Search } from 'lucide-react'; 

export default function Navbar() {
  return (
    <nav className="bg-[#3A3F51] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo - Style basé sur ton image (minuscule, gras) */}
          <div className="flex items-center gap-2 cursor-pointer">
            {/* Simulation de l'icône Cyna */}
            <div className="w-8 h-8 rounded-full bg-[#8000FF] flex items-center justify-center font-bold text-white">
              C
            </div>
            <span className="text-2xl font-bold tracking-tight lowercase font-sans">
              cyna
            </span>
          </div>

          {/* Recherche */}
          <div className="hidden md:flex relative w-1/3">
            <input
              type="text"
              placeholder="Rechercher un produit..."
              className="w-full bg-[#2A2E3D] text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8000FF] border border-gray-600 placeholder-gray-400"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6">
            <button className="hover:text-[#0078C7] transition relative">
              <span className="text-xl">🛒</span>
              <span className="absolute -top-1 -right-2 bg-[#8000FF] text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
            </button>
            <button className="hover:text-[#0078C7] transition flex items-center gap-2">
              <span className="text-xl">👤</span>
              <span className="hidden lg:block text-sm font-medium">Connexion</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}