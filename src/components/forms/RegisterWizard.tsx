"use client";

import { useState, useTransition } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { registerMember } from "@/app/actions/register";
import { personalSchema, electoralSchema, securitySchema } from "@/lib/validators/registration";
import { PhotoCropper } from "./PhotoCropper";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { HIERARCHY, getAssemblies, getMandals, CATEGORIES } from "@/data/hierarchy";
import { LOKSABHA_CONSTITUENCIES } from "@/data/loksabha";
import { DAYS, MONTHS, getEligibleYearsSorted } from "@/data/dob";

const EMPTY = {
  photoBase64: "", fullName: "", fatherName: "",
  dobDay: "", dobMonth: "", dobYear: "",
  gender: "" as "" | "Male" | "Female" | "Other",
  category: "" as string,
  jaati: "", mobile: "", whatsappSameAsMobile: true, whatsapp: "", email: "",
  districtId: "", assemblyId: "", mandalId: "", booth: "",
  loksabhaId: "",
  address: "", pincode: "",
  mpin: "", confirmMpin: "", agree: false as boolean,
};

const YEARS = getEligibleYearsSorted();

export function RegisterWizard() {
  const { d } = useLang();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((p) => ({ ...p, [k]: v }));

  const setMobile = (v: string) => {
    const digits = v.replace(/\D/g, "");
    setF((p) => ({ ...p, mobile: digits, whatsapp: p.whatsappSameAsMobile ? digits : p.whatsapp }));
  };
  const toggleWhatsappSame = (checked: boolean) => {
    setF((p) => ({ ...p, whatsappSameAsMobile: checked, whatsapp: checked ? p.mobile : p.whatsapp }));
  };

  const assemblies = getAssemblies(f.districtId);
  const mandals = getMandals(f.districtId, f.assemblyId);

  const steps = [d.register.step1, d.register.step2, d.register.step4 /* Security */];

  const validateStep = () => {
    let result;
    if (step === 0) result = personalSchema.safeParse(f);
    else if (step === 1) result = electoralSchema.safeParse(f);
    else result = securitySchema.safeParse(f);

    if (!result.success) {
      const e: Record<string, string> = {};
      for (const issue of result.error.issues) e[issue.path.join(".")] = issue.message;
      setErrors(e);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    if (!validateStep()) return;
    setServerError(null);
    startTransition(async () => {
      const res = await registerMember(f);
      if (res?.error) {
        setServerError(res.error);
        if (res.fieldErrors) setErrors(res.fieldErrors);
      }
    });
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <div className="mt-1 text-[11.5px] font-bold text-danger">{errors[k]}</div> : null);
  const errStyle = (k: string) => (errors[k] ? { borderColor: "#DC2626" } : undefined);

  return (
    <div className="mx-auto max-w-[700px] animate-fadeUp">
      <div className="mb-6 text-center">
        <div className="inline-block rounded-full bg-primary-light px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-primary-dark">
          Membership Registration
        </div>
        <div className="mt-2.5 font-serif text-[28px] font-black text-heading">{d.register.title}</div>
        <div className="mt-1 text-sm text-muted">{d.register.subtitle}</div>
      </div>

      <div className="mb-6 flex gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 text-center">
            <div className={`mb-1.5 h-1.5 rounded ${i <= step ? "bg-gradient-to-r from-primary to-secondary" : "bg-border"}`} />
            <span className={`text-[11px] font-bold ${i <= step ? "text-heading" : "text-muted"}`}>{i + 1}. {s}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_20px_50px_rgba(13,18,32,.09)] backdrop-blur">
        {serverError && <div className="rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm font-bold text-danger">{serverError}</div>}

        {step === 0 && (
          <>
            <PhotoCropper photo={f.photoBase64 || null} onPhoto={(v) => set("photoBase64", v)} error={errors.photoBase64} onError={setServerError} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.fullName}</Label>
                <Input value={f.fullName} onChange={(e) => set("fullName", e.target.value)} style={errStyle("fullName")} />
                <Err k="fullName" />
              </div>
              <div>
                <Label required>{d.register.fatherName}</Label>
                <Input value={f.fatherName} onChange={(e) => set("fatherName", e.target.value)} style={errStyle("fatherName")} />
                <Err k="fatherName" />
              </div>
            </div>

            <div>
              <Label required>{d.register.dob}</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={f.dobDay} onChange={(e) => set("dobDay", e.target.value)} style={errStyle("dobDay")}>
                  <option value="">दिन</option>
                  {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                </Select>
                <Select value={f.dobMonth} onChange={(e) => set("dobMonth", e.target.value)} style={errStyle("dobMonth")}>
                  <option value="">महीना</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.hi} / {m.en}</option>)}
                </Select>
                <Select value={f.dobYear} onChange={(e) => set("dobYear", e.target.value)} style={errStyle("dobYear")}>
                  <option value="">वर्ष</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </div>
              <Err k="dobDay" /><Err k="dobMonth" /><Err k="dobYear" />
              <div className="mt-1 text-[11px] text-muted">सदस्यता के लिए आयु 18-40 वर्ष के बीच होनी चाहिए</div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.gender}</Label>
                <Select value={f.gender} onChange={(e) => set("gender", e.target.value as typeof f.gender)} style={errStyle("gender")}>
                  <option value="">--</option>
                  <option value="Male">{d.register.male}</option>
                  <option value="Female">{d.register.female}</option>
                  <option value="Other">{d.register.other}</option>
                </Select>
                <Err k="gender" />
              </div>
              <div>
                <Label required>वर्ग (Category)</Label>
                <Select value={f.category} onChange={(e) => set("category", e.target.value)} style={errStyle("category")}>
                  <option value="">--</option>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.nameHi}</option>)}
                </Select>
                <Err k="category" />
              </div>
              <div>
                <Label required>जाति</Label>
                <Input value={f.jaati} onChange={(e) => set("jaati", e.target.value)} style={errStyle("jaati")} />
                <Err k="jaati" />
              </div>
              <div>
                <Label required>{d.register.phone}</Label>
                <Input value={f.mobile} maxLength={10} onChange={(e) => setMobile(e.target.value)} style={errStyle("mobile")} />
                <Err k="mobile" />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-heading">
                <Checkbox checked={f.whatsappSameAsMobile} onChange={(e) => toggleWhatsappSame(e.target.checked)} />
                WhatsApp नंबर मोबाइल नंबर जैसा ही है
              </label>
              {!f.whatsappSameAsMobile && (
                <div className="mt-2">
                  <Label required>{d.register.whatsapp}</Label>
                  <Input value={f.whatsapp} maxLength={10} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} style={errStyle("whatsapp")} />
                  <Err k="whatsapp" />
                </div>
              )}
            </div>

            <div>
              <Label required>{d.register.email}</Label>
              <Input value={f.email} onChange={(e) => set("email", e.target.value)} style={errStyle("email")} />
              <Err k="email" />
            </div>

            <Button onClick={next} className="mt-2">{d.register.next} →</Button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>लोकसभा क्षेत्र</Label>
                <Select value={f.loksabhaId} onChange={(e) => set("loksabhaId", e.target.value)} style={errStyle("loksabhaId")}>
                  <option value="">चुनें</option>
                  {LOKSABHA_CONSTITUENCIES.map((x) => <option key={x.id} value={x.id}>{x.nameHi}</option>)}
                </Select>
                <Err k="loksabhaId" />
              </div>
              <div>
                <Label required>{d.register.district}</Label>
                <Select value={f.districtId} onChange={(e) => { set("districtId", e.target.value); set("assemblyId", ""); set("mandalId", ""); }} style={errStyle("districtId")}>
                  <option value="">चुनें</option>
                  {HIERARCHY.map((x) => <option key={x.id} value={x.id}>{x.nameHi}</option>)}
                </Select>
                <Err k="districtId" />
              </div>
              <div>
                <Label required>{d.register.assembly}</Label>
                <Select value={f.assemblyId} disabled={!f.districtId} onChange={(e) => { set("assemblyId", e.target.value); set("mandalId", ""); }} style={errStyle("assemblyId")}>
                  <option value="">चुनें</option>
                  {assemblies.map((x) => <option key={x.id} value={x.id}>{x.nameHi}</option>)}
                </Select>
                <Err k="assemblyId" />
              </div>
              <div>
                <Label required>{d.register.mandal}</Label>
                <Select value={f.mandalId} disabled={!f.assemblyId} onChange={(e) => set("mandalId", e.target.value)} style={errStyle("mandalId")}>
                  <option value="">चुनें</option>
                  {mandals.map((x) => <option key={x.id} value={x.id}>{x.nameHi}</option>)}
                </Select>
                <Err k="mandalId" />
              </div>
              <div>
                <Label>{d.register.booth}</Label>
                <Input value={f.booth} onChange={(e) => set("booth", e.target.value)} placeholder="वैकल्पिक" />
              </div>
              <div>
                <Label required>{d.register.pincode}</Label>
                <Input value={f.pincode} maxLength={6} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} style={errStyle("pincode")} />
                <Err k="pincode" />
              </div>
            </div>
            <div>
              <Label required>{d.register.address}</Label>
              <Textarea value={f.address} onChange={(e) => set("address", e.target.value)} style={errStyle("address")} />
              <Err k="address" />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}>← {d.register.back}</Button>
              <Button onClick={next}>{d.register.next} →</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="rounded-2xl border border-navy/15 bg-[#EEEEFC] p-4 text-[13px] leading-relaxed text-heading">
              आपका Login PIN (MPIN) आवश्यक है:
              <ul className="mt-1.5 list-disc pl-5">
                <li>ID Card डाउनलोड करने के लिए</li>
                <li>Referral विवरण देखने के लिए</li>
                <li>दोबारा लॉगिन करने के लिए</li>
                <li>प्रोफाइल अपडेट करने के लिए</li>
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>Login PIN (MPIN) — 4 या 6 अंक</Label>
                <Input type="password" inputMode="numeric" maxLength={6} value={f.mpin} onChange={(e) => set("mpin", e.target.value.replace(/\D/g, ""))} style={errStyle("mpin")} />
                <Err k="mpin" />
              </div>
              <div>
                <Label required>MPIN की पुष्टि करें</Label>
                <Input type="password" inputMode="numeric" maxLength={6} value={f.confirmMpin} onChange={(e) => set("confirmMpin", e.target.value.replace(/\D/g, ""))} style={errStyle("confirmMpin")} />
                <Err k="confirmMpin" />
              </div>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary-light to-white p-4">
              <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-relaxed text-heading">
                <Checkbox checked={f.agree} onChange={(e) => set("agree", e.target.checked)} />
                <span>{d.register.declaration}</span>
              </label>
              <Err k="agree" />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}>← {d.register.back}</Button>
              <Button variant="secondary" onClick={submit} disabled={pending}>
                {pending ? "…" : `${d.register.submit} ✓`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
