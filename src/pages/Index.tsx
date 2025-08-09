import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const RESIDENT_KEY = "residentDetails";
const FLOORS = ["-1","-2","-3","-4","-5"] as const;
const FRONT_DESK_PHONE = "03-7777777"; // עדכון מספר לפי הצורך
const WAZE_URL = "https://waze.com/ul?q=%D7%97%D7%A0%D7%99%D7%95%D7%9F%20%D7%9E%D7%92%D7%93%D7%9C%D7%99%20%D7%94%D7%A6%D7%A2%D7%99%D7%A8%D7%99%D7%9D&navigate=yes";

type Resident = {
  fullName: string;
  phone: string;
  tower: "צפוני" | "דרומי";
  floor: string;
  unit: string;
};

type ParkingType = "suppliers" | "guests";

const residentSchema = z.object({
  fullName: z.string().min(2, "שדה חובה"),
  phone: z.string().min(8, "שדה חובה"),
  tower: z.enum(["צפוני","דרומי"]),
  floor: z.string().min(1, "שדה חובה"),
  unit: z.string().min(1, "שדה חובה"),
});

const guestParkingSchema = z.object({
  parkingFloor: z.enum(FLOORS),
  parkingSpot: z.string().regex(/^\d{1,2}$/,{ message: "מספר בין 1 ל-99" }),
});

type GuestParking = z.infer<typeof guestParkingSchema>;

