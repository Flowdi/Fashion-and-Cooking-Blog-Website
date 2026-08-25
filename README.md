# Nellis Fashion & Food Blog

Persönlicher Fashion- und Cooking-Blog im eleganten Dark-Mode-Design.

**Live:** [nellos-world.de](https://nellos-world.de/)

## Funktionen

- responsive Startseite für Desktop, Tablet und Smartphone
- getrennte Bereiche für Fashion und Cooking
- Übersichtsseiten und einzelne Beitragsseiten
- eigene Rezeptdarstellung mit Zutaten und Zubereitung
- vorbereitete Über-mich-Seite
- Sprachwahl für Deutsch, Englisch und Polnisch
- geschützter Redaktionsbereich unter `/redaktion`
- Bilder direkt vom Smartphone hochladen
- Beiträge als Entwurf speichern oder sofort veröffentlichen
- automatische Bildoptimierung
- Verwaltung und Löschen eigener Beiträge

Die derzeitigen öffentlichen Beispielbilder und Beispieltexte dienen als Platzhalter, bis eigene Inhalte verfügbar sind.

## Lokale Entwicklung

Voraussetzungen: Node.js und npm.

```bash
npm install
npm run dev
```

Produktionsversion erstellen:

```bash
npm run build
```

Die fertigen statischen Dateien werden in `dist/` erzeugt.

## Projektstruktur

```text
src/
  main.tsx            Öffentliche Website und Redaktionsoberfläche
  style.css           Layout und responsive Gestaltung
server/
  app.py              Geschützte API, Beiträge und Bild-Uploads
  requirements.txt    Python-Abhängigkeiten
  nellos-world.service
  nginx-locations.conf
```

## Redaktionsbereich

Der Redaktionsbereich verwendet eine geschützte, serverseitige Sitzung. Beiträge werden in einer SQLite-Datenbank gespeichert, hochgeladene Bilder in einem getrennten Upload-Ordner.

Erforderliche Servervariablen:

```text
NELLOS_ADMIN_PASSWORD_HASH
NELLOS_SESSION_SECRET
NELLOS_DATA_DIR
NELLOS_UPLOAD_DIR
```

Passwörter, Sitzungsschlüssel, Datenbankdateien und hochgeladene Bilder gehören nicht ins Git-Repository.

## Hosting

Die Website läuft auf einem Ubuntu-Server hinter Nginx:

- statische Website: `/var/www/nellos-world.de`
- Beitragsdaten: `/var/lib/nellos-world`
- Redaktionsdienst: Gunicorn über `127.0.0.1:8765`
- HTTPS: Let's Encrypt mit automatischer Erneuerung

Die Nginx-Konfiguration ist separat von anderen Websites auf demselben Server angelegt.
