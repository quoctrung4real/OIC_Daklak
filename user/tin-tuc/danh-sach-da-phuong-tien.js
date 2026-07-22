document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'video';
    const contentContainer = document.getElementById('dynamic-news-content');
    
    // Set active nav
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    const navLink = document.querySelector(`.nav-links a[href*="trang-chu.html"]`);
    if (navLink) navLink.classList.add('active');
    
    // Update breadcrumb text
    const breadcrumbText = document.getElementById('breadcrumb-type-text');
    if (breadcrumbText) {
        if (type === 'video') breadcrumbText.innerText = 'Video';
        else if (type === 'image') breadcrumbText.innerText = 'Hình ảnh';
        else if (type === 'infographic') breadcrumbText.innerText = 'Infographic';
    }

    function getYoutubeThumbnailUrl(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://img.youtube.com/vi/${match[2]}/hqdefault.jpg`;
        }
        return null;
    }

    try {
        const API_BASE = 'http://localhost:5100/api';
        const response = await fetch(`${API_BASE}/tin-tuc-da-phuong-tien?t=${new Date().getTime()}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const posts = data.posts || [];
        
        // Filter by multimediaType. Default to video if property is missing (for older data).
        const filteredPosts = posts.filter(post => {
            const postType = post.multimediaType || 'video';
            return postType === type;
        });

        // Sort posts by date descending
        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (filteredPosts.length === 0) {
            contentContainer.innerHTML = '<p style="color: #666; font-size: 16px;">Đang cập nhật nội dung...</p>';
            return;
        }

        let currentPage = parseInt(urlParams.get('page')) || 1;
        const itemsPerPage = 10;
        const totalItems = filteredPosts.length;
        const isGrid = totalItems <= 3;
        
        // Helper function to render a single card
        const renderCard = (item, isGridView) => {
            const targetUrl = type === 'video' 
                ? `${window.BASE_URL || '../../'}user/tin-tuc/chi-tiet-video.html?category=tin-tuc-da-phuong-tien&id=${item.id}`
                : `${window.BASE_URL || '../../'}user/tin-tuc/chi-tiet-tin-tuc.html?category=tin-tuc-da-phuong-tien&id=${item.id}`;
            
            let thumbUrl = item.thumbnail || getYoutubeThumbnailUrl(item.videoUrl) || item.imageUrl;
            if (thumbUrl && !thumbUrl.match(/^(http|data:)/)) {
                thumbUrl = `${API_BASE.replace('/api', '')}${thumbUrl}`;
            }
            
            if (isGridView) {
                return `
                    <a href="${targetUrl}" class="multimedia-grid-item" style="text-decoration: none; display: flex; flex-direction: column; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.05); transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 10px 20px rgba(0,0,0,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.05)';">
                        <div style="width: 100%; aspect-ratio: 16/9; background: #000; position: relative;">
                            ${thumbUrl ? 
                                `<img src="${thumbUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1a5276, #2980b9); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; text-transform: uppercase;">${type}</div>`
                            }
                            ${type === 'video' ? `
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                                <div style="background: rgba(0,0,0,0.6); border-radius: 50%; padding: 12px; display: flex; align-items: center; justify-content: center;">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px !important; height: 32px !important;">
                                        <path d="M21 15.88V16.12L13.23 21C12.78 21.27 12.55 21.27 12.35 21.15L12.14 21.03C12.05 20.98 11.97 20.9 11.92 20.81C11.87 20.72 11.84 20.61 11.83 20.51V11.49C11.83 11.38 11.86 11.28 11.92 11.18C11.97 11.09 12.05 11.01 12.14 10.95L12.35 10.83C12.55 10.72 12.78 10.72 13.37 11.06L20.69 15.34C20.79 15.4 20.86 15.48 20.92 15.57C20.97 15.67 21 15.77 21 15.88Z" fill="white" />
                                    </svg>
                                </div>
                            </div>` : ''}
                        </div>
                        <div style="padding: 16px; display: flex; flex-direction: column; flex: 1;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1e293b; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis; font-weight: 600;">${item.title}</h3>
                            <p style="margin: auto 0 0 0; font-size: 14px; color: #64748b;">${item.createdAt || ''}</p>
                        </div>
                    </a>
                `;
            } else {
                // List view (baolu-card style)
                const excerpt = item.content ? (item.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...') : '';
                return `
                    <a href="${targetUrl}" class="baolu-card" style="text-decoration: none; color: inherit; display: flex; gap: 20px; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 20px; transition: all 0.2s;">
                        <div class="baolu-img" style="width: 280px; height: 180px; flex-shrink: 0; border-radius: 6px; overflow: hidden; position: relative;">
                            ${thumbUrl ? 
                                `<img src="${thumbUrl}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;">` :
                                `<div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1a5276, #2980b9); display: flex; align-items: center; justify-content: center; color: white; font-size: 16px; font-weight: bold; text-transform: uppercase;">${type}</div>`
                            }
                            ${type === 'video' ? `
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
                                <div style="background: rgba(0,0,0,0.6); border-radius: 50%; padding: 12px; display: flex; align-items: center; justify-content: center;">
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 32px !important; height: 32px !important;">
                                        <path d="M21 15.88V16.12L13.23 21C12.78 21.27 12.55 21.27 12.35 21.15L12.14 21.03C12.05 20.98 11.97 20.9 11.92 20.81C11.87 20.72 11.84 20.61 11.83 20.51V11.49C11.83 11.38 11.86 11.28 11.92 11.18C11.97 11.09 12.05 11.01 12.14 10.95L12.35 10.83C12.55 10.72 12.78 10.72 13.37 11.06L20.69 15.34C20.79 15.4 20.86 15.48 20.92 15.57C20.97 15.67 21 15.77 21 15.88Z" fill="white" />
                                    </svg>
                                </div>
                            </div>` : ''}
                        </div>
                        <div class="baolu-info" style="flex: 1; display: flex; flex-direction: column;">
                            <h3 class="baolu-card-title" style="margin: 0 0 10px 0; font-size: 18px; color: #1e293b; line-height: 1.4; font-weight: 600;">${item.title}</h3>
                            <div class="baolu-meta" style="margin-bottom: 12px; color: #64748b; font-size: 13px; display: flex; gap: 15px;">
                                <span><i class="fa-solid fa-clock"></i> ${item.createdAt || ''}</span>
                            </div>
                            <div class="baolu-card-content" style="color: #475569; font-size: 14px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                ${excerpt}
                            </div>
                        </div>
                    </a>
                `;
            }
        };

        const renderPage = (page) => {
            if (isGrid) {
                // Layout Grid <= 3 items
                contentContainer.style.display = 'grid';
                contentContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
                contentContainer.style.gap = '24px';
                
                let html = '';
                filteredPosts.forEach(item => {
                    html += renderCard(item, true);
                });
                contentContainer.innerHTML = html;
            } else {
                // Layout List > 3 items with pagination
                contentContainer.style.display = 'block';
                const start = (page - 1) * itemsPerPage;
                const end = start + itemsPerPage;
                const pageItems = filteredPosts.slice(start, end);
                
                let html = '';
                pageItems.forEach(item => {
                    html += renderCard(item, false);
                });
                contentContainer.innerHTML = html;
            }
        };

        const renderPagination = (page) => {
            const paginationContainer = document.getElementById('pagination-container');
            if (!paginationContainer || isGrid) {
                if (paginationContainer) paginationContainer.innerHTML = '';
                return;
            }
            
            const totalPages = Math.ceil(totalItems / itemsPerPage);
            if (totalPages <= 1) {
                paginationContainer.innerHTML = '';
                return;
            }
            
            let html = '';
            const maxButtons = 5;
            let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
            let endPage = startPage + maxButtons - 1;

            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxButtons + 1);
            }

            if (startPage > 1) {
                html += `<button class="page-btn" data-page="1">1</button>`;
                if (startPage > 2) html += `<span class="page-ellipsis">...</span>`;
            }

            for (let i = startPage; i <= endPage; i++) {
                html += `<button class="page-btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) html += `<span class="page-ellipsis">...</span>`;
                html += `<button class="page-btn" data-page="${totalPages}">${totalPages}</button>`;
            }

            paginationContainer.innerHTML = html;
            
            paginationContainer.querySelectorAll('.page-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newPage = parseInt(btn.getAttribute('data-page'));
                    if (newPage && newPage !== currentPage) {
                        currentPage = newPage;
                        
                        // Update URL
                        const newUrlParams = new URLSearchParams(window.location.search);
                        newUrlParams.set('page', currentPage);
                        window.history.pushState({}, '', `${window.location.pathname}?${newUrlParams.toString()}`);
                        
                        renderPage(currentPage);
                        renderPagination(currentPage);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                });
            });
        };

        // Render init
        renderPage(currentPage);
        renderPagination(currentPage);
    } catch (error) {
        console.error('Error fetching data:', error);
        contentContainer.innerHTML = '<p style="color: red; font-size: 16px;">Đã xảy ra lỗi khi tải dữ liệu.</p>';
        contentContainer.style.display = 'block';
    }
});
