import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "secondary" | "ghost" };
export function Button({ className = "", variant, ...props }: Props) {
  const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "secondary"
      ? "bg-gray-100 hover:bg-gray-200 text-gray-900"
      : variant === "ghost"
      ? "bg-transparent hover:bg-gray-100 text-gray-900"
      : "bg-[#1A2345] text-white hover:opacity-90";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
