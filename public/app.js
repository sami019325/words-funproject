let currentWordId = null;
let searchTimeout = null;

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const noResultsSection = document.getElementById('noResultsSection');
const sliderPanel = document.getElementById('sliderPanel');
const searchBtn = document.getElementById('searchBtn');

// --- Search Logic ---
async function performSearch() {
    const q = searchInput.value.trim();
    if (q.length < 1) {
        searchResults.classList.add('hidden');
        noResultsSection.classList.add('hidden');
        return;
    }

    try {
        const res = await fetch(`/api/words/search?q=${q}`);
        const words = await res.json();

        if (words.length > 0) {
            searchResults.innerHTML = words.map(word => `
                <div onclick="openWord('${word._id}')" class="p-6 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors flex justify-between items-center group">
                    <div>
                        <div class="text-xl font-bold group-hover:text-indigo-600 transition-colors text-left">${word.word}</div>
                        <div class="text-slate-400 text-sm italic text-left">${word.meaning}</div>
                    </div>
                    <div class="flex items-center gap-2 text-slate-400 group-hover:text-indigo-600 transition-all transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100">
                        <span class="font-bold whitespace-nowrap">Discover</span>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.293 5.293a1 1 0 011.414 0l7 7a1 1 0 010 1.414l-7 7a1 1 0 01-1.414-1.414L18.586 13H3a1 1 0 110-2h15.586l-6.293-6.293a1 1 0 010-1.414z"/></svg>
                    </div>
                </div>
            `).join('');
            searchResults.classList.remove('hidden');
            noResultsSection.classList.add('hidden');
        } else {
            searchResults.classList.add('hidden');
            noResultsSection.classList.remove('hidden');
        }
    } catch (err) {
        console.error(err);
    }
}

// Input listener with debouncing
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 300);
});

// Button click search
searchBtn.addEventListener('click', () => {
    clearTimeout(searchTimeout);
    performSearch();
});

// Enter key search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        clearTimeout(searchTimeout);
        performSearch();
    }
});

// Hide results when clicking outside
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target) && !searchBtn.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

// Show results back if input is focused and has text
searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0 && searchResults.innerHTML.trim() !== '') {
        searchResults.classList.remove('hidden');
    }
});

// --- Slider Logic ---
async function openWord(id) {
    try {
        const res = await fetch(`/api/words/${id}`);
        const word = await res.json();
        currentWordId = id;

        document.getElementById('sliderTitle').innerText = word.word;
        document.getElementById('wordAuthor').innerText = `@${word.author}`;
        document.getElementById('wordDate').innerText = `Posted on ${new Date(word.createdAt).toLocaleDateString()}`;
        document.getElementById('wordMeaning').innerText = word.meaning;
        document.getElementById('wordContent').innerText = word.content;

        renderLinks(word.content);

        // UI Adjustments
        searchResults.classList.add('hidden');
        sliderPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.error(err);
    }
}

function closeSlider() {
    sliderPanel.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentWordId = null;
}

// --- Content Extraction & Links ---
function renderLinks(text) {
    const container = document.getElementById('linksSection');
    container.innerHTML = '';

    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlPattern) || [];

    if (urls.length > 0) {
        container.innerHTML = '<h3 class="text-xl font-bold text-slate-400 uppercase tracking-widest mb-6 border-t border-slate-100 pt-12">Shared Links</h3>';
        urls.forEach(url => {
            const isSocial = /youtube|facebook|twitter|instagram|tiktok/.test(url);
            const div = document.createElement('div');
            div.className = "flex items-center justify-between p-6 glass rounded-2xl border border-slate-100 hover:border-indigo-300 transition-all cursor-pointer group";
            div.onclick = () => openLinkInSlider(url);
            div.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 ${isSocial ? 'bg-indigo-600' : 'bg-slate-200'} rounded-full flex items-center justify-center text-white shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <div>
                        <div class="font-bold text-slate-800 break-all text-left">${new URL(url).hostname}</div>
                        <div class="text-xs text-slate-400 text-left">${isSocial ? 'Social Media Content' : 'External Resource'}</div>
                    </div>
                </div>
                <div class="text-indigo-600 transition-transform group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </div>
            `;
            container.appendChild(div);
        });
    }
}

function openLinkInSlider(url) {
    const slider = document.getElementById('linkSlider');
    const container = document.getElementById('linkEmbedContainer');
    const btn = document.getElementById('linkTargetBtn');

    container.innerHTML = '';
    btn.href = url;

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let vid = '';
        if (url.includes('v=')) vid = url.split('v=')[1].split('&')[0];
        else vid = url.split('/').pop();

        container.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${vid}" frameborder="0" allowfullscreen></iframe>`;
    } else {
        container.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center bg-slate-950">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-20 w-20 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <p class="text-xl font-bold text-white">External Link</p>
            <p class="text-sm">This content cannot be embedded. Use the button below to visit.</p>
        </div>`;
    }

    slider.classList.remove('hidden');
}

function closeLinkSlider() {
    document.getElementById('linkSlider').classList.add('hidden');
    document.getElementById('linkEmbedContainer').innerHTML = '';
}
