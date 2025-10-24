'use client';
import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowLeft, Shield, Phone, Car, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const THEME = { primary: "#1A2345", secondary: "#0D2D53", accent: "#CFE8D6" };
const bg = (hex) => ({ backgroundColor: hex });
const border = (hex) => ({ borderColor: hex });
const color = (hex) => ({ color: hex });

const makeInitialState = () => ({
  ownsCar: "",
  householdVehicle: "",
  sr22: false,
  age: 30,
  state: "NC",
  first: "Alex",
  last: "Rivera",
  email: "alex@example.com",
  phone: "",
  consentAgreed: false,
  street: "",
  city: "",
  zip: "28801",
  license: "",
  licState: "NC",
  biLimit: 50000,
  umLimit: 50000,
  biPerPerson: 50000,
  biPerAccident: 100000,
  pdPerAccident: 50000,
  umPerPerson: 50000,
  umPerAccident: 100000,
  monthly: 46.8,
  dob: "",
  gender: "",
  firstLicensedAge: "",
  licenseStatus: "",
  hasViolations: "no",
  violationType: "",
  hasAccidents: "no",
  accidentType: "",
  accidentPlan: true,
  coveragePackage: "basic",
  paymentPlan: "monthly",
  startDate: new Date().toISOString().split('T')[0],
});

const BrandLogo = ({ className = "", height = 24, src }) => {
  return (
    <div className={`flex items-center ${className}`} style={{ height }} aria-label="Able Insurance Agency">
      <img
        src={src || "/able-logo.svg"}
        alt="Able Insurance Agency"
        className="block h-full w-auto"
        draggable={false}
      />
    </div>
  );
};

const PoweredBy = ({ compact = false }) => {
  const [logoOk, setLogoOk] = useState(true);
  const imgH = compact ? 24 : 30;
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1" : "gap-2"} text-gray-600 ${compact ? "text-[11px]" : "text-xs"}`}>
      <span>Powered by</span>
      {logoOk ? (
        <img src="/GCILogo.png" alt="Greenville Casualty Insurance" style={{ height: imgH, width: "auto" }} className="block w-auto" onError={() => setLogoOk(false)} />
      ) : (
        <span className="inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px]" style={color(THEME.secondary)}>GCI</span>
      )}
    </div>
  );
};

const StepsBar = ({ step, steps, size = "md", className = "" }) => {
  const total = Math.max(1, steps.length);
  const pct = total > 1 ? Math.min(100, Math.max(0, (step / (total - 1)) * 100)) : 0;
  const isSm = size === "sm";
  const trackH = isSm ? "h-3" : "h-4";
  const pad = isSm ? "p-1" : "p-1.5 sm:p-2";
  const icon = isSm ? "w-4 h-4" : "w-5 h-5 sm:w-6 sm:h-6";
  return (
    <div className={`relative w-full ${trackH} rounded-full ${className}`} aria-hidden="true" style={{ background: "linear-gradient(#e6eaf0,#dfe3ea)" }}>
      <div className="absolute inset-0 rounded-full pointer-events-none" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.08)" }} />
      <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: '#f49646', transition: "width 240ms ease" }} />
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10" style={{ left: `${pct}%` }}>
        <div className={`bg-white rounded-full border shadow-sm ${pad}`}>
          <Car className={icon} style={color('#f49646')} />
        </div>
      </div>
    </div>
  );
};

const TopBar = ({ isDesktop }) => (
  <div className="flex items-center justify-between mb-4">
    <BrandLogo height={28} src="/able-logo.svg" />
    {isDesktop ? (
      <a href="tel:+19104524333" className="hidden sm:flex items-center gap-2 text-sm font-medium" style={color(THEME.secondary)}><Phone className="w-4 h-4" /> (910) 452-4333</a>
    ) : (
      <a href="tel:+19104524333" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm" style={{ ...bg(THEME.primary), color: "#ffffff" }}><Phone className="w-3.5 h-3.5" /> Call Now</a>
    )}
  </div>
);


