<<<<<<< HEAD
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const navLinks = [
  { label: "Accueil", href: "/" },
  {
    label: "Catégories",
    href: "/categories",
    children: [
      { label: "Vêtements", href: "/categories/vetements" },
      { label: "Accessoires", href: "/categories/accessoires" },
    ],
  },
  { label: "Nouveautés", href: "/nouveautes" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const cartCount = 3;
=======
import { ShoppingCart, User, Search } from 'lucide-react'; 
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46

  return (
<<<<<<< HEAD
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm mb-10">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-20">
        <div className="flex h-20 items-center justify-between gap-2 md:gap-4">
          {/* 1. LOGO */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 md:h-10 w-auto object-contain"
            />
          </Link>

          {/* 2. BARRE DE RECHERCHE (Maintenant visible aussi sur Mobile) */}
          <div className="flex flex-1 max-w-md relative group mx-2">
            <Input
              type="text"
              placeholder="Quel produit cherchez-vous ?"
              className="w-full pl-4 pr-10 md:pl-5 md:pr-12 h-10 md:h-11 rounded-full border-gray-200 bg-gray-50 text-[12px] md:text-sm focus-visible:ring-primary focus:bg-white transition-all"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#3b82f6] text-white p-1.5 md:p-2 rounded-full transition-colors">
              <Search size={14} className="md:w-4 md:h-4" />
            </button>
          </div>

          {/* 3. NAVIGATION (Desktop uniquement) */}
          <nav className="hidden xl:flex items-center gap-1 shrink-0">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() =>
                  link.children && setOpenDropdown(link.label)
                }
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  to={link.href}
                  className="flex items-center gap-1 px-3 py-2 text-[13px] font-bold uppercase tracking-tight text-gray-700 hover:text-primary transition-colors"
                >
                  {link.label}
                  {link.children && <ChevronDown size={12} />}
                </Link>
                {/* ... dropdown menu ... */}
              </div>
            ))}
          </nav>

          {/* 4. ACTIONS DROITE */}
          <div className="flex items-center gap-1 md:gap-4 shrink-0">
            {/* Account (Caché sur très petit mobile pour gagner de la place si besoin, ou gardé) */}
            <Link
              to="/compte"
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              <User size={22} strokeWidth={1.5} />
            </Link>

            {/* Cart */}
            <Link
              to="/panier"
              className="relative p-2 text-muted-foreground hover:text-foreground"
            >
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7C3AED] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 text-gray-700"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
=======
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
>>>>>>> b21562c5a17a893009007ba88af8856e1aa2ad46
