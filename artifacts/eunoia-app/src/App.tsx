import { type ButtonHTMLAttributes, type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Brain,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CircleUserRound,
  CloudRain,
  Eye,
  EyeOff,
  Frown,
  Heart,
  Home as HomeIcon,
  Info,
  Leaf,
  LockKeyhole,
  LogOut,
  Mail,
  Meh,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Pencil,
  Search,
  ShieldCheck,
  Sparkles,
  Smile,
  Sparkle,
  Sun,
  Target,
  TrendingUp,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Mood = 'steady' | 'bright' | 'tender' | 'heavy' | null;
type Period = '7 days' | '30 days' | '3 months';

type AppState = {
  userName: string;
  mood: Mood;
  screeningStep: number;
  screeningComplete: boolean;
  savedResources: string[];
  notifications: boolean;
  profileName: string;
};

const navItems: Array<{ label: string; href: string; icon: LucideIcon; id: string }> = [
  { label: 'Home', href: '/app', icon: HomeIcon, id: 'home' },
  { label: 'Insights', href: '/app/insights', icon: Sparkles, id: 'insights' },
  { label: 'Resources', href: '/app/resources', icon: BookOpen, id: 'resources' },
  { label: 'Profile', href: '/app/profile', icon: CircleUserRound, id: 'profile' },
];

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" data-testid="link-logo">
      <span className={`grid size-10 place-items-center rounded-[13px] ${inverse ? 'bg-secondary text-primary' : 'bg-primary text-secondary'}`}>
        <Leaf size={20} strokeWidth={2.2} />
      </span>
      <span className={`font-display text-[25px] tracking-[.12em] ${inverse ? 'text-background' : 'text-primary'}`}>EUNOIA</span>
    </Link>
  );
}

