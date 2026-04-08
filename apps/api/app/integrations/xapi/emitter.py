class XAPIEmitter:
    async def emit(self, statement: dict) -> None:
        raise NotImplementedError(
            f"Implement xAPI/LRS delivery for statement verb {statement.get('verb')}."
        )

