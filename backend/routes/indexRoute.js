const homeRoute = require('./homeRoute')
const authRoute = require('./authRoute')
const userRoute = require('./userRoute')
const productRoute = require('./productRoute')

module.exports = (app) => {
    app.use('/', homeRoute)

    app.use('/auth', authRoute)

    app.use('/user', userRoute)

    app.use('/product', productRoute)
}