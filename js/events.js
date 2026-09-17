/**
 * ============================================================
 * SAKWA WANGARA — EVENTS
 * ============================================================
 *
 * Loads:
 *   data/events.json
 *
 * Renders:
 *   1. Training in Action gallery -> #event-gallery
 *      (only events that have at least one photo)
 *
 *   2. Recent Engagements -> #event-list
 *      (all events; shows a cover photo when available,
 *      a "view all" link when there's more than one photo,
 *      and a quiet placeholder when there are none yet)
 *
 * Also provides a photo lightbox with prev/next + keyboard
 * navigation (arrows hide automatically for single-photo
 * events), and visible error messages if events.json fails.
 * ============================================================
 */

let EVENTS = [];
let lightboxIndex = 0;
let lightboxEventId = null;


/* ============================================================
   LOAD EVENTS
============================================================ */

async function loadEvents() {
    const response = await fetch('data/events.json', { cache: 'no-cache' });

    if (!response.ok) {
        throw new Error(`Could not load data/events.json (${response.status})`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('events.json must contain an array of events.');
    }

    return data;
}


/* ============================================================
   HELPERS
============================================================ */

function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return date.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function escapeHTML(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getImages(event) {
    if (!Array.isArray(event.images)) return [];
    return event.images.filter(image => typeof image === 'string' && image.trim() !== '');
}


/* ============================================================
   GALLERY — TRAINING IN ACTION
   (only events that actually have photos)
============================================================ */

function renderGallery(events, container) {
    container.innerHTML = '';

    const photoEvents = events.filter(event => getImages(event).length > 0);

    if (photoEvents.length === 0) {
        container.innerHTML = `<div class="events-empty">Training photos will appear here soon.</div>`;
        return;
    }

    photoEvents.forEach((event, index) => {
        const images = getImages(event);
        const number = String(index + 1).padStart(2, '0');

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'gallery-photo gallery-photo-button';
        button.setAttribute('aria-label', `View photos from ${event.type} with ${event.client}`);

        button.innerHTML = `
            <img src="${escapeHTML(images[0])}" alt="${escapeHTML(event.type)} with ${escapeHTML(event.client)}" loading="lazy">
            <div class="photo-label">
                <span>${number}</span>
                <strong>${escapeHTML(event.label || event.type)}</strong>
            </div>
        `;

        button.addEventListener('click', () => openLightbox(event.id, 0));
        container.appendChild(button);
    });
}


/* ============================================================
   RECENT ENGAGEMENTS
   (all events — cover photo when available, placeholder
   when not, "view all" link only when there's more than one)
============================================================ */

function renderEngagements(events, container) {
    container.innerHTML = '';

    const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedEvents.length === 0) {
        container.innerHTML = `<div class="events-empty">No recent engagements have been added yet.</div>`;
        return;
    }

    sortedEvents.forEach(event => {
        const card = document.createElement('article');
        card.className = 'engagement-card';

        const images = getImages(event);

        const participants = event.participants ? ` · ${escapeHTML(event.participants)}` : '';
        const blurb = event.blurb ? `<p>${escapeHTML(event.blurb)}</p>` : '';
        const outcome = event.outcome
            ? `<p class="engagement-outcome"><strong>Outcome:</strong> ${escapeHTML(event.outcome)}</p>`
            : '';
        const quote = event.quote
            ? `<p class="engagement-quote">"${escapeHTML(event.quote)}"</p>`
            : '';

        const cover = images.length > 0
            ? `
                <button type="button" class="engagement-cover" aria-label="View photos from ${escapeHTML(event.type)} with ${escapeHTML(event.client)}">
                    <img src="${escapeHTML(images[0])}" alt="${escapeHTML(event.type)} with ${escapeHTML(event.client)}" loading="lazy">
                </button>
              `
            : `<div class="engagement-cover engagement-cover-empty">Photos coming soon</div>`;

        const viewAllLink = images.length > 1
            ? `
                <button type="button" class="engagement-photos-link" data-event-id="${escapeHTML(event.id)}">
                    View all ${images.length} photos →
                </button>
              `
            : '';

        card.innerHTML = `
            ${cover}
            <div class="engagement-body">
                <span class="engagement-meta">
                    ${escapeHTML(formatDate(event.date))} · ${escapeHTML(event.location || '')}${participants}
                </span>
                <h3>${escapeHTML(event.type || 'Training Engagement')}<br>${escapeHTML(event.client || '')}</h3>
                ${blurb}
                ${outcome}
                ${quote}
                ${viewAllLink}
            </div>
        `;

        const coverButton = card.querySelector('.engagement-cover:not(.engagement-cover-empty)');
        if (coverButton) {
            coverButton.addEventListener('click', () => openLightbox(event.id, 0));
        }

        const photoLink = card.querySelector('.engagement-photos-link');
        if (photoLink) {
            photoLink.addEventListener('click', () => openLightbox(event.id, 0));
        }

        container.appendChild(card);
    });
}


/* ============================================================
   LIGHTBOX
============================================================ */

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

    overlay.addEventListener('click', event => {
        if (event.target === overlay) closeLightbox();
    });

    document.addEventListener('keydown', event => {
        if (!overlay.classList.contains('open')) return;
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowLeft') stepLightbox(-1);
        if (event.key === 'ArrowRight') stepLightbox(1);
    });
}

