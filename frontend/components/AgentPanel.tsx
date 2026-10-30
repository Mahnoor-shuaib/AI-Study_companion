"use client";

import { useState } from "react";

const API_BASE = "http://127.0.0.1:8000";

const PROMPTS: Record<string, (t: string) => string> = {
  search: (t) => `Search my notes for ${t}`,
  summary: (t) => `Summarize the ${t} topic`,
  quiz: (t) => `Make a quiz on the ${t} topic`,
  past_paper: (t) => `Give me past paper questions on the ${t} topic`,
};

export default function AgentPanel({ mode, placeholder }: { mode: string; placeholder: string }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  async function ask() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const request = PROMPTS[mode](text.trim());
      const params = new URLSearchParams({ request });
      const res = await fetch(`${API_BASE}/agent?${params.toString()}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder={placeholder}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={ask} disabled={loading} style={{ padding: "8px 16px" }}>
          {loading ? "Loading..." : "Go"}
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {data && <AgentResult data={data} />}
    </div>
  );
}

function AgentResult({ data }: { data: any }) {
  const { intent, topic, answer, results } = data;

  if (intent === "search") {
    return (
      <div>
        <h3>Search results for: {topic}</h3>
        {results.length === 0 && <p>Nothing found.</p>}
        <ol>
          {results.map((r: string, i: number) => (
            <li key={i} style={{ marginBottom: 8 }}>{r}</li>
          ))}
        </ol>
      </div>
    );
  }

  if (typeof answer === "string") {
    return <p>{answer}</p>;
  }

  if (intent === "summary") {
    return (
      <div>
        <h3>Summary: {answer.topic}</h3>
        <p>{answer.summary}</p>
        <h4>Key points</h4>
        <ul>
          {answer.key_points.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
        <h4>Study steps</h4>
        <ol>
          {answer.study_steps.map((s: string, i: number) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </div>
    );
  }

  if (intent === "quiz") {
    return (
      <div>
        <h3>Quiz: {answer.topic}</h3>
        {answer.error && <p>{answer.error}</p>}
        {answer.questions.map((q: any, i: number) => (
          <div key={i} style={{ marginBottom: 16 }}>
            <p><b>{i + 1}. {q.question}</b></p>
            <ul>
              {q.options.map((o: string, j: number) => (
                <li key={j}>{o}</li>
              ))}
            </ul>
            <p><i>Answer: {q.answer}</i></p>
          </div>
        ))}
      </div>
    );
  }

  if (intent === "past_paper") {
    return (
      <div>
        <h3>Past paper questions: {answer.topic}</h3>
        {answer.error && <p>{answer.error}</p>}
        <ol>
          {answer.questions.map((q: any, i: number) => (
            <li key={i} style={{ marginBottom: 8 }}>
              {q.question} <i>({q.type})</i>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}