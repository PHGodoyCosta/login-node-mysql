const mysql = require("mysql2/promise");

const conectar = async function(event) {
    if(global.conexao && global.conexao.state != "disconnect") {
        return global.conexao;
    } else {
        const conexao = mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "<minha senha>",
            database: "login",
            port: 3306
            
        }).then(console.log("Conexao ao DB"))
        global.conexao = conexao
        return conexao
    }
}

async function getCliente(cliente) {
    const conexao = await conectar()
    const [linha] = await conexao.query(`SELECT * FROM usuarios WHERE s_usuarios_email = '${cliente.email}' AND s_usuarios_senha = '${cliente.senha}'`)
    return await linha
    
}

async function getClientes() {
    try {
        const conexao = await conectar().then(console.log("Conxao ao db2"))
        const [linha] = await conexao.query("SELECT * FROM usuarios")
        return await linha
    } catch (error) {
        console.log("ERRO COMIGO: " + error)
    }
}

async function setCliente(cliente) {
    const conexao = await conectar()
    const [linha] = await conexao.query(`INSERT INTO usuarios (s_usuarios_nome, s_usuarios_email, s_usuarios_senha) VALUES ('${cliente.nome}', '${cliente.email}', '${cliente.senha}')`)
    return await linha
}

async function usuarioExistente(email) {
    const conexao = await conectar()
    const [linha] = await conexao.query(`SELECT * FROM usuarios WHERE s_usuarios_email = '${email}'`)
    return await linha
} 


module.exports = {getCliente, getClientes, usuarioExistente, setCliente}
