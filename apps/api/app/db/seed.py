import json
from pathlib import Path

from app.core.logging import logger

ROOT_DIR = Path(__file__).resolve().parents[4]
SEED_DIR = ROOT_DIR / "data" / "seeds"


def load_seed_file(filename: str) -> object:
    with (SEED_DIR / filename).open("r", encoding="utf-8") as file:
        return json.load(file)


def seed_demo_data() -> None:
    organizations = load_seed_file("organizations.json")
    users = load_seed_file("users.json")
    sample_course = load_seed_file("sample-course.json")
    sample_transcript = load_seed_file("sample-transcript.json")

    logger.warning(
        "Seed scaffold loaded: organizations=%s users=%s transcript_chunks=%s course=%s",
        len(organizations),
        len(users),
        len(sample_transcript),
        sample_course["course"]["title"],
    )
    logger.warning("Database insert logic is intentionally deferred.")


if __name__ == "__main__":
    seed_demo_data()

