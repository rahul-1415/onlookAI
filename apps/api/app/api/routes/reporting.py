from fastapi import APIRouter

from app.schemas.common import ScaffoldResponse
from app.schemas.reporting import ReportOverviewResponse

router = APIRouter(prefix="/admin/reports", tags=["reporting"])


@router.get("/overview", response_model=ReportOverviewResponse)
async def get_reports_overview() -> ReportOverviewResponse:
    return ReportOverviewResponse(
        completion_rate=None,
        average_attention_score=None,
        intervention_pass_rate=None,
        next_step="Implement reporting aggregation queries.",
    )


@router.get("/session/{session_id}", response_model=ScaffoldResponse)
async def get_session_report(session_id: str) -> ScaffoldResponse:
    return ScaffoldResponse(
        area="reporting.session_detail",
        next_step=f"Implement session detail report for {session_id}.",
    )


@router.get("/export", response_model=ScaffoldResponse)
async def export_reports() -> ScaffoldResponse:
    return ScaffoldResponse(
        area="reporting.export",
        next_step="Implement CSV or PDF evidence export pipeline.",
    )

