import React, { useState, useCallback, FormEvent, useRef } from 'react';
import { askGeminiWithSearch, GeminiSearchResult } from './services/geminiService';
import type { Pledge, GroundingSource } from './types';

// SVG Icons defined as components for reusability
const VirusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
);

const MicroscopeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 18h8"></path><path d="M3 22h18"></path><path d="M14 22a7 7 0 1 0 0-14h-1"></path><path d="M9 14h2"></path><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"></path><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"></path></svg>
);

const FlaskConicalIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10.2 2.2c.2-.4.5-.7.8-.9.4-.2.8-.3 1.2-.3h.1c.4 0 .9.1 1.3.3.3.2.6.5.8.9l6 10.9c.2.4.3.8.3 1.3 0 .5-.1.9-.3 1.3-.2.4-.5.7-.8.9-.3.2-.7.3-1.2.3H4.8c-.5 0-.9-.1-1.2-.3-.4-.2-.6-.5-.8-.9-.2-.4-.3-.8-.3-1.3 0-.5.1-.9.3-1.3l6-10.9Z"></path><path d="M10 9h4"></path><path d="M10 13h4"></path><path d="M7 22h10"></path></svg>
);

const ShieldIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);

const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);

const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);

const BarChartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>
);

const LinkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
);

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

// --- Header Component ---
const Header = () => (
  <header className="bg-slate-900/80 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-all duration-300">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <VirusIcon className="text-sky-400 w-8 h-8"/>
        <h1 className="text-xl font-bold text-white tracking-wider">AMR Watch</h1>
      </div>
      <nav className="hidden md:flex space-x-6 text-sm font-medium">
        <a href="#crisis" className="hover:text-sky-400 transition-colors">The Crisis</a>
        <a href="#mechanisms" className="hover:text-sky-400 transition-colors">Mechanisms</a>
        <a href="#solutions" className="hover:text-sky-400 transition-colors">Solutions</a>
        <a href="#search" className="hover:text-sky-400 transition-colors">AI Search</a>
        <a href="#pledge" className="hover:text-sky-400 transition-colors">Pledge Wall</a>
      </nav>
    </div>
  </header>
);

