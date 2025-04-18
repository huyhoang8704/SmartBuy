module.exports = (req) =>{
    let regex = "";
    if(req.query.search){
        regex = new RegExp(req.query.search , "i")
    }
    return regex
}