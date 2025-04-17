const homeRoute = require('./homeRoute')


module.exports = (app) => {
    app.use('/', homeRoute)
}