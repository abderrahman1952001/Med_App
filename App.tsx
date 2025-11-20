import React, { useState, useEffect, useRef } from 'react';
import { ClinicalMode, ModeConfig } from './types';
import { Section, Input, Select, TextArea, CheckboxGroup, ContextBadge, ModuleContext } from './components/FormElements';
import { UserIcon, ActivityIcon, HistoryIcon, ClipboardIcon, StethoscopeIcon, CheckCircleIcon, SparklesIcon, SunIcon, MoonIcon } from './components/Icons';

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
  { id: 'background', title: 'Background', icon: <ClipboardIcon /> },
  { id: 'exam', title: 'Examination', icon: <StethoscopeIcon /> },
  { id: 'plan', title: 'Assessment & Plan', icon: <CheckCircleIcon /> },
];

// Helper for smart number input
const NumberInput = ({ placeholder, max, min, decimals = 0, className = "" }: { placeholder?: string, max?: number, min?: number, decimals?: number, className?: string }) => {
    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        let val = target.value;
        
        // Allow empty
        if (val === '') return;

        // Limit length based on max value approx digits (3 digits usually)
        if (val.length > 4) {
            target.value = val.slice(0, 4);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
         const target = e.currentTarget;
         // Optional validation or formatting logic could go here
    }

    return (
        <input 
            type="number"
            inputMode="decimal"
            placeholder={placeholder}
            onInput={handleInput}
            onBlur={handleBlur}
            className={`w-full bg-transparent text-3xl font-bold text-slate-900 dark:text-white focus:outline-none placeholder-slate-200 dark:placeholder-slate-800 appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${className}`}
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
    
    // Basic validation
    if (isNaN(h) || isNaN(w) || h === 0) {
        setBmi(null);
        return;
    }

    // BMI = kg / m^2
    // Height comes in cm, convert to meters
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
      // Strict Number Check: allow only digits
      if (val === '' || /^\d+$/.test(val)) {
          setAge(val);
      }
  };

  const handleAgeBlur = () => {
      if (!age) return;
      const num = parseInt(age, 10);
      const currentYear = new Date().getFullYear();

      // Logic: If user enters a likely birth year (e.g., 1900 - currentYear), calculate age.
      if (num > 1900 && num <= currentYear) {
          const calculatedAge = currentYear - num;
          setAge(calculatedAge.toString());
      }
  };

  // --- Scroll Spy ---
  useEffect(() => {
    const handleScroll = () => {
      // If we are manually scrolling via click, ignore this event to prevent jumping
      if (isManualScrolling.current) return;

      const scrollPosition = window.scrollY;
      const triggerPoint = scrollPosition + 300; // Look ahead/mid-screen

      let current = activeSectionId;

      // Find the section that is currently most relevant
      for (const section of SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          // Adjust offsetTop for header
          const adjustedTop = offsetTop - 140;
          
          if (triggerPoint >= adjustedTop && triggerPoint < adjustedTop + offsetHeight + 100) {
            current = section.id;
            // We don't break here immediately because overlapping sections might need logic, 
            // but usually top-down this works fine.
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

  // --- Actions ---
  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToSection = (id: string) => {
    if (activeSectionId === id) return;

    // Lock scroll spy
    isManualScrolling.current = true;
    
    // Immediate UI feedback
    setActiveSectionId(id);
    setExpandedSections(prev => ({ ...prev, [id]: true }));
    
    // Wait for expansion animation then scroll
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        const yOffset = -110; // Header offset
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({ top: y, behavior: 'smooth' });

        // Unlock after scroll animation duration (approx 800ms)
        setTimeout(() => {
            isManualScrolling.current = false;
        }, 800);
      } else {
          isManualScrolling.current = false;
      }
    }, 50);
  };

  // --- Pro Sidebar Component ---
  const Sidebar = () => (
    <aside className="hidden xl:block fixed top-32 left-0 h-[calc(100vh-8rem)] w-80 pl-8 z-30 pointer-events-none">
        <div className="pointer-events-auto relative h-full flex flex-col">
            
            {/* Timeline Track */}
            <div className="absolute left-[3.25rem] top-4 bottom-20 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

            <nav className="space-y-8 relative z-10 pt-2">
                {SECTIONS.map((item) => {
                    const isActive = activeSectionId === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => scrollToSection(item.id)}
                            className="group flex items-center gap-6 w-full text-left relative outline-none"
                        >
                            {/* Timeline Node (Dot) */}
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

                            {/* Label Container */}
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
                                <span className={`text-sm font-bold uppercase tracking-wide transition-colors duration-300 ${isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                                    {item.title}
                                </span>
                            </div>
                        </button>
                    )
                })}
            </nav>

            {/* Footer Theme Toggle */}
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
    <div className="relative min-h-screen transition-colors duration-500 ease-in-out bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-900 dark:selection:text-indigo-200 font-sans">
      
      {/* --- Ambient Background Lighting --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-noise opacity-[0.03] dark:opacity-20 mix-blend-soft-light"></div>
        {/* Dynamic Blob based on mode */}
        <div 
          className={`absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-[100%] blur-[120px] opacity-30 dark:opacity-20 transition-colors duration-1000 ease-in-out ${currentConfig.accentBg}`}
        ></div>
         <div 
          className={`absolute top-[40%] left-[10%] w-[600px] h-[600px] rounded-[100%] blur-[100px] opacity-20 dark:opacity-10 transition-colors duration-1000 ease-in-out ${currentConfig.accentBg}`}
        ></div>
      </div>

      {/* --- Header --- */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-slate-950/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/50 transition-all duration-300">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-sm border border-slate-200 dark:border-white/10`}>
                <svg className={`h-6 w-6 transition-colors duration-500 ${currentConfig.accentText}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none mb-1">
                  Nexus Clinical
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mode</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentConfig.accentText}`}>{currentConfig.label}</span>
                </div>
              </div>
            </div>

            {/* Modern Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5 rounded-full backdrop-blur-md shadow-sm dark:shadow-xl overflow-x-auto scrollbar-hide">
              {(Object.keys(MODES) as ClinicalMode[]).map((m) => {
                const isActive = mode === m;
                const conf = MODES[m];
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`relative whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all duration-500 cubic-bezier(0.2, 0, 0, 1) ${
                      isActive 
                        ? 'text-white shadow-lg bg-slate-800 dark:bg-slate-700 scale-100' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                  >
                     {isActive && (
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${conf.accentBg} shadow-[0_0_8px_rgba(var(--color-accent),0.5)]`}></div>
                     )}
                     <span className={isActive ? "ml-4" : ""}>{conf.label}</span>
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
            <main className="flex-1 w-full min-w-0 xl:pl-80 py-8 pb-48">
                
                {/* Wrapper div for staggered animation on content */}
                <div className="space-y-8">
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
                                <Input label="Patient Name" placeholder="Last Name, First Name" modeConfig={currentConfig} />
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                <Input 
                                  label="Age / DOB" 
                                  placeholder="34" 
                                  modeConfig={currentConfig} 
                                  inputMode="numeric"
                                  value={age}
                                  onChange={handleAgeChange}
                                  onBlur={handleAgeBlur}
                                  suffix={age ? 'yo' : ''}
                                />
                            </div>
                            <div className="col-span-6 sm:col-span-3">
                                <Select label="Gender" options={['Female', 'Male', 'Non-Binary', 'Other']} modeConfig={currentConfig} />
                            </div>
                        </div>
                        
                        {/* Anthropometry Moved Here */}
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
                            <div className="col-span-2 flex flex-col justify-center pb-2 px-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Body Mass Index</span>
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-3xl font-black tracking-tight ${bmi ? 'text-slate-800 dark:text-slate-100' : 'text-slate-300 dark:text-slate-700'}`}>
                                        {bmi || '--.-'}
                                    </span>
                                    <span className="text-sm font-bold text-slate-400">kg/m²</span>
                                </div>
                            </div>
                         </div>

                        {mode === 'peds' && (
                            <ModuleContext modeConfig={currentConfig}>
                            <ContextBadge label="Pediatric Guardian" modeConfig={currentConfig} />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input label="Caregiver Name" placeholder="Accompanying adult" modeConfig={currentConfig} />
                                <Input label="Relationship" placeholder="e.g. Mother" modeConfig={currentConfig} />
                            </div>
                            </ModuleContext>
                        )}

                        <div className="mt-2">
                            <Select label="Privacy & Chaperone" options={['Alone', 'With Family', 'Chaperone Present', 'Chaperone Declined']} modeConfig={currentConfig} />
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
                            <Input 
                                label="Presenting Complaint" 
                                placeholder={mode === 'peds' ? "Caregiver's main worry..." : "Patient's main symptom..."}
                                className="text-2xl py-6 font-semibold tracking-tight" // Larger text for importance
                                modeConfig={currentConfig} 
                                autoFocus
                            />
                            {/* Decorative corner accent */}
                            <div className={`absolute top-0 right-0 w-4 h-4 rounded-full opacity-50 ${currentConfig.accentBg} blur-[4px]`}></div>
                        </div>

                        {mode === 'peds' && (
                            <div className="mt-6">
                                <Input label="Specific Parental Concern" placeholder="What are they most worried about?" modeConfig={currentConfig} />
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
                            <Input label="Duration" placeholder="e.g. 3 days" modeConfig={currentConfig} />
                            <Input label="Secondary Issues" placeholder="Other complaints" modeConfig={currentConfig} />
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
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Input label="Onset Pattern" placeholder="Sudden vs Gradual" modeConfig={currentConfig} />
                            <Input label="Context" placeholder="At rest, with exertion..." modeConfig={currentConfig} />
                        </div>

                        {mode === 'obgyn' && (
                            <ModuleContext modeConfig={currentConfig}>
                            <ContextBadge label="Cycle Context" modeConfig={currentConfig} />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Select label="Timing" options={['Unrelated', 'During Menses', 'Ovulation', 'Post-coital']} modeConfig={currentConfig} />
                                <Select label="Flow" options={['Normal', 'Heavy', 'Clots', 'Spotting']} modeConfig={currentConfig} />
                            </div>
                            </ModuleContext>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <Input label="Location" placeholder="Anatomical site" modeConfig={currentConfig} />
                            <Input label="Character / Severity" placeholder="Sharp, dull (1-10)" modeConfig={currentConfig} />
                        </div>

                        <TextArea label="Aggravating & Relieving Factors" placeholder="Better with...? Worse with...?" modeConfig={currentConfig} />

                        {mode === 'peds' && (
                            <ModuleContext modeConfig={currentConfig}>
                            <ContextBadge label="Functional Impact" modeConfig={currentConfig} />
                            <div className="grid grid-cols-3 gap-4">
                                <Input label="Feeding" placeholder="Vol/Freq" modeConfig={currentConfig} />
                                <Input label="Wet Diapers" placeholder="Count" modeConfig={currentConfig} />
                                <Input label="Activity" placeholder="Behavior" modeConfig={currentConfig} />
                            </div>
                            </ModuleContext>
                        )}

                        <CheckboxGroup 
                            label="Review of Systems"
                            items={['Fever', 'Wt Loss', 'Night Sweats', 'Cough', 'Chest Pain', 'Vomiting', 'Dysuria', 'Headache', 'Rash', 'Fatigue']}
                            modeConfig={currentConfig}
                        />

                        {mode === 'obgyn' && (
                            <ModuleContext modeConfig={currentConfig}>
                            <ContextBadge label="Red Flags" modeConfig={currentConfig} />
                            <CheckboxGroup
                                label="Critical Symptoms"
                                items={['Heavy Bleeding', 'Severe Pain', 'Shoulder Tip Pain', 'Syncope', 'Foul Discharge']}
                                modeConfig={currentConfig}
                            />
                            </ModuleContext>
                        )}

                        <TextArea label="Patient Perspective (ICE)" placeholder="Ideas, Concerns, Expectations..." modeConfig={currentConfig} />
                        </Section>
                    </div>

                    {/* SECTION 3: BACKGROUND */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
                        <Section 
                            id="background"
                            title="Medical Background" 
                            icon={<ClipboardIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['background']}
                            onToggle={() => toggleSection('background')}
                        >
                        
                        {mode === 'obgyn' && (
                            <ModuleContext modeConfig={currentConfig}>
                            <ContextBadge label="Obs / Gyn History" modeConfig={currentConfig} />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                <Input label="LMP" type="date" modeConfig={currentConfig} />
                                <Input label="Cycles" placeholder="e.g. 28/5 Reg" modeConfig={currentConfig} />
                                <Input label="Parity" placeholder="G_ P_ A_" modeConfig={currentConfig} />
                            </div>
                            </ModuleContext>
                        )}

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextArea label="PMH" placeholder="Chronic conditions..." modeConfig={currentConfig} />
                            <TextArea label="Surgical Hx" placeholder="Procedures & dates..." modeConfig={currentConfig} />
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextArea label="Medications" placeholder="Dose & frequency..." modeConfig={currentConfig} />
                            <TextArea label="Allergies" placeholder="Reactions..." modeConfig={currentConfig} />
                        </div>
                        <Input label="Social History" placeholder="Job, Smoking, Alcohol, Home Setup..." modeConfig={currentConfig} />
                        </Section>
                    </div>

                    {/* SECTION 4: EXAM */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '400ms' }}>
                        <Section 
                            id="exam"
                            title="Physical Examination" 
                            icon={<StethoscopeIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['exam']}
                            onToggle={() => toggleSection('exam')}
                        >
                        
                        <div className="bg-slate-100/50 dark:bg-slate-900/30 rounded-3xl p-6 border border-dashed border-slate-300 dark:border-slate-700/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></div>
                                <label className="text-base font-bold uppercase tracking-wider text-slate-500">Vital Signs</label>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                                {/* Standard Vitals */}
                                {VITALS_CONFIG.map(vital => (
                                    <div key={vital.id} className="relative flex flex-col items-start justify-between rounded-2xl bg-white dark:bg-slate-950 p-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group focus-within:border-indigo-400 dark:focus-within:border-indigo-500">
                                        <span className="text-base font-extrabold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">{vital.label}</span>
                                        <div className="relative w-full">
                                            <NumberInput placeholder="--" max={vital.max} min={vital.min} decimals={vital.decimals} />
                                            <span className="absolute right-0 bottom-1 text-xs font-semibold text-slate-400 pointer-events-none">{vital.unit}</span>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* BP Special Dual Input Card */}
                                <div className="col-span-2 relative flex flex-col items-start justify-between rounded-2xl bg-white dark:bg-slate-950 p-4 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 group focus-within:border-indigo-400 dark:focus-within:border-indigo-500">
                                     <span className="text-base font-extrabold text-slate-500 dark:text-slate-400 mb-1 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">BP (mmHg)</span>
                                     <div className="flex items-end w-full gap-2">
                                         <div className="relative w-full">
                                            <NumberInput placeholder="Sys" max={250} min={50} className="text-center" />
                                            <div className="absolute -bottom-3 left-0 w-full text-center text-[9px] uppercase font-bold text-slate-400">Sys</div>
                                         </div>
                                         <span className="text-2xl text-slate-300 dark:text-slate-600 pb-1">/</span>
                                         <div className="relative w-full">
                                            <NumberInput placeholder="Dia" max={180} min={30} className="text-center" />
                                            <div className="absolute -bottom-3 left-0 w-full text-center text-[9px] uppercase font-bold text-slate-400">Dia</div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <Input label="General Appearance" placeholder="Alert, distress, pallor?" modeConfig={currentConfig} />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextArea label="Cardiovascular" placeholder="HS I+II +0" modeConfig={currentConfig} />
                            <TextArea label="Respiratory" placeholder="Air entry, added sounds" modeConfig={currentConfig} />
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextArea label="Abdomen" placeholder="Soft, non-tender" modeConfig={currentConfig} />
                            <TextArea label="Neurological" placeholder="GCS 15, focality" modeConfig={currentConfig} />
                        </div>

                        {mode === 'peds' && (
                            <ModuleContext modeConfig={currentConfig}>
                            <ContextBadge label="Peds Specifics" modeConfig={currentConfig} />
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input label="ENT / Head" placeholder="Fontanelles, TM, Throat" modeConfig={currentConfig} />
                                <Input label="Hydration" placeholder="Turgor, CRT" modeConfig={currentConfig} />
                            </div>
                            </ModuleContext>
                        )}
                        </Section>
                    </div>

                    {/* SECTION 5: PLAN */}
                    <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '500ms' }}>
                        <Section 
                            id="plan"
                            title="Assessment & Plan" 
                            icon={<CheckCircleIcon />} 
                            modeConfig={currentConfig}
                            isOpen={!!expandedSections['plan']}
                            onToggle={() => toggleSection('plan')}
                        >
                        <TextArea label="Impression" placeholder="Summary of findings..." className="font-medium min-h-[140px] text-lg" modeConfig={currentConfig} />
                        
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <TextArea label="DDx" placeholder="Differentials" modeConfig={currentConfig} />
                            <TextArea label="Plan" placeholder="Investigations & Management" modeConfig={currentConfig} />
                        </div>

                        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 mt-4">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Select label="Disposition" options={['Discharge Home', 'Follow Up Required', 'Specialist Referral', 'Admit to Ward', 'Admit to ICU']} modeConfig={currentConfig} />
                                <Input label="Safety Netting" placeholder="Red flag advice given..." modeConfig={currentConfig} />
                            </div>
                        </div>
                        </Section>
                    </div>
                </div>

            </main>
        </div>
      </div>

      {/* --- Floating Action Bar (Glass) --- */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-md sm:w-auto animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
         <div className="flex items-center justify-between gap-1.5 p-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-black/20">
             <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 active:scale-95">
               <span>Clear</span>
             </button>
             
             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/50"></div>

             <button 
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-10 py-4 text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 hover:shadow-xl ${currentConfig.accentBg}`}
             >
               <span className="hidden sm:inline">Save Record</span>
               <span className="sm:hidden">Save</span>
             </button>

             <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/50"></div>

             <button className="group flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-bold text-indigo-600 dark:text-indigo-300 transition-all hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:text-indigo-700 dark:hover:text-indigo-200 active:scale-95">
               <SparklesIcon className="h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
               <span>Assist</span>
             </button>
         </div>
      </div>

    </div>
  );
};

export default App;