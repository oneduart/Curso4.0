import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { 
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
  signOut, onAuthStateChanged, updateProfile 
} from "firebase/auth";
import { 
  getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, 
  collection, getDocs 
} from "firebase/firestore";
import { 
  Monitor, Cpu, Mouse, Layout, Keyboard, FileText, Presentation, Table, 
  ShieldCheck, Trophy, ChevronDown, ChevronUp, BookOpen, Clock, 
  CheckCircle, Dices, Menu, Play, X, ArrowRight, ArrowLeft, Star,
  User, Lock, Award, Printer, LogOut, Users, School
} from 'lucide-react';

// --- 🔴 CONFIGURAÇÃO DO FIREBASE ---
// Substitua os valores abaixo pelos que você pegou no console do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKMNklM6lOAUqmOyGR9m3rQb3DfcmStH8",
  authDomain: "cursoinfo-b829d.firebaseapp.com",
  projectId: "cursoinfo-b829d",
  storageBucket: "cursoinfo-b829d.firebasestorage.app",
  messagingSenderId: "794931610541",
  appId: "1:794931610541:web:3dcd34d48f80b54398d724"
};

// Inicializando Firebase com tratamento de erro básico
let auth, db;
try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Erro Firebase: Provavelmente as chaves não foram configuradas no código.");
}

// --- DADOS DO CURSO ---
const courseData = {
  info: { title: "Informática Kids", modulesCount: 10 },
  modules: [
    {
      id: 1, title: "Introdução à Informática", duration: "2h", icon: <Monitor size={24} />, color: "bg-blue-100 text-blue-600 border-blue-200", description: "O básico sobre computadores.",
      slides: [
        { title: "O que é Informática?", type: "theory", content: ["Informática é a ciência da informação.", "Usamos computadores para criar e guardar coisas."] },
        { title: "Hardware vs Software", type: "concept", content: ["HARDWARE: O que você chuta (físico).", "SOFTWARE: O que você xinga (programas)."] },
        { title: "Atividade Prática", type: "activity", content: ["Liste 3 eletrônicos da sua casa e diga se têm tela."] }
      ]
    },
    {
      id: 2, title: "Hardware do Computador", duration: "4h", icon: <Cpu size={24} />, color: "bg-purple-100 text-purple-600 border-purple-200", description: "Peças do computador.",
      slides: [
        { title: "Gabinete e CPU", type: "theory", content: ["Gabinete é a caixa. CPU é o cérebro."] },
        { title: "Memória RAM", type: "concept", content: ["RAM é a mesa de trabalho. Apaga quando desliga."] },
        { title: "Atividade", type: "activity", content: ["Desenhe um computador e aponte onde fica o cérebro."] }
      ]
    },
    { id: 3, title: "Periféricos", duration: "3h", icon: <Mouse size={24} />, color: "bg-orange-100 text-orange-600 border-orange-200", description: "Mouse, Teclado e mais.", slides: [{ title: "Entrada e Saída", type: "theory", content: ["Teclado envia dados (Entrada). Monitor mostra dados (Saída)."] }] },
    { id: 4, title: "Sistema Operacional", duration: "4h", icon: <Layout size={24} />, color: "bg-sky-100 text-sky-600 border-sky-200", description: "Dominando o Windows.", slides: [{ title: "Área de Trabalho", type: "theory", content: ["É sua mesa digital. Organize seus ícones."] }] },
    { id: 5, title: "Digitação Mágica", duration: "2h", icon: <Keyboard size={24} />, color: "bg-green-100 text-green-600 border-green-200", description: "Digitando rápido.", slides: [{ title: "Posição das Mãos", type: "activity", content: ["Coloque os indicadores nas teclas F e J."] }] },
    { id: 6, title: "Word: O Escritor", duration: "4h", icon: <FileText size={24} />, color: "bg-indigo-100 text-indigo-600 border-indigo-200", description: "Criando textos.", slides: [{ title: "Formatando", type: "concept", content: ["Negrito, Itálico e Cores deixam o texto bonito."] }] },
    { id: 7, title: "PowerPoint", duration: "3h", icon: <Presentation size={24} />, color: "bg-rose-100 text-rose-600 border-rose-200", description: "Apresentações.", slides: [{ title: "Slides", type: "theory", content: ["Pouco texto e muita imagem!"] }] },
    { id: 8, title: "Excel Básico", duration: "3h", icon: <Table size={24} />, color: "bg-emerald-100 text-emerald-600 border-emerald-200", description: "Planilhas.", slides: [{ title: "Células", type: "concept", content: ["Linhas (Números) e Colunas (Letras)."] }] },
    { id: 9, title: "Segurança", duration: "2h", icon: <ShieldCheck size={24} />, color: "bg-yellow-100 text-yellow-600 border-yellow-200", description: "Navegação Segura.", slides: [{ title: "Senhas", type: "theory", content: ["Não use 123456! Misture letras e números."] }] },
    { id: 10, title: "Projeto Final", duration: "Fim", icon: <Trophy size={24} />, color: "bg-amber-100 text-amber-600 border-amber-200", description: "Formatura.", slides: [{ title: "Entrega", type: "activity", content: ["Crie uma pasta com seu nome e salve seus trabalhos."] }] }
  ]
};

