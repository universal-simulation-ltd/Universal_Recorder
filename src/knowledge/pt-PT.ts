import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Como funciona o áudio digital',
    summary: 'Frequência de amostragem, profundidade de bits e canais, explicados de forma simples.',
    group: 'O essencial',
    body: `O som é uma onda de pressão do ar que vai variando. Um microfone transforma essa onda num sinal elétrico variável, e o seu dispositivo transforma o sinal em números para o poder guardar.

## Frequência de amostragem

Para isso, o dispositivo mede o sinal milhares de vezes por segundo. Cada medição chama-se amostra, e o número de amostras por segundo é a frequência de amostragem, medida em hertz (Hz) ou quilohertz (kHz).

- 44,1 kHz, ou 44 100 amostras por segundo, é a frequência usada nos CD de áudio.
- 48 kHz é a frequência habitual no vídeo e na maior parte do hardware de áudio dos computadores.

Uma frequência de amostragem consegue captar sons até cerca de metade do seu próprio valor. A audição humana chega, no máximo, a cerca de 20 kHz, e é por isso que frequências um pouco acima dos 40 kHz bastam para ouvir.

## Profundidade de bits

Cada amostra é guardada como um número, e a profundidade de bits define a precisão desse número. O áudio de 16 bits, usado nos CD, permite 65 536 níveis diferentes por amostra. Mais bits significam menos ruído de fundo e mais margem entre os sons mais baixos e os mais altos, o que conta mais num estúdio do que numa nota de voz.

## Canais

O mono tem um canal e o estéreo tem dois. Uma gravação estéreo contém o dobro dos dados de uma gravação mono com a mesma duração.

## Porque é que isto conta para o tamanho do ficheiro

O áudio sem compressão cresce depressa. Um minuto de estéreo a 48 kHz e 16 bits ocupa cerca de 11,5 MB. É por isso que a maioria dos formatos comprime o áudio, como explica o artigo seguinte.

No Universal Recorder, uma transferência em WAV mantém a frequência a que a sua gravação foi descodificada, que depende do hardware de áudio do seu dispositivo e é normalmente de 48 kHz, e guarda-a em 16 bits.`,
  },
  {
    id: 'audio-formats',
    title: 'Formatos de áudio e vídeo explicados',
    summary: 'WebM, MP3, WAV e MP4, e qual escolher.',
    group: 'O essencial',
    body: `O Universal Recorder pode dar-lhe uma gravação em vários formatos. Diferem no tamanho, na qualidade e nos sítios onde podem ser reproduzidos.

## Com e sem compressão

O áudio sem compressão guarda cada amostra exatamente como é, o que o torna grande. Os formatos comprimidos usam um codec para deixar de fora detalhes difíceis de ouvir, o que torna os ficheiros muitas vezes mais pequenos. Chama-se compressão com perdas: depois de o detalhe ser retirado, não pode ser reposto.

## Os formatos

- **WebM** é o formato em que a maioria dos browsers grava o áudio diretamente, com um codec chamado Opus. É o mais pequeno dos três. O Opus soa muito bem com taxas de bits baixas, sobretudo na voz. Os browsers modernos e muitos leitores multimédia reproduzem-no, embora algum software mais antigo não o faça.
- **MP3** é o formato de áudio mais compatível que existe. Quase todos os dispositivos, autorrádios e programas de edição o reproduzem. A aplicação cria-o a 128 kbps, uma boa qualidade para o dia a dia, mas maior do que o WebM para o mesmo som.
- **WAV** é áudio de 16 bits sem compressão. É de longe o maior, mas abre em praticamente qualquer editor de áudio, por isso é o formato a escolher se pretende editar a gravação.

## De onde vêm o MP3 e o WAV

O seu browser grava diretamente num único formato. Quando transfere em MP3 ou WAV, a aplicação descodifica a gravação original e volta a codificá-la, no seu dispositivo, no momento da transferência.

Daqui resultam duas coisas:
- Converter para WAV não acrescenta qualidade que a gravação original não tinha. Torna-a mais fácil de editar, não melhor.
- O MP3 é uma segunda compressão com perdas por cima da primeira. Na maioria das gravações de voz não vai notar, mas o original é sempre a cópia mais fiel.

## Gravações de ecrã e de webcam

As gravações com vídeo são guardadas como ficheiros de vídeo. Quando o browser o permite, trata-se de MP4 com vídeo H.264 e som AAC, que é reproduzido na maioria dos leitores de vídeo e programas de apresentações. Caso contrário, a gravação é WebM. O MP3 e o WAV só são disponibilizados para gravações sem vídeo.`,
  },
  {
    id: 'permissions',
    title: 'Permissões de microfone, câmara e ecrã',
    summary: 'Porque é que o browser pergunta e o que fazer se recusou.',
    group: 'Como funciona',
    body: `Um site não pode usar o seu microfone, a sua câmara ou o seu ecrã até que o permita. O browser pergunta-lhe da primeira vez que o Universal Recorder precisa de cada um e mostra um indicador enquanto estão a ser usados.

## O que é pedido, e quando

- **Microfone**: quando inicia uma gravação que inclui o microfone.
- **Câmara**: quando pré-visualiza ou inicia uma gravação que inclui a webcam.
- **Ecrã**: sempre que pré-visualiza ou grava o ecrã ou o áudio do sistema, o browser mostra o seu próprio seletor para escolher um ecrã inteiro, uma janela ou um único separador. A aplicação não pode fazer essa escolha por si.

Enquanto não permitir o microfone ou a câmara, as listas de dispositivos podem mostrar nomes genéricos. Os browsers só revelam os nomes reais dos seus dispositivos aos sites a que deu autorização.

## Gravar o áudio do sistema

O áudio do sistema é o som que o computador está a reproduzir, como uma chamada ou um vídeo. No Chrome e no Edge chega através do seletor de partilha de ecrã: assinale a opção de partilhar o áudio antes de confirmar. O Firefox e o Safari não oferecem som no seletor de ecrã, por isso gravam o seu microfone, mas não o áudio do sistema. Se pedir apenas o áudio do sistema, o browser mostra na mesma o seletor de ecrã, porque é a única forma que oferece para o som, mas a aplicação não guarda a imagem.

Em telemóveis e tablets, os browsers não permitem capturar o ecrã nem o áudio do sistema, por isso o que se pode gravar aí é o microfone.

## Se recusou

Se bloqueou uma permissão, o browser memoriza essa escolha e a aplicação não pode voltar a pedir. Para a alterar, abra as definições do site no browser, normalmente através do ícone à esquerda do endereço, permita o microfone ou a câmara para este site e recarregue a página.

Num computador, o sistema operativo também pode ter de autorizar o browser:
- **macOS**: abra as Definições do Sistema, depois Privacidade e segurança, depois Microfone, Câmara ou Gravação do ecrã, e ative o seu browser.
- **Windows**: abra as Definições, depois Privacidade e segurança, depois Microfone ou Câmara, e confirme que as aplicações de ambiente de trabalho têm acesso.`,
  },
  {
    id: 'how-recording-works',
    title: 'Como funciona a gravação',
    summary: 'O que acontece entre carregar em gravar e ter um ficheiro.',
    group: 'Como funciona',
    body: `No Universal Recorder, tudo acontece dentro do seu browser, no seu dispositivo.

## Escolher o que gravar

Pode gravar qualquer combinação de quatro fontes: o microfone, o áudio do sistema, o ecrã e a webcam. Se gravar mais do que uma fonte de som, são misturadas numa única faixa.

Se gravar o ecrã e a webcam em conjunto, a imagem da câmara é colocada sobre o ecrã num pequeno quadro. Pode escolher o canto, o tamanho e a forma, ou arrastá-lo para onde quiser. Só com a webcam, a câmara ocupa o enquadramento inteiro.

## Durante a gravação

O gravador incorporado no browser capta as fontes e codifica-as à medida que grava. Pode pausar e retomar, acompanhar um medidor de nível em tempo real para confirmar que o microfone o está a captar, e ver uma pré-visualização de qualquer vídeo.

Mantenha o separador aberto até carregar em parar. A gravação vai sendo construída dentro do separador enquanto decorre, por isso fechar ou recarregar a página antes de parar faz com que se perca.

## Quando para

A gravação terminada é guardada no armazenamento do browser, neste dispositivo. A partir daí, pode ouvi-la, mudar-lhe o nome, transferi-la ou eliminá-la. Não está na sua pasta de transferências enquanto não a transferir.

Transferir em WebM, ou em MP4 no caso de uma gravação com vídeo, dá-lhe o ficheiro exatamente como foi gravado. Escolher MP3 ou WAV converte-o no seu dispositivo nesse momento.

## Dicas para uma gravação melhor

- Escolha o microfone certo na lista antes de começar. Uns auscultadores com microfone ou um microfone perto da boca soam normalmente mais claros do que o microfone incorporado de um portátil.
- Grave alguns segundos e ouça-os antes de algo importante.
- Se gravar o microfone e o áudio do sistema em conjunto, use auscultadores para que o microfone não capte também o som das colunas.
- As gravações de ecrã crescem depressa. As gravações só de áudio continuam pequenas.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Onde ficam guardadas as suas gravações',
    summary: 'No seu browser, neste dispositivo, até as eliminar.',
    group: 'Privacidade e segurança',
    body: `Quando para de gravar, a gravação é guardada no armazenamento do próprio browser, neste dispositivo, através de uma funcionalidade chamada IndexedDB. Não é enviada para lado nenhum.

## O que isto significa

- **Pertence a este browser, neste dispositivo.** Uma gravação feita no Chrome do seu portátil não aparece noutro browser, no seu telemóvel nem noutro computador.
- **Ainda não é um ficheiro nas suas pastas.** Para ter uma cópia que possa enviar, editar ou guardar como cópia de segurança, use o botão de transferência e escolha um formato.
- **Limpar os dados do browser apaga-a.** Se limpar os dados guardados deste site, ou se uma ferramenta de limpeza o fizer, as suas gravações vão com eles. As janelas privadas ou anónimas costumam descartar o armazenamento quando são fechadas.
- **Os browsers limitam o armazenamento.** Cada site pode usar uma parte do espaço livre do disco, e as gravações de ecrã longas podem ocupar bastante.

## Eliminar

Pode eliminar qualquer gravação da lista, ou usar **Delete all** (eliminar tudo), que pede confirmação primeiro. Como estas gravações só existem no seu dispositivo, uma gravação eliminada não pode ser recuperada.

## Guardar uma cópia em segurança

O armazenamento do browser é prático, mas não é uma cópia de segurança. Para tudo o que for importante, transfira a gravação e guarde o ficheiro num local seguro. Se tiver sessão iniciada com um Universal ID, também pode manter uma gravação online, como explica o artigo sobre guardar na nuvem.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Guardar uma gravação na nuvem',
    summary: 'A única forma, opcional, de uma gravação sair do seu dispositivo.',
    group: 'Privacidade e segurança',
    body: `Gravar, converter e armazenar acontece tudo no seu dispositivo. Há apenas uma forma de uma gravação sair dele: carregar em **Save to cloud** (guardar na nuvem) nessa gravação. Se não o fizer, nada é enviado.

## Como funciona

- Tem de ter sessão iniciada com um Universal ID. Criar um é gratuito.
- Cada gravação mantida na nuvem usa um token. O seu Universal ID inclui um token gratuito do Recorder, e é possível comprar mais.
- Eliminar a cópia na nuvem devolve-lhe o token.
- Cada gravação guardada na nuvem está limitada a 50 MB. São horas de áudio, mas apenas alguns minutos de vídeo de ecrã, por isso as gravações de vídeo longas ficam só para transferir. O tamanho é verificado antes de ser usado qualquer token.
- Se um envio falhar, o token é devolvido automaticamente.

## Quem lhe pode aceder

A cópia na nuvem fica num armazenamento privado e não tem ligação pública. Só pode ser acedida com sessão iniciada, e apenas por membros da organização Universal ID em que foi guardada. Se partilhar essa organização com outras pessoas, como uma equipa, também elas lhe podem aceder. Circula de e para o armazenamento através de uma ligação cifrada.

## Usar noutro dispositivo

Depois de uma gravação estar na nuvem, pode iniciar sessão noutro dispositivo e ouvi-la ou transferi-la a partir do painel **In the cloud** (na nuvem). Fica lá até a eliminar.

## O que não é

Guardar na nuvem é guardar a cópia de uma gravação, não sincronizar toda a sua biblioteca. As outras gravações ficam no dispositivo onde as fez. Eliminar uma gravação deste dispositivo não elimina a cópia na nuvem, e eliminar a cópia na nuvem não elimina a deste dispositivo.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'O que sai do seu dispositivo',
    summary: 'Nada do que grava, a não ser que opte por guardar na nuvem.',
    group: 'Privacidade e segurança',
    body: `O microfone, a câmara e o ecrã são captados, gravados e guardados pelo seu próprio browser. A não ser que carregue em **Save to cloud** numa gravação, nada é enviado para lado nenhum: nem áudio, nem vídeo, nem pré-visualização, nem captura de ecrã.

A aplicação não transcreve nem analisa as suas gravações, e não tem reconhecimento de voz.

## Para que é que a aplicação usa a internet

- **Carregar a aplicação**, e as notas sobre o que mudou em cada atualização.
- **Iniciar sessão com um Universal ID**, apenas se quiser. Pode gravar, converter e transferir sem conta.
- **Uma nota de que a aplicação foi aberta**, enviada uma vez por visita se tiver sessão iniciada. Não inclui nada sobre as suas gravações.
- **Um sinal de «em utilização»**, enviado a cada 45 segundos enquanto a aplicação está aberta e visível no ecrã, para poder mostrar quantas pessoas a estão a usar. Contém o nome da aplicação, um ID aleatório criado neste dispositivo e a sua conta, se tiver sessão iniciada.
- **Gravações guardadas na nuvem**, apenas quando pede uma, como descrito no artigo sobre guardar na nuvem.

## Converter formatos

Converter uma gravação em MP3 ou WAV também acontece no seu dispositivo. A conversão é feita na própria página, e nada é enviado para a fazer.

## Confirme por si

O browser mostra um indicador sempre que um site usa o seu microfone, a sua câmara ou o seu ecrã, e a partir daí pode parar a partilha a qualquer momento. Se quiser ter a certeza de que nada é enviado, abra as ferramentas de programador do browser, passe para o separador Rede e faça uma gravação: nunca aparece lá.`,
  },
]

export default articles
