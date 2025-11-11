import { useState } from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  onLoginClick: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const [language, setLanguage] = useState("EN");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/20 backdrop-blur-md border-b border-[#212832]">
      <div className="container mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link
          to="/"
          className="text-[#12953A] font-['Gravitas_One'] text-[2.53125rem] sm:text-[2.8125rem] font-normal z-50"
        >
          NutriWise
        </Link>

        <button
          className="lg:hidden z-50 text-[#181E4B]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          )}
        </button>

        <nav className={`
          ${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex
          flex-col lg:flex-row
          items-center gap-6 lg:gap-12 xl:gap-16
          absolute lg:relative
          top-full lg:top-0 left-0 right-0
          bg-white/95 lg:bg-transparent
          backdrop-blur-md lg:backdrop-blur-none
          p-6 lg:p-0
          shadow-lg lg:shadow-none
        `}>
          <button
            onClick={() => handleScrollTo('features')}
            className="text-[#212832] font-['ABeeZee'] text-[15px] font-normal hover:text-[#12953A] transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => handleScrollTo('how-it-works')}
            className="text-[#212832] font-['Helvetica_Neue',sans-serif] text-[15px] font-medium hover:text-[#12953A] transition-colors"
          >
            How it works
          </button>
          <button
            onClick={() => handleScrollTo('about')}
            className="text-[#212832] font-['Helvetica_Neue',sans-serif] text-[15px] font-medium hover:text-[#12953A] transition-colors"
          >
            About
          </button>
          
          <button
            onClick={() => {
              onLoginClick();
              setIsMobileMenuOpen(false);
            }}
            className="px-5 py-2 rounded border border-[#181E4B] text-[#212832] font-['Helvetica_Neue',sans-serif] text-[15px] font-medium hover:bg-[#181E4B] hover:text-white transition-colors"
          >
            Sign up
          </button>

          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-[#212832] font-['Helvetica_Neue',sans-serif] text-[15px] font-medium">
              {language}
            </span>
            <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.318848 0.319092L4.37959 4.37984L8.44034 0.319092" stroke="#212832" strokeWidth="0.902388"/>
            </svg>
          </div>
        </nav>
      </div>
    </header>
  );
}
