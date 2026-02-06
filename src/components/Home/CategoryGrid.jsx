const categories = [
  { id: 1, name: "Logiciels", image: "img_software.jpg" },
  { id: 2, name: "Hardware", image: "img_hardware.jpg" },
  { id: 3, name: "Audits", image: "img_security.jpg" },
  { id: 4, name: "Accessoires", image: "img_usb.jpg" },
];

export default function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-[#3A3F51] mb-6 border-b pb-2 border-gray-200">
        Nos Univers
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="group cursor-pointer">
            {/* Image personnalisable */}
            <div className="h-40 rounded-xl overflow-hidden shadow-md relative">
              <div className="absolute inset-0 bg-[#3A3F51]/20 group-hover:bg-[#8000FF]/20 transition z-10"></div>
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            {/* Nom de la catégorie */}
            <p className="text-center font-bold text-[#3A3F51] mt-3 group-hover:text-[#8000FF] transition">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}