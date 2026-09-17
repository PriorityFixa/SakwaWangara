```javascript
/**
 * ============================================================
 * SAKWA WANGARA — EVENTS
 * ============================================================
 *
 * Loads:
 *   data/events.json
 *
 * Renders:
 *   1. Training in Action gallery
 *      -> #event-gallery
 *
 *   2. Recent Engagements
 *      -> #event-list
 *
 * Also provides:
 *   - Photo lightbox
 *   - Previous / next navigation
 *   - Keyboard navigation
 *   - Graceful handling of events without photos
 *   - Visible error messages when events.json fails
 * ============================================================
 */

let EVENTS = [];
let lightboxIndex = 0;
let lightboxEventId = null;


/* ============================================================
   LOAD EVENTS
============================================================ */

async function loadEvents() {

    const response = await fetch('data/events.json', {
        cache: 'no-cache'
    });

    if (!response.ok) {
        throw new Error(
            `Could not load data/events.json (${response.status})`
        );
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('events.json must contain an array of events.');
    }

    return data;
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(isoDate) {

    if (!isoDate) return '';

    const date = new Date(isoDate);

    if (Number.isNaN(date.getTime())) {
        return isoDate;
    }

    return date.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric'
    });
}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return '';
    }

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* ============================================================
   GET VALID IMAGES
============================================================ */

function getImages(event) {

    if (!Array.isArray(event.images)) {
        return [];
    }

    return event.images.filter(
        image => typeof image === 'string' && image.trim() !== ''
    );
}


/* ============================================================
   GALLERY
   TRAINING IN ACTION
============================================================ */

function renderGallery(events, container) {

    container.innerHTML = '';

    /*
     * Only show events that actually have photos
     */
    const photoEvents = events.filter(
        event => getImages(event).length > 0
    );

    if (photoEvents.length === 0) {

        container.innerHTML = `
            <div class="events-empty">
                Training photos will appear here soon.
            </div>
        `;

        return;
    }


    photoEvents.forEach((event, index) => {

        const images = getImages(event);

        const number = String(index + 1).padStart(2, '0');

        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'gallery-photo gallery-photo-button';

        button.setAttribute(
            'aria-label',
            `View photos from ${event.type} with ${event.client}`
        );


        button.innerHTML = `
            <img
                src="${escapeHTML(images[0])}"
                alt="${escapeHTML(event.type)} with ${escapeHTML(event.client)}"
                loading="lazy"
            >

            <div class="photo-label">
                <span>${number}</span>
                <strong>${escapeHTML(event.label || event.type)}</strong>
            </div>
        `;


        button.addEventListener('click', () => {

            openLightbox(event.id, 0);

        });


        container.appendChild(button);

    });
}


/* ============================================================
   RECENT ENGAGEMENTS
============================================================ */

function renderEngagements(events, container) {

    container.innerHTML = '';

    /*
     * Sort newest first
     */
    const sortedEvents = [...events].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );


    if (sortedEvents.length === 0) {

        container.innerHTML = `
            <div class="events-empty">
                No recent engagements have been added yet.
            </div>
        `;

        return;
    }


    sortedEvents.forEach(event => {

        const card = document.createElement('article');

        card.className = 'engagement-card';


        const images = getImages(event);


        /*
         * Build optional content
         */

        const participants = event.participants
            ? ` · ${escapeHTML(event.participants)}`
            : '';


        const blurb = event.blurb
            ? `<p>${escapeHTML(event.blurb)}</p>`
            : '';


        const outcome = event.outcome
            ? `
                <p class="engagement-outcome">
                    <strong>Outcome:</strong>
                    ${escapeHTML(event.outcome)}
                </p>
              `
            : '';


        const quote = event.quote
            ? `
                <p class="engagement-quote">
                    "${escapeHTML(event.quote)}"
                </p>
              `
            : '';


        /*
         * If there are photos, show photo button.
         * If there are no photos, don't create a broken
         * lightbox button.
         */

        const photoButton = images.length > 0
            ? `
                <button
                    type="button"
                    class="engagement-photos-link"
                    data-event-id="${escapeHTML(event.id)}"
                >
                    View photos (${images.length}) →
                </button>
              `
            : `
                <span class="engagement-no-photos">
                    Photos coming soon
                </span>
              `;


        /*
         * Create card
         */

        card.innerHTML = `

            <span class="engagement-meta">
                ${escapeHTML(formatDate(event.date))}
                ·
                ${escapeHTML(event.location || '')}
                ${participants}
            </span>

            <h3>
                ${escapeHTML(event.type || 'Training Engagement')}
                <br>
                ${escapeHTML(event.client || '')}
            </h3>

            ${blurb}

            ${outcome}

            ${quote}

            ${photoButton}

        `;


        /*
         * Connect lightbox button
         */

        const photoLink = card.querySelector(
            '.engagement-photos-link'
        );


        if (photoLink) {

            photoLink.addEventListener('click', () => {

                openLightbox(event.id, 0);

            });

        }


        container.appendChild(card);

    });
}


/* ============================================================
   LIGHTBOX DOM
============================================================ */

function buildLightboxDom() {

    if (document.getElementById('event-lightbox')) {
        return;
    }


    const overlay = document.createElement('div');

    overlay.id = 'event-lightbox';
    overlay.className = 'lightbox-overlay';


    overlay.innerHTML = `

        <button
            type="button"
            class="lightbox-close"
            aria-label="Close"
        >
            &times;
        </button>

        <button
            type="button"
            class="lightbox-prev"
            aria-label="Previous photo"
        >
            &#8249;
        </button>

        <img
            class="lightbox-image"
            src=""
            alt=""
        >

        <button
            type="button"
            class="lightbox-next"
            aria-label="Next photo"
        >
            &#8250;
        </button>

        <div class="lightbox-caption"></div>

    `;


    document.body.appendChild(overlay);


    /*
     * Close button
     */

    overlay
        .querySelector('.lightbox-close')
        .addEventListener('click', closeLightbox);


    /*
     * Previous
     */

    overlay
        .querySelector('.lightbox-prev')
        .addEventListener('click', () => {

            stepLightbox(-1);

        });


    /*
     * Next
     */

    overlay
        .querySelector('.lightbox-next')
        .addEventListener('click', () => {

            stepLightbox(1);

        });


    /*
     * Click outside image
     */

    overlay.addEventListener('click', event => {

        if (event.target === overlay) {
            closeLightbox();
        }

    });


    /*
     * Keyboard controls
     */

    document.addEventListener('keydown', event => {

        if (!overlay.classList.contains('open')) {
            return;
        }


        if (event.key === 'Escape') {
            closeLightbox();
        }


        if (event.key === 'ArrowLeft') {
            stepLightbox(-1);
        }


        if (event.key === 'ArrowRight') {
            stepLightbox(1);
        }

    });
}


/* ============================================================
   OPEN LIGHTBOX
============================================================ */

function openLightbox(eventId, index = 0) {

    const event = EVENTS.find(
        item => item.id === eventId
    );


    if (!event) {
        console.error(
            'Lightbox event not found:',
            eventId
        );

        return;
    }


    const images = getImages(event);


    if (images.length === 0) {

        console.warn(
            'This engagement has no photos:',
            event.client
        );

        return;
    }


    lightboxEventId = eventId;
    lightboxIndex = index;


    const overlay =
        document.getElementById('event-lightbox');


    if (!overlay) {
        return;
    }


    overlay.classList.add('open');

    document.body.style.overflow = 'hidden';


    updateLightboxImage();
}


/* ============================================================
   CLOSE LIGHTBOX
============================================================ */

function closeLightbox() {

    const overlay =
        document.getElementById('event-lightbox');


    if (!overlay) {
        return;
    }


    overlay.classList.remove('open');

    document.body.style.overflow = '';

}


/* ============================================================
   STEP LIGHTBOX
============================================================ */

function stepLightbox(delta) {

    const event = EVENTS.find(
        item => item.id === lightboxEventId
    );


    if (!event) {
        return;
    }


    const images = getImages(event);


    if (images.length === 0) {
        return;
    }


    lightboxIndex =
        (lightboxIndex + delta + images.length)
        % images.length;


    updateLightboxImage();
}


/* ============================================================
   UPDATE LIGHTBOX
============================================================ */

function updateLightboxImage() {

    const event = EVENTS.find(
        item => item.id === lightboxEventId
    );


    if (!event) {
        return;
    }


    const images = getImages(event);


    if (images.length === 0) {
        return;
    }


    const overlay =
        document.getElementById('event-lightbox');


    if (!overlay) {
        return;
    }


    const image =
        overlay.querySelector('.lightbox-image');


    const caption =
        overlay.querySelector('.lightbox-caption');


    image.src = images[lightboxIndex];

    image.alt =
        `${event.type} with ${event.client}`;


    caption.textContent =
        `${event.client} — ${event.type} · Photo ${lightboxIndex + 1} of ${images.length}`;
}


/* ============================================================
   ERROR DISPLAY
============================================================ */

function showEventsError(message) {

    const gallery =
        document.getElementById('event-gallery');


    const list =
        document.getElementById('event-list');


    const errorHTML = `
        <div class="events-error">
            <strong>Events could not be loaded.</strong>
            <p>${escapeHTML(message)}</p>
        </div>
    `;


    if (gallery) {
        gallery.innerHTML = errorHTML;
    }


    if (list) {
        list.innerHTML = errorHTML;
    }

}


/* ============================================================
   INITIALISE
============================================================ */

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        console.log(
            'Sakwa events.js loaded.'
        );


        try {

            /*
             * Load JSON
             */

            EVENTS = await loadEvents();


            console.log(
                `Loaded ${EVENTS.length} events from events.json.`
            );


            /*
             * Create lightbox
             */

            buildLightboxDom();


            /*
             * Render gallery independently
             */

            const gallery =
                document.getElementById('event-gallery');


            if (gallery) {

                try {

                    renderGallery(
                        EVENTS,
                        gallery
                    );

                } catch (error) {

                    console.error(
                        'Gallery rendering error:',
                        error
                    );

                }

            }


            /*
             * Render Recent Engagements independently
             */

            const engagementList =
                document.getElementById('event-list');


            if (engagementList) {

                try {

                    renderEngagements(
                        EVENTS,
                        engagementList
                    );

                } catch (error) {

                    console.error(
                        'Engagement rendering error:',
                        error
                    );

                    engagementList.innerHTML = `
                        <div class="events-error">
                            <strong>
                                Recent engagements could not be displayed.
                            </strong>
                            <p>
                                Please check the browser console for details.
                            </p>
                        </div>
                    `;

                }

            }


        } catch (error) {

            console.error(
                'Events loading error:',
                error
            );


            showEventsError(
                error.message
            );

        }

    }
);
```
