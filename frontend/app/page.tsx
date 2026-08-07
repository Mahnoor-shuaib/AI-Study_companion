"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [topic, setTopic] = useState("");
  const [studyPlan, setStudyPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "http://127.0.0.1:8000";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setUploadMessage("");
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMessage("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/store-document`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadMessage(`✓ Stored ${data.total_chunks} chunks successfully`);
    } catch (err) {
      setUploadMessage("✗ Upload failed. Check backend server.");
    } finally {
      setUploading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!topic) return;
    setLoading(true);
    setStudyPlan(null);

    try {
      const res = await fetch(`${API_BASE}/study-plan?topic=${encodeURIComponent(topic)}`);
      const data = await res.json();
      setStudyPlan(data);
    } catch (err) {
      setStudyPlan({ error: "Failed to generate study plan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0f0c29] bg-gradient-to-br from-[#1a1a3e] via-[#2d1b4e] to-[#1a1a3e]">
      {/* Top Nav Bar */}
      <nav className="border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl shadow-lg shadow-violet-500/30">
            🧠
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Study Companion</h1>
            <p className="text-violet-300/70 text-xs">AI-powered notes & study plans</p>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Upload Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl" />

          <div className="relative flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm font-bold shadow-lg shadow-violet-500/30">
              1
            </span>
            <h2 className="text-xl font-semibold text-white">Upload Your Notes</h2>
          </div>

          <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-violet-400/30 rounded-2xl p-10 cursor-pointer hover:border-violet-400/60 hover:bg-violet-500/5 transition-all duration-200 group">
            <input type="file" accept=".txt,.pdf,.docx,.pptx" onChange={handleFileChange} className="hidden" />
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <span className="text-2xl">{file ? "📄" : "📁"}</span>
            </div>
            <span className="text-violet-200 text-sm font-medium">
              {file ? file.name : "Click to select a file"}
            </span>
            <span className="text-violet-400/60 text-xs mt-1">.txt, .pdf, .docx, .pptx supported</span>
          </label>

          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="relative mt-5 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-violet-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
          >
            {uploading ? "Uploading..." : "Upload & Store"}
          </button>

          {uploadMessage && (
            <p className={`relative mt-4 text-sm font-medium ${uploadMessage.startsWith("✓") ? "text-emerald-400" : "text-rose-400"}`}>
              {uploadMessage}
            </p>
          )}
        </div>

        {/* Study Plan Card */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.06] border border-white/10 backdrop-blur-xl p-8 shadow-2xl">
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-fuchsia-600/20 rounded-full blur-3xl" />

          <div className="relative flex items-center gap-3 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-sm font-bold shadow-lg shadow-violet-500/30">
              2
            </span>
            <h2 className="text-xl font-semibold text-white">Generate Study Plan</h2>
          </div>

          <div className="relative flex gap-3">
            <input
              type="text"
              placeholder="e.g. required skills, protocols..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 text-white placeholder-violet-300/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleGeneratePlan}
              disabled={!topic || loading}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-violet-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
            >
              {loading ? "Generating..." : "Generate ✨"}
            </button>
          </div>

          {loading && (
            <div className="relative mt-6 flex items-center gap-2 text-violet-300 text-sm">
              <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              Analyzing your notes...
            </div>
          )}

          {studyPlan && !studyPlan.error && (
            <div className="relative mt-6 bg-gradient-to-br from-white/[0.08] to-white/[0.04] border border-white/10 rounded-2xl p-7">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent mb-3">
                {studyPlan.topic}
              </h3>
              <p className="text-white text-base mb-6 leading-relaxed">{studyPlan.summary}</p>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-fuchsia-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    🔑 Key Points
                  </h4>
                  <ul className="space-y-3">
                    {studyPlan.key_points?.map((point: string, i: number) => (
                      <li key={i} className="text-base text-white/90 flex gap-2 leading-relaxed">
                        <span className="text-fuchsia-400 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    ✅ Study Steps
                  </h4>
                  <ul className="space-y-3">
                    {studyPlan.study_steps?.map((step: string, i: number) => (
                      <li key={i} className="text-base text-white/90 flex gap-2 leading-relaxed">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/30 text-violet-200 text-xs font-bold mt-0.5 shrink-0">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {studyPlan?.error && (
            <p className="relative mt-4 text-sm text-rose-400">{studyPlan.error}</p>
          )}
        </div>
      </div>
    </main>
  );
}