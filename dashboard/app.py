import streamlit as st
import pandas as pd
from pymongo import MongoClient
import matplotlib.pyplot as plt
import plotly.express as px
from datetime import timedelta, date


# Kết nối MongoDB
client = MongoClient("mongodb+srv://huyhoang8704:huyhoang8704@cluster0.zpf0zj3.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0")
db = client["ecommerce"]

# Load events từ Mongo
events = pd.DataFrame(list(db["user_behaviors"].find({}, {"_id": 0})))
events["productId"] = events["productId"].astype(str)

# Load products từ Mongo
products = pd.DataFrame(list(db["product"].find({}, {
    "_id": 1,
    "name": 1,
    "category": 1,
    "brand_name": 1
})))

# Ép kiểu ObjectId -> str và đổi tên
products["productId"] = products["_id"].astype(str)
products.drop(columns=["_id"], inplace=True)

# Merge
df = events.merge(products, on="productId", how="left")

df["category"] = (
    df["category_y"] if "category_y" in df.columns else df.get("category_x", "Unknown")
)
df["category"] = df["category"].fillna("Unknown")

df["brand_name"] = (
    df["brand_name_y"] if "brand_name_y" in df.columns else df.get("brand_name_x", "Unknown")
)
df["brand_name"] = df["brand_name"].fillna("Unknown")

df.drop(columns=["category_x", "category_y", "brand_name_x", "brand_name_y"], errors="ignore", inplace=True)

df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
df["date"] = df["timestamp"].dt.date

#st.write("Các cột hiện có:", df.columns.tolist())

# Lọc 7 ngày gần nhất
today = date.today()
seven_days_ago = today - timedelta(days=7)
df_recent = df[(df["date"] >= seven_days_ago) & (df["date"] <= today)]

# Lấy top sản phẩm tương tác (view hoặc addtocart)
top_products = (
    df_recent[df_recent["action"].isin(["view", "addtocart"])]
    .groupby("name")
    .size()
    .sort_values(ascending=False)
    .head(5)  # chọn top 5 để biểu đồ không quá rối
    .index.tolist()
)



# ===== SIDEBAR FILTERS =====
st.sidebar.header("Bộ lọc nâng cao")

# Lọc theo danh mục
category_list = ["Tất cả"] + sorted(df["category"].dropna().unique())
selected_category = st.sidebar.selectbox("Danh mục sản phẩm", category_list)

# Lọc theo loại hành vi
action_list = sorted(df["action"].dropna().unique())
selected_actions = st.sidebar.multiselect("Loại hành vi", action_list, default=action_list)

# Lọc theo khoảng thời gian
valid_dates = df["date"].dropna()
if not valid_dates.empty:
    min_date = valid_dates.min()
    max_date = valid_dates.max()
else:
    st.warning("Không có dữ liệu ngày hợp lệ để hiển thị.")
    min_date = max_date = pd.to_datetime("today").date()
date_range = st.sidebar.date_input("Khoảng thời gian", [min_date, max_date])
if len(date_range) == 2:
    start_date, end_date = date_range
else:
    start_date = end_date = min_date

# Lọc theo thương hiệu
brand_list = ["Tất cả"] + sorted(df["brand_name"].dropna().unique())
selected_brand = st.sidebar.selectbox("Thương hiệu", brand_list)

# Áp dụng bộ lọc
if selected_category != "Tất cả":
    df = df[df["category"] == selected_category]

if selected_brand != "Tất cả":
    df = df[df["brand_name"] == selected_brand]

df = df[df["action"].isin(selected_actions)]
df = df[(df["date"] >= start_date) & (df["date"] <= end_date)]

# ===== MAIN DASHBOARD =====
st.title("E-Commerce Analytics Dashboard")

# Tổng quan
st.metric("Số sự kiện", len(df))
st.metric("Người dùng duy nhất", df["userId"].nunique())
st.metric("Sản phẩm duy nhất", df["productId"].nunique())

# Biểu đồ theo ngày
st.subheader("Phân bố hành vi theo ngày")
by_date = df.groupby(["date", "action"]).size().unstack().fillna(0)
fig_day = px.line(by_date, markers=True, labels={"date": "Ngày", "value": "Số lượng"}, title="Phân bố hành vi theo ngày")
st.plotly_chart(fig_day, use_container_width=True)

