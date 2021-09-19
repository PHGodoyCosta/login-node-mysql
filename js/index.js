const email = document.getElementById("email")
const senha = document.getElementById("senha")

function getSenha() {
    var senha1 = document.getElementById("senha")
    if (senha1.type == "password") {
        senha1.setAttribute("type", "text")
    } else {
        senha1.setAttribute("type", "password")
    }
}

email.addEventListener("change", function(event) {
    changeColor()
})
window.addEventListener("keydown", function(event) {
    var email1 = document.getElementById("email")
    var senha1 = document.getElementById("senha")
    var key = event.keyCode
    if (key == 13) {
        if (email1.value == "") {
            email.focus()
        } else if (senha1 == "") {
            email.focus()
        } else {
            document.getElementById("enter").click()
        }
    }
    changeColor()
})
document.getElementById("verSenha").addEventListener("click", function() {
    var senha1 = document.getElementById("senha")
    if (senha1.type == "password") {
        senha1.setAttribute("type", "text")
    } else if (senha1.type == "text") {
        senha1.setAttribute("type", "password")
    }
})