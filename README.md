# Teca Capital EdTech

**Plataforma FinTech/EdTech de Educação Financeira Audiovisual Interativa**

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📚 Sobre o Projeto

A **Teca Capital EdTech** é uma startup angolana de Educação Financeira Audiovisual Interativa. Através do Simulador de Mercados e da Biblioteca Multimídia, os utilizadores aprendem teoricamente e praticam num único ambiente, sem risco real, desenvolvendo habilidades que ajudam na tomada de decisão financeira.

### 🎯 Missão

Levar a educação financeira de forma prática, simples e inclusiva para todos os angolanos e, progressivamente, para o mundo.

### 👁️ Visão

Tornar-se a maior empresa de tecnologia educacional de Angola, sendo a primeira escolha em aprendizagem experiencial financeira.

### 💎 Valores

- Responsabilidade Social
- Inovação
- Pensamento Crítico
- Conhecimento e Habilidades

---

## 🏗️ Arquitetura

### Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | HTML5 + CSS3 + JavaScript Vanilla (ES6 Modules) |
| **Gráficos** | Apache ECharts |
| **Ícones** | Font Awesome |
| **Backend** | Node.js + Express.js |
| **Base de Dados** | Neon PostgreSQL |
| **Dados de Mercado** | Ficheiros JSON |
| **Hospedagem Frontend** | GitHub Pages |
| **Hospedagem Backend** | Render |

### Estrutura de Pastas
Teca Capital EdTech/
├── frontend/ # Interface do utilizador
│ ├── pages/ # Páginas HTML
│ ├── css/ # Estilos
│ ├── js/ # JavaScript
│ └── assets/ # Recursos estáticos
├── backend/ # Servidor Node.js
│ ├── config/ # Configurações
│ ├── middleware/ # Middlewares
│ ├── routes/ # Rotas da API
│ ├── controllers/ # Controladores
│ ├── database/ # Queries e migrações
│ └── engine/ # Motor de simulação
├── scripts/ # Scripts utilitários
├── tests/ # Testes
└── documentacao/ # Documentação

text

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+ (ou Neon PostgreSQL)
- Git

### Passos

1. **Clonar o repositório**
```bash
git clone https://github.com/tecacapital/teca-capital-edtech.git
cd teca-capital-edtech