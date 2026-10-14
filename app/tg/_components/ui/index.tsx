"use client";

// Building blocks for the mini app, styled after the CheckTag mobile app:
// solid surfaces, hairline borders, the navy→cyan brand gradient for primary
// actions, and the brand-only signal palette (no extra hues).

import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2, Package } from "lucide-react";
import { forwardRef, useState, type ReactNode } from "react";
import { safeUrl } from "../../_lib/format";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export const spring = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;
export const ease = [0.22, 1, 0.36, 1] as const;

// ------------------------------------------------------------------ buttons

type BtnVariant = "primary" | "tonal" | "outline" | "ghost" | "danger";

interface BtnProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: BtnVariant;
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  busy?: boolean;
  block?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button(
  { variant = "primary", size = "md", icon, busy, block, className, children, disabled, ...rest },
  ref,
) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-semibold select-none transition-colors disabled:opacity-55 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ct-accent";
  const sizes = {
    sm: "h-9 px-3.5 text-[13.5px] rounded-full",
    md: "h-11 px-5 text-[15px] rounded-[14px]",
    lg: "h-[52px] px-6 text-[15.5px] rounded-[16px]",
  };
  const variants: Record<BtnVariant, string> = {
    primary: "ct-grad text-white",
    tonal: "bg-ct-primary-soft text-ct-primary",
    outline: "bg-ct-surface text-ct-text border border-ct-border-strong",
    ghost: "bg-transparent text-ct-text-2",
    danger: "bg-ct-danger-soft text-ct-danger",
  };
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      transition={spring}
      disabled={disabled || busy}
      className={cx(base, sizes[size], variants[variant], block && "w-full", className)}
      {...rest}
    >
      {busy ? <Loader2 className="ct-spin" size={17} /> : icon}
      {children}
    </motion.button>
  );
});

export function IconButton({
  label,
  onClick,
  children,
  className,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={spring}
      className={cx(
        "grid h-10 w-10 place-items-center rounded-full border border-ct-border bg-ct-surface text-ct-text-2 focus-visible:outline-2 focus-visible:outline-ct-accent",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

// ------------------------------------------------------------------ surfaces

export function Card({ className, children, ...rest }: HTMLMotionProps<"div"> & { children?: ReactNode }) {
  return (
    <motion.div className={cx("ct-card", className)} {...rest}>
      {children}
    </motion.div>
  );
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-[17px] font-bold tracking-[-0.01em] text-ct-text">{title}</h2>
        {sub && <p className="mt-0.5 text-[13px] text-ct-text-3">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Overline({ children }: { children: ReactNode }) {
  return <div className="mb-2 mt-6 px-1 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ct-text-3">{children}</div>;
}

export function Skel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cx("ct-skel", className)} style={style} />;
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title?: string; text: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-9 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-ct-primary-soft text-ct-primary">{icon}</div>
      {title && <div className="mb-1 text-[15px] font-semibold text-ct-text">{title}</div>}
      <div className="max-w-[300px] text-[14px] leading-relaxed text-ct-text-2">{text}</div>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ------------------------------------------------------------------ pills & chips

export function Pill({
  tone = "soft",
  icon,
  children,
  className,
}: {
  tone?: "soft" | "good" | "alert" | "muted" | "warn";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const tones = {
    soft: "bg-ct-primary-soft text-ct-primary",
    good: "bg-ct-good text-ct-on-fill",
    alert: "bg-ct-alert text-ct-on-fill",
    muted: "bg-ct-surface-alt text-ct-text-2 border border-ct-border",
    warn: "bg-ct-warn-soft text-ct-warn",
  };
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[11px] font-bold leading-none",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  full,
  layoutId,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
  full?: boolean;
  layoutId: string;
}) {
  return (
    <div role="group" aria-label={label} className={cx("relative flex rounded-full bg-ct-surface-alt p-1 border border-ct-border", full && "w-full")}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => !on && onChange(o.value)}
            className={cx(
              "relative z-10 flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
              on ? "text-white" : "text-ct-text-2",
            )}
          >
            {on && <motion.span layoutId={layoutId} transition={spring} className="ct-grad absolute inset-0 -z-10 rounded-full" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ media

export function Thumb({ src, size = 48, radius = 12, className }: { src?: string | null; size?: number; radius?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const url = safeUrl(src);
  // The placeholder icon sits underneath; the photo fades in over it.
  return (
    <div
      className={cx("relative grid shrink-0 place-items-center overflow-hidden border border-ct-border bg-ct-surface-alt text-ct-text-3", className)}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <Package size={Math.round(size * 0.42)} strokeWidth={1.7} />
      {url && !broken && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setBroken(true)}
          className={cx("absolute inset-0 h-full w-full bg-white object-contain transition-opacity duration-300", loaded ? "opacity-100" : "opacity-0")}
        />
      )}
    </div>
  );
}

/** Star row with partial fill (stars keep their familiar gold). */
export function Stars({ value, size = 15 }: { value: number; size?: number }) {
  const v = Math.max(0, Math.min(5, value || 0));
  return (
    <span className="relative inline-block leading-none" role="img" aria-label={`${v.toFixed(1)} out of 5`} style={{ fontSize: size }}>
      <span className="text-ct-border-strong" aria-hidden>
        ★★★★★
      </span>
      <span className="absolute inset-0 overflow-hidden whitespace-nowrap text-ct-gold" style={{ width: `${(v / 5) * 100}%` }} aria-hidden>
        ★★★★★
      </span>
    </span>
  );
}

/** Animated rating ring in brand navy. */
export function RatingRing({ value, size = 64, stroke = 5.5 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const frac = Math.max(0, Math.min(1, value / 5));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ct-surface-muted)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--ct-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - frac) }}
          transition={{ duration: 0.9, ease }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-[19px] font-extrabold tracking-tight text-ct-text">{value.toFixed(1)}</div>
    </div>
  );
}

/** A horizontal bar that grows in. */
export function Bar({ frac, color, height = 8, minVisible = true }: { frac: number; color: string; height?: number; minVisible?: boolean }) {
  const pct = Math.max(0, Math.min(1, frac)) * 100;
  return (
    <div className="relative w-full overflow-hidden rounded-full bg-ct-border" style={{ height }}>
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: color, minWidth: minVisible && pct > 0 ? height : 0 }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease }}
      />
    </div>
  );
}

export const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.045 } },
};
export const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease } },
};
