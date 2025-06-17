
import React, { useState, useEffect, useRef, memo } from "react";
import { Outlet } from "react-router-dom";
import { gsap } from "gsap";
import Sidebar from "./Sidebar.tsx";
import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useIsMobile } from "../hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "/logolaelvis.svg";

const MobileHeader = memo(() => (
  <div className="fixed top-0 left-0 right-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm shadow-sm py-0.5">
    <div className="flex items-center justify-between px-4 h-14 ">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu
                size={24}
                className="text-gray-700 dark:text-gray-300"
              />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[270px]">
            <Sidebar isCollapsed={false} toggleSidebar={() => {}} />
          </SheetContent>
        </Sheet>
      </div>
      <div className="w-10 h-10 bg-gradient-to-r from-blue-500/50 to-purple-600/20 rounded-lg flex items-center justify-center shadow-sm">
        <img src={Logo} alt="Logo" className="w-5 h-5" />
      </div>
      <h1 className="-ml-4 font-michroma text-lg font-semibold text-lab-blue dark:text-white ">
        La Elvis Tech
      </h1>
      <div className=" rounded-md flex items-center mr-2">
          <ThemeToggle />
      </div>
    </div>
  </div>
));

MobileHeader.displayName = 'MobileHeader';

const Layout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainContentRef.current || isMobile) return;

    // Simplified animation for better performance
    if (mainContentRef.current) {
      mainContentRef.current.style.paddingLeft = isCollapsed ? "80px" : "260px";
      mainContentRef.current.style.transition = "padding-left 0.1s ease-out";
    }
  }, [isCollapsed, isMobile]);

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen w-full transition-colors duration-300 relative bg-gradient-to-br from-white via-violet-500/30 to-fuchsia-500/30 dark:bg-gradient-to-br dark:from-neutral-700/90 dark:to-black/25">
      {/* Mobile Header */}
      {isMobile && <MobileHeader />}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="fixed left-0 top-0 z-30 h-full">
          <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
        </div>
      )}

      {/* Main Content */}
      <div
        ref={mainContentRef}
        className="flex-1 overflow-auto"
        style={{
          paddingTop: isMobile ? "56px" : "0px",
          paddingLeft: isMobile ? "0px" : isCollapsed ? "80px" : "260px",
        }}
      >
        <div className="p-4 sm:p-6 min-h-full sm:ml-0 md:ml-4 xl:ml-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default memo(Layout);
