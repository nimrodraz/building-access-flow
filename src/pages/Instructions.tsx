import { useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const FRONT_DESK_PHONE = "053-8888265"; // עדכון מספר לפי הצורך
const WAZE_URL = "https://waze.com/ul?q=%D7%97%D7%A0%D7%99%D7%95%D7%9F%20%D7%9E%D7%92%D7%93%D7%9C%D7%99%20%D7%94%D7%A6%D7%A2%D7%99%D7%A8%D7%99%D7%9D&navigate=yes";

function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);
}

export default function Instructions() {

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

  useMeta(
    `הוראות חניה ל${isGuests ? "חניון אורחים" : "חניון ספקים"}`,
    "הוראות חניה מפורטות עם ניווט ודגשים – מגדלי הצעירים"
  );

  const intercomWord = isGuests ? "אורח" : "מוביל";


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
          {`הוראות חניה ל${isGuests ? "חניון אורחים" : "חניון ספקים"}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          לדירה: {data.tower} • קומה {data.floor} • דירה {data.unit}
        </p>
      </header>

      <section className="max-w-xl mx-auto space-y-6">

        <article className="space-y-4">
          <h2 className="text-xl font-semibold">שלבים</h2>
          <ol className="list-decimal pr-5 space-y-2">
            <li className="space-y-2">
              <div>לשים בוויז "חניון מגדלי הצעירים".</div>
              <Button asChild variant="cta" size="sm" aria-label="פתח ניווט ב-Waze">
                <a href={WAZE_URL} target="_blank" rel="noreferrer">פתח Waze</a>
              </Button>
            </li>
            <li>לשים לב להיכנס לחניון של "מגדלי הצעירים" (לא "מגדלי רסיטל").</li>
            {isGuests ? (
              <>
                <li>יש לרדת למטה אל חניון האורחים. השער אמור להיפתח אוטומטית.</li>
                <li>
                  לחנות ב: <strong>קומה {data.parkingFloor}</strong>, <strong>מספר חניה {data.parkingSpot}</strong>.
                </li>
                <li>
                  לאחר החניה: ללכת למעלית של המגדל <strong>{data.tower}</strong> → לעלות ל־<strong>{data.floor}</strong> → להגיע ל־<strong>{data.unit}</strong>.
                </li>
                <li>
                  אם דלת הכניסה נעולה: להתקשר באינטרקום לשומר ולומר: "אורח שמגיע ל{data.fullName} ב{data.unit}".
                </li>
              </>
            ) : (
              <>
                <li>בצד שמאל יש שער של חניון ספקים (שני עמודים; כתוב "חניון גן ילדים").</li>
                <li className="space-y-2">
                  <div>אם השער לא נפתח:</div>
                  <div className="flex gap-2 flex-wrap">
                    <Button asChild variant="secondary" size="sm" aria-label="חיוג לפקיד הלובי">
                      <a href={`tel:${FRONT_DESK_PHONE}`}>חיוג ללובי: {FRONT_DESK_PHONE}</a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="שליחת הודעת WhatsApp"
                      onClick={() =>
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(
                            `מוביל שמגיע ל${data.fullName} שנמצא ב${data.floor} ${data.unit}`
                          )}`,
                          "_blank"
                        )
                      }
                    >
                      שלח הודעת WhatsApp
                    </Button>
                  </div>
                </li>
                <li>
                  לאחר החניה: ללכת למעלית של המגדל <strong>{data.tower}</strong> → לעלות ל־<strong>{data.floor}</strong> → להגיע ל־<strong>{data.unit}</strong>.
                </li>
                <li>
                  אם דלת הכניסה נעולה: להתקשר באינטרקום לשומר ולומר: "מוביל שמגיע ל{data.fullName} ב{data.unit}".
                </li>
              </>
            )}
          </ol>

          <aside className="text-sm text-muted-foreground">
            מידע נוסף לאורח: הטלפון שלי: {data.phone}
          </aside>
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
