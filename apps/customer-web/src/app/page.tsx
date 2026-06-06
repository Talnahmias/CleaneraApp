'use client';

import { JobStatus } from '@cleaners/shared';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';

type ServiceType = {
  id: string;
  name: string;
  description: string;
  basePriceCents: number;
  durationMinutes: number;
};

type Address = {
  id: string;
  label: string;
  line1: string;
  city: string;
};

type Job = {
  id: string;
  status: JobStatus;
  priceCents: number;
  scheduledAt: string;
  serviceType: { name: string };
  cleaner?: { firstName: string; lastName: string } | null;
};

const STATUS_LABEL: Record<string, string> = {
  REQUESTED: 'Finding cleaner…',
  MATCHING: 'Finding cleaner…',
  ASSIGNED: 'Cleaner assigned',
  EN_ROUTE: 'On the way',
  ARRIVED: 'Arrived',
  IN_PROGRESS: 'Cleaning',
  COMPLETED: 'Done',
  CANCELLED: 'Cancelled',
  DISPUTED: 'Disputed',
};

export default function Home() {
  const [phone, setPhone] = useState('+10000000002');
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const loadDashboard = useCallback(async (accessToken: string) => {
    const [svc, addr, jobList] = await Promise.all([
      api<ServiceType[]>('/service-types'),
      api<Address[]>('/addresses', { token: accessToken }),
      api<Job[]>('/jobs', { token: accessToken }),
    ]);
    setServices(svc);
    setAddresses(addr);
    setJobs(jobList);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('cleaners_token');
    if (saved) {
      setToken(saved);
      loadDashboard(saved).catch(() => localStorage.removeItem('cleaners_token'));
    }
  }, [loadDashboard]);

  async function login() {
    setLoading(true);
    setError(null);
    try {
      await api('/auth/otp/request', {
        method: 'POST',
        body: JSON.stringify({ phone }),
      });
      const res = await api<{ accessToken: string }>('/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code: '123456', role: 'CUSTOMER' }),
      });
      localStorage.setItem('cleaners_token', res.accessToken);
      setToken(res.accessToken);
      await loadDashboard(res.accessToken);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('cleaners_token');
    setToken(null);
    setJobs([]);
    setServices([]);
    setAddresses([]);
  }

  async function book(serviceId: string) {
    if (!token || !addresses[0]) return;
    setLoading(true);
    setError(null);
    try {
      const job = await api<Job>('/jobs', {
        method: 'POST',
        token,
        body: JSON.stringify({
          addressId: addresses[0].id,
          serviceTypeId: serviceId,
          scheduledAt: new Date().toISOString(),
          isOnDemand: true,
        }),
      });
      setBookingId(job.id);
      await loadDashboard(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Booking failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">
              C
            </span>
            <span className="text-xl font-bold text-slate-900">CleanersApp</span>
          </div>
          {token ? (
            <button
              type="button"
              onClick={logout}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              Sign out
            </button>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {!token ? (
          <section className="space-y-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">
                Book a trusted cleaner in minutes
              </h1>
              <p className="text-lg text-slate-600">
                On-demand or scheduled home cleaning — live status, upfront price, like Gett for
                your home.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Sign in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Dev mode: use OTP <strong>123456</strong>
              </p>
              <label className="mt-4 block text-sm font-medium text-slate-700">Phone</label>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+10000000002"
              />
              <button
                type="button"
                disabled={loading}
                onClick={login}
                className="mt-4 w-full rounded-lg bg-teal-700 py-3 font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {loading ? 'Signing in…' : 'Continue'}
              </button>
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            {bookingId && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-teal-900">
                Booking confirmed! We&apos;re matching you with a cleaner.
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">Book a clean</h1>
              <p className="text-slate-600">
                {addresses[0]
                  ? `Delivering to ${addresses[0].label}, ${addresses[0].line1}`
                  : 'Add an address in the app to book'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <article
                  key={s.id}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <h3 className="text-lg font-semibold">{s.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-slate-600">{s.description}</p>
                  <p className="mt-3 text-sm text-slate-500">{s.durationMinutes} min</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ₪{(s.basePriceCents / 100).toFixed(0)}
                  </p>
                  <button
                    type="button"
                    disabled={loading || !addresses.length}
                    onClick={() => book(s.id)}
                    className="mt-4 rounded-lg bg-teal-700 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                  >
                    Book now
                  </button>
                </article>
              ))}
            </div>

            <div>
              <h2 className="text-xl font-bold">Your jobs</h2>
              {jobs.length === 0 ? (
                <p className="mt-2 text-slate-500">No bookings yet.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {jobs.map((job) => (
                    <li
                      key={job.id}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">{job.serviceType.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(job.scheduledAt).toLocaleString()}
                          </p>
                          {job.cleaner && (
                            <p className="text-sm text-slate-600">
                              {job.cleaner.firstName} {job.cleaner.lastName}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">
                            {STATUS_LABEL[job.status] ?? job.status}
                          </span>
                          <p className="mt-2 font-semibold">
                            ₪{(job.priceCents / 100).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}
