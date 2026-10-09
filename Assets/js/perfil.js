const LOGIN_URL = "../login.html"; // caminho a partir da pasta pages

/* "JSON" de usuários cadastrados */
const USUARIOS = [
  {
    id: 1,
    nome: "Clara",
    email: "Clara@Ecoveritas.com",
    senha: "123456"
  },
  {
    id:2,
    nome: "Jhenifer",
    email: "Jhenifer@Ecoveritas.com",
    senha: "123456"
  },
  {
    id: 3,
    nome: "Gabriella",
    email: "Gabriella@Ecoveritas.com",
    senha: "123456"
  },
  {
    id: 4,
    nome: "",
    email: "Usuario@Ecoveritas.com",
    senha: "123456"
  }
];

const CHAVE_PERFIS = "ecoveritas_perfis";        // { "email": { nome, foto } }
const CHAVE_SESSAO = "ecoveritas_sessao";        // email logado
const CHAVE_LEMBRAR = "ecoveritas_email_lembrado";

/* ---------- Armazenamento seguro ---------- */
function lerJSON(chave) {
  try {
    return JSON.parse(localStorage.getItem(chave)) || {};
  } catch {
    return {};
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    return false; // sem espaço ou storage bloqueado
  }
}

/*CRUD do perfil*/
const Perfil = {
  // READ
  ler(email) {
    return lerJSON(CHAVE_PERFIS)[email.toLowerCase()] || null;
  },

  // CREATE / UPDATE
  salvar(email, dados) {
    const todos = lerJSON(CHAVE_PERFIS);
    const chave = email.toLowerCase();
    todos[chave] = { ...(todos[chave] || {}), ...dados };
    return gravar(CHAVE_PERFIS, todos);
  },

  remover(email) {
    const todos = lerJSON(CHAVE_PERFIS);
    delete todos[email.toLowerCase()];
    return gravar(CHAVE_PERFIS, todos);
  }
};

const Sessao = {
  entrar(email, lembrar) {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
    (lembrar ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, email.toLowerCase());

    if (lembrar) localStorage.setItem(CHAVE_LEMBRAR, email);
    else localStorage.removeItem(CHAVE_LEMBRAR);
  },

  email() {
    return sessionStorage.getItem(CHAVE_SESSAO) || localStorage.getItem(CHAVE_SESSAO);
  },

  usuario() {
    const email = this.email();
    if (!email) return null;

    const base = USUARIOS.find(u => u.email.toLowerCase() === email);
    if (!base) return null;

    const perfil = Perfil.ler(email) || {};
    return {
      email: base.email,
      nome: perfil.nome || base.nome,
      foto: perfil.foto || ""
    };
  },

  sair() {
    localStorage.removeItem(CHAVE_SESSAO);
    sessionStorage.removeItem(CHAVE_SESSAO);
    window.location.href = LOGIN_URL;
  }
};

