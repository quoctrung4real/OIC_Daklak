document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('http://localhost:5100/api/y-kien-du-thao');
        const data = await response.json();
        
        const tbody = document.getElementById('drafts-table-body');
        tbody.innerHTML = '';
        
        if (data.success && data.draftOpinions && data.draftOpinions.length > 0) {
            const drafts = data.draftOpinions.filter(d => d.category === 'UBND tỉnh Đắk Lắk');
            
            if (drafts.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center">Chưa có ý kiến dự thảo nào.</td></tr>`;
                return;
            }

            drafts.forEach((draft, index) => {
                const tr = document.createElement('tr');
                
                let fileHtml = '';
                if (draft.fileUrl) {
                    fileHtml = `<a href="${draft.fileUrl}" class="download-btn" target="_blank" download>
                                    <i class="fas fa-download"></i> Tải về
                                </a>`;
                }

                tr.innerHTML = `
                    <td class="text-center">${index + 1}</td>
                    <td>${draft.documentNumber || ''}</td>
                    <td>${draft.title || ''}</td>
                    <td class="text-center">${fileHtml}</td>
                    <td class="text-center">${draft.endDate || ''}</td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Chưa có ý kiến dự thảo nào.</td></tr>`;
        }
    } catch (error) {
        console.error('Error fetching draft opinions:', error);
        document.getElementById('drafts-table-body').innerHTML = `<tr><td colspan="5" class="text-center text-danger">Có lỗi xảy ra khi tải dữ liệu.</td></tr>`;
    }
});
