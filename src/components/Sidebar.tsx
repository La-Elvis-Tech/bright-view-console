import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { 
  LayoutDashboard, 
  Package, 
  Calendar, 
  CalendarCheck, 
  BarChart3, 
  Settings, 
  AlertTriangle, 
  Play,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const { signOut, user } = useAuthContext();
  const { theme } = useTheme();
  
  const sidebarRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const userInfoRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Package, label: 'Inventário', path: '/inventory' },
    { icon: Calendar, label: 'Exames', path: '/requests' },
    { icon: CalendarCheck, label: 'Agendamentos', path: '/orders' },
    { icon: AlertTriangle, label: 'Alertas', path: '/alerts' },
    { icon: Play, label: 'Simulações', path: '/simulations' },
    { icon: BarChart3, label: 'Relatórios', path: '/reports' },
    { icon: Users, label: 'Usuários', path: '/users' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  // Main sidebar animation
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        width: isCollapsed ? '80px' : '280px',
        duration: 0.4,
        ease: "power3.out"
      });
    }
  }, [isCollapsed]);

  // Logo animations
  useEffect(() => {
    const tl = gsap.timeline();
    
    if (isCollapsed) {
      // Collapsing: hide text first, then center logo
      tl.to(logoTextRef.current, {
        opacity: 0,
        scale: 0.8,
        duration: 0.2,
        ease: "power2.out"
      })
      .to(logoContainerRef.current, {
        justifyContent: 'center',
        duration: 0.3,
        ease: "power3.out"
      }, "-=0.1");
    } else {
      // Expanding: move logo to left, then show text
      tl.to(logoContainerRef.current, {
        justifyContent: 'flex-start',
        duration: 0.3,
        ease: "power3.out"
      })
      .to(logoTextRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.2,
        ease: "power2.out"
      }, "-=0.1");
    }
  }, [isCollapsed]);

  // User info animation
  useEffect(() => {
    if (userInfoRef.current) {
      if (isCollapsed) {
        gsap.to(userInfoRef.current, {
          opacity: 0,
          height: 0,
          padding: 0,
          margin: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(userInfoRef.current, {
          opacity: 1,
          height: 'auto',
          padding: '12px',
          margin: '0 0 16px 0',
          duration: 0.4,
          delay: 0.2,
          ease: "power2.out"
        });
      }
    }
  }, [isCollapsed]);

  // Initial menu items animation
  useEffect(() => {
    menuItemsRef.current.forEach((item, index) => {
      if (item) {
        gsap.fromTo(item, 
          { 
            opacity: 0, 
            x: -30,
            scale: 0.9
          },
          { 
            opacity: 1, 
            x: 0,
            scale: 1,
            duration: 0.4,
            delay: index * 0.08,
            ease: "back.out(1.7)"
          }
        );
      }
    });
  }, []);

  // Enhanced menu item hover animations
  const handleMenuItemHover = (element: HTMLElement, isEntering: boolean) => {
    const icon = element.querySelector('.menu-icon');
    const text = element.querySelector('.menu-text');
    
    if (isEntering) {
      gsap.to(element, {
        scale: isCollapsed ? 1.05 : 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
      
      if (icon) {
        gsap.to(icon, {
          scale: 1.1,
          rotation: 5,
          duration: 0.3,
          ease: "back.out(1.7)"
        });
      }
      
      if (text && !isCollapsed) {
        gsap.to(text, {
          x: 5,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    } else {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      if (icon) {
        gsap.to(icon, {
          scale: 1,
          rotation: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
      
      if (text) {
        gsap.to(text, {
          x: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }
  };

  return (
    <div 
      ref={sidebarRef}
      className={`${
        theme === 'dark'
          ? 'bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-gray-800/50'
          : 'bg-gradient-to-b from-white via-gray-50 to-gray-100 border-gray-200/50'
      } h-screen fixed left-0 top-0 z-50 flex flex-col border-r backdrop-blur-xl shadow-2xl ${
        theme === 'dark' ? 'text-white' : 'text-gray-800'
      } transition-all duration-400`}
      style={{ width: isCollapsed ? '80px' : '280px' }}
    >
      {/* Header com logo */}
      <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b ${
        theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'
      } transition-all duration-300`}>
        <div 
          ref={logoContainerRef}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-700 to-gray-800'
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <img 
                src="/logolaelvis.svg" 
                alt="La Elvis Tech" 
                className={`${isCollapsed ? 'w-5 h-5' : 'w-6 h-6'} transition-all duration-300`}
              />
            </div>
            {!isCollapsed && (
              <div 
                ref={logoTextRef}
                className="transition-all duration-300 overflow-hidden"
              >
                <h1 className="text-lg font-bold font-michroma whitespace-nowrap">La Elvis Tech</h1>
                <p className={`text-xs whitespace-nowrap ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Sistema de Gestão
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Botão de toggle movido para baixo do logo */}
        <div className="mt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className={`${
              theme === 'dark'
                ? 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200/50'
            } transition-all duration-200 rounded-lg ${isCollapsed ? 'w-8 h-8 p-0' : 'w-full'}`}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!isCollapsed && <span className="ml-2 text-sm">Recolher</span>}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 p-2">
        <nav>
          <ul className={`${isCollapsed ? 'space-y-2' : 'space-y-1'} `}>
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li 
                  key={item.path}
                  ref={el => menuItemsRef.current[index] = el}
                  className={`${isCollapsed ? 'px-1' : 'px-2'} transition-all duration-300`}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'} rounded-xl transition-all duration-300 group relative overflow-hidden ${
                      isActive 
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-gray-800/60 to-gray-700/60 text-white border border-gray-600/40 shadow-lg'
                          : 'bg-gradient-to-r from-gray-200/80 to-gray-100/80 text-gray-800 border border-gray-300/40 shadow-lg'
                        : theme === 'dark'
                          ? 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/40 hover:to-gray-700/40'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-gray-100/60 hover:to-gray-50/60'
                    }`}
                    onMouseEnter={(e) => handleMenuItemHover(e.currentTarget, true)}
                    onMouseLeave={(e) => handleMenuItemHover(e.currentTarget, false)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Efeito de brilho no hover */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-transparent ${
                      theme === 'dark' ? 'via-gray-600/10' : 'via-gray-400/10'
                    } to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000`} />
                    
                    <div className={`menu-icon ${isCollapsed ? 'p-1' : 'p-2'} rounded-lg flex-shrink-0 transition-all duration-300 ${
                      isActive 
                        ? theme === 'dark'
                          ? 'bg-gray-700/40'
                          : 'bg-gray-300/40'
                        : theme === 'dark'
                          ? 'group-hover:bg-gray-700/30'
                          : 'group-hover:bg-gray-200/40'
                    }`}>
                      <Icon size={isCollapsed ? 18 : 20} />
                    </div>
                    {!isCollapsed && (
                      <span className="menu-text font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Indicador de ativo */}
                    {isActive && (
                      <div className={`absolute right-0 w-1 h-9 rounded-l-full ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-neutral-300'
                      }`} />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </ScrollArea>

      {/* User info e logout */}
      <div className={`${isCollapsed ? 'p-2' : 'p-4'} border-t transition-all duration-300 ${
        theme === 'dark' ? 'border-gray-800/50' : 'border-gray-200/50'
      }`}>
        {user && !isCollapsed && (
          <div 
            ref={userInfoRef}
            className={`mb-4 p-3 rounded-xl overflow-hidden transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gray-800/50 border border-gray-700/50'
                : 'bg-gray-100/50 border border-gray-200/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {user.email}
                </p>
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Usuário ativo
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className={`ml-2 p-1 h-auto w-auto ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-500/10'
                } transition-all duration-200`}
                title="Sair"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        )}
        
        {/* Botão de logout para sidebar colapsada */}
        {isCollapsed && (
          <Button
            variant="ghost"
            onClick={signOut}
            className={`w-full justify-center p-2 rounded-xl transition-all duration-300 ${
              theme === 'dark'
                ? 'text-gray-300 hover:text-red-400 hover:bg-red-500/10 border border-gray-700/50 hover:border-red-500/30'
                : 'text-gray-600 hover:text-red-600 hover:bg-red-500/10 border border-gray-200/50 hover:border-red-400/30'
            }`}
            title="Sair"
          >
            <LogOut size={18} className="flex-shrink-0" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
