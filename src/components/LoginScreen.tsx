import React, { useState } from "react";
import { motion } from "motion/react";
import { User, UserLevel } from "../types";
import { INITIAL_USERS } from "../data";
import ChurchLogo from "./ChurchLogo";
import { Shield, Mail, Smartphone, ArrowRight, UserCheck } from "lucide-react";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [selectedRole, setSelectedRole] = useState<UserLevel>(UserLevel.PASTOR);
  const [emailOrPhone, setEmailOrPhone] = useState("pastor@igrejaviva.com.br");
  const [password, setPassword] = useState("••••••••");
  const [errorMsg, setErrorMsg] = useState("");

  // Handler for custom role toggle inside login
  const handleRoleSelect = (role: UserLevel) => {
    setSelectedRole(role);
    // Auto populate the fields based on configuration
    const mappedUser = INITIAL_USERS.find((u) => u.nivel === role);
    if (mappedUser) {
      setEmailOrPhone(mappedUser.email);
      setPassword("123456");
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setErrorMsg("Por favor, informe seu e-mail ou telefone.");
      return;
    }

    // Find custom simulated user match
    const userToLogin = INITIAL_USERS.find(
      (u) =>
        u.nivel === selectedRole &&
        (u.email.toLowerCase() === emailOrPhone.toLowerCase() ||
          u.email_or_phone === emailOrPhone)
    ) || {
      id: "usr-custom",
      nome: emailOrPhone.split("@")[0] || "Usuário Convidado",
      email: emailOrPhone,
      email_or_phone: emailOrPhone,
      nivel: selectedRole,
    };

    onLogin(userToLogin);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%] bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[40%] bg-blue-100/40 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 flex flex-col items-center">
        <ChurchLogo size={90} vertical={true} />
        <h2 className="mt-8 text-3xl font-extrabold text-slate-900 tracking-tight">
          Acesse a sua conta
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Gerenciamento ministerial inteligente para sua igreja
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          {/* Section: Role Selector (Como você deseja acessar?) */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 text-center mb-3">
              Como você deseja acessar hoje?
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect(UserLevel.PASTOR)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                  selectedRole === UserLevel.PASTOR
                    ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-sm transform scale-[1.03]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                💼 Pastor / Líder
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect(UserLevel.MEMBRO)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                  selectedRole === UserLevel.MEMBRO
                    ? "bg-[#1565C0] text-white border-[#1565C0] shadow-sm transform scale-[1.03]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                ⛪ Membro
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect(UserLevel.VISITANTE)}
                className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                  selectedRole === UserLevel.VISITANTE
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm transform scale-[1.03]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                👋 Visitante
              </button>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label htmlFor="auth-email-phone" className="block text-xs font-medium text-slate-700 uppercase tracking-wider">
                E-mail ou Telefone
              </label>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="auth-email-phone"
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    setErrorMsg("");
                  }}
                  placeholder="exemplo@igrejaviva.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700 uppercase tracking-wider">
                  Senha Secreta
                </label>
                <a href="#forgot" className="text-xs text-blue-600 hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <div className="mt-1 relative rounded-md shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Shield size={16} />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/50 focus:border-emerald-600 text-sm"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs font-medium text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                ⚠️ {errorMsg}
              </p>
            )}

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#2E7D32] hover:bg-[#1b5e20] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
            >
              Iniciar Sessão como {selectedRole.split(" ")[0]}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Social Sign In (Mock Options) */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-400 font-medium">Ou conecte rápido via</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoginSubmit({ preventDefault: () => {} } as any)}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer hover:border-slate-300"
              >
                Google Auth
              </button>
              <button
                type="button"
                onClick={() => handleLoginSubmit({ preventDefault: () => {} } as any)}
                className="w-full inline-flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer hover:border-slate-300"
              >
                WhatsApp Login
              </button>
            </div>
          </div>

          {/* Extra hints for church leaders to make app look professional */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-600 leading-normal bg-amber-50/50 p-3 rounded-xl border border-amber-100/40">
            <UserCheck className="text-amber-600 shrink-0" size={16} />
            <span>
              <strong>Dica rápida:</strong> Clique nas abas de papéis acima para carregar automaticamente perfis reais de teste e explorar todas as permissões.
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
