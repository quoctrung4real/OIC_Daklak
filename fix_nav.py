import os
import re

directory = '.'
html_files = [f for f in os.listdir(directory) if f.endswith('.html')]

target_menu_pattern = r'(<a href="#">Tin tức <i class="fa-solid fa-angle-down"></i></a>\s*<ul class="dropdown">\s*<li><a href="cap-nhat-bao-lu\.html">Cập nhật bão lũ</a></li>\s*)<li><a href="#">CĐS - Đổi mới sáng tạo</a></li>(\s*)<li><a href="#">Chỉ đạo điều hành</a></li>(\s*)<li><a href="#">Công tác xây dựng Đảng</a></li>(\s*)<li><a href="#">Giải pháp An toàn mạng</a></li>(\s*)<li><a href="#">Giải pháp An toàn thông tin</a></li>(\s*)<li><a href="#">Thông báo</a></li>(\s*)<li><a href="#">Tiêu chuẩn - Chất lượng</a></li>(\s*)<li><a href="#">Tin hoạt động</a></li>(\s*)<li><a href="#">Trao đổi kinh nghiệm</a></li>(\s*)<li><a href="#">Tương tác công dân</a></li>'

replacement = r'\1<li><a href="cds-doi-moi-sang-tao.html">CĐS - Đổi mới sáng tạo</a></li>\2<li><a href="chi-dao-dieu-hanh.html">Chỉ đạo điều hành</a></li>\3<li><a href="cong-tac-xay-dung-dang.html">Công tác xây dựng Đảng</a></li>\4<li><a href="giai-phap-an-toan-mang.html">Giải pháp An toàn mạng</a></li>\5<li><a href="giai-phap-an-toan-thong-tin.html">Giải pháp An toàn thông tin</a></li>\6<li><a href="thong-bao.html">Thông báo</a></li>\7<li><a href="tieu-chuan-chat-luong.html">Tiêu chuẩn - Chất lượng</a></li>\8<li><a href="tin-hoat-dong.html">Tin hoạt động</a></li>\9<li><a href="trao-doi-kinh-nghiem.html">Trao đổi kinh nghiệm</a></li>\10<li><a href="tuong-tac-cong-dan.html">Tương tác công dân</a></li>'

for file in html_files:
    if file == 'quan-tri.html':
        continue # quan-tri.html has a different sidebar

    filepath = os.path.join(directory, file)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(target_menu_pattern, replacement, content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated nav in {file}")
