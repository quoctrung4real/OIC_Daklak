document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    
    const keywordSpan = document.getElementById('search-keyword');
    const container = document.getElementById('search-results-container');
    
    if (!query) {
        keywordSpan.textContent = '...';
        container.innerHTML = '<div style="color: #64748b; font-style: italic;">Vui lòng nhập từ khóa để tìm kiếm.</div>';
        return;
    }
    
    keywordSpan.textContent = `"${query}"`;
    
    try {
        const res = await fetch(`http://localhost:5100/api/tim-kiem?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        
        if (data.success && data.results && data.results.length > 0) {
            let html = '<ul style="list-style: none; padding: 0; margin: 0;">';
            data.results.forEach(item => {
                // Ensure URLs are properly resolved relative to current page if they are not absolute
                let itemUrl = item.url || '#';
                
                let typeBadge = '';
                if (item.type) {
                    typeBadge = `<span style="background: #e2e8f0; color: #475569; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; margin-bottom: 8px; display: inline-block;">${item.type}</span>`;
                }
                
                let dateInfo = '';
                if (item.publishedAt) {
                    const dateObj = new Date(item.publishedAt);
                    if (!isNaN(dateObj)) {
                        dateInfo = `<div style="font-size: 13px; color: #94a3b8; margin-top: 5px;"><i class="fa-regular fa-clock"></i> ${dateObj.toLocaleDateString('vi-VN')}</div>`;
                    }
                }
                
                html += `
                    <li style="padding: 20px 0; border-bottom: 1px solid #e2e8f0;">
                        ${typeBadge}
                        <h3 style="margin: 0 0 10px 0; font-size: 18px;">
                            <a href="../../${itemUrl}" style="color: #0a59ab; text-decoration: none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${item.title || 'Không có tiêu đề'}</a>
                        </h3>
                        <div style="font-size: 14px; color: #475569; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                            ${item.summary || 'Không có mô tả'}
                        </div>
                        ${dateInfo}
                    </li>
                `;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = `<div style="color: #64748b; font-style: italic; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">Không tìm thấy kết quả nào phù hợp với từ khóa <strong>"${query}"</strong>. Vui lòng thử lại với từ khóa khác.</div>`;
        }
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="color: #ef4444; padding: 15px; background: #fef2f2; border-radius: 6px; border: 1px solid #fca5a5;">Đã xảy ra lỗi khi tìm kiếm. Backend có thể chưa được bật hoặc không phản hồi.</div>';
    }
});
