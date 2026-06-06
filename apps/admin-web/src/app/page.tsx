const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getHealth() {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    return res.json();
  } catch {
    return { status: 'unreachable' };
  }
}

async function getServiceTypes() {
  try {
    const res = await fetch(`${API_URL}/service-types`, { cache: 'no-store' });
    return res.json();
  } catch {
    return [];
  }
}

export default async function AdminHome() {
  const [health, serviceTypes] = await Promise.all([getHealth(), getServiceTypes()]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">CleanersApp Admin</h1>
          <p className="text-slate-600 mt-2">
            v1 + v1.5 operations — approve cleaners, jobs, refunds (API-backed)
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold">API health</h2>
          <pre className="mt-3 text-sm bg-slate-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(health, null, 2)}
          </pre>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold">Service catalog</h2>
          <ul className="mt-4 space-y-3">
            {(serviceTypes as Array<{ name: string; basePriceCents: number; durationMinutes: number }>).map(
              (s, i) => (
                <li key={i} className="flex justify-between border-b border-slate-100 pb-2">
                  <span>{s.name}</span>
                  <span className="text-slate-500">
                    ₪{(s.basePriceCents / 100).toFixed(0)} · {s.durationMinutes} min
                  </span>
                </li>
              ),
            )}
            {!serviceTypes?.length && (
              <li className="text-slate-500">Start API + database to load services</li>
            )}
          </ul>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold">Admin API routes</h2>
          <ul className="mt-3 text-sm text-slate-700 space-y-1 font-mono">
            <li>GET /admin/cleaners/pending</li>
            <li>PATCH /admin/cleaners/:userId/status</li>
            <li>GET /admin/jobs</li>
            <li>POST /admin/jobs/:jobId/refund</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
