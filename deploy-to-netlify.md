# Instruções para Implantar o LoanBuddy no Netlify

Este guia mostra como implantar esta aplicação no Netlify, funcionando apenas com a parte frontend.

## Passos para Implantação

### 1. Preparar o Projeto

1. Faça o download do código deste Replit clicando no menu de três pontos e escolhendo "Download as ZIP"
2. Descompacte o arquivo em seu computador
3. Abra o terminal na pasta do projeto

### 2. Criar os Arquivos de Configuração

Crie um arquivo `netlify.toml` na raiz do projeto com o seguinte conteúdo:

```toml
[build]
  base = "."
  publish = "dist"
  command = "npm run build:frontend"

[dev]
  command = "npm run dev:frontend"
  port = 5000
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Modificar o package.json

Adicione estes scripts ao seu package.json:

```json
"scripts": {
  // ... scripts existentes
  "dev:frontend": "vite",
  "build:frontend": "vite build",
  "netlify": "netlify dev"
}
```

### 4. Criar um arquivo frontend-only para o Vite

Crie um arquivo chamado `vite.config.frontend.ts` na raiz do projeto:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
```

### 5. Instalar a CLI Netlify (opcional, mas recomendado para teste local)

```bash
npm install -g netlify-cli
```

### 6. Testar localmente (opcional)

```bash
netlify dev
```

### 7. Implantar no Netlify

Existem várias maneiras de implantar no Netlify:

**Opção 1: Usando a Interface do Netlify**
1. Crie uma conta no [Netlify](https://www.netlify.com/) se ainda não tiver
2. Vá para o painel e clique em "New site from Git"
3. Conecte sua conta do GitHub, GitLab ou Bitbucket
4. Selecione o repositório (precisa fazer upload do código para um desses serviços primeiro)
5. Na configuração de implantação, defina:
   - Build command: `npm run build:frontend`
   - Publish directory: `dist`
6. Clique em "Deploy site"

**Opção 2: Usando a CLI Netlify (se instalada)**
1. Faça login com `netlify login`
2. Execute `netlify deploy`
3. Siga as instruções na linha de comando

**Opção 3: Implantação Direta via Arraste e Solte**
1. Execute `npm run build:frontend` localmente para gerar a pasta `dist`
2. Faça login no painel do Netlify
3. Arraste e solte a pasta `dist` para a área de implantação

## Considerações Importantes

- Esta implantação usa apenas o **frontend** da aplicação. Você ainda pode usar todas as funcionalidades pois os dados são armazenados em memória no navegador.
- Lembre-se que, sem o backend Express, você deve usar as funções de exportação regularmente para salvar seus dados em arquivos locais.
- Recomendamos usar a função "Backup e Restauração" na seção de Configurações para gerenciar seus dados.