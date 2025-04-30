module.exports = (search) => {
    if (!search) return null;

    const escaped = search.trim().replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    return new RegExp(escaped, "i"); // tìm bất kỳ vị trí nào, thêm ^ nếu muốn từ đầu
};
