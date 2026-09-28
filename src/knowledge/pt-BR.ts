import type { Article } from './types'

const articles: Article[] = [
  {
    id: 'how-digital-audio-works',
    title: 'Como funciona o áudio digital',
    summary: 'Taxa de amostragem, profundidade de bits e canais, em linguagem simples.',
    group: 'O básico',
    body: `O som é uma onda de pressão do ar que vai mudando. Um microfone transforma essa onda num sinal elétrico variável, e o seu aparelho transforma o sinal em números para poder guardá-lo.

## Taxa de amostragem

Para isso, o aparelho mede o sinal milhares de vezes por segundo. Cada medição se chama amostra, e o número de amostras por segundo é a taxa de amostragem, medida em hertz (Hz) ou quilohertz (kHz).

- 44,1 kHz, ou 44.100 amostras por segundo, é a taxa usada nos CDs de áudio.
- 48 kHz é a taxa comum em vídeo e na maior parte do hardware de áudio dos computadores.

Uma taxa de amostragem consegue captar sons até mais ou menos a metade do próprio valor. A audição humana vai até cerca de 20 kHz, e é por isso que taxas um pouco acima de 40 kHz bastam para ouvir.

## Profundidade de bits

Cada amostra é guardada como um número, e a profundidade de bits define a precisão desse número. O áudio de 16 bits, usado nos CDs, permite 65.536 níveis diferentes por amostra. Mais bits significam menos chiado de fundo e mais espaço entre os sons mais baixos e os mais altos, o que importa mais num estúdio do que numa mensagem de voz.

## Canais

Mono tem um canal e estéreo tem dois. Uma gravação estéreo tem o dobro de dados de uma mono com a mesma duração.

## Por que isso importa para o tamanho do arquivo

O áudio sem compressão cresce rápido. Um minuto em estéreo a 48 kHz e 16 bits dá cerca de 11,5 MB. É por isso que a maioria dos formatos comprime o áudio, como explica o próximo artigo.

No Universal Recorder, um download em WAV mantém a taxa com que a sua gravação foi decodificada, que depende do hardware de áudio do seu aparelho e costuma ser 48 kHz, e grava em 16 bits.`,
  },
  {
    id: 'audio-formats',
    title: 'Formatos de áudio e vídeo',
    summary: 'WebM, MP3, WAV e MP4, e qual escolher.',
    group: 'O básico',
    body: `O Universal Recorder pode entregar uma gravação em vários formatos. Eles mudam no tamanho, na qualidade e em onde podem ser reproduzidos.

## Com e sem compressão

O áudio sem compressão guarda cada amostra exatamente como ela é, o que o deixa grande. Os formatos comprimidos usam um codec para deixar de fora detalhes difíceis de ouvir, o que deixa os arquivos muitas vezes menores. Isso se chama compressão com perdas: depois que o detalhe sai, não dá para colocá-lo de volta.

## Os formatos

- **WebM** é o formato em que a maioria dos navegadores grava o áudio diretamente, com um codec chamado Opus. É o menor dos três. O Opus soa muito bem com taxas de bits baixas, principalmente para voz. Navegadores modernos e muitos players tocam esse formato, mas alguns programas mais antigos não.
- **MP3** é o formato de áudio com maior compatibilidade que existe. Quase todo aparelho, som de carro e programa de edição toca MP3. O aplicativo gera o arquivo a 128 kbps, uma boa qualidade para o dia a dia, mas maior que o WebM para o mesmo som.
- **WAV** é áudio de 16 bits sem compressão. É de longe o maior, mas abre em praticamente qualquer editor de áudio, então é o ideal se você pretende editar a gravação.

## De onde vêm o MP3 e o WAV

O seu navegador grava diretamente em um único formato. Quando você baixa em MP3 ou WAV, o aplicativo decodifica a gravação original e a codifica de novo, no seu aparelho, no momento do download.

Daí vêm duas coisas:
- Converter para WAV não acrescenta uma qualidade que a gravação original não tinha. Deixa a gravação mais fácil de editar, não melhor.
- O MP3 é uma segunda rodada de compressão com perdas em cima da primeira. Na maioria das gravações de voz você não vai perceber, mas o original é sempre a cópia mais fiel.

## Gravações de tela e de webcam

Gravações com vídeo são salvas como arquivos de vídeo. Quando o navegador consegue, o arquivo é MP4 com vídeo H.264 e som AAC, que toca na maioria dos players de vídeo e programas de apresentação. Quando não consegue, a gravação é WebM. MP3 e WAV só são oferecidos para gravações sem vídeo.`,
  },
  {
    id: 'permissions',
    title: 'Permissões de microfone, câmera e tela',
    summary: 'Por que o navegador pergunta, e o que fazer se você recusou.',
    group: 'Como funciona',
    body: `Um site não pode usar o seu microfone, a sua câmera ou a sua tela até você permitir. O navegador pergunta na primeira vez que o Universal Recorder precisa de cada um, e mostra um indicador enquanto estão em uso.

## O que é pedido, e quando

- **Microfone**: quando você inicia uma gravação que inclui o microfone.
- **Câmera**: quando você visualiza a prévia ou inicia uma gravação que inclui a webcam.
- **Tela**: sempre que você visualiza a prévia ou grava a tela ou o áudio do sistema, o navegador mostra o próprio seletor para você escolher a tela inteira, uma janela ou uma única aba. O aplicativo não pode escolher por você.

Até você permitir o microfone ou a câmera, as listas de dispositivos podem mostrar nomes genéricos. Os navegadores só revelam os nomes reais dos seus dispositivos para sites que você autorizou.

## Gravar o áudio do sistema

O áudio do sistema é o som que o seu computador está tocando, como uma chamada ou um vídeo. No Chrome e no Edge, ele vem pelo seletor de compartilhamento de tela: marque a opção de compartilhar o áudio antes de confirmar. O Firefox e o Safari não oferecem som no seletor de tela, então eles gravam o seu microfone, mas não o áudio do sistema. Se você pedir só o áudio do sistema, o navegador mostra mesmo assim o seletor de tela, porque é o único jeito que ele oferece para o som, mas o aplicativo não guarda a imagem.

Em celulares e tablets, os navegadores não oferecem captura de tela nem de áudio do sistema, então ali o que dá para gravar é o microfone.

## Se você recusou

Se você bloqueou uma permissão, o navegador lembra dessa escolha e o aplicativo não pode pedir de novo. Para mudar, abra as configurações do site no navegador, normalmente pelo ícone à esquerda do endereço, permita o microfone ou a câmera para este site e recarregue a página.

Num computador, o sistema operacional também pode precisar liberar o acesso do navegador:
- **macOS**: abra Ajustes do Sistema, depois Privacidade e Segurança, depois Microfone, Câmera ou Gravação de Tela, e ative o seu navegador.
- **Windows**: abra Configurações, depois Privacidade e segurança, depois Microfone ou Câmera, e confira se os aplicativos da área de trabalho têm acesso.`,
  },
  {
    id: 'how-recording-works',
    title: 'Como a gravação funciona',
    summary: 'O que acontece entre apertar gravar e ter um arquivo.',
    group: 'Como funciona',
    body: `Tudo no Universal Recorder acontece dentro do seu navegador, no seu aparelho.

## Escolher o que gravar

Você pode gravar qualquer combinação de quatro fontes: o microfone, o áudio do sistema, a tela e a webcam. Quando você grava mais de uma fonte de som, elas são mixadas numa única trilha.

Quando você grava a tela e a webcam juntas, a imagem da câmera fica sobre a tela num pequeno quadro. Você pode escolher o canto, o tamanho e o formato dele, ou arrastá-lo para onde quiser. Só com a webcam, a câmera ocupa o quadro inteiro.

## Durante a gravação

O gravador embutido do navegador capta as fontes e as codifica enquanto grava. Você pode pausar e retomar, acompanhar um medidor de nível ao vivo para conferir se o microfone está captando você, e ver uma prévia de qualquer vídeo.

Deixe a aba aberta até apertar parar. A gravação vai sendo montada dentro da aba enquanto acontece, então fechar ou recarregar a página antes de parar faz com que ela se perca.

## Quando você para

A gravação finalizada é salva no armazenamento do navegador, neste aparelho. Dali você pode ouvi-la, renomeá-la, baixá-la ou excluí-la. Ela não fica na sua pasta de downloads até você baixá-la.

Baixar em WebM, ou em MP4 para uma gravação com vídeo, entrega o arquivo exatamente como foi gravado. Escolher MP3 ou WAV converte o arquivo no seu aparelho naquele momento.

## Dicas para uma gravação melhor

- Escolha o microfone certo na lista antes de começar. Um headset ou um microfone perto da boca costuma soar mais claro que o microfone embutido de um notebook.
- Grave alguns segundos e ouça antes de qualquer coisa importante.
- Se você for gravar o microfone e o áudio do sistema juntos, use fones de ouvido para o microfone não captar também o som das caixas de som.
- Gravações de tela crescem rápido. Gravações só de áudio continuam pequenas.`,
  },
  {
    id: 'where-recordings-are-kept',
    title: 'Onde as suas gravações ficam guardadas',
    summary: 'No seu navegador, neste aparelho, até você excluí-las.',
    group: 'Privacidade e segurança',
    body: `Quando você para de gravar, a gravação é salva no armazenamento do próprio navegador, neste aparelho, por meio de um recurso chamado IndexedDB. Ela não é enviada para lugar nenhum.

## O que isso significa

- **Ela pertence a este navegador neste aparelho.** Uma gravação feita no Chrome do seu notebook não aparece em outro navegador, no seu celular nem em outro computador.
- **Ainda não é um arquivo nas suas pastas.** Para ter uma cópia que você possa enviar, editar ou guardar como backup, use o botão de download e escolha um formato.
- **Limpar os dados do navegador apaga a gravação.** Se você limpar os dados salvos deste site, ou se um programa de limpeza fizer isso, as suas gravações vão junto. Janelas privadas ou anônimas normalmente descartam o armazenamento quando são fechadas.
- **Os navegadores limitam o armazenamento.** Cada site pode usar uma parte do espaço livre do seu disco, e gravações de tela longas podem ocupar bastante.

## Excluir

Você pode excluir qualquer gravação da lista ou usar **Delete all** (excluir tudo), que pede confirmação antes. Como essas gravações só existem no seu aparelho, uma gravação excluída não pode ser recuperada.

## Guardar uma cópia com segurança

O armazenamento do navegador é prático, mas não é um backup. Para tudo o que importa, baixe a gravação e guarde o arquivo num lugar seguro. Se você entrou com um Universal ID, também pode manter uma gravação on-line, como explica o artigo sobre salvar na nuvem.`,
  },
  {
    id: 'saving-to-the-cloud',
    title: 'Salvar uma gravação na nuvem',
    summary: 'O único jeito, opcional, de uma gravação sair do seu aparelho.',
    group: 'Privacidade e segurança',
    body: `Gravar, converter e armazenar acontecem no seu aparelho. Existe um único jeito de uma gravação sair dele: apertar **Save to cloud** (salvar na nuvem) nessa gravação. Nada é enviado se você não fizer isso.

## Como funciona

- Você precisa ter entrado com um Universal ID. Criar um é grátis.
- Cada gravação mantida na nuvem usa um token. O seu Universal ID inclui um token gratuito do Recorder, e é possível comprar mais.
- Excluir a cópia na nuvem devolve o token.
- Cada gravação salva na nuvem pode ter no máximo 50 MB. Isso dá horas de áudio, mas só alguns minutos de vídeo de tela, então gravações de vídeo longas ficam apenas para download. O tamanho é conferido antes de qualquer token ser usado.
- Se um envio falhar, o token é devolvido automaticamente.

## Quem pode acessar

A cópia na nuvem fica num armazenamento privado e não tem link público. Só você pode acessá-la, fazendo login com o Universal ID em que a salvou. Se o seu Universal ID pertence a uma empresa com outras pessoas, cada gravação na nuvem tem uma caixa **Share with** no painel **In the cloud**. Ela começa desmarcada. Marque-a e todos na sua empresa poderão reproduzir e baixar essa gravação, mas só você poderá excluí-la. Desmarque-a para que ela volte a ser privada. Ela vai e volta do armazenamento por uma conexão criptografada.

## Usar em outro aparelho

Depois que uma gravação está na nuvem, você pode entrar em outro aparelho e ouvi-la ou baixá-la no painel **In the cloud** (na nuvem). Ela fica lá até você excluí-la.

## O que não é

Salvar na nuvem é guardar a cópia de uma gravação, não sincronizar toda a sua biblioteca. As suas outras gravações ficam no aparelho onde foram feitas. Excluir uma gravação deste aparelho não exclui a cópia na nuvem, e excluir a cópia na nuvem não exclui a deste aparelho.`,
  },
  {
    id: 'what-leaves-your-device',
    title: 'O que sai do seu aparelho',
    summary: 'Nada do que você grava, a não ser que escolha salvar na nuvem.',
    group: 'Privacidade e segurança',
    body: `O seu microfone, a sua câmera e a sua tela são captados, gravados e salvos pelo seu próprio navegador. A não ser que você aperte **Save to cloud** numa gravação, nada é enviado para lugar algum: nem áudio, nem vídeo, nem prévia, nem captura de tela.

O aplicativo não transcreve nem analisa as suas gravações, e não tem reconhecimento de voz.

## Para que o aplicativo usa a internet

- **Carregar o aplicativo**, e as notas sobre o que mudou em cada atualização.
- **Entrar com um Universal ID**, só se você quiser. Dá para gravar, converter e baixar sem conta.
- **Um aviso de que o aplicativo foi aberto**, enviado uma vez por visita se você estiver conectado. Ele não inclui nada sobre as suas gravações.
- **Um sinal de “em uso”**, enviado a cada 45 segundos enquanto o aplicativo está aberto e na tela, para mostrar quantas pessoas o estão usando. Ele contém o nome do aplicativo, um ID aleatório criado neste aparelho e a sua conta, se você estiver conectado.
- **Gravações salvas na nuvem**, só quando você pede, como descrito no artigo sobre salvar na nuvem.

## Converter formatos

Transformar uma gravação em MP3 ou WAV também acontece no seu aparelho. A conversão roda na própria página, e nada é enviado para fazê-la.

## Confira você mesmo

O navegador mostra um indicador sempre que um site usa o seu microfone, a sua câmera ou a sua tela, e dali você pode parar o compartilhamento a qualquer momento. Se quiser ter certeza de que nada está sendo enviado, abra as ferramentas de desenvolvedor do navegador, vá até a aba Rede e faça uma gravação: ela nunca aparece ali.`,
  },
]

export default articles
