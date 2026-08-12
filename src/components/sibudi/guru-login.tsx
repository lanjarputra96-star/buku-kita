import { useState } from "react";
import { GraduationCap, LogIn } from "lucide-react";
import { useSibudi } from "@/lib/sibudi-store";
import { SCHOOL } from "@/lib/sibudi-data";
import { PasswordField } from "@/components/sibudi/password-input";


export function GuruLoginGate({ children }: { children: React.ReactNode }) {
  const { state, ready, loginGuru } = useSibudi();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  if (!ready) return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Memuat…</div>;
  if (state.guruLoggedIn) return <>{children}</>;

  return (
    <div className="grid min-h-screen place-items-center bg-muted/40 px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!loginGuru(user, pass)) setErr("Username atau password salah.");
          else setErr("");
        }}
        className="card-surface w-full max-w-sm space-y-4 p-6"
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Login Guru {SCHOOL.app}</h1>
            <p className="text-xs text-muted-foreground">{SCHOOL.name}</p>
          </div>
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">Username (dibuat oleh admin)</span>
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="misal: siti"
          />
        </label>
        <PasswordField value={pass} onChange={setPass} />


        {err ? <p className="text-xs font-semibold text-destructive">{err}</p> : null}

        <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary-hover">
          <LogIn className="size-4" /> Masuk
        </button>
        <p className="text-center text-[11px] text-muted-foreground">
          Password default: <b>guru123</b> — dapat diubah di menu Profil setelah login.
        </p>
      </form>
    </div>
  );
}
