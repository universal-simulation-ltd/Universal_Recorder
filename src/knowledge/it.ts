import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Come funziona l’audio digitale',
    summary: 'Frequenza di campionamento, profondità in bit e canali, spiegati in parole semplici.',
    group: 'Le basi',
    body: `Il suono è un’onda di pressione dell’aria che cambia continuamente. Un microfono trasforma quest’onda in un segnale elettrico variabile, e il tuo dispositivo trasforma il segnale in numeri per poterlo salvare.

## Frequenza di campionamento

Per farlo, il dispositivo misura il segnale migliaia di volte al secondo. Ogni misura si chiama campione, e il numero di campioni al secondo è la frequenza di campionamento, misurata in hertz (Hz) o kilohertz (kHz).

- 44,1 kHz, cioè 44.100 campioni al secondo, è la frequenza usata nei CD audio.
- 48 kHz è la frequenza abituale per il video e per la maggior parte dell’hardware audio dei computer.

Una frequenza di campionamento può catturare suoni fino a circa la metà del proprio valore. L’udito umano arriva al massimo intorno ai 20 kHz, ed è per questo che una frequenza di poco superiore ai 40 kHz basta per l’ascolto.

## Profondità in bit

Ogni campione viene salvato come un numero, e la profondità in bit decide quanto preciso può essere. L’audio a 16 bit, quello dei CD, permette 65.536 livelli diversi per ogni campione. Più bit significano meno fruscio di fondo e più margine tra i suoni più deboli e quelli più forti, cosa che conta più in uno studio che per un memo vocale.

## Canali

Il mono ha un canale, lo stereo due. Una registrazione stereo contiene il doppio dei dati di una mono della stessa durata.

## Perché conta per la dimensione dei file

L’audio non compresso occupa spazio in fretta. Un minuto di stereo a 48 kHz e 16 bit occupa circa 11,5 MB. Per questo la maggior parte dei formati comprime l’audio, come spiega l’articolo successivo.

In Universal Recorder, un download in WAV mantiene la frequenza con cui la registrazione è stata decodificata, che dipende dall’hardware audio del tuo dispositivo ed è di solito 48 kHz, e la salva a 16 bit.`,
  },
  {
    id: 'audio-formats',
    title: 'I formati audio e video spiegati',
    summary: 'WebM, MP3, WAV e MP4, e quale scegliere.',
    group: 'Le basi',
    body: `Universal Recorder può darti una registrazione in diversi formati. Cambiano per dimensione, qualità e compatibilità.

## Compresso e non compresso

L’audio non compresso conserva ogni campione esattamente com’è, e per questo è pesante. I formati compressi usano un codec per tralasciare i dettagli difficili da sentire, così i file diventano molte volte più piccoli. Si chiama compressione con perdita: una volta tralasciato, il dettaglio non si può più recuperare.

## I formati

- **WebM** è il formato in cui la maggior parte dei browser registra l’audio direttamente, con un codec chiamato Opus. È il più leggero dei tre. Opus suona molto bene anche a bitrate bassi, soprattutto con la voce. I browser moderni e molti lettori multimediali lo riproducono, ma alcuni programmi più vecchi no.
- **MP3** è il formato audio più compatibile in assoluto. Quasi ogni dispositivo, autoradio e programma di montaggio lo riproduce. L’app lo crea a 128 kbps, una buona qualità per l’uso quotidiano, anche se più pesante del WebM a parità di suono.
- **WAV** è audio a 16 bit non compresso. È di gran lunga il più pesante, ma si apre in praticamente qualsiasi editor audio, quindi è quello da scegliere se pensi di modificare la registrazione.

## Da dove vengono MP3 e WAV

Il tuo browser registra direttamente in un solo formato. Quando scarichi in MP3 o WAV, l’app decodifica la registrazione originale e la codifica di nuovo, sul tuo dispositivo, nel momento in cui la scarichi.

Ne derivano due cose:
- Convertire in WAV non aggiunge una qualità che la registrazione originale non aveva. La rende più facile da modificare, non migliore.
- L’MP3 aggiunge una seconda compressione con perdita alla prima. Nella maggior parte delle registrazioni vocali non lo sentirai, ma l’originale resta sempre la copia più fedele.

## Registrazioni dello schermo e della webcam

Le registrazioni con video vengono salvate come file video. Quando il browser lo permette, si tratta di MP4 con video H.264 e audio AAC, che si riproduce nella maggior parte dei lettori video e dei programmi di presentazione. Altrimenti la registrazione è in WebM. MP3 e WAV sono disponibili solo per le registrazioni senza video.`,
  },
  {
    id: 'permissions',
    title: 'Permessi per microfono, fotocamera e schermo',
    summary: 'Perché il browser te li chiede, e cosa fare se hai detto di no.',
    group: 'Come funziona',
    body: `Un sito web non può usare il tuo microfono, la tua fotocamera o il tuo schermo finché non glielo permetti. Il browser te lo chiede la prima volta che Universal Recorder ne ha bisogno, e mostra un indicatore mentre sono in uso.

## Cosa viene chiesto, e quando

- **Microfono**: quando avvii una registrazione che include il microfono.
- **Fotocamera**: quando visualizzi l’anteprima o avvii una registrazione che include la webcam.
- **Schermo**: ogni volta che visualizzi l’anteprima o registri lo schermo o l’audio di sistema, il browser mostra il proprio selettore, così puoi scegliere uno schermo intero, una finestra o una singola scheda. L’app non può scegliere al posto tuo.

Finché non hai consentito il microfono o la fotocamera, gli elenchi dei dispositivi potrebbero mostrare nomi generici. I browser rivelano i nomi reali dei tuoi dispositivi solo ai siti a cui hai dato il permesso.

## Registrare l’audio di sistema

L’audio di sistema è il suono che il computer sta riproducendo, per esempio una chiamata o un video. In Chrome ed Edge arriva tramite il selettore di condivisione dello schermo: spunta l’opzione per condividere l’audio prima di confermare. Firefox e Safari non offrono l’audio nel loro selettore, quindi possono registrare il microfono ma non l’audio di sistema. Se chiedi solo l’audio di sistema, il browser mostra comunque il selettore dello schermo, perché è l’unico modo in cui offre il suono, ma l’app non conserva l’immagine.

Su telefoni e tablet, i browser non permettono di catturare lo schermo o l’audio di sistema, quindi lì si può registrare il microfono.

## Se hai detto di no

Se hai bloccato un permesso, il browser ricorda la tua scelta e l’app non può chiederlo di nuovo. Per cambiarla, apri le impostazioni del sito nel browser, di solito dall’icona a sinistra dell’indirizzo web, consenti il microfono o la fotocamera per questo sito e poi ricarica la pagina.

Su un computer, può darsi che anche il sistema operativo debba permettere al browser di usarli:
- **macOS**: apri Impostazioni di Sistema, poi Privacy e sicurezza, poi Microfono, Fotocamera o Registrazione schermo, e attiva il tuo browser.
- **Windows**: apri Impostazioni, poi Privacy e sicurezza, poi Microfono o Fotocamera, e assicurati che le app desktop abbiano l’accesso.`,
  },
  {
    id: 'how-recording-works',
    title: 'Come funziona la registrazione',
    summary: 'Cosa succede tra la pressione di Registra e il file finito.',
    group: 'Come funziona',
    body: `In Universal Recorder tutto avviene nel tuo browser, sul tuo dispositivo.

## Scegliere cosa registrare

Puoi registrare qualsiasi combinazione di quattro sorgenti: il microfono, l’audio di sistema, lo schermo e la webcam. Se registri più di una sorgente audio, vengono mixate in un’unica traccia.

Se registri insieme schermo e webcam, l’immagine della fotocamera viene sovrapposta allo schermo in un piccolo riquadro. Puoi sceglierne l’angolo, la dimensione e la forma, oppure trascinarlo dove vuoi. Con la sola webcam, l’immagine della fotocamera riempie l’inquadratura.

## Durante la registrazione

Il registratore integrato nel browser cattura le sorgenti e le codifica man mano. Puoi mettere in pausa e riprendere, tenere d’occhio un indicatore di livello in tempo reale per verificare che il microfono ti senta, e vedere un’anteprima di qualsiasi video.

Tieni aperta la scheda finché non premi stop. La registrazione viene costruita dentro la scheda mentre è in corso, quindi chiudere o ricaricare la pagina prima di fermarla la fa perdere.

## Quando ti fermi

La registrazione finita viene salvata nello spazio di archiviazione del browser, su questo dispositivo. Da lì puoi riascoltarla, rinominarla, scaricarla o eliminarla. Non si trova nella cartella dei download finché non la scarichi.

Scaricarla in WebM, o in MP4 per una registrazione video, ti dà il file esattamente com’è stato registrato. Scegliere MP3 o WAV la converte sul tuo dispositivo in quel momento.

## Consigli per registrare meglio

- Scegli il microfono giusto dall’elenco prima di iniziare. Delle cuffie con microfono o un microfono vicino alla bocca di solito suonano più chiari di quello integrato di un portatile.
- Registra qualche secondo e riascoltalo prima di qualcosa di importante.
- Se registri insieme il microfono e l’audio di sistema, usa le cuffie, così il microfono non capta anche il suono degli altoparlanti.
- Le registrazioni dello schermo crescono in fretta. Quelle solo audio restano piccole.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Dove vengono conservate le registrazioni',
    summary: 'Nel tuo browser, su questo dispositivo, finché non le elimini.',
    group: 'Privacy e sicurezza',
    body: `Quando interrompi la registrazione, questa viene salvata nello spazio di archiviazione del browser, su questo dispositivo, tramite una funzione chiamata IndexedDB. Non viene caricata da nessuna parte.

## Cosa significa

- **Appartiene a questo browser, su questo dispositivo.** Una registrazione fatta in Chrome sul tuo portatile non compare in un altro browser, sul telefono o su un altro computer.
- **Non è ancora un file nelle tue cartelle.** Per avere una copia da inviare, modificare o salvare altrove, usa il pulsante di download e scegli un formato.
- **Cancellare i dati del browser la elimina.** Se cancelli i dati salvati per questo sito, o lo fa uno strumento di pulizia, le registrazioni se ne vanno con loro. Le finestre private o in incognito di solito eliminano il loro spazio quando le chiudi.
- **I browser limitano lo spazio.** Ogni sito può usare una parte dello spazio libero sul disco, e le registrazioni dello schermo lunghe possono occuparne molto.

## Eliminare

Puoi eliminare qualsiasi registrazione dall’elenco, oppure usare **Delete all** (elimina tutto), che prima ti chiede conferma. Dato che queste registrazioni esistono solo sul tuo dispositivo, una registrazione eliminata non si può recuperare.

## Tenere una copia al sicuro

Lo spazio del browser è comodo, ma non è un backup. Per tutto ciò che conta, scaricalo e conserva il file in un posto sicuro. Se hai effettuato l’accesso con un Universal ID, puoi anche tenere una registrazione online, come spiega l’articolo sul salvataggio nel cloud.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Salvare una registrazione nel cloud',
    summary: 'L’unico modo, facoltativo, in cui una registrazione può lasciare il dispositivo.',
    group: 'Privacy e sicurezza',
    body: `Registrare, convertire e archiviare avvengono tutti sul tuo dispositivo. C’è un solo modo in cui una registrazione può lasciarlo: premere **Save to cloud** (salva nel cloud) su quella registrazione. Se non lo fai, non viene caricato nulla.

## Come funziona

- Devi aver effettuato l’accesso con un Universal ID. Crearne uno è gratuito.
- Ogni registrazione tenuta nel cloud usa un token. Il tuo Universal ID include un token Recorder gratuito, e se ne possono acquistare altri.
- Eliminare la copia nel cloud ti restituisce il token.
- Ogni salvataggio nel cloud è limitato a 50 MB. Sono ore di audio ma solo pochi minuti di video dello schermo, quindi le registrazioni video lunghe restano solo da scaricare. La dimensione viene controllata prima di usare qualsiasi token.
- Se un caricamento non va a buon fine, il token viene restituito automaticamente.

## Chi può accedervi

La copia nel cloud è conservata in uno spazio privato e non ha un link pubblico. Si può raggiungere solo effettuando l’accesso, e solo da parte dei membri dell’organizzazione Universal ID con cui è stata salvata. Se condividi quell’organizzazione con altre persone, per esempio un team, anche loro possono accedervi. Viaggia da e verso lo spazio di archiviazione tramite una connessione cifrata.

## Usarla da un altro dispositivo

Quando una registrazione è nel cloud, puoi accedere da un altro dispositivo e riprodurla o scaricarla dal pannello **In the cloud** (nel cloud). Resta lì finché non la elimini.

## Cosa non è

Un salvataggio nel cloud è la copia di una sola registrazione, non una sincronizzazione di tutta la tua libreria. Le altre registrazioni restano sul dispositivo su cui le hai fatte. Eliminare una registrazione da questo dispositivo non elimina la sua copia nel cloud, ed eliminare la copia nel cloud non elimina quella su questo dispositivo.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'Cosa esce dal tuo dispositivo',
    summary: 'Niente di ciò che registri, a meno che tu non scelga di salvarlo nel cloud.',
    group: 'Privacy e sicurezza',
    body: `Microfono, fotocamera e schermo vengono catturati, registrati e salvati dal tuo browser. A meno che tu non prema **Save to cloud** su una registrazione, niente viene inviato da nessuna parte: né audio, né video, né anteprime, né screenshot.

L’app non trascrive e non analizza le tue registrazioni, e non ha alcun riconoscimento vocale.

## Per cosa l’app usa internet

- **Il caricamento dell’app**, e le note sulle novità di ogni aggiornamento.
- **L’accesso con un Universal ID**, solo se lo scegli. Puoi registrare, convertire e scaricare senza un account.
- **Una nota che l’app è stata aperta**, inviata una volta per visita se hai effettuato l’accesso. Non contiene nulla sulle tue registrazioni.
- **Un segnale «in uso»**, inviato ogni 45 secondi mentre l’app è aperta e visibile sullo schermo, così può mostrare quante persone la stanno usando. Contiene il nome dell’app, un ID casuale creato su questo dispositivo e il tuo account se hai effettuato l’accesso.
- **I salvataggi nel cloud**, solo quando ne chiedi uno, come descritto nell’articolo sul salvataggio nel cloud.

## Convertire i formati

Anche la conversione di una registrazione in MP3 o WAV avviene sul tuo dispositivo. Viene eseguita nella pagina e non viene caricato nulla per farla.

## Verifica da solo

Il browser mostra un indicatore ogni volta che un sito usa il microfono, la fotocamera o lo schermo, e da lì puoi interrompere la condivisione in qualsiasi momento. Se vuoi essere sicuro che non venga inviato nulla, apri gli strumenti per sviluppatori del browser, passa alla scheda Rete e fai una registrazione: lì non compare mai.`,
  },
]

export default articles
