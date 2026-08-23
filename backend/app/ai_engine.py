import json

from fastapi import APIRouter, HTTPException
from google import genai
from pydantic import BaseModel, Field, ValidationError

from app.config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
)
from app.schemas.api import AIAnalysisAPIResponse


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/ai",
    tags=["AI Intelligence"],
)


# ============================================================
# GEMINI CLIENT
# ============================================================

client = (
    genai.Client(api_key=GEMINI_API_KEY)
    if GEMINI_API_KEY
    else None
)

MODEL_NAME = GEMINI_MODEL


# ============================================================
# REQUEST MODEL
# ============================================================

class AIAnalysisRequest(BaseModel):
    context: dict


# ============================================================
# AI RESPONSE MODEL
# ============================================================

class AIAnalysisResult(BaseModel):
    summary: str

    key_risks: list[str] = Field(
        default_factory=list
    )

    recommended_actions: list[str] = Field(
        default_factory=list
    )

    priority: str


# ============================================================
# HEALTHCARE AI ANALYSIS
# ============================================================

def analyze_healthcare_context(
    context: dict,
) -> dict:

    if client is None:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is not configured.",
        )

    prompt = f"""
You are HEALTHGRID, an AI-powered healthcare
resource and supply-chain decision-support system.

Analyze the following structured prediction and
recommendation data.

DATA:
{json.dumps(context, indent=2, default=str)}

Return ONLY valid JSON in exactly this structure:

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
- Use only the supplied information.
- Prioritize patient safety and resource availability.
- Keep the response concise.
- Do not include markdown.
- Return valid JSON only.
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        text = response.text.strip()

        if text.startswith("```"):
            text = (
                text
                .replace("```json", "")
                .replace("```", "")
                .strip()
            )

        raw_result = json.loads(text)

        validated_result = AIAnalysisResult.model_validate(
            raw_result
        )

        return validated_result.model_dump()

    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=500,
            detail="Gemini returned invalid JSON.",
        ) from exc

    except ValidationError as exc:
        raise HTTPException(
            status_code=500,
            detail={
                "message": (
                    "Gemini returned an invalid "
                    "analysis structure."
                ),
                "validation_errors": exc.errors(),
            },
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini analysis failed: {str(exc)}",
        ) from exc


# ============================================================
# AI ANALYSIS ENDPOINT
# ============================================================

@router.post(
    "/analyze",
    response_model=AIAnalysisAPIResponse,
)
def analyze(
    request: AIAnalysisRequest,
):

    result = analyze_healthcare_context(
        request.context
    )

    return {
        "status": "success",
        "ai_analysis": result,
    }


# ============================================================
# AI STATUS ENDPOINT
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