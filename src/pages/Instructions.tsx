import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FRONT_DESK_PHONE = "03-7777777"; // עדכון מספר לפי הצורך
const WAZE_URL = "https://waze.com/ul?q=%D7%97%D7%A0%D7%99%D7%95%D7%9F%20%D7%9E%D7%92%D7%93%D7%9C%D7%99%20%D7%94%D7%A6%D7%A2%D7%99%D7%A8%D7%99%D7%9D&navigate=yes";

function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
}

export default function Instructions() {
  useMeta(
    "הוראות הגעה לאורחים – מגדלי הצעירים",
    "דף הוראות דינמי לאורחים ולספקים עם קישורי ניווט ושיתוף"
  );

  const [params] = useSearchParams();
  const data = useMemo(() => {
    const lotType = params.get("lotType") as "suppliers" | "guests" | null;
    return {
      lotType,
      fullName: params.get("fullName") ?? "",
      phone: params.get("phone") ?? "",
      tower: params.get("tower") ?? "",
      floor: params.get("floor") ?? "",
      unit: params.get("unit") ?? "",
      parkingFloor: params.get("parkingFloor") ?? "",
      parkingSpot: params.get("parkingSpot") ?? "",
    };
  }, [params]);

  const isGuests = data.lotType === "guests";

  const intercomWord = isGuests ? "אורח" : "מוביל";

  const whatsappMessage = useMemo(() => {
    const base = isGuests
      ? `היי! הנה הוראות הגעה לחניון האורחים במגדלי הצעירים. החנה בקומה ${data.parkingFloor} במקום ${data.parkingSpot}. עלה במעלית ל${data.tower} קומה ${data.floor}, דירה ${data.unit}.`
      : `היי! הגעה דרך שער שמאל (חניון גן ילדים) למוביל/ספק. עלה במעלית ל${data.tower} קומה ${data.floor}, דירה ${data.unit}.`;
    const link = typeof window !== "undefined" ? window.location.href : "";
    return `${base}\n${link}`;
  }, [data, isGuests]);

  if (!data.lotType) {
    return (
      <main className="min-h-screen container py-8">
        <article className="max-w-xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">לא נמצאו נתוני הוראות</h1>
          <p>חזרו לויזארד כדי ליצור קישור חדש.</p>
          <div>
            <Button asChild variant="secondary">
              <Link to="/">חזרה לויזארד</Link>
            </Button>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="min-h-screen container py-6">
      <header className="max-w-xl mx-auto mb-6">
        <h1 className="text-3xl font-bold">
          {isGuests ? "הוראות הגעה – חניון אורחים" : "הוראות הגעה – חניון ספקים"}
        </h1>
        <p className="text-muted-foreground mt-1">
          לדירה: {data.tower} • קומה {data.floor} • דירה {data.unit}
        </p>
      </header>

      <section className="max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-1 gap-3">
          <Button asChild variant="cta" size="xl" aria-label="פתח ניווט ב-Waze">
            <a href={WAZE_URL} target="_blank" rel="noreferrer">פתח Waze לחניון</a>
          </Button>
          <Button asChild variant="secondary" size="xl" aria-label="התקשר ללובי">
            <a href={`tel:${FRONT_DESK_PHONE}`}>חיוג ללובי: {FRONT_DESK_PHONE}</a>
          </Button>
          <Button
            variant="outline"
            size="xl"
            aria-label="שלח הודעת WhatsApp"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`,
                "_blank"
              )
            }
          >
            שלח ב-WhatsApp
          </Button>
        </div>

        <article className="space-y-4">
          <h2 className="text-xl font-semibold">שלבים</h2>
          {isGuests ? (
            <ol className="list-decimal pr-5 space-y-2">
              <li>היכנסו לשער חניון האורחים (נפתח אוטומטית).</li>
              <li>
                חנו בקומה {data.parkingFloor} במקום {data.parkingSpot}.
              </li>
              <li>
                גשו למעליות ועלו ל{data.tower}, קומה {data.floor}, דירה {data.unit}.
              </li>
              <li>
                אם הדלת נעולה – לחצו באינטרקום לשומר וציינו שאתם "{intercomWord}". טלפון הדייר לאימות: {data.phone}.
              </li>
            </ol>
          ) : (
            <ol className="list-decimal pr-5 space-y-2">
              <li>היכנסו דרך השער השמאלי – "חניון גן ילדים" (ספקים/מובילים).</li>
              <li>
                אם השער סגור – פנו לשומר בלובי בטלפון לעיל לפתיחה.
              </li>
              <li>
                גשו למעליות ועלו ל{data.tower}, קומה {data.floor}, דירה {data.unit}.
              </li>
              <li>
                אם הדלת נעולה – לחצו באינטרקום לשומר וציינו שאתם "{intercomWord}". טלפון הדייר לאימות: {data.phone}.
              </li>
            </ol>
          )}
        </article>

        <footer className="pt-4">
          <Button asChild variant="link">
            <Link to="/" aria-label="חזרה לויזארד">חזרה לויזארד</Link>
          </Button>
        </footer>
      </section>
    </main>
  );
}
