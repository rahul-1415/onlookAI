from app.core.logging import logger


def log_prompt_placeholder(name: str) -> None:
    logger.warning("Prompt '%s' is scaffolded but not implemented.", name)

