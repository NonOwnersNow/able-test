'use client';
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, ArrowLeft, Shield, Phone, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// --- Theme ---
// Using your requested primary #1A2345; secondary/navy retained. Adjust accent if you want lighter/darker.
const THEME = {
  primary: "#1A2345",
  secondary: "#0D2D53",
  accent: "#CFE8D6",
};

// Utility helpers (plain JS — no TS annotations)
const bg = (hex) => ({ backgroundColor: hex });
const border = (hex) => ({ borderColor: hex });
const color = (hex) => ({ color: hex });

// ---- Brand Logo (image with dependable text fallback) ----
const BrandLogo = ({ className = '', height = 24, src }) => {
  // Only show the image after it loads; otherwise show text.
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = loaded && !failed;
  return (
    <div className={`flex items-center ${className}`} style={{ height }}>
      {!failed && (
        <img
          src={src || '/able-logo.svg'}
          alt="Able Insurance Agency"
          className="block h-full w-auto"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
      {!showImage && (
        <div className="font-semibold tracking-tight" style={color(THEME.secondary)}>
          Able Insurance Agency
        </div>
      )}
    </div>
  );
};

// Shared initial state (to keep lines down)
const makeInitialState = () => ({
  ownsCar: "no", householdVehicle: "no", sr22: false, age: 30, state: "NC",
  first: "Alex", last: "Rivera", email: "alex@example.com", phone: "", consentAgreed: false,
  street: "", city: "", zip: "28801",
  license: "", licState: "NC",
  biLimit: 50000, umLimit: 50000,
  biPerPerson: 50000, biPerAccident: 100000, pdPerAccident: 50000,
  umPerPerson: 50000, umPerAccident: 100000,
  monthly: 28, dob: "", gender: "", firstLicensedAge: "", licenseStatus: "",
  hasViolations: "no", violationType: "", hasAccidents: "no", accidentType: "",
  accidentPlan: true,
});

// --- Powered by (GCI) footer ---
// Renders the GCI logo from /public/GCILogo.png with a safe text fallback.
const PoweredBy = ({ compact = false }) => {
  const [logoOk, setLogoOk] = useState(true);
  const imgH = compact ? 24 : 30; // px (mobile: 24, desktop: 30)
  return (
    <div className={`flex items-center justify-center ${compact ? "gap-1" : "gap-2"} text-gray-600 ${compact ? "text-[11px]" : "text-xs"}`}>
      <span>Powered by</span>
      {logoOk ? (
        <img
          src="/GCILogo.png"
          alt="Greenville Casualty Insurance"
          style={{ height: imgH, width: 'auto' }}
          className="block w-auto"
          onError={() => setLogoOk(false)}
        />
      ) : (
        <span className="inline-flex items-center justify-center rounded border px-1.5 py-0.5 text-[10px]" style={color(THEME.secondary)}>
          GCI
        </span>
      )}
    </div>
  );
};

// --- Helper components ---
const StepPill = ({ index, active, complete, label }) => (
  <div
    className={`flex items-center gap-2 select-none ${complete ? "" : active ? "" : "text-gray-400"}`}
    style={complete ? color(THEME.primary) : active ? color("#111827") : undefined}
  >
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs font-semibold shadow-sm`}
      style={
        complete
          ? { ...bg("#E8F5EE"), ...border("#A7D5BA") }
          : active
          ? { ...bg("#ffffff"), ...border("#D1D5DB") }
          : { ...bg("#F3F4F6"), ...border("#E5E7EB") }
      }
    >
      {complete ? <Check className="w-4 h-4" /> : index + 1}
    </div>
    <span className="hidden sm:inline text-sm">{label}</span>
  </div>
);

const StepsBar = ({ step, steps, size = 'md', className = '' }) => {
  const total = Math.max(1, steps.length);
  const pct = total > 1 ? Math.min(100, Math.max(0, (step / (total - 1)) * 100)) : 0;
  const isSm = size === 'sm';
  const trackH = isSm ? 'h-3' : 'h-4';
  const pad = isSm ? 'p-1' : 'p-1.5 sm:p-2';
  const icon = isSm ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6';
  return (
    <div className={`relative w-full ${trackH} bg-gray-200 rounded-full ${className}`} aria-hidden="true">
      {/* Fill */}
      <div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ width: `${pct}%`, backgroundColor: THEME.primary, transition: 'width 240ms ease' }}
      />
      {/* Car centered on the line */}
      <div
        className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ left: `${pct}%` }}
      >
        <div className={`bg-white rounded-full border shadow-sm ${pad}`}>
          <Car className={icon} style={color(THEME.primary)} />
        </div>
      </div>
    </div>
  );
};

// --- Pricing model (mock) ---
function priceQuote({ state, sr22, age, biLimit, umLimit }) {
  let base = 26; // monthly base
  const stateFactor = { NC: 1, SC: 1.05, GA: 1.12, VA: 1.08, TN: 0.98, FL: 1.22 };
  const sf = stateFactor[state] ?? 1.1;
  const sr = sr22 ? 1.35 : 1.0;
  const ageAdj = age < 25 ? 1.25 : age < 35 ? 1.08 : age < 55 ? 1.0 : 0.95;
  const limitAdj = (biLimit / 30000) * 0.6 + (umLimit / 30000) * 0.4; // normalized around 30/60
  const monthly = Math.round(base * sf * sr * ageAdj * limitAdj * 100) / 100;
  return monthly < 18 ? 18 : monthly;
}

// --- Form Step UIs ---
const StartStep = ({ next }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-2xl shadow-inner" style={bg(THEME.accent)}>
        <Shield className="w-6 h-6" style={color(THEME.secondary)} />
      </div>
      <div>
        <h2 className="text-xl font-semibold" style={color(THEME.secondary)}>
          Non-Owner Auto Insurance Quote
        </h2>
        <p className="text-sm text-gray-500">Get insurance coverage in minutes. No vehicle required.</p>
      </div>
    </div>
    <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
      <li>Liability coverage that travels with you</li>
      <li>DL-123 form available (if required)</li>
      <li>Instant, online policy</li>
    </ul>
    <div>
      <Button className="w-full sm:w-auto" style={bg(THEME.primary)} onClick={next}>
        Start your quote
      </Button>
    </div>
  </div>
);

const EligibilityStep = ({ data, setData, next, back, forceStack = false }) => {
  const ineligible = data.ownsCar === "yes" || data.householdVehicle === "yes";
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>
        Eligibility
      </h3>

      {/* Only two questions per your spec */}
      <div className={forceStack ? "flex flex-col items-center gap-8" : "flex flex-col items-center gap-8 sm:grid sm:grid-cols-2 sm:items-start"}>
        <div className="w-full max-w-xs text-center sm:text-left">
          <Label>Do you own a vehicle?</Label>
          <div className="mt-2 flex flex-row items-center justify-center sm:justify-start gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="ownsCar"
                value="no"
                checked={data.ownsCar === "no"}
                onChange={() => setData({ ...data, ownsCar: "no" })}
              />
              <span>No</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="ownsCar"
                value="yes"
                checked={data.ownsCar === "yes"}
                onChange={() => setData({ ...data, ownsCar: "yes" })}
              />
              <span>Yes</span>
            </label>
          </div>
        </div>

        <div className="w-full max-w-xs text-center sm:text-left">
          <Label>Do you live in a household with a vehicle?</Label>
          <div className="mt-2 flex flex-row items-center justify-center sm:justify-start gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="householdVehicle"
                value="no"
                checked={data.householdVehicle === "no"}
                onChange={() => setData({ ...data, householdVehicle: "no" })}
              />
              <span>No</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="householdVehicle"
                value="yes"
                checked={data.householdVehicle === "yes"}
                onChange={() => setData({ ...data, householdVehicle: "yes" })}
              />
              <span>Yes</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={back}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            style={bg(THEME.primary)}
            disabled={ineligible}
            aria-disabled={ineligible}
            onClick={() => {
              if (ineligible) return;
              next();
            }}
          >
            Continue
          </Button>
        </div>
        {ineligible && (
          <p className="text-sm text-red-600">
            In order to qualify for a Non-Owners Policy you cannot own a vehicle or live in a household with a vehicle
          </p>
        )}
      </div>
    </div>
  );
};


const PersonalStep = ({ data, setData, next, back }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>
      About you
    </h3>
    <div className="grid sm:grid-cols-2 gap-4">
      <div>
        <Label>First name</Label>
        <Input value={data.first} onChange={(e) => setData({ ...data, first: e.target.value })} />
      </div>
      <div>
        <Label>Last name</Label>
        <Input value={data.last} onChange={(e) => setData({ ...data, last: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <Label>Street Address</Label>
        <Input
          placeholder="123 Main St"
          value={data.street || ""}
          onChange={(e) => setData({ ...data, street: e.target.value })}
        />
      </div>
      <div>
        <Label>City</Label>
        <Input
          placeholder="Raleigh"
          value={data.city || ""}
          onChange={(e) => setData({ ...data, city: e.target.value })}
        />
      </div>
      <div>
        <Label>State</Label>
        <Input value={data.state || "NC"} disabled />
      </div>
      <div>
        <Label>Zip</Label>
        <Input placeholder="28801" value={data.zip} onChange={(e) => setData({ ...data, zip: e.target.value })} />
      </div>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="ghost" onClick={back}>
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back
      </Button>
      <Button style={bg(THEME.primary)} onClick={next}>
        Continue
      </Button>
    </div>
  </div>
);

// NEW: Contact info step
const ContactStep = ({ data, setData, next, back }) => {
  const [agree, setAgree] = useState(!!data.consentAgreed);
  const onContinue = () => {
    if (!agree) return;
    setData({ ...data, consentAgreed: true });
    next();
  };
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>
        Contact information
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="you@example.com"
            value={data.email || ""}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Phone</Label>
          <Input
            type="tel"
            placeholder="(555) 555-5555"
            value={data.phone || ""}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-1"
            />
            <span>
              We may communicate with you via phone, email, and text to assist you with your quote or policy. By clicking
              <span className="font-semibold"> "Agree and Continue"</span> you have read and agree to the <a className="underline" href="#">Terms</a> and <a className="underline" href="#">Privacy Policy</a>.
            </span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={back}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button style={bg(THEME.primary)} disabled={!agree} aria-disabled={!agree} onClick={onContinue}>
          Agree and Continue
        </Button>
      </div>
    </div>
  );
};

const LicenseStep = ({ data, setData, next, back }) => {
  const status = data.licenseStatus || "";
  const askAge = status === "Active" || status === "Suspended/Revoked";
  const askNumState = askAge || status === "Permit";
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>
        License
      </h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {/* DOB always shown */}
        <div>
          <Label>Date of Birth</Label>
          <Input
            type="date"
            value={data.dob || ""}
            onChange={(e) => setData({ ...data, dob: e.target.value })}
          />
        </div>
        {/* Gender */}
        <div>
          <Label>Gender</Label>
          <select
            className="w-full border rounded-md h-10 px-3"
            value={data.gender || ""}
            onChange={(e) => setData({ ...data, gender: e.target.value })}
          >
            <option value="">Select...</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Non-binary">Non-binary</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
        </div>
        {/* License status selector */}
        <div>
          <Label>License Status</Label>
          <select
            className="w-full border rounded-md h-10 px-3"
            value={status}
            onChange={(e) => setData({ ...data, licenseStatus: e.target.value })}
          >
            <option value="">Select status...</option>
            <option value="Never Licensed">Never Licensed</option>
            <option value="Active">Active</option>
            <option value="Suspended/Revoked">Suspended/Revoked</option>
            <option value="Permit">Permit</option>
          </select>
        </div>

        {/* Conditionally ask age first licensed */}
        {askAge && (
          <div>
            <Label>Age when first licensed</Label>
            <Input
              type="number"
              min={16}
              max={100}
              step={1}
              value={data.firstLicensedAge ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (Number.isNaN(n)) {
                  setData({ ...data, firstLicensedAge: "" });
                } else {
                  const clamped = Math.max(16, Math.min(100, n));
                  setData({ ...data, firstLicensedAge: clamped });
                }
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Enter a number between 16 and 100.</p>
          </div>
        )}

        {/* Conditionally ask license number/state */}
        {askNumState && (
          <>
            <div>
              <Label>License number</Label>
              <Input
                placeholder="ABC123456"
                value={data.license}
                onChange={(e) => setData({ ...data, license: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label>Issuing state</Label>
              <Input
                placeholder="NC"
                value={data.licState}
                onChange={(e) => setData({ ...data, licState: e.target.value.toUpperCase().slice(0, 2) })}
              />
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={back}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button style={bg(THEME.primary)} onClick={next}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// NEW: History step (violations/accidents)
const HistoryStep = ({ data, setData, next, back }) => {
  const showViolations = data.hasViolations === "yes";
  const showAccidents = data.hasAccidents === "yes";
  const OPTIONS = ["Sample Speeding Ticket", "Sample Violation", "Sample Accident"];
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Driving history</h3>
      <div className="flex flex-col items-center gap-8 sm:grid sm:grid-cols-2 sm:items-start">
        <div className="w-full max-w-xs text-center sm:text-left">
          <Label>Do you have any traffic violations in the past 5 years?</Label>
          <div className="mt-2 flex flex-row items-center justify-center sm:justify-start gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="hasViolations" value="no" checked={data.hasViolations === "no"} onChange={() => setData({ ...data, hasViolations: "no", violationType: "" })} />
              <span>No</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="hasViolations" value="yes" checked={data.hasViolations === "yes"} onChange={() => setData({ ...data, hasViolations: "yes" })} />
              <span>Yes</span>
            </label>
          </div>
          {showViolations && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-1">Please select the best match below</div>
              <select className="w-full border rounded-md h-10 px-3" value={data.violationType || ""} onChange={(e) => setData({ ...data, violationType: e.target.value })}>
                <option value="" disabled>Select...</option>
                {OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
          )}
        </div>
        <div className="w-full max-w-xs text-center sm:text-left">
          <Label>Have you been involved in an accident in the last 5 years?</Label>
          <div className="mt-2 flex flex-row items-center justify-center sm:justify-start gap-6">
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="hasAccidents" value="no" checked={data.hasAccidents === "no"} onChange={() => setData({ ...data, hasAccidents: "no", accidentType: "" })} />
              <span>No</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input type="radio" name="hasAccidents" value="yes" checked={data.hasAccidents === "yes"} onChange={() => setData({ ...data, hasAccidents: "yes" })} />
              <span>Yes</span>
            </label>
          </div>
          {showAccidents && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-1">Please select the best match below</div>
              <select className="w-full border rounded-md h-10 px-3" value={data.accidentType || ""} onChange={(e) => setData({ ...data, accidentType: e.target.value })}>
                <option value="" disabled>Select...</option>
                {OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
        <Button style={bg(THEME.primary)} onClick={next}>Continue</Button>
      </div>
    </div>
  );
};

const CoverageStep = ({ data, setData, next, back, isMobile = false }) => {
  const [pkg, setPkg] = useState(data.coveragePackage || "stateMin");
  const [open, setOpen] = useState(false);
  const applyPkg = (which) => (
    which === "stateMin"
      ? { coveragePackage: "stateMin", biPerPerson: 50000, biPerAccident: 100000, pdPerAccident: 50000, umPerPerson: 50000, umPerAccident: 100000, biLimit: 50000, umLimit: 50000 }
      : { coveragePackage: "high", biPerPerson: 100000, biPerAccident: 300000, pdPerAccident: 50000, umPerPerson: 100000, umPerAccident: 300000, biLimit: 100000, umLimit: 100000 }
  );
  const selected = applyPkg(pkg);
  const calcMonthly = useMemo(() => priceQuote({ state: data.state || "NC", sr22: data.sr22, age: data.age || 30, biLimit: selected.biLimit, umLimit: selected.umLimit }), [data.state, data.sr22, data.age, selected.biLimit, selected.umLimit]);
  const monthly = isMobile ? 46.80 : calcMonthly;
  const sixMonth = (monthly * 6).toFixed(2);

  if (isMobile) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Choose Your Coverage</h3>
        <Card>
          <CardContent className="p-6 text-center space-y-3">
            <div className="text-sm text-gray-500">Due Today</div>
            <div className="text-4xl font-semibold" style={color(THEME.secondary)}>${monthly.toFixed(2)}</div>
            <hr className="my-2" />
            <div className="text-sm text-gray-600">6 Month Total Premium: ${sixMonth}</div>
            <button className="text-sm font-semibold" style={color(THEME.primary)} onClick={() => setOpen(!open)}>
              {open ? "HIDE BREAKDOWN ▲" : "VIEW BREAKDOWN ▼"}
            </button>
            {open && (
              <div className="text-left pt-2 space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pkg" checked={pkg === "stateMin"} onChange={() => setPkg("stateMin")} />
                    <span className="font-medium">State Minimum Limits (NC)</span>
                  </label>
                  <ul className="text-sm text-gray-600 list-disc pl-6">
                    <li>Liability (BI/PD): 50/100/50</li>
                    <li>UM/UIM (BI/PD): 50/100/50</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="radio" name="pkg" checked={pkg === "high"} onChange={() => setPkg("high")} />
                    <span className="font-medium">Higher limits</span>
                  </label>
                  <ul className="text-sm text-gray-600 list-disc pl-6">
                    <li>Liability (BI/PD): 100/300/50</li>
                    <li>UM/UIM (BI/PD): 100/300/50</li>
                  </ul>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Accident Protection Plan</div>
                      <div className="text-xs text-gray-600">$10,000 per person, per accident</div>
                    </div>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={(data.accidentPlan ?? true)} onChange={(e) => { setData({ ...data, accidentPlan: e.target.checked }); setOpen(true); }} />
                      <span className="text-sm">Add</span>
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Non-Owner Auto Insurance is secondary to the Vehicle Owner's policy and excludes Comprehensive and Collision Coverage</p>
              </div>
            )}
            <Button className="w-full" style={bg(THEME.primary)} onClick={() => { setData({ ...data, ...selected, monthly }); next(); }}>Continue</Button>
          </CardContent>
        </Card>
        <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>Choose Your Coverage</h3>
      <Card>
        <CardContent className="p-6 text-center space-y-3">
          <div className="text-sm text-gray-500">Due Today</div>
          <div className="text-4xl font-semibold" style={color(THEME.secondary)}>${monthly.toFixed(2)}</div>
          <hr className="my-2" />
          <div className="text-sm text-gray-600">6 Month Total Premium: ${sixMonth}</div>
          <button className="text-sm font-semibold" style={color(THEME.primary)} onClick={() => setOpen(!open)}>
            {open ? "HIDE BREAKDOWN ▲" : "VIEW BREAKDOWN ▼"}
          </button>
          {open && (
            <div className="text-left pt-2 space-y-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="pkg" checked={pkg === "stateMin"} onChange={() => setPkg("stateMin")} />
                  <span className="font-medium">State Minimum Limits (NC)</span>
                </label>
                <ul className="text-sm text-gray-600 list-disc pl-6">
                  <li>Liability (BI/PD): 50/100/50</li>
                  <li>UM/UIM (BI/PD): 50/100/50</li>
                </ul>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="pkg" checked={pkg === "high"} onChange={() => setPkg("high")} />
                  <span className="font-medium">Higher limits</span>
                </label>
                <ul className="text-sm text-gray-600 list-disc pl-6">
                  <li>Liability (BI/PD): 100/300/50</li>
                  <li>UM/UIM (BI/PD): 100/300/50</li>
                </ul>
              </div>
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Accident Protection Plan</div>
                    <div className="text-xs text-gray-600">$10,000 per person, per accident</div>
                  </div>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={(data.accidentPlan ?? true)} onChange={(e) => { setData({ ...data, accidentPlan: e.target.checked }); setOpen(true); }} />
                    <span className="text-sm">Add</span>
                  </label>
                </div>
              </div>
              <p className="text-xs text-gray-500">Non-Owner Auto Insurance is secondary to the Vehicle Owner's policy and excludes Comprehensive and Collision Coverage</p>
            </div>
          )}
          <Button className="w-full" style={bg(THEME.primary)} onClick={() => { setData({ ...data, ...selected, monthly }); next(); }}>Continue</Button>
        </CardContent>
      </Card>
      <Button variant="ghost" onClick={back}><ArrowLeft className="w-4 h-4 mr-1" />Back</Button>
    </div>
  );
};

const SummaryStep = ({ back, data, setData }) => {
  const monthly = Number(((data && data.monthly) != null ? data.monthly : 46.8));
  const paidInFull = Number((monthly * 6).toFixed(2));
  const [plan, setPlan] = useState((data && data.paymentPlan) ? data.paymentPlan : 'monthly'); // 'monthly' | 'pif'

  const onChoose = (value) => {
    setPlan(value);
    // Persist chosen plan to parent data (optional)
    if (setData) setData({ ...data, paymentPlan: value });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold" style={color(THEME.secondary)}>
        Quote Summary
      </h3>
      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Thank you for getting a quote! Based on the information you provided and the quote options you selected we can start your policy today.
          </p>

          {/* Plan selector */}
          <div className="grid gap-3">
            <label className={`flex items-center justify-between gap-4 rounded-xl border p-4 cursor-pointer ${plan === 'monthly' ? 'ring-2' : ''}`} style={plan === 'monthly' ? border(THEME.primary) : undefined}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="plan"
                  value="monthly"
                  checked={plan === 'monthly'}
                  onChange={() => onChoose('monthly')}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Monthly Payments</div>
                  <div className="text-sm text-gray-600">Due today: ${monthly.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">+ 5 monthly payments of ${monthly.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold" style={color(THEME.secondary)}>${monthly.toFixed(2)}</div>
                <div className="text-xs text-gray-500">6 month total: ${paidInFull.toFixed(2)}</div>
              </div>
            </label>

            <label className={`flex items-center justify-between gap-4 rounded-xl border p-4 cursor-pointer ${plan === 'pif' ? 'ring-2' : ''}`} style={plan === 'pif' ? border(THEME.primary) : undefined}>
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="plan"
                  value="pif"
                  checked={plan === 'pif'}
                  onChange={() => onChoose('pif')}
                  className="mt-1"
                />
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
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="secondary" onClick={back}>Back</Button>
        <Button style={bg(THEME.primary)}>
          {plan === 'pif' ? 'Pay in Full & Buy' : 'Finalize Rate & Buy'}
        </Button>
      </div>
    </div>
  );
};

// --- Shared Header for both previews ---
const TopBar = ({ isDesktop }) => (
  <div className="flex items-center justify-between mb-4">
    <BrandLogo height={28} src="/able-logo.svg" />
    {isDesktop ? (
      <a href="tel:+19104524333" className="hidden sm:flex items-center gap-2 text-sm font-medium" style={color(THEME.secondary)}>
        <Phone className="w-4 h-4" /> (910) 452-4333
      </a>
    ) : (
      <a href="tel:+19104524333" className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm" style={{ ...bg(THEME.primary), color: "#ffffff" }}>
        <Phone className="w-3.5 h-3.5" /> Call Now
      </a>
    )}
  </div>
);

// --- Main Preview Layouts ---
function DesktopPreview() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(makeInitialState());
  const steps = ["Start", "Eligibility", "Personal", "Contact", "License", "History", "Coverage", "Summary"];

  const StepBody = () => {
    switch (step) {
      case 0:
        return <StartStep next={() => setStep(1)} />;
      case 1:
        return (
          <EligibilityStep
            data={data}
            setData={setData}
            next={() => setStep(2)}
            back={() => setStep(0)}
            forceStack={false}
          />
        );
      case 2:
        return <PersonalStep data={data} setData={setData} next={() => setStep(3)} back={() => setStep(1)} />;
      case 3:
        return <ContactStep data={data} setData={setData} next={() => setStep(4)} back={() => setStep(2)} />;
      case 4:
        return <LicenseStep data={data} setData={setData} next={() => setStep(5)} back={() => setStep(3)} />;
      case 5:
        return <HistoryStep data={data} setData={setData} next={() => setStep(6)} back={() => setStep(4)} />;
      case 6:
        return (
          <CoverageStep
            data={data}
            setData={setData}
            next={() => setStep(7)}
            back={() => setStep(5)}
          />
        );
      case 7:
        return <SummaryStep data={data} setData={setData} back={() => setStep(2)} />;
      default:
        return null;
    }
  };// patched

  return (
    <>
      <div className="h-full w-full">
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <TopBar isDesktop />
          <Card className="shadow-lg rounded-2xl">
            <CardContent className="p-4 sm:p-6">
              <StepsBar step={step} steps={steps} />
              <div className="mt-4 grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <StepBody />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <aside className="hidden lg:block">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="text-base" style={color(THEME.secondary)}>
                        Fast facts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 text-sm text-gray-600 space-y-3">
                      <div>Non-Owner Insurance may be required for North Carolina drivers to obtain for the the following:</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Acquire a North Carolina drivers license</li>
                        <li>New NC residents who want to obtain a license</li>
                        <li>To reinstate a suspended North Carolina license</li>
                      </ul>
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6">
            <PoweredBy />
          </div>
        </div>
      </div>
    </>
  );
}

function MobilePreview() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(makeInitialState());
  const steps = ["Start", "Eligibility", "Personal", "Contact", "License", "History", "Coverage", "Summary"];

  const StepBody = () => {
    switch (step) {
      case 0:
        return <StartStep next={() => setStep(1)} />;
      case 1:
        return (
          <EligibilityStep
            data={data}
            setData={setData}
            next={() => setStep(2)}
            back={() => setStep(0)}
            forceStack={true}
          />
        );
      case 2:
        return <PersonalStep data={data} setData={setData} next={() => setStep(3)} back={() => setStep(1)} />;
      case 3:
        return <ContactStep data={data} setData={setData} next={() => setStep(4)} back={() => setStep(2)} />;
      case 4:
        return <LicenseStep data={data} setData={setData} next={() => setStep(5)} back={() => setStep(3)} />;
      case 5:
        return <HistoryStep data={data} setData={setData} next={() => setStep(6)} back={() => setStep(4)} />;
      case 6:
        return (
          <CoverageStep
            data={data}
            setData={setData}
            next={() => setStep(7)}
            back={() => setStep(5)}
            isMobile={true}
          />
        );
      case 7:
        return <SummaryStep data={data} setData={setData} back={() => setStep(2)} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="w-full flex justify-center p-4">
        <div className="relative h-[760px] w-[360px] rounded-[36px] border bg-white shadow-2xl overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 border-t bg-white/90 py-2 z-10">
            <PoweredBy compact />
          </div>
          <div className="absolute inset-x-0 top-0 h-12" style={bg(THEME.primary)}>
            <div className="flex items-center justify-between px-4 py-2 text-white">
              <div className="font-semibold tracking-tight text-[1.08rem]">Able Insurance Agency</div>
              <a
                href="tel:+19104524333"
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          </div>
          {/* Progress bar under the header on mobile */}
          <div className="absolute left-4 right-4 top-[50px] z-20">
            <StepsBar step={step} steps={steps} size="sm" />
          </div>
          {/* Top-right click-to-call icon overlayed on the mobile banner */}
          <div className="p-4 pt-20 [&_.text-xs]:text-[0.81rem] [&_.text-sm]:text-[0.95rem] [&_.text-base]:text-[1.08rem] [&_.text-lg]:text-[1.21rem] [&_.text-xl]:text-[1.35rem]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <StepBody />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

export default function AbleNonOwnerApp() {
  return (
    <div className="min-h-screen bg-white">
      {/* Mobile: full app */}
      <div className="sm:hidden">
        <MobilePreview />
      </div>
      {/* Desktop: full app */}
      <div className="hidden sm:block">
        <DesktopPreview />
      </div>
    </div>
  );
}
