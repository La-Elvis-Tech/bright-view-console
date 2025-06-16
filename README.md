
# 🧪 La Elvis Tech - Sistema de Gestão Laboratorial

![La Elvis Tech](public/logolaelvis.svg)

Um sistema moderno e completo para gestão de laboratórios médicos, desenvolvido com tecnologias de ponta para oferecer uma experiência intuitiva e eficiente.

## 🚀 Funcionalidades Principais

### 📊 Dashboard Interativo
- **Visão Geral Completa**: Acompanhe métricas importantes em tempo real
- **Gráficos 3D**: Visualizações avançadas usando Three.js e React Three Fiber
- **Charts Responsivos**: Gráficos dinâmicos com Recharts
- **Indicadores de Performance**: KPIs essenciais para tomada de decisão

### 🧬 Gestão de Inventário
- **Controle de Reagentes**: Monitoramento de estoque de materiais laboratoriais
- **Alertas de Vencimento**: Notificações automáticas para itens próximos ao vencimento
- **Histórico de Movimentação**: Rastreabilidade completa de entrada e saída
- **Relatórios de Consumo**: Análises detalhadas de uso de materiais

### 🔬 Sistema de Exames
- **Cadastro de Exames**: Interface intuitiva para registro de novos exames
- **Acompanhamento de Status**: Workflow completo do processo laboratorial
- **Resultados Digitais**: Armazenamento e visualização de resultados
- **Impressão de Laudos**: Geração automática de relatórios profissionais

### 📅 Agendamentos
- **Calendário Interativo**: Visualização clara de horários disponíveis
- **Gestão de Pacientes**: Cadastro e histórico completo
- **Notificações**: Lembretes automáticos para pacientes e equipe
- **Relatórios de Ocupação**: Análise de produtividade por período

### 📈 Relatórios e Analytics
- **Dashboards Personalizáveis**: Métricas adaptadas às necessidades
- **Exportação de Dados**: Relatórios em PDF, Excel e outros formatos
- **Análises Temporais**: Comparativos e tendências históricas
- **Indicadores de Qualidade**: Métricas de performance operacional

### ⚙️ Configurações Avançadas
- **Perfis de Usuário**: Gestão completa de permissões e acessos
- **Configurações de Laboratório**: Personalização de dados da empresa
- **Notificações**: Sistema completo de alertas e lembretes
- **Segurança**: Configurações de autenticação e logs de acesso

## 🛠️ Tecnologias Utilizadas

### Frontend Framework
- **React 18.3.1**: Biblioteca principal para interface de usuário
- **TypeScript**: Tipagem estática para maior robustez do código
- **Vite**: Build tool moderno e rápido para desenvolvimento

### Styling & UI
- **Tailwind CSS 4.1.7**: Framework CSS utilitário para design responsivo
- **Shadcn/UI**: Componentes pré-construídos e acessíveis
- **Radix UI**: Primitivos de UI headless para máxima flexibilidade
- **Class Variance Authority**: Gerenciamento de variantes de componentes
- **Tailwind Merge**: Otimização de classes CSS

### Animações & Interações
- **GSAP 3.13.0**: Animações profissionais de alta performance
- **Framer Motion 12.12.2**: Animações declarativas para React
- **Lucide React**: Biblioteca de ícones SVG consistente e moderna

### 3D & Visualizações
- **Three.js 0.176.0**: Biblioteca 3D para web
- **React Three Fiber 8.18.0**: Integração React para Three.js
- **React Three Drei 9.122.0**: Helpers e abstrações para R3F
- **Recharts 2.12.7**: Biblioteca de gráficos responsivos

### Roteamento & Estado
- **React Router DOM 6.26.2**: Roteamento declarativo
- **TanStack React Query 5.56.2**: Gerenciamento de estado servidor
- **React Hook Form 7.53.0**: Formulários performáticos com validação

### Utilitários & Helpers
- **Date-fns 3.6.0**: Manipulação moderna de datas
- **Zod 3.23.8**: Validação de schemas TypeScript-first
- **Clsx 2.1.1**: Utilitário para classes condicionais

