import json
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

INTENTS = ["search", "summary", "quiz", "past_paper", "clarify"]


def detect_intent(user_request: str) -> str:
    prompt = f"""You are an intent classifier for a study assistant.
Classify the student's request into exactly one of these intents:
- search: student wants to find relevant parts of the notes about a topic
- summary: student wants a short summary of a topic
- quiz: student wants MCQ or short questions to practice
- past_paper: student wants exam or past paper style questions
- clarify: the request is unclear, too vague, or not about studying

Reply with ONLY a JSON object in this exact format, with no extra text:
{{"intent": "one_of_the_intents"}}

Student request: {user_request}"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )

    raw = response.choices[0].message.content.strip()
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        intent = json.loads(raw).get("intent", "clarify")
    except (json.JSONDecodeError, AttributeError):
        return "clarify"

    return intent if intent in INTENTS else "clarify"