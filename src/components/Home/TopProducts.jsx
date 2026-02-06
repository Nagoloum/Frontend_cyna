const topProducts = [
  { id: 101, name: "Serveur Rack V2", image: "srv.jpg" },
  { id: 102, name: "Licence Antivirus Pro", image: "av.jpg" },
  { id: 103, name: "Casque VR Security", image: "vr.jpg" },
  { id: 104, name: "Firewall Physique", image: "fw.jpg" },
];

export default function TopProducts() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8 mb-12">
      {/* Titre imposé par le CDCF */}
      <h2 className="text-3xl font-bold text-center text-[#3A3F51] mb-10">
        Les Top Produits du moment
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {topProducts.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-xl shadow hover:shadow-xl transition border border-gray-100">
            {/* Format simple : Image + Nom comme demandé */}
            <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center">
              <img src={product.image} alt={product.name} className="max-h-full max-w-full" />
            </div>
            
            <h3 className="text-lg font-bold text-[#3A3F51] text-center truncate">
              {product.name}
            </h3>
            
            {/* Petit ajout UX (optionnel mais conseillé pour la vente) */}
            <button className="w-full mt-4 text-[#8000FF] font-semibold text-sm border border-[#8000FF] rounded py-1 hover:bg-[#8000FF] hover:text-white transition">
              Voir le produit
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}