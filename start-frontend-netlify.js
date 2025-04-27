import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function startFrontendForNetlify() {
  console.log('🚀 Iniciando aplicação frontend para Netlify...');
  
  try {
    const vite = await createServer({
      configFile: resolve(__dirname, 'vite.config.frontend.ts'),
      server: {
        port: process.env.PORT || 5000,
        host: '0.0.0.0',
      },
    });
    
    await vite.listen();
    
    console.log(`📱 Frontend rodando em http://localhost:${vite.config.server.port}`);
    console.log('⚠️ Aviso: Esta é uma versão somente frontend!');
    console.log('💾 Dados serão armazenados apenas na memória do navegador');
    console.log('📤 Use a função de backup regularmente para salvar seus dados');
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor frontend:', error);
    process.exit(1);
  }
}

startFrontendForNetlify();