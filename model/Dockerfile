FROM python:3.11-slim

# 1) Install system deps for LightFM’s C extension
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libopenblas-dev \
      libomp-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Copy & install Python deps
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# 3) Copy app code
COPY . .

EXPOSE 8000

# 4) Launch Uvicorn
CMD ["uvicorn", "rec_service:app", "--host", "0.0.0.0", "--port", "8000"]