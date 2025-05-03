import numpy as np
import pandas as pd
from datetime import datetime
from sklearn.preprocessing import LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from scipy.sparse import coo_matrix, hstack
from lightfm import LightFM
from lightfm.evaluation import auc_score
import pickle
import time

# ── 1) Load raw events ────────────────────────────────────────────────────
def create_data(behaviors_path, start_date, end_date):
    df = pd.read_csv(behaviors_path)
    df = df.rename(columns={
        'userId': 'visitorid',
        'productId': 'itemid',
        'action': 'event',
        'timestamp': 'ts'
    })
    df['date'] = pd.to_datetime(df.ts).dt.date
    df = df.sort_values('date').reset_index(drop=True)
    start = datetime.strptime(start_date, '%Y-%m-%d').date()
    end   = datetime.strptime(end_date,   '%Y-%m-%d').date()
    df = df[(df.date >= start) & (df.date <= end)]
    return df[['visitorid','itemid','event','date']]

# ── 2) Build interactions + item_features ────────────────────────────────
def create_interactions_and_item_features(df, split_ratio, product_path):
    weight_map = {'view':1.0, 'addtocart':3.0, 'transaction':5.0}
    df = df[df.event.isin(weight_map)].copy()
    
    cutoff = int(len(df) * split_ratio)
    df_train = df.iloc[:cutoff].copy()
    df_test  = df.iloc[cutoff:].copy()
    
    df_test = df_test[
        df_test.visitorid.isin(df_train.visitorid) &
        df_test.itemid   .isin(df_train.itemid)
    ]
    
    user_enc = LabelEncoder().fit(df_train.visitorid)
    item_enc = LabelEncoder().fit(df_train.itemid)
    
    u_train = user_enc.transform(df_train.visitorid)
    i_train = item_enc.transform(df_train.itemid)
    u_test  = user_enc.transform(df_test.visitorid)
    i_test  = item_enc.transform(df_test.itemid)
    
    # map events → numeric weights
    w_train = df_train.event.map(weight_map).values
    w_test  = df_test .event.map(weight_map).values
    
    
    # build sparse interaction matrices
    n_users = u_train.max() + 1
    n_items = i_train.max() + 1
    interactions = {
        'train': coo_matrix((w_train, (u_train, i_train)), shape=(n_users, n_items)),
        'test' : coo_matrix((w_test,  (u_test,  i_test )), shape=(n_users, n_items))
    }
    
    prod = pd.read_csv(product_path)
    prod = prod.rename(columns={'_id':'itemid'})
    prod = prod[prod.itemid.isin(df_train.itemid.unique())]
    
    props = []
    for col in ('category','brand_name'):
        if col in prod.columns:
            tmp = prod[['itemid', col]].copy()
            tmp['property'] = col
            tmp['value']    = tmp[col].astype(str)
            props.append(tmp[['itemid','property','value']])
    props = pd.concat(props, ignore_index=True)
    props['feat'] = props.property + '_' + props.value
    
    feat_enc = LabelEncoder().fit(props.feat)
    f_idx    = feat_enc.transform(props.feat)
    n_feats  = len(feat_enc.classes_)
    item_idx = item_enc.transform(props.itemid)
    
    cat_data = np.ones(len(props), dtype=np.int8)
    cat_features = coo_matrix(
        (cat_data, (item_idx, f_idx)),
        shape=(n_items, n_feats)
    ).tocsr()
    
    prod_indexed = prod.set_index('itemid')
    ordered = prod_indexed.reindex(item_enc.classes_).fillna({'name':'','description':'','category':''})
    
    texts = (
        ordered['name'].astype(str).tolist(),
        ordered['description'].astype(str).tolist(),
        ordered['category'].astype(str).tolist()
    )
    texts = [f"{n} {d} {c}".strip() for n, d, c in zip(*texts)]
    
    tfidf = TfidfVectorizer(max_features=2000, stop_words='english')
    tfidf_matrix = tfidf.fit_transform(texts)  # shape (n_items, n_text_feats)
    
    item_features = hstack([cat_features, tfidf_matrix], format='csr')
    
    return interactions, item_features, user_enc, item_enc

# ── 3) Main training script ───────────────────────────────────────────────
if __name__ == '__main__':
    t0 = time.time()
    
    df = create_data(
        '/kaggle/input/grab-boot/ecommerce.user_behaviors.csv',
        start_date='2025-04-01',
        end_date='2025-04-30'
    )
    
    interactions, item_features, user_enc, item_enc = create_interactions_and_item_features(
        df,
        split_ratio=0.8,
        product_path='/kaggle/input/grab-boot/ecommerce.product.csv'
    )
    
    model = LightFM(no_components=8, loss='warp')
    model.fit(
        interactions['train'],
        item_features=item_features,
        epochs=1000,
        num_threads=4
    )
    
    train_auc = auc_score(model, interactions['train'], item_features=item_features).mean()
    test_auc  = auc_score(model, interactions['test'],  item_features=item_features).mean()
    print(f"Train AUC: {train_auc:.4f}   Test AUC: {test_auc:.4f}")
    print(f"Training took {(time.time() - t0)/60:.2f} minutes")
    
    with open('/kaggle/working/lightfm_model.pkl', 'wb') as f:
        pickle.dump({
            'model':    model,
            'user_enc': user_enc,
            'item_enc': item_enc
        }, f)
    print("Saved model")