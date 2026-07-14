# inatelinos-web 📡💻

Versão **web** da rede social do Inatel, construída com **Next.js (App Router)
+ TypeScript + Tailwind CSS**, usando o **mesmo Firebase** do app mobile
([`inatelinos-app`](https://github.com/RuanPS01/inatelinos-app)).

Compartilha o modelo de dados do Firestore com o app: perfis em
`users/{email}` e posts em `users/{email}/posts` — o que você posta na web
aparece no app e vice-versa.

## Acesso exclusivo Inatel 🔐

- Cadastro/login por e-mail e senha, aceitando somente `@inatel.br` e
  `@sigla.inatel.br`.
- Conta liberada apenas após **confirmar o link enviado ao e-mail**.
- Restrição de domínio + e-mail confirmado reforçada no servidor pelas regras
  do Firestore/Storage (mantidas no repositório
  [`inatelinos-server`](https://github.com/RuanPS01/inatelinos-server)).

## Funcionalidades

- Fluxo de autenticação completo: login, cadastro, confirmação de e-mail
  (com checagem automática e reenvio), redefinição de senha e criação de
  perfil no primeiro acesso.
- Feed global em tempo real (mesma query do app).
- Publicar post com upload de imagem para o Firebase Storage.
- Curtir e **salvar** posts (lógica idêntica à do app).
- **Comentar** em posts (ver e adicionar comentários).
- **Seguir/deixar de seguir** com o modelo de solicitação/aceite do app, e
  página de **solicitações** pendentes.
- **Buscar** inatelinos por nome ou usuário.
- Perfil próprio e de **outros usuários** (`/u/[username]`) com grade de posts.
- **Editar perfil**: nome, bio, link e foto de perfil.
- **Stories**: barra no topo do feed, publicar story (upload) e visualizador
  em tela cheia com barras de progresso, auto-avanço e marcação de “visto”
  (stories das últimas 24h).
- **Chat/mensagens**: lista de conversas (`/messages`) e conversa em tempo
  real (`/messages/[email]`), com contador de não lidas e botão “Mensagem”
  no perfil.
- **Notificações** (`/notifications`): curtidas e comentários nos seus posts
  e solicitações para seguir, com badges de sino e mensagens na navegação.
- Navegação entre Feed, Buscar, Salvos, Notificações, Mensagens e Perfil.

## Rodando localmente 🛠️

Pré-requisitos: Node.js LTS (≥ 18).

```bash
npm install
cp .env.local.example .env.local   # preencha com as credenciais do Firebase
npm run dev
```

Abra <http://localhost:3000>.

> As credenciais são as do **mesmo** projeto Firebase do app mobile. No
> Firebase Console → *Configurações do projeto → Seus apps*, use (ou adicione)
> um **app Web** e copie o `firebaseConfig`. Certifique-se de que o provedor
> **Email/Password** está habilitado em *Authentication → Sign-in method*
> (ver o SETUP.md do `inatelinos-app`).

## Estrutura

```
src/
├── app/                 # rotas (App Router)
│   ├── layout.tsx       # layout raiz + AuthProvider
│   ├── page.tsx         # feed (protegido)
│   ├── login/           # entrar
│   ├── signup/          # cadastrar
│   ├── verify-email/    # confirmação de e-mail
│   ├── onboarding/      # criação de perfil (1º acesso)
│   └── profile/         # perfil do usuário
├── components/          # AppGate, TopBar, Feed, PostCard, NewPostForm, Brand…
├── context/AuthContext  # sessão, perfil e ações de auth
└── lib/                 # firebase, tipos, validação de e-mail, utils
```

## Scripts

| Comando | Ação |
|---|---|
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run typecheck` | Checagem de tipos (tsc) |
| `npm run lint` | ESLint (next lint) |

## Deploy

O app pode ser publicado na **Vercel** (recomendado para Next.js) ou no
**Firebase Hosting** (com framework hosting). Configure as mesmas variáveis
`NEXT_PUBLIC_FIREBASE_*` como variáveis de ambiente no provedor escolhido.
