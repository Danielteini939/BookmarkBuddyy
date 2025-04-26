// Script de build específico para Vercel
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual do script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Iniciando o build do frontend para Vercel...');

try {
  // Criar diretório dist se não existir
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }

  // Navegar para a pasta client e executar o build
  console.log('Executando build do Vite...');
  execSync('cd client && npx vite build --outDir ../dist', { stdio: 'inherit' });

  // Verificar se o index.html foi gerado
  if (fs.existsSync(path.join(__dirname, 'dist', 'index.html'))) {
    console.log('Build concluído com sucesso! Arquivos gerados em /dist');
  } else {
    console.error('Erro: index.html não encontrado no diretório dist');
    process.exit(1);
  }

} catch (error) {
  console.error('Erro durante o build:', error);
  process.exit(1);
}