const express = require("express")
const session = require("express-session")
const http = require("http")
const events = require("events")
const bodyParser = require("body-parser")
const cors = require("cors")
const db = require("./db")
const fs = require("fs")

const app = express()
const servidor = http.createServer(app)
const host = "127.0.0.1"
const eventos = new events.EventEmitter()
eventos.on("log", () => {console.log("Macaco novo")})

function sqli(variavel, spaces) {
    variavel = String(variavel)
    var caracteres = ["-", "'", '"', "/", "\\", ")", "(", " ", "<", ">", "&", "$"]
    if (spaces) {
        var caracteres = ["-", "'", '"', "/", "\\", ")", "(", "<", ">", "&", "$"]
    }
    for (let c in caracteres) {
        if (variavel.indexOf(caracteres[c]) != -1) {
            return true
        }
    }
    return false
}

app.use(session({secret:"ldflsdfksldfk23498419ealsçfka84e1290-"}))
app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use(cors())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname))

app.get("/", (request, response) => {
    response.status(302)
    if(request.session.login) {
        response.send("<script>window.location.href = 'http://127.0.0.1/home'</script>")
    } else {
        response.send("<script>window.location.href = 'http://127.0.0.1/login'</script>")
    }
})

app.get("/login", (request, response) => {
    if(request.session.login) {
        response.status(302)
        response.send("<script>window.location.href = 'http://127.0.0.1/home'</script>")
    } else {
        response.status(200)
        eventos.emit("log")
        response.sendFile(__dirname + "/templates/login.html")
    }
})
app.post("/login", async(request, response) => {
    if (request.session.login) {
        response.status(302)
        response.send("<script>window.location.href = 'http://127.0.0.1/home'</script>")
    }else {
        if (sqli(request.body.email) || sqli(request.body.senha) == true) {
            response.status(200)
            fs.readFile(__dirname + "/templates/login.html", (err, file) => {
                if (err) throw err
                var script = "<script>var div = document.createElement('div');div.setAttribute('id', 'erro');document.querySelector('form').prepend(div);var p = document.createElement('p');p.textContent = 'Não são permitidos espaços e caracteres especiais';p.setAttribute('id', 'msg_erro');div.appendChild(p)</script>" 
                response.send(String(file) + script)
            })
        } else {
            const cliente = {
                email: request.body.email,
                senha: request.body.senha
            }
            console.log("Email: " + cliente.email + ", Senha: " + cliente.senha)
            try {
                var resposta = await db.getCliente(cliente)
            } catch(error) {
                console.log(error)
            }
            var certeza = false
            for (let c of resposta) {
                if (String(resposta) != "") {
                    certeza = true
                }
            }
            if (certeza == false) {
                console.log("não tenho certeza")
                response.status(200)
                fs.readFile(__dirname + "/templates/login.html", (err, file) => {
                    if (err) throw err
                    var script = "<script>var div = document.createElement('div');div.setAttribute('id', 'erro');document.querySelector('form').prepend(div);var p = document.createElement('p');p.textContent = 'Senha ou usuario incorretos';p.setAttribute('id', 'msg_erro');div.appendChild(p)</script>" 
                    response.send(String(file) + script)
                })
            } else {
                console.log("tenho certeza")
                request.session.login = cliente.email
                response.status(302)
                response.send("<script>window.location.href = 'http://127.0.0.1/home'</script>")
            }
        }
    }
        
})

app.get("/newAccount", (request, response) => {
    response.status(200)
    response.sendFile(__dirname + "/templates/novaconta.html")
})
app.post("/newAccount", async(request, response) => {
    if (sqli(request.body.email) || sqli(request.body.senha) || sqli(request.body.nome, true) == true) {
        fs.readFile(__dirname + "/templates/novaconta.html", (err, file) => {
            if (err) throw err
            var script = "<script>var div = document.createElement('div');div.setAttribute('id', 'erro');document.querySelector('form').prepend(div);var p = document.createElement('p');p.textContent = 'Não são permitidos espaços e caracteres especiais';p.setAttribute('id', 'msg_erro');div.appendChild(p)</script>"
            response.send(String(file) + script)
        })
    }
    const cliente = {
        email: request.body.email,
        senha: request.body.senha,
        nome: request.body.nome
    }
    if(cliente.email && cliente.nome && cliente.senha == "") {
        fs.readFile(__dirname + "/templates/novaconta.html", (err, file) => {
            if (err) throw err
            var script = "<script>var div = document.createElement('div');div.setAttribute('id', 'erro');document.querySelector('form').prepend(div);var p = document.createElement('p');p.textContent = 'Preencha todos os campos!';p.setAttribute('id', 'msg_erro');div.appendChild(p)</script>"
            response.send(String(file) + script)
        })
    } else {
        try {
            var usuario = await db.usuarioExistente(cliente.email)
            console.log(usuario)
        } catch (error) {
            console.log("ERRO TESTE USUARIO: " + error)
        }
        eventos.emit("log")
        if (String(usuario) != "") {
            fs.readFile(__dirname + "/templates/novaconta.html", (err, file) => {
                if (err) throw err
                var script = "<script>var div = document.createElement('div');div.setAttribute('id', 'erro');document.querySelector('form').prepend(div);var p = document.createElement('p');p.textContent = 'Usuario já existente';p.setAttribute('id', 'msg_erro');div.appendChild(p)</script>"
                response.status(200)
                response.send(String(file) + script)
            })
        } else {
            const resposta = await db.setCliente(cliente)
            console.log("ALTEREI O DB, RESPOSTA: " + resposta)
            response.status(302)
            response.send("<script>window.location.href = 'http://127.0.0.1/login'</script>")
            
        }
    }
})

app.get("/home", (request, response) => {
    if(request.session.login) {
        response.status(200)
        response.sendFile(__dirname + "/templates/index.html")
    } else {
        response.status(302)
        response.send("<script>window.location.href = 'http://127.0.0.1/login'</script>")
    }
})

servidor.listen(process.env.PORT || 80, host, () => {
    console.log("Server is running!")
})
