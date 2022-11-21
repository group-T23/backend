const User = require("../models/User")

const getItems = async(req, res) => {
    //get all items inserted in the cart
    const data = req.body; 
    const result = await User.findOne({email: data.email});
    res.json({cart: result.cart});
}

module.exports = {
    getItems
}