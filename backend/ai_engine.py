import os
import json

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from google import genai
from pydantic import BaseModel


# ============================================================
# CONFIG
# ============================================================

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")

router = APIRouter(
    prefix="/ai",
    tags=["AI Intelligence"],
)

if API_KEY:
    client = genai.Client(api_key=API_KEY)
else:
    client = None


MODEL_NAME =MODEL_NAME = "gemini-3.6-flash"


# ============================================================
# REQUEST MODEL
# ============================================================

class AIAnalysisRequest(BaseModel):

    context: dict


# ============================================================
# GEMINI ANALYSIS
# ============================================================

def analyze_healthcare_context(context: dict):

    if client is None:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured."
        )

    prompt = f"""
You are HEALTHGRID, an AI-powered healthcare
resource and supply-chain decision-support system.

Analyze the following structured prediction and
recommendation data.

DATA:
{json.dumps(context, indent=2, default=str)}

Provide a concise operational analysis.

Return ONLY valid JSON with exactly these fields:

{{
    "summary": "short overall summary",
    "key_risks": [
        "risk 1",
        "risk 2"
    ],
    "recommended_actions": [
        "action 1",
        "action 2"
    ],
    "priority": "LOW | MEDIUM | HIGH | CRITICAL"
}}

Rules:
- Do not invent data.
- Base conclusions only on the supplied data.
- Prioritize patient safety and resource availability.
- Keep the response concise.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        text = response.text.strip()

        # Remove markdown fences if Gemini returns them
        if text.startswith("```"):
            text = text.replace(
                "```json",
                ""
            ).replace(
                "```",
                ""
            ).strip()

        return json.loads(text)

    except json.JSONDecodeError:

        return {
            "summary": response.text,
            "key_risks": [],
            "recommended_actions": [],
            "priority": "MEDIUM",
        }

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Gemini analysis failed: {str(exc)}"
        )


# ============================================================
# API ENDPOINT
# ============================================================

@router.post("/analyze")
def analyze(request: AIAnalysisRequest):

    return {
        "status": "success",
        "ai_analysis":
            analyze_healthcare_context(
                request.context
            ),
    }


# ============================================================
# STATUS
# ============================================================

@router.get("/status")
def ai_status():

    return {
        "status": (
            "configured"
            if client is not None
            else "not_configured"
        ),
        "model": MODEL_NAME,
    }