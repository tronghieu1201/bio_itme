// life.js – Gallery logic for "Góc cá nhân" page
(function () {
    var overlay = document.getElementById('gallery-overlay');
    var titleEl = document.getElementById('gallery-title');
    var gridEl = document.getElementById('gallery-grid');
    var emptyEl = document.getElementById('gallery-empty');
    var closeBtn = document.getElementById('gallery-close');
    var backBtn = document.getElementById('life-back');
    var toast = document.getElementById('life-toast');
    var toastTimer = null;

    // Category config: map category key → display name and image folder
    var categories = {
        cooking: {
            title: 'Nấu ăn',
            folder: 'images/life/cooking/',
            images: [] // Add image filenames here, e.g. ['mon1.jpg', 'mon2.jpg']
        },
        thoughts: {
            title: 'Tâm sự',
            folder: 'images/life/daily/', // reuse daily folder or create a separate one
            images: []
        },
        friends: {
            title: 'Bạn bè',
            folder: 'images/life/friends/',
            images: []
        },
        daily: {
            title: 'Khoảnh khắc',
            folder: 'images/life/daily/',
            images: []
        }
    };

    function openGallery(categoryKey) {
        var cat = categories[categoryKey];
        if (!cat || !overlay) return;

        titleEl.textContent = cat.title;
        gridEl.innerHTML = '';
        clearTimeout(toastTimer);

        if (cat.images.length === 0) {
            showLifeToast();
            return;
        } else {
            emptyEl.classList.remove('is-visible');
            cat.images.forEach(function (filename) {
                var img = document.createElement('img');
                img.src = cat.folder + filename;
                img.alt = cat.title + ' – ' + filename;
                img.loading = 'lazy';
                gridEl.appendChild(img);
            });
        }

        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
    }

    function showLifeToast() {
        if (!toast) return;
        toast.classList.add('is-visible');
        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 2600);
    }

    function closeGallery() {
        if (!overlay) return;
        clearTimeout(toastTimer);
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
    }

    // Attach click to each category card
    document.querySelectorAll('.life-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            var category = card.getAttribute('data-category');
            if (!category) return;
            e.preventDefault();
            if (category) openGallery(category);
        });
    });

    if (backBtn) {
        backBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = './';
        });
    }

    // Close gallery
    if (closeBtn) {
        closeBtn.addEventListener('click', closeGallery);
    }

    if (overlay) {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeGallery();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeGallery();
    });
})();
