import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_quiz(topic: str, chunks: list[str], num_questions: int = 5) -> dict:
    context = "\n\n".join(chunks)

    prompt = f"""You are a quiz generator for a student.
Create {num_questions} multiple-choice questions about the topic "{topic}".
Use ONLY the notes below. Do not use outside knowledge.
Each question must have exactly 4 options and exactly one correct answer.

Reply with ONLY a JSON object in this exact format, with no extra text:
{{
  "topic": "{topic}",
  "questions": [
    {{
      "question": "question text",
      "options": ["option A", "option B", "option C", "option D"],
      "answer": "the exact text of the correct option"
    }}
  ]
}}

Notes:
{context}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "topic": topic,
            "questions": [],
            "error": "Quiz generate nahi ho saka. Dobara try karein.",
        }