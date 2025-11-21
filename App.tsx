import React, { useState, useEffect, useRef } from 'react';
import { ClinicalMode, ModeConfig } from './types';
import { Section, Input, Select, TextArea, CheckboxGroup, ContextBadge, ModuleContext, SubHeader } from './components/FormElements';
import { UserIcon, ActivityIcon, HistoryIcon, ClipboardIcon, StethoscopeIcon, CheckCircleIcon, SparklesIcon, SunIcon, MoonIcon, ListCheckIcon } from './components/Icons';

// --- Configuration ---
const MODES: Record<ClinicalMode, ModeConfig> = {
  adult: {
    id: 'adult',
    label: 'Adult',
    color: 'indigo',
    accentBg: 'bg-indigo-500',
    accentText: 'text-indigo-600 dark:text-indigo-400',
    borderColor: 'border-indigo-200 dark:border-indigo-500',
    ringColor: 'ring-indigo-500/50'
  },
  obgyn: {
    id: 'obgyn',
    label: 'OB / Gyn',
    color: 'pink',
    accentBg: 'bg-pink-500',
    accentText: 'text-pink-600 dark:text-pink-400',
    borderColor: 'border-pink-200 dark:border-pink-500',
    ringColor: 'ring-pink-500/50'
  },
  peds: {
    id: 'peds',
    label: 'Pediatrics',
    color: 'emerald',
    accentBg: 'bg-emerald-500',
    accentText: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-emerald-200 dark:border-emerald-500',
    ringColor: 'ring-emerald-500/50'
  }
};

const VITALS_CONFIG = [
    { id: 'hr', label: 'HR', unit: 'bpm', max: 300, min: 20 },
    { id: 'rr', label: 'RR', unit: '/min', max: 80, min: 5 },
    { id: 'temp', label: 'Temp', unit: '°C', max: 45, min: 30, decimals: 1 },
    { id: 'spo2', label: 'SpO₂', unit: '%', max: 100, min: 50 },
];

const SECTIONS = [
  { id: 'identity', title: 'Patient Context', icon: <UserIcon /> },
  { id: 'concern', title: 'Chief Concern', icon: <ActivityIcon /> },
  { id: 'hpi', title: 'History (HPI)', icon: <HistoryIcon /> },
  { id: 'ros', title: 'Review of Systems', icon: <ListCheckIcon /> },
  { id: 'background', title: 'Background', icon: <ClipboardIcon /> },
  { id: 'exam', title: 'Examination', icon: <StethoscopeIcon /> },
  { id: 'plan', title: 'Assessment & Plan', icon: <CheckCircleIcon /> },
];

