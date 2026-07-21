import sys

file_path = "user/trang-chu/trang-chu.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

with open("/Users/trungngo/.gemini/antigravity-ide/brain/75c39a0f-945f-4440-928b-5f1bd7dc880d/scratch/renderMultimedia.js", "r", encoding="utf-8") as f:
    render_code = f.read()

content += "\n\n" + render_code + "\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS")
