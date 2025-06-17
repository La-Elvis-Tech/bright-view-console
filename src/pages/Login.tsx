
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useTheme } from '../hooks/use-theme';
import { User, Lock } from 'lucide-react';
// Importação do gradiente animado
import { BgradientAnim } from "@/components/soft-gradient-background-animation";

export const Login = () => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useAuthContext();
  const { theme } = useTheme();
  const nav = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      const { data, error } = await signIn(u, p);
      
      if (error) {
        setError(true);
        setErrorMessage(error.message || 'Erro no login. Verifique suas credenciais.');
      } else if (data) {
        nav('/', { replace: true });
      }
    } catch (err: any) {
      setError(true);
      setErrorMessage(err.message || 'Erro no login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Gradiente animado customizado */}
      <BgradientAnim
        className="absolute inset-0 z-0"
        animationDuration={8}
      />

      {/* Login Form Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {/* Logo/Brand Area */}
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg p-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gradient-to-r from-blue-600 to-blue-700'
            }`}>
              <img 
                src="/logolaelvis.svg" 
                alt="La Elvis Tech" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className={`text-4xl font-bold font-michroma mb-2 ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-clip-text text-transparent'
            }`}>
              La Elvis Tech
            </h1>
            <p className={`text-sm px-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Sistema de Gestão Laboratorial desenvolvido para Dasa</p>
          </div>

          {/* Login Card */}
          <div className={`backdrop-blur-lg rounded-3xl shadow-2xl p-8 border ${
            theme === 'dark'
              ? 'bg-white/10 border-white/20'
              : 'bg-white/70 border-blue-200/50'
          }`}>
            {/* Decorative top border */}
            <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-1 rounded-full ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}></div>

            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Bem-vindo de Volta!
                </h2>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>Faça login na sua conta</p>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                {/* Username */}
                <div className="group">
                  <label
                    htmlFor="username"
                    className={`block text-sm font-medium mb-2 transition-all duration-300 group-focus-within:text-blue-500 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="username"
                      type="email"
                      className={`w-full pl-12 py-4 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/50 border-blue-200/50 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                      placeholder="seu@email.com"
                      value={u}
                      onChange={e => setU(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className={`block text-sm font-medium mb-2 transition-all duration-300 group-focus-within:text-blue-500 ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    }`}
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      className={`w-full pl-12 py-4 backdrop-blur-sm border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 ${
                        theme === 'dark'
                          ? 'bg-white/10 border-white/20 text-white placeholder-gray-500 focus:border-blue-500'
                          : 'bg-white/50 border-blue-200/50 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                      }`}
                      placeholder="••••••••"
                      value={p}
                      onChange={e => setP(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 transition-colors ${
                        theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm p-4 bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {errorMessage || 'Credenciais inválidas. Por favor, tente novamente.'}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.98] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Carregando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="text-center">
                <a
                  href="#forgot-password"
                  className="text-blue-500 hover:text-blue-400 hover:underline transition-colors text-sm flex items-center justify-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Esqueceu a senha?
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className={`text-center mt-8 text-sm ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-300'
          }`}>
            <p>&copy; 2025 DASA Labs. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
