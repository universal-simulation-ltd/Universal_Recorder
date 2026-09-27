import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Cómo funciona el audio digital',
    summary: 'Frecuencia de muestreo, profundidad de bits y canales, explicados con sencillez.',
    group: 'Lo básico',
    body: `El sonido es una onda de presión del aire que va cambiando. Un micrófono convierte esa onda en una señal eléctrica variable, y su dispositivo convierte la señal en números para poder guardarla.

## Frecuencia de muestreo

Para ello, el dispositivo mide la señal miles de veces por segundo. Cada medición se llama muestra, y el número de muestras por segundo es la frecuencia de muestreo, que se mide en hercios (Hz) o kilohercios (kHz).

- 44,1 kHz, es decir, 44.100 muestras por segundo, es la frecuencia de los CD de audio.
- 48 kHz es la frecuencia habitual en vídeo y en la mayoría del hardware de audio de los ordenadores.

Una frecuencia de muestreo puede captar sonidos de hasta aproximadamente la mitad de su propio valor. El oído humano llega a unos 20 kHz como máximo, y por eso una frecuencia de algo más de 40 kHz basta para escuchar.

## Profundidad de bits

Cada muestra se guarda como un número, y la profundidad de bits decide lo preciso que puede ser ese número. El audio de 16 bits, el de los CD, permite 65.536 niveles distintos por muestra. Más bits suponen menos ruido de fondo y más margen entre los sonidos más suaves y los más fuertes, algo que importa más en un estudio que en una nota de voz.

## Canales

El mono tiene un canal y el estéreo, dos. Una grabación en estéreo contiene el doble de datos que una en mono de la misma duración.

## Por qué influye en el tamaño del archivo

El audio sin comprimir ocupa mucho enseguida. Un minuto en estéreo a 48 kHz y 16 bits ocupa unos 11,5 MB. Por eso la mayoría de los formatos comprimen el audio, como explica el artículo siguiente.

En Universal Recorder, una descarga en WAV mantiene la frecuencia con la que se descodificó su grabación, que depende del hardware de audio de su dispositivo y suele ser de 48 kHz, y la guarda en 16 bits.`,
  },
  {
    id: 'audio-formats',
    title: 'Formatos de audio y vídeo',
    summary: 'WebM, MP3, WAV y MP4, y cuál elegir.',
    group: 'Lo básico',
    body: `Universal Recorder puede darle una grabación en varios formatos. Se diferencian en tamaño, calidad y en dónde se pueden reproducir.

## Comprimido y sin comprimir

El audio sin comprimir conserva cada muestra tal cual, lo que lo hace pesado. Los formatos comprimidos usan un códec para descartar detalles difíciles de oír, y así los archivos ocupan muchas veces menos. Se llama compresión con pérdida: una vez descartado el detalle, no se puede recuperar.

## Los formatos

- **WebM** es el formato en el que la mayoría de los navegadores graban el audio directamente, con un códec llamado Opus. Es el más ligero de los tres. Opus suena muy bien con tasas de bits bajas, sobre todo con la voz. Los navegadores modernos y muchos reproductores lo admiten, aunque algunos programas antiguos no.
- **MP3** es el formato de audio más compatible que existe. Casi cualquier dispositivo, equipo de coche o programa de edición lo reproduce. La aplicación lo genera a 128 kbps, una buena calidad para el día a día, aunque ocupa más que el WebM para el mismo sonido.
- **WAV** es audio de 16 bits sin comprimir. Es con diferencia el más pesado, pero se abre en prácticamente cualquier editor de audio, así que es el que conviene elegir si piensa editar la grabación.

## De dónde salen el MP3 y el WAV

Su navegador solo graba directamente en un formato. Cuando descarga en MP3 o WAV, la aplicación descodifica la grabación original y la vuelve a codificar, en su dispositivo, en el momento de la descarga.

De ahí se derivan dos cosas:
- Convertir a WAV no añade una calidad que la grabación original no tenía. La hace más fácil de editar, no mejor.
- El MP3 añade una segunda compresión con pérdida sobre la primera. En la mayoría de las grabaciones de voz no lo notará, pero el original es siempre la copia más fiel.

## Grabaciones de pantalla y de cámara web

Las grabaciones con vídeo se guardan como archivos de vídeo. Cuando el navegador lo permite, se trata de MP4 con vídeo H.264 y sonido AAC, que se reproduce en la mayoría de reproductores de vídeo y programas de presentaciones. Si no, la grabación es WebM. El MP3 y el WAV solo se ofrecen para grabaciones sin vídeo.`,
  },
  {
    id: 'permissions',
    title: 'Permisos de micrófono, cámara y pantalla',
    summary: 'Por qué pregunta su navegador y qué hacer si dijo que no.',
    group: 'Cómo funciona',
    body: `Un sitio web no puede usar su micrófono, su cámara ni su pantalla hasta que usted lo permita. Su navegador se lo pregunta la primera vez que Universal Recorder necesita cada uno, y muestra un indicador mientras están en uso.

## Qué se pide y cuándo

- **Micrófono**: al iniciar una grabación que incluya el micrófono.
- **Cámara**: al previsualizar o iniciar una grabación que incluya la cámara web.
- **Pantalla**: cada vez que previsualiza o graba su pantalla o el audio del sistema, el navegador muestra su propio selector para que elija una pantalla completa, una ventana o una sola pestaña. La aplicación no puede elegir por usted.

Hasta que permita el micrófono o la cámara, las listas de dispositivos pueden mostrar nombres genéricos. Los navegadores solo revelan el nombre real de sus dispositivos a los sitios a los que ha dado permiso.

## Grabar el audio del sistema

El audio del sistema es el sonido que reproduce su ordenador, como una llamada o un vídeo. En Chrome y Edge llega a través del selector para compartir pantalla: marque la opción de compartir el audio antes de confirmar. Firefox y Safari no ofrecen sonido en su selector de pantalla, así que pueden grabar su micrófono, pero no el audio del sistema. Si solo pide el audio del sistema, el navegador muestra igualmente el selector de pantalla, porque es la única vía que ofrece para el sonido, pero la aplicación no guarda la imagen.

En teléfonos y tabletas, los navegadores no permiten capturar la pantalla ni el audio del sistema, así que allí lo que se puede grabar es el micrófono.

## Si dijo que no

Si bloqueó un permiso, el navegador recuerda esa decisión y la aplicación no puede volver a pedirlo. Para cambiarlo, abra la configuración del sitio en su navegador, normalmente desde el icono a la izquierda de la dirección web, permita el micrófono o la cámara para este sitio y vuelva a cargar la página.

En un ordenador, puede que el sistema operativo también tenga que permitir que su navegador los use:
- **macOS**: abra Ajustes del Sistema, luego Privacidad y seguridad, luego Micrófono, Cámara o Grabación de pantalla, y active su navegador.
- **Windows**: abra Configuración, luego Privacidad y seguridad, luego Micrófono o Cámara, y compruebe que las aplicaciones de escritorio tienen acceso.`,
  },
  {
    id: 'how-recording-works',
    title: 'Cómo funciona la grabación',
    summary: 'Qué ocurre entre pulsar grabar y tener un archivo.',
    group: 'Cómo funciona',
    body: `Todo en Universal Recorder ocurre dentro de su navegador, en su dispositivo.

## Elegir qué grabar

Puede grabar cualquier combinación de cuatro fuentes: su micrófono, el audio del sistema, su pantalla y su cámara web. Si graba más de una fuente de sonido, se mezclan en una sola pista.

Si graba la pantalla y la cámara web a la vez, la imagen de la cámara se coloca sobre la pantalla en un pequeño recuadro. Puede elegir su esquina, su tamaño y su forma, o arrastrarlo a donde quiera. Con la cámara web sola, la cámara ocupa todo el encuadre.

## Mientras graba

La grabadora integrada en su navegador capta las fuentes y las codifica sobre la marcha. Puede pausar y reanudar, vigilar un medidor de nivel en directo para comprobar que el micrófono le capta y ver una vista previa de cualquier vídeo.

Mantenga la pestaña abierta hasta que pulse detener. La grabación se va construyendo dentro de la pestaña mientras dura, así que cerrar o recargar la página antes de detenerla hace que se pierda.

## Al detener

La grabación terminada se guarda en el almacenamiento de su navegador, en este dispositivo. Desde ahí puede reproducirla, cambiarle el nombre, descargarla o eliminarla. No estará en su carpeta de descargas hasta que la descargue.

Descargar en WebM, o en MP4 si es una grabación de vídeo, le da el archivo exactamente como se grabó. Elegir MP3 o WAV lo convierte en su dispositivo en ese momento.

## Consejos para grabar mejor

- Elija el micrófono adecuado en la lista antes de empezar. Unos auriculares con micrófono o un micrófono cerca de la boca suelen sonar más claros que el integrado de un portátil.
- Grabe unos segundos y escúchelos antes de algo importante.
- Si graba a la vez su micrófono y el audio del sistema, use auriculares para que el micrófono no capte también el sonido de sus altavoces.
- Las grabaciones de pantalla crecen deprisa. Las grabaciones solo de audio siguen siendo pequeñas.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Dónde se guardan sus grabaciones',
    summary: 'En su navegador, en este dispositivo, hasta que las elimine.',
    group: 'Privacidad y seguridad',
    body: `Cuando detiene la grabación, esta se guarda en el almacenamiento propio de su navegador, en este dispositivo, mediante una función llamada IndexedDB. No se sube a ninguna parte.

## Qué significa

- **Pertenece a este navegador en este dispositivo.** Una grabación hecha en Chrome en su portátil no aparecerá en otro navegador, en su teléfono ni en otro ordenador.
- **Todavía no es un archivo en sus carpetas.** Para tener una copia que pueda enviar, editar o guardar como respaldo, use el botón de descarga y elija un formato.
- **Borrar los datos del navegador la elimina.** Si borra los datos almacenados de este sitio, o lo hace una herramienta de limpieza, sus grabaciones se van con ellos. Las ventanas privadas o de incógnito suelen descartar su almacenamiento al cerrarse.
- **Los navegadores limitan el almacenamiento.** Cada sitio dispone de una parte de su espacio libre en disco, y las grabaciones de pantalla largas pueden ocupar mucho.

## Eliminar

Puede eliminar cualquier grabación de la lista, o usar **Delete all** (eliminar todo), que primero le pide confirmación. Como estas grabaciones solo existen en su dispositivo, una grabación eliminada no se puede recuperar.

## Guardar una copia segura

El almacenamiento del navegador es cómodo, pero no es una copia de seguridad. Para todo lo que le importe, descárguelo y guarde el archivo en un lugar seguro. Si ha iniciado sesión con un Universal ID, también puede guardar una grabación en línea, como explica el artículo sobre guardar en la nube.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Guardar una grabación en la nube',
    summary: 'La única forma, opcional, de que una grabación salga de su dispositivo.',
    group: 'Privacidad y seguridad',
    body: `Grabar, convertir y almacenar ocurre siempre en su dispositivo. Solo hay una forma de que una grabación salga de él: pulsar **Save to cloud** (guardar en la nube) en esa grabación. No se sube nada si usted no lo hace.

## Cómo funciona

- Tiene que haber iniciado sesión con un Universal ID. Crearlo es gratis.
- Cada grabación guardada en la nube usa un token. Su Universal ID incluye un token gratuito de Recorder, y se pueden comprar más.
- Al eliminar la copia en la nube, recupera el token.
- Cada guardado en la nube está limitado a 50 MB. Eso son horas de audio, pero solo unos minutos de vídeo de pantalla, así que las grabaciones de vídeo largas solo se pueden descargar. El tamaño se comprueba antes de usar ningún token.
- Si una subida falla, el token se devuelve automáticamente.

## Quién puede acceder

La copia en la nube se guarda en un almacenamiento privado y no tiene enlace público. Solo se puede acceder a ella iniciando sesión, y solo si se es miembro de la organización de Universal ID con la que se guardó. Si comparte esa organización con otras personas, por ejemplo un equipo, ellas también pueden acceder. Viaja hacia y desde el almacenamiento mediante una conexión cifrada.

## Usarla desde otro dispositivo

Cuando una grabación está en la nube, puede iniciar sesión en otro dispositivo y reproducirla o descargarla desde el panel **In the cloud** (en la nube). Permanece allí hasta que la elimine.

## Lo que no es

Un guardado en la nube es una copia de una sola grabación, no una sincronización de toda su biblioteca. Sus otras grabaciones se quedan en el dispositivo donde las hizo. Eliminar una grabación de este dispositivo no elimina su copia en la nube, y eliminar la copia en la nube no elimina la de este dispositivo.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'Qué sale de su dispositivo',
    summary: 'Nada de lo que graba, salvo que decida guardarlo en la nube.',
    group: 'Privacidad y seguridad',
    body: `Su micrófono, su cámara y su pantalla los capta, graba y guarda su propio navegador. Salvo que pulse **Save to cloud** en una grabación, nada se envía a ninguna parte: ni audio, ni vídeo, ni vista previa, ni captura de pantalla.

La aplicación no transcribe ni analiza sus grabaciones, y no tiene reconocimiento de voz.

## Para qué usa internet la aplicación

- **Cargar la aplicación**, y las notas sobre las novedades de cada actualización.
- **Iniciar sesión con un Universal ID**, solo si usted quiere. Puede grabar, convertir y descargar sin cuenta.
- **Un aviso de que se abrió la aplicación**, enviado una vez por visita si ha iniciado sesión. No incluye nada sobre sus grabaciones.
- **Una señal de «en uso»**, enviada cada 45 segundos mientras la aplicación está abierta y en pantalla, para poder mostrar cuántas personas la usan. Contiene el nombre de la aplicación, un identificador aleatorio creado en este dispositivo y su cuenta si ha iniciado sesión.
- **Los guardados en la nube**, solo cuando usted pide uno, como se describe en el artículo sobre guardar en la nube.

## Convertir formatos

Convertir una grabación a MP3 o WAV también ocurre en su dispositivo. La conversión se ejecuta en la página y no se sube nada para hacerla.

## Compruébelo usted mismo

Su navegador muestra un indicador siempre que un sitio usa su micrófono, su cámara o su pantalla, y desde ahí puede dejar de compartir en cualquier momento. Si quiere asegurarse de que no se envía nada, abra las herramientas para desarrolladores de su navegador, vaya a la pestaña Red y haga una grabación: nunca aparece allí.`,
  },
]

export default articles
