"use client";

import Link from "next/link";
import { useState } from "react";

interface BaseProps {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onDark?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

interface ButtonProps extends BaseProps {
  href?: never;
  onClick?: () => void;
  type?: "button" | "submit";
}

interface LinkProps extends BaseProps {
  href: string;
  onClick?: never;
  type?: never;
}

type Props = ButtonProps | LinkProps;

/**
 * Botón brutalist con borde grueso + offset shadow adaptive.
 * - Sobre paper: borde y sombra ink.
 * - Sobre ink: borde y sombra paper.
 * Al hover: sombra se aplasta y el botón se mueve 3px para crear sensación de click.
 */
export default function BrutalistButton(props: Props) {
  const {
    children,
    variant = "primary",
    onDark = false,
    size = "md",
    className = "",
  } = props;

  const [hover, setHover] = useState(false);

  const frame = onDark ? "var(--color-paper-pure)" : "var(--color-ink)";

  const bg =
    variant === "primary"
      ? "var(--color-river-red)"
      : onDark
        ? "var(--color-ink)"
        : "var(--color-paper-pure)";

  const fg =
    variant === "primary"
      ? "var(--color-paper-pure)"
      : onDark
        ? "var(--color-paper-pure)"
        : "var(--color-ink)";

  const padding = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3.5 text-sm",
    lg: "px-8 py-4 text-base",
  }[size];

  const style: React.CSSProperties = {
    background: bg,
    color: fg,
    border: `2px solid ${frame}`,
    boxShadow: hover ? `2px 2px 0 ${frame}` : `5px 5px 0 ${frame}`,
    transform: hover ? "translate(3px, 3px)" : "translate(0, 0)",
    transition: "all 120ms ease-out",
  };

  const classes = `inline-flex items-center gap-2 font-semibold tracking-wide ${padding} ${className}`;

  const onEnter = () => setHover(true);
  const onLeave = () => setHover(false);

  if ("href" in props && props.href) {
    return (
      <Link
        href={props.href}
        className={classes}
        style={style}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
      </Link>
    );
  }

  const { onClick, type = "button" } = props as ButtonProps;

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      style={style}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </button>
  );
}
