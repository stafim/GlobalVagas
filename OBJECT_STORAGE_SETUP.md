# Configuração do Object Storage - Operlist

## Status Atual ✅

O Object Storage do Replit (App Storage) já está configurado e pronto para uso!

### Variáveis de Ambiente Configuradas

```
PUBLIC_OBJECT_SEARCH_PATHS=operlist-storage/public
PRIVATE_OBJECT_DIR=operlist-storage/private
```

### Estrutura do Bucket

**Nome do Bucket**: `operlist-storage`

**Diretórios**:
- `/operlist-storage/public` - Arquivos públicos (logos de empresas, banners, imagens de eventos)
- `/operlist-storage/private` - Arquivos privados protegidos por ACL (fotos de operadores, CVs, documentos)

## Arquivos Implementados

### Backend
- ✅ `server/objectStorage.ts` - Serviço principal do Object Storage
- ✅ `server/objectAcl.ts` - Sistema de controle de acesso (ACL)
- ✅ Rotas de upload em `server/routes.ts`:
  - `POST /api/objects/upload` - Gerar URL de upload
  - `POST /api/clients/upload-logo` - Upload de logo de cliente (admin)
  - `POST /api/upload/local` - Fallback para upload local

### Frontend
- ✅ `client/src/components/ObjectUploader.tsx` - Componente de upload de arquivos

## Como Funciona

### 1. Upload de Arquivos Protegidos (Usuário Logado)

```typescript
// Frontend - Obter URL de upload
const response = await fetch('/api/objects/upload', {
  method: 'POST',
  credentials: 'include'
});
const { uploadURL } = await response.json();

// Upload direto para o bucket via presigned URL
await fetch(uploadURL, {
  method: 'PUT',
  body: file
});

// Atualizar ACL e metadata no backend
await fetch('/api/user-photo', {
  method: 'PUT',
  body: JSON.stringify({ photoURL: uploadURL })
});
```

### 2. Servir Arquivos Públicos

Arquivos públicos são servidos através da rota:
```
GET /public-objects/<caminho-do-arquivo>
```

Exemplo: `/public-objects/logos/empresa-123.png`

### 3. Servir Arquivos Privados (com ACL)

Arquivos privados são servidos através da rota:
```
GET /objects/<caminho-do-arquivo>
```

O sistema verifica automaticamente:
- Se o usuário está autenticado
- Se o usuário tem permissão (dono do arquivo ou nas regras de ACL)

## Verificar se o Bucket Existe

Para verificar se o bucket foi criado no Replit:

1. Abra o painel **"Object Storage"** ou **"App Storage"** na sidebar do Replit
2. Verifique se o bucket `operlist-storage` existe
3. Se não existir, crie um novo bucket com esse nome
4. Crie as pastas `public` e `private` dentro do bucket

## Tipos de Arquivos Suportados

O sistema suporta qualquer tipo de arquivo:
- Imagens (PNG, JPG, GIF, WebP)
- Documentos (PDF, DOC, DOCX)
- Vídeos (MP4, AVI)
- Outros arquivos binários

## Fallback Local

Se o Object Storage não estiver disponível, o sistema usa um fallback local:
- Arquivos são salvos em `/attached_assets/uploads/`
- Útil para desenvolvimento e testes

## Segurança

### Arquivos Públicos
- Qualquer pessoa pode acessar
- Ideal para: logos de empresas, banners, imagens de eventos

### Arquivos Privados
- Sistema de ACL baseado em:
  - **Owner**: Dono do arquivo (sempre tem acesso)
  - **Visibility**: `public` ou `private`
  - **ACL Rules**: Regras de acesso por grupo

Exemplo de ACL:
```typescript
{
  owner: "user-123",
  visibility: "private",
  aclRules: [
    {
      group: { type: "COMPANY_MEMBER", id: "company-456" },
      permission: "READ"
    }
  ]
}
```

## Uso no Operlist

### Implementações Atuais
1. ✅ Upload de logo de clientes (admin)
2. ✅ Upload de fotos de perfil de operadores
3. ✅ Upload de fotos de perfil de empresas
4. ✅ Upload de banners de empresas

### Próximas Implementações Possíveis
- Upload de CVs (PDFs)
- Galeria de fotos de eventos
- Documentos de comprovação
- Certificados de cursos

## Troubleshooting

### Erro: "Object not found"
- Verifique se o bucket `operlist-storage` foi criado
- Verifique se as pastas `public` e `private` existem

### Erro: "PUBLIC_OBJECT_SEARCH_PATHS not set"
- As variáveis já estão configuradas em `shared` environment
- Reinicie o workflow se necessário

### Fallback para Local
- Se o Object Storage falhar, o sistema usa upload local automaticamente
- Os arquivos ficam em `/attached_assets/uploads/`

## Documentação Oficial

- [Replit Object Storage Docs](https://docs.replit.com/hosting/deployments/object-storage)
- [Google Cloud Storage SDK](https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs)
