import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Pour rediriger après succès

export default function TwoFactorPageComponent() {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);
        if (element.value !== "" && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // --- APPEL API ICI ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalCode = otp.join("");
        
        if (finalCode.length < 6) {
            setError("Veuillez saisir les 6 chiffres.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('http://localhost:3000/api/auth/check-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: finalCode }), // Ton API attend "code"
            });

            const result = await response.json();

            if (response.ok) {
                console.log("Succès CYNA:", result);
                // Redirection vers le dashboard admin après succès
                navigate('/admin/dashboard'); 
            } else {
                setError(result.message || "Code invalide. Réessayez.");
            }
        } catch (err) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 max-w-md w-full flex flex-col items-center">
                
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Vérification CYNA</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Entrez le code de sécurité</p>

                <form onSubmit={handleSubmit} className="w-full">
                    <div className="flex justify-between gap-2 mb-4">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                ref={(el) => (inputRefs.current[index] = el)}
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={`w-12 h-14 text-center text-2xl font-bold bg-gray-50 dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white outline-none transition-all ${
                                    error ? 'border-red-500' : 'border-gray-200 dark:border-gray-600 focus:border-indigo-500'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Affichage de l'erreur */}
                    {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full h-12 rounded-full text-white font-medium shadow-lg transition-all duration-500 ${
                            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {isLoading ? 'Vérification en cours...' : 'Vérifier le code'}
                    </button>
                </form>
            </div>
        </div>
    );
}