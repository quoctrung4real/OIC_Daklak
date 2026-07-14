document.addEventListener('DOMContentLoaded', async () => {
    await fetchAndRenderDocuments();
});

async function fetchAndRenderDocuments() {
    const tableBody = document.getElementById('document-table-body');
    if (!tableBody) return;

    try {
        const apiUrl = window.BASE_URL ? `${window.BASE_URL}api/van-ban` : '/api/van-ban';
        // If testing with a custom port and full URL, we construct it:
        // Or standard fetch if proxy is working:
        const response = await fetch(window.BASE_URL ? window.BASE_URL.replace(/\/$/, '') + ':5000/api/van-ban' : 'http://localhost:5000/api/van-ban').catch(() => fetch('/api/van-ban'));
        
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
            
            const fileLinkHtml = doc.fileUrl 
                ? `<a href="${doc.fileUrl.startsWith('http') ? doc.fileUrl : 'http://localhost:5000' + doc.fileUrl}" target="_blank" class="download-btn" download><i class="fa-solid fa-download"></i> Tải tập tin</a>`
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
