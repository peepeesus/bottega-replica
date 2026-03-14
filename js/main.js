document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const megaMenu = document.getElementById('megaMenu');

    menuToggle.addEventListener('click', () => {
        megaMenu.classList.toggle('is-active');
        
        // Transform hamburger to X
        const spans = menuToggle.querySelectorAll('span');
        if (megaMenu.classList.contains('is-active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
});
