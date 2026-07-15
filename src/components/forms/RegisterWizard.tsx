"use client";

import { useMemo, useState, useTransition } from "react";
import { useLang } from "@/lib/i18n/LanguageProvider";
import { createClient } from "@/lib/supabase/client";
import { registerMember } from "@/app/actions/register";
import { personalSchema, electoralSchema, socialSchema, passwordSchema } from "@/lib/validators/registration";
import { PhotoDropzone } from "./PhotoDropzone";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import type { District, Assembly, Mandal } from "@/lib/types";

const EMPTY = {
  photoBase64: "", fullName: "", fatherName: "", dob: "", gender: "" as "" | "Male" | "Female" | "Other",
  phone: "", email: "", address: "", pincode: "",
  districtId: "", assemblyId: "", mandalId: "", booth: "",
  whatsapp: "", facebook: "", instagram: "", twitter: "", referralCode: "",
  password: "", confirmPassword: "", agree: false as boolean,
};

const STEP_SCHEMAS = [personalSchema, electoralSchema, socialSchema, passwordSchema];

export function RegisterWizard({ districts }: { districts: District[] }) {
  const { d } = useLang();
  const [step, setStep] = useState(0);
  const [f, setF] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) => setF((p) => ({ ...p, [k]: v }));

  const loadAssemblies = async (districtId: string) => {
    set("districtId", districtId);
    set("assemblyId", "");
    set("mandalId", "");
    setMandals([]);
    if (!districtId) {
      setAssemblies([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("assemblies").select("*").eq("district_id", districtId).order("name_hi");
    setAssemblies(data ?? []);
  };

  const loadMandals = async (assemblyId: string) => {
    set("assemblyId", assemblyId);
    set("mandalId", "");
    if (!assemblyId) {
      setMandals([]);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase.from("mandals").select("*").eq("assembly_id", assemblyId).order("name_hi");
    setMandals(data ?? []);
  };

  const steps = [d.register.step1, d.register.step2, d.register.step3, d.register.step4];

  const stepPayload = () => {
    if (step === 0) return { photoBase64: f.photoBase64, fullName: f.fullName, fatherName: f.fatherName, dob: f.dob, gender: f.gender, phone: f.phone, email: f.email, address: f.address, pincode: f.pincode };
    if (step === 1) return { districtId: f.districtId, assemblyId: f.assemblyId, mandalId: f.mandalId, booth: f.booth };
    if (step === 2) return { whatsapp: f.whatsapp, facebook: f.facebook, instagram: f.instagram, twitter: f.twitter, referralCode: f.referralCode };
    return { password: f.password, confirmPassword: f.confirmPassword, agree: f.agree };
  };

  const validateStep = () => {
    const schema = STEP_SCHEMAS[step];
    const result = schema.safeParse(stepPayload());
    if (!result.success) {
      const e: Record<string, string> = {};
      for (const issue of result.error.issues) e[issue.path.join(".")] = issue.message;
      setErrors(e);
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    if (validateStep()) setStep((s) => Math.min(s + 1, 3));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = () => {
    if (!validateStep()) return;
    setServerError(null);
    startTransition(async () => {
      const res = await registerMember({
        photoBase64: f.photoBase64,
        fullName: f.fullName,
        fatherName: f.fatherName,
        dob: f.dob,
        gender: f.gender,
        phone: f.phone,
        email: f.email,
        address: f.address,
        pincode: f.pincode,
        districtId: f.districtId,
        assemblyId: f.assemblyId,
        mandalId: f.mandalId,
        booth: f.booth,
        whatsapp: f.whatsapp,
        facebook: f.facebook,
        instagram: f.instagram,
        twitter: f.twitter,
        referralCode: f.referralCode,
        password: f.password,
        confirmPassword: f.confirmPassword,
        agree: f.agree,
      });
      if (res?.error) {
        setServerError(res.error);
        if (res.fieldErrors) setErrors(res.fieldErrors);
      } else if (res?.needsEmailConfirmation) {
        setNeedsConfirmation(true);
      }
    });
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <div className="mt-1 text-[11.5px] font-bold text-danger">{errors[k]}</div> : null);

  if (needsConfirmation) {
    return (
      <div className="mx-auto max-w-[520px] animate-fadeUp text-center">
        <div className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_50px_rgba(13,18,32,.09)] backdrop-blur">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary-light text-3xl">📧</div>
          <div className="font-serif text-2xl font-black text-heading">पंजीकरण लगभग पूरा हुआ!</div>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            आपका सदस्यता आवेदन दर्ज हो गया है। आगे बढ़ने के लिए कृपया <b>{f.email}</b> पर भेजा गया
            confirmation ईमेल खोलें और लिंक पर क्लिक करें। उसके बाद <b>/login</b> पर जाकर लॉगिन करें।
          </p>
        </div>
      </div>
    );
  }

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
            <PhotoDropzone photo={f.photoBase64 || null} onPhoto={(v) => set("photoBase64", v)} error={errors.photoBase64} onError={setServerError} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.fullName}</Label>
                <Input value={f.fullName} onChange={(e) => set("fullName", e.target.value)} error={!!errors.fullName} />
                <Err k="fullName" />
              </div>
              <div>
                <Label required>{d.register.fatherName}</Label>
                <Input value={f.fatherName} onChange={(e) => set("fatherName", e.target.value)} error={!!errors.fatherName} />
                <Err k="fatherName" />
              </div>
              <div>
                <Label required>{d.register.dob}</Label>
                <Input type="date" value={f.dob} onChange={(e) => set("dob", e.target.value)} error={!!errors.dob} />
                <Err k="dob" />
              </div>
              <div>
                <Label required>{d.register.gender}</Label>
                <Select value={f.gender} onChange={(e) => set("gender", e.target.value as typeof f.gender)} error={!!errors.gender}>
                  <option value="">--</option>
                  <option value="Male">{d.register.male}</option>
                  <option value="Female">{d.register.female}</option>
                  <option value="Other">{d.register.other}</option>
                </Select>
                <Err k="gender" />
              </div>
              <div>
                <Label required>{d.register.phone}</Label>
                <Input value={f.phone} maxLength={10} onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))} error={!!errors.phone} />
                <Err k="phone" />
              </div>
              <div>
                <Label required>{d.register.email}</Label>
                <Input value={f.email} onChange={(e) => set("email", e.target.value)} error={!!errors.email} />
                <Err k="email" />
              </div>
            </div>
            <div>
              <Label required>{d.register.address}</Label>
              <Textarea value={f.address} onChange={(e) => set("address", e.target.value)} error={!!errors.address} />
              <Err k="address" />
            </div>
            <div>
              <Label required>{d.register.pincode}</Label>
              <Input value={f.pincode} maxLength={6} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, ""))} error={!!errors.pincode} />
              <Err k="pincode" />
            </div>
            <Button onClick={next} className="mt-2">{d.register.next} →</Button>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.district}</Label>
                <Select value={f.districtId} onChange={(e) => loadAssemblies(e.target.value)} error={!!errors.districtId}>
                  <option value="">--</option>
                  {districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>{dist.name_hi}</option>
                  ))}
                </Select>
                <Err k="districtId" />
              </div>
              <div>
                <Label required>{d.register.assembly}</Label>
                <Select value={f.assemblyId} onChange={(e) => loadMandals(e.target.value)} disabled={!f.districtId} error={!!errors.assemblyId}>
                  <option value="">--</option>
                  {assemblies.map((a) => (
                    <option key={a.id} value={a.id}>{a.name_hi}</option>
                  ))}
                </Select>
                <Err k="assemblyId" />
              </div>
              <div>
                <Label required>{d.register.mandal}</Label>
                <Select value={f.mandalId} onChange={(e) => set("mandalId", e.target.value)} disabled={!f.assemblyId} error={!!errors.mandalId}>
                  <option value="">--</option>
                  {mandals.map((m) => (
                    <option key={m.id} value={m.id}>{m.name_hi}</option>
                  ))}
                </Select>
                <Err k="mandalId" />
              </div>
              <div>
                <Label required>{d.register.booth}</Label>
                <Input value={f.booth} onChange={(e) => set("booth", e.target.value)} error={!!errors.booth} />
                <Err k="booth" />
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}>← {d.register.back}</Button>
              <Button onClick={next}>{d.register.next} →</Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.whatsapp}</Label>
                <Input value={f.whatsapp} maxLength={10} onChange={(e) => set("whatsapp", e.target.value.replace(/\D/g, ""))} error={!!errors.whatsapp} />
                <Err k="whatsapp" />
              </div>
              <div>
                <Label>{d.register.facebook}</Label>
                <Input value={f.facebook} onChange={(e) => set("facebook", e.target.value)} />
              </div>
              <div>
                <Label>{d.register.instagram}</Label>
                <Input value={f.instagram} onChange={(e) => set("instagram", e.target.value)} />
              </div>
              <div>
                <Label>{d.register.twitter}</Label>
                <Input value={f.twitter} onChange={(e) => set("twitter", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{d.register.referralCode}</Label>
              <Input value={f.referralCode} onChange={(e) => set("referralCode", e.target.value.toUpperCase())} placeholder="ABCDE12345" />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={back}>← {d.register.back}</Button>
              <Button onClick={next}>{d.register.next} →</Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label required>{d.register.password}</Label>
                <Input type="password" value={f.password} onChange={(e) => set("password", e.target.value)} error={!!errors.password} />
                <Err k="password" />
              </div>
              <div>
                <Label required>{d.register.confirmPassword}</Label>
                <Input type="password" value={f.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} error={!!errors.confirmPassword} />
                <Err k="confirmPassword" />
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
