import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

const PORT = parseInt(process.env.PORT || '3000', 10);

// Folder publik (relatif dari dist/web/ setelah build)
const publicDir = path.join(__dirname, '../../public');
const viewsDir = path.join(publicDir, 'views');

export async function ensureDirectories(): Promise<void> {
  await fs.mkdir(viewsDir, { recursive: true });
}

export function createApp() {
  const app = express();
  app.use(express.json());
  // Serve static files (HTML pages)
  app.use('/views', express.static(viewsDir));
  return app;
}

let serverInstance: ReturnType<typeof createApp.prototype.listen> | null = null;

export function startWebServer(app: ReturnType<typeof createApp>): void {
  serverInstance = app.listen(PORT, () => {
    console.error(`Web server running at http://localhost:${PORT}`);
    console.error(`MCP endpoint: http://localhost:${PORT}/mcp`);
  });
}

export function stopWebServer(): void {
  if (serverInstance) {
    serverInstance.close();
    serverInstance = null;
  }
}

export function getBaseUrl(): string {
  return process.env.PUBLIC_URL || `http://localhost:${PORT}`;
}
