import { useEffect, useMemo, useRef, useState } from "react";
import type { ApiLang, Problem } from "@/features/problems/types";
type ProblemWithCodes = Problem & {
  codesByLanguage?: Partial<Record<ApiLang, string>>;
};
import { useParams } from "react-router-dom";
import { useProblem } from "@/features/problems/hooks/useProblems";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { cpp } from "@codemirror/lang-cpp";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  useExecuteSubmit,
  useExecuteTest,
  useMySubmissions,
} from "@/features/execute/hooks/useExecute";
import { useAiReview } from "@/features/ai/hooks/useAiReview";

const LANGUAGE_OPTIONS = [
  { value: "cpp", label: "C++" },
  { value: "java", label: "Java" },
  { value: "python", label: "Python" },
  { value: "javascript", label: "NodeJS" },
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
  javascript: `// Use Node.js runtime
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
      case "javascript":
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

  const [lang, setLang] = useState<Lang>("javascript");
  const [code, setCode] = useState<string>(DEFAULT_SNIPPETS["javascript"]);
  const [stdin, setStdin] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "test" | "submit" | "history" | "input"
  >("input");
  const [results, setResults] = useState<{
    test?: {
      stdout: string;
      stderr: string;
      exitCode: number;
      durationMs: number;
    } | null;
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
  const { mutateAsync: runSubmit, isPending: isSubmitting } =
    useExecuteSubmit();
  const { data: mySubs } = useMySubmissions();
  const { mutateAsync: reviewCode, isPending: isReviewing } = useAiReview();
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const initializedFromSources = useRef(false);
  const isInitializing = useRef(true);

  // Map between internal Lang and API naming used in codesByLanguage
  const langToApi = (l: Lang): ApiLang => l;
  const apiToLang = (api: ApiLang): Lang => api;

  const onChangeLang = (next: Lang) => {
    setLang(next);
    // Load code preference order: localStorage > codesByLanguage > default snippet
    const apiKey = langToApi(next);
    const lsKey = `code:problem:${pid}:${apiKey}`;
    const fromLocal = localStorage.getItem(lsKey);
    const codesByLanguage = (data?.problem as ProblemWithCodes | undefined)
      ?.codesByLanguage;
    console.log("codesByLanguage:", codesByLanguage, apiKey);
    const fromServer = codesByLanguage?.[apiKey];
    console.log("fromLocal:", fromLocal);
    console.log("fromServer:", fromServer);
    console.log("DEFAULT:", DEFAULT_SNIPPETS[next]);
    setCode(fromLocal ?? fromServer ?? DEFAULT_SNIPPETS[next]);
    // Persist selected language for this problem
    try {
      localStorage.setItem(`code:problem:${pid}:lang`, next);
    } catch {
      // ignore storage errors
    }
  };

  // Layout persistence helpers
  const colsKey = `layout:problem:${pid}:cols`;
  const leftRowsKey = `layout:problem:${pid}:leftRows`;
  const rightRowsKey = `layout:problem:${pid}:rightRows`;

  const readSizes = (key: string, fallback: number[]): number[] => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? (JSON.parse(raw) as number[]) : null;
      return parsed && parsed.length === fallback.length ? parsed : fallback;
    } catch {
      return fallback;
    }
  };
  const saveSizes = (key: string, sizes: number[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(sizes));
    } catch {
      // ignore write errors (storage may be unavailable)
    }
  };

  const cols = readSizes(colsKey, [50, 50]);
  const leftRows = readSizes(leftRowsKey, [70, 30]);
  const rightRows = readSizes(rightRowsKey, [60, 40]);

  // One-time initialization of language and code from localStorage or server
  useEffect(() => {
    if (!data?.problem || initializedFromSources.current) return;
    initializedFromSources.current = true;
    // Preferred language: saved lang -> server available lang -> default
    const savedLang = (() => {
      try {
        const raw = localStorage.getItem(`code:problem:${pid}:lang`);
        if (raw && ["cpp", "java", "python", "javascript"].includes(raw))
          return raw as Lang;
        return null;
      } catch {
        return null;
      }
    })();
    const codesByLanguage = (data.problem as ProblemWithCodes).codesByLanguage;
    const serverLangs = Object.keys(codesByLanguage || {}) as ApiLang[];
    const preferredApiLang = savedLang ? langToApi(savedLang) : serverLangs[0];
    const initialLang: Lang = preferredApiLang
      ? apiToLang(preferredApiLang)
      : "javascript";

    // Set language state first
    setLang(initialLang);

    // Resolve initial code with precedence: localStorage > server > default
    const apiKey = langToApi(initialLang);
    const lsKey = `code:problem:${pid}:${apiKey}`;
    const fromLocal = (() => {
      try {
        return localStorage.getItem(lsKey);
      } catch {
        return null;
      }
    })();
    const fromServer = codesByLanguage?.[apiKey];
    const initialCode =
      fromLocal ?? fromServer ?? DEFAULT_SNIPPETS[initialLang];
    setCode(initialCode);

    // Mark initialization complete after a frame to allow state to settle
    requestAnimationFrame(() => {
      isInitializing.current = false;
    });
  }, [data?.problem, pid]);

  // Persist code changes debounced per pid+language (skip during initialization)
  useEffect(() => {
    // Don't autosave during initial load to avoid overwriting server/localStorage code
    if (isInitializing.current) return;

    const apiKey = langToApi(lang);
    const key = `code:problem:${pid}:${apiKey}`;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(key, code);
      } catch {
        // ignore storage errors
      }
    }, 300);
    return () => clearTimeout(t);
  }, [pid, lang, code]);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (isError || !data?.problem)
    return <div className="p-6 text-red-500">Problem not found.</div>;

  const problem = data.problem;

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] p-6">
      <PanelGroup
        direction="horizontal"
        onLayout={(sizes) => saveSizes(colsKey, sizes as number[])}
        className="flex-1 min-h-0 rounded border"
      >
        {/* Left column: 0,0 description; 1,0 AI review if present */}
        <Panel defaultSize={cols[0]} minSize={20}>
          <div className="h-full min-h-0">
            {aiAdvice ? (
              <PanelGroup
                direction="vertical"
                onLayout={(sizes) => saveSizes(leftRowsKey, sizes as number[])}
                className="h-full min-h-0"
              >
                <Panel defaultSize={leftRows[0]} minSize={20}>
                  <div className="h-full overflow-auto p-6">
                    <h1 className="text-2xl font-semibold mb-2">
                      {problem.title}
                    </h1>
                    <div className="text-sm text-muted-foreground mb-4">
                      <span className="capitalize">{problem.difficulty}</span>
                      <span className="mx-2">•</span>
                      <span>{problem.tags.join(", ")}</span>
                    </div>
                    <article className="prose dark:prose-invert max-w-none">
                      <ReactMarkdown>{problem.descriptionMd}</ReactMarkdown>
                    </article>
                  </div>
                </Panel>
                <PanelResizeHandle className="h-1 bg-border" />
                <Panel defaultSize={leftRows[1]} minSize={10}>
                  <div className="h-full overflow-auto p-6">
                    <div className="text-sm font-medium mb-2">AI Review</div>
                    <article className="prose dark:prose-invert max-w-none text-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {aiAdvice}
                      </ReactMarkdown>
                    </article>
                  </div>
                </Panel>
              </PanelGroup>
            ) : (
              <div className="h-full overflow-auto p-6">
                <h1 className="text-2xl font-semibold mb-2">{problem.title}</h1>
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="capitalize">{problem.difficulty}</span>
                  <span className="mx-2">•</span>
                  <span>{problem.tags.join(", ")}</span>
                </div>
                <article className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {problem.descriptionMd}
                  </ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-border" />

        {/* Right column: 0,1 editor; 1,1 input/test/submit/history */}
        <Panel defaultSize={cols[1]} minSize={20}>
          <div className="h-full min-h-0">
            <PanelGroup
              direction="vertical"
              onLayout={(sizes) => saveSizes(rightRowsKey, sizes as number[])}
              className="h-full min-h-0"
            >
              <Panel defaultSize={rightRows[0]} minSize={20}>
                <div className="h-full min-h-0 flex flex-col">
                  <div className="flex items-center justify-between p-3 border-b">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">
                        Language
                      </label>
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
                          const mapped = lang;
                          try {
                            const res = await runTest({
                              language: mapped,
                              code,
                              stdin,
                            });
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
                          const mapped = lang;
                          try {
                            const res = await runSubmit({
                              pid,
                              language: mapped,
                              code,
                            });
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
                      <button
                        className="px-3 py-1 rounded border disabled:opacity-50"
                        disabled={isReviewing}
                        title="AI Review"
                        onClick={async () => {
                          const mapped = lang;
                          try {
                            const res = await reviewCode({
                              language: mapped,
                              code,
                              prompt: `Problem: ${problem.title}\n\n${
                                problem.descriptionMd
                              }\n\nDifficulty: ${
                                problem.difficulty
                              }\nTags: ${problem.tags.join(
                                ", "
                              )}\n\nReview the code for correctness, edge cases, time/space complexity, and suggest improvements if any.`,
                            });
                            setAiAdvice(res.advice);
                          } catch {
                            setAiAdvice(
                              "Failed to get AI review. Please try again."
                            );
                          }
                        }}
                      >
                        {isReviewing ? "Reviewing…" : "AI Review"}
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
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
              </Panel>

              <PanelResizeHandle className="h-1 bg-border" />

              {/* 1,1 bottom panel */}
              <Panel defaultSize={rightRows[1]} minSize={15}>
                <div className="h-full min-h-0 flex flex-col">
                  <div className="p-3 font-medium flex items-center gap-4 border-b">
                    <button
                      className={`text-sm ${
                        activeTab === "input"
                          ? "underline"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("input")}
                    >
                      Input
                    </button>
                    <button
                      className={`text-sm ${
                        activeTab === "test"
                          ? "underline"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("test")}
                    >
                      Test
                    </button>
                    <button
                      className={`text-sm ${
                        activeTab === "submit"
                          ? "underline"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("submit")}
                    >
                      Submit
                    </button>
                    <button
                      className={`text-sm ${
                        activeTab === "history"
                          ? "underline"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("history")}
                    >
                      History
                    </button>
                  </div>

                  <div className="flex-1 min-h-0 overflow-auto p-3">
                    {activeTab === "input" ? (
                      <div>
                        <label className="block text-sm text-muted-foreground mb-1">
                          Stdin (for test)
                        </label>
                        <textarea
                          className="w-full h-32 bg-background border rounded p-2 font-mono text-sm"
                          placeholder="Provide custom input when running test"
                          value={stdin}
                          onChange={(e) => setStdin(e.target.value)}
                        />
                      </div>
                    ) : activeTab === "test" ? (
                      results.test ? (
                        <div className="space-y-3">
                          <div className="text-sm">
                            Exit: {results.test.exitCode} •{" "}
                            {results.test.durationMs}ms
                          </div>
                          {results.test.stdout && (
                            <div>
                              <div className="text-sm font-medium mb-1">
                                Stdout
                              </div>
                              <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap text-sm">
                                {results.test.stdout}
                              </pre>
                            </div>
                          )}
                          {results.test.stderr && (
                            <div>
                              <div className="text-sm font-medium mb-1">
                                Stderr
                              </div>
                              <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap text-sm text-red-500">
                                {results.test.stderr}
                              </pre>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="hidden md:flex items-center justify-center text-muted-foreground h-full">
                          Run a test to see output here.
                        </div>
                      )
                    ) : activeTab === "submit" ? (
                      results.submit ? (
                        <div className="space-y-4">
                          <div className="text-sm">
                            Overall:{" "}
                            {results.submit.passed ? "Passed" : "Failed"} •{" "}
                            {results.submit.total} cases
                          </div>
                          <div className="space-y-3">
                            {results.submit.cases.map((c) => (
                              <div key={c.case} className="border rounded">
                                <div className="px-3 py-2 border-b text-sm flex items-center justify-between">
                                  <div className="font-medium">
                                    Case {c.case}
                                  </div>
                                  <div
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      c.pass
                                        ? "bg-green-500/20 text-green-600"
                                        : "bg-red-500/20 text-red-600"
                                    }`}
                                  >
                                    {c.pass ? "Pass" : "Fail"}
                                  </div>
                                </div>
                                <div className="p-3 grid grid-cols-1 gap-3 text-sm">
                                  <div>
                                    <div className="text-muted-foreground mb-1">
                                      Input
                                    </div>
                                    <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">
                                      {c.input}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground mb-1">
                                      Expected
                                    </div>
                                    <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">
                                      {c.expected}
                                    </pre>
                                  </div>
                                  <div>
                                    <div className="text-muted-foreground mb-1">
                                      Output
                                    </div>
                                    <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">
                                      {c.stdout}
                                    </pre>
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
                      )
                    ) : (
                      <div className="space-y-3">
                        {(mySubs?.submissions || [])
                          .filter((s) => s.pid === pid)
                          .map((s) => (
                            <div key={s._id} className="border rounded">
                              <div className="px-3 py-2 border-b text-sm flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">
                                    {new Date(s.createdAt).toLocaleString()}
                                  </span>
                                  <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                    {s.language}
                                  </span>
                                </div>
                                <div
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    s.passed
                                      ? "bg-green-500/20 text-green-600"
                                      : "bg-red-500/20 text-red-600"
                                  }`}
                                >
                                  {s.passed ? "Passed" : "Failed"}
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                {s.results.map((r) => (
                                  <div key={r.case} className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                      <div className="text-muted-foreground">
                                        Case {r.case} • {r.durationMs}ms
                                      </div>
                                      <div
                                        className={`text-xs px-1.5 py-0.5 rounded inline-block ${
                                          r.pass
                                            ? "bg-green-500/20 text-green-600"
                                            : "bg-red-500/20 text-red-600"
                                        }`}
                                      >
                                        {r.pass ? "Pass" : "Fail"}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-muted-foreground mb-1">
                                        Stdout
                                      </div>
                                      <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap">
                                        {r.stdout}
                                      </pre>
                                    </div>
                                    {r.stderr && (
                                      <div>
                                        <div className="text-muted-foreground mb-1">
                                          Stderr
                                        </div>
                                        <pre className="bg-muted/30 p-2 rounded whitespace-pre-wrap text-red-500">
                                          {r.stderr}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        {mySubs &&
                          mySubs.submissions.filter((s) => s.pid === pid)
                            .length === 0 && (
                            <div className="text-muted-foreground">
                              No submissions yet for this problem.
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}
