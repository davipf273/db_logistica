const CryptoJS = require('crypto-js')
const CHAVE_SECRETA = 'segredo'

function authMiddleware(req,res,next){
    const token = req.headers['authorization']
    console.log(token)

    if(!token){
        return res.status(401).json({message:'Acesso negado! token não fornecido'})
    }

    try{
        const bytes = CryptoJS.AES.decrypt(token, CHAVE_SECRETA)
        const dadosDescriptografados = bytes.toString(CryptoJS.enc.Utf8)

        if(!dadosDescriptografados){
            return res.status(401).json({message: 'token invalido!'})
        }

        const payload = JSON.parse(dadosDescriptografados)

        if(Date.now() > payload.expiraEm){
            return res.status(401).json({message: 'Sessão expirada faça login novamente'})
        }

        req.usuario = payload
        next()
    }catch(err){
        return req.status(401).json({message: 'falha na autenticação do token',err})
    }
}

module.exports = authMiddleware