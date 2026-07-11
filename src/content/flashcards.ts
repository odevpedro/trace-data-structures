export interface FlashcardDefinition {
  id: string;
  lessonId: string;
  front: string;
  back: string;
  kind: "concept" | "complexity" | "comparison";
}

export const flashcards: FlashcardDefinition[] = [
  {
    id: "array-insert-cost",
    lessonId: "array",
    front: "Qual é o custo de inserir no meio de um array?",
    back: "O(n) no pior caso, porque os elementos posteriores precisam ser deslocados.",
    kind: "complexity",
  },
  {
    id: "linear-search-stop",
    lessonId: "linear-search",
    front: "Quando uma busca linear pode parar antes de tocar n itens?",
    back: "Quando encontra o alvo. O melhor caso é o primeiro item: O(1).",
    kind: "concept",
  },
  {
    id: "reference-mutation",
    lessonId: "memory-reference",
    front: "Ao mutar um objeto, a referência precisa mudar?",
    back: "Não. A referência pode continuar apontando para o mesmo objeto, cujo conteúdo foi alterado.",
    kind: "comparison",
  },
];
