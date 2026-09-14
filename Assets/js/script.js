const elementos = document.querySelectorAll(".escondido");

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visivel");
        }
    });
});

elementos.forEach((elemento) => {
    observer.observe(elemento);
});