// Quản lý Hỏi đáp (FAQ và Câu hỏi người dân)

// Dữ liệu mẫu ban đầu nếu localStorage trống
const defaultFaqs = [
    { id: '1', question: 'Làm thế nào để đăng ký tài khoản?', answer: 'Bạn có thể nhấn vào nút Đăng ký ở góc trên bên phải màn hình.', order: 1 },
    { id: '2', question: 'Cổng thông tin này cung cấp những gì?', answer: 'Cung cấp các thông tin chỉ đạo, điều hành, văn bản pháp quy của tỉnh.', order: 2 }
];

const defaultUserQuestions = [
    { 
        id: '1', 
        topic: 'Gửi câu hỏi',
        title: 'Hỏi về thủ tục xây dựng',
        senderName: 'Nguyễn Văn A', 
        senderEmail: 'nguyenvana@gmail.com', 
        senderPhone: '0901234567',
        address: '123 Lê Lợi, TP Buôn Ma Thuột',
        content: 'Tôi muốn hỏi thủ tục cấp phép xây dựng nhà ở nội thành?',
        createdAt: new Date().toISOString(),
        status: 'pending', // pending, answered
        answer: '',
        isPublic: false
    }
];

// Lấy dữ liệu
function getFaqs() {
    const data = localStorage.getItem('portal_faqs');
    return data ? JSON.parse(data) : defaultFaqs;
}

function saveFaqs(faqs) {
    localStorage.setItem('portal_faqs', JSON.stringify(faqs));
}

function getUserQuestions() {
    const data = localStorage.getItem('portal_user_questions');
    return data ? JSON.parse(data) : defaultUserQuestions;
}

function saveUserQuestions(questions) {
    localStorage.setItem('portal_user_questions', JSON.stringify(questions));
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo dữ liệu nếu chưa có
    if (!localStorage.getItem('portal_faqs')) saveFaqs(defaultFaqs);
    if (!localStorage.getItem('portal_user_questions')) saveUserQuestions(defaultUserQuestions);

    loadFaqs();
    loadUserQuestions();

    // Event listener form FAQ
    const faqForm = document.getElementById('faqForm');
    if (faqForm) {
        faqForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveFaq();
        });
    }

    // Event listener form Trả lời
    const replyForm = document.getElementById('replyQuestionForm');
    if (replyForm) {
        replyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveReply();
        });
    }
});

// --- PHẦN FAQ ---

