const Motorista = require('../models/Motorista')
const CryptoJS = require('crypto-js')
const CHAVE_SECRETA = 'segredo'

const cadastrar = async (req,res)=>{
    const valores = req.body
    
    if(!valores.nome || !valores.cnh || !valores.cpf || !valores.telefone){
        return res.status(400).json({ message: 'Todos os campos são obrigatorios' })
    }

    if(valores.cpf.length !== 11){
        return res.status(400).json({message: 'o cpf deve conter 11 digitos'})
    }

    try{
        const cnhCriptografada = CryptoJS.AES.encrypt(valores.cnh, CHAVE_SECRETA).toString()
        const cpfCriptografado = CryptoJS.AES.encrypt(valores.cpf, CHAVE_SECRETA).toString()

        await Motorista.create({
            nome: valores.nome,
            cnh: cnhCriptografada,
            cpf: cpfCriptografado,
            telefone: valores.telefone
        })        

        return res.status(201).json({message: 'Motorista cadastrado com sucesso'})
    }catch(err){
        console.error('erro ao cadastrar motorista',err)
        return res.status(500).json({message: 'erro ao cadastrar motorista'})
    }

}

const consultar = async (req,res)=>{
    const nome = req.params.nome

    try{
        const motorista = await Motorista.findOne({ where: { nome: nome}})
        if(!motorista){
            return res.status(404).json({message: 'motorista não encontrado'})
        }

        const bytesCnh = CryptoJS.AES.decrypt(motorista.cnh,CHAVE_SECRETA)
        const cnhDescriptografada = bytesCnh.toString(CryptoJS.enc.Utf8)
        const bytesCpf = CryptoJS.AES.decrypt(motorista.cpf,CHAVE_SECRETA)
        const cpfDescriptografado = bytesCpf.toString(CryptoJS.enc.Utf8)


        return res.status(200).json({
            codMotorista: motorista.codMotorista,
            nome:motorista.nome,
            cnh: cnhDescriptografada,
            cpf: cpfDescriptografado,
            telefone: motorista.telefone
        })
    }catch(err){
        console.error('Erro ao consultar motorista',err)
        return res.status(500).json({message: 'Erro ao consultar motorista'})
    }
}

const listar = async (req,res)=>{
    try{
        const motorista = await Motorista.findAll()
        let resultado = []

        motorista.forEach((el)=>{
            let cpfDescriptografado = ''
            let cnhDescriptografada = ''

            try{
                const bytesCnh = CryptoJS.AES.decrypt(motorista.cnh,CHAVE_SECRETA)
                cnhDescriptografada = bytesCnh.toString(CryptoJS.enc.Utf8)
                const bytesCpf = CryptoJS.AES.decrypt(motorista.cpf,CHAVE_SECRETA)
                cpfDescriptografado = bytesCpf.toString(CryptoJS.enc.Utf8)
            }catch(err){
                cpfDescriptografado = 'Erro ao descriptografar'
                cnhDescriptografada = 'Erro ao descriptografar'
                console.error(cpfDescriptografado,cnhDescriptografada,err)
            }
            resultado.push({
                codMotorista: el.codMotorista,
                nome: el.nome,
                cnh: cnhDescriptografada,
                cpf: cpfDescriptografado,
                telefone: el.telefone
            })
        })
        return res.status(200).json(resultado)
    }catch(err){
        console.error('Erro ao listar os motoristas', err)
        return res.status(500).json({message: 'Erro ao listar os motoristas'})
    }
}

const atualizar = async (req,res)=>{
    const id = req.params.id
    const valores = req.body

    try{
        const motorista = await Motorista.findByPk(id)
        if(!motorista){
            return res.status(404).json({message: 'motorista não encontrado'})
        }
        const dadosAtualizados = {...valores}


        if(valores.cpf){
            if(valores.cpf.length !== 11){
                return res.status(400).json({message: 'o cpf deve conter 11 digitos'})
            }
            dadosAtualizados.cpf = CryptoJS.encrypt(valores.cpf,CHAVE_SECRETA).toString()
        }
        
        if(valores.cnh){
            dadosAtualizados.cnh = CryptoJS.encrypt(valores.cnh,CHAVE_SECRETA).toString()
        }

        await Motorista.update(dadosAtualizados, {where:{codMotorista:id}})
        return res.status(200).json({message: 'Motorista atualizado com sucesso'})
    }catch(err){
        console.error('Erro ao atualizar o motorista',err)
        return res.status(500).json({message:'Erro ao atualizar o motorista'})
    }
}

const apagar = async (req,res)=>{
    const id = req.params.id
    try{
        const motorista = await Motorista.findByPk(id)
        if(!motorista){
            return res.status(404).json({message: 'motorista não encontrado'})
        }
        
        await Motorista.destroy({where: {codMotorista:id}})
        return res.status(200).json({message: 'Motorista excluido com sucesso'})
    }catch(err){
        console.error('Erro ao apagar motorista',err)
        return res.status(500).json({message: 'Erro ao apagar motorista'})
    }
}

module.exports = {cadastrar, consultar, listar, atualizar, apagar}