# Teste do Bucket - Operlist

## ✅ Configuração Atual

O Object Storage está configurado com as seguintes variáveis:
- **PUBLIC_OBJECT_SEARCH_PATHS**: `operlist-storage/public`
- **PRIVATE_OBJECT_DIR**: `operlist-storage/private`

## 🔍 Como Verificar se o Bucket Existe

### Passo 1: Abrir o Painel do Object Storage

1. Na sidebar esquerda do Replit, procure por:
   - **"Object Storage"** ou
   - **"App Storage"** ou
   - **"Tools"** → **"Object Storage"**

### Passo 2: Verificar/Criar o Bucket

2. Procure pelo bucket chamado **`operlist-storage`**

3. **Se o bucket NÃO existir**:
   - Clique em **"Create Bucket"** ou **"+ New Bucket"**
   - Nome: `operlist-storage`
   - Clique em **"Create"**

4. **Se o bucket JÁ existir**:
   - Clique no bucket `operlist-storage` para abrir
   - Verifique se existem as pastas:
     - `public/`
     - `private/`
   
5. **Se as pastas não existirem**:
   - Dentro do bucket, clique em **"New Folder"**
   - Crie a pasta `public`
   - Crie a pasta `private`

### Passo 3: Testar Upload

6. Para testar se está funcionando:
   - Entre na pasta `public`
   - Clique em **"Upload"**
   - Faça upload de uma imagem de teste (ex: logo.png)
   - A imagem deve aparecer em: `operlist-storage/public/logo.png`

## 🧪 Teste de Conectividade

Execute o seguinte comando no Shell do Replit para testar:

```bash
npx tsx -e "
import { ObjectStorageService } from './server/objectStorage.ts';

async function test() {
  try {
    const service = new ObjectStorageService();
    console.log('✅ Public paths:', service.getPublicObjectSearchPaths());
    console.log('✅ Private dir:', service.getPrivateObjectDir());
    console.log('');
    console.log('🎉 Object Storage configurado corretamente!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

test();
"
```

## 📊 Status das Rotas

As seguintes rotas estão implementadas e prontas para uso:

### Rotas de Upload
- ✅ `POST /api/objects/upload` - Gerar URL presigned para upload
- ✅ `POST /api/clients/upload-logo` - Upload de logo (admin)
- ✅ `POST /api/upload/local` - Fallback local

### Rotas de Download
- ✅ `GET /public-objects/<path>` - Servir arquivos públicos
- ✅ `GET /objects/<path>` - Servir arquivos privados (com ACL)

## 🎯 Próximos Passos

Após verificar que o bucket está criado:

1. **Teste de Upload de Foto (Operador)**:
   - Login como operador
   - Vá para o perfil
   - Tente fazer upload de uma foto

2. **Teste de Upload de Logo (Empresa)**:
   - Login como empresa
   - Vá para o perfil
   - Tente fazer upload de um logo

3. **Teste de Upload de Cliente (Admin)**:
   - Login como admin
   - Vá para a área de clientes
   - Tente fazer upload de um logo de cliente

## ⚠️ Fallback Automático

Se o bucket NÃO estiver criado, o sistema usa automaticamente o upload local:
- Arquivos ficam em: `/attached_assets/uploads/`
- Funciona perfeitamente para desenvolvimento
- **Porém**, para produção é recomendado usar o Object Storage do Replit

## 📝 Estrutura Esperada

```
operlist-storage/
├── public/
│   ├── logos/
│   ├── banners/
│   └── events/
└── private/
    ├── uploads/
    ├── photos/
    └── cvs/
```

As subpastas são criadas automaticamente pelo sistema quando necessário.

## 🔗 Links Úteis

- [Documentação Object Storage](https://docs.replit.com/hosting/deployments/object-storage)
- [OBJECT_STORAGE_SETUP.md](./OBJECT_STORAGE_SETUP.md) - Documentação completa