// Helper for smart number input styled to match new design
const NumberInput = ({ placeholder, max, min, decimals = 0, className = "" }: { placeholder?: string, max?: number, min?: number, decimals?: number, className?: string }) => {
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        let val = target.value;
        if (val === '') return;
        if (val.length > 10) target.value = val.slice(0, 10);
    };

    return (
        <input 
            type="number"
            inputMode="decimal"
            step={decimals > 0 ? "0.1" : "1"}
            placeholder={placeholder}
            onInput={handleInput}
            className={`w-full bg-transparent text-2xl font-bold text-slate-800 dark:text-slate-100 focus:outline-none placeholder-slate-200 dark:placeholder-slate-800/50 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
        />
    )
}

const App: React.FC = () => {
  const [mode, setMode] = useState<ClinicalMode>('adult');
  const [isDark, setIsDark] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    concern: true,
    identity: true, 
  });
  const [activeSectionId, setActiveSectionId] = useState('identity');
  
  // Anthropometry State
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [bmi, setBmi] = useState<string | null>(null);

  // Age State
  const [age, setAge] = useState<string>('');
  
  // Scroll Spy Lock
  const isManualScrolling = useRef(false);

  const currentConfig = MODES[mode];

  // --- Theme Management ---
  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDark]);

  // --- BMI Calculation ---
  useEffect(() => {
    if (!height || !weight) {
        setBmi(null);
        return;
    }
    const h = parseFloat(height);
    const w = parseFloat(weight);
    
    if (isNaN(h) || isNaN(w) || h === 0) {
        setBmi(null);
        return;
    }

    const heightInMeters = h / 100;
    const bmiValue = w / (heightInMeters * heightInMeters);
    
    if (bmiValue > 0 && bmiValue < 100) {
        setBmi(bmiValue.toFixed(1));
    } else {
        setBmi(null);
    }
  }, [height, weight]);

  // --- Age / DOB Logic ---
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === '' || /^\d+$/.test(val)) {
          setAge(val);
      }
  };

  const handleAgeBlur = () => {
      if (!age) return;
      const num = parseInt(age, 10);
      const currentYear = new Date().getFullYear();
      if (num > 1900 && num <= currentYear) {
          const calculatedAge = currentYear - num;
          setAge(calculatedAge.toString());
      }
  };

  // --- Scroll Spy ---
  useEffect(() => {
    const handleScroll = () => {
      if (isManualScrolling.current) return;

      const scrollPosition = window.scrollY;
      const triggerPoint = scrollPosition + 300; 

      let current = activeSectionId;
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          const adjustedTop = offsetTop - 140;
          if (triggerPoint >= adjustedTop && triggerPoint < adjustedTop + offsetHeight + 100) {
            current = section.id;
          }
        }
      }
      
      if (current !== activeSectionId) {
          setActiveSectionId(current);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSectionId]);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    if (activeSectionId === id) return;
    isManualScrolling.current = true;
    setActiveSectionId(id);
    setExpandedSections(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -110; 
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setTimeout(() => {
            isManualScrolling.current = false;
        }, 800);
      } else {
          isManualScrolling.current = false;
      }
    }, 50);
  };

  const Sidebar = () => (
    <aside className="hidden xl:block fixed top-32 left-0 h-[calc(100vh-8rem)] w-80 pl-8 z-30 pointer-events-none">
        <div className="pointer-events-auto relative h-full flex flex-col">
            <div className="absolute left-[3.25rem] top-4 bottom-20 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

            <nav className="space-y-6 relative z-10 pt-2">
                {SECTIONS.map((item) => {
                    const isActive = activeSectionId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="group flex items-center gap-6 w-full text-left relative outline-none"
                        >
                            <div className={`
                                relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                                ${isActive 
                                    ? `scale-110 bg-white dark:bg-slate-900 ${currentConfig.borderColor} shadow-lg shadow-${currentConfig.color}-500/20` 
                                    : 'border-transparent bg-transparent scale-50 group-hover:scale-75'
                                }
                            `}>
                                <div className={`
                                    w-3 h-3 rounded-full transition-all duration-300 
                                    ${isActive 
                                        ? `${currentConfig.accentBg} shadow-[0_0_10px_currentColor]` 
                                        : 'bg-slate-300 dark:bg-slate-700 group-hover:bg-slate-400'
                                    }
                                `} />
                            </div>

                            <div className={`
                                flex-1 flex items-center gap-4 py-3 pl-5 pr-6 rounded-2xl transition-all duration-500 ease-out border
                                ${isActive 
                                    ? 'translate-x-0 opacity-100 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-slate-200/50 dark:border-slate-700/50 ring-1 ring-white/50 dark:ring-white/5' 
                                    : 'translate-x-[-10px] opacity-60 hover:opacity-100 border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                                }
                            `}>
                                <span className={`transition-colors duration-300 ${isActive ? currentConfig.accentText : 'text-slate-400 dark:text-slate-600 group-hover:text-slate-600 dark:group-hover:text-slate-400'}`}>
                                    {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                                </span>
                                <span className={`text-sm font-bold uppercase tracking-wider transition-colors duration-300 ${isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {item.title}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </nav>

            <div className="mt-auto pb-10 pl-[4.5rem]">
                <button onClick={() => setIsDark(!isDark)} className="group flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:scale-110 transition-transform">
                         {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
                    </div>
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
            </div>
        </div>
    </aside>
  );

  return (
    <div className="relative min-h-screen transition-colors duration-700 ease-in-out bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 font-sans">
      
      {/* --- Ambient Background Lighting --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.02] dark:opacity-[0.15] mix-blend-overlay"></div>
        <div 
          className={`absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-[100%] blur-[120px] opacity-20 dark:opacity-10 transition-colors duration-1000 ease-in-out ${currentConfig.accentBg}`}
        ></div>
         <div 
          className={`absolute top-[40%] left-[10%] w-[600px] h-[600px] rounded-[100%] blur-[100px] opacity-10 dark:opacity-5 transition-colors duration-1000 ease-in-out ${currentConfig.accentBg}`}
        ></div>
      </div>

      {/* --- Header --- */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/50 transition-all duration-300">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-sm border border-slate-200 dark:border-white/5`}>
                <svg className={`h-6 w-6 transition-colors duration-500 ${currentConfig.accentText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-none mb-1">
                  Nexus Clinical
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mode</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentConfig.accentText}`}>{currentConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Modern Mode Switcher */}
            <div className="flex p-1.5 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full backdrop-blur-md shadow-inner overflow-x-auto scrollbar-hide">
              {(Object.keys(MODES) as ClinicalMode[]).map((m) => {
                const isActive = mode === m;
                const conf = MODES[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative whitespace-nowrap px-6 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-500 cubic-bezier(0.2, 0, 0, 1) ${
                      isActive 
                        ? 'text-white shadow-lg bg-slate-800 dark:bg-slate-700 scale-100' 
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                     {isActive && (
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${conf.accentBg} shadow-[0_0_8px_rgba(var(--color-accent),0.8)]`}></div>
                     )}
                     <span className={isActive ? "ml-3" : ""}>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* --- Layout Grid --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex">
            
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 w-full min-w-0 xl:pl-80 py-10 pb-48">
                
                <div className="space-y-10">
                    {/* SECTION 0: IDENTITY */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '0ms' }}>
                        <Section 
                            id="identity"
                            title="Patient Context" 
                            icon={<UserIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['identity']}
                            onToggle={() => toggleSection('identity')}
                        >
                        <div className="grid grid-cols-12 gap-6">
                            <div className="col-span-12 sm:col-span-7">
                                {/* Changed to TextArea for smart handling of long names */}
                                <TextArea label="Patient Name" placeholder="Last Name, First Name" modeConfig={currentConfig} rows={1} />
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                <Input 
                                  label="Age / DOB" 
                                  placeholder="--" 
                                  modeConfig={currentConfig} 
                                  inputMode="numeric"
                                  value={age}
                                  onChange={handleAgeChange}
                                  onBlur={handleAgeBlur}
                                  suffix={age ? 'yo' : ''}
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <Select label="Gender" options={['Female', 'Male', 'Other']} modeConfig={currentConfig} />
                            </div>
                        </div>
                        
                        {/* Anthropometry */}
                         <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                            <Input 
                                label="Height (cm)" 
                                type="number" 
                                placeholder="--" 
                                modeConfig={currentConfig} 
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                            <Input 
                                label="Weight (kg)" 
                                type="number" 
                                placeholder="--" 
                                modeConfig={currentConfig} 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            <div className="col-span-2 flex flex-col justify-center pb-2 px-4">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">BMI</span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-3xl font-black tracking-tight ${bmi ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700'}`}>
                                        {bmi || '--.-'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">kg/m²</span>
                                </div>
                            </div>
                         </div>
                        </Section>
                    </div>

                    {/* SECTION 1: CHIEF CONCERN */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
                        <Section 
                            id="concern"
                            title="Chief Concern" 
                            icon={<ActivityIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['concern']}
                            onToggle={() => toggleSection('concern')}
                        >
                        <div className="relative">
                            <TextArea 
                                label="Presenting Complaint" 
                                placeholder={mode === 'peds' ? "Caregiver's main worry..." : "Patient's main symptom..."}
                                className="text-2xl font-semibold tracking-tight" 
                                modeConfig={currentConfig} 
                                autoFocus
                                rows={1}
                            />
                        </div>
                        </Section>
                    </div>

                    {/* SECTION 2: HPI */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
                        <Section 
                            id="hpi"
                            title="History of Present Illness" 
                            icon={<HistoryIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['hpi']}
                            onToggle={() => toggleSection('hpi')}
                        >
                             <SubHeader title="Narrative & Timeline" />
                             <TextArea 
                                label="HPI Narrative" 
                                placeholder="Describe onset, location, duration, character, aggravating/alleviating factors, radiation, timing, and severity (OLDCARTS)..." 
                                modeConfig={currentConfig} 
                             />
                             <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-4">
                                 <TextArea label="Pertinent Positives" placeholder="Associated symptoms..." modeConfig={currentConfig} />
                                 <TextArea label="Pertinent Negatives" placeholder="Denies..." modeConfig={currentConfig} />
                             </div>
                        </Section>
                    </div>

                    {/* SECTION 3: ROS */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '250ms' }}>
                        <Section
                            id="ros"
                            title="Review of Systems"
                            icon={<ListCheckIcon />}
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['ros']}
                            onToggle={() => toggleSection('ros')}
                        >
                            <div className="space-y-6">
                                <CheckboxGroup 
                                    label="General"
                                    items={['Fever', 'Chills', 'Weight Change', 'Fatigue']}
                                    modeConfig={currentConfig}
                                />
                                <CheckboxGroup 
                                    label="Respiratory & Cardiac"
                                    items={['Cough', 'Dyspnea', 'Chest Pain', 'Palpitations', 'Edema']}
                                    modeConfig={currentConfig}
                                />
                                <CheckboxGroup 
                                    label="Gastrointestinal"
                                    items={['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abd Pain']}
                                    modeConfig={currentConfig}
                                />
                                <CheckboxGroup 
                                    label="Neurological"
                                    items={['Headache', 'Dizziness', 'Numbness', 'Weakness']}
                                    modeConfig={currentConfig}
                                />
                            </div>
                        </Section>
                    </div>

                    {/* SECTION 4: BACKGROUND */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
                        <Section 
                            id="background"
                            title="Past Medical History" 
                            icon={<ClipboardIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['background']}
                            onToggle={() => toggleSection('background')}
                        >
                        
                        {mode === 'peds' ? (
                            <>
                                <SubHeader title="1. Perinatal History" />
                                <ModuleContext modeConfig={currentConfig}>
                                    <ContextBadge label="Maternal & Birth" modeConfig={currentConfig} />
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                                        <TextArea label="Prenatal" placeholder="Mother's health, Labs, Complications, Meds, Drugs/Tobacco..." modeConfig={currentConfig} />
                                        <TextArea label="Birth" placeholder="GA, Labor duration, Delivery mode, Forceps/Vacuum, Birth Weight..." modeConfig={currentConfig} />
                                    </div>
                                    <TextArea label="Neonatal" placeholder="Resuscitation, APGARs, Jaundice, NICU stay, Discharge..." modeConfig={currentConfig} />
                                </ModuleContext>

                                <SubHeader title="2. Feeding & Nutrition" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <TextArea label="Method" placeholder="Breast / Formula / Both" modeConfig={currentConfig} />
                                    <TextArea label="Frequency" placeholder="e.g. q3h, volume?" modeConfig={currentConfig} />
                                    <TextArea label="Supplements/Solids" placeholder="Vit D, Iron, Cereals?" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="3. Growth & Development" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Growth Trends" placeholder="Weight, Height, Head Circ trajectory..." modeConfig={currentConfig} />
                                    <TextArea label="Milestones" placeholder="Gross Motor, Fine Motor, Language, Social..." modeConfig={currentConfig} />
                                </div>
                                <div className="mt-6">
                                    <TextArea label="School / Grade" placeholder="Current grade, performance, concerns?" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="4. Routine Care" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Immunizations" placeholder="HepB, DTaP, IPV, Hib, MMR, Varicella, HepA..." modeConfig={currentConfig} />
                                    <TextArea label="Screening" placeholder="Vision, Hearing, Lead, TB, Anemia..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="5. Safety & Environment" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <CheckboxGroup 
                                        label="Measures"
                                        items={['Car Seat', 'Smoke Detectors', 'Water Safety', 'Gun Safety']}
                                        modeConfig={currentConfig}
                                    />
                                    <TextArea label="Exposures" placeholder="Smokers in home, Lead, Pets..." modeConfig={currentConfig} />
                                </div>
                            </>
                        ) : (
                            <>
                                <SubHeader title="1. Childhood Illnesses" />
                                <CheckboxGroup 
                                    label="History of"
                                    items={['Measles', 'Mumps', 'Rubella', 'Chickenpox', 'Pertussis', 'Rheumatic Fever', 'Polio']}
                                    modeConfig={currentConfig}
                                />

                                <SubHeader title="2. Adult Illnesses" />
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <TextArea label="Medical" placeholder="Diagnoses & Dates (e.g. Diabetes 2010, HTN 2015)..." modeConfig={currentConfig} />
                                        <TextArea label="Surgical" placeholder="Operations, Dates, Hospitals..." modeConfig={currentConfig} />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <ModuleContext modeConfig={currentConfig}>
                                            <ContextBadge label="Ob / Gyn" modeConfig={currentConfig} />
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <TextArea label="Obstetric" placeholder="G_ P_ (TPAL)" modeConfig={currentConfig} />
                                                <TextArea label="Menstrual" placeholder="LMP, Cycle details" modeConfig={currentConfig} />
                                            </div>
                                            <TextArea label="Sexual Function" placeholder="Concerns?" modeConfig={currentConfig} />
                                        </ModuleContext>
                                        <TextArea label="Psychiatric" placeholder="Diagnoses, Dates, Treatments..." modeConfig={currentConfig} />
                                    </div>
                                </div>

                                <SubHeader title="3. Health Maintenance" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea 
                                        label="Immunizations" 
                                        placeholder="Tetanus, Influenza, Hep B, Pneumococcal, Zoster, COVID..." 
                                        modeConfig={currentConfig} 
                                    />
                                    <TextArea 
                                        label="Screening Tests" 
                                        placeholder="Pap, Mammogram, Colonoscopy, Cholesterol, TB..." 
                                        modeConfig={currentConfig} 
                                    />
                                </div>
                                <div className="mt-6">
                                    <CheckboxGroup 
                                        label="Safety Measures"
                                        items={['Seat Belts', 'Smoke Detectors', 'Sun Protection']}
                                        modeConfig={currentConfig}
                                    />
                                </div>

                                <SubHeader title="4. Social History" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Personal" placeholder="Personality, Interests, Sources of support" modeConfig={currentConfig} />
                                    <TextArea label="Occupation/Education" placeholder="Job, Schooling, Exposures" modeConfig={currentConfig} />
                                    <TextArea label="Home Environment" placeholder="Household members, Stress, Safety" modeConfig={currentConfig} />
                                    <TextArea label="Lifestyle" placeholder="Diet, Exercise, Caffeine" modeConfig={currentConfig} />
                                </div>
                                
                                <SubHeader title="5. Habits" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                    <TextArea label="Tobacco" placeholder="Pack-years, Quit date..." modeConfig={currentConfig} />
                                    <TextArea label="Alcohol" placeholder="Amount/freq, CAGE questions..." modeConfig={currentConfig} />
                                    <TextArea label="Drugs" placeholder="Type, Route, Frequency..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="6. Sexual History" />
                                <TextArea label="Details" placeholder="Partners, Practices, Protection, STIs" modeConfig={currentConfig} />

                                <SubHeader title="7. Family History" />
                                <TextArea label="Details" placeholder="Parents/Siblings (Age, Health, Cause of death). Specific: HTN, CA, DM, CAD..." modeConfig={currentConfig} />
                                <TextArea label="Medications & Allergies" placeholder="Current Rx, OTC, Herbal. Drug Allergies (Reaction)." className="mt-4" modeConfig={currentConfig} />
                            </>
                        )}
                        </Section>
                    </div>

                    {/* SECTION 5: EXAM */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
                        <Section 
                            id="exam"
                            title="Physical Examination" 
                            icon={<StethoscopeIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['exam']}
                            onToggle={() => toggleSection('exam')}
                        >
                        
                        {/* Vitals Block */}
                        <div className="bg-white/60 dark:bg-slate-900/40 rounded-[2rem] p-8 border border-dashed border-slate-300 dark:border-slate-700 mb-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.6)]"></div>
                                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Vital Signs</label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                                {/* Standard Vitals */}
                                {VITALS_CONFIG.map(vital => (
                                    <div key={vital.id} className="relative flex flex-col items-start justify-between rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors mb-2">{vital.label}</span>
                                        <div className="relative w-full">
                                            <NumberInput placeholder="--" max={vital.max} min={vital.min} decimals={vital.decimals} />
                                            <span className="absolute right-0 bottom-1.5 text-[10px] font-bold text-slate-300 dark:text-slate-600 pointer-events-none">{vital.unit}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* BP Special Dual Input Card */}
                                <div className="col-span-2 relative flex flex-col items-start justify-between rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 group focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">
                                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors mb-2">BP (mmHg)</span>
                                     <div className="flex items-end w-full gap-3">
                                         <div className="relative w-full">
                                            <NumberInput placeholder="Sys" max={250} min={50} className="text-center" />
                                            <div className="absolute -bottom-3.5 left-0 w-full text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">SYS</div>
                                         </div>
                                         <span className="text-2xl text-slate-200 dark:text-slate-700 pb-1 font-light">/</span>
                                         <div className="relative w-full">
                                            <NumberInput placeholder="Dia" max={180} min={30} className="text-center" />
                                            <div className="absolute -bottom-3.5 left-0 w-full text-center text-[9px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">DIA</div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                        {mode === 'peds' ? (
                            <>
                                <SubHeader title="General" />
                                <TextArea label="General Appearance" placeholder="State of health, Distress, Alertness, Consolability, Dysmorphisms..." modeConfig={currentConfig} />
                                
                                <SubHeader title="Skin" />
                                <TextArea label="Skin Findings" placeholder="Color, Texture, Turgor, Rashes, Birthmarks, Jaundice, Cyanosis..." modeConfig={currentConfig} />

                                <SubHeader title="Head & Neck (HEENT)" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Head" placeholder="Shape, Fontanelles (Flat/Soft/Bulging?)..." modeConfig={currentConfig} />
                                    <TextArea label="Eyes" placeholder="Red reflex, Pupils, EOM, Alignment..." modeConfig={currentConfig} />
                                    <TextArea label="Ears" placeholder="Position, TM mobility/erythema..." modeConfig={currentConfig} />
                                    <TextArea label="Nose/Throat" placeholder="Patency, Mucosa, Teeth, Palate..." modeConfig={currentConfig} />
                                    <TextArea label="Neck" placeholder="Mobility, Masses, Nodes, Torticollis..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="Chest & Cardio" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Lungs" placeholder="Work of breathing, Retractions, Aeration, Sounds..." modeConfig={currentConfig} />
                                    <TextArea label="Heart" placeholder="Rhythm, Murmurs, Femoral Pulses..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="Abdomen & GU" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Abdomen" placeholder="Shape, Umbilicus, Soft, Masses, Organomegaly..." modeConfig={currentConfig} />
                                    <TextArea label="Genitalia" placeholder="Normal M/F, Testes descended, Adhesions, Anus patency..." modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="MSK & Neuro" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Musculoskeletal" placeholder="Spine (sacral dimple), Clavicles, Hips (Barlow/Ortolani), Extremities..." modeConfig={currentConfig} />
                                    <TextArea label="Neurological" placeholder="Mental status, Tone, Strength, Primitive Reflexes..." modeConfig={currentConfig} />
                                </div>
                            </>
                        ) : (
                            <>
                                <SubHeader title="1. General" />
                                <TextArea label="General Appearance" placeholder="State of health, Distress, Build, Sexual Dev, Hygiene, Affect, Posture..." modeConfig={currentConfig} />

                                <SubHeader title="2. Skin" />
                                <TextArea label="Skin" placeholder="Moisture, Temp, Texture, Turgor, Color, Lesions, Hair, Nails..." modeConfig={currentConfig} />

                                <SubHeader title="3. HEENT" />
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <TextArea label="Head" placeholder="Skull, Scalp, Face" modeConfig={currentConfig} />
                                    <TextArea label="Eyes" placeholder="Acuity, Sclera, Pupils, EOMs, Fundi" modeConfig={currentConfig} />
                                    <TextArea label="Ears" placeholder="Canals, TMs, Acuity" modeConfig={currentConfig} />
                                    <TextArea label="Nose" placeholder="Mucosa, Septum, Sinuses" modeConfig={currentConfig} />
                                    <TextArea label="Throat/Mouth" placeholder="Mucosa, Teeth, Gums, Tongue, Tonsils, Pharynx" modeConfig={currentConfig} />
                                </div>

                                <SubHeader title="4. Neck" />
                                <TextArea label="Neck" placeholder="Stiffness, Trachea, Thyroid, Carotids, JVP, Nodes..." modeConfig={currentConfig} />

                                <SubHeader title="5. Thorax & Lungs" />
                                <TextArea label="Lungs" placeholder="Inspection (Excursion), Palpation, Percussion, Auscultation..." modeConfig={currentConfig} />

                                <SubHeader title="6. Breasts & Axillae" />
                                <TextArea label="Breasts" placeholder="Inspection, Palpation (Masses), Nipples, Nodes..." modeConfig={currentConfig} />

                                <SubHeader title="7. Cardiovascular" />
                                <TextArea label="Heart" placeholder="Precordium (PMI), Sounds (S1, S2), Murmurs, Gallops, Rubs..." modeConfig={currentConfig} />

                                <SubHeader title="8. Abdomen" />
                                <TextArea label="Abdomen" placeholder="Contour, Bowel Sounds, Percussion (Liver/Spleen), Palpation (Tenderness/Masses)..." modeConfig={currentConfig} />

                                <SubHeader title="9. Extremities" />
                                <TextArea label="Extremities" placeholder="Warmth, Edema, Pulses (Radial, Femoral, DP/PT)..." modeConfig={currentConfig} />

                                <SubHeader title="10. Musculoskeletal" />
                                <TextArea label="MSK" placeholder="Deformities, Swelling, Erythema, ROM, Tenderness..." modeConfig={currentConfig} />

                                <SubHeader title="11. Neurological" />
                                <TextArea label="Neurological" placeholder="Mental Status, CN I-XII, Motor (Tone/Bulk/Power), Sensory, Reflexes, Cerebellar, Gait..." modeConfig={currentConfig} />

                                <SubHeader title="12. Genital & Rectal" />
                                <TextArea label="Genital / Rectal" placeholder="If indicated..." modeConfig={currentConfig} />
                            </>
                        )}

                        </Section>
                    </div>

                    {/* SECTION 6: PLAN */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
                        <Section 
                            id="plan"
                            title="Assessment & Plan" 
                            icon={<CheckCircleIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['plan']}
                            onToggle={() => toggleSection('plan')}
                        >
                        <TextArea label="Impression" placeholder="Summary of findings..." className="font-medium text-lg" modeConfig={currentConfig} />
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                            <TextArea label="DDx" placeholder="Differentials" modeConfig={currentConfig} />
                            <TextArea label="Plan" placeholder="Investigations & Management" modeConfig={currentConfig} />
                        </div>
                        </Section>
                    </div>
                </div>

            </main>
        </div>
      </div>

      {/* --- Floating Action Bar (Glass) --- */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-md sm:w-auto animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
         <div className="flex items-center justify-between gap-1.5 p-2 rounded-full border border-slate-200/50 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] backdrop-blur-2xl ring-1 ring-white/50 dark:ring-white/10">
             <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95">
               <span>Clear</span>
             </button>
             
             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/50"></div>

             <button 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-10 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:brightness-110 active:scale-95 hover:shadow-xl ${currentConfig.accentBg} hover:shadow-${currentConfig.color}-500/30`}
             >
               <span className="hidden sm:inline">Save Record</span>
               <span className="sm:hidden">Save</span>
             </button>

             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/50"></div>

             <button className="group flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-8 py-4 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-200 active:scale-95">
               <SparklesIcon className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
               <span>Assist</span>
             </button>
         </div>
      </div>

    </div>
  );
};

export default App;