/**
 * THEME TẾT NGUYÊN ĐÁN - HIỆU ỨNG ĐỘNG
 */

(function initTetTheme() {
    // 1. TẠO HOA MAI RƠI
    function createApricotFlower() {
        const flower = document.createElement('div');
        flower.classList.add('apricot-flower');
        
        // Hoa mai 5 cánh chân thực
        flower.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- 5 Cánh hoa -->
                <circle cx="15" cy="7" r="6.5" fill="#fde047" />
                <circle cx="23" cy="13" r="6.5" fill="#fde047" />
                <circle cx="20" cy="22" r="6.5" fill="#fde047" />
                <circle cx="10" cy="22" r="6.5" fill="#fde047" />
                <circle cx="7" cy="13" r="6.5" fill="#fde047" />
                
                <!-- Nhụy hoa -->
                <circle cx="15" cy="15" r="4.5" fill="#eab308" />
                <circle cx="15" cy="15" r="2" fill="#ea580c" />
                
                <!-- Chấm nhụy xung quanh -->
                <circle cx="15" cy="11.5" r="1" fill="#ea580c" />
                <circle cx="18.5" cy="13.5" r="1" fill="#ea580c" />
                <circle cx="17" cy="17.5" r="1" fill="#ea580c" />
                <circle cx="13" cy="17.5" r="1" fill="#ea580c" />
                <circle cx="11.5" cy="13.5" r="1" fill="#ea580c" />
            </svg>
        `;
        
        // Randomize vị trí, kích thước, thời gian rơi
        const startPosX = Math.random() * window.innerWidth;
        const duration = Math.random() * 5 + 5; // 5 - 10 giây
        const scale = Math.random() * 0.8 + 0.5; // 0.5x - 1.3x

        flower.style.left = `${startPosX}px`;
        flower.style.animationDuration = `${duration}s`;
        flower.style.transform = `scale(${scale})`;

        document.body.appendChild(flower);

        // Xóa hoa khi đã rơi xong
        setTimeout(() => {
            flower.remove();
        }, duration * 1000);
    }

    // Sinh hoa mai mỗi 500ms
    setInterval(createApricotFlower, 500);


    // 2. TẠO HIỆU ỨNG PHÁO HOA CƠ BẢN
    const fireworksContainer = document.createElement('div');
    fireworksContainer.id = 'fireworks-container';
    document.body.appendChild(fireworksContainer);

    function createFirework() {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * (window.innerHeight / 2); // Chỉ nổ nửa trên màn hình
        
        // Sắc độ pháo hoa đậm và rực rỡ hơn
        const colors = ['#ff0000', '#ff9900', '#ff00ff', '#00ff00', '#00ccff', '#ffff00'];
        
        for (let i = 0; i < 80; i++) {
            const particle = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.style.position = 'absolute';
            particle.style.left = `${x}px`;
            particle.style.top = `${y}px`;
            particle.style.width = '5px';
            particle.style.height = '5px';
            particle.style.backgroundColor = color;
            particle.style.borderRadius = '50%';
            // Phát sáng đậm hơn
            particle.style.boxShadow = `0 0 10px ${color}, 0 0 20px ${color}`;
            
            // Random direction and distance
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 200 + 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            particle.animate([
                { transform: 'translate(0, 0) scale(1)', opacity: 1 },
                { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
            ], {
                duration: 2500 + Math.random() * 1500, // Chậm lại
                easing: 'cubic-bezier(0, .9, .57, 1)',
                fill: 'forwards'
            });
            
            fireworksContainer.appendChild(particle);
            
            // Dọn dẹp
            setTimeout(() => {
                particle.remove();
            }, 4500);
        }
    }

    // Thỉnh thoảng bắn pháo hoa
    setInterval(() => {
        if (Math.random() > 0.2) {
            createFirework();
        }
    }, 1000);

})();
