from pydantic import BaseModel


class CourseCreateRequest(BaseModel):
    title: str
    description: str = ""
    policy_id: str = ""