function openLightbox(eventId, index = 0) {
    const event = EVENTS.find(item => item.id === eventId);
    if (!event) {
        console.error('Lightbox event not found:', eventId);
        return;
    }

    const images = getImages(event);
    if (images.length === 0) {
        console.warn('This engagement has no photos:', event.client);
        return;
    }

    lightboxEventId = eventId;
    lightboxIndex = index;

    const overlay = document.getElementById('event-lightbox');
    if (!overlay) return;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    updateLightboxImage();
}

function closeLightbox() {
    const overlay = document.getElementById('event-lightbox');
    if (!overlay) return;

    overlay.classList.remove('open');
    document.body.style.overflow = '';
}

function stepLightbox(delta) {
    const event = EVENTS.find(item => item.id === lightboxEventId);
    if (!event) return;

    const images = getImages(event);
    if (images.length === 0) return;

    lightboxIndex = (lightboxIndex + delta + images.length) % images.length;
    updateLightboxImage();
}

function updateLightboxImage() {
    const event = EVENTS.find(item => item.id === lightboxEventId);
    if (!event) return;

    const images = getImages(event);
    if (images.length === 0) return;

    const overlay = document.getElementById('event-lightbox');
    if (!overlay) return;

    const image = overlay.querySelector('.lightbox-image');
    const caption = overlay.querySelector('.lightbox-caption');
    const prevBtn = overlay.querySelector('.lightbox-prev');
    const nextBtn = overlay.querySelector('.lightbox-next');

    image.src = images[lightboxIndex];
    image.alt = `${event.type} with ${event.client}`;
    caption.textContent = `${event.client} — ${event.type} · Photo ${lightboxIndex + 1} of ${images.length}`;

    // Hide prev/next entirely when there's only one photo to show
    const multiplePhotos = images.length > 1;
    prevBtn.style.display = multiplePhotos ? '' : 'none';
    nextBtn.style.display = multiplePhotos ? '' : 'none';
}


/* ============================================================
   ERROR DISPLAY
============================================================ */

function showEventsError(message) {
    const gallery = document.getElementById('event-gallery');
    const list = document.getElementById('event-list');

    const errorHTML = `
        <div class="events-error">
            <strong>Events could not be loaded.</strong>
            <p>${escapeHTML(message)}</p>
        </div>
    `;

    if (gallery) gallery.innerHTML = errorHTML;
    if (list) list.innerHTML = errorHTML;
}


/* ============================================================
   INITIALISE
============================================================ */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        EVENTS = await loadEvents();
        buildLightboxDom();

        const gallery = document.getElementById('event-gallery');
        if (gallery) {
            try {
                renderGallery(EVENTS, gallery);
            } catch (error) {
                console.error('Gallery rendering error:', error);
            }
        }

        const engagementList = document.getElementById('event-list');
        if (engagementList) {
            try {
                renderEngagements(EVENTS, engagementList);
            } catch (error) {
                console.error('Engagement rendering error:', error);
                engagementList.innerHTML = `
                    <div class="events-error">
                        <strong>Recent engagements could not be displayed.</strong>
                        <p>Please check the browser console for details.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Events loading error:', error);
        showEventsError(error.message);
    }
});
