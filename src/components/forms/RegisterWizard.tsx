"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
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
  mpin: "", confirmMpin: "", referredByCode: "", agree: false as boolean,
};

const YEARS = getEligibleYearsSorted();

export function RegisterWizard() {
  const { d, locale } = useLang();
  const isEn = locale === "en";
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Auto-capture ?ref=CODE from a referral link (dashboard's "Share
  // Referral Link" generates /register?ref=CODE) — still shown/editable
  // in the Security step so someone can type a code by hand too.
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setF((p) => ({ ...p, referredByCode: ref.toUpperCase() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          {d.register.membershipBadge}
        </div>
        <div className="mt-2.5 font-serif text-[28px] font-black text-heading">{d.register.title}</div>
        <div className="mt-1 text-sm text-muted">{d.register.subtitle}</div>
        <div className="mt-2 text-[11px] font-bold text-primary-dark">{d.register.disclaimer}</div>
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
            <div>
              <PhotoCropper photo={f.photoBase64 || null} onPhoto={(v) => set("photoBase64", v)} error={errors.photoBase64} onError={setServerError} />
              <Err k="photoBase64" />
            </div>
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
                  <option value="">{d.register.day}</option>
                  {DAYS.map((day) => <option key={day} value={day}>{day}</option>)}
                </Select>
                <Select value={f.dobMonth} onChange={(e) => set("dobMonth", e.target.value)} style={errStyle("dobMonth")}>
                  <option value="">{d.register.month}</option>
                  {MONTHS.map((m) => <option key={m.value} value={m.value}>{isEn ? m.en : m.hi}</option>)}
                </Select>
                <Select value={f.dobYear} onChange={(e) => set("dobYear", e.target.value)} style={errStyle("dobYear")}>
                  <option value="">{d.register.year}</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </Select>
              </div>
              <Err k="dobDay" /><Err k="dobMonth" /><Err k="dobYear" />
              <div className="mt-1 text-[11px] text-muted">{d.register.ageHint}</div>
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
                <Label required>{d.register.category}</Label>
                <Select value={f.category} onChange={(e) => set("category", e.target.value)} style={errStyle("category")}>
                  <option value="">{d.register.selectPlaceholder}</option>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{isEn ? c.nameEn : c.nameHi}</option>)}
                </Select>
                <Err k="category" />
              </div>
              <div>
                <Label required>{d.register.jaati}</Label>
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
                {d.register.whatsappSame}
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
                <Label required>{d.register.loksabha}</Label>
                <Select value={f.loksabhaId} onChange={(e) => set("loksabhaId", e.target.value)} style={errStyle("loksabhaId")}>
                  <option value="">{d.register.selectPlaceholder}</option>
                  {LOKSABHA_CONSTITUENCIES.map((x) => <option key={x.id} value={x.id}>{isEn ? x.nameEn : x.nameHi}</option>)}
                </Select>
                <Err k="loksabhaId" />
              </div>
              <div>
                <Label required>{d.register.district}</Label>
                <Select value={f.districtId} onChange={(e) => { set("districtId", e.target.value); set("assemblyId", ""); set("mandalId", ""); }} style={errStyle("districtId")}>
                  <option value="">{d.register.selectPlaceholder}</option>
                  {HIERARCHY.map((x) => <option key={x.id} value={x.id}>{isEn ? x.nameEn : x.nameHi}</option>)}
                </Select>
                <Err k="districtId" />
              </div>
              <div>
                <Label required>{d.register.assembly}</Label>
                <Select value={f.assemblyId} disabled={!f.districtId} onChange={(e) => { set("assemblyId", e.target.value); set("mandalId", ""); }} style={errStyle("assemblyId")}>
                  <option value="">{d.register.selectPlaceholder}</option>
                  {assemblies.map((x) => <option key={x.id} value={x.id}>{isEn ? x.nameEn : x.nameHi}</option>)}
                </Select>
                <Err k="assemblyId" />
              </div>
              <div>
                <Label required>{d.register.mandal}</Label>
                <Select value={f.mandalId} disabled={!f.assemblyId} onChange={(e) => set("mandalId", e.target.value)} style={errStyle("mandalId")}>
                  <option value="">{d.register.selectPlaceholder}</option>
                  {mandals.map((x) => <option key={x.id} value={x.id}>{isEn ? x.nameEn : x.nameHi}</option>)}
                </Select>
                <Err k="mandalId" />
              </div>
              <div>
                <Label>{d.register.booth}</Label>
                <Input
                  value={f.booth}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) => set("booth", e.target.value.replace(/\D/g, ""))}
                  placeholder={d.register.boothOptional}
                  style={errStyle("booth")}
                />
                <Err k="booth" />
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
              {d.register.mpinExplainTitle}
              <ul className="mt-1.5 list-disc pl-5">
                {d.register.mpinExplainItems.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.mpin}</Label>
                <Input type="password" inputMode="numeric" maxLength={6} value={f.mpin} onChange={(e) => set("mpin", e.target.value.replace(/\D/g, ""))} style={errStyle("mpin")} />
                <Err k="mpin" />
              </div>
              <div>
                <Label required>{d.register.confirmMpin}</Label>
                <Input type="password" inputMode="numeric" maxLength={6} value={f.confirmMpin} onChange={(e) => set("confirmMpin", e.target.value.replace(/\D/g, ""))} style={errStyle("confirmMpin")} />
                <Err k="confirmMpin" />
              </div>
            </div>
            <div>
              <Label>{d.register.referralCode}</Label>
              <Input
                value={f.referredByCode}
                onChange={(e) => set("referredByCode", e.target.value.toUpperCase())}
                placeholder="ABCDE12345"
              />
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
