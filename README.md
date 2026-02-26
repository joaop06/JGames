# Plataforma de Jogos Multiplayer

Plataforma web para jogos multiplayer (jogo da velha, forca, etc.) com cadastro de usuários, amigos e convites. Stack: backend Fastify + Prisma (PostgreSQL), frontend React + Vite, tudo rodando em Docker.

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose
- (Opcional) Node 22+ e npm para rodar backend/frontend localmente sem Docker

## Subir com Docker

1. Na raiz do projeto, crie um arquivo `.env` a partir do exemplo (opcional; os valores padrão já funcionam para desenvolvimento):

   ```bash
   cp .env.example .env
   ```

2. Suba os serviços:

   ```bash
   docker compose up --build
   ```

3. Acesse:
   - **Frontend:** http://localhost:5173  
   - **Backend (health):** http://localhost:3000/health  

As migrations do Prisma são aplicadas automaticamente ao iniciar o backend.

## O que está disponível

- **Cadastro e login** – Registro com e-mail, nome de usuário e senha; login com cookies httpOnly (JWT access + refresh).
- **Perfil** – Página de perfil do usuário (dados atuais; estatísticas por jogo ficam para versões futuras).
- **Amigos** – Enviar convite por nome de usuário, listar convites recebidos, aceitar/rejeitar, listar amigos.

## Rodar sem Docker (desenvolvimento)

1. **Banco:** suba só o PostgreSQL (por exemplo `docker compose up -d db`) e use no `.env` do backend:

   ```env
   DATABASE_URL=postgresql://games:games_secret@localhost:5432/games_platform
   ```

2. **Backend:**

   ```bash
   cd backend
   npm install
   npx prisma migrate deploy
   npm run dev
   ```

   O backend ficará em http://localhost:3000.

3. **Frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   O frontend ficará em http://localhost:5173 e usará o proxy do Vite para `/api` e `/health` (apontando para o backend em localhost:3000). Não é necessário configurar `VITE_API_URL` nesse caso.

## Variáveis de ambiente

Consulte `.env.example`. Principais:

- `POSTGRES_*` – credenciais do PostgreSQL (usadas pelo Compose e pelo backend).
- `JWT_SECRET` – segredo para assinatura dos JWTs (obrigatório em produção).
- `CORS_ORIGIN` – origin permitida pelo backend (padrão: `http://localhost:5173`).
- No container do frontend, `API_URL` é usada pelo proxy do Vite (no Compose já está como `http://backend:3000`).

## Estrutura do repositório

```
games/
├── docker-compose.yml    # db, backend, frontend
├── .env.example
├── backend/              # Fastify + Prisma + JWT
│   ├── prisma/
│   ├── src/
│   │   ├── routes/       # auth, users, friends
│   │   └── lib/          # db, auth, validation
│   └── Dockerfile
└── frontend/             # React + Vite
    ├── src/
    │   ├── api/          # client HTTP
    │   ├── context/      # AuthContext
    │   └── pages/        # Login, Register, Home, Profile, Friends
    └── Dockerfile
```

---

## Configuração de Subdomínio com Cloudflare Tunnel (Ubuntu)

Guia completo para expor a aplicação (ou qualquer serviço local) através de um Cloudflare Tunnel, criando subdomínios apontando para serviços internos.

### 1. Instalar o cloudflared

```bash
# Adicionar o repositório oficial da Cloudflare
sudo mkdir -p --mode=0755 /usr/share/keyrings

curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null

echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared $(lsb_release -cs) main" | \
  sudo tee /etc/apt/sources.list.d/cloudflared.list

# Instalar
sudo apt-get update
sudo apt-get install -y cloudflared
```

### 2. Autenticar no Cloudflare

```bash
cloudflared tunnel login
```

> Isso abrirá um link no navegador. Faça login na sua conta Cloudflare e autorize o domínio desejado. O certificado será salvo em `~/.cloudflared/cert.pem`.

### 3. Criar um novo tunnel

```bash
# Substitua NOME_DO_TUNNEL pelo nome desejado (ex: games-tunnel)
cloudflared tunnel create NOME_DO_TUNNEL
```

> Isso gera um arquivo de credenciais em `~/.cloudflared/<TUNNEL_UUID>.json`. Anote o **UUID** exibido na saída.

### 4. Verificar tunnels existentes

```bash
cloudflared tunnel list
```

### 5. Criar o arquivo de configuração

Crie/edite o arquivo `~/.cloudflared/config.yml`:

