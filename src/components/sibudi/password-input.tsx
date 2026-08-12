import { useId, useState } from "react";

export function PasswordField({
  label = "Password",
  value,
  onChange,
  placeholder = "••••••",
  autoComplete = "current-password",
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const id = useId();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      <label className="flex items-center gap-2 pt-0.5 text-[11px] font-semibold text-muted-foreground">
        <input
          type="checkbox"
          checked={show}
          onChange={(e) => setShow(e.target.checked)}
          className="size-3.5 accent-[hsl(var(--primary))]"
        />
        Tunjukkan password
      </label>
    </div>
  );
}