### Temas & Acessibilidade
- **Next Themes 0.3.0**: Sistema de temas dark/light
- **React Day Picker 8.10.1**: Seletor de datas acessível
- **Sonner 1.5.0**: Notificações toast elegantes

## 🎨 Design System

### Paleta de Cores
O sistema utiliza um design system completo com cores semânticas:
- **Primary**: Tons de azul lab (`lab-blue`)
- **Secondary**: Gradientes purple/indigo
- **Success**: Verde para estados positivos
- **Warning**: Amarelo para alertas
- **Error**: Vermelho para erros
- **Neutral**: Escala de cinzas para textos e backgrounds

### Tipografia
- **Font Primary**: Inter (sistema padrão)
- **Font Display**: Michroma (logotipos e títulos especiais)

### Componentes Reutilizáveis
- Buttons com múltiplas variantes
- Cards com shadows e borders consistentes
- Forms com validação integrada
- Modals e dialogs acessíveis
- Tables responsivas com sorting

## 🏗️ Arquitetura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base do design system
│   ├── settings/       # Componentes específicos de configurações
│   └── appointments/   # Componentes de agendamento
├── pages/              # Páginas principais da aplicação
├── context/            # Contextos React (Auth, Theme)
├── hooks/              # Custom hooks
├── services/           # Serviços de API e integrações
├── types/              # Definições TypeScript
├── utils/              # Funções utilitárias
└── data/               # Dados mockados e constantes
```

### Padrões de Desenvolvimento
- **Component Composition**: Componentes compostos e reutilizáveis
- **Custom Hooks**: Lógica de negócio separada em hooks
- **Context Pattern**: Gerenciamento de estado global
- **TypeScript First**: Tipagem em todos os arquivos
- **Responsive Design**: Mobile-first approach

## 🔐 Sistema de Autenticação

### Recursos de Segurança
- **JWT Tokens**: Autenticação baseada em tokens
- **Role-based Access**: Controle de acesso por perfis
- **Session Management**: Gestão automática de sessões
- **Auto Logout**: Logout automático por inatividade

### Perfis de Usuário
- **Administrador**: Acesso completo ao sistema
- **Usuário**: Acesso limitado às funcionalidades operacionais

## 📱 Responsividade

O sistema foi desenvolvido com abordagem mobile-first:
- **Desktop**: Layout completo com sidebar expansível
- **Tablet**: Adaptação automática de componentes
- **Mobile**: Interface otimizada com navegação por sheet

### Breakpoints
- `sm`: 640px+ (tablet)
- `md`: 768px+ (desktop pequeno)
- `lg`: 1024px+ (desktop)
- `xl`: 1280px+ (desktop grande)

## 🎯 Performance

### Otimizações Implementadas
- **Code Splitting**: Carregamento lazy de rotas
- **Tree Shaking**: Eliminação de código não utilizado
- **Asset Optimization**: Compressão de imagens e SVGs
- **Caching Strategy**: Cache inteligente de requisições

### Métricas de Performance
- **First Paint**: < 1.5s
- **Interactive**: < 3s
- **Bundle Size**: Otimizado para < 500KB gzipped

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18.x ou superior
- npm, yarn ou bun

### Instalação
```bash
# Clone o repositório
git clone [repository-url]

# Instale as dependências
npm install
# ou
yarn install
# ou
bun install

# Execute em modo desenvolvimento
npm run dev
# ou
yarn dev
# ou
bun dev
```

### Build para Produção
```bash
# Gere o build de produção
npm run build

# Execute o preview local
npm run preview
```

## 🌟 Funcionalidades Futuras

### Roadmap
- [ ] **API Integration**: Conexão com backend real
- [ ] **Real-time Updates**: WebSocket para atualizações em tempo real
- [ ] **Advanced Reports**: Relatórios com IA e machine learning
- [ ] **Mobile App**: Aplicativo nativo para iOS/Android
- [ ] **Multi-tenant**: Suporte para múltiplos laboratórios
- [ ] **Integration APIs**: Conectores para equipamentos laboratoriais

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

Desenvolvido com ❤️ pela equipe La Elvis Tech

---

*Sistema de Gestão Laboratorial - Transformando a medicina através da tecnologia*
