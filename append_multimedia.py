import sys

file_path = "admin/quan-tri-v3.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

with open("/Users/trungngo/.gemini/antigravity-ide/brain/75c39a0f-945f-4440-928b-5f1bd7dc880d/scratch/multimediaApp.js", "r", encoding="utf-8") as f:
    multimedia_code = f.read()

target = "    }\n};\n\n"
if target in content:
    content = content.replace(target, target + "\n" + multimedia_code + "\n\ndocument.addEventListener('DOMContentLoaded', () => {\n    multimediaApp.init();\n});\n\n", 1)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS")
else:
    print("TARGET NOT FOUND.")
