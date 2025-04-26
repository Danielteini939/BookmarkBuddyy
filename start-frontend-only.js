// Esse arquivo substitui a necessidade do backend Express, rodando apenas o frontend Vite
import { createServer } from 'vite';

async function startFrontendOnly() {
  try {
    const server = await createServer({
      // Configuração do servidor Vite
      configFile: './vite.config.ts',
      server: {
        port: 3000,
        open: true,
        host: true,
      }
    });
    
    await server.listen();
    
    console.log('Aplicação frontend rodando em http://localhost:3000');
    console.log('O app está funcionando sem o backend, usando apenas o localStorage para armazenamento de dados.');
    console.log('Para rodar no Windows, instale o pacote cross-env e modifique o package.json');
  } catch (error) {
    console.error('Erro ao iniciar o servidor Vite:', error);
  }
}

startFrontendOnly();