# Top sản phẩm được xem nhiều
st.subheader("Top sản phẩm được xem nhiều nhất")
top_viewed = (
    df[df["action"] == "view"]
    .groupby("name")
    .size()
    .reset_index(name="Số lần xem")
    .sort_values("Số lần xem", ascending=False)
    .head(10)
)

if not top_viewed.empty:
    top_viewed["name"] = top_viewed["name"].apply(lambda x: x[:50] + "..." if len(x) > 50 else x)
    fig = px.bar(
        top_viewed,
        x="Số lần xem",
        y="name",
        orientation="h",
        labels={"name": "Tên sản phẩm"}
    )
    fig.update_layout(yaxis=dict(autorange="reversed"))  # Hiển thị sản phẩm top ở trên cùng
    st.plotly_chart(fig, use_container_width=True)
else:
    st.info("Không có dữ liệu cho lựa chọn này.")

st.subheader("Tăng trưởng lượt View / Add to Cart trong 7 ngày gần nhất")
# Lọc lại theo top sản phẩm
df_top = df_recent[df_recent["name"].isin(top_products)]
growth_df = (
    df_top[df_top["action"].isin(["view", "addtocart"])]
    .groupby(["date", "name", "action"])
    .size()
    .reset_index(name="count")
)
growth_df["product_short"] = growth_df["name"].apply(
    lambda x: x[:40] + "..." if len(x) > 40 else x
)
growth_df["legend"] = growth_df["product_short"] + " - " + growth_df["action"]
fig = px.line(
    growth_df,
    x="date",
    y="count",
    color="product_short",
    markers=True,
    line_dash="action",
    labels={
        "count": "Số lượt",
        "date": "Ngày",
        "legend": "Sản phẩm - Hành vi"
    },
)

st.plotly_chart(fig, use_container_width=True)


# Tỉ lệ chuyển đổi theo danh mục
st.subheader("Tỉ lệ chuyển đổi theo danh mục")

conversion_df = (
    df[df["action"].isin(["view", "transaction"])]
    .groupby(["category", "action"])
    .size()
    .unstack()
    .fillna(0)
)
conversion_df["conversion_rate"] = conversion_df["transaction"] / conversion_df["view"]
st.dataframe(conversion_df[["view", "transaction", "conversion_rate"]].sort_values("conversion_rate", ascending=False))

# Top người dùng hoạt động tích cực nhất
st.subheader("Người dùng hoạt động tích cực nhất")
top_users = df["userId"].value_counts().head(10)
st.bar_chart(top_users)

# Thời gian truy cập theo giờ
st.subheader("Thời gian truy cập theo giờ")
df["hour"] = df["timestamp"].dt.hour
hourly = df.groupby("hour").size()
st.line_chart(hourly)

# Hiệu suất mô hình gợi ý (Train AUC)
st.subheader("Hiệu suất mô hình gợi ý (Train AUC)")

metrics = pd.DataFrame(list(db["model_metrics"].find({}, {"_id": 0})))
if not metrics.empty:
    metrics["timestamp"] = pd.to_datetime(metrics["timestamp"])
    fig_auc = px.line(metrics, x="timestamp", y="train_auc", markers=True,
                      labels={"train_auc": "AUC", "timestamp": "Thời gian"}, title="AUC theo thời gian")
    st.plotly_chart(fig_auc, use_container_width=True)
else:
    st.info("Chưa có dữ liệu AUC từ mô hình.")

st.subheader("Số lượng người dùng và sản phẩm theo từng lần retrain")

if not metrics.empty:
    fig_size = px.line(
        metrics,
        x="timestamp",
        y=["n_users", "n_items"],
        markers=True,
        labels={"value": "Số lượng", "timestamp": "Thời gian"},
        title="Biến động số lượng users và items"
    )
    st.plotly_chart(fig_size, use_container_width=True)

st.download_button("Tải dữ liệu CSV đã lọc", df.to_csv(index=False), file_name="filtered_data.csv")