const DESTINO_APOS_LOGIN = "pages/Inicio.html";

const form = document.getElementById("formLogin");
const campoEmail = document.getElementById("email");
const campoSenha = document.getElementById("senha");
const campoLembrar = document.getElementById("lembrar");
const campoNome = document.getElementById("nomePerfil");
const campoFoto = document.getElementById("fotoPerfil");
const previaFoto = document.getElementById("previaFoto");
const btnRemoverFoto = document.getElementById("removerFoto");
const erroLogin = document.getElementById("erroLogin");

let fotoEscolhida = "";

// Já está logado Vai direto para o dash.
if (Sessao.usuario()) {
  window.location.replace(DESTINO_APOS_LOGIN);
}

const emailLembrado = localStorage.getItem(CHAVE_LEMBRAR);
if (emailLembrado) {
  campoEmail.value = emailLembrado;
  mostrarPerfilSalvo(emailLembrado);
}


function desenharPrevia() {
  previaFoto.innerHTML = "";
  if (fotoEscolhida) {
    const img = document.createElement("img");
    img.src = fotoEscolhida;
    img.alt = "Prévia da foto";
    previaFoto.appendChild(img);
  } else {
    previaFoto.innerHTML = '<i class="fa-solid fa-camera"></i>';
  }
  btnRemoverFoto.hidden = !fotoEscolhida;
}

// Se esse e-mail já tem perfil salvo, mostra nome/foto
function mostrarPerfilSalvo(email) {
  const salvo = Perfil.ler(email.trim());
  if (!salvo) return;
  if (salvo.nome && !campoNome.value) campoNome.value = salvo.nome;
  if (salvo.foto && !fotoEscolhida) {
    fotoEscolhida = salvo.foto;
    desenharPrevia();
  }
}

campoEmail.addEventListener("blur", () => mostrarPerfilSalvo(campoEmail.value));

campoFoto.addEventListener("change", async e => {
  try {
    fotoEscolhida = await lerImagem(e.target.files[0]);
    erroLogin.textContent = "";
    desenharPrevia();
  } catch (erro) {
    erroLogin.textContent = erro.message;
  }
});

btnRemoverFoto.addEventListener("click", () => {
  fotoEscolhida = "";
  campoFoto.value = "";
  desenharPrevia();
});

const btnVerSenha = document.getElementById("verSenha");
btnVerSenha.addEventListener("click", () => {
  const mostrando = campoSenha.type === "text";
  campoSenha.type = mostrando ? "password" : "text";
  btnVerSenha.setAttribute("aria-label", mostrando ? "Mostrar senha" : "Ocultar senha");
  btnVerSenha.innerHTML = mostrando
    ? '<i class="fa-regular fa-eye"></i>'
    : '<i class="fa-regular fa-eye-slash"></i>';
});

form.addEventListener("submit", e => {
  e.preventDefault();
  erroLogin.textContent = "";

  const email = campoEmail.value.trim();
  const senha = campoSenha.value;

  if (!email || !senha) {
    erroLogin.textContent = "Preencha o e-mail e a senha.";
    return;
  }

  const usuario = USUARIOS.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
  );

  if (!usuario) {
    erroLogin.textContent = "E-mail ou senha incorretos.";
    campoSenha.value = "";
    campoSenha.focus();
    return;
  }

  const dados = {};
  const nome = campoNome.value.trim();
  if (nome) dados.nome = nome;
  dados.foto = fotoEscolhida;

  if (!Perfil.salvar(usuario.email, dados)) {
    erroLogin.textContent = "Não foi possível salvar a foto. Tente uma imagem menor.";
    return;
  }

  Sessao.entrar(usuario.email, campoLembrar.checked);
  window.location.href = DESTINO_APOS_LOGIN;
});