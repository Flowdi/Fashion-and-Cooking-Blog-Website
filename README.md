# Nellis Fashion & Food Blog

Persönlicher Fashion- und Cooking-Blog im eleganten Dark-Mode-Design.

**Live:** [nellos-world.de](https://nellos-world.de/)

Die Website verbindet ein öffentliches Online-Journal mit einem geschützten Redaktionsbereich. Neue Fashion-Projekte und Rezepte lassen sich dadurch ohne Änderungen am Quellcode direkt vom Smartphone oder Computer veröffentlichen.

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
- bestehende Beiträge bearbeiten, veröffentlichen oder zurückziehen
- Vorschau für Entwürfe und veröffentlichte Beiträge
- bis zu acht zusätzliche Galeriebilder pro Beitrag
- strukturierte Rezeptfelder für Vorbereitungs-, Koch- und Gesamtdauer, Portionen, Ernährungs-Tags, Zutaten und Schritte
- strukturierte Fashion-Felder für Projektstatus, Schwierigkeitsgrad, Stoffmenge, Schnittquelle, Materialien und Pflegehinweise
- automatische Bildoptimierung
- Verwaltung und Löschen eigener Beiträge
- Passwort direkt im Redaktionsbereich ändern
- tägliche automatische Sicherung von Datenbank und Bildern

Die derzeitigen öffentlichen Beispielbilder und Beispieltexte dienen als Platzhalter, bis eigene Inhalte verfügbar sind.

## Redaktionsbereich verwenden

Der geschützte Bereich ist unter [nellos-world.de/redaktion](https://nellos-world.de/redaktion) erreichbar.

1. Mit dem Redaktionspasswort anmelden.
2. Titel, Kategorie, Kurzbeschreibung und Beitragstext eintragen.
3. Ein Titelbild und bei Bedarf bis zu acht Galeriebilder auswählen.
4. Die passenden Rezept- oder Fashion-Angaben ergänzen.
5. Den Beitrag zunächst als Entwurf speichern oder direkt veröffentlichen.

Gespeicherte Beiträge können anschließend in der Vorschau kontrolliert, bearbeitet, veröffentlicht, zurückgezogen oder gelöscht werden. Das Passwort lässt sich ebenfalls im Redaktionsbereich ändern.

## Technik

- React und TypeScript für Website und Redaktionsoberfläche
- Vite für Entwicklung und Produktions-Build
- Flask und Gunicorn für die geschützte Beitrags-API
- SQLite für Beiträge, Status und Einstellungen
- Pillow zur Prüfung und Optimierung hochgeladener Bilder
- Nginx als Webserver und Reverse Proxy
- systemd für den API-Dienst und die täglichen Backups

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

TypeScript, CSS und Konfigurationsdateien einheitlich formatieren:

```bash
npm run format
```

Der Python-Dienst folgt dem Formatierungsstil von [Black](https://black.readthedocs.io/).

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

Die Anmeldung ist gegen wiederholte Fehlversuche begrenzt. Sitzungs-Cookies sind nur über HTTPS erreichbar und können nicht durch JavaScript ausgelesen werden.

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
- Backups: `/var/backups/nellos-world`, Aufbewahrung 30 Tage

Gunicorn ist ausschließlich über die lokale Serveradresse erreichbar. Öffentliche Anfragen laufen verschlüsselt über Nginx und die Domain.

Die Nginx-Konfiguration und alle Website-Dateien sind separat von `floriandumler.de` angelegt. Ein Deployment von Nellos World überschreibt die andere Website daher nicht.