// --- Minimal step components to restore app ---
const StartStep = ({ next }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl shadow-inner" style={bg(THEME.accent)}>
        <Shield className="w-6 h-6" style={color(THEME.secondary)} />
      </div>
      <div>
        <h2 className="text-2xl font-semibold leading-tight" style={color(THEME.secondary)}>
          Non-Owner Auto
          <br />
          Insurance Quote
        </h2>
      </div>
    </div>
    <ul className="list-disc pl-6 space-y-2 text-gray-700">
      <li>Liability coverage that travels with you</li>
      <li>DL-123 form available (if required)</li>
      <li>Instant, online policy</li>
    </ul>
    <div>
      <Button className="w-full sm:w-auto" style={bg(THEME.primary)} onClick={next}>Start your quote</Button>
    </div>
  </div>
);

// Reusable Yes/No block selector
const YesNoBlocks = ({ value, onChange, name, size = "md" }) => {
  const isSm = size === "sm";
  const btnBase = isSm
    ? "h-8 px-2 py-1 text-[11px]"
    : "h-9 px-3 py-2 text-xs";
  const gap = isSm ? "gap-1" : "gap-2";
  const maxW = isSm ? "max-w-[180px]" : "max-w-xs";
  const Btn = ({ v, label }) => (
    <button
      type="button"
      role="radio"
      aria-checked={value === v}
      onClick={() => onChange(v)}
      className={`inline-flex items-center justify-center w-full rounded-lg border ${btnBase} font-medium transition ${value === v ? 'ring-2' : ''}`}
      style={value === v ? border(THEME.primary) : {}}
    >
      {label}
    </button>
  );
  return (
    <div className={`mt-2 grid grid-cols-2 ${gap} ${maxW}`} role="radiogroup" aria-label={name}>
      <Btn v="no" label="No" />
      <Btn v="yes" label="Yes" />
    </div>
  );
};

