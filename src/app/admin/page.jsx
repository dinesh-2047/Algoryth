'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const tabs = [
  { id: 'problems', label: 'Problems' },
  { id: 'editorials', label: 'Editorials' },
  { id: 'users', label: 'Users' },
  { id: 'contests', label: 'Contests' },
];

const defaultTestCase = {
  name: 'sample-case',
  input: '4\n1 2 3 4',
  expectedOutput: '24 12 8 6',
  comparison: 'trimmed',
  isHidden: true,
  maxTimeMs: 3000,
  maxMemoryKb: 262144,
  weight: 1,
};

const defaultProblemForm = {
  id: '',
  slug: '',
  title: '',
  rating: 1200,
  difficulty: 'Easy',
  isPublic: false,
  statement: '',
  inputFormat: '',
  outputFormat: '',
  tagsText: 'arrays\nhash-map',
  constraintsText: '2 <= n <= 100000',
  hintsText: 'Think prefix and suffix products',
  examplesJson: JSON.stringify(
    [{ input: '4\n1 2 3 4', output: '24 12 8 6', explanation: 'prefix/suffix' }],
    null,
    2
  ),
  starterCodeJson: JSON.stringify(
    {
      javascript: '// write your solution',
      python: '# write your solution',
      java: '// write your solution',
      cpp: '// write your solution',
      go: '// write your solution',
    },
    null,
    2
  ),
  testCasesJson: JSON.stringify(Array.from({ length: 10 }, (_, index) => ({
    ...defaultTestCase,
    name: `case-${index + 1}`,
  })), null, 2),
};

function parseJsonOrThrow(raw, fieldName) {
  try {
    return JSON.parse(raw || 'null');
  } catch {
    throw new Error(`${fieldName} JSON is invalid`);
  }
}

