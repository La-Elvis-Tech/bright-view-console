
import { useEffect, memo } from "react";
import { useLocation } from "react-router-dom";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({ 
  showSpinner: false,
  minimum: 0.1,
  easing: 'ease',
  speed: 200
});

export const LoadingBar = memo(() => {
  const location = useLocation();
  
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 150);
    
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location]);

  return null;
});

LoadingBar.displayName = 'LoadingBar';
