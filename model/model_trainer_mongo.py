import pandas as pd
import numpy as np
from pymongo import MongoClient
from lightfm import LightFM
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import coo_matrix, hstack
from lightfm.evaluation import auc_score
import pickle
import time

def load_from_mongo():
    client = MongoClient("mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["ecommerce"]
    behaviors = pd.DataFrame(list(db["processed_behavior"].find()))
    products = pd.DataFrame(list(db["product"].find()))
    return behaviors, products

def prepare_data(df, products, split_ratio=0.8):
    df = df[["visitorid", "itemid", "score"]].copy()
    df = df[df["score"] > 0].reset_index(drop=True)

    cutoff = int(len(df) * split_ratio)
    df_train = df.iloc[:cutoff].copy()
    df_test = df.iloc[cutoff:].copy()

    df_test = df_test[
        df_test.visitorid.isin(df_train.visitorid) &
        df_test.itemid.isin(df_train.itemid)
    ]

    user_enc = LabelEncoder().fit(df_train.visitorid)
    item_enc = LabelEncoder().fit(df_train.itemid)

    u_train = user_enc.transform(df_train.visitorid)
    i_train = item_enc.transform(df_train.itemid)
    u_test = user_enc.transform(df_test.visitorid)
    i_test = item_enc.transform(df_test.itemid)

    w_train = df_train.score.values
    w_test = df_test.score.values

    n_users = u_train.max() + 1
    n_items = i_train.max() + 1
    interactions = {
        'train': coo_matrix((w_train, (u_train, i_train)), shape=(n_users, n_items)),
        'test': coo_matrix((w_test, (u_test, i_test)), shape=(n_users, n_items))
    }

    products = products.rename(columns={'_id': 'itemid'})
    products = products[products.itemid.isin(df_train.itemid.unique())]

    props = []
    for col in ('category', 'brand_name'):
        if col in products.columns:
            tmp = products[['itemid', col]].copy()
            tmp['property'] = col
            tmp['value'] = tmp[col].astype(str)
            props.append(tmp[['itemid', 'property', 'value']])
    props = pd.concat(props, ignore_index=True)
    props['feat'] = props.property + '_' + props.value

    feat_enc = LabelEncoder().fit(props.feat)
    f_idx = feat_enc.transform(props.feat)
    item_idx = item_enc.transform(props.itemid)
    cat_data = np.ones(len(props), dtype=np.int8)
    n_feats = len(feat_enc.classes_)

    cat_features = coo_matrix((cat_data, (item_idx, f_idx)), shape=(n_items, n_feats)).tocsr()

    products.set_index('itemid', inplace=True)
    ordered = products.reindex(item_enc.classes_).fillna({'name': '', 'description': '', 'category': ''})
    texts = [f"{n} {d} {c}".strip() for n, d, c in zip(
        ordered['name'].astype(str).tolist(),
        ordered['description'].astype(str).tolist(),
        ordered['category'].astype(str).tolist()
    )]

    tfidf = TfidfVectorizer(max_features=2000, stop_words='english')
    tfidf_matrix = tfidf.fit_transform(texts)

    item_features = hstack([cat_features, tfidf_matrix], format='csr')
    return interactions, item_features, user_enc, item_enc

if __name__ == '__main__':
    t0 = time.time()
    print("📦 Loading data from MongoDB...")
    df, products = load_from_mongo()

    print("📊 Preprocessing...")
    interactions, item_features, user_enc, item_enc = prepare_data(df, products)

    print("🎯 Training model...")
    model = LightFM(no_components=8, loss='warp')
    model.fit(interactions['train'], item_features=item_features, epochs=1000, num_threads=4)

    print("📈 Evaluating...")
    train_auc = auc_score(model, interactions['train'], item_features=item_features).mean()
    test_auc = auc_score(model, interactions['test'], item_features=item_features).mean()
    print(f"✅ AUC train = {train_auc:.4f} | AUC test = {test_auc:.4f}")
    print(f"⏱ Training time: {(time.time() - t0) / 60:.2f} minutes")

    with open('lightfm_model.pkl', 'wb') as f:
        pickle.dump({
            'model': model,
            'user_enc': user_enc,
            'item_enc': item_enc,
            'item_features': item_features
        }, f)

    print("💾 Model saved to lightfm_model.pkl")