// --- TELA DE LOGIN / CADASTRO ---
const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Configure as chaves do Firebase no código primeiro!");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onLogin(userCredential.user);
      } else {
        // Cadastro
        if(!name) throw new Error("Digite seu nome.");
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Atualizar nome no Auth
        await updateProfile(user, { displayName: name });
        
        // Criar documento no Banco de Dados
        await setDoc(doc(db, "users", user.uid), {
          name: name,
          email: email,
          completedModules: [],
          role: "student", // Pode mudar manualmente para 'teacher' no console do Firebase
          createdAt: new Date()
        });
        
        onLogin(user);
      }
    } catch (err) {
      console.error(err);
      let msg = err.message;
      if(msg.includes("auth/invalid-credential")) msg = "Email ou senha incorretos.";
      if(msg.includes("auth/email-already-in-use")) msg = "Este email já está cadastrado.";
      if(msg.includes("auth/weak-password")) msg = "A senha deve ter pelo menos 6 caracteres.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fadeIn">
        <div className="text-center mb-6">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <School size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{isLogin ? "Entrar na Aula" : "Criar Conta"}</h1>
          <p className="text-gray-500 text-sm">Salve seu progresso na nuvem! ☁️</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-bold">{error}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" placeholder="Nome do Aluno" className="w-full p-3 border rounded-xl"
              value={name} onChange={e => setName(e.target.value)} required 
            />
          )}
          <input 
            type="email" placeholder="Email" className="w-full p-3 border rounded-xl"
            value={email} onChange={e => setEmail(e.target.value)} required 
          />
          <input 
            type="password" placeholder="Senha" className="w-full p-3 border rounded-xl"
            value={password} onChange={e => setPassword(e.target.value)} required 
          />
          
          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex justify-center items-center"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : (isLogin ? "Entrar" : "Cadastrar")}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Não tem conta?" : "Já tem conta?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 font-bold ml-1 hover:underline"
          >
            {isLogin ? "Cadastre-se" : "Faça Login"}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- DASHBOARD DO PROFESSOR ---
