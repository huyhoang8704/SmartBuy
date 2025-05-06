FROM bitnami/spark:3.3

USER root

# Cài compiler + pip
RUN apt-get update && \
    apt-get install -y python3-pip build-essential python3-dev gcc g++ git && \
    rm -rf /var/lib/apt/lists/*
# Cài thư viện python cần
RUN pip3 install numpy pandas pymongo
RUN pip install dnspython

# Clone lightfm từ GitHub và build thủ công
RUN git clone https://github.com/lyst/lightfm.git && \
    cd lightfm && \
    python3 setup.py install

WORKDIR /app

COPY . .

ENV PYSPARK_PYTHON=python3
