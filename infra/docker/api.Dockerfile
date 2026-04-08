FROM python:3.12-slim

WORKDIR /workspace

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY apps/api/pyproject.toml /workspace/apps/api/pyproject.toml
RUN pip install --upgrade pip && pip install /workspace/apps/api

COPY . /workspace

WORKDIR /workspace/apps/api

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

