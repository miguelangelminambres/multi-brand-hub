'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Play, Pause, CheckCircle, Circle, AlertCircle, Users, BarChart3, Settings, LogOut, Trash2, Edit2, Save, Eye, EyeOff, Key, ArrowRight } from 'lucide-react';

const MultiBrandHub = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authStep, setAuthStep] = useState('choose');
  const [showPassword, setShowPassword] = useState(false);
  const [validLicenses, setValidLicenses] = useState([]);
  const [validatedLicense, setValidatedLicense] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [licenseCode, setLicenseCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');

  const [brands, setBrands] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [view, setView] = useState('dashboard');
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const [newBrand, setNewBrand] = useState({ name: '', color: '#3b82f6' });

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    brandId: '',
    startDate: '',
    endDate: '',
    status: 'todo',
    assignedTo: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetch('/api/licenses')
      .then(res => res.json())
      .then(data => setValidLicenses(data.licenses))
      .catch(err => console.error('Error loading licenses:', err));

    const session = localStorage.getItem('mbh_session');
    if (session) {
      const user = JSON.parse(session);
      setCurrentUser(user);
      setIsAuthenticated(true);
      loadUserData(user.email);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const loadUserData = (userEmail) => {
    const userData = localStorage.getItem(`mbh_user_${userEmail}`);
    if (userData) {
      const data = JSON.parse(userData);
      setBrands(data.brands || []);
      setProjects(data.projects || []);
    }
  };

  const saveUserData = (userEmail, data) => {
    localStorage.setItem(`mbh_user_${userEmail}`, JSON.stringify(data));
  };

  const handleValidateLicense = () => {
    setError('');
    
    if (!licenseCode.trim()) {
      setError('Por favor, introduce un código de licencia');
      return;
    }

    if (!validLicenses.includes(licenseCode.toUpperCase())) {
      setError('Código de licencia inválido. Verifica que lo hayas escrito correctamente.');
      return;
    }

    const usedLicenses = JSON.parse(localStorage.getItem('mbh_used_licenses') || '[]');
    if (usedLicenses.includes(licenseCode.toUpperCase())) {
      setError('Este código de licencia ya ha sido activado. Si compraste este código, contacta con soporte.');
      return;
    }

    setValidatedLicense(licenseCode.toUpperCase());
    setAuthStep('register');
    setError('');
  };

  const handleRegister = () => {
    setError('');
    
    if (!email || !password || !confirmPassword || !companyName) {
      setError('Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const existingUser = localStorage.getItem(`mbh_credentials_${email}`);
    if (existingUser) {
      setError('Este email ya está registrado. Usa otro email o inicia sesión.');
      return;
    }

    const userData = {
      email,
      password,
      companyName,
      licenseCode: validatedLicense,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem(`mbh_credentials_${email}`, JSON.stringify(userData));
    
    const usedLicenses = JSON.parse(localStorage.getItem('mbh_used_licenses') || '[]');
    usedLicenses.push(validatedLicense);
    localStorage.setItem('mbh_used_licenses', JSON.stringify(usedLicenses));

    saveUserData(email, { brands: [], projects: [] });

    const session = { email, companyName, licenseCode: validatedLicense };
    localStorage.setItem('mbh_session', JSON.stringify(session));
    setCurrentUser(session);
    setIsAuthenticated(true);
  };

  const handleLogin = () => {
    setError('');
    
    if (!email || !password) {
      setError('Email y contraseña son obligatorios');
      return;
    }

    const credentials = localStorage.getItem(`mbh_credentials_${email}`);
    if (!credentials) {
      setError('Usuario no encontrado. ¿Necesitas crear una cuenta?');
      return;
    }

    const userData = JSON.parse(credentials);
    if (userData.password !== password) {
      setError('Contraseña incorrecta');
      return;
    }

    const session = {
      email: userData.email,
      companyName: userData.companyName,
      licenseCode: userData.licenseCode
    };
    
    localStorage.setItem('mbh_session', JSON.stringify(session));
    setCurrentUser(session);
    setIsAuthenticated(true);
    loadUserData(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('mbh_session');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setBrands([]);
    setProjects([]);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setLicenseCode('');
    setCompanyName('');
    setValidatedLicense('');
    setAuthStep('choose');
  };

  const addBrand = () => {
    if (!newBrand.name.trim()) return;
    
    const brand = {
      id: Date.now().toString(),
      name: newBrand.name,
      color: newBrand.color,
      createdAt: new Date().toISOString()
    };

    const updatedBrands = [...brands, brand];
    setBrands(updatedBrands);
    saveUserData(currentUser.email, { brands: updatedBrands, projects });
    
    setNewBrand({ name: '', color: '#3b82f6' });
    setShowAddBrand(false);
  };

  const deleteBrand = (brandId) => {
    if (!confirm('¿Eliminar esta marca? Se eliminarán todos sus proyectos.')) return;
    
    const updatedBrands = brands.filter(b => b.id !== brandId);
    const updatedProjects = projects.filter(p => p.brandId !== brandId);
    
    setBrands(updatedBrands);
    setProjects(updatedProjects);
    saveUserData(currentUser.email, { brands: updatedBrands, projects: updatedProjects });
  };

  const addProject = () => {
    if (!newProject.title.trim() || !newProject.brandId) return;
    
    const project = {
      id: Date.now().toString(),
      ...newProject,
      timeTracked: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    saveUserData(currentUser.email, { brands, projects: updatedProjects });
    
    setNewProject({
      title: '',
      description: '',
      brandId: '',
      startDate: '',
      endDate: '',
      status: 'todo',
      assignedTo: '',
      priority: 'medium'
    });
    setShowAddProject(false);
  };

  const updateProjectStatus = (projectId, newStatus) => {
    const updatedProjects = projects.map(p =>
      p.id === projectId ? { ...p, status: newStatus } : p
    );
    setProjects(updatedProjects);
    saveUserData(currentUser.email, { brands, projects: updatedProjects });
  };

  const deleteProject = (projectId) => {
    if (!confirm('¿Eliminar este proyecto?')) return;
    
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    saveUserData(currentUser.email, { brands, projects: updatedProjects });
  };

  const toggleTimer = (projectId) => {
    if (activeTimer === projectId) {
      const updatedProjects = projects.map(p =>
        p.id === projectId ? { ...p, timeTracked: p.timeTracked + timerSeconds } : p
      );
      setProjects(updatedProjects);
      saveUserData(currentUser.email, { brands, projects: updatedProjects });
      setActiveTimer(null);
      setTimerSeconds(0);
    } else {
      if (activeTimer) {
        const updatedProjects = projects.map(p =>
          p.id === activeTimer ? { ...p, timeTracked: p.timeTracked + timerSeconds } : p
        );
        setProjects(updatedProjects);
        saveUserData(currentUser.email, { brands, projects: updatedProjects });
      }
      setActiveTimer(projectId);
      setTimerSeconds(0);
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredProjects = () => {
    if (selectedBrand === 'all') return projects;
    return projects.filter(p => p.brandId === selectedBrand);
  };

  const getProjectsByStatus = (status) => {
    return getFilteredProjects().filter(p => p.status === status);
  };

  const getBrandById = (brandId) => {
    return brands.find(b => b.id === brandId);
  };

  const getStats = () => {
    const filteredProjects = getFilteredProjects();
    return {
      total: filteredProjects.length,
      todo: filteredProjects.filter(p => p.status === 'todo').length,
      inProgress: filteredProjects.filter(p => p.status === 'inprogress').length,
      review: filteredProjects.filter(p => p.status === 'review').length,
      done: filteredProjects.filter(p => p.status === 'done').length,
      totalTime: filteredProjects.reduce((sum, p) => sum + p.timeTracked, 0)
    };
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Multi-Brand Hub</h1>
            <p className="text-gray-600">Gestión de proyectos multi-marca</p>
          </div>

          {authStep === 'choose' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-6 text-center">Bienvenido</h2>
              
              <button
                onClick={() => {
                  setAuthStep('license');
                  setError('');
                }}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-3"
              >
                <Key size={24} />
                <div className="text-left">
                  <div>Tengo un Código de Licencia</div>
                  <div className="text-sm font-normal opacity-90">Activar mi compra</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setAuthStep('login');
                  setError('');
                }}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-3"
              >
                <ArrowRight size={24} />
                <div className="text-left">
                  <div>Ya Tengo una Cuenta</div>
                  <div className="text-sm font-normal opacity-70">Iniciar sesión</div>
                </div>
              </button>
            </div>
          )}

          {authStep === 'license' && (
            <div>
              <button
                onClick={() => {
                  setAuthStep('choose');
                  setError('');
                  setLicenseCode('');
                }}
                className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
              >
                ← Volver
              </button>

              <h2 className="text-xl font-semibold mb-2">Activa tu Licencia</h2>
              <p className="text-sm text-gray-600 mb-6">Introduce el código que recibiste tras tu compra</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Código de Licencia</label>
                  <input
                    type="text"
                    value={licenseCode}
                    onChange={(e) => setLicenseCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-center text-lg"
                    placeholder="MBH-2025-XXXX-XXXX"
                    maxLength={19}
                  />
                  <p className="text-xs text-gray-500 mt-2">Formato: MBH-2025-XXXX-XXXX</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleValidateLicense}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Validar y Continuar
                </button>
              </div>
            </div>
          )}

          {authStep === 'register' && (
            <div>
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <CheckCircle size={20} />
                <div className="text-sm">
                  <div className="font-semibold">¡Licencia Válida!</div>
                  <div className="font-mono text-xs">{validatedLicense}</div>
                </div>
              </div>

              <h2 className="text-xl font-semibold mb-6">Crea tu Cuenta</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de tu Empresa</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mi Empresa S.L."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Repite tu contraseña"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleRegister}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Crear Cuenta y Empezar
                </button>
              </div>
            </div>
          )}

          {authStep === 'login' && (
            <div>
              <button
                onClick={() => {
                  setAuthStep('choose');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
              >
                ← Volver
              </button>

              <h2 className="text-xl font-semibold mb-6">Iniciar Sesión</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <button
                  onClick={handleLogin}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Entrar
                </button>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setAuthStep('license');
                      setError('');
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    ¿Primera vez? Activa tu licencia aquí
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Multi-Brand Hub</h1>
              <p className="text-sm text-gray-600">{currentUser.companyName}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg transition ${view === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setView('projects')}
                className={`px-4 py-2 rounded-lg transition ${view === 'projects' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Proyectos
              </button>
              <button
                onClick={() => setView('settings')}
                className={`p-2 rounded-lg transition ${view === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Settings size={20} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <div>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Filtrar por Marca</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedBrand('all')}
                  className={`px-4 py-2 rounded-lg transition ${selectedBrand === 'all' ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Todas las Marcas
                </button>
                {brands.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => setSelectedBrand(brand.id)}
                    className={`px-4 py-2 rounded-lg transition ${selectedBrand === brand.id ? 'text-white' : 'bg-white hover:opacity-90'}`}
                    style={{
                      backgroundColor: selectedBrand === brand.id ? brand.color : 'white',
                      color: selectedBrand === brand.id ? 'white' : brand.color,
                      borderWidth: '2px',
                      borderColor: brand.color
                    }}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-blue-700">{stats.todo}</div>
                <div className="text-sm text-blue-600">Por Hacer</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-yellow-700">{stats.inProgress}</div>
                <div className="text-sm text-yellow-600">En Progreso</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-purple-700">{stats.review}</div>
                <div className="text-sm text-purple-600">En Revisión</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-green-700">{stats.done}</div>
                <div className="text-sm text-green-600">Completados</div>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg shadow">
                <div className="text-2xl font-bold text-indigo-700">{formatTime(stats.totalTime)}</div>
                <div className="text-sm text-indigo-600">Tiempo Total</div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Tablero Kanban</h2>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Plus size={20} />
                  Nuevo Proyecto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['todo', 'inprogress', 'review', 'done'].map((status) => {
                  const statusConfig = {
                    todo: { title: 'Por Hacer', color: 'bg-blue-100 border-blue-300', icon: Circle },
                    inprogress: { title: 'En Progreso', color: 'bg-yellow-100 border-yellow-300', icon: Clock },
                    review: { title: 'En Revisión', color: 'bg-purple-100 border-purple-300', icon: AlertCircle },
                    done: { title: 'Completado', color: 'bg-green-100 border-green-300', icon: CheckCircle }
                  };

                  const config = statusConfig[status];
                  const Icon = config.icon;
                  const statusProjects = getProjectsByStatus(status);

                  return (
                    <div key={status} className="bg-gray-100 rounded-lg p-4">
                      <div className={`${config.color} border-2 rounded-lg p-3 mb-4 flex items-center gap-2`}>
                        <Icon size={20} />
                        <h3 className="font-semibold">{config.title}</h3>
                        <span className="ml-auto bg-white px-2 py-1 rounded text-sm font-semibold">
                          {statusProjects.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {statusProjects.map(project => {
                          const brand = getBrandById(project.brandId);
                          const isTimerActive = activeTimer === project.id;
                          const currentTime = isTimerActive ? project.timeTracked + timerSeconds : project.timeTracked;

                          return (
                            <div key={project.id} className="bg-white rounded-lg p-4 shadow hover:shadow-md transition">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-800 flex-1">{project.title}</h4>
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              
                              {project.description && (
                                <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                              )}

                              {brand && (
                                <div
                                  className="inline-block px-2 py-1 rounded text-xs font-semibold mb-3"
                                  style={{ backgroundColor: brand.color + '20', color: brand.color }}
                                >
                                  {brand.name}
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <Clock size={14} />
                                <span className={isTimerActive ? 'font-bold text-blue-600' : ''}>
                                  {formatTime(currentTime)}
                                </span>
                                <button
                                  onClick={() => toggleTimer(project.id)}
                                  className={`ml-auto p-1 rounded ${isTimerActive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                                >
                                  {isTimerActive ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                              </div>

                              {project.assignedTo && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <Users size={14} />
                                  <span>{project.assignedTo}</span>
                                </div>
                              )}

                              {status !== 'done' && (
                                <select
                                  value={status}
                                  onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                                  className="w-full text-sm border border-gray-300 rounded p-2"
                                >
                                  <option value="todo">Por Hacer</option>
                                  <option value="inprogress">En Progreso</option>
                                  <option value="review">En Revisión</option>
                                  <option value="done">Completado</option>
                                </select>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {view === 'projects' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Todos los Proyectos</h2>
              <button
                onClick={() => setShowAddProject(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={20} />
                Nuevo Proyecto
              </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiempo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {projects.map(project => {
                    const brand = getBrandById(project.brandId);
                    const isTimerActive = activeTimer === project.id;
                    const currentTime = isTimerActive ? project.timeTracked + timerSeconds : project.timeTracked;

                    return (
                      <tr key={project.id}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">{project.title}</div>
                          {project.description && (
                            <div className="text-sm text-gray-600">{project.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {brand && (
                            <span
                              className="px-2 py-1 rounded text-xs font-semibold"
                              style={{ backgroundColor: brand.color + '20', color: brand.color }}
                            >
                              {brand.name}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={project.status}
                            onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded p-1"
                          >
                            <option value="todo">Por Hacer</option>
                            <option value="inprogress">En Progreso</option>
                            <option value="review">En Revisión</option>
                            <option value="done">Completado</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {project.assignedTo || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isTimerActive ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
                              {formatTime(currentTime)}
                            </span>
                            <button
                              onClick={() => toggleTimer(project.id)}
                              className={`p-1 rounded ${isTimerActive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}
                            >
                              {isTimerActive ? <Pause size={16} /> : <Play size={16} />}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {projects.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No hay proyectos creados aún. Crea tu primer proyecto.
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configuración</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Información de Usuario</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-600">Empresa</label>
                    <div className="font-semibold">{currentUser.companyName}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Email</label>
                    <div className="font-semibold">{currentUser.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Código de Licencia</label>
                    <div className="font-mono text-sm bg-gray-100 px-3 py-2 rounded">
                      {currentUser.licenseCode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Mis Marcas</h3>
                  <button
                    onClick={() => setShowAddBrand(true)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition flex items-center gap-1 text-sm"
                  >
                    <Plus size={16} />
                    Añadir
                  </button>
                </div>
                
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: brand.color }}
                        />
                        <span className="font-semibold">{brand.name}</span>
                      </div>
                      <button
                        onClick={() => deleteBrand(brand.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {brands.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No hay marcas configuradas
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddBrand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Nueva Marca</h3>
              <button onClick={() => setShowAddBrand(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de la Marca</label>
                <input
                  type="text"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Marca Premium"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Identificativo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newBrand.color}
                    onChange={(e) => setNewBrand({ ...newBrand, color: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newBrand.color}
                    onChange={(e) => setNewBrand({ ...newBrand, color: e.target.value })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <button
                onClick={addBrand}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Crear Marca
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Nuevo Proyecto</h3>
              <button onClick={() => setShowAddProject(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título del Proyecto</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ej: Campaña de Navidad"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Describe el proyecto..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                <select
                  value={newProject.brandId}
                  onChange={(e) => setNewProject({ ...newProject, brandId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Selecciona una marca</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                  <input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                  <input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Asignado a</label>
                <input
                  type="text"
                  value={newProject.assignedTo}
                  onChange={(e) => setNewProject({ ...newProject, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Nombre del responsable"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="todo">Por Hacer</option>
                    <option value="inprogress">En Progreso</option>
                    <option value="review">En Revisión</option>
                    <option value="done">Completado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <select
                    value={newProject.priority}
                    onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <button
                onClick={addProject}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Crear Proyecto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiBrandHub;
