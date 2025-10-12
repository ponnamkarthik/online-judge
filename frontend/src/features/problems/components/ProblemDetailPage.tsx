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
import { useExecuteSubmit, useExecuteTest } from "@/features/execute/hooks/useExecute";

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
  const [stdin, setStdin] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"test" | "submit">("test");
  const [results, setResults] = useState<{
    test?: { stdout: string; stderr: string; exitCode: number; durationMs: number } | null;
    submit?: {
      total: number;
      passed: boolean;
      cases: Array<{
        case: number;
        input: string;
        expected: string;
        stdout: string;
        stderr: string;
        exitCode: number;
        timedOut: boolean;
        pass: boolean;
        durationMs: number;
      }>;
    } | null;
  }>({});

  const extensions = useLanguageExtensions(lang);
  const { mutateAsync: runTest, isPending: isTesting } = useExecuteTest();
  const { mutateAsync: runSubmit, isPending: isSubmitting } = useExecuteSubmit();

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
                className="px-3 py-1 rounded bg-primary text-primary-foreground disabled:opacity-50"
                disabled={isTesting}
                onClick={async () => {
                  setActiveTab("test");
                  const mapped = lang === "node" ? "javascript" : lang;
                  try {
                    const res = await runTest({ language: mapped, code, stdin });
                    setResults((prev) => ({
                      ...prev,
                      test: {
                        stdout: res.result.stdout,
                        stderr: res.result.stderr,
                        exitCode: res.result.exitCode,
                        durationMs: res.result.durationMs,
                      },
                    }));
                  } catch {
                    setResults((prev) => ({
                      ...prev,
                      test: {
                        stdout: "",
                        stderr: "Execution failed",
                        exitCode: -1,
                        durationMs: 0,
                      },
                    }));
                  }
                }}
              >
                {isTesting ? "Running…" : "Run (test)"}
              </button>
              <button
                className="px-3 py-1 rounded bg-foreground text-background disabled:opacity-50"
                disabled={isSubmitting}
                onClick={async () => {
                  setActiveTab("submit");
                  const mapped = lang === "node" ? "javascript" : lang;
                  try {
                    const res = await runSubmit({ pid, language: mapped, code });
                    setResults((prev) => ({
                      ...prev,
                      submit: {
                        total: res.total,
                        passed: res.passed,
                        cases: res.results.map((r) => ({
                          case: r.case,
                          input: r.input,
                          expected: r.expected,
                          stdout: r.stdout,
                          stderr: r.stderr,
                          exitCode: r.exitCode,
                          timedOut: r.timedOut,
                          pass: r.pass,
                          durationMs: r.durationMs,
                        })),
                      },
                    }));
                  } catch {
                    setResults((prev) => ({
                      ...prev,
                      submit: {
                        total: 0,
                        passed: false,
                        cases: [],
                      },
                    }));
                  }
                }}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
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
          <div className="border-t p-3">
            <label className="block text-sm text-muted-foreground mb-1">Stdin (for test)</label>
            <textarea
              className="w-full h-24 bg-background border rounded p-2 font-mono text-sm"
              placeholder="Provide custom input when running test"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>
        </div>

        {/* Result panel */}
        <div className="flex flex-col min-h-[40dvh]">
          <div className="p-3 border-b font-medium flex items-center gap-4">
            <button
              className={`text-sm ${activeTab === "test" ? "underline" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("test")}
            >
              Test
            </button>
            <button
              className={`text-sm ${activeTab === "submit" ? "underline" : "text-muted-foreground"}`}
              onClick={() => setActiveTab("submit")}
            >
              Submit
            </button>
          </div>

          {/* Panels */}
          <div className="flex-1 overflow-auto">
            {activeTab === "test" ? (
              results.test ? (
                <div className="p-3 space-y-3">
                  <div className="text-sm">Exit: {results.test.exitCode} • {results.test.durationMs}ms</div>
                  {results.test.stdout && (
                    <div>
                      <div className="text-sm font-medium mb-1">Stdout</div>
                      <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap text-sm">{results.test.stdout}</pre>
                    </div>
                  )}
                  {results.test.stderr && (
                    <div>
                      <div className="text-sm font-medium mb-1">Stderr</div>
                      <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap text-sm text-red-500">{results.test.stderr}</pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center justify-center text-muted-foreground h-full">
                  Run a test to see output here.
                </div>
              )
            ) : results.submit ? (
              <div className="p-3 space-y-4">
                <div className="text-sm">Overall: {results.submit.passed ? "Passed" : "Failed"} • {results.submit.total} cases</div>
                <div className="space-y-3">
                  {results.submit.cases.map((c) => (
                    <div key={c.case} className="border rounded">
                      <div className="px-3 py-2 border-b text-sm font-medium flex items-center justify-between">
                        <div>Case {c.case}</div>
                        <div className={`text-xs px-2 py-0.5 rounded ${c.pass ? "bg-green-500/20 text-green-600" : "bg-red-500/20 text-red-600"}`}>
                          {c.pass ? "Pass" : "Fail"}
                        </div>
                      </div>
                      <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground mb-1">Input</div>
                          <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">{c.input}</pre>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Expected</div>
                          <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">{c.expected}</pre>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">Output</div>
                          <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">{c.stdout}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center justify-center text-muted-foreground h-full">
                Submit the code to see test results here.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
