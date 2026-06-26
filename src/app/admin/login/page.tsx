"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../auth-actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    loginAction,
    null,
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-space px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-black tracking-wide text-fog">
            ALIENHUB<span className="text-alien">.STORE</span>
          </h1>
          <p className="mt-1 font-mono text-xs uppercase tracking-widest text-fog-dim">
            System Access
          </p>
        </div>

        <form
          action={action}
          className="space-y-4 rounded-2xl border border-edge bg-card/60 p-6"
        >
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-fog-dim">
              Email
            </label>
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-edge bg-space px-3 py-2 text-sm text-fog outline-none focus:border-alien-dim"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-fog-dim">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-edge bg-space px-3 py-2 text-sm text-fog outline-none focus:border-alien-dim"
            />
          </div>

          {state?.error && (
            <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-alien py-2.5 font-display text-xs font-bold uppercase tracking-widest text-black transition hover:bg-alien-dim disabled:opacity-60"
          >
            {pending ? "Authenticating…" : "Enter System"}
          </button>
        </form>
      </div>
    </main>
  );
}
