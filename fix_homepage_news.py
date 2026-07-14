import re

html_path = 'user/trang-chu/trang-chu.html'
js_path = 'user/trang-chu/trang-chu.js'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace column 1 (Hoạt động chỉ đạo, điều hành)
html = html.replace('<div class="news-featured">', '<div class="news-featured" id="dynamic-chidao-featured">', 1)
html = html.replace('<ul class="news-list" id="dynamic-news-list">', '<ul class="news-list" id="dynamic-chidao-list">', 1)

# Replace column 2 (CĐS - Đổi mới sáng tạo)
# We need to find the second <div class="news-featured">
html = re.sub(r'(<h2 class="section-title">CĐS - Đổi mới sáng tạo</h2>\s*</div>\s*)<div class="news-featured">',
              r'\1<div class="news-featured" id="dynamic-cds-featured">', html, count=1)
html = re.sub(r'(<div class="news-featured" id="dynamic-cds-featured">.*?</div>\s*</div>\s*)<ul class="news-list">',
              r'\1<ul class="news-list" id="dynamic-cds-list">', html, count=1, flags=re.DOTALL)

# Replace column 3 (Truyền thông & cảnh báo -> Cập nhật bão lũ)
html = html.replace('<h2 class="section-title">Truyền thông & cảnh báo</h2>', '<h2 class="section-title">Cập nhật bão lũ</h2>')
html = re.sub(r'(<h2 class="section-title">Cập nhật bão lũ</h2>\s*</div>\s*)<div class="news-featured">',
              r'\1<div class="news-featured" id="dynamic-baolu-featured">', html, count=1)
html = re.sub(r'(<div class="news-featured" id="dynamic-baolu-featured">.*?</div>\s*</div>\s*)<ul class="news-list">',
              r'\1<ul class="news-list" id="dynamic-baolu-list">', html, count=1, flags=re.DOTALL)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
