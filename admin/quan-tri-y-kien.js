// quan-tri-y-kien.js
// Logic for "Quản lý Dự thảo" and "Danh sách Góp ý" tabs

let currentDraftOpinions = [];
let currentFeedbacks = [];

document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            const target = e.currentTarget.dataset.target;
            if (target === 'draft-opinions-tab') {
                const category = e.currentTarget.dataset.category || 'TT_IOC';
                window.currentDraftTabCategory = category;
                
                if (category) {
                    const filterSelect = document.getElementById('draft-opinion-category-filter');
                    if (filterSelect) {
                        filterSelect.value = category;
                    }
                    const formSelect = document.getElementById('draft-opinion-category');
                    if (formSelect) {
                        formSelect.value = category;
                    }
                    const formTitle = document.querySelector('#draft-opinions-tab h3');
                    if (formTitle) {
                        formTitle.textContent = category === 'TT_IOC' ? 'Quản lý Dự thảo Trung tâm IOC' : `Quản lý Dự thảo ${category}`;
                    }
                    
                    // Hide category selection for UBND and KHCN
                    const filterGroup = document.getElementById('draft-opinion-filter-group');
                    const categoryGroup = document.getElementById('draft-opinion-category-group');
                    
                    if (['UBND tỉnh Đắk Lắk', 'Sở KHCN'].includes(category)) {
                        if (filterGroup) filterGroup.style.display = 'none';
                        if (categoryGroup) categoryGroup.style.display = 'none';
                    } else {
                        if (filterGroup) filterGroup.style.display = 'block';
                        if (categoryGroup) categoryGroup.style.display = 'block';
                        if (filterSelect) filterSelect.value = '';
                    }
                }
                loadDraftOpinions();
            } else if (target === 'feedbacks-tab') {
                loadFeedbacks();
                loadDraftsFilter();
            }
        });
    });

    // Form submit for draft opinion
    document.getElementById('draft-opinion-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('draft-opinion-id').value;
        const number = document.getElementById('draft-opinion-number').value.trim();
        const title = document.getElementById('draft-opinion-title').value.trim();
        const endDate = document.getElementById('draft-opinion-enddate').value;
        let category = document.getElementById('draft-opinion-category').value;
        if (window.currentDraftTabCategory === 'UBND tỉnh Đắk Lắk') category = 'UBND tỉnh Đắk Lắk';
        else if (window.currentDraftTabCategory === 'Sở KHCN') category = 'Sở KHCN';
        const fileInput = document.getElementById('draft-opinion-file');
        
        let fileUrl = null;
        let originalFileName = null;

        if (fileInput.files.length > 0) {
            try {
                const formData = new FormData();
                formData.append('file', fileInput.files[0]);
                const uploadRes = await apiFetch(`${API_BASE}/upload`, {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    fileUrl = uploadData.url;
                    originalFileName = fileInput.files[0].name;
                } else {
                    showAlert(uploadData.message || 'Lỗi tải file', 'error');
                    return;
                }
            } catch (err) {
                console.error(err);
                showAlert('Lỗi khi tải file đính kèm.', 'error');
                return;
            }
        }

        const payload = {
            documentNumber: number,
            title: title,
            endDate: endDate || null,
            category: category
        };
        
        if (fileUrl) {
            payload.fileUrl = fileUrl;
            payload.originalFileName = originalFileName;
        }

        try {
            const url = id ? `${API_BASE}/y-kien-du-thao/${id}` : `${API_BASE}/y-kien-du-thao`;
            const method = id ? 'PUT' : 'POST';

            const res = await apiFetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (data.success) {
                showAlert(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!', 'success');
                resetDraftOpinionForm();
                loadDraftOpinions();
            } else {
                showAlert(data.message || 'Lỗi hệ thống', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi khi lưu dự thảo', 'error');
        }
    });

    // Filter feedback
    document.getElementById('feedbacks-draft-filter')?.addEventListener('change', (e) => {
        const draftId = e.target.value;
        renderFeedbacks(draftId);
    });
});

async function loadDraftOpinions() {
    try {
        const res = await apiFetch(`${API_BASE}/y-kien-du-thao`);
        const data = await res.json();
        if (data.success) {
            currentDraftOpinions = data.draftOpinions;
            const tbody = document.querySelector('#draft-opinions-table tbody');
            tbody.innerHTML = '';
            
            
            const filterCategory = document.getElementById('draft-opinion-category-filter')?.value;
            let displayList = currentDraftOpinions;
            
            if (window.currentDraftTabCategory === 'UBND tỉnh Đắk Lắk') {
                displayList = currentDraftOpinions.filter(d => d.category === 'UBND tỉnh Đắk Lắk');
            } else if (window.currentDraftTabCategory === 'Sở KHCN') {
                displayList = currentDraftOpinions.filter(d => d.category === 'Sở KHCN');
            } else if (window.currentDraftTabCategory === 'TT_IOC') {
                if (filterCategory) {
                    displayList = currentDraftOpinions.filter(d => d.category === filterCategory);
                } else {
                    displayList = currentDraftOpinions.filter(d => !['UBND tỉnh Đắk Lắk', 'Sở KHCN'].includes(d.category));
                }
            } else {
                displayList = currentDraftOpinions.filter(d => !['UBND tỉnh Đắk Lắk', 'Sở KHCN'].includes(d.category));
            }

            if (displayList.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Chưa có dữ liệu</td></tr>`;
                return;
            }

            displayList.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.id}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.documentNumber || ''}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.category || 'Trung tâm IOC'}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.title || ''}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.endDate || ''}</td>
                    <td class="sys-action-cell" style="border-bottom: 1px solid #e2e8f0;">
                        <button class="sys-btn-edit" onclick="editDraftOpinion(${item.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="sys-btn-delete" onclick="deleteDraftOpinion(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function openDraftModal(id = null) {
    const modal = document.getElementById('draftOpinionModal');
    const form = document.getElementById('draft-opinion-form');
    form.reset();
    document.getElementById('draft-opinion-id').value = '';
    document.getElementById('draft-opinion-file-link').innerHTML = '';

    if (id) {
        const draft = currentDraftOpinions.find(d => d.id === id);
        if (!draft) return;
        document.getElementById('draftModalTitle').innerText = 'Sửa dự thảo';
        document.getElementById('draft-opinion-id').value = draft.id;
        document.getElementById('draft-opinion-number').value = draft.documentNumber || '';
        document.getElementById('draft-opinion-title').value = draft.title || '';
        document.getElementById('draft-opinion-enddate').value = draft.endDate ? draft.endDate.substring(0, 10) : '';
        document.getElementById('draft-opinion-category').value = draft.category || 'Báo cáo';

        const fileLink = document.getElementById('draft-opinion-file-link');
        if (draft.fileUrl) {
            fileLink.innerHTML = `<a href="${draft.fileUrl}" target="_blank">${draft.originalFileName || 'File hiện tại'}</a> (Chọn file mới để thay thế)`;
        }
    } else {
        document.getElementById('draftModalTitle').innerText = 'Thêm dự thảo mới';
    }

    modal.style.display = 'flex';
}

function closeDraftModal() {
    document.getElementById('draftOpinionModal').style.display = 'none';
}

function editDraftOpinion(id) {
    openDraftModal(id);
}

function resetDraftOpinionForm() {
    closeDraftModal();
}

function deleteDraftOpinion(id) {
    showConfirm('Bạn có chắc chắn muốn xóa dự thảo này?', async () => {
        try {
            const res = await apiFetch(`${API_BASE}/y-kien-du-thao/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showAlert('Đã xóa dự thảo', 'success');
                loadDraftOpinions();
            } else {
                showAlert(data.message || 'Lỗi khi xóa', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi hệ thống', 'error');
        }
    });
}

// FEEDBACKS
async function loadFeedbacks() {
    try {
        const res = await apiFetch(`${API_BASE}/gop-y`);
        const data = await res.json();
        if (data.success) {
            currentFeedbacks = data.feedbacks;
            renderFeedbacks();
        }
    } catch (err) {
        console.error(err);
    }
}

function renderFeedbacks(draftId = '') {
    const tbody = document.querySelector('#feedbacks-table tbody');
    tbody.innerHTML = '';
    
    let filtered = currentFeedbacks;
    if (draftId) {
        filtered = currentFeedbacks.filter(f => f.draftOpinionId == draftId);
    }
    
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center">Chưa có góp ý nào</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const draftTitle = currentDraftOpinions.find(d => d.id === item.draftOpinionId)?.title || `Dự thảo #${item.draftOpinionId}`;
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.id}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;" title="${draftTitle}">${draftTitle.length > 50 ? draftTitle.substring(0, 50) + '...' : draftTitle}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.fullName || ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.email || ''}<br>${item.phoneNumber || ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.content || ''}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</td>
            <td class="sys-action-cell" style="border-bottom: 1px solid #e2e8f0;">
                <button class="sys-btn-delete" onclick="deleteFeedback(${item.id})"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function loadDraftsFilter() {
    try {
        const res = await apiFetch(`${API_BASE}/y-kien-du-thao`);
        const data = await res.json();
        if (data.success) {
            currentDraftOpinions = data.draftOpinions;
            const filter = document.getElementById('feedbacks-draft-filter');
            // reset options
            filter.innerHTML = '<option value="">-- Tất cả dự thảo --</option>';
            data.draftOpinions.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d.id;
                opt.textContent = `[${d.documentNumber || d.id}] ${d.title}`;
                filter.appendChild(opt);
            });
        }
    } catch (err) {
        console.error(err);
    }
}

function deleteFeedback(id) {
    showConfirm('Bạn có chắc chắn muốn xóa góp ý này?', async () => {
        try {
            const res = await apiFetch(`${API_BASE}/gop-y/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showAlert('Đã xóa góp ý', 'success');
                loadFeedbacks();
            } else {
                showAlert(data.message || 'Lỗi khi xóa', 'error');
            }
        } catch (err) {
            console.error(err);
            showAlert('Lỗi hệ thống', 'error');
        }
    });
}