export default function Index() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [parkingType, setParkingType] = useState<ParkingType | null>(null);

  const residentForm = useForm<Resident>({
    resolver: zodResolver(residentSchema),
    defaultValues: { fullName: "", phone: "", tower: "צפוני", floor: "", unit: "" },
    mode: "onChange",
  });

  const guestForm = useForm<GuestParking>({
    resolver: zodResolver(guestParkingSchema),
    defaultValues: { parkingFloor: "-1", parkingSpot: "" },
    mode: "onChange",
  });

  useEffect(() => {
    document.title = "ויזארד הזמנת אורחים – מגדלי הצעירים";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "טופס דיירים להזמנת אורחים/ספקים עם קישור שיתוף");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(RESIDENT_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved) as Resident;
        residentForm.reset(data);
        setStep(2);
      } catch {}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveResident = (values: Resident) => {
    localStorage.setItem(RESIDENT_KEY, JSON.stringify(values));
    toast({ title: "נשמר בהצלחה" });
    setStep(2);
  };

  const buildShareUrl = () => {
    const r = residentForm.getValues();
    const g = guestForm.getValues();
    const params = new URLSearchParams({
      lotType: parkingType ?? "suppliers",
      fullName: r.fullName,
      phone: r.phone,
      tower: r.tower,
      floor: r.floor,
      unit: r.unit,
    });
    if (parkingType === "guests") {
      params.set("parkingFloor", g.parkingFloor);
      params.set("parkingSpot", g.parkingSpot);
    }
    return `${window.location.origin}/instructions?${params.toString()}`;
  };

  const whatsappMessage = useMemo(() => {
    const r = residentForm.getValues();
    if (parkingType === "guests") {
      const g = guestForm.getValues();
      return `היי! הנה הוראות הגעה לחניון האורחים במגדלי הצעירים. החנה בקומה ${g.parkingFloor} במקום ${g.parkingSpot}. עלה ל${r.tower} קומה ${r.floor}, דירה ${r.unit}. ${buildShareUrl()}`;
    }
    return `היי! הגעה דרך שער שמאל (חניון גן ילדים) למוביל/ספק. עלה ל${r.tower} קומה ${r.floor}, דירה ${r.unit}. ${buildShareUrl()}`;
  }, [residentForm, guestForm, parkingType]);

  return (
    <main className="min-h-screen container py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">הזמנת אורח/ספק</h1>
        <p className="text-muted-foreground">ממשק מהיר לשיתוף הוראות הגעה</p>
      </header>

      <section className="max-w-xl mx-auto space-y-6">
        {step === 1 && (
          <form className="space-y-4" onSubmit={residentForm.handleSubmit(saveResident)}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">שם מלא</Label>
                <Input id="fullName" {...residentForm.register("fullName")} aria-label="שם מלא" />
                {residentForm.formState.errors.fullName && (
                  <span className="text-destructive text-sm">
                    {residentForm.formState.errors.fullName.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input id="phone" inputMode="tel" {...residentForm.register("phone")} aria-label="טלפון" />
                {residentForm.formState.errors.phone && (
                  <span className="text-destructive text-sm">
                    {residentForm.formState.errors.phone.message}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label>מגדל</Label>
                <div className="flex justify-end">
                  <Select defaultValue={residentForm.getValues("tower")} onValueChange={(v: "צפוני"|"דרומי")=>residentForm.setValue("tower", v, { shouldValidate:true })}>
                    <SelectTrigger aria-label="בחירת מגדל">
                      <SelectValue placeholder="בחר מגדל" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="צפוני">צפוני</SelectItem>
                      <SelectItem value="דרומי">דרומי</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="floor">קומה</Label>
                  <Input id="floor" {...residentForm.register("floor")} aria-label="קומה" />
                  {residentForm.formState.errors.floor && (
                    <span className="text-destructive text-sm">
                      {residentForm.formState.errors.floor.message}
                    </span>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">מס׳ דירה</Label>
                  <Input id="unit" {...residentForm.register("unit")} aria-label="מספר דירה" />
                  {residentForm.formState.errors.unit && (
                    <span className="text-destructive text-sm">
                      {residentForm.formState.errors.unit.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="cta" size="xl" aria-label="שמירה והמשך">שמירה והמשך</Button>
            </div>
          </form>
        )}

        {step > 1 && (
          <div className="flex items-center justify-between p-3 rounded-md bg-muted">
            <div className="text-sm">פרטי דייר נטענו מהמכשיר</div>
            <Button variant="link" onClick={() => setStep(1)} aria-label="עריכת פרטי דייר">עריכת פרטים</Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">בחר סוג חניה</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="cta" size="xl" aria-label="חניון ספקים" onClick={() => { setParkingType("suppliers"); setStep(4); }}>חניון ספקים</Button>
              <Button variant="secondary" size="xl" aria-label="חניון אורחים" onClick={() => { setParkingType("guests"); setStep(3); }}>חניון אורחים</Button>
            </div>
          </div>
        )}

        {step === 3 && parkingType === "guests" && (
          <form className="space-y-4" onSubmit={guestForm.handleSubmit(() => setStep(4))}>
            <h2 className="text-xl font-semibold">פרטי חניה לאורח</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>קומת חניה</Label>
                <Select defaultValue={guestForm.getValues("parkingFloor")} onValueChange={(v: typeof FLOORS[number])=>guestForm.setValue("parkingFloor", v, { shouldValidate:true })}>
                  <SelectTrigger aria-label="קומת חניה">
                    <SelectValue placeholder="בחר קומה" />
                  </SelectTrigger>
                  <SelectContent>
                    {FLOORS.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="parkingSpot">מס׳ חניה</Label>
                <Input id="parkingSpot" inputMode="numeric" {...guestForm.register("parkingSpot", { required: true })} aria-label="מספר חניה" />
                {guestForm.formState.errors.parkingSpot && (
                  <span className="text-destructive text-sm">
                    {guestForm.formState.errors.parkingSpot.message || "שדה חובה"}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" variant="cta" size="xl" aria-label="המשך">המשך</Button>
              <Button type="button" variant="ghost" onClick={() => setStep(2)} aria-label="חזרה">חזרה</Button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="ghost"
              size="lg"
              onClick={async () => { await navigator.clipboard.writeText(buildShareUrl()); toast({ title: "קישור הועתק" }); }}
              aria-label="העתק קישור"
            >
              העתק קישור הוראות
            </Button>
            <Button asChild variant="link" aria-label="פתח דף קישור הוראות">
              <a href={buildShareUrl()} target="_blank" rel="noreferrer">פתח דף קישור הוראות</a>
            </Button>
          </div>
        )}
      </section>

    </main>
  );
}
