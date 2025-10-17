export type ApiLang = "cpp" | "java" | "python" | "javascript";

export type Problem = {
  pid: number;
  title: string;
  descriptionMd: string;
  difficulty: "easy" | "medium" | "hard" | string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  // Optional cache of user's last code per language if backend provides it
  codesByLanguage?: Partial<Record<ApiLang, string>>;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};
