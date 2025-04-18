const User = require("../models/userModel");


const findUser = async (find) => {
    return await User.findOne(find);
};

const createUser = async (user) => {
    return await User.create(user);
};


module.exports = { 
    findUser,
    createUser 
};