// --- Hero Section ---
const HeroSection = () => (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
        <div className="absolute inset-0 bg-slate-900 z-10">
            <div className="absolute inset-0 opacity-10 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 text-center z-20">
            <h2 className="text-lg font-semibold text-sky-400 mb-2 tracking-widest animate-[fadeInUp_1s_ease-out]">WELCOME TO GROUP 11'S PROJECT</h2>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-4 leading-tight animate-[fadeInUp_1.2s_ease-out]">
                Antibiotic Resistance
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto animate-[fadeInUp_1.4s_ease-out]">The Hidden Enemy Threatening Modern Medicine</p>
            <a href="#crisis" className="bg-sky-500 text-white font-bold py-3 px-8 rounded-full hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 inline-block animate-[fadeInUp_1.6s_ease-out]">
                Discover The Threat
            </a>
        </div>
        <style>{`
            @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>
    </section>
);


// --- Stats Section ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; description: string; delay: number; }> = ({ icon, title, value, description, delay }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 transform hover:-translate-y-2 transition-transform duration-300 animate-[fadeIn_1s_ease-out] " style={{animationDelay: `${delay}ms`}}>
        <div className="flex items-center space-x-4 mb-4">
            <div className="bg-sky-500/10 p-3 rounded-full">{icon}</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-4xl font-bold text-sky-400 mb-2">{value}</p>
        <p className="text-slate-400 text-sm">{description}</p>
    </div>
);

const StatsSection = () => (
    <section id="crisis" className="py-20 bg-slate-900">
        <div className="container mx-auto px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white">The Global Crisis in Numbers</h2>
                <p className="text-slate-400 mt-2 max-w-2xl mx-auto">The silent pandemic is already here. The data reveals a startling reality.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <StatCard icon={<GlobeIcon className="w-8 h-8 text-sky-400"/>} title="Annual Deaths" value="1.27 Million+" description="Directly caused by AMR each year, contributing to nearly 5 million more. (The Lancet, 2022)" delay={200} />
                <StatCard icon={<BarChartIcon className="w-8 h-8 text-sky-400"/>} title="2050 Projection" value="10 Million" description="Potential annual deaths by 2050, surpassing cancer. (O'Neill Review)" delay={400} />
                <StatCard icon={<DollarSignIcon className="w-8 h-8 text-sky-400"/>} title="Economic Cost" value="$100 Trillion" description="Projected cost to the global economy by 2050 in lost productivity and healthcare. " delay={600}/>
            </div>
        </div>
         <style>{`
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `}</style>
    </section>
);

// --- Mechanisms Section ---
const MechanismCard: React.FC<{ title: string; description: string; visual: string; icon: React.ReactNode; }> = ({ title, description, visual, icon }) => (
  <div className="bg-slate-800 rounded-xl overflow-hidden group border border-slate-700 hover:border-sky-500 transition-all duration-300">
    <div className="p-6">
      <div className="flex items-center space-x-4 mb-4">
        <div className="bg-slate-700 p-3 rounded-lg group-hover:bg-sky-500/20 transition-colors duration-300">{icon}</div>
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <p className="text-slate-400 mb-4">{description}</p>
      <div className="bg-slate-900/50 p-4 rounded-md border border-slate-600">
        <p className="text-sm text-sky-300 font-mono"><span className="font-bold">Visual Metaphor:</span> {visual}</p>
      </div>
    </div>
  </div>
);

const MechanismsSection = () => (
  <section id="mechanisms" className="py-20 bg-slate-900/70">
    <div className="container mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white">How Bacteria Fight Back</h2>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Bacteria have evolved sophisticated biochemical strategies to survive our drugs.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <MechanismCard title="Enzymatic Inactivation" description="Bacteria produce enzymes like Beta-lactamases that chemically destroy antibiotics like penicillin before they can work." visual="An antibiotic molecule being sliced by a scissor-like enzyme. ✂️💊" icon={<FlaskConicalIcon className="w-8 h-8 text-sky-400" />} />
        <MechanismCard title="Target Site Modification" description="Bacteria alter the structure of the target (like Penicillin-Binding Proteins in MRSA), so the drug can no longer bind to it." visual="A lock (bacterial target) changes shape; the antibiotic key no longer fits. 🗝️🚫" icon={<ShieldIcon className="w-8 h-8 text-rose-400" />} />
        <MechanismCard title="Efflux Pumps" description="Protein pumps on the bacterial surface actively eject antibiotics from the cell, preventing them from reaching effective concentrations." visual="A bacterium with pumps spewing out antibiotic molecules. 🦠💦" icon={<MicroscopeIcon className="w-8 h-8 text-amber-400" />} />
        <MechanismCard title="Reduced Permeability" description="Gram-negative bacteria fortify their outer membrane, creating a wall that prevents antibiotics from getting inside the cell." visual="A fortified castle wall, with antibiotics bouncing off it. 🏰🛡️" icon={<VirusIcon className="w-8 h-8 text-emerald-400" />} />
      </div>
    </div>
  </section>
);


// --- Solutions Section ---
const SolutionsSection = () => {
    const [activeTab, setActiveTab] = useState('public');

    const tabs = {
        public: {
            label: "For You (The Public)",
            content: [
                "Only use antibiotics when prescribed by a certified health professional.",
                "Never demand antibiotics for a cold or the flu. They don't work on viruses.",
                "Always complete the full prescribed dose, even if you feel better.",
                "Never share or use leftover antibiotics.",
                "Prevent infections: Get vaccinated, wash hands regularly, and prepare food hygienically."
            ]
        },
        professionals: {
            label: "For Healthcare Professionals",
            content: [
                "Implement Antimicrobial Stewardship Programs (ASPs) to optimize antibiotic use.",
                "Use rapid diagnostics to identify if an infection is bacterial or viral.",
                "Enforce strict infection prevention and control measures, like hand hygiene."
            ]
        },
        policy: {
            label: "For Policy Makers & Industry",
            content: [
                "Ban the use of antibiotics for growth promotion in agriculture.",
                "Incentivize R&D for new antibiotics, vaccines, and alternative therapies.",
                "Fund and share data from global surveillance systems like GLASS."
            ]
        }
    };

    return (
        <section id="solutions" className="py-20 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">The Battle Plan: Our Solutions</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Fighting AMR requires a united effort from everyone, everywhere.</p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="flex border-b border-slate-700 mb-6">
                        {Object.entries(tabs).map(([key, { label }]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`flex-1 py-3 px-1 text-sm md:text-base font-medium transition-colors duration-300 ${activeTab === key ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-400 hover:text-white'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <ul className="space-y-4">
                            {tabs[activeTab as keyof typeof tabs].content.map((item, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="w-5 h-5 text-emerald-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};


// --- Gemini Search Section ---
const GeminiSearchSection = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<GeminiSearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const resultRef = useRef<HTMLDivElement>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        const searchResult = await askGeminiWithSearch(query);
        
        if(searchResult.text.includes("error")) {
            setError(searchResult.text);
        } else {
            setResult(searchResult);
        }
        
        setIsLoading(false);
        setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <section id="search" className="py-20 bg-slate-900/70">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Ask Gemini about AMR</h2>
                    <p className="text-slate-400 mt-2 max-w-2xl mx-auto">Get up-to-date information powered by Google Search grounding.</p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex items-center bg-slate-800 border border-slate-700 rounded-full p-2 shadow-lg">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., What are the newest treatments for MRSA?"
                        className="w-full bg-transparent text-white placeholder-slate-500 focus:outline-none px-4"
                        disabled={isLoading}
                    />
                    <button type="submit" className="bg-sky-500 text-white rounded-full p-3 hover:bg-sky-600 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300" disabled={isLoading}>
                        {isLoading ? (
                            <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            <SearchIcon className="w-6 h-6"/>
                        )}
                    </button>
                </form>

                <div ref={resultRef} className="mt-12 max-w-4xl mx-auto">
                    {error && <div className="bg-red-500/10 border border-red-500/30 text-red-300 p-4 rounded-lg">{error}</div>}
                    {result && (
                        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 animate-[fadeIn_0.5s_ease-out]">
                            <h3 className="text-xl font-bold text-white mb-4">Response:</h3>
                            <div className="prose prose-invert prose-p:text-slate-300 prose-strong:text-white max-w-none space-y-4" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br />') }} />

                            {result.sources && result.sources.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-700">
                                    <h4 className="text-lg font-semibold text-white mb-3">Sources:</h4>
                                    <ul className="space-y-2">
                                        {result.sources.filter(s => s.web).map((source, index) => (
                                            <li key={index} className="flex items-center">
                                                <LinkIcon className="w-4 h-4 text-sky-400 mr-2 flex-shrink-0"/>
                                                <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline truncate text-sm">
                                                    {source.web?.title || source.web?.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};


// --- Pledge Wall Section ---
const PledgeWall = () => {
    const [name, setName] = useState('');
    const [pledges, setPledges] = useState<Pledge[]>([
        { id: 1, name: 'Dr. Eleanor Vance' },
        { id: 2, name: 'Marcus Holloway' },
    ]);
    const [submitted, setSubmitted] = useState(false);

    const handlePledgeSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            setPledges(prev => [{ id: Date.now(), name: name.trim() }, ...prev]);
            setName('');
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 3000);
        }
    };

    return (
        <section id="pledge" className="py-20 bg-slate-900">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Join the Fight: Take the Pledge</h2>
                        <p className="text-slate-400 mb-6">Commit to being a guardian of modern medicine. Your pledge makes a difference.</p>
                        
                        <form onSubmit={handlePledgeSubmit} className="space-y-4">
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-slate-800 border border-slate-700 rounded-md p-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <button type="submit" className="w-full bg-emerald-500 text-white font-bold py-3 rounded-md hover:bg-emerald-600 transition-colors duration-300">
                                Sign the Pledge
                            </button>
                        </form>
                        {submitted && <p className="text-emerald-400 mt-4 text-center">Thank you for your commitment!</p>}
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 max-h-96 overflow-y-auto">
                        <h3 className="text-xl font-bold text-white mb-4 text-center">Antibiotic Guardians</h3>
                        <ul className="space-y-3">
                            {pledges.map(pledge => (
                                <li key={pledge.id} className="bg-slate-700/50 p-3 rounded-md text-center animate-[fadeIn_0.5s_ease-out]">
                                    <span className="font-medium text-slate-300">🦸‍♂️ {pledge.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- Footer Component ---
const Footer = () => (
    <footer className="bg-slate-900/50 border-t border-slate-800">
        <div className="container mx-auto px-6 py-6 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} Group 11. All Rights Reserved.</p>
            <p className="text-sm mt-1">Dedicated to raising awareness about the global threat of antibiotic resistance.</p>
        </div>
    </footer>
);


export default function App() {
  return (
    <div className="bg-slate-900">
        <Header />
        <main>
            <HeroSection />
            <StatsSection />
            <MechanismsSection />
            <SolutionsSection />
            <GeminiSearchSection />
            <PledgeWall />
        </main>
        <Footer />
    </div>
  );
}