function splitLines(value) {
  return String(value || '')
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const { user, token, loading, login } = useAuth();

  const [activeTab, setActiveTab] = useState('problems');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminSigningIn, setIsAdminSigningIn] = useState(false);

  const [users, setUsers] = useState([]);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);

  const [problemForm, setProblemForm] = useState(defaultProblemForm);

  const [editorialTargetSlug, setEditorialTargetSlug] = useState('');
  const [editorialTitle, setEditorialTitle] = useState('');
  const [editorialContent, setEditorialContent] = useState('');

  const [contestForm, setContestForm] = useState({
    title: '',
    slug: '',
    description: '',
    startTime: '',
    durationMinutes: 90,
    isPublic: true,
    isRated: true,
    problemsText: '',
  });

  const privateProblems = useMemo(
    () => problems.filter((problem) => problem.isPublic === false),
    [problems]
  );

  const adminHeaders = useMemo(() => {
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }, [token]);

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users', { headers: adminHeaders, cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Failed to load users');
    setUsers(Array.isArray(payload.users) ? payload.users : []);
  };

  const fetchProblems = async () => {
    const response = await fetch('/api/admin/problems', { headers: adminHeaders, cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Failed to load problems');
    setProblems(Array.isArray(payload.problems) ? payload.problems : []);

    if (!editorialTargetSlug && payload.problems?.length) {
      const first = payload.problems[0];
      setEditorialTargetSlug(first.slug);
      setEditorialTitle(first.editorial?.title || '');
      setEditorialContent(first.editorial?.content || '');
    }
  };

  const fetchContests = async () => {
    const response = await fetch('/api/admin/contests', { headers: adminHeaders, cache: 'no-store' });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Failed to load contests');
    setContests(Array.isArray(payload.contests) ? payload.contests : []);
  };

  const refreshAll = async () => {
    setError('');
    setStatus('Loading admin data...');
    try {
      await Promise.all([fetchUsers(), fetchProblems(), fetchContests()]);
      setStatus('Admin data loaded.');
    } catch (fetchError) {
      setError(fetchError.message || 'Failed to load admin data');
      setStatus('');
    }
  };

  useEffect(() => {
    if (loading || !token) return;
    if (!user || user.role !== 'admin') return;

    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, token]);

  const handleAdminRouteLogin = async (event) => {
    event.preventDefault();

    const email = String(adminEmail || '').trim();
    const password = String(adminPassword || '');

    setError('');
    setStatus('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    try {
      setIsAdminSigningIn(true);
      const result = await login({ email, password });

      if (!result.success) {
        setError(result.error || 'Invalid admin credentials.');
        return;
      }

      if (result.user?.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }

      setStatus('Admin login successful.');
      setAdminPassword('');
    } finally {
      setIsAdminSigningIn(false);
    }
  };

  const createProblem = async () => {
    try {
      setError('');
      setStatus('Creating problem...');

      const payload = {
        id: problemForm.id || undefined,
        slug: problemForm.slug || undefined,
        title: problemForm.title,
        rating: Number(problemForm.rating || 1200),
        difficulty: problemForm.difficulty,
        isPublic: problemForm.isPublic,
        statement: problemForm.statement,
        inputFormat: problemForm.inputFormat,
        outputFormat: problemForm.outputFormat,
        tags: splitLines(problemForm.tagsText),
        constraints: splitLines(problemForm.constraintsText),
        hints: splitLines(problemForm.hintsText),
        examples: parseJsonOrThrow(problemForm.examplesJson, 'Examples'),
        starterCode: parseJsonOrThrow(problemForm.starterCodeJson, 'Starter code'),
        testCases: parseJsonOrThrow(problemForm.testCasesJson, 'Test cases'),
      };

      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create problem');
      }

      setStatus('Problem created successfully.');
      setProblemForm(defaultProblemForm);
      await fetchProblems();
    } catch (createError) {
      setError(createError.message || 'Failed to create problem');
      setStatus('');
    }
  };

  const updateProblemVisibility = async (slug, isPublic) => {
    try {
      setError('');
      setStatus(`Updating visibility for ${slug}...`);
      const response = await fetch(`/api/admin/problems/${slug}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to update problem');
      setStatus('Problem updated.');
      await fetchProblems();
    } catch (updateError) {
      setError(updateError.message || 'Failed to update problem');
      setStatus('');
    }
  };

  const deleteProblem = async (slug) => {
    try {
      setError('');
      setStatus(`Deleting problem ${slug}...`);
      const response = await fetch(`/api/admin/problems/${slug}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to delete problem');
      setStatus('Problem deleted.');
      await fetchProblems();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete problem');
      setStatus('');
    }
  };

  const loadEditorialDraft = (slug) => {
    const target = problems.find((problem) => problem.slug === slug);
    setEditorialTargetSlug(slug);
    setEditorialTitle(target?.editorial?.title || '');
    setEditorialContent(target?.editorial?.content || '');
  };

  const saveEditorial = async () => {
    if (!editorialTargetSlug) return;

    try {
      setError('');
      setStatus(`Saving editorial for ${editorialTargetSlug}...`);
      const response = await fetch(`/api/problems/${editorialTargetSlug}/editorial`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ title: editorialTitle, content: editorialContent }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to save editorial');
      setStatus('Editorial saved.');
      await fetchProblems();
    } catch (saveError) {
      setError(saveError.message || 'Failed to save editorial');
      setStatus('');
    }
  };

  const deleteEditorial = async () => {
    if (!editorialTargetSlug) return;

    try {
      setError('');
      setStatus(`Deleting editorial for ${editorialTargetSlug}...`);
      const response = await fetch(`/api/problems/${editorialTargetSlug}/editorial`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to delete editorial');
      setStatus('Editorial deleted.');
      setEditorialTitle('');
      setEditorialContent('');
      await fetchProblems();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete editorial');
      setStatus('');
    }
  };

  const updateUser = async (targetUser) => {
    try {
      setError('');
      setStatus(`Updating ${targetUser.email}...`);
      const response = await fetch(`/api/admin/users/${targetUser._id}`, {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
          name: targetUser.name,
          role: targetUser.role,
          rating: Number(targetUser.rating || 1200),
          streakCount: Number(targetUser.streakCount || 0),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to update user');
      setStatus('User updated.');
      await fetchUsers();
    } catch (updateError) {
      setError(updateError.message || 'Failed to update user');
      setStatus('');
    }
  };

  const deleteUser = async (userId) => {
    try {
      setError('');
      setStatus('Deleting user...');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to delete user');
      setStatus('User deleted.');
      await fetchUsers();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete user');
      setStatus('');
    }
  };

  const createContest = async () => {
    try {
      setError('');
      setStatus('Creating contest...');

      const problemsPayload = splitLines(contestForm.problemsText).map((line) => {
        const [slug, pointsRaw] = line.split(':').map((part) => part.trim());
        return { problemSlug: slug, points: Number(pointsRaw || 1) };
      });

      const response = await fetch('/api/admin/contests', {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          title: contestForm.title,
          slug: contestForm.slug || undefined,
          description: contestForm.description,
          startTime: contestForm.startTime,
          durationMinutes: Number(contestForm.durationMinutes || 90),
          isPublic: contestForm.isPublic,
          isRated: contestForm.isRated,
          problems: problemsPayload,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to create contest');

      setStatus('Contest created.');
      setContestForm({
        title: '',
        slug: '',
        description: '',
        startTime: '',
        durationMinutes: 90,
        isPublic: true,
        isRated: true,
        problemsText: '',
      });
      await fetchContests();
    } catch (contestError) {
      setError(contestError.message || 'Failed to create contest');
      setStatus('');
    }
  };

  const finalizeContest = async (slug) => {
    try {
      setError('');
      setStatus(`Finalizing ${slug}...`);
      const response = await fetch(`/api/admin/contests/${slug}/finalize`, {
        method: 'POST',
        headers: adminHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to finalize contest');
      setStatus('Contest finalized and ratings updated.');
      await Promise.all([fetchContests(), fetchUsers()]);
    } catch (finalizeError) {
      setError(finalizeError.message || 'Failed to finalize contest');
      setStatus('');
    }
  };

  const deleteContest = async (slug) => {
    try {
      setError('');
      setStatus(`Deleting ${slug}...`);
      const response = await fetch(`/api/admin/contests/${slug}`, {
        method: 'DELETE',
        headers: adminHeaders,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Failed to delete contest');
      setStatus('Contest deleted.');
      await fetchContests();
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete contest');
      setStatus('');
    }
  };

  if (loading) {
    return <div className="neo-card p-6 text-sm">Loading admin session...</div>;
  }

  if (!user || user.role !== 'admin') {
    return (
      <section className="mx-auto w-full max-w-md space-y-4">
        <header className="neo-card p-6">
          <h1 className="text-xl font-black uppercase text-black dark:text-[#eef3ff]">
            Admin Login
          </h1>
          <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
            Enter admin email and password to continue.
          </p>
        </header>

        <form onSubmit={handleAdminRouteLogin} className="neo-card space-y-3 p-6">
          <input
            type="email"
            value={adminEmail}
            onChange={(event) => setAdminEmail(event.target.value)}
            placeholder="Admin email"
            className="w-full rounded-lg bg-white px-3 py-2 text-sm text-black dark:bg-[#151525] dark:text-[#eef3ff]"
          />
          <input
            type="password"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="Admin password"
            className="w-full rounded-lg bg-white px-3 py-2 text-sm text-black dark:bg-[#151525] dark:text-[#eef3ff]"
          />

          {error && (
            <div className="rounded-lg bg-[#fff0ea] p-3 text-xs font-semibold text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isAdminSigningIn}
            className="w-full rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black disabled:opacity-60 dark:bg-[#fef08a]"
          >
            {isAdminSigningIn ? 'Signing in...' : 'Login as Admin'}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="neo-card px-6 py-6">
        <h1 className="text-2xl font-black uppercase text-black dark:text-[#eef3ff]">Admin Control Center</h1>
        <p className="mt-2 text-sm font-semibold text-black/75 dark:text-[#d4deff]/80">
          Manage users, problems, editorials, and contests.
        </p>
      </header>

      <div className="neo-card p-3">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide ${
                activeTab === tab.id
                  ? 'bg-[#0f92ff] text-black dark:bg-[#fef08a]'
                  : 'bg-white text-black dark:bg-[#151525] dark:text-[#eef3ff]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {(status || error) && (
        <div className="space-y-2">
          {status && (
            <div className="neo-card bg-[#eaf8ee] p-3 text-sm text-[#1f4d30] dark:bg-[#193223] dark:text-[#c6ffd8]">
              {status}
            </div>
          )}
          {error && (
            <div className="neo-card bg-[#fff0ea] p-3 text-sm text-[#743021] dark:bg-[#3b2423] dark:text-[#ffd7cc]">
              {error}
            </div>
          )}
        </div>
      )}

      {activeTab === 'problems' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="neo-card p-4 space-y-3">
            <h2 className="text-sm font-black uppercase">Create Problem</h2>
            <input
              placeholder="Title"
              value={problemForm.title}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Slug (optional)"
                value={problemForm.slug}
                onChange={(event) => setProblemForm((prev) => ({ ...prev, slug: event.target.value }))}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
              />
              <input
                placeholder="ID (optional)"
                value={problemForm.id}
                onChange={(event) => setProblemForm((prev) => ({ ...prev, id: event.target.value }))}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={problemForm.rating}
                onChange={(event) => setProblemForm((prev) => ({ ...prev, rating: Number(event.target.value || 1200) }))}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
              />
              <select
                value={problemForm.difficulty}
                onChange={(event) => setProblemForm((prev) => ({ ...prev, difficulty: event.target.value }))}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold dark:bg-[#151525]">
                <input
                  type="checkbox"
                  checked={problemForm.isPublic}
                  onChange={(event) => setProblemForm((prev) => ({ ...prev, isPublic: event.target.checked }))}
                />
                Public
              </label>
            </div>
            <textarea
              placeholder="Statement"
              value={problemForm.statement}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, statement: event.target.value }))}
              className="h-28 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Input format"
              value={problemForm.inputFormat}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, inputFormat: event.target.value }))}
              className="h-16 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Output format"
              value={problemForm.outputFormat}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, outputFormat: event.target.value }))}
              className="h-16 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Tags (one per line)"
              value={problemForm.tagsText}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, tagsText: event.target.value }))}
              className="h-16 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Constraints (one per line)"
              value={problemForm.constraintsText}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, constraintsText: event.target.value }))}
              className="h-16 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Hints (one per line)"
              value={problemForm.hintsText}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, hintsText: event.target.value }))}
              className="h-16 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Examples JSON"
              value={problemForm.examplesJson}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, examplesJson: event.target.value }))}
              className="h-28 w-full rounded-lg bg-white px-3 py-2 font-mono text-xs dark:bg-[#151525]"
            />
            <textarea
              placeholder="Starter code JSON"
              value={problemForm.starterCodeJson}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, starterCodeJson: event.target.value }))}
              className="h-28 w-full rounded-lg bg-white px-3 py-2 font-mono text-xs dark:bg-[#151525]"
            />
            <textarea
              placeholder="Test cases JSON (minimum 10)"
              value={problemForm.testCasesJson}
              onChange={(event) => setProblemForm((prev) => ({ ...prev, testCasesJson: event.target.value }))}
              className="h-36 w-full rounded-lg bg-white px-3 py-2 font-mono text-xs dark:bg-[#151525]"
            />
            <button
              onClick={createProblem}
              className="rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
            >
              Create Problem
            </button>
          </div>

          <div className="neo-card p-4 space-y-3">
            <h2 className="text-sm font-black uppercase">Existing Problems</h2>
            <div className="max-h-225 space-y-2 overflow-auto pr-1">
              {problems.map((problem) => (
                <div key={problem._id} className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-black dark:text-[#eef3ff]">{problem.title}</div>
                      <div className="text-xs text-black/70 dark:text-[#d4deff]/80">{problem.slug} • {problem.difficulty} • {problem.rating}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateProblemVisibility(problem.slug, problem.isPublic)}
                        className="rounded-lg bg-[#44d07d] px-2 py-1 text-[11px] font-black uppercase text-black"
                      >
                        {problem.isPublic ? 'Make Private' : 'Make Public'}
                      </button>
                      <button
                        onClick={() => deleteProblem(problem.slug)}
                        className="rounded-lg bg-[#ff6b35] px-2 py-1 text-[11px] font-black uppercase text-black"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'editorials' && (
        <div className="neo-card p-4 space-y-3">
          <h2 className="text-sm font-black uppercase">Manage Editorial</h2>
          <select
            value={editorialTargetSlug}
            onChange={(event) => loadEditorialDraft(event.target.value)}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
          >
            {problems.map((problem) => (
              <option key={problem._id} value={problem.slug}>
                {problem.title} ({problem.slug})
              </option>
            ))}
          </select>
          <input
            placeholder="Editorial title"
            value={editorialTitle}
            onChange={(event) => setEditorialTitle(event.target.value)}
            className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
          />
          <textarea
            placeholder="Editorial content"
            value={editorialContent}
            onChange={(event) => setEditorialContent(event.target.value)}
            className="h-80 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
          />
          <div className="flex gap-2">
            <button
              onClick={saveEditorial}
              className="rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
            >
              Save Editorial
            </button>
            <button
              onClick={deleteEditorial}
              className="rounded-lg bg-[#ff6b35] px-4 py-2 text-xs font-black uppercase tracking-wide text-black"
            >
              Delete Editorial
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="neo-card p-4 space-y-3">
          <h2 className="text-sm font-black uppercase">Manage Users</h2>
          <div className="space-y-2">
            {users.map((targetUser) => (
              <div key={targetUser._id} className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                <div className="grid gap-2 md:grid-cols-[1.4fr_1fr_120px_120px_auto_auto] md:items-center">
                  <input
                    value={targetUser.name || ''}
                    onChange={(event) => {
                      const name = event.target.value;
                      setUsers((prev) => prev.map((item) => item._id === targetUser._id ? { ...item, name } : item));
                    }}
                    className="rounded-lg bg-[#fff9d0] px-3 py-2 text-sm text-black dark:bg-[#202037] dark:text-[#fff9f0]"
                  />
                  <div className="text-xs text-black/70 dark:text-[#d4deff]/80">{targetUser.email}</div>
                  <select
                    value={targetUser.role || 'user'}
                    onChange={(event) => {
                      const role = event.target.value;
                      setUsers((prev) => prev.map((item) => item._id === targetUser._id ? { ...item, role } : item));
                    }}
                    className="rounded-lg bg-[#fff9d0] px-3 py-2 text-sm text-black dark:bg-[#202037] dark:text-[#fff9f0]"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                  <input
                    type="number"
                    value={Number(targetUser.rating || 1200)}
                    onChange={(event) => {
                      const rating = Number(event.target.value || 1200);
                      setUsers((prev) => prev.map((item) => item._id === targetUser._id ? { ...item, rating } : item));
                    }}
                    className="rounded-lg bg-[#fff9d0] px-3 py-2 text-sm text-black dark:bg-[#202037] dark:text-[#fff9f0]"
                  />
                  <button
                    onClick={() => updateUser(targetUser)}
                    className="rounded-lg bg-[#44d07d] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-black"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => deleteUser(targetUser._id)}
                    className="rounded-lg bg-[#ff6b35] px-3 py-2 text-[11px] font-black uppercase tracking-wide text-black"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contests' && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="neo-card p-4 space-y-3">
            <h2 className="text-sm font-black uppercase">Create Contest</h2>
            <input
              placeholder="Title"
              value={contestForm.title}
              onChange={(event) => setContestForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <input
              placeholder="Slug (optional)"
              value={contestForm.slug}
              onChange={(event) => setContestForm((prev) => ({ ...prev, slug: event.target.value }))}
              className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <textarea
              placeholder="Description"
              value={contestForm.description}
              onChange={(event) => setContestForm((prev) => ({ ...prev, description: event.target.value }))}
              className="h-20 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={contestForm.startTime}
                onChange={(event) => setContestForm((prev) => ({ ...prev, startTime: event.target.value }))}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
              />
              <input
                type="number"
                min={10}
                value={contestForm.durationMinutes}
                onChange={(event) => setContestForm((prev) => ({ ...prev, durationMinutes: Number(event.target.value || 90) }))}
                className="w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
              />
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-bold uppercase">
              <input
                type="checkbox"
                checked={contestForm.isPublic}
                onChange={(event) => setContestForm((prev) => ({ ...prev, isPublic: event.target.checked }))}
              />
              Public contest
            </label>
            <label className="inline-flex items-center gap-2 text-xs font-bold uppercase">
              <input
                type="checkbox"
                checked={contestForm.isRated}
                onChange={(event) => setContestForm((prev) => ({ ...prev, isRated: event.target.checked }))}
              />
              Rated contest
            </label>
            <textarea
              placeholder="Problems (one per line): slug or slug:points"
              value={contestForm.problemsText}
              onChange={(event) => setContestForm((prev) => ({ ...prev, problemsText: event.target.value }))}
              className="h-28 w-full rounded-lg bg-white px-3 py-2 text-sm dark:bg-[#151525]"
            />
            <p className="text-xs text-black/70 dark:text-[#d4deff]/80">
              Available private problems: {privateProblems.map((problem) => problem.slug).join(', ') || 'none'}
            </p>
            <button
              onClick={createContest}
              className="rounded-lg bg-[#0f92ff] px-4 py-2 text-xs font-black uppercase tracking-wide text-black dark:bg-[#fef08a]"
            >
              Create Contest
            </button>
          </div>

          <div className="neo-card p-4 space-y-3">
            <h2 className="text-sm font-black uppercase">Existing Contests</h2>
            <div className="max-h-225 space-y-2 overflow-auto pr-1">
              {contests.map((contest) => (
                <div key={contest._id} className="rounded-lg border border-black/20 bg-white p-3 dark:border-[#7d8fc4]/35 dark:bg-[#151525]">
                  <div className="text-sm font-black text-black dark:text-[#eef3ff]">{contest.title}</div>
                  <div className="text-xs text-black/70 dark:text-[#d4deff]/80">
                    {contest.slug} • {new Date(contest.startTime).toLocaleString()} • {contest.durationMinutes}m • {contest.isRated ? 'rated' : 'unrated'}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      onClick={() => finalizeContest(contest.slug)}
                      className="rounded-lg bg-[#44d07d] px-2 py-1 text-[11px] font-black uppercase text-black"
                    >
                      Finalize Rating
                    </button>
                    <button
                      onClick={() => deleteContest(contest.slug)}
                      className="rounded-lg bg-[#ff6b35] px-2 py-1 text-[11px] font-black uppercase text-black"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
