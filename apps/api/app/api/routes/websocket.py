from fastapi import APIRouter, WebSocket

router = APIRouter(prefix="/ws", tags=["websocket"])


@router.websocket("/sessions/{session_id}")
async def session_socket(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    await websocket.send_json(
        {
            "type": "session.started",
            "payload": {
                "sessionId": session_id,
                "status": "scaffold_only",
                "message": "WebSocket transport is scaffolded but not implemented.",
            },
        }
    )
    await websocket.close()

