import React, { useState } from "react";
import { motion } from "motion/react";
import { User, UserLevel } from "../types";
import { INITIAL_USERS } from "../data";
import ChurchLogo from "./ChurchLogo";
import { Shield, Mail, ArrowRight, UserCheck, UserPlus, LogIn, ArrowLeft, CheckCircle } from "lucide-react";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

interface SavedUser extends User {
  passwordHash: string;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserLevel>(UserLevel.PASTOR);
  const [emailOrPhone, setEmailOrPhone] = useState("pastor@igrejaviva.com.br");
  const [password, setPassword] = useState("123456");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<UserLevel>(UserLevel.MEMBRO);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!emailOrPhone.trim()) {
      setErrorMsg("Por favor, informe seu e-mail ou telefone.");
      return;
    }
    if (!password) {
      setErrorMsg("Por favor, digite sua senha.");
      return;
    }

    // Try finding in dynamically registered users from localStorage
    const localUsersRaw = localStorage.getItem("viva-saved-registered-users");
    let localUsers: SavedUser[] = [];
    if (localUsersRaw) {
      try {
        localUsers = JSON.parse(localUsersRaw);
      } catch (err) {
        console.error("Erro ao carregar banco de dados de usuários locais:", err);
      }
    }

    const matchedLocal = localUsers.find(
      (u) => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.email_or_phone === emailOrPhone
    );

    if (matchedLocal) {
      if (matchedLocal.passwordHash !== password) {
        setErrorMsg("Senha incorreta para esta conta.");
        return;
      }
      onLogin({
        id: matchedLocal.id,
        nome: matchedLocal.nome,
        email: matchedLocal.email,
        email_or_phone: matchedLocal.email_or_phone,
        nivel: matchedLocal.nivel,
        avatar: matchedLocal.avatar
      });
      return;
    }

    // Try finding in memory default users
    const matchedInitial = INITIAL_USERS.find(
      (u) => u.email.toLowerCase() === emailOrPhone.toLowerCase() || u.email_or_phone === emailOrPhone
    );

    if (matchedInitial) {
      // Default initial users have "123456" password or bullet character
      if (password !== "123456" && password !== "••••••••") {
        setErrorMsg("Senha incorreta para esta conta padrão de demonstração. Digite '123456'.");
        return;
      }
      onLogin(matchedInitial);
      return;
    }

    // If not found anywhere, check if they typed a simple new user
    if (emailOrPhone.includes("@") && password.length >= 4) {
      const autoRegisteredUser: User = {
        id: `usr-session-${Date.now()}`,
        nome: emailOrPhone.split("@")[0] || "Membro Convidado",
        email: emailOrPhone,
        email_or_phone: emailOrPhone,
        nivel: selectedRole
      };
      
      // Save for next logins automatically
      const updatedList = [
        ...localUsers,
        { ...autoRegisteredUser, passwordHash: password }
      ];
      localStorage.setItem("viva-saved-registered-users", JSON.stringify(updatedList));

      onLogin(autoRegisteredUser);
    } else {
      setErrorMsg("Usuário não cadastrado. Clique em 'Criar Conta' abaixo para criar seu perfil com senha.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMsg("Todos os campos de cadastro são de preenchimento obrigatório.");
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg("A senha deve conter pelo menos 4 caracteres.");
      return;
    }

    const localUsersRaw = localStorage.getItem("viva-saved-registered-users") || "[]";
    let localUsers: SavedUser[] = [];
    try {
      localUsers = JSON.parse(localUsersRaw);
    } catch (_) {}

    // Check conflict
    const conflictInitial = INITIAL_USERS.some(u => u.email.toLowerCase() === regEmail.toLowerCase());
    const conflictLocal = localUsers.some(u => u.email.toLowerCase() === regEmail.toLowerCase());

    if (conflictInitial || conflictLocal) {
      setErrorMsg("Este e-mail já está cadastrado no sistema.");
      return;
    }

    const newSavedUser: SavedUser = {
      id: `usr-${Date.now()}`,
      nome: regName.trim(),
      email: regEmail.trim(),
      email_or_phone: regEmail.trim(),
      nivel: regRole,
      passwordHash: regPassword,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
    };

    localUsers.push(newSavedUser);
    localStorage.setItem("viva-saved-registered-users", JSON.stringify(localUsers));

    setSuccessMsg("Conta criada com absoluto sucesso! Faça login abaixo.");
    setEmailOrPhone(regEmail.trim());
    setPassword(regPassword);
    setSelectedRole(regRole);
    setIsRegistering(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[40%] bg-emerald-100/40 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[40%] bg-blue-100/40 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 flex flex-col items-center">
        <ChurchLogo size={80} vertical={true} />
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegistering ? "Crie sua conta ministerial" : "Acesse a sua conta"}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-650 font-medium">
          {isRegistering ? "Faça parte da rede de comunhão e liderança inteligente" : "Gerenciamento inteligente para sua igreja local"}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10 animate-fade-in"
      >
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100 sm:px-10">
          
          {successMsg && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl font-bold flex items-center gap-2">
              <CheckCircle size={15} />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold">
              ⚠️ {errorMsg}
            </div>
          )}

          {!isRegistering ? (
            <div className="space-y-6">
              {/* Section: Role Selector */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 text-center mb-3">
                  Como você deseja acessar hoje?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect(UserLevel.PASTOR)}
                    className={`py-2 px-1 text-[10.5px] font-extrabold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === UserLevel.PASTOR
                        ? "bg-[#2E7D32] text-white border-[#2E7D32] shadow-3xs scale-102"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    💼 Pastor / Líder
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect(UserLevel.MEMBRO)}
                    className={`py-2 px-1 text-[10.5px] font-extrabold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === UserLevel.MEMBRO
                        ? "bg-[#1565C0] text-white border-[#1565C0] shadow-3xs scale-102"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⛪ Membro
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect(UserLevel.VISITANTE)}
                    className={`py-2 px-1 text-[10.5px] font-extrabold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === UserLevel.VISITANTE
                        ? "bg-amber-600 text-white border-amber-600 shadow-3xs scale-102"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    👋 Visitante
                  </button>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label htmlFor="auth-email-phone" className="block text-[10px] font-black uppercase tracking-wider text-slate-600">
                    E-mail ou Telefone
                  </label>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail size={15} />
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
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-xs font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <label htmlFor="auth-password" className="block text-[10px] font-black uppercase tracking-wider text-slate-600">
                      Senha Secreta
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("As contas de demonstração utilizam a senha '123456'. Novas contas criadas salvam sua senha no banco de dados local!"); }} className="text-[10px] text-blue-650 font-bold hover:underline">
                      Esqueceu?
                    </a>
                  </div>
                  <div className="mt-1 relative rounded-md">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Shield size={15} />
                    </div>
                    <input
                      id="auth-password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2E7D32] text-xs font-semibold"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-login"
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-[#2E7D32] hover:bg-[#1b5e20] transition-colors focus:ring-2 focus:ring-offset-2 cursor-pointer shadow-3xs"
                >
                  Iniciar Sessão como {selectedRole.split(" ")[0]}
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="text-center pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="text-xs text-blue-650 hover:underline font-extrabold inline-flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus size={14} />
                  Ainda não tem conta? Criar Conta
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <button 
                  onClick={() => setIsRegistering(false)} 
                  className="p-1 hover:bg-slate-100 rounded text-slate-500 cursor-pointer"
                  type="button"
                >
                  <ArrowLeft size={16} />
                </button>
                <span className="text-[10px] font-black uppercase text-slate-500">Cadastre seu Perfil Real</span>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">E-mail ou Telefone</label>
                  <input
                    type="text"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="exemplo@igrejaviva.com"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">Função que Deseja Exercer</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserLevel)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <option value={UserLevel.MEMBRO}>Membro da Igreja</option>
                    <option value={UserLevel.PASTOR}>Líder Ministerial / Pastor</option>
                    <option value={UserLevel.VISITANTE}>Visitante / Convidado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">Escolha uma Senha</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#1565C0] hover:bg-blue-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-3xs animate-fade-in"
                >
                  Registrar e Ir para Login
                </button>
              </form>
            </div>
          )}

          {/* Social login option shortcuts */}
          {!isRegistering && (
            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider mb-2.5">Acesso Exclusivo Demo</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    handleRoleSelect(UserLevel.PASTOR);
                    setTimeout(() => document.getElementById("btn-submit-login")?.click(), 300);
                  }}
                  className="flex-1 py-1.5 border border-slate-250/70 rounded-lg text-[9.5px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  Controle Pastor
                </button>
                <button
                  onClick={() => {
                    handleRoleSelect(UserLevel.MEMBRO);
                    setTimeout(() => document.getElementById("btn-submit-login")?.click(), 300);
                  }}
                  className="flex-1 py-1.5 border border-slate-250/70 rounded-lg text-[9.5px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  Painel Membro
                </button>
              </div>
            </div>
          )}

          {/* Extra info container */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-start gap-2 text-[10.5px] text-slate-600 leading-normal bg-amber-50/50 p-3 rounded-xl border border-amber-100/40">
            <UserCheck className="text-amber-600 shrink-0 mt-0.5" size={15} />
            <span>
              <strong>Autenticação Real Ativa:</strong> Seus cadastros são salvos localmente e os cookies/sessões persistem ao recarregar a visualização!
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
