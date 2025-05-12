module.exports.index = (req, res) => {
    categories = [
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
        {
            category: "Sách và Tài liệu",
            slugCategory: "sach"
        },
        {
            category: "Đồng hồ và trang sức",
            slugCategory: "djong-ho-va-trang-suc"
        },
        {
            category: "Đồ Chơi - Mẹ & Bé",
            slugCategory: "djo-choi-me-and-be"
        }, 
        {
            category: "Thể Thao - Dã Ngoại",
            slugCategory: "the-thao-da-ngoai"
        },
        {
            category: "Thời trang nam",
            slugCategory: "thoi-trang-nam"
        },
        {
            category: "Túi thời trang nam",
            slugCategory: "tui-thoi-trang-nam"
        },
        {
            category: "Laptop - Máy Vi Tính - Linh kiện",
            slugCategory: "laptop-may-vi-tinh-linh-kien"
        },
        {
            category: "Bách Hóa Online",
            slugCategory: "bach-hoa-online"
        },
        {
            category: "Thời trang nữ",
            slugCategory: "thoi-trang-nu"
        }, 
        {
            category: "Làm Đẹp - Sức Khỏe",
            slugCategory: "lam-djep-suc-khoe"
        }, 
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