function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' | 'outline' | 'gold' }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg',
    quiet: 'bg-primary/8 text-primary hover:bg-primary/13',
    outline: 'border border-border bg-card/70 text-primary hover:border-primary/35 hover:bg-primary/5',
    gold: 'bg-secondary text-secondary-foreground hover:-translate-y-0.5 hover:shadow-lg',
  };
  return (
    <button className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-2 text-xs font-semibold text-primary shadow-sm transition hover:border-primary/35 hover:bg-muted"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-testid="button-theme-toggle"
    >
      {isDark ? <Sun size={15} /> : <Moon size={15} />}
      <span className="hidden sm:inline">{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}

function Onboarding({ onEnter, isDark, onToggleTheme }: { onEnter: () => void; isDark: boolean; onToggleTheme: () => void }) {
  const [step, setStep] = useState(0);
  const slides = [
    {
      eyebrow: 'A softer place to land',
      title: 'Make room for how you really feel.',
      body: 'EUNOIA is a private space to check in with yourself, notice patterns, and find small ways forward — without judgment or pressure.',
      icon: Heart,
      note: 'Your wellbeing belongs to you.',
    },
    {
      eyebrow: 'Built around your privacy',
      title: 'Your thoughts stay personal.',
      body: 'Your reflections are yours. We keep your experience gentle and clear, with no public profiles, no social feed, and no performance to keep up with.',
      icon: LockKeyhole,
      note: 'Private by design. Supportive by nature.',
    },
    {
      eyebrow: 'A helpful starting point',
      title: 'Understand the signal, not a label.',
      body: 'Our optional wellbeing screening can help you notice when extra support may be useful. It is not a diagnosis and never replaces care from a qualified professional.',
      icon: Sparkles,
      note: 'Small check-ins. More self-understanding.',
    },
  ];
  const current = slides[step];
  const Icon = current.icon;
  return (
    <main className="min-h-[100dvh] overflow-hidden bg-background text-foreground">
      <div className="grid min-h-[100dvh] lg:grid-cols-[minmax(390px,42%)_1fr]">
        <section className="relative hidden overflow-hidden bg-primary p-10 text-background lg:flex lg:flex-col lg:justify-between lg:p-14">
          <div className="absolute -right-32 -top-28 size-[470px] rounded-full border border-secondary/15" />
          <div className="absolute -bottom-48 -left-44 size-[540px] rounded-full border border-secondary/10" />
          <div className="relative z-10">
            <Logo inverse />
            <p className="mt-28 max-w-sm font-display text-[clamp(42px,5vw,70px)] leading-[.98] tracking-[-.04em]">A kinder way to meet yourself.</p>
          </div>
          <div className="relative z-10 flex items-end justify-between gap-6">
            <p className="max-w-[240px] text-sm leading-6 text-background/65">A private wellbeing companion for the days that feel clear — and the ones that don’t.</p>
            <div className="grid size-24 shrink-0 place-items-center rounded-full border border-secondary/35 bg-secondary/10">
              <Leaf className="text-secondary" size={32} />
            </div>
          </div>
        </section>
        <section className="surface-grid flex min-h-[100dvh] flex-col px-6 py-7 sm:px-10 sm:py-10 lg:px-[clamp(50px,8vw,130px)] lg:py-14">
          <div className="flex items-center justify-between lg:justify-end">
            <div className="lg:hidden"><Logo /></div>
            <div className="flex items-center gap-3">
              <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
              <button onClick={onEnter} className="text-sm font-semibold text-muted-foreground transition hover:text-primary" data-testid="button-onboarding-skip">Skip for now</button>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col justify-center py-12">
            <div className="mb-10 flex items-center gap-2">
              {slides.map((slide, index) => (
                <div key={slide.eyebrow} className={`h-1.5 rounded-full transition-all duration-300 ${index === step ? 'w-12 bg-primary' : index < step ? 'w-7 bg-primary/50' : 'w-7 bg-border'}`} />
              ))}
              <span className="ml-2 text-xs font-semibold uppercase tracking-[.15em] text-muted-foreground">{String(step + 1).padStart(2, '0')} / 03</span>
            </div>
            <div key={step} className="page-enter">
              <div className="mb-8 grid size-16 place-items-center rounded-[22px] bg-secondary/45 text-primary shadow-sm">
                <Icon size={29} strokeWidth={1.7} />
              </div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[.17em] text-accent">{current.eyebrow}</p>
              <h1 className="max-w-lg font-display text-[clamp(43px,6vw,72px)] leading-[.96] tracking-[-.045em] text-primary">{current.title}</h1>
              <p className="mt-7 max-w-[480px] text-[17px] leading-8 text-muted-foreground">{current.body}</p>
              <div className="mt-9 flex items-center gap-2 text-sm font-semibold text-primary"><span className="grid size-6 place-items-center rounded-full bg-primary/10"><Check size={14} /></span>{current.note}</div>
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-[560px] items-center justify-between border-t border-border pt-6">
            <p className="hidden text-xs leading-5 text-muted-foreground sm:block">You can change your preferences anytime.</p>
            <Button className="ml-auto min-w-[150px]" onClick={() => (step < slides.length - 1 ? setStep(step + 1) : onEnter())} data-testid="button-onboarding-next">
              {step < slides.length - 1 ? <>Continue <ArrowRight size={17} /></> : <>Enter EUNOIA <ArrowRight size={17} /></>}
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Auth({ onSuccess, isDark, onToggleTheme }: { onSuccess: (name: string) => void; isDark: boolean; onToggleTheme: () => void }) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [socialMessage, setSocialMessage] = useState('');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (mode === 'create' && name.trim().length < 2) next.name = 'Tell us what we should call you.';
    if (!email.includes('@')) next.email = 'Enter a valid email address.';
    if (password.length < 6) next.password = 'Use at least 6 characters.';
    setErrors(next);
    if (Object.keys(next).length === 0) onSuccess(mode === 'create' ? name.trim() : 'Maya');
  };
  const switchMode = (nextMode: 'signin' | 'create') => {
    setMode(nextMode);
    setErrors({});
    setSocialMessage('');
  };
  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="grid min-h-[100dvh] lg:grid-cols-[.82fr_1.18fr]">
        <section className="relative hidden overflow-hidden bg-primary p-12 text-background lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(var(--secondary) / .3), transparent 32%), radial-gradient(circle at 10% 90%, hsl(var(--accent) / .2), transparent 35%)' }} />
          <div className="relative z-10"><Logo inverse /></div>
          <div className="relative z-10 max-w-md">
            <span className="mb-6 inline-flex rounded-full border border-secondary/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.16em] text-secondary">A quiet beginning</span>
            <h1 className="font-display text-6xl leading-[.95] tracking-[-.04em]">You don’t have to have it all figured out.</h1>
            <p className="mt-7 max-w-sm leading-7 text-background/65">Start with one honest check-in. EUNOIA is here to help you listen a little closer.</p>
          </div>
          <p className="relative z-10 text-xs text-background/45">Private wellbeing support for your everyday life.</p>
        </section>
        <section className="surface-grid flex flex-col px-6 py-7 sm:px-10 lg:px-[clamp(60px,10vw,160px)] lg:py-10">
           <div className="flex items-center justify-between lg:justify-end gap-3"><div className="lg:hidden"><Logo /></div><div className="flex items-center gap-3"><ThemeToggle isDark={isDark} onToggle={onToggleTheme} /><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary" data-testid="link-back-onboarding"><ChevronLeft size={17} /> Back</Link></div></div>
          <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-10">
            <div className="mb-9">
              <p className="mb-3 text-sm font-bold uppercase tracking-[.16em] text-accent">{mode === 'signin' ? 'Welcome back' : 'Make space for yourself'}</p>
              <h2 className="font-display text-[clamp(42px,6vw,61px)] leading-none tracking-[-.045em] text-primary">{mode === 'signin' ? 'Good to see you.' : 'Begin gently.'}</h2>
              <p className="mt-4 leading-7 text-muted-foreground">{mode === 'signin' ? 'Your personal space is waiting.' : 'A few details, then your private space is ready.'}</p>
            </div>
            <div className="mb-7 grid grid-cols-2 rounded-full bg-muted p-1">
              {(['signin', 'create'] as const).map((item) => <button key={item} onClick={() => switchMode(item)} className={`rounded-full py-2.5 text-sm font-semibold transition ${mode === item ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`} data-testid={`button-auth-${item}`}>{item === 'signin' ? 'Sign in' : 'Create account'}</button>)}
            </div>
            <button type="button" onClick={() => onSuccess('Maya')} className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card py-3.5 text-sm font-semibold text-primary transition hover:border-primary/40 hover:bg-primary/5" data-testid="button-social-signin">
              <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-primary">G</span> Continue with Google
            </button>
            {socialMessage && <p className="mt-2 text-center text-xs text-accent">{socialMessage}</p>}
            <div className="my-7 flex items-center gap-4 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" /> or use email <span className="h-px flex-1 bg-border" /></div>
            <form onSubmit={submit} className="space-y-4">
              {mode === 'create' && <Field label="Your name" value={name} onChange={setName} placeholder="What should we call you?" icon={UserRound} error={errors.name} testId="input-name" />}
              <Field label="Email address" value={email} onChange={setEmail} placeholder="you@example.com" type="email" autoComplete="email" icon={Mail} error={errors.email} testId="input-email" />
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-primary">Password</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" className={`h-12 w-full rounded-2xl border bg-card pl-11 pr-12 text-sm text-primary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/8 ${errors.password ? 'border-destructive' : 'border-input'}`} data-testid="input-password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-primary" data-testid="button-toggle-password">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-destructive" data-testid="text-password-error">{errors.password}</p>}
              </div>
              {mode === 'signin' && <div className="flex justify-end"><button type="button" className="text-xs font-semibold text-primary underline-offset-4 hover:underline" data-testid="button-forgot-password">Forgot password?</button></div>}
              <Button type="submit" className="mt-2 w-full py-3.5" data-testid="button-auth-submit">{mode === 'signin' ? 'Open my space' : 'Create my space'} <ArrowRight size={17} /></Button>
            </form>
            <p className="mt-7 text-center text-xs leading-5 text-muted-foreground">By continuing, you agree to EUNOIA’s thoughtful use of your information. <span className="font-semibold text-primary">No diagnosis. No judgment.</span></p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text', autoComplete, icon: Icon, error, testId }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; type?: string; autoComplete?: string; icon: LucideIcon; error?: string; testId: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-primary">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input value={value} onChange={(event) => onChange(event.target.value)} type={type} autoComplete={autoComplete} placeholder={placeholder} className={`h-12 w-full rounded-2xl border bg-card pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/8 ${error ? 'border-destructive' : 'border-input'}`} data-testid={testId} />
      </div>
      {error && <p className="mt-1.5 text-xs text-destructive" data-testid={`text-${testId}-error`}>{error}</p>}
    </div>
  );
}

