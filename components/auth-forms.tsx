"use client";

import { useActionState } from "react";
import { signInAction, signOutAction, signUpAction, type AuthActionState } from "@/app/actions";

const initialState: AuthActionState = {
  error: null,
  success: null,
};

function Message({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
        {state.error}
      </p>
    );
  }

  if (state.success) {
    return (
      <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {state.success}
      </p>
    );
  }

  return null;
}

export function LoginForms() {
  const [signInState, signInFormAction, signInPending] = useActionState(
    signInAction,
    initialState,
  );
  const [signUpState, signUpFormAction, signUpPending] = useActionState(
    signUpAction,
    initialState,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        action={signInFormAction}
        className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
      >
        <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
          Connexion
        </h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <Message state={signInState} />
        <button
          type="submit"
          disabled={signInPending}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
        >
          {signInPending ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <form
        action={signUpFormAction}
        className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
      >
        <h2 className="font-[family-name:var(--font-oswald)] text-3xl uppercase">
          Nouveau compte
        </h2>
        <input
          name="fullName"
          type="text"
          placeholder="Nom complet"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Mot de passe"
          required
          minLength={6}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none"
        />
        <Message state={signUpState} />
        <button
          type="submit"
          disabled={signUpPending}
          className="rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950 disabled:opacity-50"
        >
          {signUpPending ? "Creation..." : "Creer un compte"}
        </button>
      </form>
    </div>
  );
}

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-slate-950"
      >
        Se deconnecter
      </button>
    </form>
  );
}