```bash
nano ~/.cloudflared/config.yml
```

Conteúdo do arquivo (ajuste os valores conforme seu ambiente):

```yaml
tunnel: <TUNNEL_UUID>
credentials-file: /home/<SEU_USUARIO>/.cloudflared/<TUNNEL_UUID>.json

ingress:
  # Subdomínio para o frontend (React/Vite)
  - hostname: games.seudominio.com
    service: http://localhost:5173

  # Subdomínio para o backend/API (Fastify)
  - hostname: api.games.seudominio.com
    service: http://localhost:3000

  # Adicione mais subdomínios conforme necessário:
  # - hostname: outro.seudominio.com
  #   service: http://localhost:8080

  # Regra obrigatória de fallback (catch-all) — deve ser a última
  - service: http_status:404
```

### 6. Criar os registros DNS na Cloudflare

Para **cada hostname** definido no `config.yml`, crie um registro DNS CNAME apontando para o tunnel:

```bash
# Frontend
cloudflared tunnel route dns NOME_DO_TUNNEL games.seudominio.com

# Backend/API
cloudflared tunnel route dns NOME_DO_TUNNEL api.games.seudominio.com
```

> Esses comandos criam automaticamente registros CNAME no painel da Cloudflare apontando para `<TUNNEL_UUID>.cfargotunnel.com`.

### 7. Validar a configuração

```bash
cloudflared tunnel ingress validate
```

> Deve retornar "OK" se o `config.yml` estiver correto.

### 8. Testar o tunnel manualmente

```bash
cloudflared tunnel run NOME_DO_TUNNEL
```

> Verifique no terminal se as conexões são estabelecidas sem erros. Acesse os subdomínios no navegador para confirmar.

### 9. Instalar como serviço systemd (execução permanente)

```bash
# Instalar o serviço (copia config e credenciais para /etc/cloudflared/)
sudo cloudflared service install

# Habilitar para iniciar no boot e iniciar agora
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

> **Importante:** o comando `service install` copia `config.yml` e o arquivo de credenciais para `/etc/cloudflared/`. Se você alterar a configuração depois, edite `/etc/cloudflared/config.yml` e reinicie o serviço.

### 10. Gerenciar o serviço

```bash
# Ver status
sudo systemctl status cloudflared

# Ver logs em tempo real
sudo journalctl -u cloudflared -f

# Reiniciar após alterações no config
sudo systemctl restart cloudflared

# Parar o serviço
sudo systemctl stop cloudflared
```

### 11. Adicionar um novo subdomínio a um tunnel existente

Para adicionar um novo subdomínio depois que o tunnel já está rodando:

```bash
# 1. Editar a configuração
sudo nano /etc/cloudflared/config.yml

# 2. Adicionar a nova entrada de ingress ANTES da regra catch-all:
#   - hostname: novo.seudominio.com
#     service: http://localhost:PORTA

# 3. Criar o registro DNS
cloudflared tunnel route dns NOME_DO_TUNNEL novo.seudominio.com

# 4. Validar
cloudflared tunnel ingress validate --config /etc/cloudflared/config.yml

# 5. Reiniciar o serviço
sudo systemctl restart cloudflared
```

### 12. Remover um tunnel (se necessário)

```bash
# Parar o serviço primeiro
sudo systemctl stop cloudflared

# Deletar o tunnel (remove também os registros DNS associados)
cloudflared tunnel delete NOME_DO_TUNNEL
```

### Dicas e Troubleshooting

- **Certificado expirado:** execute `cloudflared tunnel login` novamente para gerar um novo `cert.pem`.
- **Porta ocupada:** verifique se o serviço local está rodando na porta correta com `ss -tlnp | grep PORTA`.
- **Firewall:** o `cloudflared` faz conexões de **saída** (não precisa abrir portas no firewall).
- **Múltiplos tunnels:** cada tunnel precisa de seu próprio `config.yml` e serviço systemd. Prefira usar um único tunnel com múltiplas regras de ingress.
- **Logs detalhados:** use `cloudflared tunnel --loglevel debug run NOME_DO_TUNNEL` para depuração.
- **Atualizar cloudflared:** `sudo apt-get update && sudo apt-get upgrade cloudflared`.

---

## Próximos passos (futuro)

- Adicionar jogos (ex.: jogo da velha, forca) com WebSockets ou polling.
- Tabelas de estatísticas por jogo e por adversário.
- Convites para partidas (desafiar amigo a jogar).
