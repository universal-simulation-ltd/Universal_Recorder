import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Comment fonctionne l’audio numérique',
    summary: 'Fréquence d’échantillonnage, résolution et canaux, expliqués simplement.',
    group: 'Les bases',
    body: `Le son est une onde de pression d’air qui varie. Un micro transforme cette onde en un signal électrique variable, et votre appareil convertit ce signal en nombres pour pouvoir le stocker.

## La fréquence d’échantillonnage

Pour cela, l’appareil mesure le signal plusieurs milliers de fois par seconde. Chaque mesure s’appelle un échantillon, et le nombre de mesures par seconde est la fréquence d’échantillonnage, exprimée en hertz (Hz) ou en kilohertz (kHz).

- 44,1 kHz, soit 44 100 échantillons par seconde, est la fréquence utilisée sur les CD audio.
- 48 kHz est la fréquence habituelle pour la vidéo et pour la plupart du matériel audio des ordinateurs.

Une fréquence d’échantillonnage peut capter des sons jusqu’à environ la moitié de sa propre valeur. L’oreille humaine plafonne autour de 20 kHz, ce qui explique pourquoi une fréquence d’un peu plus de 40 kHz suffit pour l’écoute.

## La résolution

Chaque échantillon est stocké sous forme de nombre, et la résolution (en bits) détermine la précision de ce nombre. L’audio 16 bits, celui des CD, permet 65 536 niveaux différents par échantillon. Davantage de bits signifie moins de souffle de fond et plus de marge entre les sons les plus faibles et les plus forts, ce qui compte davantage en studio que pour un mémo vocal.

## Les canaux

Le mono comporte un canal et la stéréo deux. Un enregistrement stéréo contient deux fois plus de données qu’un enregistrement mono de même durée.

## Pourquoi cela compte pour la taille des fichiers

L’audio non compressé prend vite de la place. Une minute de stéréo à 48 kHz en 16 bits représente environ 11,5 Mo. C’est pourquoi la plupart des formats compressent l’audio, comme l’explique l’article suivant.

Dans Universal Recorder, un téléchargement au format WAV conserve la fréquence à laquelle votre enregistrement a été décodé, qui dépend du matériel audio de votre appareil et vaut généralement 48 kHz, et l’enregistre en 16 bits.`,
  },
  {
    id: 'audio-formats',
    title: 'Les formats audio et vidéo expliqués',
    summary: 'WebM, MP3, WAV et MP4, et lequel choisir.',
    group: 'Les bases',
    body: `Universal Recorder peut vous fournir un enregistrement dans plusieurs formats. Ils diffèrent par leur taille, leur qualité et leur compatibilité.

## Compressé ou non compressé

L’audio non compressé conserve chaque échantillon tel quel, ce qui le rend volumineux. Les formats compressés utilisent un codec pour écarter les détails difficiles à entendre, ce qui rend les fichiers bien plus petits. On parle de compression avec perte : une fois les détails écartés, on ne peut plus les récupérer.

## Les formats

- **WebM** est le format dans lequel la plupart des navigateurs enregistrent directement l’audio, avec un codec appelé Opus. C’est le plus léger des trois. Opus sonne très bien à faible débit, surtout pour la voix. Les navigateurs récents et de nombreux lecteurs le prennent en charge, mais certains logiciels anciens non.
- **MP3** est le format audio le plus largement pris en charge. Presque tous les appareils, autoradios et logiciels de montage le lisent. L’application le produit à 128 kbit/s, une bonne qualité pour un usage courant, mais plus lourde que le WebM pour le même son.
- **WAV** est de l’audio 16 bits non compressé. C’est de loin le plus volumineux, mais il s’ouvre dans pratiquement tous les éditeurs audio : c’est donc celui à choisir si vous comptez retravailler l’enregistrement.

## D’où viennent le MP3 et le WAV

Votre navigateur n’enregistre directement que dans un seul format. Lorsque vous téléchargez en MP3 ou en WAV, l’application décode l’enregistrement d’origine et l’encode à nouveau, sur votre appareil, au moment du téléchargement.

Deux conséquences :
- Convertir en WAV n’ajoute pas de qualité que l’enregistrement d’origine n’avait pas. Cela le rend plus facile à éditer, pas meilleur.
- Le MP3 ajoute une seconde compression avec perte à la première. Pour la plupart des enregistrements de voix, vous ne l’entendrez pas, mais l’original reste toujours la copie la plus fidèle.

## Enregistrements d’écran et de webcam

Les enregistrements qui contiennent de la vidéo sont sauvegardés sous forme de fichiers vidéo. Lorsque le navigateur le permet, il s’agit de MP4 avec de la vidéo H.264 et du son AAC, lisible dans la plupart des lecteurs vidéo et logiciels de présentation. Sinon, l’enregistrement est en WebM. Le MP3 et le WAV ne sont proposés que pour les enregistrements sans vidéo.`,
  },
  {
    id: 'permissions',
    title: 'Autorisations du micro, de la caméra et de l’écran',
    summary: 'Pourquoi votre navigateur vous le demande, et que faire si vous avez refusé.',
    group: 'Fonctionnement',
    body: `Un site web ne peut pas utiliser votre micro, votre caméra ou votre écran sans votre accord. Votre navigateur vous le demande la première fois qu’Universal Recorder en a besoin, et affiche un indicateur pendant leur utilisation.

## Ce qui est demandé, et quand

- **Micro** : lorsque vous lancez un enregistrement qui inclut le micro.
- **Caméra** : lorsque vous prévisualisez ou lancez un enregistrement qui inclut la webcam.
- **Écran** : chaque fois que vous prévisualisez ou enregistrez votre écran ou le son du système, le navigateur affiche son propre sélecteur pour que vous choisissiez un écran entier, une fenêtre ou un seul onglet. L’application ne peut pas faire ce choix à votre place.

Tant que vous n’avez pas autorisé le micro ou la caméra, les listes d’appareils peuvent afficher des noms génériques. Les navigateurs ne révèlent le vrai nom de vos appareils qu’aux sites que vous avez autorisés.

## Enregistrer le son du système

Le son du système, c’est ce que votre ordinateur diffuse, par exemple un appel ou une vidéo. Dans Chrome et Edge, il passe par le sélecteur de partage d’écran : cochez l’option de partage de l’audio avant de confirmer. Firefox et Safari ne proposent pas le son dans leur sélecteur d’écran : ils peuvent enregistrer votre micro, mais pas le son du système. Si vous ne demandez que le son du système, le navigateur affiche tout de même le sélecteur d’écran, car c’est le seul moyen qu’il offre pour obtenir le son, mais l’application ne conserve pas l’image.

Sur les téléphones et les tablettes, les navigateurs ne permettent pas de capturer l’écran ni le son du système : c’est donc le micro qui peut y être enregistré.

## Si vous avez refusé

Si vous avez bloqué une autorisation, le navigateur retient ce choix et l’application ne peut plus la redemander. Pour le modifier, ouvrez les paramètres du site dans votre navigateur, généralement via l’icône à gauche de l’adresse web, autorisez le micro ou la caméra pour ce site, puis actualisez la page.

Sur un ordinateur, le système d’exploitation doit parfois aussi autoriser votre navigateur :
- **macOS** : ouvrez Réglages Système, puis Confidentialité et sécurité, puis Micro, Caméra ou Enregistrement de l’écran, et activez votre navigateur.
- **Windows** : ouvrez Paramètres, puis Confidentialité et sécurité, puis Microphone ou Caméra, et vérifiez que les applications de bureau y ont accès.`,
  },
  {
    id: 'how-recording-works',
    title: 'Comment se déroule un enregistrement',
    summary: 'Ce qui se passe entre l’appui sur Enregistrer et l’obtention d’un fichier.',
    group: 'Fonctionnement',
    body: `Tout, dans Universal Recorder, se passe dans votre navigateur, sur votre appareil.

## Choisir ce que vous enregistrez

Vous pouvez combiner librement quatre sources : votre micro, le son du système, votre écran et votre webcam. Si vous enregistrez plusieurs sources sonores, elles sont mixées en une seule bande-son.

Si vous enregistrez l’écran et la webcam ensemble, l’image de la caméra est placée sur l’écran en incrustation. Vous pouvez choisir son coin, sa taille et sa forme, ou la faire glisser où vous le souhaitez. Avec la webcam seule, la caméra occupe tout le cadre.

## Pendant l’enregistrement

L’enregistreur intégré à votre navigateur capte les sources et les encode au fur et à mesure. Vous pouvez mettre en pause et reprendre, surveiller un indicateur de niveau en direct pour vérifier que le micro vous capte, et voir un aperçu de toute vidéo.

Laissez l’onglet ouvert jusqu’à ce que vous appuyiez sur Arrêter. L’enregistrement se construit dans l’onglet pendant qu’il tourne : fermer ou actualiser la page avant d’arrêter le fait perdre.

## Quand vous arrêtez

L’enregistrement terminé est sauvegardé dans le stockage de votre navigateur, sur cet appareil. Vous pouvez alors l’écouter, le renommer, le télécharger ou le supprimer. Il ne se trouve pas dans votre dossier Téléchargements tant que vous ne l’avez pas téléchargé.

Le téléchargement en WebM, ou en MP4 pour un enregistrement vidéo, vous donne le fichier exactement tel qu’il a été enregistré. Choisir MP3 ou WAV le convertit sur votre appareil à ce moment-là.

## Conseils pour un meilleur enregistrement

- Choisissez le bon micro dans la liste avant de commencer. Un casque ou un micro proche de votre bouche donne en général un son plus clair que le micro intégré d’un portable.
- Enregistrez quelques secondes et réécoutez-les avant toute chose importante.
- Si vous enregistrez à la fois votre micro et le son du système, portez un casque pour que le micro ne capte pas aussi le son de vos haut-parleurs.
- Les enregistrements d’écran grossissent vite. Les enregistrements audio seuls restent légers.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Où sont conservés vos enregistrements',
    summary: 'Dans votre navigateur, sur cet appareil, jusqu’à ce que vous les supprimiez.',
    group: 'Confidentialité et sécurité',
    body: `Quand vous arrêtez l’enregistrement, celui-ci est sauvegardé dans le stockage propre à votre navigateur, sur cet appareil, grâce à une fonctionnalité appelée IndexedDB. Il n’est envoyé nulle part.

## Ce que cela signifie

- **Il appartient à ce navigateur, sur cet appareil.** Un enregistrement réalisé dans Chrome sur votre portable n’apparaîtra pas dans un autre navigateur, sur votre téléphone ou sur un autre ordinateur.
- **Ce n’est pas encore un fichier dans vos dossiers.** Pour obtenir une copie à envoyer, à éditer ou à sauvegarder, utilisez le bouton de téléchargement et choisissez un format.
- **Effacer les données du navigateur le supprime.** Si vous effacez les données stockées pour ce site, ou si un outil de nettoyage le fait, vos enregistrements disparaissent avec elles. Les fenêtres de navigation privée effacent généralement leur stockage à leur fermeture.
- **Les navigateurs limitent le stockage.** Chaque site dispose d’une part de votre espace disque libre, et de longs enregistrements d’écran peuvent en utiliser beaucoup.

## Supprimer

Vous pouvez supprimer n’importe quel enregistrement de la liste, ou utiliser **Delete all** (tout supprimer), qui vous demande d’abord de confirmer. Comme ces enregistrements n’existent que sur votre appareil, un enregistrement supprimé ne peut pas être récupéré.

## Garder une copie en sécurité

Le stockage du navigateur est pratique, mais ce n’est pas une sauvegarde. Pour tout ce qui compte, téléchargez l’enregistrement et gardez le fichier en lieu sûr. Si vous êtes connecté avec un Universal ID, vous pouvez aussi conserver un enregistrement en ligne, comme l’explique l’article sur l’enregistrement dans le cloud.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Enregistrer un enregistrement dans le cloud',
    summary: 'La seule façon, facultative, dont un enregistrement peut quitter votre appareil.',
    group: 'Confidentialité et sécurité',
    body: `L’enregistrement, la conversion et le stockage se font tous sur votre appareil. Il n’existe qu’un seul moyen pour qu’un enregistrement le quitte : appuyer sur **Save to cloud** (enregistrer dans le cloud) pour cet enregistrement. Rien n’est envoyé si vous ne le faites pas.

## Comment cela fonctionne

- Vous devez être connecté avec un Universal ID. La création d’un compte est gratuite.
- Chaque enregistrement conservé dans le cloud utilise un jeton. Votre Universal ID comprend un jeton Recorder gratuit, et vous pouvez en acheter d’autres.
- Supprimer la copie dans le cloud vous rend le jeton.
- Chaque enregistrement dans le cloud est limité à 50 Mo. Cela représente des heures d’audio, mais seulement quelques minutes de vidéo d’écran : les longs enregistrements vidéo restent donc à télécharger uniquement. La taille est vérifiée avant l’utilisation de tout jeton.
- Si un envoi échoue, le jeton vous est rendu automatiquement.

## Qui peut y accéder

La copie dans le cloud est conservée dans un espace de stockage privé et n’a pas de lien public. On ne peut y accéder qu’en se connectant, et seulement si l’on est membre de l’organisation Universal ID sous laquelle elle a été enregistrée. Si vous partagez cette organisation avec d’autres personnes, par exemple une équipe, elles peuvent aussi y accéder. Elle transite vers et depuis le stockage par une connexion chiffrée.

## L’utiliser depuis un autre appareil

Une fois un enregistrement dans le cloud, vous pouvez vous connecter sur un autre appareil et l’écouter ou le télécharger depuis le panneau **In the cloud** (dans le cloud). Il y reste jusqu’à ce que vous le supprimiez.

## Ce que ce n’est pas

Un enregistrement dans le cloud est la copie d’un seul enregistrement, pas une synchronisation de toute votre bibliothèque. Vos autres enregistrements restent sur l’appareil où vous les avez réalisés. Supprimer un enregistrement de cet appareil ne supprime pas sa copie dans le cloud, et supprimer la copie dans le cloud ne supprime pas celle de cet appareil.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'Ce qui quitte votre appareil',
    summary: 'Rien de ce que vous enregistrez, sauf si vous choisissez le cloud.',
    group: 'Confidentialité et sécurité',
    body: `Votre micro, votre caméra et votre écran sont captés, enregistrés et sauvegardés par votre propre navigateur. Sauf si vous appuyez sur **Save to cloud** pour un enregistrement, rien n’est envoyé nulle part : ni audio, ni vidéo, ni aperçu, ni capture d’écran.

L’application ne transcrit pas et n’analyse pas vos enregistrements, et elle ne comporte aucune reconnaissance vocale.

## Ce pour quoi l’application utilise internet

- **Le chargement de l’application**, ainsi que les notes sur les nouveautés de chaque mise à jour.
- **La connexion avec un Universal ID**, uniquement si vous le souhaitez. Vous pouvez enregistrer, convertir et télécharger sans compte.
- **Une note indiquant que l’application a été ouverte**, envoyée une fois par visite si vous êtes connecté. Elle ne contient rien sur vos enregistrements.
- **Un signal « en cours d’utilisation »**, envoyé toutes les 45 secondes tant que l’application est ouverte et affichée, pour qu’elle puisse indiquer combien de personnes l’utilisent. Il contient le nom de l’application, un identifiant aléatoire créé sur cet appareil, et votre compte si vous êtes connecté.
- **Les enregistrements dans le cloud**, uniquement lorsque vous en demandez un, comme décrit dans l’article consacré au cloud.

## Convertir les formats

La conversion d’un enregistrement en MP3 ou en WAV se fait elle aussi sur votre appareil. Elle s’exécute dans la page, et rien n’est envoyé pour la réaliser.

## Vérifier par vous-même

Votre navigateur affiche un indicateur chaque fois qu’un site utilise votre micro, votre caméra ou votre écran, et vous pouvez arrêter le partage à tout moment depuis celui-ci. Pour vous assurer que rien n’est envoyé, ouvrez les outils de développement de votre navigateur, passez à l’onglet Réseau et faites un enregistrement : il n’y apparaît jamais.`,
  },
]

export default articles
