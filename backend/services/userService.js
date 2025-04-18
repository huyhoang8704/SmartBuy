const User = require("../models/userModel");


const findUser = async (email) => {
    return await User.findOne({ email });
};

const createUser = async (user) => {
    return await User.create(user);
};


module.exports = { 
    findUser,
    createUser 
};