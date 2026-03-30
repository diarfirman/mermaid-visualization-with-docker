# Mermaid Visualization MCP Server

An MCP (Model Context Protocol) server that allows AI agents (Claude, Elastic Agent Builder, etc.) to generate and visualize Mermaid diagrams in a browser via a web URL.

## Features

- Exposes two MCP tools:
  - `get_mermaid_format` — returns templates and syntax examples for 8 diagram types
  - `render_mermaid_to_web` — renders Mermaid code into an HTML page and returns a public URL
- Diagrams are rendered client-side in the browser via Mermaid CDN (no headless browser needed)
- HTTPS support via nginx reverse proxy
- Auto-cleanup of old diagram files via cron (every day at 02:00, deletes files older than 3 days)
- Supports multiple domains via separate nginx server blocks

## Diagram Types Supported

`flowchart`, `sequence`, `mindmap`, `classDiagram`, `erDiagram`, `stateDiagram`, `gantt`, `pie`

## Project Structure

```
visualize-mermaid/
├── src/
│   ├── index.ts                  # MCP server entry point (StreamableHTTP transport)
│   ├── renderer/
│   │   └── mermaidRenderer.ts    # Generates HTML pages with Mermaid CDN
│   ├── tools/
│   │   ├── getFormat.ts          # MCP tool: get_mermaid_format
│   │   └── renderToWeb.ts        # MCP tool: render_mermaid_to_web
│   ├── utils/
│   │   └── templates.ts          # Diagram templates and examples
│   └── web/
│       └── server.ts             # Express server (serves /views and /mcp endpoint)
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
└── tsconfig.json
```

## Architecture

```
[Elastic Agent / Claude] 
        │  HTTPS POST /mcp
        ▼
[nginx container] → proxy_pass → [mermaid-mcp-server container :3000]
                                          │
                                          ├── POST /mcp   → MCP tool handler
                                          └── GET  /views → serve HTML diagrams
                                                    │
                                            [views_data volume]
                                                    │
                                          [cleaner container] → cron delete > 3 days
```

## Requirements

- Docker & Docker Compose
- An SSL certificate for your domain (Let's Encrypt / certbot recommended)
- A public domain pointing to your server

## Setup

### 1. Build the TypeScript source

```bash
npm install
npm run build
```

### 2. Prepare SSL certificates

Place your SSL certificate files in the `certs/` directory:

```
certs/
├── your_domain_fullchain.pem
└── your_domain_privkey.pem
```

Using Let's Encrypt / certbot:

```bash
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./certs/your_domain_fullchain.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./certs/your_domain_privkey.pem
```

### 3. Configure nginx.conf

Edit `nginx.conf` and set your domain and cert paths:

```nginx
server {
    listen 4443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/nginx/certs/your_domain_fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/your_domain_privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    location / {
        proxy_pass http://mermaid:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Configure docker-compose.yml

Set the `PUBLIC_URL` environment variable to your public HTTPS URL:

```yaml
environment:
  - PUBLIC_URL=https://your-domain.com:4443
```

### 5. Start

```bash
docker compose up -d --build
```

The MCP endpoint will be available at:

```
https://your-domain.com:4443/mcp
```

## Connecting to Elastic Agent Builder

In Kibana → Stack Management → Connectors → Create Connector → MCP:

| Field | Value |
|-------|-------|
| Name | Mermaid Visualizer |
| Server URL | `https://your-domain.com:4443/mcp` |

After the connector is created, import tools in Agent Builder. Both tools will appear: `get_mermaid_format` and `render_mermaid_to_web`.

**Recommended agent instruction:**

```
You have access to a Mermaid diagram visualization tool. When the user asks you to create,
draw, or visualize any diagram, flowchart, sequence diagram, or similar visual, use the
available MCP tools:

1. Use get_mermaid_format first if you need to check the correct syntax for a specific
   diagram type (flowchart, sequence, mindmap, classDiagram, erDiagram, stateDiagram, gantt, pie).

2. Use render_mermaid_to_web with valid Mermaid code to render the diagram and return
   a URL the user can open in their browser.

Always return the URL to the user so they can view the diagram.
```

## Changing Domain

No rebuild required. To switch domains:

1. Generate a new SSL cert with certbot
2. Copy cert files to `certs/`
3. Add a new `server` block in `nginx.conf`
4. Update `PUBLIC_URL` in `docker-compose.yml`
5. Run `docker compose up -d` — nginx will reload with the new config

> **Note:** After rebuilding the `mermaid` service, restart nginx to refresh its internal DNS cache:
> ```bash
> docker restart mermaid-nginx
> ```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PUBLIC_URL` | `http://localhost:3000` | Public base URL returned in diagram links |
| `PORT` | `3000` | Internal port the Express server listens on |

## Docker Services

| Service | Container | Description |
|---------|-----------|-------------|
| `mermaid` | `mermaid-mcp-server` | MCP server + Express web server |
| `nginx` | `mermaid-nginx` | HTTPS reverse proxy |
| `cleaner` | `mermaid-cleaner` | Cron job — deletes diagrams older than 3 days at 02:00 daily |

## Diagram File Storage

- **Location:** `views_data` Docker named volume (mounted at `/app/public/views` in container)
- **Size per diagram:** ~2–3 KB (HTML only, diagrams render client-side via Mermaid CDN)
- **Retention:** 3 days (auto-deleted by cleaner service)
