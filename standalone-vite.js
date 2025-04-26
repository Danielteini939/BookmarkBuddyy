// Arquivo para executar o Vite diretamente sem o Express
import { createServer } from 'vite';

async function startVite() {
  const server = await createServer({
    // Configuração base do Vite
    root: 'client',
    server: {
      port: 3000,
      open: true,
    }
  });
  
  await server.listen();
  
  console.log('Servidor Vite rodando em http://localhost:3000');
}

startVite().catch(console.error);