# Finanças (Local) - Web estático

App web (React + Vite + TypeScript) com persistência local via IndexedDB (Dexie).
Sem login e sem sync. Ideal para rodar no GitHub Pages.

## Rodar local
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run preview
```

## Publicação (GitHub Pages)
- O workflow em `.github/workflows/deploy.yml` publica automaticamente ao dar push na branch `main`.
- URL esperada:
  https://wagnerjales.github.io/financasmobile/

## Backup
Use **Backup JSON** para salvar a base.
Use **Restaurar JSON** para repor a base no navegador.
