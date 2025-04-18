const User = require("../models/userModel");


const getUsers = async (req, res) => {
    try {
        const users = await User.find({
            deleted : false
        }).select("name email phone address role");
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getUser = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            deleted : false
        }).select("name email phone address role")
        if (!user) return res.status(404).json({ message: "User not found." });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const updateIn4 = req.body
        if(!await User.findOne({_id : id})) return res.status(404).json({ message: "User not found." });

       await User.updateOne({
            _id : id
        }, {
            $set : updateIn4
        })
        const updatedUser = await User.findOne({ _id: id }).select("-password");


        res.status(200).json({
            message: "Update user successfully.",
            user: updatedUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        if(!await User.findOne({_id : id})) return res.status(404).json({ message: "User not found." });
        await User.updateOne({
            _id : id
        }, {
            $set : {
                deleted : true
            }
        })
        res.status(200).json({
            message: "Delete user successfully."
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUsers,
    getUser,
    updateUser,
    deleteUser
}