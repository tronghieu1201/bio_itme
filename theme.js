// theme.js – light/dark theme toggle with localStorage persistence
// and pointer-tracking ripple effect on link buttons.
(function () {
    const STORAGE_KEY = 'site-theme';
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    /* ---- Theme application ---- */
    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            toggle.textContent = '☀️';
            toggle.setAttribute('aria-label', 'Chuyển sang giao diện sáng');
        } else {
            root.classList.remove('dark');
            toggle.textContent = '🌙';
            toggle.setAttribute('aria-label', 'Chuyển sang giao diện tối');
        }
    }

    function getStoredTheme() {
        try {
            return localStorage.getItem(STORAGE_KEY);
        } catch (e) {
            return null;
        }
    }

    /* ---- Initialise ---- */
    const stored = getStoredTheme();
    if (stored === 'dark' || stored === 'light') {
        applyTheme(stored);
    } else {
        applyTheme(prefersDark.matches ? 'dark' : 'light');
    }

    /* ---- System preference change ---- */
    if (prefersDark.addEventListener) {
        prefersDark.addEventListener('change', function (e) {
            if (!getStoredTheme()) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    /* ---- Toggle click ---- */
    if (toggle) {
        toggle.addEventListener('click', function () {
            var isDark = document.documentElement.classList.contains('dark');
            var next = isDark ? 'light' : 'dark';
            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch (e) { /* quota exceeded – ignore */ }
            applyTheme(next);
        });
    }

    /* ---- Pointer-tracking ripple on .link-btn ---- */
    var lastRippleTime = 0;
    var rippleThrottle = 16; // ~60fps

    document.querySelectorAll('.link-btn').forEach(function (btn) {
        btn.addEventListener('mousemove', function (e) {
            var now = Date.now();
            if (now - lastRippleTime < rippleThrottle) return;
            lastRippleTime = now;

            var rect = btn.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--mx', x + '%');
            btn.style.setProperty('--my', y + '%');
        });
    });

    /* ---- QR Lightbox ---- */
    var zaloBtn = document.getElementById('link-zalo');
    var qrClose = document.getElementById('qr-close');
    var lightbox = document.getElementById('qr-lightbox');

    function openLightbox() {
        if (lightbox) {
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
        }
    }

    if (zaloBtn) {
        zaloBtn.addEventListener('click', openLightbox);
    }

    if (qrClose) {
        qrClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.querySelector('.lightbox__backdrop').addEventListener('click', closeLightbox);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    /* ---- Profile Info Card ---- */
    var profileOpenBtn = document.getElementById('profile-info-open');
    var profileCloseBtn = document.getElementById('profile-info-close');
    var profileModal = document.getElementById('profile-info-modal');

    function openProfileModal() {
        if (profileModal) {
            profileModal.classList.add('is-open');
            profileModal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeProfileModal() {
        if (profileModal) {
            profileModal.classList.remove('is-open');
            profileModal.setAttribute('aria-hidden', 'true');
        }
    }

    if (profileOpenBtn) {
        profileOpenBtn.addEventListener('click', openProfileModal);
    }

    if (profileCloseBtn) {
        profileCloseBtn.addEventListener('click', closeProfileModal);
    }

    if (profileModal) {
        profileModal.querySelector('.profile-modal__backdrop').addEventListener('click', closeProfileModal);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeProfileModal();
        });
    }

    /* ---- Photo Gallery Lightbox ---- */
    var photoLightbox = document.getElementById('photo-lightbox');
    var photoLightboxImg = document.getElementById('photo-lightbox-img');
    var photoLightboxCaption = document.getElementById('photo-lightbox-caption');
    var photoLightboxClose = document.getElementById('photo-lightbox-close');

    function openPhotoLightbox(card) {
        if (!photoLightbox || !photoLightboxImg) return;
        var src = card.getAttribute('data-full');
        var title = card.getAttribute('data-title') || '';
        var meta = card.getAttribute('data-meta') || '';
        var img = card.querySelector('img');

        photoLightboxImg.src = src || (img ? img.src : '');
        photoLightboxImg.alt = title || (img ? img.alt : '');
        if (photoLightboxCaption) {
            var caption = [title, meta].filter(Boolean).join(' - ');
            photoLightboxCaption.textContent = caption;
            photoLightboxCaption.hidden = !caption;
        }
        photoLightbox.classList.add('is-open');
        photoLightbox.setAttribute('aria-hidden', 'false');
    }

    function closePhotoLightbox() {
        if (!photoLightbox) return;
        photoLightbox.classList.remove('is-open');
        photoLightbox.setAttribute('aria-hidden', 'true');
    }

    function isImageFile(path) {
        return /\.(avif|gif|jpe?g|png|webp)$/i.test(path || '');
    }

    function createPhotoCard(gallery, src, name) {
        var card = document.createElement('button');
        var img = document.createElement('img');

        card.className = 'photo-card';
        card.type = 'button';
        card.setAttribute('data-full', src);

        img.src = src;
        img.alt = name || 'Anh nau an';
        img.loading = 'lazy';
        img.decoding = 'async';

        card.appendChild(img);
        card.addEventListener('click', function () {
            openPhotoLightbox(card);
        });
        gallery.appendChild(card);
    }

    function getPhotoTime(photo) {
        return photo.time || 0;
    }

    function sortPhotosNewestFirst(photos) {
        return photos.sort(function (a, b) {
            var timeDiff = getPhotoTime(b) - getPhotoTime(a);
            if (timeDiff) return timeDiff;
            return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
        });
    }

    function isCompactPhotoGrid() {
        return window.matchMedia && window.matchMedia('(max-width: 480px)').matches;
    }

    function createPhotoPager(gallery, pageCount, currentPage, onPageChange) {
        var oldPager = gallery.parentElement.querySelector('.photo-pager');
        if (oldPager) oldPager.remove();
        if (pageCount <= 1 || isCompactPhotoGrid()) return;

        var pager = document.createElement('nav');
        pager.className = 'photo-pager';
        pager.setAttribute('aria-label', 'Chuyen trang anh');

        for (var i = 1; i <= pageCount; i += 1) {
            (function (page) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'photo-pager__btn';
                btn.textContent = page;
                if (page === currentPage) {
                    btn.classList.add('is-active');
                    btn.setAttribute('aria-current', 'page');
                }
                btn.addEventListener('click', function () {
                    onPageChange(page);
                });
                pager.appendChild(btn);
            })(i);
        }

        gallery.insertAdjacentElement('afterend', pager);
    }

    function renderPhotoGalleryPage(gallery, photos, page) {
        var perPage = isCompactPhotoGrid() ? Math.max(photos.length, 1) : 9;
        var pageCount = Math.max(1, Math.ceil(photos.length / perPage));
        var currentPage = Math.min(Math.max(page || 1, 1), pageCount);
        var visiblePhotos = isCompactPhotoGrid()
            ? photos
            : photos.slice((currentPage - 1) * perPage, currentPage * perPage);

        gallery.innerHTML = '';
        gallery._currentPage = currentPage;
        visiblePhotos.forEach(function (photo) {
            createPhotoCard(gallery, photo.src, photo.name);
        });
        createPhotoPager(gallery, pageCount, currentPage, function (nextPage) {
            renderPhotoGalleryPage(gallery, photos, nextPage);
        });
    }

    function renderPhotoGallery(gallery, photos) {
        var sortedPhotos = sortPhotosNewestFirst(photos);
        gallery._photos = sortedPhotos;
        renderPhotoGalleryPage(gallery, sortedPhotos, 1);
    }

    function getGithubGalleryUrl(gallery, dir) {
        var owner = gallery.getAttribute('data-github-owner');
        var repo = gallery.getAttribute('data-github-repo');
        var branch = gallery.getAttribute('data-github-branch') || 'main';
        if (!owner || !repo) return '';
        return 'https://api.github.com/repos/' + owner + '/' + repo +
            '/contents/' + dir.replace(/\/$/, '') + '?ref=' + encodeURIComponent(branch);
    }

    function getLocalPhotosFromListing(html, dir) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        return Array.prototype.slice.call(doc.querySelectorAll('a[href]'))
            .map(function (link) {
                var href = link.getAttribute('href') || '';
                var name = decodeURIComponent(href.split('/').pop() || '');
                return {
                    src: href.charAt(0) === '/' ? href : dir + href,
                    name: name,
                    time: Date.parse((link.parentElement && link.parentElement.querySelector('.date'))
                        ? link.parentElement.querySelector('.date').textContent
                        : '') || 0
                };
            })
            .filter(function (photo) {
                return isImageFile(photo.src);
            });
    }

    function getGithubPhotos(items) {
        return items
            .filter(function (item) {
                return item.type === 'file' && isImageFile(item.name);
            })
            .map(function (item) {
                return {
                    src: item.download_url,
                    name: item.name,
                    path: item.path,
                    time: 0
                };
            });
    }

    function addGithubPhotoTimes(gallery, photos) {
        var owner = gallery.getAttribute('data-github-owner');
        var repo = gallery.getAttribute('data-github-repo');
        var branch = gallery.getAttribute('data-github-branch') || 'main';
        if (!owner || !repo || !photos.length) return Promise.resolve(photos);

        return Promise.all(photos.map(function (photo) {
            var commitsUrl = 'https://api.github.com/repos/' + owner + '/' + repo +
                '/commits?path=' + encodeURIComponent(photo.path) +
                '&sha=' + encodeURIComponent(branch) + '&per_page=1';
            return fetch(commitsUrl)
                .then(function (response) {
                    if (!response.ok) return photo;
                    return response.json();
                })
                .then(function (commits) {
                    if (commits && commits[0] && commits[0].commit && commits[0].commit.committer) {
                        photo.time = Date.parse(commits[0].commit.committer.date) || 0;
                    }
                    return photo;
                })
                .catch(function () {
                    return photo;
                });
        }));
    }

    function loadPhotoGallery(gallery) {
        var dir = gallery.getAttribute('data-gallery-dir');
        if (!dir) return;

        // Show loading state
        var loadingDiv = document.createElement('div');
        loadingDiv.className = 'gallery-loading';
        loadingDiv.textContent = 'Đang tải ảnh...';
        gallery.innerHTML = '';
        gallery.appendChild(loadingDiv);

        fetch(dir)
            .then(function (response) {
                if (!response.ok) throw new Error('No local directory listing');
                return response.text();
            })
            .then(function (html) {
                var photos = getLocalPhotosFromListing(html, dir);
                if (!photos.length) throw new Error('No local photos');
                renderPhotoGallery(gallery, photos);
            })
            .catch(function () {
                var githubUrl = getGithubGalleryUrl(gallery, dir);
                if (!githubUrl) {
                    var emptyDiv = document.createElement('div');
                    emptyDiv.className = 'gallery-empty';
                    emptyDiv.textContent = 'Chưa update. Hãy quay lại sau nhé!🌷';
                    gallery.innerHTML = '';
                    gallery.appendChild(emptyDiv);
                    return;
                }
                fetch(githubUrl)
                    .then(function (response) {
                        if (!response.ok) throw new Error('No GitHub photos');
                        return response.json();
                    })
                    .then(function (items) {
                        return addGithubPhotoTimes(gallery, getGithubPhotos(items));
                    })
                    .then(function (photos) {
                        if (!photos.length) throw new Error('No photos');
                        renderPhotoGallery(gallery, photos);
                    })
                    .catch(function () {
                        var emptyDiv = document.createElement('div');
                        emptyDiv.className = 'gallery-empty';
                        emptyDiv.textContent = 'Chưa update. Hãy quay lại sau nhé!🌷';
                        gallery.innerHTML = '';
                        gallery.appendChild(emptyDiv);
                    });
            });
    }

    document.querySelectorAll('.photo-gallery[data-gallery-dir]').forEach(function (gallery) {
        loadPhotoGallery(gallery);
    });

    // Debounce resize event
    var resizeTimer = null;
    if (window.addEventListener) {
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                document.querySelectorAll('.photo-gallery[data-gallery-dir]').forEach(function (gallery) {
                    if (gallery._photos) {
                        var currentPage = gallery._currentPage || 1;
                        renderPhotoGalleryPage(gallery, gallery._photos, currentPage);
                    }
                });
            }, 250);
        });
    }

    document.querySelectorAll('.photo-card').forEach(function (card) {
        card.addEventListener('click', function () {
            openPhotoLightbox(card);
        });
    });

    if (photoLightboxClose) {
        photoLightboxClose.addEventListener('click', closePhotoLightbox);
    }

    if (photoLightbox) {
        photoLightbox.querySelector('.photo-lightbox__backdrop').addEventListener('click', closePhotoLightbox);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closePhotoLightbox();
        });
    }

    /* ---- Copy Email to Clipboard ---- */
    var emailBtn = document.getElementById('link-email');
    var toast = document.getElementById('toast');
    var toastTimer = null;

    function showToast(msg) {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 2000);
    }

    if (emailBtn) {
        emailBtn.addEventListener('click', function () {
            var email = emailBtn.getAttribute('data-email');
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(email).then(function () {
                    showToast('Đã copy email: ' + email);
                });
            } else {
                // Fallback cho trình duyệt cũ
                var tmp = document.createElement('textarea');
                tmp.value = email;
                tmp.style.position = 'fixed';
                tmp.style.opacity = '0';
                document.body.appendChild(tmp);
                tmp.select();
                document.execCommand('copy');
                document.body.removeChild(tmp);
                showToast('Đã copy email: ' + email);
            }
        });
    }
})();
