const express = require("express")
require("dotenv").config()
const sequelize = require("./database")
const cors = require('cors')

const http = require('http')
const HOST=process.env.HOST
const PORT = process.env.PORT
const app = express()
const server = http.createServer(app)


app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    next();
  });
app.use(cors())
app.use(express.json())


const User = sequelize.define("users", {
    id_user: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: true},
    password: {type: DataTypes.STRING},
}, {timestamps: false})


app.post('/registration', async (req, res) => {
    try {
        const { login, password, checkPassword} = req.body
        if (!login) {
            res.status(500).json({message: "Логин не должен быть пустым!"})
            return
        }
        if (!password) {
            res.status(500).json({message: "Пароль не должен быть пустым!"})
            return
        }
        if(!checkPassword)
        {
            res.status(500).json({message: "Пароль не должен быть пустым!"})
            return
        }
        if(password!=checkPassword) {
            res.status(500).json({message: "Пароли не совпадают!"})
            return
        }
        let candidate = await User.findOne({ where: { login } })
        if (candidate) {
            res.status(500).json({message: 'Пользователь с таким логином уже существует!'})
            return
        }
        const user = await User.create({ login, password, FIO, phone, email })
        const token = generateJwt(user.id_user, user.role)
        return res.json({ token })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Что-то пошло не так"})
        return
    }
})

app.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body
        if (!login) {
            res.status(500).json({message: 'Логин должен быть не пустым!'})
            return
        }
        if (!password) {
            res.status(500).json({message: 'Пароль должен быть не пустым!'})
            return
        }
        const user = await User.findOne({ where: { login } })
        if (!user) {
            res.status(500).json({message: 'Пользователь не найден!'})
            return
        }
        if (password !== user.password) {
            res.status(500).json({message: "Пароли не совпадают!"})
            return
        }
        const token = generateJwt(user.id_user, user.role)
        res.json({ token })
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Что-то пошло не так"})
        return
    }
})



const start = async () => {
    try{
        await sequelize.authenticate()
        await sequelize.sync()
        server.listen(PORT, HOST, () => console.log(`Server start on ${HOST}:${PORT}`))
    }
    catch(e){
        console.log(e)
    }
}

start()