import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  FileText,
  History,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Rocket,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import {
  clearSession,
  completeNewPasswordChallenge,
  confirmForgotPasswordWithCode,
  discoverCognitoConfig,
  getStoredSession,
  requestForgotPasswordCode,
  signInWithCognito,
  type CognitoAuthSession,
} from '../utils/cognitoAuth';
import { generateCvPdfBase64 } from '../utils/cvPdfGenerator';
import { AVAILABLE_ICON_NAMES } from '../utils/icons';

type AdminTab = 'PROFILE' | 'PROJECT' | 'SKILL_GROUP' | 'EDUCATION' | 'ACHIEVEMENT' | 'INTEREST' | 'CV';
type AuthScreenMode = 'SIGN_IN' | 'NEW_PASSWORD_CHALLENGE' | 'VERIFY_RESET_CODE';

type CvVersionState = {
  activeKey: string;
  activeUrl: string;
  hasStagedCv: boolean;
  stagedUrl: string | null;
  history: {
    key: string;
    filename: string;
    size: number;
    lastModified: string;
    url: string;
  }[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function AdminPortal() {
  const [session, setSession] = useState<CognitoAuthSession | null>(() => getStoredSession());
  const [cognitoCfg, setCognitoCfg] = useState<{ region: string; clientId: string }>({
    region: 'us-east-1',
    clientId: '',
  });

  // Login states
  const [authMode, setAuthMode] = useState<AuthScreenMode>('SIGN_IN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [challengeSession, setChallengeSession] = useState<string | null>(null);
  const [authError, setAuthError] = useState('');
  const [authInfo, setAuthInfo] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    discoverCognitoConfig().then((cfg) => setCognitoCfg(cfg));
  }, []);

  // CMS Data states
  const [activeTab, setActiveTab] = useState<AdminTab>('PROJECT');
  const [items, setItems] = useState<Record<string, any>[]>([]);
  const [cvState, setCvState] = useState<CvVersionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, any> | null>(null);

  async function apiFetch(path: string, options: RequestInit = {}) {
    if (!session) throw new Error('Not authenticated');
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.idToken}`,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401 || res.status === 403) {
      clearSession();
      setSession(null);
      throw new Error('Session expired or unauthorized. Please sign in again.');
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || data.message || `API Error (${res.status})`);
    }
    return data;
  }

  async function loadAdminData() {
    if (!session) return;
    setLoading(true);
    try {
      const data = await apiFetch('/api/admin/items');
      setItems(data.items || []);
      setCvState(data.cv || null);
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Failed to load items', type: 'err' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session) {
      loadAdminData();
    }
  }, [session]);

  async function ensureConfig() {
    if (cognitoCfg.clientId) return cognitoCfg;
    const discovered = await discoverCognitoConfig();
    setCognitoCfg(discovered);
    if (!discovered.clientId) {
      throw new Error('Authentication config (/auth-config.json) not found on server. Please run terraform apply.');
    }
    return discovered;
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');
    setAuthLoading(true);
    try {
      const cfg = await ensureConfig();
      const res = await signInWithCognito(email, password, cfg.region, cfg.clientId);
      if (res.status === 'NEW_PASSWORD_REQUIRED') {
        setChallengeSession(res.sessionToken);
        setAuthMode('NEW_PASSWORD_CHALLENGE');
      } else if (res.status === 'PASSWORD_RESET_REQUIRED') {
        setAuthMode('VERIFY_RESET_CODE');
        setAuthInfo('A password reset was requested for your account. Enter the verification code sent to your email and choose a new password.');
      } else {
        setSession(res.session);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Sign-in failed');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleNewPassword(e: FormEvent) {
    e.preventDefault();
    if (!challengeSession) return;
    setAuthError('');
    setAuthInfo('');
    setAuthLoading(true);
    try {
      const cfg = await ensureConfig();
      const newSess = await completeNewPasswordChallenge(
        email,
        newPassword,
        challengeSession,
        cfg.region,
        cfg.clientId
      );
      setChallengeSession(null);
      setAuthMode('SIGN_IN');
      setSession(newSess);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to set new password');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleRequestResetCode() {
    setAuthError('');
    setAuthInfo('');
    if (!email.trim()) {
      setAuthError('Enter your Admin Email above first, then click "Send reset code".');
      return;
    }
    setAuthLoading(true);
    try {
      const cfg = await ensureConfig();
      await requestForgotPasswordCode(email, cfg.region, cfg.clientId);
      setAuthMode('VERIFY_RESET_CODE');
      setAuthInfo(`Verification code sent to ${email.trim()}. Enter the code below along with your new password.`);
    } catch (err: any) {
      setAuthError(err.message || 'Could not send verification code');
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleConfirmResetCode(e: FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthInfo('');
    setAuthLoading(true);
    try {
      const cfg = await ensureConfig();
      await confirmForgotPasswordWithCode(email, verificationCode, newPassword, cfg.region, cfg.clientId);
      // Automatically sign the user in with their newly set password
      const loginRes = await signInWithCognito(email, newPassword, cfg.region, cfg.clientId);
      if (loginRes.status === 'SUCCESS') {
        setSession(loginRes.session);
      } else {
        setAuthMode('SIGN_IN');
        setPassword('');
        setAuthInfo('Password updated! You can now sign in with your new password.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Failed to verify reset code');
    } finally {
      setAuthLoading(false);
    }
  }

  const profileItem = items.find((i) => i.pk === 'PROFILE' && i.sk === 'CONFIG') || {
    pk: 'PROFILE',
    sk: 'CONFIG',
    availabilityHero: 'Open to Werkstudent & internship roles',
    availabilityContact: 'Open to opportunities',
    kicker: 'Berlin, Germany · Mechatronics',
    firstName: 'Moaz',
    lastName: 'Elborollosy',
    heroDescription: '',
    heroTagsRow1: [],
    heroTagsRow2: [],
    aboutHeadline: '',
    aboutBody: '',
    spokenLanguages: '',
    contactLocation: 'Berlin, Germany',
    links: { email: '', linkedin: '', github: '', cv: '/assets/Moaz-Elborollosy-CV.pdf' },
  };

  const hasUnpublishedChanges = Boolean(
    cvState?.hasStagedCv ||
      (profileItem.lastModifiedAt &&
        (!profileItem.lastPublishedAt || profileItem.lastModifiedAt > profileItem.lastPublishedAt))
  );

  const sectionItems = items
    .filter((i) => i.pk === activeTab)
    .sort((a, b) => Number(a.displayOrder ?? 9999) - Number(b.displayOrder ?? 9999));

  async function handleMoveItem(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sectionItems.length) return;

    const updated = [...sectionItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Reassign clean gapped displayOrder (10, 20, 30...)
    const reordered = updated.map((item, idx) => ({
      ...item,
      displayOrder: (idx + 1) * 10,
    }));

    try {
      await apiFetch('/api/admin/items', {
        method: 'PUT',
        body: JSON.stringify({ items: reordered }),
      });
      setStatusMsg({ text: 'Order saved to DynamoDB (click "Update" to publish to edge)', type: 'ok' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    }
  }

  async function handleToggleVisibility(item: Record<string, any>) {
    try {
      await apiFetch('/api/admin/items', {
        method: 'PUT',
        body: JSON.stringify({ ...item, isVisible: item.isVisible === false ? true : false }),
      });
      setStatusMsg({ text: 'Visibility updated in DynamoDB', type: 'ok' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    }
  }

  async function handleDeleteItem(item: Record<string, any>) {
    if (!window.confirm(`Delete "${item.title || item.label || item.institution || item.sk}"?`)) return;
    try {
      await apiFetch(`/api/admin/items?pk=${encodeURIComponent(item.pk)}&sk=${encodeURIComponent(item.sk)}`, {
        method: 'DELETE',
      });
      setStatusMsg({ text: 'Item deleted from DynamoDB', type: 'ok' });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    }
  }

  async function handleSaveItem(e: FormEvent) {
    e.preventDefault();
    if (!editingItem) return;
    try {
      const isCreate = !editingItem.sk;
      await apiFetch('/api/admin/items', {
        method: isCreate ? 'POST' : 'PUT',
        body: JSON.stringify(editingItem),
      });
      setEditingItem(null);
      setStatusMsg({
        text: isCreate
          ? 'Created with auto-generated ULID in DynamoDB (click "Update" to publish live)'
          : 'Saved changes to DynamoDB (click "Update" to publish live)',
        type: 'ok',
      });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    }
  }

  async function handleGenerateAndStageCv() {
    try {
      const pdfBase64 = generateCvPdfBase64(items);
      const data = await apiFetch('/api/admin/cv', {
        method: 'POST',
        body: JSON.stringify({ action: 'stage_generated', pdfBase64 }),
      });
      setCvState(data.cv);
      setStatusMsg({
        text: 'Generated new CV PDF from DynamoDB data and staged it! Click "Update" to archive the old CV and publish to CloudFront.',
        type: 'ok',
      });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    }
  }

  async function handleUploadCustomCv(file: File) {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const pdfBase64 = String(reader.result || '');
        const data = await apiFetch('/api/admin/cv', {
          method: 'POST',
          body: JSON.stringify({ action: 'stage_upload', pdfBase64 }),
        });
        setCvState(data.cv);
        setStatusMsg({
          text: `Staged "${file.name}". Click "Update" to rename/archive the current CV and publish the new one to CloudFront.`,
          type: 'ok',
        });
        await loadAdminData();
      } catch (err: any) {
        setStatusMsg({ text: err.message, type: 'err' });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleRestoreArchivedCv(archiveKey: string) {
    try {
      const data = await apiFetch('/api/admin/cv', {
        method: 'POST',
        body: JSON.stringify({ action: 'restore', archiveKey }),
      });
      setCvState(data.cv);
      setStatusMsg({
        text: `Staged archived CV (${archiveKey.split('/').pop()}). Click "Update" to promote it and invalidate CloudFront.`,
        type: 'ok',
      });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    }
  }

  async function handleUnifiedUpdatePublish() {
    setPublishing(true);
    try {
      const res = await apiFetch('/api/admin/publish', { method: 'POST' });
      const extra = res.archivedCvKey
        ? ` Previous CV renamed to ${res.archivedCvKey.split('/').pop()}.`
        : '';
      setStatusMsg({
        text: `Published to CloudFront Edge! Invalidation ID: ${res.invalidationId}.${extra}`,
        type: 'ok',
      });
      await loadAdminData();
    } catch (err: any) {
      setStatusMsg({ text: err.message, type: 'err' });
    } finally {
      setPublishing(false);
    }
  }

  function createBlankItem(pk: AdminTab): Record<string, any> {
    if (pk === 'PROJECT') {
      return {
        pk: 'PROJECT',
        title: '',
        category: 'Mechanical',
        accentTag: 'ENGINEERING PROJECT',
        icon: 'Bot',
        description: '',
        contribution: '',
        outcome: '',
        technologies: [],
        github: '',
        isVisible: true,
      };
    }
    if (pk === 'SKILL_GROUP') {
      return { pk: 'SKILL_GROUP', title: '', icon: 'Cog', skills: [], isVisible: true };
    }
    if (pk === 'EDUCATION') {
      return {
        pk: 'EDUCATION',
        startYear: '2024',
        dateRange: '',
        institution: '',
        institutionShort: '',
        degree: '',
        location: 'Berlin, Germany',
        gpa: '',
        coursework: '',
        isVisible: true,
      };
    }
    if (pk === 'ACHIEVEMENT') {
      return { pk: 'ACHIEVEMENT', title: '', text: '', icon: 'Trophy', isVisible: true };
    }
    return { pk: 'INTEREST', label: '', icon: 'Bot', isVisible: true };
  }

  // ------------------------- LOGIN VIEW -------------------------
  if (!session) {
    return (
      <div className="min-h-screen bg-[#030d17] text-slate-100 flex items-center justify-center p-6">
        <div className="panel w-full max-w-md rounded-2xl p-8 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <a
              href="#top"
              onClick={() => (window.location.hash = '')}
              className="text-xs text-sky-300 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} /> Back to Portfolio
            </a>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300">
              {authMode === 'VERIFY_RESET_CODE' ? <KeyRound size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Portfolio Admin</h1>
              <p className="text-xs text-slate-400">
                {authMode === 'SIGN_IN' && 'Sign in with your Admin Email & Password'}
                {authMode === 'NEW_PASSWORD_CHALLENGE' && 'First-time sign-in: Set your permanent password'}
                {authMode === 'VERIFY_RESET_CODE' && 'Reset Password with Verification Code'}
              </p>
            </div>
          </div>

          {authError && (
            <div className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-200">
              {authError}
            </div>
          )}

          {authInfo && (
            <div className="mt-4 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3.5 py-2.5 text-xs text-sky-200">
              {authInfo}
            </div>
          )}

          {authMode === 'SIGN_IN' && (
            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#051220] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                  placeholder="admin@elborollosy.com"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Password (or Temporary Password)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#051220] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full hero-primary-btn min-h-[46px] text-sm"
              >
                {authLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleRequestResetCode}
                  className="hover:text-sky-300 transition"
                >
                  Forgot password? Send reset code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthError('');
                    setAuthInfo('');
                    setAuthMode('VERIFY_RESET_CODE');
                  }}
                  className="text-sky-300 hover:underline"
                >
                  Have a verification code?
                </button>
              </div>
            </form>
          )}

          {authMode === 'NEW_PASSWORD_CHALLENGE' && (
            <form onSubmit={handleNewPassword} className="mt-6 space-y-4">
              <p className="text-xs text-amber-300">
                Temporary password verified. Choose your permanent password (min 12 chars, uppercase, lowercase, number, and symbol):
              </p>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">New Permanent Password</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#051220] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full hero-primary-btn min-h-[46px] text-sm"
              >
                {authLoading ? 'Saving Password...' : 'Set Permanent Password & Sign In'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setChallengeSession(null);
                  setAuthMode('SIGN_IN');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {authMode === 'VERIFY_RESET_CODE' && (
            <form onSubmit={handleConfirmResetCode} className="mt-6 space-y-4">
              <p className="text-xs text-slate-300">
                Enter the <strong>Verification Code</strong> sent by Cognito to your email and set your new permanent password (min 12 chars, upper, lower, number, symbol):
              </p>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-[#051220] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                  placeholder="admin@elborollosy.com"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">6-Digit Verification Code</label>
                <input
                  type="text"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full rounded-lg bg-[#051220] border border-white/15 px-3.5 py-2.5 text-sm text-white font-mono tracking-widest"
                  placeholder="123456"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1.5">New Permanent Password</label>
                <input
                  type="password"
                  required
                  minLength={12}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg bg-[#051220] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                />
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full hero-primary-btn min-h-[46px] text-sm"
              >
                {authLoading ? 'Verifying & Signing In...' : 'Confirm Code & Set New Password'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError('');
                  setAuthInfo('');
                  setAuthMode('SIGN_IN');
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-white pt-1"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ------------------------- AUTHENTICATED CMS VIEW -------------------------
  return (
    <div className="min-h-screen bg-[#030d17] text-slate-100 pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#04101c]/90 backdrop-blur-md">
        <div className="page-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-4">
            <a
              href="#top"
              onClick={() => (window.location.hash = '')}
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 border border-white/10 rounded-lg px-3 py-2"
            >
              <ArrowLeft size={14} /> Live Site
            </a>
            <div>
              <h1 className="text-base font-bold text-white">Portfolio Admin CMS</h1>
              <p className="text-[11px] font-mono text-slate-400">
                Signed in as {session.email} · Last published:{' '}
                {profileItem.lastPublishedAt || 'Initial'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono ${
                hasUnpublishedChanges
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30'
              }`}
            >
              <CheckCircle2 size={13} />
              {hasUnpublishedChanges ? 'Unpublished Changes Ready' : 'Edge Synced'}
            </span>

            <button
              type="button"
              onClick={handleUnifiedUpdatePublish}
              disabled={publishing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg hover:opacity-95 disabled:opacity-50"
              title="Archives old CV if a new CV is staged, and invalidates CloudFront edge cache for /api/portfolio and CV"
            >
              <Rocket size={15} />
              {publishing ? 'Publishing to Edge...' : 'Update (Publish to Edge)'}
            </button>

            <button
              type="button"
              onClick={loadAdminData}
              className="rounded-lg border border-white/10 p-2 text-slate-300 hover:text-white"
              title="Reload from DynamoDB"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              type="button"
              onClick={() => {
                clearSession();
                setSession(null);
              }}
              className="rounded-lg border border-white/10 p-2 text-slate-400 hover:text-red-300"
              title="Sign Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </header>

      <div className="page-shell mt-6">
        {statusMsg && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-xs flex items-center justify-between ${
              statusMsg.type === 'ok'
                ? 'border-teal-400/30 bg-teal-500/10 text-teal-200'
                : 'border-red-400/30 bg-red-500/10 text-red-200'
            }`}
          >
            <span>{statusMsg.text}</span>
            <button type="button" onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4 mb-6">
          {(
            [
              ['PROJECT', 'Projects'],
              ['SKILL_GROUP', 'Skills'],
              ['EDUCATION', 'Education'],
              ['ACHIEVEMENT', 'Achievements'],
              ['INTEREST', 'Interests'],
              ['PROFILE', 'Profile & Hero (Singleton)'],
              ['CV', 'CV PDF & History'],
            ] as [AdminTab, string][]
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              onClick={() => {
                setActiveTab(tabKey);
                setEditingItem(null);
              }}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                activeTab === tabKey
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                  : 'bg-white/[0.03] text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TAB 1: PROFILE SINGLETON */}
        {activeTab === 'PROFILE' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await apiFetch('/api/admin/items', {
                  method: 'PUT',
                  body: JSON.stringify(editingItem || profileItem),
                });
                setStatusMsg({
                  text: 'Saved PROFILE#CONFIG singleton to DynamoDB (click "Update" to publish to edge)',
                  type: 'ok',
                });
                await loadAdminData();
              } catch (err: any) {
                setStatusMsg({ text: err.message, type: 'err' });
              }
            }}
            className="panel rounded-2xl p-6 space-y-4 max-w-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Singleton Profile & Hero Config</h2>
                <p className="text-xs font-mono text-slate-400">PK: PROFILE · SK: CONFIG</p>
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
              >
                <Save size={14} /> Save Profile
              </button>
            </div>

            {(() => {
              const target = editingItem?.pk === 'PROFILE' ? editingItem : profileItem;
              const update = (patch: Record<string, any>) => setEditingItem({ ...target, ...patch });
              return (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={target.firstName || ''}
                      onChange={(e) => update({ firstName: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={target.lastName || ''}
                      onChange={(e) => update({ lastName: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hero Availability Badge</label>
                    <input
                      type="text"
                      value={target.availabilityHero || ''}
                      onChange={(e) => update({ availabilityHero: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hero Kicker</label>
                    <input
                      type="text"
                      value={target.kicker || ''}
                      onChange={(e) => update({ kicker: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Hero Bio Description</label>
                    <textarea
                      rows={2}
                      value={target.heroDescription || ''}
                      onChange={(e) => update({ heroDescription: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hero Pills Row 1 (comma-separated)</label>
                    <input
                      type="text"
                      value={(target.heroTagsRow1 || []).join(', ')}
                      onChange={(e) =>
                        update({
                          heroTagsRow1: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Hero Pills Row 2 (comma-separated)</label>
                    <input
                      type="text"
                      value={(target.heroTagsRow2 || []).join(', ')}
                      onChange={(e) =>
                        update({
                          heroTagsRow2: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">About Headline</label>
                    <input
                      type="text"
                      value={target.aboutHeadline || ''}
                      onChange={(e) => update({ aboutHeadline: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">About Body</label>
                    <textarea
                      rows={3}
                      value={target.aboutBody || ''}
                      onChange={(e) => update({ aboutBody: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1">Spoken Languages Line</label>
                    <input
                      type="text"
                      value={target.spokenLanguages || ''}
                      onChange={(e) => update({ spokenLanguages: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={target.links?.email || ''}
                      onChange={(e) => update({ links: { ...(target.links || {}), email: e.target.value } })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={target.links?.linkedin || ''}
                      onChange={(e) => update({ links: { ...(target.links || {}), linkedin: e.target.value } })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">GitHub URL</label>
                    <input
                      type="url"
                      value={target.links?.github || ''}
                      onChange={(e) => update({ links: { ...(target.links || {}), github: e.target.value } })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contact Location</label>
                    <input
                      type="text"
                      value={target.contactLocation || ''}
                      onChange={(e) => update({ contactLocation: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                </div>
              );
            })()}
          </form>
        )}

        {/* TAB 2: CV PDF MANAGEMENT & VERSION HISTORY */}
        {activeTab === 'CV' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="panel rounded-2xl p-6 space-y-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={18} className="text-sky-300" /> CV PDF Creation & Staging
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  When you click <strong>Update (Publish to Edge)</strong>, the currently active CV is automatically renamed with a timestamp into{' '}
                  <code>/assets/cv-history/</code> before the staged CV is promoted and invalidated on CloudFront.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Active Live CV:</span>
                  <a
                    href={cvState?.activeUrl || '/assets/Moaz-Elborollosy-CV.pdf'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-300 underline font-mono"
                  >
                    /assets/Moaz-Elborollosy-CV.pdf
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Staged CV Ready to Publish:</span>
                  <span className={cvState?.hasStagedCv ? 'text-amber-300 font-semibold' : 'text-slate-500'}>
                    {cvState?.hasStagedCv ? 'YES (Pending "Update" click)' : 'None'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleGenerateAndStageCv}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-400"
                >
                  <FileText size={15} /> Auto-Generate CV PDF from DynamoDB
                </button>

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-sky-300/40">
                  <Upload size={15} /> Upload Custom PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCustomCv(file);
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="panel rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History size={18} className="text-teal-300" /> Renamed / Archived CVs ({cvState?.history?.length || 0})
              </h2>
              {!cvState?.history?.length ? (
                <p className="text-xs text-slate-500">
                  No archived CVs yet. As soon as you stage a new CV and click "Update", the previous CV will appear here with its timestamp.
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {cvState.history.map((h) => (
                    <div
                      key={h.key}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 text-xs"
                    >
                      <div>
                        <a
                          href={h.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-sky-300 hover:underline block"
                        >
                          {h.filename}
                        </a>
                        <span className="text-[10px] text-slate-500">
                          {h.lastModified} · {(h.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRestoreArchivedCv(h.key)}
                        className="rounded-lg border border-white/15 px-2.5 py-1 text-[11px] text-slate-300 hover:border-sky-400 hover:text-white"
                      >
                        Stage Restore
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: COLLECTION SECTIONS (PROJECT, SKILL_GROUP, EDUCATION, ACHIEVEMENT, INTEREST) */}
        {activeTab !== 'PROFILE' && activeTab !== 'CV' && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">
                  {activeTab} Items ({sectionItems.length}) — Ordered by <code>displayOrder</code>
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingItem(createBlankItem(activeTab))}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-400"
                >
                  <Plus size={14} /> Add {activeTab}
                </button>
              </div>

              {sectionItems.map((item, idx) => (
                <div
                  key={item.sk}
                  className={`panel rounded-xl p-4 flex items-center justify-between gap-4 border ${
                    item.isVisible === false ? 'opacity-50 border-dashed border-white/10' : 'border-white/10'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-sky-500/15 text-sky-300">
                        #{String(idx + 1).padStart(2, '0')} (order: {item.displayOrder})
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 truncate" title={item.sk}>
                        ULID: {item.sk}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-semibold text-white text-sm truncate">
                      {item.title || item.label || item.institution}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {item.description ||
                        item.text ||
                        item.degree ||
                        (Array.isArray(item.skills) ? item.skills.join(' · ') : '')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveItem(idx, -1)}
                      className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sectionItems.length - 1}
                      onClick={() => handleMoveItem(idx, 1)}
                      className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      className="rounded-lg border border-white/10 p-1.5 text-slate-300 hover:text-white"
                      title={item.isVisible === false ? 'Show Item' : 'Hide Item'}
                    >
                      {item.isVisible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...item })}
                      className="rounded-lg border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200 hover:bg-sky-500/20"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="rounded-lg border border-red-400/20 p-1.5 text-red-300 hover:bg-red-500/10"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Editor Panel */}
            {editingItem && editingItem.pk === activeTab && (
              <form onSubmit={handleSaveItem} className="panel rounded-2xl p-6 space-y-4 self-start">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingItem.sk ? `Edit ${activeTab}` : `New ${activeTab} (Auto ULID)`}
                    </h3>
                    {editingItem.sk && (
                      <p className="text-[10px] font-mono text-slate-500">SK: {editingItem.sk}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                {activeTab === 'PROJECT' && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Project Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Category</label>
                        <input
                          type="text"
                          required
                          value={editingItem.category || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                          placeholder="Mechanical / Embedded / Software"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Accent Tag</label>
                        <input
                          type="text"
                          value={editingItem.accentTag || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, accentTag: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                          placeholder="CAD & INTEGRATION"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Overview Description</label>
                      <textarea
                        rows={2}
                        value={editingItem.description || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">My Contribution</label>
                      <textarea
                        rows={2}
                        value={editingItem.contribution || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, contribution: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Outcome</label>
                      <textarea
                        rows={2}
                        value={editingItem.outcome || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, outcome: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Technologies (comma-separated)</label>
                      <input
                        type="text"
                        value={(editingItem.technologies || []).join(', ')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            technologies: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">GitHub URL (optional)</label>
                      <input
                        type="url"
                        value={editingItem.github || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, github: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'SKILL_GROUP' && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Group Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Skills (comma-separated)</label>
                      <input
                        type="text"
                        value={(editingItem.skills || []).join(', ')}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            skills: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'EDUCATION' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Start Year</label>
                        <input
                          type="text"
                          value={editingItem.startYear || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, startYear: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Date Range</label>
                        <input
                          type="text"
                          value={editingItem.dateRange || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, dateRange: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Institution</label>
                        <input
                          type="text"
                          value={editingItem.institution || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, institution: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Short Name</label>
                        <input
                          type="text"
                          value={editingItem.institutionShort || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, institutionShort: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Degree</label>
                      <input
                        type="text"
                        value={editingItem.degree || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, degree: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Location</label>
                        <input
                          type="text"
                          value={editingItem.location || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, location: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">GPA</label>
                        <input
                          type="text"
                          value={editingItem.gpa || ''}
                          onChange={(e) => setEditingItem({ ...editingItem, gpa: e.target.value })}
                          className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Coursework</label>
                      <textarea
                        rows={2}
                        value={editingItem.coursework || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, coursework: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'ACHIEVEMENT' && (
                  <>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Title</label>
                      <input
                        type="text"
                        required
                        value={editingItem.title || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Description</label>
                      <textarea
                        rows={2}
                        value={editingItem.text || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, text: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'INTEREST' && (
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Interest Label</label>
                    <input
                      type="text"
                      required
                      value={editingItem.label || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                      className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                    />
                  </div>
                )}

                {activeTab !== 'EDUCATION' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Icon</label>
                      <select
                        value={editingItem.icon || 'Bot'}
                        onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      >
                        {AVAILABLE_ICON_NAMES.map((ic) => (
                          <option key={ic} value={ic}>
                            {ic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Display Order</label>
                      <input
                        type="number"
                        value={editingItem.displayOrder ?? ''}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            displayOrder: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Auto (+10)"
                        className="w-full rounded-lg bg-[#051220] border border-white/15 px-3 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-xs font-semibold text-white hover:bg-sky-400"
                >
                  <Save size={14} /> Save to DynamoDB
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
