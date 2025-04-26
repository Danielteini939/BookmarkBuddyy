// Script para construir apenas o frontend (sem backend)
import { build } from 'vite';
import fs from 'fs';
import path from 'path';

async function buildFrontendOnly() {
  try {
    console.log('Iniciando build do frontend...');
    
    // Executa o build com a configuração do Vite
    await build({
      configFile: './vite.config.ts',
      root: './client',
      build: {
        outDir: '../dist', // Saída diretamente para /dist em vez de /dist/public
        emptyOutDir: true
      }
    });
    
    // Garante que o index.html esteja na raiz do diretório de saída
    if (fs.existsSync('./dist/index.html')) {
      console.log('Build concluído com sucesso!');
    } else {
      console.error('Erro: index.html não encontrado no diretório de saída.');
    }
    
  } catch (error) {
    console.error('Erro durante o build:', error);
    process.exit(1);
  }
}

buildFrontendOnly();