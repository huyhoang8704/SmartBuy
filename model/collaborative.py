import numpy as np
import pandas as pd
from datetime import datetime
from sklearn import preprocessing
from sklearn.preprocessing import LabelEncoder
from scipy.sparse import coo_matrix, csr_matrix
from lightfm import LightFM
from lightfm.evaluation import auc_score
import pickle
import time

# 1) Load raw events
def create_data(datapath, start_date, end_date):
    df = pd.read_csv(datapath)
    df = df.assign(
        date = pd.Series(datetime.fromtimestamp(ts/1000).date() for ts in df.timestamp)
    )
    df = df.sort_values('date').reset_index(drop=True)
    df = df[(df.date >= datetime.strptime(start_date,'%Y-%m-%d').date()) &
            (df.date <= datetime.strptime(end_date,'%Y-%m-%d').date())]
    return df[['visitorid','itemid','event']]

# 2) Build interaction matrices **and** item_features
def create_implicit_feedback_matrix(df, split_ratio,
                                    item_prop_paths):
    # split train/test
    split_idx = int(round(len(df) * split_ratio))
    df_train = df.iloc[:split_idx].copy()
    df_test  = df.iloc[split_idx:].copy()
    # only keep test events on known users/items
    df_test = df_test[df_test.visitorid.isin(df_train.visitorid) &
                      df_test.itemid.isin(df_train.itemid)]

    id_cols=['visitorid','itemid']
    trans_cat_train=dict()
    trans_cat_test=dict()
    for k in id_cols:
        cate_enc=preprocessing.LabelEncoder()
        trans_cat_train[k]=cate_enc.fit_transform(df_train[k].values)
        trans_cat_test[k]=cate_enc.transform(df_test[k].values)
    

    # --- 1) weight events instead of naive label-encoding
    #    you can customize these weights as you like
    event_weight = {
        'view':         1.0,
        'addtocart':    3.0,
        'transaction':  5.0
    }
    w_train = df_train.event.map(event_weight).values
    w_test  = df_test.event.map(event_weight).values
    print(w_train)
    n_users=len(np.unique(trans_cat_train['visitorid']))
    n_items=len(np.unique(trans_cat_train['itemid']))    

    rate_matrix=dict()
    rate_matrix['train']=coo_matrix((w_train,(trans_cat_train['visitorid'],\
                                              trans_cat_train['itemid']))\
                             ,shape=(n_users,n_items))
    rate_matrix['test']=coo_matrix((w_test,(trans_cat_test['visitorid'],\
                                              trans_cat_test['itemid']))\
                             ,shape=(n_users,n_items))

    # --- 2) build item_features from your properties logs
    # load & concat both parts
    ''' props = []
    for path in item_prop_paths:
        p = pd.read_csv(path,
                        names=['timestamp','itemid','property','value'],
                        skiprows=1, header=None)
        props.append(p)
    props = pd.concat(props, ignore_index=True)

    # only keep items in train
    props = props[props.itemid.isin(df_train.itemid.unique())]
    # create a single “feature” string per row
    props['feat'] = props.property + '_' + props.value
    # pivot into a one-hot matrix: rows=itemid, cols=feat
    item_feat_df = pd.crosstab(props.itemid, props.feat)

    # reindex to include *all* items (fill missing with 0)
    all_items = item_enc.classes_
    item_feat_df = item_feat_df.reindex(all_items, fill_value=0)

    # finally to sparse
    item_features = csr_matrix(item_feat_df.values)'''

    return rate_matrix #, item_features

if __name__=='__main__':
    start_time = time.time()

    # load events
    df = create_data('../input/events.csv', '2015-05-03', '2015-05-18')

    # get interactions + item_features
    interactions = create_implicit_feedback_matrix(df, 0.8,
        item_prop_paths=['../input/item_properties_part1.csv',
                         '../input/item_properties_part2.csv'])

    # train or load
    load_model = False
    if load_model:
        with open('saved_model.pkl','rb') as f:
            model = pickle.load(f)['model']
    else:
        model = LightFM(no_components=5, loss='warp')
        # --- pass in item_features here!
        model.fit(interactions['train'],
                  #item_features=item_features,
                  epochs=100,
                  num_threads=1)
        with open('saved_model.pkl','wb') as f:
            pickle.dump({'model':model}, f)

    # evaluate
    auc_train = auc_score(model, interactions['train']).mean()
                          #item_features=item_features).mean()
    auc_test  = auc_score(model, interactions['test']).mean()
                          #item_features=item_features).mean()

    print("--- Run time:  %s mins ---\n" % ((time.time() - start_time)/60))
    print(f"Train AUC: {auc_train:.3f}")
    print(f" Test AUC: {auc_test:.3f}")

