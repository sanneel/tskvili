import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

new_slider = '''        <button class="slider-link active" data-filter="All">ყველა</button>
        <button class="slider-link" data-filter="Girl">გოგოსთვის</button>
        <button class="slider-link" data-filter="Boy">ბიჭისთვის</button>
        <button class="slider-link" data-filter="About">ჩვენ შესახებ</button>'''

content = re.sub(
    r'<button class="slider-link active".*?<span class="slider-indicator"',
    new_slider + '\n          <span class="slider-indicator"',
    content,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
