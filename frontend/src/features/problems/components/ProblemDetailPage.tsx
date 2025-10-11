import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useProblem } from "@/features/problems/hooks/useProblems";
import ReactMarkdown from "react-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";

const LANGUAGE_OPTIONS = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "node", label: "NodeJS" },
] as const;

type Lang = (typeof LANGUAGE_OPTIONS)[number]["value"];

const DEFAULT_SNIPPETS: Record<Lang, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  ios::sync_with_stdio(false);
  cin.tie(nullptr);
  // TODO: read input and print output
  cout << "Hello from C++" << "\n";
  return 0;
}
`,
  java: `import java.io.*;
import java.util.*;

public class Main {
  public static void main(String[] args) throws Exception {
    BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    // TODO: read input and print output
    System.out.println("Hello from Java");
  }
}
`,
  python: `import sys

def main():
    # TODO: read input and print output
    print("Hello from Python")

if __name__ == "__main__":
    main()
`,
  node: `// Use Node.js runtime
// Read from stdin and write to stdout
const fs = require('fs');
const input = fs.readFileSync(0, 'utf8').trim();
// TODO: parse input and print output
console.log('Hello from NodeJS');
`,
};

function useLanguageExtensions(lang: Lang) {
  return useMemo(() => {
    switch (lang) {
      case "cpp":
        return [cpp()];
      case "java":
        return [java()];
      case "python":
        return [python()];
      case "node":
        return [javascript({ jsx: false, typescript: false })];
      default:
        return [];
    }
  }, [lang]);
}

export function ProblemDetailPage() {
  const params = useParams();
  const pid = Number(params.pid);
  const { data, isLoading, isError } = useProblem(pid);

  const [lang, setLang] = useState<Lang>("node");
  const [code, setCode] = useState<string>(DEFAULT_SNIPPETS["node"]);
  const [result, setResult] = useState<string | null>(null);

  const extensions = useLanguageExtensions(lang);

  const onChangeLang = (next: Lang) => {
    setLang(next);
    setCode(DEFAULT_SNIPPETS[next]);
  };

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data?.problem)
    return <div className="p-6 text-red-500">Problem not found.</div>;

  const problem = data.problem;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)]">
      {/* Top: Problem statement (half height) */}
      <section className="border-b overflow-auto p-6 grow">
        <h1 className="text-2xl font-semibold mb-2">{problem.title}</h1>
        <div className="text-sm text-muted-foreground mb-4">
          <span className="capitalize">{problem.difficulty}</span>
          <span className="mx-2">•</span>
          <span>{problem.tags.join(", ")}</span>
        </div>
        <article className="prose max-w-none">
          <ReactMarkdown>{problem.descriptionMd}</ReactMarkdown>
        </article>
      </section>

      {/* Bottom: Split into editor + result */}
      <section className="grid grid-cols-1 md:grid-cols-2 grow min-h-[40dvh]">
        {/* Editor */}
        <div className="flex flex-col border-r min-h-[40dvh]">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Language</label>
              <select
                className="bg-background border px-2 py-1 rounded"
                value={lang}
                onChange={(e) => onChangeLang(e.target.value as Lang)}
              >
                {LANGUAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 rounded bg-primary text-primary-foreground"
                onClick={() => {
                  // TODO: hook to run code in next phases
                  setResult(
                    "Running locally is not wired yet. This is a placeholder result."
                  );
                }}
              >
                Run
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <CodeMirror
              className="h-full"
              value={code}
              height="100%"
              theme={oneDark}
              extensions={extensions}
              onChange={(v) => setCode(v)}
            />
          </div>
        </div>

        {/* Result panel */}
        {result ? (
          <div className="flex flex-col min-h-[40dvh]">
            <div className="p-3 border-b font-medium">Result</div>
            <pre className="flex-1 overflow-auto p-3 text-sm bg-muted/30 whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        ) : (
          <div className="hidden md:flex items-center justify-center text-muted-foreground">
            Run the code to see the output here.
          </div>
        )}
      </section>
    </div>
  );
}
