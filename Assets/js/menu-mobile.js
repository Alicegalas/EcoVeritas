(function () {
  function iniciar() {
    var menu = document.querySelector('.layout-nav');
    if (!menu) return;

    var MQ = window.matchMedia('(max-width: 1024px)');

    if (!menu.id) menu.id = 'menu-lateral';

    var tituloEl = menu.querySelector('h1');
    var nomeMarca = (tituloEl && tituloEl.textContent.trim()) || 'Ecoveritar';
    var logoOriginal = menu.querySelector('.logo-img img') || menu.querySelector('img');
    var primeiroLink = menu.querySelector('nav a');

    /* ---- Barra superior ---- */
    var barra = document.createElement('div');
    barra.className = 'mobile-bar';

    var marca = document.createElement('a');
    marca.className = 'mobile-bar-marca';
    marca.href = primeiroLink ? primeiroLink.getAttribute('href') : '/';

    if (logoOriginal) {
      var img = document.createElement('img');
      img.src = logoOriginal.getAttribute('src');
      img.alt = '';
      marca.appendChild(img);
    }
    var texto = document.createElement('span');
    texto.textContent = nomeMarca;
    marca.appendChild(texto);

    var botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'hamb-btn';
    botao.setAttribute('aria-label', 'Abrir menu');
    botao.setAttribute('aria-expanded', 'false');
    botao.setAttribute('aria-controls', menu.id);
    for (var i = 0; i < 3; i++) botao.appendChild(document.createElement('span'));

    barra.appendChild(marca);
    barra.appendChild(botao);

    var overlay = document.createElement('div');
    overlay.className = 'nav-overlay';

    document.body.insertBefore(barra, document.body.firstChild);
    document.body.appendChild(overlay);

    function estaAberto() {
      return menu.classList.contains('aberto');
    }

    function abrir() {
      menu.classList.add('aberto');
      overlay.classList.add('aberto');
      document.body.classList.add('menu-aberto');
      botao.setAttribute('aria-expanded', 'true');
      botao.setAttribute('aria-label', 'Fechar menu');
      var primeiro = menu.querySelector('nav a');
      if (primeiro) setTimeout(function () { primeiro.focus({ preventScroll: true }); }, 310);
    }

    function fechar(devolverFoco) {
      menu.classList.remove('aberto');
      overlay.classList.remove('aberto');
      document.body.classList.remove('menu-aberto');
      botao.setAttribute('aria-expanded', 'false');
      botao.setAttribute('aria-label', 'Abrir menu');
      if (devolverFoco) botao.focus();
    }

    botao.addEventListener('click', function () {
      estaAberto() ? fechar(false) : abrir();
    });

    overlay.addEventListener('click', function () { fechar(false); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && estaAberto()) fechar(true);
    });

    menu.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function () { fechar(false); });
    });

    /* Se a tela crescer (ex.: girar o tablet), reseta o estado */
    function aoMudarTela(e) {
      if (!e.matches) fechar(false);
    }
    if (MQ.addEventListener) MQ.addEventListener('change', aoMudarTela);
    else if (MQ.addListener) MQ.addListener(aoMudarTela);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();