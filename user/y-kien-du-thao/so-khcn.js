document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5100/api/y-kien-du-thao');
        const data = await response.json();
        
        const tbody = document.getElementById('drafts-table-body');
        tbody.innerHTML = '';
        
        if (data.success && data.draftOpinions && data.draftOpinions.length > 0) {
            const drafts = data.draftOpinions.filter(d => d.category === 'Sở KHCN');
            
            if (drafts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center">Chưa có văn bản dự thảo nào.</td></tr>`;
                return;
            }

            drafts.forEach((draft, index) => {
                const tr = document.createElement('tr');
                
                // If there's no actual publish date, use endDate or createdAt if available, or just empty
                const publishDate = draft.createdAt ? new Date(draft.createdAt).toLocaleDateString('vi-VN') : (draft.endDate || '');

                tr.innerHTML = `
                    <td class="text-center">${index + 1}</td>
                    <td>${draft.documentNumber || ''}</td>
                    <td class="text-center">${publishDate}</td>
                    <td>${draft.title || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" class="text-center">Chưa có văn bản dự thảo nào.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching draft opinions:', error);
        document.getElementById('drafts-table-body').innerHTML = `<tr><td colspan="4" class="text-center text-danger">Có lỗi xảy ra khi tải dữ liệu.</td></tr>`;
    }
});
