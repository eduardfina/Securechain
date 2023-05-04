const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

module.exports = function (config) {
    // Create App
    const app = express()

    // Port
    app.set('port', config.defaultPort)

    app.use(cors())

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    // Routes
    require('./routes/routes')(app)

    // Listen HTTP
    return app.listen(app.get('port'), () => {
        console.log('')
        console.log(`Express server listening on port ${app.get('port')}.`)
        console.log('')
    })
}