function AppShell({ active, children, userName, onSignOut, isDark, onToggleTheme }: { active: string; children: ReactNode; userName: string; onSignOut: () => void; isDark: boolean; onToggleTheme: () => void }) {
  const firstName = userName.split(' ')[0];
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[248px] flex-col bg-primary px-5 py-7 text-background lg:flex">
        <Logo inverse />
        <div className="mt-16 px-3"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-background/40">Your space</p>
          <nav className="mt-4 space-y-1.5">
            {navItems.map(({ label, href, icon: Icon, id }) => <Link key={id} href={href} className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${active === id ? 'bg-secondary text-primary shadow-sm' : 'text-background/65 hover:bg-background/8 hover:text-background'}`} data-testid={`link-nav-${id}`}><Icon size={18} strokeWidth={active === id ? 2.3 : 1.8} /> {label}</Link>)}
          </nav>
        </div>
        <div className="mt-auto rounded-[22px] border border-background/10 bg-background/5 p-4">
          <div className="mb-3 grid size-9 place-items-center rounded-xl bg-accent/80 text-primary"><Heart size={17} /></div>
          <p className="text-sm font-semibold">A note for today</p><p className="mt-1 text-xs leading-5 text-background/55">You are allowed to take this one moment at a time.</p>
        </div>
        <button onClick={onSignOut} className="mt-5 flex items-center gap-3 px-3 text-xs font-semibold text-background/50 transition hover:text-background" data-testid="button-sidebar-signout"><LogOut size={16} /> Sign out</button>
      </aside>
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-12">
          <div className="lg:hidden"><Logo /></div>
          <div className="hidden lg:block"><p className="text-xs font-semibold uppercase tracking-[.16em] text-muted-foreground">A private space for {firstName}</p></div>
          <div className="flex items-center gap-3"><ThemeToggle isDark={isDark} onToggle={onToggleTheme} /><button className="grid size-10 place-items-center rounded-full border border-border bg-card text-primary transition hover:bg-muted" data-testid="button-help"><CircleHelp size={18} /></button><div className="grid size-10 place-items-center rounded-full bg-accent font-display text-lg text-primary" data-testid="avatar-user">{firstName[0]}</div></div>
        </header>
        <main className="page-enter mx-auto max-w-[1320px] px-5 pb-28 pt-8 sm:px-8 lg:px-12 lg:pb-12 lg:pt-11">{children}</main>
      </div>
      <nav className="fixed inset-x-4 bottom-4 z-30 grid grid-cols-4 rounded-[22px] border border-border/80 bg-card/95 p-1.5 shadow-xl backdrop-blur-md lg:hidden">
        {navItems.map(({ label, href, icon: Icon, id }) => <Link key={id} href={href} className={`flex flex-col items-center gap-1 rounded-[17px] py-2 text-[10px] font-semibold transition ${active === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`} data-testid={`link-mobile-nav-${id}`}><Icon size={18} />{label}</Link>)}
      </nav>
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.17em] text-accent">{eyebrow}</p><h1 className="font-display text-[clamp(39px,5vw,61px)] leading-none tracking-[-.045em] text-primary">{title}</h1>{description && <p className="mt-3 max-w-xl leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}

function Home({ state, setState, onSignOut, showToast }: { state: AppState; setState: (next: Partial<AppState>) => void; onSignOut: () => void; showToast: (message: string) => void }) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const questions = [
    { title: 'How has your mind been feeling lately?', body: 'There’s no right answer. Choose what feels closest today.', options: ['Mostly steady', 'A little stretched', 'Quite heavy'] },
    { title: 'How often have you felt able to enjoy things?', body: 'Think about the last two weeks, at your own pace.', options: ['Most days', 'Some days', 'Not often'] },
    { title: 'What kind of support would feel useful?', body: 'You can always change your mind later.', options: ['A little perspective', 'A place to reflect', 'Help finding support'] },
  ];
  const question = questions[state.screeningStep];
  const completeStep = () => {
    if (!selectedAnswer) return;
    if (state.screeningStep === questions.length - 1) {
      setState({ screeningComplete: true, screeningStep: 3 });
      showToast('Your check-in is saved privately.');
    } else {
      setState({ screeningStep: state.screeningStep + 1 });
      setSelectedAnswer('');
    }
  };
  return (
    <div>
      <div className="mb-9 flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold text-accent">Monday, October 14</p><h1 className="font-display text-[clamp(42px,6vw,65px)] leading-none tracking-[-.05em] text-primary">Good morning, {state.userName.split(' ')[0]}.</h1><p className="mt-4 text-muted-foreground">Let’s make a little room for how you’re feeling.</p></div><button className="hidden size-12 place-items-center rounded-full border border-border bg-card text-primary transition hover:bg-muted sm:grid" data-testid="button-home-more"><MoreHorizontal size={20} /></button></div>
      <div className="grid gap-6 xl:grid-cols-[1.28fr_.72fr]">
        <section className="relative overflow-hidden rounded-[28px] bg-primary p-6 text-background shadow-lg sm:p-9">
          <div className="absolute -right-16 -top-20 size-64 rounded-full border border-secondary/15" /><div className="absolute -bottom-28 right-14 size-64 rounded-full border border-accent/10" />
          {state.screeningComplete ? <div className="relative z-10 flex min-h-[265px] flex-col justify-between"><div><div className="mb-5 flex items-center gap-2 text-secondary"><span className="grid size-7 place-items-center rounded-full bg-secondary text-primary"><Check size={15} /></span><span className="text-xs font-bold uppercase tracking-[.15em]">Check-in complete</span></div><h2 className="max-w-md font-display text-4xl leading-[.98] tracking-[-.03em] sm:text-5xl">Thank yourself for checking in.</h2><p className="mt-5 max-w-md text-sm leading-6 text-background/65">Your answers suggest you may be carrying a little more than usual. This is a moment to be curious, not critical.</p></div><button onClick={() => { setState({ screeningComplete: false, screeningStep: 0 }); setSelectedAnswer(''); }} className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-secondary hover:underline" data-testid="button-retake-screening">Retake check-in <ArrowRight size={16} /></button></div> : <div className="relative z-10"><div className="mb-8 flex items-center justify-between"><span className="inline-flex items-center gap-2 rounded-full bg-background/10 px-3 py-1.5 text-xs font-semibold text-secondary"><Sparkles size={14} /> 2 minute check-in</span><span className="text-xs font-semibold text-background/50">{state.screeningStep + 1} of 3</span></div><h2 className="max-w-lg font-display text-4xl leading-[.98] tracking-[-.03em] sm:text-5xl">{question.title}</h2><p className="mt-4 max-w-md text-sm leading-6 text-background/65">{question.body}</p><div className="mt-7 grid gap-2 sm:grid-cols-3">{question.options.map((option) => <button key={option} onClick={() => setSelectedAnswer(option)} className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition ${selectedAnswer === option ? 'border-secondary bg-secondary text-primary' : 'border-background/15 bg-background/7 text-background/80 hover:border-secondary/50 hover:bg-background/12'}`} data-testid={`button-checkin-option-${option.toLowerCase().replaceAll(' ', '-')}`}>{option}</button>)}</div><div className="mt-7 flex items-center justify-between gap-4"><div className="flex gap-1.5">{questions.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-all ${index <= state.screeningStep ? 'w-8 bg-secondary' : 'w-5 bg-background/20'}`} />)}</div><Button variant="gold" onClick={completeStep} disabled={!selectedAnswer} className="px-4 py-2.5" data-testid="button-checkin-next">{state.screeningStep === 2 ? 'Save check-in' : 'Next'} <ChevronRight size={16} /></Button></div></div>}
        </section>
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="mb-7 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Today’s mood</p><h2 className="mt-2 font-display text-3xl tracking-[-.03em] text-primary">A quick read</h2></div><span className="grid size-10 place-items-center rounded-full bg-secondary/40 text-primary"><Sun size={19} /></span></div><div className="grid grid-cols-4 gap-2">{([{ label: 'Steady', icon: Meh, value: 'steady' }, { label: 'Bright', icon: Smile, value: 'bright' }, { label: 'Tender', icon: Frown, value: 'tender' }, { label: 'Heavy', icon: CloudRain, value: 'heavy' }] as const).map(({ label, icon: Icon, value }) => <button key={value} onClick={() => { setState({ mood: value }); showToast('Mood noted. Thank you for checking in.'); }} className={`flex flex-col items-center gap-2 rounded-2xl py-3 text-xs font-semibold transition ${state.mood === value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/8 hover:text-primary'}`} data-testid={`button-mood-${value}`}><Icon size={21} strokeWidth={1.7} />{label}</button>)}</div>{state.mood ? <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-primary"><Check size={15} className="text-accent" /> Noted for today. You can change this anytime.</p> : <p className="mt-6 text-xs leading-5 text-muted-foreground">No pressure to be positive. Just notice what’s here.</p>}</section>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[.92fr_1.08fr]">
        <section className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Your rhythm</p><h2 className="mt-2 font-display text-3xl tracking-[-.03em] text-primary">Screening progress</h2></div><span className="text-2xl font-semibold text-primary">{state.screeningComplete ? '100' : state.screeningStep * 33}<span className="text-sm text-muted-foreground">%</span></span></div><div className="mt-7 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${state.screeningComplete ? 100 : state.screeningStep * 33}%` }} /></div><div className="mt-5 flex items-center justify-between text-xs text-muted-foreground"><span>{state.screeningComplete ? 'Complete for today' : 'A few questions to go'}</span><span className="font-semibold text-primary">{state.screeningComplete ? 'Well done' : 'Optional'}</span></div></section>
        <section className="rounded-[28px] border border-border bg-secondary/35 p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-primary/55">A small insight</p><h2 className="mt-2 font-display text-3xl tracking-[-.03em] text-primary">You’ve been showing up.</h2></div><Sparkle className="text-accent" size={25} /></div><p className="mt-5 max-w-lg text-sm leading-6 text-primary/70">Even two minutes of noticing counts. Looking back at your check-ins can help you see what your mind may need next.</p><Link href="/app/insights" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary hover:gap-3 transition-all" data-testid="link-home-insights">Explore your insights <ArrowUpRight size={16} /></Link></section>
      </div>
    </div>
  );
}

function Insights({ state }: { state: AppState }) {
  const [period, setPeriod] = useState<Period>('7 days');
  const chartData = period === '7 days' ? [38, 47, 44, 58, 52, 63, 68] : period === '30 days' ? [28, 35, 31, 45, 40, 49, 56, 52, 61, 58, 66, 69] : [31, 42, 38, 54, 49, 63, 60, 68, 73, 71, 76, 79];
  const labels = period === '7 days' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : period === '30 days' ? ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28', '30', ''] : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return <div><PageHeading eyebrow="Your patterns" title="Insights" description="A gentle look at your wellbeing over time. Notice what’s here without turning it into a score." action={<div className="flex rounded-full bg-muted p-1">{(['7 days', '30 days', '3 months'] as Period[]).map((item) => <button key={item} onClick={() => setPeriod(item)} className={`rounded-full px-3 py-2 text-xs font-semibold transition sm:px-4 ${period === item ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`} data-testid={`button-period-${item.replaceAll(' ', '-')}`}>{item}</button>)}</div>} />
    <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]"><section className="rounded-[28px] border border-border bg-card p-6 shadow-sm sm:p-8"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Wellbeing trend</p><h2 className="mt-2 font-display text-3xl tracking-[-.03em] text-primary">Your steadiness is growing</h2><p className="mt-2 text-sm text-muted-foreground">Based on your check-ins, not a clinical measure.</p></div><div className="flex items-center gap-1.5 rounded-full bg-secondary/40 px-3 py-1.5 text-xs font-bold text-primary"><TrendingUp size={14} /> +12%</div></div><div className="mt-9 h-[210px] w-full"><svg viewBox="0 0 700 220" preserveAspectRatio="none" className="h-full w-full overflow-visible" aria-label="Wellbeing trend chart"><defs><linearGradient id="trendFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="hsl(14 65% 72% / .32)" /><stop offset="1" stopColor="hsl(14 65% 72% / 0)" /></linearGradient></defs>{[0, 1, 2, 3].map((line) => <line key={line} x1="0" x2="700" y1={35 + line * 52} y2={35 + line * 52} stroke="hsl(38 26% 87%)" strokeDasharray="4 6" />)}<polygon points={`0,220 ${chartData.map((value, i) => `${(i / (chartData.length - 1)) * 700},${220 - value * 2.4}`).join(' ')} 700,220`} fill="url(#trendFill)" /><polyline points={chartData.map((value, i) => `${(i / (chartData.length - 1)) * 700},${220 - value * 2.4}`).join(' ')} fill="none" stroke="hsl(177 35% 28%)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />{chartData.map((value, i) => <circle key={i} cx={(i / (chartData.length - 1)) * 700} cy={220 - value * 2.4} r="5" fill="hsl(42 42% 99%)" stroke="hsl(177 35% 28%)" strokeWidth="3" />)}</svg></div><div className="mt-2 flex justify-between text-xs font-semibold text-muted-foreground">{labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div></section><section className="rounded-[28px] bg-primary p-6 text-background shadow-lg sm:p-8"><div className="mb-10 flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary"><Target size={21} /></span><span className="text-xs font-bold uppercase tracking-[.15em] text-background/50">Signal</span></div><p className="font-display text-5xl leading-none text-secondary">3.8</p><p className="mt-2 text-sm font-semibold">out of 5, gentle steadiness</p><div className="mt-9 border-t border-background/15 pt-5 text-sm leading-6 text-background/65">Your recent check-ins point toward more moments of steadiness. Keep noticing what helps.</div></section></div>
    <section className="mt-6"><div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Screening snapshot</p><h2 className="mt-1 font-display text-3xl tracking-[-.03em] text-primary">A little more context</h2></div><button className="text-xs font-bold text-primary hover:underline" data-testid="button-insights-info">How this works</button></div><div className="grid gap-4 md:grid-cols-3">{[{ icon: Brain, title: 'Mood balance', value: 'Feeling mixed', text: 'You’ve made space for both light and heavy moments.' }, { icon: Moon, title: 'Rest & reset', value: 'Worth noticing', text: 'A calmer evening rhythm may help your energy.' }, { icon: Heart, title: 'Self-kindness', value: 'A strength', text: 'You’re returning to yourself with honesty.' }].map(({ icon: Icon, title, value, text }) => <article key={title} className="rounded-[24px] border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-muted text-primary"><Icon size={19} /></span><ArrowUpRight size={17} className="text-muted-foreground" /></div><p className="mt-5 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{title}</p><h3 className="mt-1 text-lg font-semibold text-primary">{value}</h3><p className="mt-2 text-sm leading-5 text-muted-foreground">{text}</p></article>)}</div><p className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><Info size={15} className="mt-0.5 shrink-0 text-accent" />EUNOIA screenings are for reflection and support only. They are not a diagnosis or a replacement for professional care.</p></section>
  </div>;
}

const resources = [
  { id: 'pause', category: 'Exercises', title: 'The two-minute pause', description: 'A tiny grounding practice for when everything feels like too much.', duration: '2 min', icon: WindIcon },
  { id: 'sleep', category: 'Rest', title: 'A softer evening', description: 'A realistic wind-down ritual for a mind that stays switched on.', duration: '6 min read', icon: Moon },
  { id: 'boundaries', category: 'Relationships', title: 'Boundaries without the guilt', description: 'A kinder way to protect your energy and say what you need.', duration: '8 min read', icon: ShieldCheck },
  { id: 'journaling', category: 'Reflection', title: 'When words feel stuck', description: 'Three prompts to help you begin writing without overthinking it.', duration: '4 min', icon: Pencil },
  { id: 'support', category: 'Support', title: 'Finding the right support', description: 'What to look for when you’re ready to talk to someone professionally.', duration: '7 min read', icon: MessageCircle },
  { id: 'focus', category: 'Exercises', title: 'A kinder focus list', description: 'Move from everything-at-once to one doable next step.', duration: '3 min', icon: Target },
];

function WindIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Sparkles size={size} className={className} />;
}

function Resources({ state, setState, showToast }: { state: AppState; setState: (next: Partial<AppState>) => void; showToast: (message: string) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const categories = ['All', 'Exercises', 'Rest', 'Reflection', 'Relationships', 'Support'];
  const filtered = useMemo(() => resources.filter((item) => (category === 'All' || item.category === category) && (!savedOnly || state.savedResources.includes(item.id)) && `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())), [category, query, savedOnly, state.savedResources]);
  const toggleSaved = (id: string, title: string) => {
    setState({ savedResources: state.savedResources.includes(id) ? state.savedResources.filter((saved) => saved !== id) : [...state.savedResources, id] });
    showToast(state.savedResources.includes(id) ? 'Removed from your saved space.' : `${title} saved for later.`);
  };
  return <div><PageHeading eyebrow="A shelf for your wellbeing" title="Resources" description="Thoughtful, practical things to try when you need a little support." action={<button onClick={() => setSavedOnly(!savedOnly)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${savedOnly ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-primary'}`} data-testid="button-filter-saved"><BookmarkCheck size={16} /> Saved {state.savedResources.length > 0 && `(${state.savedResources.length})`}</button>} /><div className="relative mb-5"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search for a feeling, practice, or topic" className="h-12 w-full rounded-2xl border border-input bg-card pl-11 pr-12 text-sm text-primary outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/8" data-testid="input-resource-search" />{query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted" data-testid="button-clear-resource-search"><X size={16} /></button>}</div><div className="mb-7 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition ${category === item ? 'bg-secondary text-primary' : 'bg-card text-muted-foreground hover:bg-muted hover:text-primary'}`} data-testid={`button-resource-category-${item.toLowerCase()}`}>{item}</button>)}</div>{filtered.length === 0 ? <div className="rounded-[28px] border border-dashed border-border bg-card p-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-2xl bg-muted text-primary"><Search size={23} /></div><h2 className="mt-5 font-display text-3xl text-primary">Nothing here yet</h2><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Try another search, or explore a different part of your shelf.</p><button onClick={() => { setQuery(''); setCategory('All'); setSavedOnly(false); }} className="mt-5 text-sm font-bold text-primary underline underline-offset-4" data-testid="button-reset-resources">Reset filters</button></div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map(({ id, category: itemCategory, title, description, duration, icon: Icon }) => <article key={id} className="group flex min-h-[246px] flex-col rounded-[26px] border border-border bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg" data-testid={`card-resource-${id}`}><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-secondary/45 text-primary transition group-hover:bg-secondary"><Icon size={21} /></span><button onClick={() => toggleSaved(id, title)} className={`grid size-9 place-items-center rounded-full transition ${state.savedResources.includes(id) ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-primary'}`} aria-label={`${state.savedResources.includes(id) ? 'Remove' : 'Save'} ${title}`} data-testid={`button-save-resource-${id}`}>{state.savedResources.includes(id) ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}</button></div><p className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-accent">{itemCategory}</p><h2 className="mt-1 font-display text-2xl leading-tight tracking-[-.02em] text-primary">{title}</h2><p className="mt-2 text-sm leading-5 text-muted-foreground">{description}</p><div className="mt-auto flex items-center justify-between pt-5 text-xs font-semibold text-muted-foreground"><span>{duration}</span><button className="inline-flex items-center gap-1 font-bold text-primary transition group-hover:gap-2" data-testid={`button-open-resource-${id}`}>Explore <ArrowRight size={14} /></button></div></article>)}</div>}</div>;
}

function Profile({ state, setState, onSignOut, showToast }: { state: AppState; setState: (next: Partial<AppState>) => void; onSignOut: () => void; showToast: (message: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(state.profileName);
  const saveProfile = () => { if (draftName.trim().length < 2) { showToast('Please add a little more to your name.'); return; } setState({ profileName: draftName.trim(), userName: draftName.trim() }); setEditing(false); showToast('Your profile has been updated.'); };
  return <div><PageHeading eyebrow="Your preferences" title="Profile" description="Make EUNOIA feel like a space that belongs to you." action={<button onClick={() => setEditing(!editing)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted" data-testid="button-edit-profile">{editing ? <X size={16} /> : <Pencil size={16} />}{editing ? 'Cancel' : 'Edit profile'}</button>} /><div className="grid gap-6 lg:grid-cols-[.82fr_1.18fr]"><section className="rounded-[28px] bg-primary p-7 text-background shadow-lg sm:p-9"><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-[22px] bg-secondary font-display text-3xl text-primary">{state.userName[0]}</div><div><p className="text-xs font-bold uppercase tracking-[.15em] text-background/50">Your space</p><h2 className="mt-1 font-display text-3xl tracking-[-.03em]">{state.profileName}</h2><p className="mt-1 text-sm text-background/55">Member since October 2024</p></div></div><div className="mt-10 border-t border-background/15 pt-6"><div className="flex items-center gap-3"><ShieldCheck className="text-secondary" size={19} /><p className="text-sm font-semibold">Private by design</p></div><p className="mt-3 text-sm leading-6 text-background/60">Your check-ins and reflections are personal. EUNOIA does not share your wellbeing information for advertising.</p></div></section><div className="space-y-4"><section className="rounded-[26px] border border-border bg-card p-6 shadow-sm sm:p-7"><div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Personal details</p><h2 className="mt-1 font-display text-2xl text-primary">About you</h2></div><UserRound className="text-muted-foreground" size={20} /></div>{editing ? <div className="space-y-4"><div><label className="mb-2 block text-sm font-semibold text-primary">Name</label><input value={draftName} onChange={(event) => setDraftName(event.target.value)} className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm text-primary outline-none focus:border-primary" data-testid="input-profile-name" /></div><div><label className="mb-2 block text-sm font-semibold text-primary">Email</label><input defaultValue="maya.chen@example.com" type="email" className="h-12 w-full rounded-2xl border border-input bg-muted px-4 text-sm text-muted-foreground outline-none" disabled data-testid="input-profile-email" /></div><Button onClick={saveProfile} className="w-full sm:w-auto" data-testid="button-save-profile"><Check size={16} /> Save changes</Button></div> : <div className="space-y-4"><div><p className="text-xs font-semibold text-muted-foreground">Name</p><p className="mt-1 text-sm font-semibold text-primary" data-testid="text-profile-name">{state.profileName}</p></div><div><p className="text-xs font-semibold text-muted-foreground">Email</p><p className="mt-1 text-sm font-semibold text-primary">maya.chen@example.com</p></div></div>}</section><section className="rounded-[26px] border border-border bg-card p-6 shadow-sm sm:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-accent">Preferences</p><h2 className="mt-1 font-display text-2xl text-primary">Gentle nudges</h2><p className="mt-2 text-sm text-muted-foreground">A small reminder to check in with yourself.</p></div><button onClick={() => { setState({ notifications: !state.notifications }); showToast(state.notifications ? 'Gentle nudges paused.' : 'Gentle nudges are on.'); }} className={`relative h-7 w-12 rounded-full transition ${state.notifications ? 'bg-primary' : 'bg-muted'}`} aria-label="Toggle notifications" data-testid="button-toggle-notifications"><span className={`absolute top-1 size-5 rounded-full bg-background shadow-sm transition ${state.notifications ? 'left-6' : 'left-1'}`} /></button></div><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Check size={14} className={state.notifications ? 'text-accent' : 'text-muted-foreground'} /> {state.notifications ? 'Weekly check-in reminders are on' : 'Reminders are paused'}</div></section><section className="rounded-[26px] border border-border bg-secondary/35 p-6 sm:p-7"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 shrink-0 text-primary" size={19} /><div><h2 className="font-semibold text-primary">A note on support</h2><p className="mt-2 text-sm leading-6 text-primary/70">EUNOIA can help you reflect, but it cannot assess risk or provide emergency care. If you feel unsafe or need immediate help, contact your local emergency service or a crisis line.</p></div></div></section></div></div><button onClick={onSignOut} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-destructive transition hover:gap-3" data-testid="button-signout"><LogOut size={17} /> Sign out of EUNOIA</button></div>;
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-xl lg:bottom-7"><Check size={17} className="text-secondary" /> {message}<button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100" aria-label="Close message" data-testid="button-close-toast"><X size={15} /></button></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router({ state, setState, onAuth, onSignOut, showToast, isDark, onToggleTheme }: { state: AppState; setState: (next: Partial<AppState>) => void; onAuth: (name: string) => void; onSignOut: () => void; showToast: (message: string) => void; isDark: boolean; onToggleTheme: () => void }) {
  const [, setLocation] = useLocation();
  return <RoutedErrorBoundary><Switch>
     <Route path="/"><Onboarding onEnter={() => setLocation('/auth')} isDark={isDark} onToggleTheme={onToggleTheme} /></Route>
     <Route path="/auth"><Auth onSuccess={onAuth} isDark={isDark} onToggleTheme={onToggleTheme} /></Route>
     <Route path="/app/insights"><AppShell active="insights" userName={state.userName} onSignOut={onSignOut} isDark={isDark} onToggleTheme={onToggleTheme}><Insights state={state} /></AppShell></Route>
     <Route path="/app/resources"><AppShell active="resources" userName={state.userName} onSignOut={onSignOut} isDark={isDark} onToggleTheme={onToggleTheme}><Resources state={state} setState={setState} showToast={showToast} /></AppShell></Route>
     <Route path="/app/profile"><AppShell active="profile" userName={state.userName} onSignOut={onSignOut} isDark={isDark} onToggleTheme={onToggleTheme}><Profile state={state} setState={setState} onSignOut={onSignOut} showToast={showToast} /></AppShell></Route>
     <Route path="/app"><AppShell active="home" userName={state.userName} onSignOut={onSignOut} isDark={isDark} onToggleTheme={onToggleTheme}><Home state={state} setState={setState} onSignOut={onSignOut} showToast={showToast} /></AppShell></Route>
    <Route><NotFound /></Route>
  </Switch></RoutedErrorBoundary>;
}

function NotFound() {
  const [, setLocation] = useLocation();
  return <main className="grid min-h-[100dvh] place-items-center bg-background p-6 text-center"><div><div className="mx-auto grid size-16 place-items-center rounded-2xl bg-secondary/50 text-primary"><CircleHelp size={27} /></div><h1 className="mt-5 font-display text-5xl text-primary">A quiet detour.</h1><p className="mt-3 text-muted-foreground">That page could not be found.</p><Button onClick={() => setLocation('/')} className="mt-7" data-testid="button-not-found-home">Return home</Button></div></main>;
}

function Experience() {
  const [state, setAppState] = useState<AppState>({ userName: 'Maya', profileName: 'Maya Chen', mood: null, screeningStep: 0, screeningComplete: false, savedResources: [], notifications: true });
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const storedTheme = window.localStorage.getItem('eunoia-theme');
    return storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [toast, setToast] = useState('');
  const [, setLocation] = useLocation();
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('eunoia-theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  const setState = (next: Partial<AppState>) => setAppState((current) => ({ ...current, ...next }));
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2800); };
  const onAuth = (name: string) => { const nextName = name || 'Maya'; setState({ userName: nextName, profileName: name ? `${name}` : 'Maya Chen' }); setLocation('/app'); };
  const onSignOut = () => { setLocation('/auth'); showToast('You’ve been signed out safely.'); };
  return <><Router state={state} setState={setState} onAuth={onAuth} onSignOut={onSignOut} showToast={showToast} isDark={isDark} onToggleTheme={() => setIsDark((current) => !current)} />{toast && <Toast message={toast} onClose={() => setToast('')} />}</>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Experience /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;