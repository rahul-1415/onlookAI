from pydantic import BaseModel


class ReportOverviewResponse(BaseModel):
    completion_rate: float | None
    average_attention_score: float | None
    intervention_pass_rate: float | None
    next_step: str