const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const studentsList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role !== 'teacher'); // Esconde outros professores
        setStudents(studentsList);
      } catch (error) {
        console.error("Erro ao buscar alunos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Users className="text-blue-600" /> Progresso da Turma
      </h2>
      
      {loading ? (
        <p>Carregando dados...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-bold text-gray-600">Aluno</th>
                <th className="p-4 font-bold text-gray-600">Progresso</th>
                <th className="p-4 font-bold text-gray-600 text-center">Módulos</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {students.map(student => {
                const progress = student.completedModules ? student.completedModules.length : 0;
                const percentage = (progress / courseData.modules.length) * 100;
                
                return (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-800">{student.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="bg-blue-100 text-blue-700 py-1 px-3 rounded-full text-xs font-bold">
                        {progress} / {courseData.modules.length}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && <p className="p-8 text-center text-gray-500">Nenhum aluno cadastrado ainda.</p>}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTES DO CURSO ---
const LessonView = ({ module, onExit, onComplete }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = module.slides[slideIndex];
  const isLast = slideIndex === module.slides.length - 1;

  const handleNext = () => {
    if (isLast) { onComplete(module.id); onExit(); } 
    else { setSlideIndex(slideIndex + 1); }
  };

  const getSlideStyle = (type) => {
    switch(type) {
      case 'activity': return 'bg-green-50 border-green-200 text-green-900';
      case 'concept': return 'bg-purple-50 border-purple-200 text-purple-900';
      default: return 'bg-white border-blue-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 flex flex-col animate-fadeIn">
      <div className="bg-white p-4 shadow flex justify-between items-center">
        <h2 className="font-bold text-lg">{module.title}</h2>
        <button onClick={onExit} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={`p-8 rounded-2xl shadow-xl max-w-2xl w-full text-center border-4 ${getSlideStyle(slide.type)} transition-all`}>
          <span className="uppercase text-xs font-bold tracking-widest mb-4 block opacity-60">{slide.type}</span>
          <h1 className="text-3xl font-bold mb-6">{slide.title}</h1>
          <div className="space-y-4 text-lg text-left inline-block">
            {slide.content.map((t, i) => <p key={i} className="flex gap-2"><ArrowRight size={20} className="shrink-0 opacity-50"/> {t}</p>)}
          </div>
          <button onClick={handleNext} className="mt-8 w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg">
            {isLast ? "Concluir Módulo" : "Próximo Slide"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, isCompleted, onClick }) => (
  <div onClick={onClick} className={`p-4 mb-3 bg-white rounded-xl border-2 flex items-center justify-between cursor-pointer hover:border-blue-300 transition ${isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-full ${module.color} bg-opacity-20`}>
        {isCompleted ? <CheckCircle className="text-green-600" /> : module.icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-800">{module.title}</h3>
        <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {module.duration}</span>
      </div>
    </div>
    {isCompleted && <Star className="text-yellow-400 fill-yellow-400" />}
  </div>
);

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [view, setView] = useState('modules'); // 'modules', 'teacher'
  const [initializing, setInitializing] = useState(true);

  // Monitorar Autenticação
  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Buscar dados do usuário no Firestore
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch(e) { console.error(e); }
      } else {
        setUserData(null);
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCompleteLesson = async (moduleId) => {
    if (!user || !userData) return;
    
    // Atualizar localmente para feedback instantâneo
    const newCompleted = [...(userData.completedModules || [])];
    if (!newCompleted.includes(moduleId)) {
      newCompleted.push(moduleId);
      setUserData({ ...userData, completedModules: newCompleted });

      // Atualizar no Firebase
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          completedModules: arrayUnion(moduleId)
        });
      } catch (e) { console.error("Erro ao salvar progresso:", e); }
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (initializing) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Carregando...</div>;

  // Se não estiver logado, mostra tela de login
  if (!user) return <AuthScreen onLogin={() => {}} />;

  // Se estiver em aula
  if (activeLesson) return <LessonView module={activeLesson} onExit={() => setActiveLesson(null)} onComplete={handleCompleteLesson} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <User size={20} />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">{userData?.name || user.displayName || "Aluno"}</h1>
            <p className="text-xs text-gray-500">{userData?.role === 'teacher' ? 'Professor(a)' : 'Aluno(a)'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Sair">
          <LogOut size={20} />
        </button>
      </div>

      <div className="max-w-xl mx-auto p-4">
        {/* Navegação Professor/Aluno */}
        {userData?.role === 'teacher' && (
          <div className="flex gap-2 mb-6 bg-gray-200 p-1 rounded-lg">
            <button 
              onClick={() => setView('modules')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${view === 'modules' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Ver Curso
            </button>
            <button 
              onClick={() => setView('teacher')}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${view === 'teacher' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            >
              Área do Professor
            </button>
          </div>
        )}

        {view === 'teacher' ? (
          <TeacherDashboard />
        ) : (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-gray-700">Meus Módulos</h2>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                {userData?.completedModules?.length || 0} / {courseData.modules.length} Completos
              </span>
            </div>
            {courseData.modules.map(module => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                isCompleted={userData?.completedModules?.includes(module.id)}
                onClick={() => setActiveLesson(module)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
