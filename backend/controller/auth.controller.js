const Funcionario = require('../models/Funcionario')
const CryptoJS = require('crypto-js')
const CHAVE_SECRETA = 'segredo'

const login = async (req,res)=>{
    const valores = req.body

    if(!valores.email || !valores.senha){
        return res.status(400).json({message:'Informe email e senha para realizar login'})
    }

    try{
        const funcionario = await Funcionario.findOne({where: {email: valores.email}})

        if(!funcionario){
            return res.status(404).json({message: 'funcionario não encontrado'})
        }

        const bytes = CryptoJS.AES.decrypt(funcionario.senha, CHAVE_SECRETA)
        const senhaBD = bytes.toString(CryptoJS.enc.Utf8)


        if(valores.senha !== senhaBD){
            return res.status(401).json({message: 'senha incorreta'})
        }


        const duasHorasEmMs = 2 * 60 * 60 * 1000
        const tempoExpiraco = Date.now() + duasHorasEmMs

        const payload = {
            codFuncionario: funcionario.codFuncionario,
            nome: funcionario.nome,
            expiraEm: tempoExpiraco
        }

        const token = CryptoJS.AES.encrypt(JSON.stringify(payload), CHAVE_SECRETA).toString()

        return res.status(200).json({
            message: 'login realizado com sucesso',
            token:token,
            nome: funcionario.nome
        })
    }catch(err){
        console.error('Erro ao tentar fazer login',err)
        return res.status(500).json({message:'Erro ao tentar fazer o login!'})
    }
}

module.exports = {login}