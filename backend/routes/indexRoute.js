const homeRoute = require('./homeRoute')
const authRoute = require('./authRoute')

module.exports = (app) => {
    app.use('/', homeRoute)

    app.use('/auth', authRoute)
}