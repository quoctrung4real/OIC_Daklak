/**
 * THEME QUỐC KHÁNH VIỆT NAM - HIỆU ỨNG ĐỘNG
 */

(function initNationalDayTheme() {
    // 1. TẠO NGÔI SAO VÀNG RƠI
    function createFallingStar() {
        const star = document.createElement('div');
        star.classList.add('falling-star');
        
        // Ngôi sao 5 cánh SVG
        star.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#ffff00"/>
            </svg>
        `;
        
        const startPosX = Math.random() * window.innerWidth;
        const duration = Math.random() * 4 + 4; // 4 - 8s
        const scale = Math.random() * 0.7 + 0.3; // 0.3x - 1.0x

        star.style.left = `${startPosX}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.transform = `scale(${scale})`;

        document.body.appendChild(star);

        setTimeout(() => { star.remove(); }, duration * 1000);
    }
    setInterval(createFallingStar, 600);

    // 2. TẠO LÁ CỜ BAY NỀN (GÓC TRÁI DƯỚI)
    const flagContainer = document.createElement('div');
    flagContainer.classList.add('waving-flag-container');
    
    const flag = document.createElement('div');
    flag.classList.add('waving-flag');
    
    flagContainer.appendChild(flag);
    document.body.appendChild(flagContainer);

})();
