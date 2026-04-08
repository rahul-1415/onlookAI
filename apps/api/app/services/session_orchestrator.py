class SessionOrchestratorService:
    async def start_session(self) -> None:
        raise NotImplementedError("Implement session start orchestration.")

    async def ingest_attention_event(self) -> None:
        raise NotImplementedError("Implement attention scoring and threshold handling.")

    async def answer_intervention(self) -> None:
        raise NotImplementedError("Implement intervention answer handling.")

