document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderDocuments();
});

async function fetchAndRenderDocuments() {
    const tableBody = document.getElementById('document-table-body');
    if (!tableBody) return;

    try {
        const response = await fetch('http://localhost:5100/api/van-ban');
        
        let data = [];
        if (response && response.ok) {
            data = await response.json();
        }

        tableBody.innerHTML = ''; // Clear loading

        if (!data || data.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center" style="padding: 30px;">Chưa có văn bản nào.</td>
                </tr>
            `;
            return;
        }

        data.forEach((doc, index) => {
            const tr = document.createElement('tr');
            
            let serverFile = '';
            let displayName = '';
            if (doc.fileUrl) {
                serverFile = doc.fileUrl.split('/').pop();
                displayName = doc.originalFileName || serverFile;
            }
            const fileLinkHtml = doc.fileUrl 
                ? `<a href="http://localhost:5100/api/download?file=${encodeURIComponent(serverFile)}&name=${encodeURIComponent(displayName)}" target="_blank" class="download-btn"><i class="fa-solid fa-download"></i> Tải tập tin</a>`
                : `<span style="color: #999;">Không có file</span>`;

            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td>${doc.documentNumber || ''}</td>
                <td class="text-center">${doc.publishedAt || ''}</td>
                <td>${doc.title || ''}</td>
                <td class="text-center">${fileLinkHtml}</td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center" style="padding: 30px; color: red;">Đã xảy ra lỗi khi tải dữ liệu.</td>
            </tr>
        `;
    }
}
