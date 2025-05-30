# rec_service.py
import os
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from apscheduler.schedulers.background import BackgroundScheduler
from pymongo import MongoClient
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import coo_matrix, hstack
from lightfm import LightFM
from lightfm.evaluation import auc_score
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(dotenv_path="/app/backend/.env")

# CONFIG
MONGO_URL          = os.getenv("MONGO_URL")
MONGO_DB           = os.getenv("MONGO_DB", "ecommerce")
EVENT_COLLECTION   = os.getenv("EVENT_COLLECTION", "user_behaviors")
PRODUCT_COLLECTION = os.getenv("PRODUCT_COLLECTION", "product")
MODEL_PATH         = os.getenv("MODEL_PATH", "models/lightfm_model.pkl")
RETRAIN_HOUR       = int(os.getenv("RETRAIN_HOUR", "0"))
RETRAIN_MINUTE     = int(os.getenv("RETRAIN_MINUTE", "0"))

# GLOBALS
model         = None
user_enc      = None
item_enc      = None
item_features = None

# Mongo client
mongo_client = MongoClient(MONGO_URL)
db = mongo_client[MONGO_DB]

def train_from_scratch(start_date=None, end_date=None):
    global model, user_enc, item_enc, item_features

    # 1) Load user behaviors
    recs = list(db[EVENT_COLLECTION].find(
        {}, {"userId": 1, "productId": 1, "action": 1, "timestamp": 1, "_id": 0}
    ))
    pdf = pd.DataFrame(recs).rename(columns={
        "userId": "visitorid",
        "productId": "itemid",
        "action": "event",
        "timestamp": "ts"
    })
    pdf["date"] = pd.to_datetime(pdf["ts"], unit="ms").dt.date

    if start_date and end_date:
        sd = datetime.strptime(start_date, "%Y-%m-%d").date()
        ed = datetime.strptime(end_date, "%Y-%m-%d").date()
        pdf = pdf[(pdf["date"] >= sd) & (pdf["date"] <= ed)]

    pdf["visitorid"] = pdf["visitorid"].astype(str)
    pdf["itemid"] = pdf["itemid"].astype(str)

    # 2) Build interactions matrix
    weight_map = {"view": 1.0, "addtocart": 5.0, "transaction": 7.0}
    pdf = pdf[pdf["event"].isin(weight_map)].copy()
    pdf = pdf.sort_values("date").reset_index(drop=True)

    user_enc = LabelEncoder().fit(pdf["visitorid"])
    
    # Load full product list (not just products in behavior logs)
    prod_recs = list(db[PRODUCT_COLLECTION].find(
        {}, {"_id": 1, "name": 1, "description": 1, "category": 1, "brand_name": 1}
    ))
    prod = pd.DataFrame(prod_recs).rename(columns={"_id": "itemid"})
    prod["itemid"] = prod["itemid"].astype(str)

    item_enc = LabelEncoder().fit(prod["itemid"])  # Encode full products

    u_train = user_enc.transform(pdf["visitorid"])
    i_train = item_enc.transform(pdf["itemid"])
    w_train = pdf["event"].map(weight_map).values

    n_users = len(user_enc.classes_)
    n_items = len(item_enc.classes_)

    interactions = coo_matrix((w_train, (u_train, i_train)), shape=(n_users, n_items))

    # 3) Build item features for all products
    cat_frames = []
    for col in ("category", "brand_name"):
        if col in prod.columns:
            tmp = prod[["itemid", col]].copy()
            tmp["property"] = col
            tmp["value"] = tmp[col].astype(str)
            cat_frames.append(tmp[["itemid", "property", "value"]])

    if cat_frames:
        props = pd.concat(cat_frames, ignore_index=True)
        props["feat"] = props["property"] + "_" + props["value"]
        feat_enc = LabelEncoder().fit(props["feat"])
        f_idx = feat_enc.transform(props["feat"])
        n_feats = len(feat_enc.classes_)
        item_idx = item_enc.transform(props["itemid"])
        cat_feats = coo_matrix(
            (np.ones(len(props), dtype=np.int8), (item_idx, f_idx)),
            shape=(n_items, n_feats)
        ).tocsr()
    else:
        cat_feats = coo_matrix((n_items, 0))

    # 4) Textual item features (name + description + category)
    ordered = (
        prod.set_index("itemid")
        .reindex(item_enc.classes_)
        .fillna({"name": "", "description": "", "category": ""})
    )
    texts = [
        f"{r.name} {r.description} {r.category}".strip()
        for r in ordered.itertuples()
    ]

    if not any(texts):
        text_feats = coo_matrix((n_items, 0))
    else:
        tfidf = TfidfVectorizer(max_features=2000, stop_words="english")
        text_feats = tfidf.fit_transform(texts)

    # 5) Final item_features matrix
    item_features = hstack([cat_feats, text_feats], format="csr")

    # 6) Train LightFM model
    m = LightFM(no_components=5, loss="warp")
    m.fit(interactions, item_features=item_features, epochs=100, num_threads=4)

    # 7) Evaluate (Train AUC only, since no Test set now)
    train_auc = auc_score(m, interactions, item_features=item_features).mean()
    db["model_metrics"].insert_one({
        "timestamp": datetime.now(timezone.utc),
        "train_auc": float(train_auc),
        "n_users": int(n_users),
        "n_items": int(n_items),
    })

    # 8) Save Model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump({
            "model": m,
            "user_enc": user_enc,
            "item_enc": item_enc,
            "item_features": item_features
        }, f)

    # 9) Hot-swap globals
    model = m
    globals().update(locals())
    print("[retrain] Saved model and encoders with FULL products list.")

