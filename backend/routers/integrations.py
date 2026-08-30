"""
Integrations Router: Resume Upload & GitHub Sync Endpoints
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db.session import get_db
from backend.db.models import User, LearnerSkillState, Skill
from backend.auth.dependencies import get_current_user
from backend.integrations.resume_parser import ResumeParser
from backend.integrations.github_connector import GitHubConnector

router = APIRouter(prefix="/integrations", tags=["Resume & GitHub Skill Ingestion"])


class ResumeTextPayload(BaseModel):
    resume_text: str = Field(min_length=10, description="Raw text of resume")


class GitHubSyncPayload(BaseModel):
    github_username: str = Field(min_length=1, description="GitHub username")


class ConfirmDetectedSkillsPayload(BaseModel):
    skills: List[Dict[str, Any]] = Field(description="List of confirmed detected skills")


@router.post(
    "/resume/parse-text",
    status_code=status.HTTP_200_OK,
    summary="Extract estimated skills from resume text"
)
async def parse_resume_text(
    payload: ResumeTextPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    detected = ResumeParser.parse_text(payload.resume_text)
    return {
        "source": "resume",
        "detected_count": len(detected),
        "skills": detected
    }


@router.post(
    "/resume/upload",
    status_code=status.HTTP_200_OK,
    summary="Upload resume PDF or TXT to detect estimated skills"
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        content_bytes = await file.read()
        text = ""
        try:
            text = content_bytes.decode("utf-8", errors="ignore")
        except Exception:
            text = str(content_bytes)

        detected = ResumeParser.parse_text(text)
        return {
            "filename": file.filename,
            "source": "resume",
            "detected_count": len(detected),
            "skills": detected
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}"
        )


@router.post(
    "/github/sync",
    status_code=status.HTTP_200_OK,
    summary="Scan GitHub profile to detect estimated skills"
)
async def sync_github(
    payload: GitHubSyncPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        detected = await GitHubConnector.analyze_profile(payload.github_username)
        return {
            "username": payload.github_username,
            "source": "github",
            "detected_count": len(detected),
            "skills": detected
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync GitHub: {str(e)}"
        )


@router.post(
    "/confirm-skills",
    status_code=status.HTTP_200_OK,
    summary="Confirm and persist detected skills as estimated priors"
)
async def confirm_skills(
    payload: ConfirmDetectedSkillsPayload,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_id = current_user.id
    applied_count = 0

    for item in payload.skills:
        skill_id = item.get("skill_id")
        if not skill_id:
            continue

        mastery = float(item.get("estimated_mastery", 0.45))
        source = item.get("source", "resume")
        snippet = item.get("evidence_snippet")

        stmt = select(LearnerSkillState).where(
            LearnerSkillState.user_id == user_id,
            LearnerSkillState.skill_id == skill_id
        )
        existing = (await db.execute(stmt)).scalar_one_or_none()

        if existing:
            # Update only if not already verified
            if not existing.is_mastered:
                existing.mastery_prob = max(existing.mastery_prob, mastery)
                existing.source = source
                existing.evidence_snippet = snippet
        else:
            new_state = LearnerSkillState(
                user_id=user_id,
                skill_id=skill_id,
                mastery_prob=mastery,
                is_mastered=False,
                source=source,
                evidence_snippet=snippet,
                confidence_score=0.40
            )
            db.add(new_state)

        applied_count += 1

    await db.commit()

    return {
        "status": "success",
        "message": f"Successfully applied {applied_count} estimated skill priors.",
        "applied_count": applied_count
    }
