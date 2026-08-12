import React from "react";
import ReactDOM from "react-dom/client";
import "./style.css";

const posts = [
  ["Fashion","Zeitlose Basics für jeden Tag","15. Mai 2026","https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=85"],
  ["Cooking","Cremige Pilz-Pasta mit frischen Kräutern","12. Mai 2026","https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85"],
  ["Fashion","Frühlingsideen, die bleiben","8. Mai 2026","https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=85"],
  ["Cooking","Beerenkuchen mit Honig & Zitrone","5. Mai 2026","https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=900&q=85"],
  ["Fashion","Mein Guide für einen ruhigen Kleiderschrank","1. Mai 2026","https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85"],
  ["Cooking","Lauwarmer Frühlingssalat","28. April 2026","https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=85"]
];

function Header(){return <header><a className="brand" href="#start">Nellis Fashion &amp; Food Blog</a><nav><a href="#start">Startseite</a><a href="#fashion">Fashion</a><a href="#cooking">Cooking</a><a href="#about">Über mich</a></nav><div className="lang"><b>DE</b> · EN · PL</div></header>}
function App(){return <><Header/><main id="start"><section className="hero"><div className="hero-fashion"/><div className="hero-food"/><div className="hero-copy"><small>Ein persönliches Journal für</small><h1>Mode trifft Genuss</h1><i>◇</i></div></section><section className="categories"><a id="fashion" className="category fashion" href="#posts"><span>♙</span><h2>Fashion</h2><p>Stil, Entwürfe &amp; persönliche Looks</p><em>Entdecken</em></a><a id="cooking" className="category cooking" href="#posts"><span>♨</span><h2>Cooking</h2><p>Rezepte, Inspiration &amp; kulinarische Ideen</p><em>Entdecken</em></a></section><section id="posts" className="latest"><div className="title"><hr/><h2>Neueste Beiträge</h2><hr/></div><div className="grid">{posts.map(([category,title,date,image])=><article key={title}><img src={image} alt="Austauschbares Beispielbild"/><div><b>{category}</b><time>{date}</time></div><h3>{title}</h3></article>)}</div><p className="note">Alle Bilder und Beiträge sind Platzhalter und werden später im Redaktionsbereich ersetzt.</p></section><section id="about" className="about"><div><small>Die Person hinter dem Blog</small><h2>Über Nelli</h2><p>Hier ist später Platz für ein persönliches Foto, ihre Geschichte und die Liebe zu Mode und gutem Essen.</p></div></section></main><footer><span>Nellis Fashion &amp; Food Blog</span><span>Fashion · Food · Geschichten</span><span>© 2026</span></footer></>}
ReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
