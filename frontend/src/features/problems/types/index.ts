export type Problem = {
  pid: number;
  title: string;
  descriptionMd: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
