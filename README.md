# Agenda Inteligente

Uma agenda digital multiplataforma para organizar notas, compromissos e informações úteis do dia a dia em um único lugar.

## Visão do projeto

O projeto será construído como um bloco de notas funcional e inteligente, com uma experiência consistente na web e em dispositivos móveis. A proposta é combinar organização pessoal, informações contextuais e recursos de produtividade em uma interface simples e prática.

## Principais funcionalidades

- **Bloco de notas:** criação, edição e organização de notas.
- **Notificações personalizadas:** lembretes configuráveis para compromissos e tarefas.
- **Calendários:** visualização e gerenciamento de eventos e compromissos.
- **Análise de clima:** consulta e apresentação de informações meteorológicas relevantes.
- **Relógio integrado:** exibição do horário atual e recursos relacionados à rotina.
- **Experiência multiplataforma:** funcionamento na web e em dispositivos móveis.

## Tecnologias

- **React:** construção da interface e dos componentes da aplicação.
- **TypeScript:** desenvolvimento com tipagem estática e maior segurança no código.
- **Tailwind CSS:** estilização responsiva e consistente.
- **Supabase:** backend, banco de dados, autenticação e recursos em tempo real.

## Objetivos

1. Criar uma agenda fácil de usar e acessível em diferentes dispositivos.
2. Centralizar notas, eventos, lembretes e informações do cotidiano.
3. Oferecer uma base técnica preparada para evolução contínua.
4. Manter uma interface responsiva, clara e agradável.

## Status

A base do projeto foi inicializada com React, Vite, TypeScript, Tailwind CSS e Supabase. As funcionalidades da agenda ainda não foram implementadas.

## Desenvolvimento

Instale as dependências:

```bash
npm install
```

Inicie o servidor local:

```bash
npm run dev
```

Para configurar o Supabase, copie `.env.example` para `.env.local` e preencha as variáveis do projeto:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Próximos passos

- Definir o modelo de dados para notas, eventos e notificações.
- Construir a interface responsiva para web e dispositivos móveis.
- Implementar os recursos de clima e relógio integrado.
