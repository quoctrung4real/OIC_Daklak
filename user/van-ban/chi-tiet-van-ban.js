(() => {
    const API_BASE = 'http://localhost:5100/api';
    const BACKEND_ORIGIN = 'http://localhost:5100';

    let currentDocument = null;

    document.addEventListener('DOMContentLoaded', async () => {
        const id = new URLSearchParams(window.location.search).get('id');
        const titleEl = document.getElementById('detail-title');

        if (!id) {
            if (titleEl) titleEl.textContent = 'Không tìm thấy văn bản';
            return;
        }

        setupTtsButton();
        await loadDocumentDetail(id);
    });

    async function loadDocumentDetail(id) {
        const titleEl = document.getElementById('detail-title');

        try {
            const response = await fetch(`${API_BASE}/van-ban/${encodeURIComponent(id)}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (!data.success || !data.document) {
                if (titleEl) titleEl.textContent = 'Văn bản không tồn tại hoặc đã bị xóa';
                return;
            }

            currentDocument = data.document;
            renderDocument(currentDocument);
            await loadRelatedDocuments(currentDocument, id);
        } catch (error) {
            console.error(error);
            if (titleEl) titleEl.textContent = 'Lỗi kết nối hoặc tải dữ liệu';
        }
    }

    function renderDocument(doc) {
        setText('detail-title', doc.title || 'Đang cập nhật');
        setText('detail-summary', doc.title || 'Đang cập nhật');
        setText('detail-number', doc.documentNumber || 'Đang cập nhật');
        setText('detail-published-at', formatDate(doc.publishedAt));
        setText('detail-effective-date', formatDate(doc.effectiveDate));
        setText('detail-domain', doc.domain || 'Đang cập nhật');
        setText('detail-type', doc.typeName || doc.typeCode || 'Đang cập nhật');
        setText('detail-authority', doc.issuingAuthority || 'Đang cập nhật');
        setText('detail-signer', doc.signer || 'Đang cập nhật');

        const fileAction = document.getElementById('detail-file-action');
        if (!fileAction) return;

        if (doc.fileUrl) {
            const serverFile = doc.fileUrl.split('/').pop();
            const displayName = doc.originalFileName || serverFile;
            fileAction.innerHTML = `
                <a href="${API_BASE}/download?file=${encodeURIComponent(serverFile)}&name=${encodeURIComponent(displayName)}"
                   class="doc-btn doc-btn-primary"
                   target="_blank"
                   style="text-decoration: none; padding: 8px 16px; font-size: 14px;">
                    <i class="fa-solid fa-download"></i>
                    Tải văn bản
                </a>`;
        } else {
            fileAction.innerHTML = '<span style="color: #64748b; font-style: italic; display: flex; align-items: center; height: 100%;">Không có file đính kèm</span>';
        }
    }

    function setupTtsButton() {
        const ttsBtn = document.getElementById('docTtsBtn');
        if (!ttsBtn) return;

        ttsBtn.addEventListener('click', async () => {
            const status = document.getElementById('docTtsStatus');
            const audio = document.getElementById('docDetailAudio');
            const buttonText = ttsBtn.querySelector('span');
            const text = buildDocumentSpeechText(currentDocument);

            if (!text) {
                if (status) status.textContent = 'Chưa có nội dung để đọc.';
                return;
            }

            try {
                ttsBtn.disabled = true;
                if (buttonText) buttonText.textContent = 'Đang tạo audio...';
                if (status) status.textContent = 'Đang gọi Azure TTS...';

                const response = await fetch(`${API_BASE}/text-to-speech`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json; charset=utf-8' },
                    body: JSON.stringify({ text })
                });

                const result = await response.json();
                if (!response.ok || !result.success || !result.audioUrl) {
                    throw new Error(result.message || 'Không tạo được audio.');
                }

                if (audio) {
                    audio.src = result.audioUrl.startsWith('http')
                        ? result.audioUrl
                        : `${BACKEND_ORIGIN}${result.audioUrl}`;
                    audio.style.display = 'block';
                    await audio.play();
                }

                if (status) {
                    status.textContent = result.cached
                        ? 'Đang phát audio từ cache.'
                        : 'Đã tạo audio mới.';
                }
            } catch (error) {
                console.error(error);
                if (status) status.textContent = error.message || 'Lỗi tạo audio.';
            } finally {
                ttsBtn.disabled = false;
                if (buttonText) buttonText.textContent = 'Nghe nội dung';
            }
        });
    }

    function buildDocumentSpeechText(doc) {
        if (!doc) return '';

        return [
            'Thông tin văn bản.',
            doc.title ? `Trích yếu: ${doc.title}.` : '',
            doc.documentNumber ? `Số ký hiệu: ${doc.documentNumber}.` : '',
            doc.publishedAt ? `Ngày ban hành: ${doc.publishedAt}.` : '',
            doc.effectiveDate ? `Ngày có hiệu lực: ${doc.effectiveDate}.` : '',
            doc.typeName ? `Loại văn bản: ${doc.typeName}.` : '',
            doc.issuingAuthority ? `Cơ quan ban hành: ${doc.issuingAuthority}.` : '',
            doc.signer ? `Người ký: ${doc.signer}.` : ''
        ].filter(Boolean).join(' ');
    }

    async function loadRelatedDocuments(doc, currentId) {
        if (!doc.typeCode) return;

        try {
            const response = await fetch(`${API_BASE}/van-ban?type=${encodeURIComponent(doc.typeCode)}`);
            if (!response.ok) return;

            const docs = await response.json();
            const relatedDocs = docs.filter(item => String(item.id) !== String(currentId)).slice(0, 5);
            if (relatedDocs.length === 0) return;

            const container = document.getElementById('related-docs-container');
            const listContainer = document.getElementById('related-docs-list');
            if (!container || !listContainer) return;

            container.style.display = 'block';
            listContainer.innerHTML = '';

            relatedDocs.forEach(item => {
                const link = document.createElement('a');
                link.href = `chi-tiet.html?id=${item.id}`;
                link.style.cssText = 'display: block; padding: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: inherit; transition: all 0.2s;';
                link.onmouseover = () => link.style.borderColor = '#0a59ab';
                link.onmouseout = () => link.style.borderColor = '#e2e8f0';
                link.innerHTML = `
                    <div style="font-weight: 600; color: #0a59ab; margin-bottom: 8px; font-size: 15px; line-height: 1.4;">${escapeHtml(item.title || item.documentNumber || 'Văn bản chưa có tiêu đề')}</div>
                    <div style="font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 15px;">
                        <span><i class="fa-regular fa-calendar"></i> ${escapeHtml(formatDate(item.publishedAt))}</span>
                        <span><i class="fa-solid fa-building"></i> ${escapeHtml(item.issuingAuthority || 'Đang cập nhật')}</span>
                    </div>`;
                listContainer.appendChild(link);
            });
        } catch (error) {
            console.error('Lỗi tải văn bản liên quan:', error);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Đang cập nhật';
        const date = new Date(dateString);
        return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('vi-VN');
    }

    function setText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
})();
