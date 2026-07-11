export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: string;
}

export const achievements: AchievementDefinition[] = [
  {
    id: "first-trace",
    title: "Primeiro Trace",
    description: "Respondeu corretamente ao primeiro desafio.",
    icon: "✦",
    condition: "Acertar um desafio de compreensão",
  },
  {
    id: "five-lessons",
    title: "Aprendiz",
    description: "Completou 5 lições.",
    icon: "◆",
    condition: "Concluir 5 lições",
  },
  {
    id: "ten-lessons",
    title: "Explorador",
    description: "Completou 10 lições.",
    icon: "★",
    condition: "Concluir 10 lições",
  },
  {
    id: "all-lessons",
    title: "Mestre",
    description: "Completou todas as lições.",
    icon: "♛",
    condition: "Concluir todas as 25 lições",
  },
  {
    id: "first-review",
    title: "Revisão Pontual",
    description: "Revisou o primeiro flashcard.",
    icon: "◈",
    condition: "Revisar um flashcard",
  },
];
