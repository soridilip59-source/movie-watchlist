import { createApp } from './app';

const PORT = process.env.PORT || 3000;
let appInstance: any;

export default async function handler(req: any, res: any) {
  if (!appInstance) {
    appInstance = await createApp();
  }
  return appInstance(req, res);
}

async function startServer() {
  try {
    const app = await createApp();
    app.listen(PORT, () => {
      console.log(`\n🍿 Family Movie Watchlist API Server running!`);
      console.log(`🌐 Dashboard UI: http://localhost:${PORT}`);
      console.log(`📑 API Swagger Docs: http://localhost:${PORT}/api-docs`);
      console.log(`⚡ API Endpoint Base: http://localhost:${PORT}/api/v1\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

// If running directly locally
if (require.main === module) {
  startServer();
}
