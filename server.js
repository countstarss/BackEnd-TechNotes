require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger,logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConnection')
const mongoose = require('mongoose')
const PORT = process.env.PORT || 3000

console.log(process.env.NODE_ENV);

connectDB()

app.use(logger)

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))

app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log("Connect to MongoDb");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', (err) => {
    // 在链接服务之后，持续监听数据库
    console.log(err);
    // 添加errorHandler
    // errorHandler的好处是自定义报错信息，简洁，能输出到文件中
    logEvents(`${err.no}\t${err.code}\t${err.syscall}\t${err.hostname}`,'mongoErrorLog.log')
})
