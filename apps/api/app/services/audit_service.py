class AuditLogService:
    async def record_event(self) -> None:
        raise NotImplementedError("Implement audit log persistence.")

