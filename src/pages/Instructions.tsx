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

  const floorLabel = (f: string) => (f?.startsWith("-") ? `מינוס ${f.slice(1)}` : f);


  useMeta(
    `הוראות חניה ל${isGuests ? "חניון אורחים" : "חניון ספקים"} – מגדלי הצעירים`,
    "הוראות חניה מפורטות עם ניווט ודגשים – מגדלי הצעירים"
  );


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
    <main className="min-h-screen container py-6 text-lg">
      <header className="max-w-xl mx-auto mb-6">
        <h1 className="text-5xl font-extrabold text-foreground">
          {`הוראות חניה ל${isGuests ? "חניון אורחים" : "חניון ספקים"}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {data.fullName} • {data.tower} • קומה {data.floor} • דירה {data.unit}
        </p>
      </header>

      <section className="max-w-xl mx-auto space-y-6">

        <article className="space-y-4">
          <h2 className="text-2xl font-semibold">שלבים</h2>
          <ol className="list-decimal pr-5 space-y-2">
            <li className="space-y-2">
              <div>לשים בוויז "חניון מגדלי הצעירים".</div>
              <Button asChild variant="cta" size="sm" aria-label="פתח ניווט ב-Waze">
                <a href={WAZE_URL} target="_blank" rel="noreferrer">פתח Waze</a>
              </Button>
            </li>
            <li className="space-y-2">
              לשים לב להיכנס לחניון של "מגדלי הצעירים" (לא "מגדלי רסיטל").
              <img src="/lovable-uploads/d64a5e06-972e-47f1-880b-4f2111179dca.png" alt="המחשה: כניסה לחניון מגדלי הצעירים" loading="lazy" className="rounded-md border mt-2 w-full max-w-sm" />
            </li>
            {isGuests ? (
              <>
                <li className="space-y-2">
                  יש לרדת למטה אל חניון האורחים. השער אמור להיפתח אוטומטית.
                  <img src="/lovable-uploads/83272b10-f8c4-4b44-8cc6-13387de27862.png" alt="המחשה: ירידה לחניון האורחים – מגדלי הצעירים" loading="lazy" className="rounded-md border mt-2 w-full max-w-sm" />
                </li>
                <li>
                  לחנות ב: <strong>קומה {floorLabel(data.parkingFloor)}</strong>, <strong>מספר חניה {data.parkingSpot}</strong>.
                </li>
                <li>
                  לאחר החניה: ללכת למעלית של המגדל <strong>{data.tower}</strong>, לעלות לקומה <strong>{data.floor}</strong>, דירה <strong>{data.unit}</strong>.
                </li>
                <li>
                  אם דלת הכניסה נעולה, יש לצלצל באינטרקום ללובי ולהגיד:
                  <div className="mt-1 whitespace-pre-line">
                    {`אני אורח שמגיע ל${data.fullName}\nשגר בדירה מספר ${data.unit}`}
                  </div>
                </li>
              </>
            ) : (
              <>
                <li className="space-y-2">
                  בצד שמאל יש שער של חניון ספקים (שני עמודים; כתוב "חניון גן ילדים").
                  <img src="/lovable-uploads/29aa8bd5-20f1-4455-a66d-2fc91feab4b7.png" alt="המחשה: שער חניון ספקים - חניון גן ילדים" loading="lazy" className="rounded-md border mt-2 w-full max-w-sm" />
                </li>
                <li className="space-y-2">
                  <div>אם השער לא נפתח:</div>
                  <div>
                    <Button asChild variant="secondary" size="sm" aria-label="חיוג לפקיד הלובי">
                      <a href={`tel:${FRONT_DESK_PHONE}`}>חיוג ללובי: {FRONT_DESK_PHONE}</a>
                    </Button>
                  </div>
                </li>
                <li>
                  לאחר החניה: ללכת למעלית של המגדל <strong>{data.tower}</strong>, לעלות לקומה <strong>{data.floor}</strong>, דירה <strong>{data.unit}</strong>.
                </li>
                <li>
                  אם דלת הכניסה נעולה, יש לצלצל באינטרקום ללובי ולהגיד:
                  <div className="mt-1 whitespace-pre-line">
                    {`אני מוביל שמגיע ל${data.fullName}\nשגר בדירה מספר ${data.unit}`}
                  </div>
                </li>
              </>
            )}
          </ol>

          <aside className="text-muted-foreground space-y-2">
            <p>במידת הצורך, ניתן להתקשר לדייר/ת שהזמין אותך</p>
            <Button asChild variant="secondary" size="sm" aria-label={`חייג ל${data.fullName}`}>
              <a href={`tel:${data.phone}`}>חייג ל{data.fullName}</a>
            </Button>
          </aside>
        </article>

      </section>
    </main>
  );
}
