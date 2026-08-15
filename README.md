# 🌐 Frontend Web - Plataforma de Eventos (Elite Tickets)

Este repositório contém a **Aplicação Cliente (SPA)** da plataforma de eventos e ingressos.

A aplicação foi construída visando **performance**, **componentização**, **responsividade** e uma **experiência de usuário (UX) fluida**, atendendo de forma unificada aos três papéis distintos do sistema:

* **Organizador**
* **Cliente**
* **Portaria**

---

## 🌟 Principais Destaques e Soluções de Engenharia

O Front-end foi desenvolvido com foco não apenas na interface, mas também na implementação de regras de negócio e fluxos específicos da aplicação.

### 💺 Mapa de Assentos Interativo

Criação dinâmica de uma grade de assentos para eventos de teatro/cinema, baseada nas dimensões de **fileiras × cadeiras** fornecidas pela API.

O sistema mantém o estado dos assentos selecionados e impede a seleção de cadeiras que já estejam ocupadas.

### 📷 Leitor de QR Code Híbrido e Estável

Implementação do `html5-qrcode` utilizando diretamente a API do motor de leitura, sem depender da UI injetada pela biblioteca.

Essa abordagem evita conflitos com o ciclo de vida do React, incluindo erros relacionados a `removeChild` durante a desmontagem de componentes.

O leitor permite validação através de:

* 📹 **Câmera ao vivo**
* 🖼️ **Upload de imagem ou print do QR Code**

### ⏱️ Filtro de Tolerância da Vitrine

Regra de negócio implementada no Front-end para ocultar automaticamente da vitrine do Cliente eventos que tenham iniciado há mais de **30 minutos**.

Os eventos continuam disponíveis no painel administrativo do Organizador.

### 🎬 Auto-preenchimento com TMDb

Integração com a API do **TMDb** para facilitar a criação de eventos pelo Organizador.

Através da busca, informações como:

* Cartaz;
* Título;
* Sinopse;

podem ser utilizadas para agilizar o preenchimento dos dados do evento.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia           | Utilização                                          |
| -------------------- | --------------------------------------------------- |
| **React.js**         | Biblioteca principal para construção das interfaces |
| **Vite**             | Build tool e servidor de desenvolvimento            |
| **Tailwind CSS**     | Estilização utilitária e design responsivo          |
| **React Router DOM** | Roteamento client-side da SPA                       |
| **Axios**            | Cliente HTTP para consumo da API REST               |
| **Html5-Qrcode**     | Motor de decodificação de QR Codes                  |

---

## 🎨 Design System

A interface utiliza uma paleta customizada baseada em tons de **azul e ardósia**, configurada no `tailwind.config.js` através das cores `brand-100` até `brand-500`.

| Cor            | Hexadecimal | Utilização                          |
| -------------- | ----------- | ----------------------------------- |
| 🟦 `brand-100` | `#cee5f2`   | Backgrounds sutis                   |
| 🟦 `brand-200` | `#accbe1`   | Elementos secundários               |
| 🟦 `brand-300` | `#7c98b3`   | Bordas e divisores                  |
| 🟦 `brand-400` | `#637081`   | Textos auxiliares                   |
| 🟦 `brand-500` | `#536b78`   | Ações principais e textos primários |

Essa padronização garante maior consistência visual entre as diferentes áreas da aplicação.

---

## 🚀 Como Executar Localmente

> 💡 **Dica:** Para executar o ecossistema completo, incluindo banco de dados e API, utilizando Docker, consulte o repositório central **[docs-e-infra](link-do-repo-infra)**.

Para executar apenas o Front-end:

### 1. Clone o repositório

```bash
git clone https://github.com/SuaOrganizacao/frontend-web.git
cd frontend-web
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto e configure a URL da API:

```env
VITE_API_URL=http://localhost:8000
```

> A variável pode ser configurada para apontar tanto para uma API local quanto para o ambiente de produção.

### 3. Instale as dependências

```bash
npm install
```

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

```text
http://localhost:5173
```

---

## 🚢 Deploy e Hospedagem

A aplicação está configurada para **deploy contínuo na Vercel**.

**Acesse o projeto em produção:** https://frontend-web-blond-two.vercel.app/

### 🔧 Roteamento em Produção (SPA)

Como a aplicação utiliza **React Router DOM**, acessos diretos a rotas internas, como:

```text
/dashboard
/events
/tickets
```

podem resultar em `404: NOT_FOUND` se o servidor tentar localizar essas rotas como arquivos físicos.

Para solucionar esse problema, o projeto possui um arquivo `vercel.json` na raiz.

O arquivo configura um **rewrite** das requisições para o `index.html`, permitindo que o `react-router-dom` assuma o controle do roteamento no lado do cliente.

---

## 👨‍💻 Desenvolvedor

Desenvolvido por **Robson do Amaral Diógenes**.
