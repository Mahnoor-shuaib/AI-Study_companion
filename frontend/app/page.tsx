"use client";

import { useState } from "react";

type StudyPlan = {
  topic: string;
  summary: string;
  key_points: string[];
  study_steps: string[];
};

const API_BASE = "http://127.0.0.1:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [upload, setUpload] = useState<{ ok: boolean; text: string } | null>(null);

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState<number[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUpload(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUpload(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/store-document`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("upload failed");
      const data = await res.json();
      setUpload({ ok: true, text: `Saved ${data.total_chunks} chunks from ${file.name}.` });
    } catch {
      setUpload({
        ok: false,
        text: "Upload failed. Check that the backend is running on port 8000.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setPlan(null);
    setError("");
    setDone([]);

    try {
      const res = await fetch(`${API_BASE}/study-plan?topic=${encodeURIComponent(topic)}`);
      if (!res.ok) throw new Error("plan failed");
      const data: StudyPlan = await res.json();
      setPlan(data);
    } catch {
      setError("Couldn't build a plan. Check the backend terminal for the error, then try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (i: number) =>
    setDone((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]));

  return (
    <main
      className="min-h-screen bg-[#F3F7FB] text-[#14213D]"
      style={{
        backgroundImage:
          "linear-gradient(#DCE6F2 1px, transparent 1px), linear-gradient(90deg, #DCE6F2 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <header className="mb-10 max-w-xl">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight sm:text-5xl">
            Study Companion
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#14213D]/70">
            Upload your lecture notes, name a topic, and get a plan built only from what your
            notes say.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[340px_1fr]">
          {/* Left: notes */}
          <section className="rounded-md border border-[#14213D]/15 bg-white p-6 shadow-[4px_4px_0_0_#14213D]">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">
              Your notes
            </h2>
            <p className="mt-1 text-sm text-[#14213D]/60">
              PDF, PowerPoint, Word or plain text.
            </p>

            <label className="mt-5 block cursor-pointer">
              <input
                type="file"
                accept=".txt,.pdf,.docx,.pptx"
                onChange={handleFileChange}
                className="peer sr-only"
              />
              <div className="rounded-sm border-2 border-dashed border-[#14213D]/30 px-4 py-8 text-center transition-colors hover:border-[#14213D] hover:bg-[#F3F7FB] peer-focus-visible:ring-2 peer-focus-visible:ring-[#14213D] peer-focus-visible:ring-offset-2">
                {file ? (
                  <>
                    <span className="block break-words text-sm font-semibold">{file.name}</span>
                    <span className="mt-1 block text-xs text-[#14213D]/60">
                      Click to choose a different file
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-semibold">Choose a file from your computer</span>
                )}
              </div>
            </label>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="mt-4 w-full rounded-sm bg-[#14213D] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1f3260] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14213D] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? "Saving notes…" : "Save notes"}
            </button>

            {upload && (
              <p
                role="status"
                className={`mt-4 text-sm font-medium ${
                  upload.ok ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {upload.text}
              </p>
            )}
          </section>

          {/* Right: the sheet */}
          <section className="min-h-[28rem] rounded-md border border-[#14213D]/15 bg-white shadow-[4px_4px_0_0_#14213D]">
            <div className="border-l-[3px] border-[#F08A8A] ml-8 sm:ml-12 px-6 py-7 sm:px-8">
              <form onSubmit={handleGenerate}>
                <label
                  htmlFor="topic"
                  className="font-[family-name:var(--font-display)] text-xl font-bold"
                >
                  What do you want to study?
                </label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    id="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="For example: structures, prototyping"
                    className="flex-1 rounded-sm border border-[#14213D]/30 bg-white px-4 py-3 text-sm placeholder:text-[#14213D]/40 focus:border-[#14213D] focus:outline-2 focus:outline-offset-2 focus:outline-[#14213D]"
                  />
                  <button
                    type="submit"
                    disabled={!topic.trim() || loading}
                    className="rounded-sm bg-[#FFE45C] px-6 py-3 text-sm font-bold text-[#14213D] ring-1 ring-[#14213D] transition-colors hover:bg-[#ffd92e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#14213D] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? "Building…" : "Build study plan"}
                  </button>
                </div>
              </form>

              {loading && (
                <p role="status" className="mt-8 flex items-center gap-3 text-sm text-[#14213D]/70">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#14213D] border-t-transparent motion-reduce:animate-none" />
                  Reading your notes…
                </p>
              )}

              {error && (
                <p role="alert" className="mt-8 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              {!plan && !loading && !error && (
                <p className="mt-8 max-w-[52ch] text-sm leading-relaxed text-[#14213D]/60">
                  Save a file on the left, then type a topic from it. Your plan will appear on
                  this page.
                </p>
              )}

              {plan && (
                <article className="mt-8">
                  <h3 className="font-[family-name:var(--font-display)] text-3xl font-extrabold leading-tight">
                    {plan.topic}
                  </h3>
                  <p className="mt-4 max-w-[65ch] text-base leading-relaxed">{plan.summary}</p>

                  <h4 className="mt-9 font-[family-name:var(--font-display)] text-lg font-bold">
                    Key points
                  </h4>
                  <ul className="mt-3 max-w-[65ch] space-y-3">
                    {plan.key_points?.map((point, i) => (
                      <li key={i} className="text-base leading-relaxed">
                        <span className="box-decoration-clone bg-[#FFE45C]/70 px-1">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex items-baseline justify-between gap-4">
                    <h4 className="font-[family-name:var(--font-display)] text-lg font-bold">
                      Study steps
                    </h4>
                    <span className="text-sm text-[#14213D]/60">
                      {done.length} of {plan.study_steps?.length ?? 0} done
                    </span>
                  </div>
                  <ol className="mt-3 max-w-[65ch] space-y-2">
                    {plan.study_steps?.map((step, i) => {
                      const checked = done.includes(i);
                      return (
                        <li key={i}>
                          <label className="flex cursor-pointer items-start gap-3 rounded-sm px-2 py-2 hover:bg-[#F3F7FB]">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleStep(i)}
                              className="mt-1 h-4 w-4 shrink-0 accent-[#14213D]"
                            />
                            <span
                              className={`text-base leading-relaxed ${
                                checked ? "text-[#14213D]/45 line-through" : ""
                              }`}
                            >
                              {step}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ol>
                </article>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}