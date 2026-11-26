import React from "react";
import { Link } from "react-router-dom";

const AuthNavbar = ({ pageType = "login" }) => {
  return (
    <header className="sticky top-0 z-30 w-full h-[74px] bg-[#fafbf9]/90 backdrop-blur-md border-b border-[#1d2d22]/[0.09] px-6 lg:px-11 flex items-center justify-between select-none shrink-0">
      <Link
        to="/"
        className="inline-flex items-center gap-[5px] text-[#111111] text-[21px] font-bold tracking-[-0.01em] leading-none hover:opacity-85 transition-opacity"
        aria-label="InterviewOS home"
      >
        InterviewOS
        <span
          className="inline-block w-[8px] h-[17px] bg-[#00c875]"
          aria-hidden="true"
        />
      </Link>

      <div className="flex items-center gap-5">
        <Link
          to="/support"
          className="hidden sm:inline-block text-[14px] text-[#414740] hover:text-[#00884f] transition-colors"
        >
          Support
        </Link>

        {pageType === "login" && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[14px] text-[#707870]">
              New to InterviewOS?
            </span>
            <Link
              to="/register"
              className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-full bg-[#080a09] hover:bg-[#242925] text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        )}

        {pageType === "register" && (
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-[14px] text-[#707870]">
              Already have an account?
            </span>
            <Link
              to="/login"
              className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-full border border-[#111111] bg-transparent hover:bg-[#eef5ef] text-[#111111] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
            >
              Log In
            </Link>
          </div>
        )}

        {(pageType === "forgot" || pageType === "reset") && (
          <Link
            to="/login"
            className="inline-flex items-center justify-center min-h-[40px] px-5 rounded-full border border-[#111111] bg-transparent hover:bg-[#eef5ef] text-[#111111] text-[13px] font-semibold transition-all hover:-translate-y-0.5"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
};

export default AuthNavbar;
