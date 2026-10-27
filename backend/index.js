const express = require('express')
const app = express()
const cors = require('cors')

const PORT = 3000
const hostname = 'localhost'

const conn = require('./db/conn')

require('./models/rel')

const authMiddleware = require('./middleware/auth.middleware')
const authController = require('./controller/auth.controller')
const funcionarioController = require('./controller/funcionario.controller')
const motoristaController = require('./controller/motorista.controller')




// middleware 
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())

// rotas publicas
app.post('/funcionario',funcionarioController.cadastrar)
app.post('/login', authController.login)

app.get('/',(req,res)=>{
    res.status(200).json({mesage:'Aplicação rodando'})
})

app.use(authMiddleware)

// rotas privadas
app.post('/motorista',motoristaController.cadastrar)
app.get('/motorista/buscarNome/:nome',motoristaController.consultar)