function loadFaqs() {
    const tbody = document.getElementById('faqTableBody');
    if (!tbody) return;

    const faqs = getFaqs().sort((a, b) => a.order - b.order);
    tbody.innerHTML = '';

    if (faqs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Chưa có dữ liệu</td></tr>';
        return;
    }

    faqs.forEach(faq => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        tr.innerHTML = `
            <td style="padding: 12px;">${faq.id}</td>
            <td style="padding: 12px; font-weight: 500;">${faq.question}</td>
            <td style="padding: 12px;">${faq.order}</td>
            <td class="sys-action-cell">
                <button class="sys-btn-edit" onclick="editFaq('${faq.id}')" title="Sửa"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="sys-btn-delete" onclick="deleteFaq('${faq.id}')" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openFaqModal() {
    document.getElementById('faqForm').reset();
    document.getElementById('faqFormId').value = '';
    document.getElementById('faqModalTitle').textContent = 'Thêm FAQ Mới';
    document.getElementById('faqModal').style.display = 'flex';
}

function closeFaqModal() {
    document.getElementById('faqModal').style.display = 'none';
}

function editFaq(id) {
    const faqs = getFaqs();
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;

    document.getElementById('faqFormId').value = faq.id;
    document.getElementById('faqFormQuestion').value = faq.question;
    document.getElementById('faqFormAnswer').value = faq.answer;
    document.getElementById('faqFormOrder').value = faq.order;
    
    document.getElementById('faqModalTitle').textContent = 'Cập nhật FAQ';
    document.getElementById('faqModal').style.display = 'flex';
}

function saveFaq() {
    const faqs = getFaqs();
    const id = document.getElementById('faqFormId').value;
    const question = document.getElementById('faqFormQuestion').value;
    const answer = document.getElementById('faqFormAnswer').value;
    const order = parseInt(document.getElementById('faqFormOrder').value) || 1;

    if (id) {
        // Cập nhật
        const index = faqs.findIndex(f => f.id === id);
        if (index !== -1) {
            faqs[index] = { ...faqs[index], question, answer, order };
            if (typeof showAlert === 'function') showAlert('Cập nhật FAQ thành công');
        }
    } else {
        // Thêm mới
        const newId = Date.now().toString();
        faqs.push({ id: newId, question, answer, order });
        if (typeof showAlert === 'function') showAlert('Thêm FAQ thành công');
    }

    saveFaqs(faqs);
    loadFaqs();
    closeFaqModal();
}

function deleteFaq(id) {
    if (typeof showConfirm === 'function') {
        showConfirm('Bạn có chắc chắn muốn xóa câu hỏi thường gặp này?', () => {
            let faqs = getFaqs();
            faqs = faqs.filter(f => f.id !== id);
            saveFaqs(faqs);
            loadFaqs();
            showAlert('Đã xóa FAQ');
        });
    } else if (confirm('Bạn có chắc chắn muốn xóa câu hỏi thường gặp này?')) {
        let faqs = getFaqs();
        faqs = faqs.filter(f => f.id !== id);
        saveFaqs(faqs);
        loadFaqs();
        if (typeof showAlert === 'function') showAlert('Đã xóa FAQ');
    }
}

// --- PHẦN CÂU HỎI NGƯỜI DÂN ---

function loadUserQuestions() {
    const tbody = document.getElementById('userQuestionsTableBody');
    if (!tbody) return;

    const questions = getUserQuestions().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    tbody.innerHTML = '';

    if (questions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">Chưa có câu hỏi nào</td></tr>';
        return;
    }

    questions.forEach(q => {
        const dateStr = new Date(q.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const isAnswered = q.status === 'answered';
        
        const statusHtml = isAnswered 
            ? '<span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Đã trả lời</span>'
            : '<span style="background: #fef9c3; color: #854d0e; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500;">Chờ trả lời</span>';

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e2e8f0';
        tr.innerHTML = `
            <td style="padding: 12px;">
                <div style="font-weight: 500; color: #1e293b;">${q.senderName}</div>
                <div style="font-size: 12px; color: #64748b;">${q.senderPhone || ''}</div>
            </td>
            <td style="padding: 12px;">
                <div style="font-weight: 600; color: var(--primary); margin-bottom: 5px; font-size: 14px;">
                    <span style="background: #e2e8f0; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 5px; font-weight: normal;">${q.topic || 'Khác'}</span> 
                    ${q.title || 'Không có tiêu đề'}
                </div>
                <div id="q-content-${q.id}" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px; color: #334155;">
                    ${q.content}
                </div>
                ${q.content && q.content.length > 100 ? `<button id="btn-toggle-${q.id}" onclick="toggleQuestionContent('${q.id}')" style="background:none; border:none; color:var(--primary); font-size:12px; cursor:pointer; padding: 4px 0 0 0; text-decoration: underline;">Xem chi tiết</button>` : ''}
            </td>
            <td style="padding: 12px; font-size: 13px; color: #64748b;">${dateStr}</td>
            <td style="padding: 12px; text-align: center;">${statusHtml}</td>
            <td class="sys-action-cell">
                <button onclick="openReplyModal('${q.id}')" style="background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; margin-right: 5px;" title="${isAnswered ? 'Xem' : 'Trả lời'}">
                    <i class="fa-solid ${isAnswered ? 'fa-eye' : 'fa-reply'}"></i> ${isAnswered ? 'Xem' : 'Trả lời'}
                </button>
                <button class="sys-btn-delete" onclick="deleteUserQuestion('${q.id}')" title="Xóa"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function toggleQuestionContent(id) {
    const contentDiv = document.getElementById(`q-content-${id}`);
    const btn = document.getElementById(`btn-toggle-${id}`);
    if (!contentDiv || !btn) return;
    
    if (contentDiv.style.webkitLineClamp === '2') {
        contentDiv.style.webkitLineClamp = 'unset';
        btn.innerText = 'Thu gọn';
    } else {
        contentDiv.style.webkitLineClamp = '2';
        btn.innerText = 'Xem chi tiết';
    }
}

function openReplyModal(id) {
    const questions = getUserQuestions();
    const q = questions.find(x => x.id === id);
    if (!q) return;

    document.getElementById('replyFormId').value = q.id;
    document.getElementById('replyFormTopic').textContent = q.topic || 'Không xác định';
    document.getElementById('replyFormTitle').textContent = q.title || 'Không có tiêu đề';
    document.getElementById('replyFormSenderName').textContent = q.senderName || 'Ẩn danh';
    document.getElementById('replyFormSenderAddress').textContent = q.address || 'Không có địa chỉ';
    document.getElementById('replyFormQuestionContent').textContent = q.content;
    document.getElementById('replyFormSenderEmail').textContent = q.senderEmail || 'Không có Email';
    document.getElementById('replyFormSenderPhone').textContent = q.senderPhone || 'Không có SĐT';
    document.getElementById('replyFormDate').textContent = new Date(q.createdAt).toLocaleString('vi-VN');
    
    document.getElementById('replyFormAnswerContent').value = q.answer || '';
    document.getElementById('replyFormIsPublic').checked = q.isPublic || false;

    document.getElementById('replyQuestionModal').style.display = 'flex';
}

function closeReplyQuestionModal() {
    document.getElementById('replyQuestionModal').style.display = 'none';
}

function saveReply() {
    const questions = getUserQuestions();
    const id = document.getElementById('replyFormId').value;
    const answer = document.getElementById('replyFormAnswerContent').value;
    const isPublic = document.getElementById('replyFormIsPublic').checked;

    const index = questions.findIndex(q => q.id === id);
    if (index !== -1) {
        questions[index].answer = answer;
        questions[index].isPublic = isPublic;
        questions[index].status = 'answered'; // Cập nhật trạng thái
        
        saveUserQuestions(questions);
        loadUserQuestions();
        closeReplyQuestionModal();
        if (typeof showAlert === 'function') showAlert('Đã lưu câu trả lời thành công');
    }
}

function deleteUserQuestion(id) {
    if (typeof showConfirm === 'function') {
        showConfirm('Bạn có chắc chắn muốn xóa câu hỏi này?', () => {
            let questions = getUserQuestions();
            questions = questions.filter(q => q.id !== id);
            saveUserQuestions(questions);
            loadUserQuestions();
            showAlert('Đã xóa câu hỏi');
        });
    } else if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
        let questions = getUserQuestions();
        questions = questions.filter(q => q.id !== id);
        saveUserQuestions(questions);
        loadUserQuestions();
        if (typeof showAlert === 'function') showAlert('Đã xóa câu hỏi');
    }
}
