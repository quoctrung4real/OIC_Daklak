/**
 * THEME CÀ PHÊ BUÔN MA THUỘT - HIỆU ỨNG ĐỘNG
 */

(function initCoffeeTheme() {
    // 1. TẠO HẠT CÀ PHÊ RƠI
    function createCoffeeBean() {
        const bean = document.createElement('div');
        bean.classList.add('coffee-bean');
        
        // Hạt cà phê SVG
        bean.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#78350f"/>
                <path d="M7 12C8 9 12 7 16 9C17.5 9.75 18 12 16.5 13.5C14.5 15.5 10.5 16.5 8 15C6.5 14.1 6 13.5 7 12Z" fill="#451a03"/>
            </svg>
        `;
        
        const startPosX = Math.random() * window.innerWidth;
        const duration = Math.random() * 6 + 6; // 6 - 12s
        const scale = Math.random() * 0.8 + 0.6; 

        bean.style.left = `${startPosX}px`;
        bean.style.animationDuration = `${duration}s`;
        bean.style.transform = `scale(${scale})`;

        document.body.appendChild(bean);

        setTimeout(() => { bean.remove(); }, duration * 1000);
    }
    setInterval(createCoffeeBean, 800);

    // 2. CON VOI ĐI NGANG MÀN HÌNH
    const elephant = document.createElement('div');
    elephant.classList.add('coffee-elephant');
    // Simple SVG Elephant silhouette + Coffee Cart
    elephant.innerHTML = `
        <svg width="250" height="140" viewBox="-30 -40 250 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Rope -->
            <path d="M90 60 C 110 70, 130 70, 140 65" stroke="#451a03" stroke-width="2" fill="none" stroke-dasharray="4 2"/>

            <!-- Elephant -->
            <g class="elephant-body">
                <!-- Background Legs -->
                <path class="leg back-leg-1" d="M70 55 L75 84 C 71 84, 71 90, 75 90 L85 90 L80 55 Z" fill="#451a03" style="transform-origin: 75px 55px;"/>
                <path class="leg front-leg-1" d="M30 55 L32 84 C 28 84, 28 90, 32 90 L42 90 L38 55 Z" fill="#451a03" style="transform-origin: 35px 55px;"/>
                
                <!-- Main Body -->
                <path d="M90 50 C95 30, 80 15, 60 15 C40 15, 25 25, 20 40 C15 55, 20 70, 30 75 C40 80, 70 80, 85 75 C95 70, 95 60, 90 50 Z" fill="#78350f"/>
                
                <!-- Head -->
                <path d="M25 35 C10 35, 0 45, 0 60 C0 65, 5 70, 15 70 C25 70, 35 60, 35 50 C35 40, 35 35, 25 35 Z" fill="#78350f"/>
                
                <!-- Trunk -->
                <path class="trunk" d="M 10 60 C -5 70, -10 90, 5 100" stroke="#78350f" stroke-width="12" stroke-linecap="round" fill="none" style="transform-origin: 10px 60px;"/>
                
                <!-- Ear -->
                <path d="M35 30 C20 30, 15 50, 30 65 C40 75, 50 60, 45 40 C42 32, 38 30, 35 30 Z" fill="#451a03"/>
                
                <!-- Eye -->
                <circle cx="15" cy="45" r="3" fill="#fef3c7"/>
                <circle cx="14" cy="45" r="1.5" fill="#1c1917"/>
                
                <!-- Tusk -->
                <path d="M12 65 C5 75, -5 70, -10 60" stroke="#fef3c7" stroke-width="4" stroke-linecap="round" fill="none"/>
                
                <!-- Foreground Legs -->
                <path class="leg back-leg-2" d="M60 55 L65 86 C 61 86, 61 92, 65 92 L75 92 L70 55 Z" fill="#78350f" style="transform-origin: 65px 55px;"/>
                <path class="leg front-leg-2" d="M20 55 L22 86 C 18 86, 18 92, 22 92 L32 92 L28 55 Z" fill="#78350f" style="transform-origin: 25px 55px;"/>
                
                <!-- Tail -->
                <path d="M85 45 C95 55, 100 70, 95 85" stroke="#78350f" stroke-width="3" fill="none" stroke-linecap="round"/>
                <path d="M93 83 L97 90 L92 90 Z" fill="#78350f"/>
            </g>

            <!-- Coffee Cart -->
            <g transform="translate(140, 35)">
                <g class="coffee-cart">
                    <!-- Cart Base -->
                    <rect x="0" y="45" width="50" height="8" rx="2" fill="#451a03"/>
                    <!-- Wheels -->
                    <circle cx="10" cy="55" r="6" fill="#1c1917"/>
                    <circle cx="10" cy="55" r="2" fill="#78350f"/>
                    <circle cx="40" cy="55" r="6" fill="#1c1917"/>
                    <circle cx="40" cy="55" r="2" fill="#78350f"/>
                    
                    <!-- Coffee Cup -->
                    <path d="M10 15 C10 45, 40 45, 40 15 Z" fill="#fef3c7"/>
                    <path d="M10 15 L40 15" stroke="#fcd34d" stroke-width="4" stroke-linecap="round"/>
                    <!-- Cup Handle -->
                    <path d="M40 20 C50 20, 50 35, 38 35" stroke="#fef3c7" stroke-width="4" fill="none" stroke-linecap="round"/>
                    
                    <!-- Coffee Logo/Bean -->
                    <path d="M25 22 C28 22, 30 25, 30 28 C30 31, 28 34, 25 34 C22 34, 20 31, 20 28 C20 25, 22 22, 25 22 Z" fill="#78350f"/>
                    <path d="M23 28 C25 25, 27 25, 27 28" stroke="#451a03" stroke-width="1.5" fill="none" stroke-linecap="round"/>

                    <!-- Smoke -->
                    <g class="smoke-group">
                        <path class="smoke smoke-1" d="M20 5 C15 -5, 25 -15, 20 -25" stroke="#e5e7eb" stroke-width="3" fill="none" stroke-linecap="round" opacity="0"/>
                        <path class="smoke smoke-2" d="M30 0 C35 -10, 25 -20, 30 -30" stroke="#e5e7eb" stroke-width="3" fill="none" stroke-linecap="round" opacity="0"/>
                    </g>
                </g>
            </g>
        </svg>
    `;
    document.body.appendChild(elephant);

    // Hàm gọi voi bước ra
    function walkElephant() {
        if (!elephant.classList.contains('walk-in')) {
            elephant.classList.add('walk-in');
            setTimeout(() => {
                elephant.classList.remove('walk-in');
            }, 15500); // Đợi 15.5s cho animation CSS hoàn tất
        }
    }

    // Voi bước ra ngay sau 1s
    setTimeout(walkElephant, 1000);

    // Sau đó lặp lại mỗi 20s
    setInterval(walkElephant, 20000);

})();
