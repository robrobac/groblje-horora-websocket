require('dotenv').config()
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cors = require('cors') // Import the cors middleware

// express app
const app = express()
const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: process.env.FRONT_URL, // FRONTEND URL
        methods: ['GET', 'POST'],
    },
})

const corsOptions = {
    origin: process.env.FRONT_URL, // FRONTEND URL
}

// middleware
app.use(express.json())
app.use(cors(corsOptions)) // Enable CORS

app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        const db = mongoose.connection // Get the Mongoose connection

        // create the change stream
        const changeStream = db.collection('reviews').watch()

        // handle change events
        changeStream.on('change', (change) => {
            console.log(change)
            io.emit('reviewChange', change)
        })

        // listen for requests
        server.listen(process.env.PORT, () => {
            console.log('Connected to DB and Listening to port', process.env.PORT)
        })
    })
    .catch((error) => {
        console.log(error)
    })

