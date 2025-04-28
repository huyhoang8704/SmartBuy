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
    ]
    res.json(categories);

}