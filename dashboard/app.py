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
events["userId"] = events["userId"].astype(str)
events["productId"] = events["productId"].astype(str)

users = pd.DataFrame(list(db["user"].find({}, {"_id": 1, "name": 1})))
users["userId"] = users["_id"].astype(str)
users.drop(columns=["_id"], inplace=True)

# Load products từ Mongo
products = pd.DataFrame(list(db["product"].find({}, {
    "_id": 1,
    "name": 1,
    "category": 1,
    "brand_name": 1,
    "price": 1
})))

# Ép kiểu ObjectId -> str và đổi tên
products["productId"] = products["_id"].astype(str)
products.drop(columns=["_id"], inplace=True)

# Merge
df = events.merge(products, on="productId", how="left")
df = df.merge(users, on="userId", how="left")

# st.write("Columns hiện tại:", df.columns.tolist())

# Xử lý tên cột
df.rename(columns={
    "name_x": "name",
    "name_y": "user_display",
}, inplace=True)

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

# selected_days = st.sidebar.slider("Chọn số ngày gần nhất", 1, (max_date - min_date).days, 7)
# start_date = max_date - timedelta(days=selected_days)

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
st.metric("Số lượng người dùng", df["userId"].nunique())
st.metric("Số sản phẩm duy nhất", df["productId"].nunique())

cart_df = df[df["action"] == "addtocart"].copy()
cart_df = cart_df.merge(products[["productId", "price"]], on="productId", how="left")
cart_df.rename(columns={"price_x": "price"}, inplace=True)

st.subheader("Tổng Doanh Thu Tiềm Năng")
total_revenue = cart_df["price"].sum()
st.metric("",f"{total_revenue:,.0f} VNĐ")

st.subheader("Phân Bổ Doanh Thu Tiềm Năng Theo Danh Mục")


revenue_by_category = (
    cart_df.groupby("category")["price"]
    .sum()
    .reset_index()
    .dropna()
    .sort_values("price", ascending=False)
)

if not revenue_by_category.empty:
    fig_pie = px.pie(
        revenue_by_category,
        names="category",
        values="price",
        hole=0.4  # Để thành Donut Chart, nếu không thích thì bỏ dòng này
    )
    st.plotly_chart(fig_pie, use_container_width=True)
else:
    st.info("Không có dữ liệu để hiển thị pie chart.")


# Biểu đồ theo ngày
st.subheader("Phân bố hành vi theo ngày")
by_date = df.groupby(["date", "action"]).size().unstack().fillna(0)
fig_day = px.line(by_date, markers=True, labels={"date": "Ngày", "value": "Số lượng"})
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
if not growth_df.empty:
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
else:
    st.info("Không có dữ liệu cho lựa chọn này.")


# Tỉ lệ chuyển đổi theo danh mục
st.subheader("Tỉ lệ chuyển đổi theo danh mục")

conversion_df = (
    df[df["action"].isin(["view", "transaction"])]
    .groupby(["category", "action"])
    .size()
    .unstack(fill_value=0)  # Tránh NaN
)

# Đảm bảo cột 'view' và 'transaction' luôn tồn tại
if "view" not in conversion_df.columns:
    conversion_df["view"] = 0
if "transaction" not in conversion_df.columns:
    conversion_df["transaction"] = 0

conversion_df["conversion_rate"] = conversion_df["transaction"] / conversion_df["view"].replace(0, 1)  # Tránh chia 0
if not conversion_df.empty:
    conversion_df = conversion_df.reset_index()
    conversion_df["conversion_rate"] = (conversion_df["conversion_rate"] * 100).round(2)
    conversion_df.rename(columns={
        "category": "Danh mục",
        "view": "Lượt xem",
        "transaction": "Giao dịch",
        "conversion_rate": "Tỉ lệ chuyển đổi (%)"
    }, inplace=True)

    st.dataframe(conversion_df[["Danh mục", "Lượt xem", "Giao dịch", "Tỉ lệ chuyển đổi (%)"]])
else:
    st.info("Không có dữ liệu cho lựa chọn này.")

# Top người dùng hoạt động tích cực nhất
st.subheader("Người dùng hoạt động tích cực nhất")
top_users = df["user_display"].value_counts().head(10)

if not top_users.empty:
    top_users_df = pd.DataFrame(top_users).reset_index()
    top_users_df.columns = ["User", "Số lần tương tác"]
    fig_top_users = px.bar(
        top_users_df,
        x="Số lần tương tác",
        y="User",
        orientation="h",
        labels={"User": "Tên người dùng"}
    )
    fig_top_users.update_layout(yaxis=dict(autorange="reversed"))
    st.plotly_chart(fig_top_users, use_container_width=True)
else:
    st.info("Không có dữ liệu cho lựa chọn này.")

st.subheader("Phân Tích Người Dùng Mới vs. Quay Lại")

# Xác định ngày đầu tiên mỗi user xuất hiện
first_seen = df.groupby("userId")["date"].min()
df["is_new_user"] = df.apply(lambda row: row["date"] == first_seen[row["userId"]], axis=1)

# Tính toán số lượng người dùng mới và quay lại theo ngày
daily_users = df.groupby(["date", "is_new_user"])["userId"].nunique().reset_index()
daily_users["Loại người dùng"] = daily_users["is_new_user"].map({True: "Người dùng mới", False: "Người dùng quay lại"})

if not daily_users.empty:
    fig_new_vs_return = px.bar(
        daily_users,
        x="date",
        y="userId",
        color="Loại người dùng",
        barmode="stack",
        labels={"userId": "Số người dùng", "date": "Ngày"},
    )
    st.plotly_chart(fig_new_vs_return, use_container_width=True)
else:
    st.info("Không có dữ liệu người dùng để phân tích.")
    
