# Beschreibung

Bitte gib eine kurze Zusammenfassung der Änderung und erläutere, welches Problem damit behoben wird. Beschreibe auch die Motivation und den Kontext. Liste ggf. alle Abhängigkeiten auf, die durch diese Änderung erforderlich sind.

Fixes # (Issue)

## Art der Änderung

Bitte wähle die zutreffende(n) Option(en) aus:

- [ ] Fehlerbehebung (non-breaking change, behebt ein Problem)
- [ ] Neue Funktion (non-breaking change, fügt Funktionalität hinzu)
- [ ] Breaking Change (Änderung, die bestehende Funktionalität bricht)
- [ ] Diese Änderung erfordert eine Aktualisierung der Dokumentation

---

# Wie wurde die Änderung getestet?

Bitte beschreibe die durchgeführten Tests, um die Änderung zu verifizieren. Gib Anweisungen, wie wir die Tests reproduzieren können, und beschreibe relevante Details zur Testkonfiguration.

**Testkonfiguration:**
- Node-Version:
- Betriebssystem:

---

# Checkliste

- [ ] Keine Geheimnisse (z. B. Passwörter, Tokens, API-Keys) im Klartext im Pull Request enthalten
- [ ] Der Titel des Pull Requests ist wie folgt formatiert: `[ISSUE-XXXX] – Kurze Beschreibung` oder `<type>: Kurze Beschreibung`, wobei `ISSUE-XXXX` durch die entsprechende Ticketnummer aus dem Ticketsystem ersetzt wird.
      Best Practice: Verwende den Issue-Titel im PR-Titel und in der ersten Zeile der Commit-Message.
- [ ] Code folgt den Projekt-Konventionen
- [ ] Selbst-Review des Codes wurde durchgeführt
- [ ] Entsprechende Dokumentation wurde aktualisiert
- [ ] Neue und bestehende Tests laufen erfolgreich durch
- [ ] Für die Release Notes ist der Pull Request mit mindestens einem der bekannten Labels versehen:
  - **feat** / **feature**: Neue Features oder Verbesserungen (minor-Version)
  - **fix**: Fehlerbehebung (patch-Version)
  - **docs**: Dokumentation ergänzt/geändert
  - **style**: Änderungen ohne Einfluss auf Funktionalität (Formatierung, Leerzeichen etc.)
  - **refactor**: Code-Umstrukturierung ohne Bugfix oder neues Feature
  - **perf**: Performance-Verbesserung
  - **test**: Hinzufügen/Korrigieren von Tests
  - **build**: Änderungen am Buildsystem oder an Abhängigkeiten
  - **ci**: Änderungen an CI-Konfiguration/-Skripten
  - **chore**: Sonstige Änderungen
  - **revert**: Änderung zurücknehmen

**Hinweis:** Wenn dein Branch mit einem dieser Präfixe erstellt wurde, wird das Label automatisch gesetzt.  
Beispiel: Ist der Quell-Branch `feat/<branch-name>`, erhält der PR automatisch das Label `feature`.
