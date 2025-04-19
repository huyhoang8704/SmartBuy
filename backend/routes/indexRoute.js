const homeRoute = require('./homeRoute')
const authRoute = require('./authRoute')
const userRoute = require('./userRoute')
const productRoute = require('./productRoute')
const cartRoute = require('./cartRoute')

const authenticateToken = require('../middlewares/authenticationUser')

module.exports = (app) => {
    app.use('/', homeRoute)

    app.use('/auth', authRoute)

    app.use('/user',authenticateToken, userRoute)

    app.use('/product', productRoute)

    app.use('/cart',authenticateToken, cartRoute)
}