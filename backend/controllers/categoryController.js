module.exports.index = (req, res) => {
    categories = [
        {
            category: "Phụ kiện thời trang",
            slugCategory: "phu-kien-thoi-trang"
        },
        {
            category: "Phụ kiện tóc",
            slugCategory: "phu-kien-toc"
        },
        {
            category: "Phụ kiện mắt kính",
            slugCategory: "phu-kien-mat-kinh"
        },
        {
            category: "Giày - Dép nam",
            slugCategory: "giay-dep-nam"
        },
        {
            category: "Điện Thoại - Máy Tính Bảng",
            slugCategory: "djien-thoai-may-tinh-bang"
        },
        {
            category: "Gym và Boxing",
            slugCategory: "gym-va-boxing"
        },
        {
            category: "Phụ kiện điện thoại và máy tính",
            slugCategory: "phu-kien-djien-thoai-va-may-tinh"
        },          
    ]
    res.json(categories);

}