function lerImagem(arquivo, tamanho = 240) {
  return new Promise((resolve, reject) => {
    if (!arquivo || !arquivo.type.startsWith("image/")) {
      return reject(new Error("Escolha um arquivo de imagem."));
    }

    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Imagem inválida."));
      img.onload = () => {
        const lado = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = tamanho;
        canvas.getContext("2d").drawImage(
          img,
          (img.width - lado) / 2, (img.height - lado) / 2, lado, lado,
          0, 0, tamanho, tamanho
        );
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

function preencherAvatar(elemento, usuario) {
  elemento.innerHTML = "";
  if (usuario.foto) {
    const img = document.createElement("img");
    img.src = usuario.foto;
    img.alt = "Foto de " + usuario.nome;
    elemento.appendChild(img);
  } else {
    const icone = document.createElement("i");
    icone.className = "fa-solid fa-user";
    elemento.appendChild(icone);
  }
}

function iniciarPerfilNav() {
  const alvo = document.getElementById("perfilNav");
  if (!alvo) return;

  if (!Sessao.usuario()) {
    window.location.replace(LOGIN_URL);
    return;
  }

  alvo.innerHTML = `
    <div class="perfil-card">
      <div class="perfil-avatar" id="perfilAvatar"></div>
      <div class="perfil-dados">
        <strong id="perfilNome"></strong>
        <span id="perfilEmail"></span>
      </div>
    </div>
    <div class="perfil-acoes">
      <button type="button" id="btnEditarPerfil" aria-label="Editar perfil"><i class="fa-solid fa-pen"></i></button>
      <button type="button" id="btnSair" aria-label="Sair"><i class="fa-solid fa-right-from-bracket"></i></button>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="perfil-modal" id="perfilModal" hidden>
      <div class="perfil-modal-caixa" role="dialog" aria-modal="true" aria-labelledby="perfilModalTitulo">
        <h2 id="perfilModalTitulo">Editar perfil</h2>

        <div class="perfil-modal-foto">
          <div class="perfil-avatar perfil-avatar-grande" id="modalAvatar"></div>
          <div class="perfil-modal-botoes">
            <label class="perfil-btn-sec" for="modalFoto">
              <i class="fa-solid fa-camera"></i> Trocar foto
            </label>
            <input type="file" id="modalFoto" accept="image/*" hidden>
            <button type="button" class="perfil-btn-link" id="modalRemoverFoto">Remover foto</button>
          </div>
        </div>

        <label for="modalNome">Nome</label>
        <input type="text" id="modalNome" maxlength="40" autocomplete="name">

        <p class="perfil-erro" id="modalErro" role="alert"></p>

        <div class="perfil-modal-rodape">
          <button type="button" class="perfil-btn-link" id="modalRestaurar">Restaurar padrão</button>
          <div>
            <button type="button" class="perfil-btn-sec" id="modalCancelar">Cancelar</button>
            <button type="button" class="perfil-btn-prim" id="modalSalvar">Salvar alterações</button>
          </div>
        </div>
      </div>
    </div>
  `);

  const $ = id => document.getElementById(id);
  const modal = $("perfilModal");
  let fotoTemp = "";

  function renderNav() {
    const u = Sessao.usuario();
    preencherAvatar($("perfilAvatar"), u);
    $("perfilNome").textContent = u.nome;
    $("perfilEmail").textContent = u.email;
  }

  function abrirModal() {
    const u = Sessao.usuario();
    fotoTemp = u.foto;
    $("modalNome").value = u.nome;
    $("modalErro").textContent = "";
    preencherAvatar($("modalAvatar"), { nome: u.nome, foto: fotoTemp });
    modal.hidden = false;
    $("modalNome").focus();
  }

  function fecharModal() {
    modal.hidden = true;
    $("modalFoto").value = "";
  }

  $("btnEditarPerfil").addEventListener("click", abrirModal);
  $("btnSair").addEventListener("click", () => Sessao.sair());
  $("modalCancelar").addEventListener("click", fecharModal);
  modal.addEventListener("click", e => { if (e.target === modal) fecharModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) fecharModal(); });

  $("modalFoto").addEventListener("change", async e => {
    try {
      fotoTemp = await lerImagem(e.target.files[0]);
      $("modalErro").textContent = "";
      preencherAvatar($("modalAvatar"), { nome: "", foto: fotoTemp });
    } catch (erro) {
      $("modalErro").textContent = erro.message;
    }
  });

  $("modalRemoverFoto").addEventListener("click", () => {
    fotoTemp = "";
    preencherAvatar($("modalAvatar"), { nome: "", foto: "" });
  });

  $("modalSalvar").addEventListener("click", () => {
    const nome = $("modalNome").value.trim();
    if (!nome) {
      $("modalErro").textContent = "Digite um nome para o seu perfil.";
      return;
    }
    const ok = Perfil.salvar(Sessao.email(), { nome, foto: fotoTemp });
    if (!ok) {
      $("modalErro").textContent = "Não foi possível salvar. Tente uma foto menor.";
      return;
    }
    renderNav();
    fecharModal();
  });

  $("modalRestaurar").addEventListener("click", () => {
    Perfil.remover(Sessao.email());
    renderNav();
    fecharModal();
  });

  renderNav();
}

document.addEventListener("DOMContentLoaded", iniciarPerfilNav);