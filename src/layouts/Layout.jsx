import Footer from "../components/Home/Footer";
import Navbar from "../components/Home/Navbar";
import ChatBot from "../components/ui/ChatBot";

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--bg-base)" }}>
      {/* Lien d'évitement (accessibilité clavier) : visible au focus uniquement. */}
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <Navbar />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      {/* ChatBot : uniquement côté utilisateur (le layout admin ne l'inclut pas) */}
      <ChatBot />
    </div>
  );
}