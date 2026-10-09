const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visivel");
            observer.unobserve(entry.target); // para de observar depois que apareceu
        }
    });
});

// Função reutilizável: observa todos os .escondido que ainda não foram observados
function observarEscondidos(container = document) {
    container.querySelectorAll(".escondido:not(.visivel)").forEach((el) => {
        observer.observe(el);
    });
}

observarEscondidos();

// ===== Empresas Certificadas =====
(function () {
    const gridEl = document.getElementById("grid");
    // se essa página não tiver o grid, não executa nada (evita erro em outras páginas)
    if (!gridEl) return;

    const chipsEl = document.getElementById("chips");
    const countEl = document.getElementById("resultCount");
    const searchInput = document.getElementById("searchInput");

    // ---------- Ícones (Font Awesome) ----------
    const iconCheck = `<i class="fa-solid fa-circle-check"></i>`;
    const iconArrow = `<i class="fa-solid fa-arrow-right"></i>`;

    const badgeIcon = {
        "Ambiental": `<i class="fa-solid fa-leaf"></i>`,
        "Social": `<i class="fa-solid fa-users"></i>`,
        "Governança": `<i class="fa-solid fa-scale-balanced"></i>`
    };

    // ---------- Categorias (chips de filtro) ----------
    const categories = ["Todas", "Ambiental", "Social", "Governança", "Cosméticos", "Alimentação", "Tecnologia", "Vestuário"];

    // ---------- Dados das empresas ----------
    // "tags"  = categorias/certificações usadas no filtro
    // "logo"  = caminho ou URL da imagem da logo. Deixe "" (vazio) para usar as iniciais como fallback.
    const companies = [
        {
            name: "Natura Cosméticos", sector: "Cosméticos",
            tags: ["Cosméticos", "Ambiental", "Social"],
            badges: ["Ambiental", "Social"],
            rating: 5, initials: "N", color: "#2f8f4e",
            logo: "../Assets/img/EmpresacertNatura.png"
        },
        {
            name: "Ambev", sector: "Bebidas",
            tags: ["Alimentação", "Ambiental", "Social"],
            badges: ["Ambiental", "Social"],
            rating: 4.5, initials: "AB", color: "#c9a227",
            logo: "../Assets/img/EmpresacertAmbev.png"
        },
        {
            name: "Renova Energia", sector: "Energia",
            tags: ["Ambiental", "Social"],
            badges: ["Ambiental", "Social"],
            rating: 4.5, initials: "RE", color: "#1f6b3a",
            logo: "../Assets/img/Renova.png"
        },
        {
            name: "O Boticário", sector: "Cosméticos",
            tags: ["Cosméticos", "Ambiental", "Social"],
            badges: ["Ambiental", "Social"],
            rating: 4.5, initials: "OB", color: "#3a3a3a",
            logo: "../Assets/img/Boticario.png"
        },
        {
            name: "Carrefour", sector: "Varejo",
            tags: ["Alimentação", "Ambiental", "Social"],
            badges: ["Ambiental", "Social"],
            rating: 3.5, initials: "C", color: "#0057a8",
            logo: "../Assets/img/carrefour.png"
        },
        {
            name: "Patagonia", sector: "Vestuário",
            tags: ["Vestuário", "Ambiental", "Social"],
            badges: ["Ambiental", "Social"],
            rating: 5, initials: "P", color: "#8a6d3b",
            logo: "../Assets/img/patagonia.png"
        },
        {
            name: "Unilever", sector: "Alimentos e Higiene",
            tags: ["Alimentação", "Ambiental", "Social", "Governança"],
            badges: ["Ambiental", "Social", "Governança"],
            rating: 4.5, initials: "U", color: "#1b6fb8",
            logo: "../Assets/img/unilaver.png"
        },
        {
            name: "Microsoft", sector: "Tecnologia",
            tags: ["Tecnologia", "Ambiental", "Social", "Governança"],
            badges: ["Ambiental", "Social", "Governança"],
            rating: 5, initials: "MS", color: "#5a5a5a",
            logo: "../Assets/img/microsoft.png"
        }
    ];

    let activeCategory = "Todas";
    let searchTerm = "";

    // ---------- Render chips ----------
    function renderChips() {
        chipsEl.innerHTML = categories.map(cat => `
            <button class="chip ${cat === activeCategory ? 'active' : ''}" data-cat="${cat}">${cat}</button>
        `).join("");
        chipsEl.querySelectorAll(".chip").forEach(btn => {
            btn.addEventListener("click", () => {
                activeCategory = btn.dataset.cat;
                renderChips();
                renderGrid();
            });
        });
    }

    // ---------- Estrelas ----------
    function renderStars(rating) {
        let html = "";
        for (let i = 1; i <= 5; i++) {
            if (rating >= i) html += `<i class="fa-solid fa-star"></i>`;
            else if (rating >= i - 0.5) html += `<i class="fa-solid fa-star-half-stroke"></i>`;
            else html += `<i class="fa-regular fa-star"></i>`;
        }
        return html;
    }

    // ---------- Logo (imagem com fallback para iniciais) ----------
    function renderLogo(c) {
        if (c.logo) {
            return `<div class="logo-badge has-image">
                <img src="${c.logo}" alt="${c.name}"
                     onerror="this.parentElement.outerHTML='<div class=&quot;logo-badge&quot; style=&quot;background:${c.color}&quot;>${c.initials}</div>'">
            </div>`;
        }
        return `<div class="logo-badge" style="background:${c.color}">${c.initials}</div>`;
    }

    // ---------- Render grid ----------
    function renderGrid() {
        const filtered = companies.filter(c => {
            const matchesCategory = activeCategory === "Todas" || c.tags.includes(activeCategory);
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });

        countEl.textContent = `${filtered.length} ${filtered.length === 1 ? "empresa encontrada" : "empresas encontradas"}`;

        if (filtered.length === 0) {
            gridEl.innerHTML = `<div class="empty escondido">Nenhuma empresa encontrada para este filtro.</div>`;
            observarEscondidos(gridEl);
            return;
        }

        gridEl.innerHTML = filtered.map((c, i) => `
            <div class="card escondido" style="transition-delay: ${i * 60}ms">
                <div class="card-top">
                    ${renderLogo(c)}
                    <div class="cert">${iconCheck}Certificada</div>
                </div>
                <h3>${c.name}</h3>
                <p class="sector">${c.sector}</p>
                <div class="badges">
                    ${c.badges.map(b => `<span class="badge-item">${badgeIcon[b]}${b}</span>`).join("")}
                </div>
                <div class="stars">${renderStars(c.rating)}</div>
                <button class="details-btn">Ver detalhes ${iconArrow}</button>
            </div>
        `).join("");

        observarEscondidos(gridEl);
    }

    // ---------- Busca ----------
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchTerm = e.target.value;
            renderGrid();
        });
    }

    // ---------- Init ----------
    renderChips();
    renderGrid();
})();