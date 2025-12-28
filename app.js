let scriptures = [];
let history = [];
let pos = -1;
let config = { bg: "#1a1a2e", text: "#eeeeee", font: "Georgia", size: 18 };

// Initialize App
async function init() {
    console.log("Initializing App...");
    const verseText = document.getElementById('verse-text');
    
    // Show a loading message so you know the script is alive
    if (verseText) verseText.textContent = "Loading scriptures...";

    try {
        // Use ./ to ensure it looks in the same folder on GitHub
        const resp = await fetch('./scriptures.csv');
        
        if (!resp.ok) {
            throw new Error(`HTTP error! status: ${resp.status}`);
        }

        const csv = await resp.text();
        
        Papa.parse(csv, {
            header: true,
            skipEmptyLines: true, // Prevents errors if there is a blank line at the end
            complete: (res) => {
                scriptures = res.data;
                if (scriptures.length > 0) {
                    nextScripture();
                } else {
                    if (verseText) verseText.textContent = "CSV is empty!";
                }
            }
        });
    } catch (e) { 
        console.error("CSV load failed:", e); 
        if (verseText) verseText.textContent = "Failed to load CSV. Check file name.";
    }
}

function updateUI() {
    document.body.style.backgroundColor = config.bg;
    const textEl = document.getElementById('verse-text');
    const locEl = document.getElementById('verse-location');
    const menuBtn = document.getElementById('menu-button');

    textEl.style.color = config.text;
    textEl.style.fontSize = `${config.size * 1.3}px`;
    textEl.style.fontFamily = config.font;

    locEl.style.color = config.text;
    locEl.style.fontSize = `${config.size}px`;
    
    menuBtn.style.color = config.text;
    document.getElementById('font-size-display').textContent = config.size;
}

function nextScripture() {
    if (pos < history.length - 1) {
        pos++;
        render(scriptures[history[pos]]);
    } else {
        const idx = Math.floor(Math.random() * scriptures.length);
        history.push(idx);
        pos = history.length - 1;
        render(scriptures[idx]);
    }
}

function prevScripture() {
    if (pos > 0) {
        pos--;
        render(scriptures[history[pos]]);
    }
}

function render(item) {
    const container = document.querySelector('.scripture-container');
    container.classList.add('swiping');
    setTimeout(() => {
        document.getElementById('verse-text').textContent = `"${item.text}"`;
        document.getElementById('verse-location').textContent = `${item.book} ${item.chapter}:${item.verse}`;
        container.classList.remove('swiping');
        updateUI();
    }, 300);
}

// Swipe Support
let startY = 0;
document.addEventListener('touchstart', e => startY = e.touches[0].clientY);
document.addEventListener('touchend', e => {
    const deltaY = startY - e.changedTouches[0].clientY;
    if (deltaY > 50) nextScripture();
    else if (deltaY < -50) prevScripture();
});

// Menu Logic
const menu = document.getElementById('theme-menu');
document.getElementById('menu-button').onclick = () => menu.classList.toggle('hidden');

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.onclick = () => {
        config.bg = btn.dataset.bg;
        config.text = btn.dataset.text;
        updateUI();
        menu.classList.add('hidden');
    }
});

document.getElementById('increase-font').onclick = () => { config.size += 2; updateUI(); };
document.getElementById('decrease-font').onclick = () => { config.size = Math.max(12, config.size - 2); updateUI(); };

init();
