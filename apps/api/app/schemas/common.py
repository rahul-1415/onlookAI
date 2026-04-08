from typing import Literal

from pydantic import BaseModel


class ScaffoldResponse(BaseModel):
    area: str
    status: Literal["scaffold_only"] = "scaffold_only"
    next_step: str

