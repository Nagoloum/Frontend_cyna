export default function InfoSection() {
  // Ce texte viendra de ton Back-Office (API)
  const messageImportant = {
    titre: "Bienvenue chez CYNA",
    contenu: "Leader en solutions de cybersécurité. En raison d'une forte demande, les délais d'audit sont actuellement de 48h."
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-8 text-center">
      <div className="bg-white border-l-4 border-[#8000FF] shadow-sm p-6 rounded-r-lg">
        <h3 className="text-[#3A3F51] text-xl font-bold mb-2">
          {messageImportant.titre}
        </h3>
        <p className="text-gray-600">
          {messageImportant.contenu}
        </p>
      </div>
    </section>
  );
}