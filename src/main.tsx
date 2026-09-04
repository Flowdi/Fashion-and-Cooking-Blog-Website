import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

type Category = "Fashion" | "Cooking";
type Post = {
  slug: string;
  category: Category;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  gallery?: string[];
  readTime: string;
  content: string[];
  materials?: string[];
  difficulty?: string;
  projectStatus?: string;
  fabricAmount?: string;
  patternSource?: string;
  careInstructions?: string;
  recipe?: {
    duration: string;
    prepTime?: string;
    cookTime?: string;
    servings: string;
    dietaryTags?: string[];
    ingredients: string[];
    steps: string[];
  };
};
const posts: Post[] = [
  {
    slug: "zeitlose-basics",
    category: "Fashion",
    title: "Zeitlose Basics für jeden Tag",
    excerpt: "Ein erster Beispielbeitrag über vielseitige Lieblingsteile und persönliche Looks.",
    date: "15. Mai 2026",
    readTime: "4 Min.",
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85",
    content: [
      "Dieser Beitrag ist ein Platzhalter für Nellis erstes Fashion-Projekt. Später kann hier die Geschichte hinter einem Entwurf, einem selbstgenähten Kleidungsstück oder einem besonderen Look stehen.",
      "Zu jedem Beitrag können mehrere Fotos, kleine Bildunterschriften und persönliche Notizen ergänzt werden. Das Layout ist bereits darauf vorbereitet.",
    ],
  },
  {
    slug: "cremige-pilz-pasta",
    category: "Cooking",
    title: "Cremige Pilz-Pasta mit frischen Kräutern",
    excerpt: "Ein unkompliziertes Lieblingsgericht für gemütliche Abende.",
    date: "12. Mai 2026",
    readTime: "25 Min.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1400&q=85",
    content: [
      "Dieses Beispiel zeigt, wie ein späterer Rezeptbeitrag aufgebaut sein kann: mit einer kurzen persönlichen Einleitung, übersichtlichen Zutaten und einzelnen Zubereitungsschritten.",
    ],
    recipe: {
      duration: "25 Minuten",
      servings: "2 Portionen",
      ingredients: [
        "250 g Pasta",
        "250 g Pilze",
        "1 kleine Zwiebel",
        "150 ml Kochsahne",
        "frische Kräuter, Salz und Pfeffer",
      ],
      steps: [
        "Pasta nach Packungsangabe kochen.",
        "Pilze und Zwiebel goldbraun anbraten.",
        "Sahne und etwas Pastawasser hinzufügen.",
        "Pasta unterheben, abschmecken und mit Kräutern servieren.",
      ],
    },
  },
  {
    slug: "fruehlingsideen",
    category: "Fashion",
    title: "Frühlingsideen, die bleiben",
    excerpt: "Farben, Stoffe und Formen für eine kleine saisonale Ideensammlung.",
    date: "8. Mai 2026",
    readTime: "3 Min.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=85",
    content: [
      "Eine ruhige Sammlung aus Inspirationen, Skizzen und ersten Gedanken. Hier könnten später Moodboards und Fotos aus dem Entstehungsprozess erscheinen.",
    ],
  },
  {
    slug: "beerenkuchen",
    category: "Cooking",
    title: "Beerenkuchen mit Honig & Zitrone",
    excerpt: "Fruchtig, frisch und genau richtig für einen langen Sonntagnachmittag.",
    date: "5. Mai 2026",
    readTime: "55 Min.",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=1200&q=85",
    content: [
      "Auch Backideen erhalten später eine eigene, gut lesbare Rezeptansicht mit Zutaten, Zubereitung und persönlichen Tipps.",
    ],
  },
  {
    slug: "ruhiger-kleiderschrank",
    category: "Fashion",
    title: "Mein Guide für einen ruhigen Kleiderschrank",
    excerpt: "Weniger Teile, mehr Kombinationen und ein Stil, der wirklich zu einem passt.",
    date: "1. Mai 2026",
    readTime: "5 Min.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85",
    content: [
      "Dieser Beispieltext zeigt eine längere Fashion-Geschichte. Später kann Nelli hier eigene Erfahrungen, Tipps oder die Entwicklung eines Projekts teilen.",
    ],
  },
  {
    slug: "fruehlingssalat",
    category: "Cooking",
    title: "Lauwarmer Frühlingssalat",
    excerpt: "Knackiges Gemüse, frische Kräuter und ein leichtes Zitronendressing.",
    date: "28. April 2026",
    readTime: "20 Min.",
    image:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=85",
    content: ["Ein weiterer Platzhalter für die spätere Rezeptesammlung."],
  },
];
const labels = {
  DE: {
    home: "Startseite",
    about: "Über mich",
    latest: "Neueste Beiträge",
    discover: "Entdecken",
    journal: "Ein persönliches Journal für",
    hero: "Mode trifft Genuss",
  },
  EN: {
    home: "Home",
    about: "About",
    latest: "Latest stories",
    discover: "Discover",
    journal: "A personal journal for",
    hero: "Where fashion meets flavour",
  },
  PL: {
    home: "Start",
    about: "O mnie",
    latest: "Najnowsze wpisy",
    discover: "Odkryj",
    journal: "Osobisty dziennik",
    hero: "Moda spotyka smak",
  },
};
function navigate(path: string) {
  history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo(0, 0);
}
function SiteLink({
  to,
  className,
  children,
}: {
  to: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
function Header({
  lang,
  setLang,
}: {
  lang: keyof typeof labels;
  setLang: (l: keyof typeof labels) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = labels[lang];
  return (
    <header>
      <SiteLink className="brand" to="/">
        Nellis Fashion &amp; Food Blog
      </SiteLink>
      <button
        className="menu"
        aria-label="Menü öffnen"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ☰
      </button>
      <nav className={open ? "open" : ""} onClick={() => setOpen(false)}>
        <SiteLink to="/">{t.home}</SiteLink>
        <SiteLink to="/fashion">Fashion</SiteLink>
        <SiteLink to="/cooking">Cooking</SiteLink>
        <SiteLink to="/ueber-mich">{t.about}</SiteLink>
      </nav>
      <div className="lang" aria-label="Sprache wählen">
        {(["DE", "EN", "PL"] as const).map((item, i) => (
          <React.Fragment key={item}>
            <button className={lang === item ? "active" : ""} onClick={() => setLang(item)}>
              {item}
            </button>
            {i < 2 && <span>·</span>}
          </React.Fragment>
        ))}
      </div>
    </header>
  );
}
function PostCard({ post }: { post: Post }) {
  return (
    <SiteLink className="post-card" to={`/beitrag/${post.slug}`}>
      <img src={post.image} alt={`Titelbild zu „${post.title}“`} loading="lazy" decoding="async" />
      <div className="post-meta">
        <b>{post.category}</b>
        <time>{post.date}</time>
      </div>
      <h3>{post.title}</h3>
      <p>{post.excerpt}</p>
      <span className="read">Beitrag lesen →</span>
    </SiteLink>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="title">
      <hr />
      <h2>{children}</h2>
      <hr />
    </div>
  );
}
function AboutTeaser() {
  return (
    <section className="about">
      <div>
        <small>Die Person hinter dem Blog</small>
        <h2>Über Nelli</h2>
        <p>
          Mode entwerfen, Neues ausprobieren und mit Liebe kochen – hier entsteht ein persönlicher
          Ort für all die Ideen, die nach und nach Wirklichkeit werden.
        </p>
        <SiteLink className="gold-link" to="/ueber-mich">
          Mehr erfahren →
        </SiteLink>
      </div>
    </section>
  );
}
function Home({ lang, items }: { lang: keyof typeof labels; items: Post[] }) {
  const t = labels[lang];
  return (
    <main>
      <section className="hero">
        <div className="hero-fashion" />
        <div className="hero-food" />
        <div className="hero-copy">
          <small>{t.journal}</small>
          <h1>{t.hero}</h1>
          <i>◇</i>
        </div>
      </section>
      <section className="categories">
        <SiteLink className="category fashion" to="/fashion">
          <span>♙</span>
          <h2>Fashion</h2>
          <p>Stil, Entwürfe &amp; persönliche Looks</p>
          <em>{t.discover}</em>
        </SiteLink>
        <SiteLink className="category cooking" to="/cooking">
          <span>♨</span>
          <h2>Cooking</h2>
          <p>Rezepte, Inspiration &amp; kulinarische Ideen</p>
          <em>{t.discover}</em>
        </SiteLink>
      </section>
      <section className="latest">
        <SectionTitle>{t.latest}</SectionTitle>
        <div className="grid">
          {items.map((p) => (
            <PostCard post={p} key={p.slug} />
          ))}
        </div>
        <p className="note">
          Die vorhandenen Beispielbeiträge können später im Redaktionsbereich ersetzt werden.
        </p>
      </section>
      <AboutTeaser />
    </main>
  );
}
function Listing({ category, items }: { category: Category; items: Post[] }) {
  const relevant = items.filter((p) => p.category === category);
  return (
    <main>
      <section className={`page-hero ${category.toLowerCase()}-hero`}>
        <small>Nellis Journal</small>
        <h1>{category}</h1>
        <p>
          {category === "Fashion"
            ? "Entwürfe, Nähprojekte, persönliche Looks und alles, was Nelli rund um Mode inspiriert."
            : "Lieblingsrezepte, neue Ideen und kleine Geschichten aus Nellis Küche."}
        </p>
      </section>
      <section className="listing">
        <SectionTitle>
          {category === "Fashion" ? "Fashion-Geschichten" : "Rezepte & Geschichten"}
        </SectionTitle>
        <div className="listing-grid">
          {relevant.map((p) => (
            <PostCard post={p} key={p.slug} />
          ))}
        </div>
        <div className="future">
          <span>＋</span>
          <h3>Hier wächst die Sammlung weiter</h3>
          <p>Neue Beiträge können später bequem mit Bildern und Texten ergänzt werden.</p>
        </div>
      </section>
    </main>
  );
}
function Article({ post }: { post: Post }) {
  return (
    <main>
      <article className="article">
        <div className="article-head">
          <span>{post.category}</span>
          <h1>{post.title}</h1>
          <p>{post.excerpt}</p>
          <div>
            <time>{post.date}</time>
            <i>◇</i>
            <span>{post.readTime}</span>
          </div>
        </div>
        <img
          className="article-image"
          src={post.image}
          alt={`Titelbild zu „${post.title}“`}
          fetchPriority="high"
        />
        <div className="article-body">
          {post.content.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {post.recipe && (
            <div className="recipe">
              <div className="recipe-facts">
                {post.recipe.prepTime && (
                  <span>
                    <b>Vorbereitung</b>
                    {post.recipe.prepTime}
                  </span>
                )}
                {post.recipe.cookTime && (
                  <span>
                    <b>Kochzeit</b>
                    {post.recipe.cookTime}
                  </span>
                )}
                <span>
                  <b>Dauer</b>
                  {post.recipe.duration}
                </span>
                <span>
                  <b>Portionen</b>
                  {post.recipe.servings}
                </span>
              </div>
              {(post.recipe.dietaryTags?.length ?? 0) > 0 && (
                <div className="detail-tags">
                  {post.recipe.dietaryTags?.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              )}
              <div className="recipe-columns">
                <section>
                  <h2>Zutaten</h2>
                  <ul>
                    {post.recipe.ingredients.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h2>Zubereitung</h2>
                  <ol>
                    {post.recipe.steps.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ol>
                </section>
              </div>
            </div>
          )}
          {post.category === "Fashion" &&
            ((post.materials?.length ?? 0) > 0 ||
              post.difficulty ||
              post.projectStatus ||
              post.fabricAmount ||
              post.patternSource ||
              post.careInstructions) && (
              <div className="project-details">
                <div className="project-facts">
                  {post.projectStatus && (
                    <p>
                      <b>Projektstatus</b>
                      {post.projectStatus}
                    </p>
                  )}
                  {post.fabricAmount && (
                    <p>
                      <b>Stoffmenge</b>
                      {post.fabricAmount}
                    </p>
                  )}
                  {post.patternSource && (
                    <p>
                      <b>Schnitt &amp; Quelle</b>
                      {post.patternSource}
                    </p>
                  )}
                </div>
                {post.difficulty && (
                  <p>
                    <b>Schwierigkeitsgrad</b>
                    {post.difficulty}
                  </p>
                )}
                {(post.materials?.length ?? 0) > 0 && (
                  <>
                    <h2>Materialien</h2>
                    <ul>
                      {post.materials?.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </>
                )}
                {post.careInstructions && (
                  <p>
                    <b>Pflegehinweise</b>
                    {post.careInstructions}
                  </p>
                )}
              </div>
            )}
          {(post.gallery?.length ?? 0) > 0 ? (
            <div className="article-gallery">
              {post.gallery?.map((image, index) => (
                <img
                  src={image}
                  alt={`Galeriebild ${index + 1} zu „${post.title}“`}
                  loading="lazy"
                  decoding="async"
                  key={image}
                />
              ))}
            </div>
          ) : (
            <div className="image-placeholders">
              <div>Weiteres Bild</div>
              <div>Detailaufnahme</div>
            </div>
          )}
          <p className="editor-note">
            Beispielbeitrag – Texte und Bilder werden später durch Nellis eigene Inhalte ersetzt.
          </p>
          <SiteLink className="gold-link" to={`/${post.category.toLowerCase()}`}>
            ← Zurück zu {post.category}
          </SiteLink>
        </div>
      </article>
    </main>
  );
}
function About() {
  return (
    <main>
      <section className="page-hero about-hero">
        <small>Die Person hinter dem Blog</small>
        <h1>Über mich</h1>
        <p>Hier entsteht später Nellis persönliche Vorstellung.</p>
      </section>
      <section className="about-page">
        <div className="portrait-placeholder">
          <span>Foto folgt</span>
        </div>
        <div>
          <small>Hallo, ich bin Nelli</small>
          <h2>Mode, Genuss und Freude am Selbermachen.</h2>
          <p>
            Dieser Bereich ist bereits für ein persönliches Portrait und Nellis eigene Geschichte
            vorbereitet. Wenn Foto und Text feststehen, können sie direkt eingesetzt werden.
          </p>
          <p>
            Bis dahin zeigt die Seite bewusst, wo später persönliche Inhalte ihren Platz finden.
          </p>
        </div>
      </section>
    </main>
  );
}
function Redaktion() {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [adminPosts, setAdminPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [preview, setPreview] = useState<any | null>(null);
  const [category, setCategory] = useState<Category>("Fashion");
  const load = () =>
    fetch("/api/admin/posts", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw 0;
        return r.json();
      })
      .then((d) => {
        setLogged(true);
        setAdminPosts(d);
      })
      .catch(() => setLogged(false));
  useEffect(() => {
    load();
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password }),
    });
    if (r.ok) {
      setPassword("");
      load();
    } else setMessage("Das Passwort ist nicht korrekt.");
  }
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Wird gespeichert …");
    const r = await fetch(editing ? `/api/admin/posts/${editing.id}` : "/api/admin/posts", {
      method: editing ? "PUT" : "POST",
      credentials: "include",
      body: new FormData(e.currentTarget),
    });
    if (r.ok) {
      e.currentTarget.reset();
      setEditing(null);
      setCategory("Fashion");
      setMessage(editing ? "Änderungen wurden gespeichert." : "Beitrag wurde gespeichert.");
      load();
    } else setMessage("Speichern fehlgeschlagen. Bitte Eingaben prüfen.");
  }
  if (!logged)
    return (
      <main className="editor">
        <section className="login-card">
          <span>Geschützter Bereich</span>
          <h1>Redaktion</h1>
          <p>Hier kann Nelli später Beiträge direkt vom Handy erstellen.</p>
          <form onSubmit={login}>
            <label>
              Passwort
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit">Anmelden</button>
          </form>
          {message && <p className="form-message">{message}</p>}
        </section>
      </main>
    );
  return (
    <main className="editor">
      <div className="editor-head">
        <div>
          <span>Geschützter Bereich</span>
          <h1>{editing ? "Beitrag bearbeiten" : "Neuer Beitrag"}</h1>
        </div>
        <button
          onClick={async () => {
            await fetch("/api/logout", { method: "POST", credentials: "include" });
            setLogged(false);
          }}
        >
          Abmelden
        </button>
      </div>
      <form className="post-form" onSubmit={submit} key={editing?.id ?? "new"}>
        <div className="form-grid">
          <label>
            Titel
            <input name="title" required maxLength={140} defaultValue={editing?.title ?? ""} />
          </label>
          <label>
            Kategorie
            <select
              name="category"
              defaultValue={editing?.category ?? "Fashion"}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              <option>Fashion</option>
              <option>Cooking</option>
            </select>
          </label>
        </div>
        <label>
          Kurzbeschreibung
          <textarea
            name="excerpt"
            rows={3}
            required
            maxLength={300}
            defaultValue={editing?.excerpt ?? ""}
          />
        </label>
        <label>
          Beitragstext
          <textarea
            name="content"
            rows={8}
            required
            placeholder="Absätze werden durch Leerzeilen getrennt."
            defaultValue={editing?.content?.join("\n\n") ?? ""}
          />
        </label>
        <div className="form-grid">
          <label>
            Titelbild
            <input
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              required={!editing}
            />
          </label>
          <label>
            Status
            <select name="status" defaultValue={editing?.status ?? "draft"}>
              <option value="draft">Als Entwurf speichern</option>
              <option value="published">Sofort veröffentlichen</option>
            </select>
          </label>
        </div>
        <label>
          Weitere Bilder (bis zu 8)
          <input name="gallery" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        </label>
        {editing?.gallery?.length > 0 && (
          <div className="gallery-manager">
            {editing.gallery.map((image: string) => (
              <label key={image}>
                <img src={image} alt="Vorhandenes Galeriebild" loading="lazy" decoding="async" />
                <span>
                  <input type="checkbox" name="remove_gallery" value={image} /> Bild entfernen
                </span>
              </label>
            ))}
          </div>
        )}
        {category === "Cooking" ? (
          <div className="special-fields">
            <h3>Rezeptdetails</h3>
            <div className="form-grid">
              <label>
                Vorbereitungszeit
                <input
                  name="prep_time"
                  defaultValue={editing?.recipe?.prepTime ?? ""}
                  placeholder="z. B. 15 Minuten"
                />
              </label>
              <label>
                Koch- oder Backzeit
                <input
                  name="cook_time"
                  defaultValue={editing?.recipe?.cookTime ?? ""}
                  placeholder="z. B. 30 Minuten"
                />
              </label>
              <label>
                Gesamtdauer
                <input name="duration" defaultValue={editing?.recipe?.duration ?? ""} />
              </label>
              <label>
                Portionen
                <input name="servings" defaultValue={editing?.recipe?.servings ?? ""} />
              </label>
            </div>
            <label>
              Ernährungs-Tags – einer pro Zeile
              <textarea
                name="dietary_tags"
                rows={3}
                placeholder={"z. B. Vegetarisch\nGlutenfrei"}
                defaultValue={editing?.recipe?.dietaryTags?.join("\n") ?? ""}
              />
            </label>
            <label>
              Zutaten – eine pro Zeile
              <textarea
                name="ingredients"
                rows={6}
                defaultValue={editing?.recipe?.ingredients?.join("\n") ?? ""}
              />
            </label>
            <label>
              Zubereitung – ein Schritt pro Zeile
              <textarea
                name="steps"
                rows={6}
                defaultValue={editing?.recipe?.steps?.join("\n") ?? ""}
              />
            </label>
          </div>
        ) : (
          <div className="special-fields">
            <h3>Fashion-Projektdetails</h3>
            <div className="form-grid">
              <label>
                Projektstatus
                <select name="project_status" defaultValue={editing?.projectStatus ?? ""}>
                  <option value="">Keine Angabe</option>
                  <option>Idee</option>
                  <option>In Arbeit</option>
                  <option>Fertiggestellt</option>
                </select>
              </label>
              <label>
                Schwierigkeitsgrad
                <select name="difficulty" defaultValue={editing?.difficulty ?? ""}>
                  <option value="">Keine Angabe</option>
                  <option>Anfänger</option>
                  <option>Fortgeschritten</option>
                  <option>Anspruchsvoll</option>
                </select>
              </label>
              <label>
                Stoffmenge
                <input
                  name="fabric_amount"
                  defaultValue={editing?.fabricAmount ?? ""}
                  placeholder="z. B. 2,5 m"
                />
              </label>
              <label>
                Schnitt &amp; Quelle
                <input
                  name="pattern_source"
                  defaultValue={editing?.patternSource ?? ""}
                  placeholder="z. B. eigener Schnitt"
                />
              </label>
            </div>
            <label>
              Materialien – eines pro Zeile
              <textarea
                name="materials"
                rows={5}
                defaultValue={editing?.materials?.join("\n") ?? ""}
              />
            </label>
            <label>
              Pflegehinweise
              <textarea
                name="care_instructions"
                rows={3}
                defaultValue={editing?.careInstructions ?? ""}
                placeholder="z. B. bei 30 °C im Schonwaschgang"
              />
            </label>
          </div>
        )}
        <div className="form-actions">
          <button className="primary" type="submit">
            {editing ? "Änderungen speichern" : "Beitrag speichern"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setCategory("Fashion");
              }}
            >
              Abbrechen
            </button>
          )}
        </div>
        {message && <p className="form-message">{message}</p>}
      </form>
      <section className="admin-list">
        <h2>Gespeicherte Beiträge</h2>
        {adminPosts.length === 0 ? (
          <p>Noch keine eigenen Beiträge vorhanden.</p>
        ) : (
          adminPosts.map((p) => (
            <div key={p.id}>
              <div>
                <b>{p.title}</b>
                <span>
                  {p.category} · {p.status === "published" ? "Veröffentlicht" : "Entwurf"}
                </span>
              </div>
              <div className="admin-actions">
                <button
                  onClick={() => {
                    setEditing(p);
                    setCategory(p.category);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Bearbeiten
                </button>
                <button onClick={() => setPreview(p)}>Vorschau</button>
                <button
                  onClick={async () => {
                    await fetch(`/api/admin/posts/${p.id}/status`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({
                        status: p.status === "published" ? "draft" : "published",
                      }),
                    });
                    load();
                  }}
                >
                  {p.status === "published" ? "Zurückziehen" : "Veröffentlichen"}
                </button>
                <button
                  onClick={async () => {
                    if (confirm("Diesen Beitrag wirklich löschen?")) {
                      await fetch(`/api/admin/posts/${p.id}`, {
                        method: "DELETE",
                        credentials: "include",
                      });
                      load();
                    }
                  }}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))
        )}
      </section>
      <section className="password-card">
        <h2>Passwort ändern</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const r = await fetch("/api/admin/password", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ current: form.get("current"), new: form.get("new") }),
            });
            setMessage(
              r.ok
                ? "Passwort wurde geändert."
                : "Passwortänderung fehlgeschlagen. Mindestens 12 Zeichen verwenden.",
            );
            if (r.ok) e.currentTarget.reset();
          }}
        >
          <div className="form-grid">
            <label>
              Aktuelles Passwort
              <input name="current" type="password" required />
            </label>
            <label>
              Neues Passwort
              <input name="new" type="password" minLength={12} required />
            </label>
          </div>
          <button type="submit">Passwort ändern</button>
        </form>
      </section>
      {preview && (
        <div className="preview-modal" role="dialog" aria-modal="true">
          <div>
            <button className="preview-close" onClick={() => setPreview(null)}>
              Schließen
            </button>
            <Article post={preview} />
          </div>
        </div>
      )}
    </main>
  );
}
function NotFound() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Diese Seite gibt es noch nicht.</h1>
      <SiteLink className="gold-link" to="/">
        Zur Startseite →
      </SiteLink>
    </main>
  );
}
function App() {
  const [path, setPath] = useState(location.pathname.replace(/\/$/, "") || "/");
  const [lang, setLang] = useState<keyof typeof labels>(
    () => (localStorage.getItem("lang") as keyof typeof labels) || "DE",
  );
  const [livePosts, setLivePosts] = useState<Post[]>([]);
  useEffect(() => {
    fetch("/api/posts")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLivePosts)
      .catch(() => {});
  }, []);
  useEffect(() => {
    const fn = () => setPath(location.pathname.replace(/\/$/, "") || "/");
    addEventListener("popstate", fn);
    return () => removeEventListener("popstate", fn);
  }, []);
  useEffect(() => localStorage.setItem("lang", lang), [lang]);
  const items = [...livePosts, ...posts];
  let page: React.ReactNode;
  if (path === "/") page = <Home lang={lang} items={items} />;
  else if (path === "/fashion") page = <Listing category="Fashion" items={items} />;
  else if (path === "/cooking") page = <Listing category="Cooking" items={items} />;
  else if (path === "/ueber-mich") page = <About />;
  else if (path === "/redaktion") page = <Redaktion />;
  else if (path.startsWith("/beitrag/")) {
    const post = items.find((p) => `/beitrag/${p.slug}` === path);
    page = post ? <Article post={post} /> : <NotFound />;
  } else page = <NotFound />;
  return (
    <>
      <a className="skip-link" href="#main-content">
        Zum Inhalt springen
      </a>
      <Header lang={lang} setLang={setLang} />
      <div id="main-content">{page}</div>
      <footer>
        <span>Nellis Fashion &amp; Food Blog</span>
        <span>Fashion · Food · Geschichten</span>
        <span>© 2026</span>
      </footer>
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
