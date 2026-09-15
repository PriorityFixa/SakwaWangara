/**
 * events.js
 * Loads data/events.json and renders:
 *   1. Cover photos -> into <div id="event-gallery" class="event-photo-grid">
 *      (click a cover photo to open a lightbox with that event's full set)
 *   2. Engagement cards -> into <div id="event-list" class="engagement-grid">
 *
 * To add a new event with its 6 photos: add one object to events.json
 * with an "images" array of 6 paths, and drop the files in images/events/.
 * No HTML editing needed.
 */

let EVENTS = [];
let lightboxIndex = 0;
let lightboxEventId = null;

async function loadEvents() {
    const res = await fetch('data/events.json');
    if (!res.ok) throw new Error('Could not load events.json');
    return res.json();
}

function formatDate(isoDate) {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

/* ---------- Gallery (cover photos) ---------- */

function renderGallery(events, container) {
    container.innerHTML = '';

    events.forEach((ev, i) => {
        const num = String(i + 1).padStart(2, '0');

        const fig = document.createElement('button');
        fig.type = 'button';
        fig.className = 'gallery-photo gallery-photo-button';
        fig.setAttribute('aria-label', `View photos from ${ev.type} with ${ev.client}`);

        fig.innerHTML = `
            <img src="${ev.images[0]}" alt="${ev.type} with ${ev.client}" loading="lazy">
            <div class="photo-label">
                <span>${num}</span>
                <strong>${ev.label}</strong>
            </div>
        `;

        fig.addEventListener('click', () => openLightbox(ev.id, 0));
        container.appendChild(fig);
    });
}

/* ---------- Engagement cards ---------- */

function renderEngagements(events, container) {
    container.innerHTML = '';

    const sorted = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(ev => {
        const card = document.createElement('article');
        card.className = 'engagement-card';

        card.innerHTML = `
            <span class="engagement-meta">${formatDate(ev.date)} · ${ev.location}${ev.participants ? ' · ' + ev.participants : ''}</span>
            <h3>${ev.type}<br>${ev.client}</h3>
            <p>${ev.blurb}</p>
            ${ev.outcome ? `<p class="engagement-outcome"><strong>Outcome:</strong> ${ev.outcome}</p>` : ''}
            ${ev.quote ? `<p class="engagement-quote">"${ev.quote}"</p>` : ''}
            <button type="button" class="engagement-photos-link" data-event-id="${ev.id}">
                View photos (${ev.images.length}) →
            </button>
        `;

        card.querySelector('.engagement-photos-link')
            .addEventListener('click', () => openLightbox(ev.id, 0));

        container.appendChild(card);
    });
}

/* ---------- Lightbox ---------- */

function buildLightboxDom() {
    if (document.getElementById('event-lightbox')) return;

    const overlay = document.createElement('div');
    overlay.id = 'event-lightbox';
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML = `
        <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
        <button type="button" class="lightbox-prev" aria-label="Previous photo">&#8249;</button>
        <img class="lightbox-image" src="" alt="">
        <button type="button" class="lightbox-next" aria-label="Next photo">&#8250;</button>
        <div class="lightbox-caption"></div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));
    overlay.addEventListener('click', e => {
        if (e.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') stepLightbox(-1);
        if (e.key === 'ArrowRight') stepLightbox(1);
    });
}

function openLightbox(eventId, index) {
    lightboxEventId = eventId;
    lightboxIndex = index;
    const overlay = document.getElementById('event-lightbox');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateLightboxImage();
}

function closeLightbox() {
    const overlay = document.getElementById('event-lightbox');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function stepLightbox(delta) {
    const ev = EVENTS.find(e => e.id === lightboxEventId);
    if (!ev) return;
    const total = ev.images.length;
    lightboxIndex = (lightboxIndex + delta + total) % total;
    updateLightboxImage();
}

function updateLightboxImage() {
    const ev = EVENTS.find(e => e.id === lightboxEventId);
    if (!ev) return;
    const overlay = document.getElementById('event-lightbox');
    const img = overlay.querySelector('.lightbox-image');
    const caption = overlay.querySelector('.lightbox-caption');

    img.src = ev.images[lightboxIndex];
    img.alt = `${ev.type} with ${ev.client}`;
    caption.textContent = `${ev.client} — ${ev.type} · Photo ${lightboxIndex + 1} of ${ev.images.length}`;
}

/* ---------- Init ---------- */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        EVENTS = await loadEvents();
        buildLightboxDom();

        const galleryEl = document.getElementById('event-gallery');
        if (galleryEl) renderGallery(EVENTS, galleryEl);

        const listEl = document.getElementById('event-list');
        if (listEl) renderEngagements(EVENTS, listEl);
    } catch (err) {
        console.error(err);
    }
});
