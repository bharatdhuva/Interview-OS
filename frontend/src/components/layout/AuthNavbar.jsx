import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Globe, HelpCircle } from "lucide-react";

const AuthNavbar = ({ pageType = "login" }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Searching for: "${searchQuery}" - Search features are coming soon!`);
  };

  return (
    <header className="w-full h-16 bg-white border-b border-[#bfcaba]/20 flex items-center justify-between px-6 lg:px-12 select-none z-30 shrink-0">
      {/* Brand Logo (Always visible green on the left) */}
      <Link to="/" className="flex items-center gap-2 text-[#0d631b] font-bold text-lg lg:text-xl tracking-tight hover:opacity-90 transition-opacity">
        <span className="material-symbols-outlined text-[#0d631b] text-2xl">terminal</span>
        <span className="font-extrabold" style={{ fontFamily: "'Montserrat', sans-serif" }}>InterviewOS</span>
      </Link>

      {/* Right Section Links & Search */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Mock Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative">
          <Search size={14} className="absolute left-3 text-[#40493d]/60 pointer-events-none" />
          <input 
            type="text" 
            placeholder="Search docs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 w-40 sm:w-48 rounded-full border border-[#bfcaba]/30 text-xs bg-[#f8faf8] focus:outline-none focus:border-[#0d631b] focus:ring-1 focus:ring-[#0d631b] text-[#191c1b] transition-all"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          />
        </form>

        {/* Support Link */}
        <a 
          href="mailto:support@interviewos.io?subject=InterviewOS%20Support%20Request" 
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#40493d] hover:text-[#0d631b] transition-colors"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          <HelpCircle size={14} className="opacity-80 shrink-0" />
          <span>Support</span>
        </a>

        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#40493d] hover:text-[#0d631b] transition-colors bg-transparent border-none outline-none cursor-pointer"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <Globe size={14} className="opacity-80 shrink-0" />
            <span>English</span>
            <span className="material-symbols-outlined text-[16px] leading-none">expand_more</span>
          </button>
          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-[#bfcaba]/20 rounded-xl shadow-lg py-1 z-50 text-xs text-[#191c1b] font-medium">
              <button type="button" onClick={() => setShowLangDropdown(false)} className="w-full text-left px-3 py-2 hover:bg-[#e8f5e9]/50 hover:text-[#0d631b] transition-colors bg-transparent border-none cursor-pointer">English (US)</button>
              <button type="button" onClick={() => setShowLangDropdown(false)} className="w-full text-left px-3 py-2 hover:bg-[#e8f5e9]/50 hover:text-[#0d631b] transition-colors bg-transparent border-none cursor-pointer">日本語</button>
              <button type="button" onClick={() => setShowLangDropdown(false)} className="w-full text-left px-3 py-2 hover:bg-[#e8f5e9]/50 hover:text-[#0d631b] transition-colors bg-transparent border-none cursor-pointer">Deutsch</button>
            </div>
          )}
        </div>

        {/* Dynamic Auth CTA Link */}
        <div className="text-xs sm:text-sm font-medium" style={{ fontFamily: "'Montserrat', sans-serif" }}>
          {pageType === "login" && (
            <>
              <span className="text-[#40493d]/80 mr-1.5 hidden xs:inline">Don't have an account?</span>
              <Link to="/register" className="font-bold text-[#0d631b] hover:underline">
                Sign Up
              </Link>
            </>
          )}
          {pageType === "register" && (
            <>
              <span className="text-[#40493d]/80 mr-1.5 hidden xs:inline">Already have an account?</span>
              <Link to="/login" className="font-bold text-[#0d631b] hover:underline">
                Sign In
              </Link>
            </>
          )}
          {(pageType === "forgot" || pageType === "reset") && (
            <Link to="/login" className="font-bold text-[#0d631b] hover:underline">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default AuthNavbar;
