"use client";
import * as React from "react";

type TabsCtx = { value: string; setValue: (v: string) => void };
const Ctx = React.createContext<TabsCtx | null>(null);

export function Tabs({ defaultValue, children, className = "" }: { defaultValue: string; children: React.ReactNode; className?: string }) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <div className={className}>
      <Ctx.Provider value={{ value, setValue }}>{children}</Ctx.Provider>
    </div>
  );
}
export function TabsList({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`inline-flex gap-2 rounded-md border p-1 bg-white ${className}`}>{children}</div>;
}
export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx)!;
  const active = ctx.value === value;
  return (
    <button
      onClick={() => ctx.setValue(value)}
      className={`px-3 py-1.5 text-sm rounded-md ${active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"}`}
    >
      {children}
    </button>
  );
}
export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(Ctx)!;
  if (ctx.value !== value) return null;
  return <div className="mt-2">{children}</div>;
}