# Thời gian truy cập theo giờ
st.subheader("Thời gian truy cập theo giờ")
df["hour"] = df["timestamp"].dt.hour
hourly = df.groupby("hour").size()
if not hourly.empty:
    fig_hourly = px.bar(
        hourly,
        x=hourly.index,
        y=hourly.values,
        labels={"x": "Giờ trong ngày", "y": "Số lượng"},
    )
    fig_hourly.update_layout(xaxis_title="Giờ trong ngày", yaxis_title="Số lượng")
    st.plotly_chart(fig_hourly, use_container_width=True)
else:
    st.info("Không có dữ liệu cho lựa chọn này.")

st.subheader("Heatmap Hành Vi Theo Giờ Trong Tuần")

# Chuẩn bị dữ liệu cho heatmap
df["weekday"] = df["timestamp"].dt.day_name()  # Lấy tên thứ (Monday, Tuesday,...)
df["hour"] = df["timestamp"].dt.hour

# Gom nhóm theo weekday và hour
heatmap_data = (
    df.groupby(["weekday", "hour"])
    .size()
    .reset_index(name="count")
)

# Sắp xếp weekday đúng thứ tự
weekday_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
heatmap_data["weekday"] = pd.Categorical(heatmap_data["weekday"], categories=weekday_order, ordered=True)
heatmap_pivot = heatmap_data.pivot(index="weekday", columns="hour", values="count").fillna(0)

# Vẽ Heatmap bằng Plotly
if not heatmap_pivot.empty:
    fig_heatmap = px.imshow(
        heatmap_pivot,
        labels=dict(x="Giờ trong ngày", y="Thứ trong tuần", color="Số lượt hành vi"),
        x=heatmap_pivot.columns,
        y=heatmap_pivot.index,
        aspect="auto",
        color_continuous_scale="Blues"
    )
    st.plotly_chart(fig_heatmap, use_container_width=True)
else:
    st.info("Không có dữ liệu cho lựa chọn này.")

st.subheader("Sản Phẩm Trending Trong Tuần")

# Chuẩn bị dữ liệu
df["week"] = df["timestamp"].dt.isocalendar().week
current_week = today.isocalendar()[1]
last_week = current_week - 1

# Lấy dữ liệu tuần hiện tại và tuần trước
week_data = df[df["action"] == "view"].groupby(["name", "week"]).size().reset_index(name="views")

# Tách riêng số liệu 2 tuần
current_week_views = week_data[week_data["week"] == current_week].set_index("name")["views"]
last_week_views = week_data[week_data["week"] == last_week].set_index("name")["views"]

# Tính toán mức tăng trưởng (%)
trending_df = pd.DataFrame({
    "current_week_views": current_week_views,
    "last_week_views": last_week_views
}).fillna(0)

trending_df["growth_rate (%)"] = ((trending_df["current_week_views"] - trending_df["last_week_views"]) / 
                                   trending_df["last_week_views"].replace(0, 1)) * 100

# Lọc các sản phẩm có tăng trưởng dương và sắp xếp theo tăng trưởng giảm dần
trending_df = trending_df[trending_df["growth_rate (%)"] > 0]
top_trending = trending_df.sort_values("growth_rate (%)", ascending=False).head(10).reset_index()

# Hiển thị bảng hoặc biểu đồ
if not top_trending.empty:
    st.dataframe(top_trending[["name", "current_week_views", "last_week_views", "growth_rate (%)"]])
    fig_trend = px.bar(
        top_trending,
        x="growth_rate (%)",
        y="name",
        orientation="h",
        labels={"name": "Tên sản phẩm", "growth_rate (%)": "Tăng trưởng (%)"},
    )
    fig_trend.update_layout(yaxis=dict(autorange="reversed"))
    st.plotly_chart(fig_trend, use_container_width=True)
else:
    st.info("Không có sản phẩm trending trong tuần này.")


# Hiệu suất mô hình gợi ý (Train AUC)
st.subheader("Hiệu suất mô hình gợi ý (Train AUC)")

metrics = pd.DataFrame(list(db["model_metrics"].find({}, {"_id": 0})))


if not metrics.empty:
    metrics["timestamp"] = pd.to_datetime(metrics["timestamp"])

    metrics["date"] = metrics["timestamp"].dt.date
    metrics_filtered = metrics[(metrics["date"] >= start_date) & (metrics["date"] <= end_date)]

    if not metrics_filtered.empty:
        fig_auc = px.line(metrics, x="timestamp", y="train_auc", markers=True,
                        labels={"train_auc": "AUC", "timestamp": "Thời gian"})
        st.plotly_chart(fig_auc, use_container_width=True)
    else:
        st.info("Không có dữ liệu AUC trong khoảng thời gian đã chọn.")
else:
    st.info("Chưa có dữ liệu AUC từ mô hình.")

st.subheader("Số lượng người dùng và sản phẩm theo từng lần retrain")

if not metrics.empty:
    metrics["date"] = metrics["timestamp"].dt.date
    metrics_filtered = metrics[(metrics["date"] >= start_date) & (metrics["date"] <= end_date)]
    if not metrics_filtered.empty:
        fig_size = px.line(
            metrics_filtered,
            x="timestamp",
            y=["n_users", "n_items"],
            markers=True,
            labels={"value": "Số lượng", "timestamp": "Thời gian"}
        )
        st.plotly_chart(fig_size, use_container_width=True)
    else:
        st.info("Không có dữ liệu số lượng người dùng và sản phẩm trong khoảng thời gian đã chọn.")
else:
    st.info("Chưa có dữ liệu số lượng người dùng và sản phẩm.")

st.download_button("Tải dữ liệu CSV đã lọc", df.to_csv(index=False), file_name="filtered_data.csv")