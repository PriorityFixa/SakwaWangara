/**
 * events.js
 * Loads /data/events.json and renders:
 *   1. Training photos -> into <div id="event-gallery" class="event-photo-grid">
 *   2. Engagement cards -> into <div id="event-list" class="engagement-grid">
 *
 * Add a new event: add one object to events.json and drop the photo into
 * images/events/. No HTML editing needed.
 */

async function loadEvents() {
    const res = await fetch('data/events.json');
    if (!res.ok) throw new Error('Could not load events.json');
    return res.json();
}

function formatDate(isoDate) {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function renderGallery(events, container) {
    container.innerHTML = '';

    events.forEach((ev, i) => {
        const num = String(i + 1).padStart(2, '0');

        const fig = document.createElement('div');
        fig.className = 'gallery-photo';

        fig.innerHTML = `
            <img src="${ev.image}" alt="${ev.type} with ${ev.client}" loading="lazy">
            <div class="photo-label">
                <span>${num}</span>
                <strong>${ev.label}</strong>
            </div>
        `;

        container.appendChild(fig);
    });
}

function renderEngagements(events, container) {
    container.innerHTML = '';

    const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(ev => {
        const card = document.createElement('article');
        card.className = 'engagement-card';

        card.innerHTML = `
            <span class="engagement-meta">${formatDate(ev.date)} · ${ev.location}</span>
            <h3>${ev.type}<br>${ev.client}</h3>
            <p>${ev.blurb}</p>
            ${ev.quote ? `<p class="engagement-quote">"${ev.quote}"</p>` : ''}
        `;

        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const events = await loadEvents();

        const galleryEl = document.getElementById('event-gallery');
        if (galleryEl) renderGallery(events, galleryEl);

        const listEl = document.getElementById('event-list');
        if (listEl) renderEngagements(events, listEl);
    } catch (err) {
        console.error(err);
    }
});
