import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { getMermaidFormat } from './tools/getFormat';
import { renderMermaidToWeb } from './tools/renderToWeb';
import { createApp, startWebServer, stopWebServer, ensureDirectories } from './web/server';
import { Request, Response } from 'express';

function createMcpServer() {
  const server = new Server(
    { name: 'mermaid-visual-server', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_mermaid_format',
          description:
            'Dapatkan format dan template untuk membuat diagram Mermaid. Kosongkan diagram_type untuk melihat semua tipe yang didukung.',
          inputSchema: {
            type: 'object',
            properties: {
              diagram_type: {
                type: 'string',
                description:
                  'Jenis diagram (flowchart, sequence, mindmap, classDiagram, erDiagram, stateDiagram, gantt, pie, journey). Kosongkan untuk melihat daftar.',
              },
            },
          },
        },
        {
          name: 'render_mermaid_to_web',
          description:
            'Render kode Mermaid menjadi diagram PNG dan tampilkan dalam halaman web. Mengembalikan URL yang bisa dibuka di browser.',
          inputSchema: {
            type: 'object',
            properties: {
              mermaid_code: {
                type: 'string',
                description: 'Kode Mermaid yang valid.',
              },
            },
            required: ['mermaid_code'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'get_mermaid_format') {
        const diagramType = (args as Record<string, string> | undefined)?.diagram_type;
        const result = await getMermaidFormat(diagramType);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      if (name === 'render_mermaid_to_web') {
        const mermaidCode = (args as Record<string, string> | undefined)?.mermaid_code;
        if (!mermaidCode) {
          throw new Error('Parameter mermaid_code wajib diisi.');
        }
        const result = await renderMermaidToWeb(mermaidCode);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      throw new Error(`Tool tidak dikenal: ${name}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  return server;
}

async function main() {
  await ensureDirectories();

  const app = createApp();

  // MCP endpoint for Kibana / HTTP clients
  app.post('/mcp', async (req: Request, res: Response) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });
    res.on('close', () => server.close());
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get('/mcp', async (req: Request, res: Response) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => server.close());
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });

  app.delete('/mcp', async (req: Request, res: Response) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => server.close());
    await server.connect(transport);
    await transport.handleRequest(req, res);
  });

  startWebServer(app);

  process.on('SIGINT', () => { stopWebServer(); process.exit(0); });
  process.on('SIGTERM', () => { stopWebServer(); process.exit(0); });
}

main().catch(console.error);