const EligibilityStep = ({ data, setData, next, back, forceStack = false }) => {
  // Default start date to today if not set
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (!data.startDate) {
      setData({ ...data, startDate: todayStr });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const today = useMemo(() => new Date(), []);
  const fmt = (d) => d.toISOString().split('T')[0];
  const minDate = fmt(today);
  const maxDate = fmt(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
  const start = data.startDate || "";
  const hasStart = !!start;
  const invalidDate = hasStart && (start < minDate || start > maxDate);
  const ineligible = data.ownsCar === "yes" || data.householdVehicle === "yes";
  const unanswered = !hasStart || !data.ownsCar || !data.householdVehicle || invalidDate;
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Eligibility</h3>

      <div className="w-full max-w-xs">
        <Label>When would you like this policy to start?</Label>
        <Input
          type="date"
          min={minDate}
          max={maxDate}
          value={start}
          onChange={(e)=> setData({ ...data, startDate: e.target.value })}
          className="mt-2"
        />
        {invalidDate && (
          <p className="text-xs text-red-600 mt-2">Please choose today ({minDate}) or a date within 30 days (by {maxDate}).</p>
        )}
      </div>

      <div className={forceStack ? "flex flex-col items-center gap-8" : "flex flex-col items-center gap-8 sm:grid sm:grid-cols-2 sm:items-start"}>
        <div className="w-full max-w-xs text-center sm:text-left">
          <Label>Do you own a vehicle?</Label>
          <YesNoBlocks name="Do you own a vehicle?" value={data.ownsCar} onChange={(v) => setData({ ...data, ownsCar: v })} />
        </div>
        <div className="w-full max-w-xs text-center sm:text-left">
          <Label>Do you live in a household with a vehicle?</Label>
          <YesNoBlocks name="Do you live in a household with a vehicle?" value={data.householdVehicle} onChange={(v) => setData({ ...data, householdVehicle: v })} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button style={bg(THEME.primary)} disabled={ineligible || unanswered} aria-disabled={ineligible || unanswered} onClick={() => { if (!ineligible && !unanswered) next(); }}>Continue</Button>
      </div>
      {ineligible && (<p className="text-sm text-red-600">To qualify, you can't own a vehicle or live in a household with one.</p>)}
    </div>
  );
};

const PersonalStep = ({ data, setData, next, back }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>About you</h3>
    <div className="grid sm:grid-cols-2 gap-4">
      <div><Label>First name</Label><Input value={data.first} onChange={(e) => setData({ ...data, first: e.target.value })} /></div>
      <div><Label>Last name</Label><Input value={data.last} onChange={(e) => setData({ ...data, last: e.target.value })} /></div>
      <div className="sm:col-span-2"><Label>Street Address</Label><Input value={data.street || ""} onChange={(e) => setData({ ...data, street: e.target.value })} /></div>
      <div><Label>City</Label><Input value={data.city || ""} onChange={(e) => setData({ ...data, city: e.target.value })} /></div>
      <div><Label>State</Label><Input value={data.state || "NC"} disabled /></div>
      <div><Label>Zip</Label><Input value={data.zip} onChange={(e) => setData({ ...data, zip: e.target.value })} /></div>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
      <Button style={bg(THEME.primary)} onClick={next}>Continue</Button>
    </div>
  </div>
);

const ContactStep = ({ data, setData, next, back }) => {
  const [agree, setAgree] = useState(!!data.consentAgreed);
  const onContinue = () => { if (!agree) return; setData({ ...data, consentAgreed: true }); next(); };
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Contact information</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Email</Label><Input type="email" value={data.email || ""} onChange={(e) => setData({ ...data, email: e.target.value })} /></div>
        <div><Label>Phone</Label><Input type="tel" value={data.phone || ""} onChange={(e) => setData({ ...data, phone: e.target.value })} /></div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
            <span>We may contact you to assist with your quote or policy. Click <span className="font-semibold">Agree and Continue</span> to accept our <a className="underline" href="#">Terms</a> and <a className="underline" href="#">Privacy Policy</a>.</span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button style={bg(THEME.primary)} disabled={!agree} aria-disabled={!agree} onClick={onContinue}>Agree and Continue</Button>
      </div>
    </div>
  );
};

const LicenseStep = ({ data, setData, next, back }) => {
  const status = data.licenseStatus || "";
  const showNumAndState = status === 'Active' || status === 'Suspended/Revoked' || status === 'Permit';
  const showFirstLicensedAge = status === 'Active' || status === 'Suspended/Revoked';
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>License</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div><Label>Date of Birth</Label><Input type="date" value={data.dob || ""} onChange={(e) => setData({ ...data, dob: e.target.value })} /></div>
        <div>
          <Label>License Status</Label>
          <select className="w-full border rounded-md h-10 px-3" value={status} onChange={(e) => setData({ ...data, licenseStatus: e.target.value })}>
            <option value="">Select status...</option>
            <option value="Never Licensed">Never Licensed</option>
            <option value="Active">Active</option>
            <option value="Suspended/Revoked">Suspended/Revoked</option>
            <option value="Permit">Permit</option>
          </select>
        </div>

        {showNumAndState && (
          <><div><Label>License Number</Label><Input value={data.license || ""} onChange={(e) => setData({ ...data, license: e.target.value })} /></div>
          <div><Label>Issuing State</Label><Input value={data.licState || "NC"} onChange={(e) => setData({ ...data, licState: e.target.value })} /></div></>
        )}

        {showFirstLicensedAge && (
          <div className="sm:col-span-2 max-w-xs"><Label>Age When First Licensed</Label><Input type="number" min={14} max={100} value={data.firstLicensedAge || ""} onChange={(e) => setData({ ...data, firstLicensedAge: e.target.value })} /></div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button style={bg(THEME.primary)} onClick={next}>Continue</Button>
      </div>
    </div>
  );
};

const HistoryStep = ({ data, setData, next, back }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Driving history</h3>
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label>Any traffic violations in the last 5 years?</Label>
        <YesNoBlocks name="Any traffic violations in the last 5 years?" value={data.hasViolations} onChange={(v) => setData({ ...data, hasViolations: v })} />
      </div>
      <div>
        <Label>Any accidents in the last 5 years?</Label>
        <YesNoBlocks name="Any accidents in the last 5 years?" value={data.hasAccidents} onChange={(v) => setData({ ...data, hasAccidents: v })} />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
      <Button style={bg(THEME.primary)} onClick={next}>Continue</Button>
    </div>
  </div>
);

const CoverageStep = ({ data, setData, next, back, isMobile = false }) => {
  const BASIC = { label: 'Basic', bi: [50000,100000], pd: 50000, umbi: [50000,100000], umpd: 50000, monthly: 46.8 };
  const PLUS  = { label: 'Plus',  bi: [100000,300000], pd: 50000, umbi: [100000,300000], umpd: 50000, monthly: 93.6 };
  const toKey = (arr)=>`${arr[0]}/${arr[1]}`;
  const tab = (data && data.coveragePackage) ? data.coveragePackage : 'basic';
  const setTab = (t) => { setData && setData({ ...data, coveragePackage: t }); };
  const [customKey, setCustomKey] = useState(toKey(BASIC.bi));
  const [accProt, setAccProt] = useState(true);
  const current = tab==='basic' ? BASIC : tab==='plus' ? PLUS : (customKey===toKey(BASIC.bi) ? BASIC : PLUS);
  const dueToday = current.monthly + 30;
  const total6 = (current.monthly*6).toFixed(2);

  const Option = ({label, active, subtitle, onClick}) => {
    return (
      <button
        type="button"
        role="tab"
        aria-selected={active}
        onClick={() => onClick && onClick()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } }}
        className={`basis-1/3 grow shrink min-w-0 box-border px-3 sm:px-6 py-3 text-center border ${active ? 'bg-white border-t-4' : 'bg-gray-100'} rounded-t-md cursor-pointer pointer-events-auto relative z-50 select-none`}
        style={active ? { borderTopColor: '#f49646' } : {}}
      >
        <div className="font-semibold">{label}</div>
        {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
        {active && <div className="text-xs text-gray-500">Selected</div>}
      </button>
    );
  };
  const Row = ({left, right, sub}) => (
    <div className="flex items-start justify-between py-3 border-b last:border-b-0">
      <div>
        <div className="font-semibold text-[15px]" style={color(THEME.secondary)}>{left}</div>
        <div className="text-xs text-gray-500">{sub}</div>
      </div>
      <div className="font-semibold text-[15px]" style={color(THEME.secondary)}>{right}</div>
    </div>
  );
  const labelFor = (arr)=>`$${(arr[0]/1000).toFixed(0)}K / $${(arr[1]/1000).toFixed(0)}K`;
  const pdLabel = (n)=>`$${(n/1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Choose Your Coverage</h3>
      <Card>
        <CardContent className="p-6 overflow-x-hidden">
          <div className="text-center">
            <div className="text-sm text-gray-500">Due Today</div>
            <div className="text-4xl font-semibold" style={color(THEME.secondary)}>${dueToday.toFixed(2)}</div>
            <div className="text-sm text-gray-600">6 Month Total Premium: {total6}</div>
          </div>

          <div className="mt-5 flex w-full min-w-0 max-w-full box-border rounded-md overflow-hidden relative z-[60] pointer-events-auto">
            <Option label="Basic" active={tab==='basic'} subtitle="$46.80/mo" onClick={() => { setData && setData({ ...data, coveragePackage: 'basic', monthly: BASIC.monthly }); }} />
            <Option label="Plus" active={tab==='plus'} subtitle="$93.60/mo" onClick={() => { setData && setData({ ...data, coveragePackage: 'plus', monthly: PLUS.monthly }); }} />
            <Option label="Custom" active={tab==='custom'} subtitle={`$${dueToday.toFixed(2)}/mo`} onClick={() => { const m = (customKey===toKey(BASIC.bi)?BASIC.monthly:PLUS.monthly); setData && setData({ ...data, coveragePackage: 'custom', monthly: m }); }} />
          </div>

          <div className="mt-6 space-y-2 text-sm relative z-0">
            {tab==='custom' && (
              <div className="mb-4 grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Liability Limits & UM/UIM (must match)</Label>
                  <select className="w-full border rounded-md h-10 px-3 text-sm" value={customKey} onChange={(e)=>{ const v = e.target.value; setCustomKey(v); const m = (v===toKey(BASIC.bi)?BASIC.monthly:PLUS.monthly); setData && setData({ ...data, coveragePackage: 'custom', monthly: m }); }}>
                    <option value={toKey(BASIC.bi)}>Bodily Injury $50K/$100K & Property Damage $50K</option>
                    <option value={toKey(PLUS.bi)}>Bodily Injury $100K/$300K & Property Damage $50K</option>
                  </select>
                </div>
              </div>
            )}

            <Row left="Bodily Injury Liability" right={labelFor(current.bi)} sub="per person/per accident" />
            <Row left="Property Damage Liability" right={pdLabel(current.pd)} sub="per accident" />
            <div className="py-1" />
            <Row left={<><div>Un/Underinsured Motorist</div><div>Bodily Injury</div></>} right={labelFor(current.umbi)} sub="per person/per accident" />
            <Row left={<><div>Uninsured Motorist</div><div>Property Damage</div></>} right={pdLabel(current.umpd)} sub="per accident" />

            <div className="mt-4 border rounded-xl p-4">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" checked={accProt} onChange={(e)=>setAccProt(e.target.checked)} />
                <div>
                  <div className="font-semibold">Accident Protection Plan</div>
                  <div className="text-xs text-gray-500">$10,000 per person, per accident</div>
                </div>
              </label>
            </div>

            <p className="text-[13px] text-gray-600 mt-4">Non-Owner Auto Insurance is secondary to the Vehicle Owner's policy and excludes Comprehensive and Collision Coverage.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-6">
            <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button style={bg(THEME.primary)} onClick={() => next()}>Finalize Rate & Buy</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const VerifyDrivingStep = ({ next, back }) => {
  const [done, setDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDone(true), 4000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Driving History</h3>
      <Card>
        <CardContent className="p-8 flex flex-col items-center justify-center gap-4 text-center">
          {!done ? (
            <>
              <div className="text-sm text-gray-600">Verifying Driving History</div>
              <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-[#f49646] animate-spin" />
            </>
          ) : (
            <>
              <div className="text-sm font-medium" style={color(THEME.secondary)}>Reports Confirmed</div>
              <Button style={bg(THEME.primary)} onClick={next}>Continue</Button>
            </>
          )}
        </CardContent>
      </Card>
      <div>
        <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
      </div>
    </div>
  );
};

const SummaryStep = ({ back, data, setData, next }) => {
  const monthly = (data && typeof data.monthly === 'number') ? data.monthly : 46.8;
  const paidInFull = monthly * 6;
  const [plan, setPlan] = useState((data && data.paymentPlan) ? data.paymentPlan : "monthly");
  const [showInfo, setShowInfo] = useState(false);
  const onChoose = (value) => { setPlan(value); if (setData) setData({ ...data, paymentPlan: value }); };
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Quote Summary</h3>
      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-gray-600"><span className="inline-flex items-center gap-1"><Check className="w-4 h-4" style={color(THEME.secondary)} /><span className="font-semibold">Almost there!</span></span> Select your payment plan to continue</p>
          <div className="grid gap-3">
            <label className={`flex items-center justify-between gap-4 rounded-xl border p-4 cursor-pointer ${plan === "monthly" ? "ring-2" : ""}`} style={plan === "monthly" ? border(THEME.primary) : undefined}>
              <div className="flex items-start gap-3">
                <input type="radio" name="plan" value="monthly" checked={plan === "monthly"} onChange={() => onChoose("monthly")} className="mt-1" />
                <div>
                  <div className="font-medium">Monthly Payments</div>
                  <div className="text-sm text-gray-600">Due today: ${(monthly + 30).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">+ 5 automatic monthly payments of ${monthly.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold" style={color(THEME.secondary)}>${monthly.toFixed(2)}</div>
                <div className="text-xs text-gray-500">6 month total: {paidInFull.toFixed(2)}</div>
              </div>
            </label>
            <label className={`flex items-center justify-between gap-4 rounded-xl border p-4 cursor-pointer ${plan === "pif" ? "ring-2" : ""}`} style={plan === "pif" ? border(THEME.primary) : undefined}>
              <div className="flex items-start gap-3">
                <input type="radio" name="plan" value="pif" checked={plan === "pif"} onChange={() => onChoose("pif")} className="mt-1" />
                <div>
                  <div className="font-medium">Paid in Full</div>
                  <div className="text-sm text-gray-600">One-time payment today</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold" style={color(THEME.secondary)}>${paidInFull.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Covers full 6-month term</div>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>
      <div className="text-sm italic text-gray-600 flex flex-col items-center gap-2 lg:hidden">
        <button
          aria-haspopup="dialog"
          aria-expanded={showInfo}
          onClick={() => setShowInfo(v => !v)}
          className="inline-flex items-center gap-2 underline decoration-dotted underline-offset-4"
        >
          <span>Did your rate change?</span>
          <Info className="w-4 h-4" />
        </button>
      </div>
      {showInfo && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 lg:hidden">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-4">
            <div className="flex items-start gap-2 text-xs not-italic">
              <div className="mt-0.5"><Info className="w-4 h-4" style={color(THEME.secondary)} /></div>
              <p>Your rate may have changed due to a difference in your entered years of experience and driving history compared to your Motor Vehicle Report. For questions please call the number above.</p>
            </div>
            <div className="text-right mt-3">
              <Button variant="ghost" onClick={() => setShowInfo(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={back}>Back</Button>
        <Button style={bg(THEME.primary)} onClick={next}>Continue to Sign</Button>
      </div>
    </div>
  );
};

const FinalizeSignStep = ({ back, next, data }) => {
  const [confirm, setConfirm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [docs, setDocs] = useState([
    { id: 'app', title: 'Application & Disclosures', signed: false },
    { id: 'um', title: 'NC UM/UIM Selection', signed: false },
    { id: 'pay', title: 'Payment Authorization', signed: false },
  ]);
  const markSigned = (id) => setDocs(docs.map(d => d.id === id ? { ...d, signed: true } : d));
  const allSigned = docs.every(d => d.signed);
  const canContinue = confirm && allSigned;
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Finalize & Sign Documents</h3>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-3">
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${doc.signed ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="text-sm font-medium">{doc.title}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setActiveDoc(doc)}>Preview</Button>
                  {!doc.signed && (
                    <Button style={bg(THEME.primary)} onClick={() => setActiveDoc(doc)}>Sign</Button>
                  )}
                  {doc.signed && (
                    <span className="text-xs text-green-700 font-semibold">Signed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm text-gray-800">
            <input type="checkbox" className="mt-1" checked={confirm} onChange={(e)=>setConfirm(e.target.checked)} />
            <span>
              I confirm I am a North Carolina Resident and can provide one of the <button type="button" className="underline" onClick={()=>setShowList(v=>!v)}>following documents</button> as proof of residency within 10 days of binding this policy if requested.
            </span>
          </label>
          {showList && (
            <ul className="list-disc pl-6 text-sm text-gray-600 space-y-1">
              <li>Utility bill with your current NC address (paper or electronic).</li>
              <li>Receipt for personal property taxes paid within the last 12 months showing your current NC address (paper or electronic).</li>
              <li>Receipt for real property taxes paid to a NC locality within the last 12 months showing your current NC address (paper or electronic).</li>
              <li>Valid, unexpired NC driver's license with your current NC address.</li>
              <li>Valid NC vehicle registration with your current NC address.</li>
              <li>Valid military ID.</li>
              <li>Valid student ID for a NC school or university.</li>
              <li>Most recent federal income tax return showing your name and current NC address.</li>
              <li>Homeowner's or renter's declarations page showing your current NC address.</li>
            </ul>
          )}
        </CardContent>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={back}>Back</Button>
        <Button disabled={!canContinue} aria-disabled={!canContinue} style={bg(THEME.primary)} onClick={next}>Continue to Payment</Button>
      </div>

      {activeDoc && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold text-sm" style={color(THEME.secondary)}>Document Shell — {activeDoc.title}</div>
              <button className="text-sm underline" onClick={() => setActiveDoc(null)}>Close</button>
            </div>
            <div className="p-4 h-64 overflow-auto text-sm text-gray-700">
              <p>This is a read-only preview shell for {activeDoc.title}. In the real app, your e-signature tooling would render the document here.</p>
              <p className="mt-3">Scroll to the bottom and click Sign to emulate completing your signature.</p>
              <div className="mt-4 h-32 rounded-md border bg-gray-50 flex items-center justify-center">Document content</div>
            </div>
            <div className="p-4 border-t flex items-center justify-end gap-2">
              {!docs.find(d=>d.id===activeDoc.id)?.signed && (
                <Button style={bg(THEME.primary)} onClick={() => { markSigned(activeDoc.id); setActiveDoc(null); }}>Sign</Button>
              )}
              {docs.find(d=>d.id===activeDoc.id)?.signed && (
                <Button variant="secondary" onClick={() => setActiveDoc(null)}>Done</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentStep = ({ back, data }) => {
  const plan = (data && data.paymentPlan) || 'monthly';
  const baseMonthly = (data && typeof data.monthly === 'number') ? data.monthly : 46.8;
  const pifTotal = 280.8;
  const amount = (plan === 'pif' ? pifTotal : baseMonthly) + 30;
  const [agreeAuto, setAgreeAuto] = useState(plan !== 'monthly');
  useEffect(() => { setAgreeAuto(plan !== 'monthly'); }, [plan]);
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Payment</h3>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="text-sm text-gray-600">Amount due today</div>
          <div className="text-4xl font-semibold" style={color(THEME.secondary)}>${amount.toFixed(2)}</div>

          {plan === 'monthly' ? (
            <div className="space-y-3 text-sm text-gray-700">
              <div>+ 5 automatic monthly payments of ${baseMonthly.toFixed(2)}</div>
              <label className="flex items-start gap-3 text-xs text-gray-800">
                <input type="checkbox" className="mt-0.5" checked={agreeAuto} onChange={(e)=>setAgreeAuto(e.target.checked)} />
                <span>
                  I agree to the <a className="underline" href="#">automatic payment terms and conditions</a> and authorize Greenville Casualty Insurance to save the card information provided to automatically deduct my monthly payments.
                </span>
              </label>
            </div>
          ) : null}

          <div className="pt-2 flex gap-3">
            <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
            <Button style={bg(THEME.primary)} disabled={plan === 'monthly' && !agreeAuto} aria-disabled={plan === 'monthly' && !agreeAuto}>Pay Now</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function DesktopPreview() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(makeInitialState());
  const steps = [
    "Start",
    "Eligibility",
    "Personal",
    "Contact",
    "License",
    "History",
    "Coverage",
    "Driving History",
    "Summary",
    "Finalize & Sign Documents",
    "Payment",
  ];
  const StepBody = () => {
    switch (step) {
      case 0: return <StartStep next={() => setStep(1)} />;
      case 1: return <EligibilityStep data={data} setData={setData} next={() => setStep(2)} back={() => setStep(0)} forceStack={false} />;
      case 2: return <PersonalStep data={data} setData={setData} next={() => setStep(3)} back={() => setStep(1)} />;
      case 3: return <ContactStep data={data} setData={setData} next={() => setStep(4)} back={() => setStep(2)} />;
      case 4: return <LicenseStep data={data} setData={setData} next={() => setStep(5)} back={() => setStep(3)} />;
      case 5: return <HistoryStep data={data} setData={setData} next={() => setStep(6)} back={() => setStep(4)} />;
      case 6: return <CoverageStep data={data} setData={setData} next={() => setStep(7)} back={() => setStep(5)} />;
      case 7: return <VerifyDrivingStep next={() => setStep(8)} back={() => setStep(6)} />;
      case 8: return <SummaryStep data={data} setData={setData} back={() => setStep(6)} next={() => setStep(9)} />;
      case 9: return <FinalizeSignStep data={data} back={() => setStep(8)} next={() => setStep(10)} />;
      case 10: return <PaymentStep back={() => setStep(9)} data={data} />;
      default: return null;
    }
  };
  return (
    <div className="h-full w-full">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <TopBar isDesktop />
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-4 sm:p-6 overflow-x-hidden">
            <StepsBar step={step} steps={steps} />
            <div className={`mt-4 grid gap-6 ${(step===6 || step===7) ? '' : 'lg:grid-cols-3'}`}>
              <div className={`${(step===6 || step===7) ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
                <AnimatePresence mode="wait">
                  <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                    <StepBody />
                  </motion.div>
                </AnimatePresence>
              </div>
              {!(step===6 || step===7 || step===10) && (<aside className="hidden lg:block">
                <Card className="sticky top-4">
                  {step===8 ? (
                    <>
                      <CardHeader>
                        <CardTitle className="text-base" style={color(THEME.secondary)}>Did your rate change?</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 text-sm text-gray-700 space-y-2">
                        <p>Your rate may have changed due to a difference in your entered years of experience and driving history compared to your Motor Vehicle Report. For questions please call the number above.</p>
                      </CardContent>
                    </>
                  ) : step===9 ? (
                    <>
                      <CardHeader>
                        <CardTitle className="text-base" style={color(THEME.secondary)}>Need Proof of Insurance?</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 text-sm text-gray-700 space-y-3">
                        <p>Once you have signed your documents on this page and paid the initial payment on the next page your policy will be in force and your policy number will be instantly available to you.</p>
                        <p>We will be sending you an email with your:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>DL-123</li>
                          <li>ID Cards</li>
                          <li>Declaration Page</li>
                          <li>and more!</li>
                        </ul>
                      </CardContent>
                    </>
                  ) : (
                    <>
                      <CardHeader>
                        <CardTitle className="text-base" style={color(THEME.secondary)}>Fast facts</CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 text-sm text-gray-600 space-y-3">
                        <div>Non-Owner Auto Insurance may be used by North Carolina drivers for some of the following reasons:</div>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Acquire a North Carolina Drivers License</li>
                          <li>Reinstate a Suspended North Carolina Drivers License</li>
                          <li>Drive a borrowed vehicle</li>
                          <li>Drive a Rental or Car-Sharing Vehicle</li>
                        </ul>
                      </CardContent>
                    </>
                  )}
                </Card>
              </aside>)}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6"><PoweredBy /></div>
      </div>
    </div>
  );
}

function MobilePreview() {
  return <DesktopPreview />;
}

export default function AbleNonOwnerApp() {
  return (
    <div className="min-h-screen bg-white">
      <div className="sm:hidden"><MobilePreview /></div>
      <div className="hidden sm:block"><DesktopPreview /></div>
    </div>
  );
}