# Scheduler for daily retrain
scheduler = BackgroundScheduler()
scheduler.add_job(train_from_scratch, "cron",
                  hour=RETRAIN_HOUR, minute=RETRAIN_MINUTE)
scheduler.start()

# Initial training
train_from_scratch()


# Redis connection


# FastAPI endpoint
app = FastAPI()

def get_top_viewed_products(limit=10):
    cursor = db[EVENT_COLLECTION].aggregate([
        {"$match": {"action": "view"}},
        {"$group": {"_id": "$productId", "views": {"$sum": 1}}},
        {"$sort": {"views": -1}},
        {"$limit": limit}
    ])
    return [str(doc["_id"]) for doc in cursor] 

@app.get("/recommend/{user_id}")
def recommend(user_id: str, k: int = 10):
    if model is None:
        raise HTTPException(503, "Model not ready")

    if user_id not in user_enc.classes_:
        recs = get_top_viewed_products(limit=k)
        print(f"[recommend] Skipped: unknown user - {user_id}")
        return {
            "user": user_id,
            "recommendations": recs,
            "note": "fallback: top viewed products"
        }
    
    idx = user_enc.transform([user_id])[0]
    n_items = item_enc.classes_.shape[0]
    k = n_items

    user_ids = np.full(n_items, idx, dtype=np.int32)
    item_ids = np.arange(n_items, dtype=np.int32)
    scores   = model.predict(user_ids, item_ids, item_features=item_features)
    top_k    = np.argsort(-scores)
    recs     = item_enc.inverse_transform(top_k).tolist()
    recs = [str(item) for item in recs]  # Convert ObjectId to string

    return {"user": user_id, "recommendations": recs}
    

# API: log_event
class Behavior(BaseModel):
    userId: str
    productId: str
    action: str

@app.post("/log_event")
def log_event(b: Behavior):
    if model is None:
        raise HTTPException(503, "Model not ready")
    if b.action not in {"view", "addtocart", "transaction"}:
        raise HTTPException(400, "Invalid action")

    # Kiểm tra nếu userId hoặc productId chưa nằm trong encoder
    if b.userId not in user_enc.classes_ or b.productId not in item_enc.classes_:
        print(f"[log_event] Skipped: unknown user or product - {b.userId}, {b.productId}")
        return {"status": "skipped (new user or item not in encoder)"}

    # Tiếp tục cập nhật mô hình
    u_idx = user_enc.transform([b.userId])[0]
    i_idx = item_enc.transform([b.productId])[0]
    weight_map = {"view": 1.0, "addtocart": 5.0,  "transaction": 7.0}
    weight = weight_map[b.action]

    interaction = coo_matrix(
        ([weight], ([u_idx], [i_idx])),
        shape=(len(user_enc.classes_), len(item_enc.classes_))
    )

    try:
        model.fit_partial(interaction, item_features=item_features, epochs=1, num_threads=2)
        print(f"[fit_partial] updated model with {b.userId} - {b.productId} - {b.action}")
        return {"status": "ok", "updated": True}
    except Exception as e:
        print("Error during fit_partial:", e)
        return {"status": "error", "updated": False}