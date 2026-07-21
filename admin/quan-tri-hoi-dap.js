// Quản lý Hỏi đáp qua backend (FAQ và câu hỏi người dân).
let qnaFaqs = [];
let qnaUserQuestions = [];

const qnaEscape = value => String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[char]));

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('faqForm')?.addEventListener('submit', async event => {
        event.preventDefault();
        await saveFaq();
    });
    document.getElementById('replyQuestionForm')?.addEventListener('submit', async event => {
        event.preventDefault();
        await saveReply();
    });
    loadFaqs();
    loadUserQuestions();
});

async function loadFaqs() {
    const tbody = document.getElementById('faqTableBody');
    if (!tbody) return;
    try {
        const response = await apiFetch(`${API_BASE}/faq`);
        if (!response.ok) throw new Error('Không tải được FAQ');
        qnaFaqs = await response.json();
        tbody.innerHTML = qnaFaqs.length ? qnaFaqs.map(faq => `
            <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:12px">${faq.id}</td>
                <td style="padding:12px;font-weight:500">${qnaEscape(faq.question)}</td>
                <td style="padding:12px">${faq.order}</td>
                <td class="sys-action-cell">
                    <button class="sys-btn-edit" onclick="editFaq(${faq.id})" title="Sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="sys-btn-delete" onclick="deleteFaq(${faq.id})" title="Xóa"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>`).join('') : '<tr><td colspan="4" style="text-align:center;padding:20px">Chưa có dữ liệu</td></tr>';
    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#b91c1c">Không tải được dữ liệu</td></tr>';
        console.error(error);
    }
}

function openFaqModal() {
    document.getElementById('faqForm').reset();
    document.getElementById('faqFormId').value = '';
    document.getElementById('faqModalTitle').textContent = 'Thêm FAQ mới';
    document.getElementById('faqModal').style.display = 'flex';
}

function closeFaqModal() { document.getElementById('faqModal').style.display = 'none'; }

function editFaq(id) {
    const faq = qnaFaqs.find(item => item.id === id);
    if (!faq) return;
    document.getElementById('faqFormId').value = faq.id;
    document.getElementById('faqFormQuestion').value = faq.question ?? '';
    document.getElementById('faqFormAnswer').value = faq.answer ?? '';
    document.getElementById('faqFormOrder').value = faq.order ?? 0;
    document.getElementById('faqModalTitle').textContent = 'Cập nhật FAQ';
    document.getElementById('faqModal').style.display = 'flex';
}

async function saveFaq() {
    const id = Number(document.getElementById('faqFormId').value) || null;
    const payload = {
        question: document.getElementById('faqFormQuestion').value.trim(),
        answer: document.getElementById('faqFormAnswer').value.trim(),
        order: Number(document.getElementById('faqFormOrder').value) || 0
    };
    const response = await apiFetch(id ? `${API_BASE}/faq/${id}` : `${API_BASE}/faq`, {
        method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    });
    if (!response.ok) return showAlert('Không thể lưu FAQ', false);
    closeFaqModal();
    await loadFaqs();
    showAlert(id ? 'Cập nhật FAQ thành công' : 'Thêm FAQ thành công');
}

function deleteFaq(id) {
    showConfirm('Bạn có chắc chắn muốn xóa câu hỏi thường gặp này?', async () => {
        const response = await apiFetch(`${API_BASE}/faq/${id}`, { method: 'DELETE' });
        if (!response.ok) return showAlert('Không thể xóa FAQ', false);
        await loadFaqs();
        showAlert('Đã xóa FAQ');
    });
}

async function loadUserQuestions() {
    const tbody = document.getElementById('userQuestionsTableBody');
    if (!tbody) return;
    try {
        const response = await apiFetch(`${API_BASE}/admin/cau-hoi-nguoi-dan`);
        if (!response.ok) throw new Error('Không tải được câu hỏi');
        qnaUserQuestions = await response.json();
        tbody.innerHTML = qnaUserQuestions.length ? qnaUserQuestions.map(item => {
            const answered = item.status === 'answered';
            return `<tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:12px"><b>${qnaEscape(item.senderName)}</b><div style="font-size:12px;color:#64748b">${qnaEscape(item.senderPhone)}</div></td>
                <td style="padding:12px"><b>${qnaEscape(item.title || 'Không có tiêu đề')}</b><div>${qnaEscape(item.content)}</div></td>
                <td style="padding:12px">${item.createdAt ? new Date(item.createdAt.replace(' ', 'T') + 'Z').toLocaleString('vi-VN') : ''}</td>
                <td style="padding:12px">${answered ? 'Đã trả lời' : 'Chờ trả lời'}${item.isPublic ? ' · Công khai' : ''}</td>
                <td class="sys-action-cell"><button onclick="openReplyModal(${item.id})" class="sys-btn-edit"><i class="fa-solid fa-reply"></i></button><button onclick="deleteUserQuestion(${item.id})" class="sys-btn-delete"><i class="fa-solid fa-trash"></i></button></td>
            </tr>`;
        }).join('') : '<tr><td colspan="5" style="text-align:center;padding:20px">Chưa có câu hỏi nào</td></tr>';
    } catch (error) { console.error(error); }
}

function openReplyModal(id) {
    const item = qnaUserQuestions.find(value => value.id === id);
    if (!item) return;
    document.getElementById('replyFormId').value = item.id;
    document.getElementById('replyFormTopic').textContent = item.topic || 'Không xác định';
    document.getElementById('replyFormTitle').textContent = item.title || 'Không có tiêu đề';
    document.getElementById('replyFormSenderName').textContent = item.senderName || 'Ẩn danh';
    document.getElementById('replyFormSenderAddress').textContent = item.address || 'Không có địa chỉ';
    document.getElementById('replyFormQuestionContent').textContent = item.content || '';
    document.getElementById('replyFormSenderEmail').textContent = item.senderEmail || '';
    document.getElementById('replyFormSenderPhone').textContent = item.senderPhone || '';
    document.getElementById('replyFormDate').textContent = item.createdAt || '';
    document.getElementById('replyFormAnswerContent').value = item.answer || '';
    document.getElementById('replyFormIsPublic').checked = Boolean(item.isPublic);
    document.getElementById('replyQuestionModal').style.display = 'flex';
}

function closeReplyQuestionModal() { document.getElementById('replyQuestionModal').style.display = 'none'; }

async function saveReply() {
    const id = Number(document.getElementById('replyFormId').value);
    const payload = { answer: document.getElementById('replyFormAnswerContent').value.trim(), isPublic: document.getElementById('replyFormIsPublic').checked, status: 'answered' };
    const response = await apiFetch(`${API_BASE}/admin/cau-hoi-nguoi-dan/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) return showAlert('Không thể lưu câu trả lời', false);
    closeReplyQuestionModal(); await loadUserQuestions(); showAlert('Đã lưu câu trả lời');
}

function deleteUserQuestion(id) {
    showConfirm('Bạn có chắc chắn muốn xóa câu hỏi này?', async () => {
        const response = await apiFetch(`${API_BASE}/admin/cau-hoi-nguoi-dan/${id}`, { method: 'DELETE' });
        if (!response.ok) return showAlert('Không thể xóa câu hỏi', false);
        await loadUserQuestions(); showAlert('Đã xóa câu hỏi');
    });
}
