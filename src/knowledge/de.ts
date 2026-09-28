import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Wie digitales Audio funktioniert',
    summary: 'Abtastrate, Bittiefe und Kanäle, einfach erklärt.',
    group: 'Grundlagen',
    body: `Schall ist eine Welle aus wechselndem Luftdruck. Ein Mikrofon wandelt diese Welle in ein wechselndes elektrisches Signal um, und Ihr Gerät verwandelt das Signal in Zahlen, damit es gespeichert werden kann.

## Abtastrate

Dazu misst das Gerät das Signal viele tausend Mal pro Sekunde. Jede Messung heißt Abtastwert, und die Zahl der Messungen pro Sekunde ist die Abtastrate, gemessen in Hertz (Hz) oder Kilohertz (kHz).

- 44,1 kHz, also 44.100 Abtastwerte pro Sekunde, ist die Rate von Audio-CDs.
- 48 kHz ist die übliche Rate für Video und für die meiste Audio-Hardware in Computern.

Eine Abtastrate kann Töne bis etwa zur Hälfte ihres eigenen Werts erfassen. Das menschliche Gehör reicht bis ungefähr 20 kHz, deshalb genügen Raten knapp über 40 kHz zum Zuhören.

## Bittiefe

Jeder Abtastwert wird als Zahl gespeichert, und die Bittiefe bestimmt, wie genau diese Zahl sein kann. 16-Bit-Audio, wie auf CDs, erlaubt 65.536 verschiedene Stufen pro Abtastwert. Mehr Bits bedeuten weniger Grundrauschen und mehr Abstand zwischen den leisesten und lautesten Tönen, was im Studio mehr zählt als bei einer Sprachnotiz.

## Kanäle

Mono hat einen Kanal, Stereo zwei. Eine Stereoaufnahme enthält doppelt so viele Daten wie eine gleich lange Monoaufnahme.

## Warum das die Dateigröße beeinflusst

Unkomprimiertes Audio wird schnell groß. Eine Minute Stereo mit 48 kHz und 16 Bit ergibt etwa 11,5 MB. Deshalb komprimieren die meisten Formate Audio, wie der nächste Artikel erklärt.

In Universal Recorder behält ein WAV-Download die Abtastrate, mit der Ihre Aufnahme dekodiert wurde. Diese hängt von der Audio-Hardware Ihres Geräts ab und beträgt meist 48 kHz. Gespeichert wird mit 16 Bit.`,
  },
  {
    id: 'audio-formats',
    title: 'Audio- und Videoformate erklärt',
    summary: 'WebM, MP3, WAV und MP4, und welches Sie wählen sollten.',
    group: 'Grundlagen',
    body: `Universal Recorder kann Ihnen eine Aufnahme in mehreren Formaten geben. Sie unterscheiden sich in Größe, Qualität und darin, wo sie sich abspielen lassen.

## Komprimiert und unkomprimiert

Unkomprimiertes Audio bewahrt jeden Abtastwert genau so, wie er ist, und ist deshalb groß. Komprimierte Formate lassen mithilfe eines Codecs schwer hörbare Details weg, wodurch Dateien um ein Vielfaches kleiner werden. Das nennt man verlustbehaftete Kompression: Weggelassene Details lassen sich nicht zurückholen.

## Die Formate

- **WebM** ist das Format, in dem die meisten Browser Audio direkt aufnehmen, mit einem Codec namens Opus. Es ist das kleinste der drei. Opus klingt auch bei niedriger Bitrate sehr gut, besonders bei Sprache. Moderne Browser und viele Mediaplayer spielen es ab, manche ältere Software jedoch nicht.
- **MP3** ist das am weitesten unterstützte Audioformat überhaupt. Fast jedes Gerät, Autoradio und Schnittprogramm spielt es ab. Die App erzeugt es mit 128 kbit/s, einer guten Alltagsqualität, allerdings größer als WebM beim gleichen Klang.
- **WAV** ist unkomprimiertes 16-Bit-Audio. Es ist mit Abstand am größten, lässt sich aber in praktisch jedem Audio-Editor öffnen. Wählen Sie es, wenn Sie die Aufnahme bearbeiten möchten.

## Woher MP3 und WAV kommen

Ihr Browser nimmt direkt nur in einem Format auf. Wenn Sie als MP3 oder WAV herunterladen, dekodiert die App die Originalaufnahme und kodiert sie neu, auf Ihrem Gerät, im Moment des Herunterladens.

Daraus folgt zweierlei:
- Eine Umwandlung in WAV fügt keine Qualität hinzu, die die Originalaufnahme nicht hatte. Sie macht die Aufnahme leichter bearbeitbar, nicht besser.
- MP3 ist eine zweite verlustbehaftete Kompression zusätzlich zur ersten. Bei den meisten Sprachaufnahmen hören Sie das nicht, doch das Original bleibt immer die getreueste Fassung.

## Bildschirm- und Webcam-Aufnahmen

Aufnahmen mit Video werden als Videodateien gespeichert. Wo der Browser es kann, ist das MP4 mit H.264-Video und AAC-Ton, das sich in den meisten Videoplayern und Präsentationsprogrammen abspielen lässt. Sonst ist die Aufnahme WebM. MP3 und WAV werden nur für Aufnahmen ohne Video angeboten.`,
  },
  {
    id: 'permissions',
    title: 'Berechtigungen für Mikrofon, Kamera und Bildschirm',
    summary: 'Warum Ihr Browser fragt und was zu tun ist, wenn Sie abgelehnt haben.',
    group: 'So funktioniert es',
    body: `Eine Website kann Ihr Mikrofon, Ihre Kamera oder Ihren Bildschirm erst nutzen, wenn Sie es erlauben. Ihr Browser fragt Sie beim ersten Mal, wenn Universal Recorder etwas davon braucht, und zeigt während der Nutzung einen Hinweis an.

## Was wann abgefragt wird

- **Mikrofon**: wenn Sie eine Aufnahme mit Mikrofon starten.
- **Kamera**: wenn Sie eine Aufnahme mit Webcam in der Vorschau ansehen oder starten.
- **Bildschirm**: jedes Mal, wenn Sie Ihren Bildschirm oder den Systemton in der Vorschau ansehen oder aufnehmen, zeigt der Browser eine eigene Auswahl, in der Sie einen ganzen Bildschirm, ein Fenster oder einen einzelnen Tab wählen. Die App kann diese Wahl nicht für Sie treffen.

Solange Sie Mikrofon oder Kamera nicht erlaubt haben, zeigen die Gerätelisten womöglich nur allgemeine Namen. Browser verraten die echten Namen Ihrer Geräte nur Websites, denen Sie die Berechtigung erteilt haben.

## Systemton aufnehmen

Systemton ist der Klang, den Ihr Computer gerade abspielt, etwa ein Anruf oder ein Video. In Chrome und Edge kommt er über die Bildschirmfreigabe: Setzen Sie vor dem Bestätigen das Häkchen für die Audiofreigabe. Firefox und Safari bieten in ihrer Bildschirmauswahl keinen Ton an, daher können sie Ihr Mikrofon aufnehmen, aber nicht den Systemton. Wenn Sie nur den Systemton anfordern, zeigt der Browser trotzdem die Bildschirmauswahl, weil er den Ton nur auf diesem Weg anbietet, doch die App behält das Bild nicht.

Auf Telefonen und Tablets bieten Browser keine Aufnahme von Bildschirm oder Systemton an, dort lässt sich also das Mikrofon aufnehmen.

## Wenn Sie abgelehnt haben

Haben Sie eine Berechtigung blockiert, merkt sich der Browser diese Entscheidung, und die App kann nicht erneut fragen. Um das zu ändern, öffnen Sie in Ihrem Browser die Website-Einstellungen, meist über das Symbol links neben der Webadresse, erlauben Mikrofon oder Kamera für diese Website und laden die Seite neu.

Auf einem Computer muss unter Umständen auch das Betriebssystem Ihrem Browser den Zugriff erlauben:
- **macOS**: Öffnen Sie die Systemeinstellungen, dann Datenschutz & Sicherheit, dann Mikrofon, Kamera oder Bildschirmaufnahme, und aktivieren Sie Ihren Browser.
- **Windows**: Öffnen Sie die Einstellungen, dann Datenschutz und Sicherheit, dann Mikrofon oder Kamera, und stellen Sie sicher, dass Desktop-Apps Zugriff haben.`,
  },
  {
    id: 'how-recording-works',
    title: 'So läuft eine Aufnahme ab',
    summary: 'Was zwischen dem Druck auf Aufnahme und der fertigen Datei passiert.',
    group: 'So funktioniert es',
    body: `In Universal Recorder geschieht alles in Ihrem Browser, auf Ihrem Gerät.

## Auswählen, was aufgenommen wird

Sie können vier Quellen beliebig kombinieren: Ihr Mikrofon, den Systemton, Ihren Bildschirm und Ihre Webcam. Nehmen Sie mehr als eine Tonquelle auf, werden sie zu einer einzigen Tonspur gemischt.

Nehmen Sie Bildschirm und Webcam zusammen auf, wird das Kamerabild als kleines Bild-im-Bild über den Bildschirm gelegt. Sie können Ecke, Größe und Form wählen oder es an die gewünschte Stelle ziehen. Mit der Webcam allein füllt das Kamerabild den ganzen Rahmen.

## Während der Aufnahme

Der eingebaute Rekorder Ihres Browsers erfasst die Quellen und kodiert sie fortlaufend. Sie können pausieren und fortsetzen, mit einer Live-Pegelanzeige prüfen, ob das Mikrofon Sie erfasst, und eine Vorschau jedes Videos sehen.

Lassen Sie den Tab geöffnet, bis Sie auf Stopp drücken. Die Aufnahme wird während der Laufzeit im Tab aufgebaut. Wenn Sie die Seite vor dem Stoppen schließen oder neu laden, geht sie verloren.

## Nach dem Stoppen

Die fertige Aufnahme wird im Speicher Ihres Browsers auf diesem Gerät abgelegt. Dort können Sie sie abspielen, umbenennen, herunterladen oder löschen. In Ihrem Download-Ordner ist sie erst, wenn Sie sie herunterladen.

Ein Download als WebM, oder als MP4 bei einer Videoaufnahme, liefert Ihnen die Datei genau so, wie sie aufgenommen wurde. Mit MP3 oder WAV wird sie in diesem Moment auf Ihrem Gerät umgewandelt.

## Tipps für eine bessere Aufnahme

- Wählen Sie vor dem Start das richtige Mikrofon aus der Liste. Ein Headset oder ein Mikrofon nah am Mund klingt meist klarer als das eingebaute Mikrofon eines Laptops.
- Nehmen Sie ein paar Sekunden auf und hören Sie sie an, bevor es um etwas Wichtiges geht.
- Wenn Sie Mikrofon und Systemton zusammen aufnehmen, tragen Sie Kopfhörer, damit das Mikrofon nicht zusätzlich den Ton Ihrer Lautsprecher aufnimmt.
- Bildschirmaufnahmen werden schnell groß. Reine Audioaufnahmen bleiben klein.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Wo Ihre Aufnahmen gespeichert werden',
    summary: 'In Ihrem Browser, auf diesem Gerät, bis Sie sie löschen.',
    group: 'Datenschutz und Sicherheit',
    body: `Wenn Sie eine Aufnahme beenden, wird sie im eigenen Speicher Ihres Browsers auf diesem Gerät abgelegt, mithilfe einer Funktion namens IndexedDB. Sie wird nirgendwohin hochgeladen.

## Was das bedeutet

- **Sie gehört zu diesem Browser auf diesem Gerät.** Eine Aufnahme, die Sie in Chrome auf Ihrem Laptop gemacht haben, erscheint nicht in einem anderen Browser, auf Ihrem Telefon oder auf einem anderen Computer.
- **Sie ist noch keine Datei in Ihren Ordnern.** Um eine Kopie zu erhalten, die Sie versenden, bearbeiten oder sichern können, nutzen Sie die Download-Schaltfläche und wählen ein Format.
- **Das Löschen von Browserdaten entfernt sie.** Wenn Sie die gespeicherten Daten dieser Website löschen oder ein Aufräumprogramm das tut, verschwinden Ihre Aufnahmen mit. Private oder Inkognito-Fenster verwerfen ihren Speicher in der Regel beim Schließen.
- **Browser begrenzen den Speicher.** Jede Website darf einen Anteil Ihres freien Speicherplatzes nutzen, und lange Bildschirmaufnahmen können viel davon belegen.

## Löschen

Sie können jede Aufnahme aus der Liste löschen oder **Delete all** (alle löschen) verwenden, das vorher eine Bestätigung verlangt. Da diese Aufnahmen nur auf Ihrem Gerät existieren, lässt sich eine gelöschte Aufnahme nicht wiederherstellen.

## Eine Kopie sicher aufbewahren

Der Browserspeicher ist praktisch, aber keine Sicherung. Laden Sie alles, was Ihnen wichtig ist, herunter und bewahren Sie die Datei an einem sicheren Ort auf. Wenn Sie mit einer Universal ID angemeldet sind, können Sie eine Aufnahme auch online behalten, wie der Artikel zum Speichern in der Cloud erklärt.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Eine Aufnahme in der Cloud speichern',
    summary: 'Der einzige, freiwillige Weg, auf dem eine Aufnahme Ihr Gerät verlassen kann.',
    group: 'Datenschutz und Sicherheit',
    body: `Aufnehmen, Umwandeln und Speichern geschehen alle auf Ihrem Gerät. Es gibt genau einen Weg, auf dem eine Aufnahme es verlassen kann: indem Sie bei dieser Aufnahme auf **Save to cloud** (in der Cloud speichern) drücken. Ohne das wird nichts hochgeladen.

## So funktioniert es

- Sie müssen mit einer Universal ID angemeldet sein. Die Erstellung ist kostenlos.
- Jede in der Cloud gespeicherte Aufnahme verbraucht ein Token. Zu Ihrer Universal ID gehört ein kostenloses Recorder-Token, weitere können gekauft werden.
- Wenn Sie die Cloud-Kopie löschen, erhalten Sie das Token zurück.
- Jede Speicherung in der Cloud ist auf 50 MB begrenzt. Das sind Stunden an Audio, aber nur wenige Minuten Bildschirmvideo. Lange Videoaufnahmen können daher nur heruntergeladen werden. Die Größe wird geprüft, bevor ein Token verbraucht wird.
- Schlägt ein Upload fehl, wird das Token automatisch zurückgegeben.

## Wer darauf zugreifen kann

Die Cloud-Kopie liegt in einem privaten Speicher und hat keinen öffentlichen Link. Nur Sie können darauf zugreifen, wenn Sie sich mit der Universal ID anmelden, mit der Sie sie gespeichert haben. Gehört Ihre Universal ID zu einem Unternehmen mit weiteren Personen, hat jede Cloud-Aufnahme im Bereich **In the cloud** ein Kästchen **Share with**. Es ist anfangs nicht angehakt. Haken Sie es an, kann jede Person in Ihrem Unternehmen die Aufnahme abspielen und herunterladen, löschen können aber nur Sie. Entfernen Sie den Haken, ist die Aufnahme wieder privat. Die Übertragung zum Speicher und zurück erfolgt über eine verschlüsselte Verbindung.

## Von einem anderen Gerät aus nutzen

Sobald eine Aufnahme in der Cloud liegt, können Sie sich auf einem anderen Gerät anmelden und sie im Bereich **In the cloud** (in der Cloud) abspielen oder herunterladen. Sie bleibt dort, bis Sie sie löschen.

## Was es nicht ist

Eine Cloud-Speicherung ist die Kopie einer einzelnen Aufnahme, keine Synchronisierung Ihrer ganzen Sammlung. Ihre übrigen Aufnahmen bleiben auf dem Gerät, auf dem Sie sie gemacht haben. Wenn Sie eine Aufnahme auf diesem Gerät löschen, bleibt ihre Cloud-Kopie erhalten, und wenn Sie die Cloud-Kopie löschen, bleibt die Aufnahme auf diesem Gerät erhalten.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'Was Ihr Gerät verlässt',
    summary: 'Nichts, was Sie aufnehmen, es sei denn, Sie speichern es in der Cloud.',
    group: 'Datenschutz und Sicherheit',
    body: `Mikrofon, Kamera und Bildschirm werden von Ihrem eigenen Browser erfasst, aufgenommen und gespeichert. Solange Sie bei einer Aufnahme nicht auf **Save to cloud** drücken, wird nichts davon irgendwohin gesendet: kein Ton, kein Video, keine Vorschau und kein Bildschirmfoto.

Die App transkribiert oder analysiert Ihre Aufnahmen nicht und hat keine Spracherkennung.

## Wofür die App das Internet nutzt

- **Das Laden der App** sowie die Hinweise, was sich mit jedem Update geändert hat.
- **Die Anmeldung mit einer Universal ID**, nur wenn Sie es wünschen. Aufnehmen, Umwandeln und Herunterladen funktionieren ohne Konto.
- **Ein Hinweis, dass die App geöffnet wurde**, einmal pro Besuch, wenn Sie angemeldet sind. Er enthält nichts über Ihre Aufnahmen.
- **Ein „In Benutzung“-Signal**, das alle 45 Sekunden gesendet wird, solange die App geöffnet und auf dem Bildschirm zu sehen ist, damit sie anzeigen kann, wie viele Menschen sie nutzen. Es enthält den Namen der App, eine zufällige, auf diesem Gerät erzeugte ID und Ihr Konto, wenn Sie angemeldet sind.
- **Speicherungen in der Cloud**, nur wenn Sie eine anfordern, wie im Artikel zum Speichern in der Cloud beschrieben.

## Formate umwandeln

Auch die Umwandlung einer Aufnahme in MP3 oder WAV findet auf Ihrem Gerät statt. Sie läuft in der Seite, und dafür wird nichts hochgeladen.

## Selbst überprüfen

Ihr Browser zeigt einen Hinweis an, sobald eine Website Ihr Mikrofon, Ihre Kamera oder Ihren Bildschirm nutzt, und dort können Sie die Freigabe jederzeit beenden. Wenn Sie sichergehen möchten, dass nichts gesendet wird, öffnen Sie die Entwicklertools Ihres Browsers, wechseln Sie zum Tab Netzwerk und machen Sie eine Aufnahme. Sie taucht dort nie auf.`,
  },
]

export default articles
