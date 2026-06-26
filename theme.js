// theme.js – interactions for link panels, modals, galleries, and toasts.
(function () {
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

    /* ---- Link group panels ---- */
    var linkHub = document.getElementById('link-hub');
    var linkPanels = Array.prototype.slice.call(document.querySelectorAll('.link-panel'));
    var panelHistoryActive = false;
    var qrHistoryActive = false;

    function pushUiState(state) {
        if (!window.history || !window.history.pushState) return false;
        try {
            window.history.pushState(state, '');
            return true;
        } catch (e) {
            return false;
        }
    }

    function hasOpenLinkPanel() {
        return linkPanels.some(function (panel) {
            return panel.classList.contains('is-open');
        });
    }

    function closeLinkPanels() {
        if (linkHub) linkHub.classList.remove('is-hidden');
        linkPanels.forEach(function (panel) {
            panel.classList.remove('is-open');
            panel.setAttribute('aria-hidden', 'true');
        });
        document.querySelectorAll('[data-panel-target]').forEach(function (btn) {
            btn.classList.remove('is-active');
            btn.setAttribute('aria-expanded', 'false');
        });
        panelHistoryActive = false;
    }

    function openLinkPanel(panelId, skipHistory) {
        var target = document.getElementById(panelId);
        if (!target || !linkHub) return;

        if (!skipHistory) {
            panelHistoryActive = pushUiState({ bioPanel: panelId });
        }

        linkHub.classList.add('is-hidden');
        linkPanels.forEach(function (panel) {
            var isTarget = panel === target;
            panel.classList.toggle('is-open', isTarget);
            panel.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
        });

        document.querySelectorAll('[data-panel-target]').forEach(function (btn) {
            var isActive = btn.getAttribute('data-panel-target') === panelId;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-panel-target]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            openLinkPanel(btn.getAttribute('data-panel-target'));
        });
    });

    function prefetchPage(url) {
        if (!url || !document.createElement) return;
        var link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    function navigateWithTransition(url) {
        if (!url) return;
        var mainCard = document.querySelector('.bio-card');
        if (mainCard) {
            mainCard.classList.add('is-exiting');
        }
        document.body.classList.add('is-page-transitioning');
        setTimeout(function () {
            window.location.href = url;
        }, 180);
    }

    var personalLink = document.getElementById('link-life');
    if (personalLink) {
        personalLink.addEventListener('click', function (e) {
            e.preventDefault();
            navigateWithTransition(personalLink.getAttribute('href'));
        });
        prefetchPage(personalLink.getAttribute('href'));
    }

    document.querySelectorAll('[data-panel-back]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (panelHistoryActive) {
                window.history.back();
            } else {
                closeLinkPanels();
            }
        });
    });

    /* ---- QR Lightbox ---- */
    var lightbox = document.getElementById('qr-lightbox');
    var qrLightboxImg = document.getElementById('qr-lightbox-img');

    function openLightbox(trigger, skipHistory) {
        if (lightbox) {
            var qrSrc = trigger ? trigger.getAttribute('data-qr-src') : '';
            var qrAlt = trigger ? trigger.getAttribute('data-qr-alt') : '';
            if (trigger && qrLightboxImg) {
                qrLightboxImg.src = qrSrc || 'https://res.cloudinary.com/dtpw5htqs/image/upload/v1782284227/qr_zalo_huh7bk.webp';
                qrLightboxImg.alt = qrAlt || 'Ma QR phong to';
            }
            if (!skipHistory) {
                qrHistoryActive = pushUiState({
                    qrLightbox: true,
                    qrSrc: qrSrc || 'https://res.cloudinary.com/dtpw5htqs/image/upload/v1782284227/qr_zalo_huh7bk.webp',
                    qrAlt: qrAlt || 'Ma QR phong to'
                });
            }
            document.body.classList.add('is-modal-open');
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
        }
    }

    function closeLightbox(skipHistory) {
        if (lightbox) {
            if (!skipHistory && qrHistoryActive) {
                window.history.back();
                return;
            }
            document.body.classList.remove('is-modal-open');
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            qrHistoryActive = false;
        }
    }

    document.querySelectorAll('[data-qr-src]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            openLightbox(btn);
        });
    });

    if (lightbox) {
        lightbox.querySelector('.lightbox__backdrop').addEventListener('click', function () {
            closeLightbox();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeLightbox();
        });
    }

    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.qrLightbox) {
            if (qrLightboxImg) {
                qrLightboxImg.src = e.state.qrSrc || 'https://res.cloudinary.com/dtpw5htqs/image/upload/v1782284227/qr_zalo_huh7bk.webp';
                qrLightboxImg.alt = e.state.qrAlt || 'Ma QR phong to';
            }
            qrHistoryActive = true;
            openLightbox(null, true);
            return;
        }

        if (qrHistoryActive) {
            closeLightbox(true);
            return;
        }

        if (e.state && e.state.bioPanel) {
            openLinkPanel(e.state.bioPanel, true);
            panelHistoryActive = true;
            return;
        }

        if (panelHistoryActive || hasOpenLinkPanel()) {
            closeLinkPanels();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (lightbox && lightbox.classList.contains('is-open')) return;
        if (e.key !== 'Escape' || !hasOpenLinkPanel()) return;
        if (panelHistoryActive) {
            window.history.back();
        } else {
            closeLinkPanels();
        }
    });

    /* ---- Profile Info Card ---- */
    var profileOpenBtn = document.getElementById('profile-info-open');
    var profileCloseBtn = document.getElementById('profile-info-close');
    var profileModal = document.getElementById('profile-info-modal');

    function openProfileModal() {
        if (profileModal) {
            document.body.classList.add('is-modal-open');
            profileModal.classList.add('is-open');
            profileModal.setAttribute('aria-hidden', 'false');
        }
    }

    function closeProfileModal() {
        if (profileModal) {
            document.body.classList.remove('is-modal-open');
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
        var nextSrc = src || (img ? img.src : '');
        var requestId = String(Date.now()) + Math.random();

        photoLightboxImg.dataset.requestId = requestId;
        photoLightbox.classList.add('is-loading');
        photoLightboxImg.removeAttribute('srcset');
        photoLightboxImg.removeAttribute('src');
        photoLightboxImg.alt = title || (img ? img.alt : '');

        photoLightboxImg.onload = function () {
            if (photoLightboxImg.dataset.requestId !== requestId) return;
            photoLightbox.classList.remove('is-loading');
        };
        photoLightboxImg.onerror = function () {
            if (photoLightboxImg.dataset.requestId !== requestId) return;
            photoLightbox.classList.remove('is-loading');
        };

        photoLightboxImg.sizes = '(max-width: 1000px) calc(100vw - 44px), 960px';
        photoLightboxImg.srcset = card.getAttribute('data-full-srcset') || '';
        photoLightboxImg.src = nextSrc;
        if (photoLightboxImg.complete && photoLightboxImg.naturalWidth) {
            photoLightbox.classList.remove('is-loading');
        }
        if (photoLightboxCaption) {
            var caption = [title, meta].filter(Boolean).join(' - ');
            photoLightboxCaption.textContent = caption;
            photoLightboxCaption.hidden = !caption;
        }
        document.body.classList.add('is-modal-open');
        photoLightbox.classList.add('is-open');
        photoLightbox.setAttribute('aria-hidden', 'false');
    }

    function closePhotoLightbox() {
        if (!photoLightbox) return;
        document.body.classList.remove('is-modal-open');
        photoLightbox.classList.remove('is-open', 'is-loading');
        photoLightbox.setAttribute('aria-hidden', 'true');
    }

    function isImageFile(path) {
        return /\.(avif|gif|jpe?g|png|webp)$/i.test(path || '');
    }

    function normalizeGalleryPhotoUrl(url) {
        if (!url) return '';
        return decodeURIComponent(url.split('?')[0]).replace(/\/+$/, '');
    }

    function getPinnedPhotoUrls(gallery) {
        return (gallery.getAttribute('data-pinned-image') || '').split(',').map(function (url) {
            return url.trim();
        }).filter(Boolean);
    }

    function isPinnedPhotoCard(gallery, src, fullSrc) {
        var pinnedUrls = getPinnedPhotoUrls(gallery).map(normalizeGalleryPhotoUrl);
        if (!pinnedUrls.length) return false;

        var candidates = [src, fullSrc].map(normalizeGalleryPhotoUrl).filter(Boolean);
        return candidates.some(function (candidate) {
            return pinnedUrls.indexOf(candidate) !== -1;
        });
    }

    function createPhotoCard(gallery, src, name, fullSrc, originalSrc, thumbSrcset, fullSrcset, isPriority) {
        var card = document.createElement('button');
        var img = document.createElement('img');
        var isPinned = isPinnedPhotoCard(gallery, originalSrc || fullSrc || src, fullSrc || src);

        card.className = 'photo-card';
        card.type = 'button';
        card.setAttribute('data-full', fullSrc || src);
        if (fullSrcset) {
            card.setAttribute('data-full-srcset', fullSrcset);
        }
        if (isPinned) {
            card.classList.add('photo-card--pinned');
        }

        if (thumbSrcset) {
            img.srcset = thumbSrcset;
            img.sizes = '(max-width: 480px) calc((100vw - 44px) / 3), (max-width: 820px) calc((100vw - 58px) / 2), 244px';
        }
        img.src = src;
        img.alt = name || 'Anh nau an';
        img.width = 360;
        img.height = 450;
        img.loading = isPriority ? 'eager' : 'lazy';
        img.decoding = 'async';
        if (isPriority) {
            img.fetchPriority = 'high';
        }
        
        img.onload = function () {
            img.classList.add('is-loaded');
        };
        if (img.complete) {
            img.classList.add('is-loaded');
        }

        card.appendChild(img);
        if (isPinned) {
            var pinBadge = document.createElement('span');
            pinBadge.className = 'photo-card__pin';
            pinBadge.innerHTML = '<i class="fas fa-thumbtack" aria-hidden="true"></i>';
            pinBadge.setAttribute('aria-label', 'Ảnh ghim');
            card.appendChild(pinBadge);
        }
        card.addEventListener('click', function () {
            openPhotoLightbox(card);
        });
        gallery.appendChild(card);
    }

    function createPlaceholderPhotoCard(gallery, index) {
        var card = document.createElement('div');
        card.className = 'photo-card photo-card--placeholder';
        card.setAttribute('aria-label', 'Khung anh dang cho cap nhat ' + index);
        card.innerHTML =
            '<div class="photo-placeholder">' +
                '<i class="fas fa-image" aria-hidden="true"></i>' +
                '<span>Dang cho anh</span>' +
            '</div>';
        gallery.appendChild(card);
    }

    function renderPlaceholderGallery(gallery, count) {
        var total = Math.max(1, Number(count) || 9);
        var oldPager = gallery.parentElement.querySelector('.photo-pager');
        if (oldPager) oldPager.remove();
        gallery.innerHTML = '';
        for (var i = 1; i <= total; i += 1) {
            createPlaceholderPhotoCard(gallery, i);
        }
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


    function createPhotoPager(gallery, pageCount, currentPage, onPageChange) {
        var oldPager = gallery.parentElement.querySelector('.photo-pager');
        if (oldPager) oldPager.remove();
        if (pageCount <= 1) return;

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

    function getPerPage() {
        return window.innerWidth >= 768 ? 12 : 9;
    }

    function renderPhotoGalleryPage(gallery, photos, page) {
        var perPage = getPerPage();
        var pageCount = Math.max(1, Math.ceil(photos.length / perPage));
        var currentPage = Math.min(Math.max(page || 1, 1), pageCount);
        var visiblePhotos = photos.slice((currentPage - 1) * perPage, currentPage * perPage);

        gallery.innerHTML = '';
        gallery._currentPage = currentPage;
        visiblePhotos.forEach(function (photo, index) {
            createPhotoCard(gallery, photo.thumb || photo.src, photo.name, photo.full || photo.src, photo.src, photo.thumbSrcset, photo.fullSrcset, index < 3);
        });
        createPhotoPager(gallery, pageCount, currentPage, function (nextPage) {
            gallery.classList.add('is-changing');
            setTimeout(function () {
                renderPhotoGalleryPage(gallery, photos, nextPage);
                gallery.classList.remove('is-changing');
            }, 180);
        });
    }

    function renderPhotoGallery(gallery, photos) {
        var sortedPhotos = applyPinnedPhotoOrder(gallery, sortPhotosNewestFirst(photos));
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

    function getCloudinaryVariant(src, transform) {
        if (!src || src.indexOf('/image/upload/') === -1) return src;
        return src.replace('/image/upload/', '/image/upload/' + transform + '/');
    }

    function getCloudinarySrcset(src, widths, quality) {
        if (!src || src.indexOf('/image/upload/') === -1) return '';
        return widths.map(function (width) {
            return getCloudinaryVariant(src, 'f_auto,' + quality + ',c_limit,w_' + width) + ' ' + width + 'w';
        }).join(', ');
    }

    function normalizeGalleryPhotoUrl(url) {
        if (!url) return '';
        return decodeURIComponent(url.split('?')[0]).replace(/\/+$/, '');
    }

    function getPinnedPhotoUrls(gallery) {
        return (gallery.getAttribute('data-pinned-image') || '').split(',').map(function (url) {
            return url.trim();
        }).filter(Boolean);
    }

    function applyPinnedPhotoOrder(gallery, photos) {
        var pinnedUrls = getPinnedPhotoUrls(gallery).map(normalizeGalleryPhotoUrl);
        if (!pinnedUrls.length || !photos.length) return photos;

        var pinnedPhotos = [];
        var remainingPhotos = photos.slice();

        pinnedUrls.forEach(function (pinnedUrl) {
            var pinnedIndex = -1;

            remainingPhotos.forEach(function (photo, index) {
                if (pinnedIndex === -1 && normalizeGalleryPhotoUrl(photo.src) === pinnedUrl) {
                    pinnedIndex = index;
                }
            });

            if (pinnedIndex !== -1) {
                pinnedPhotos.push(remainingPhotos.splice(pinnedIndex, 1)[0]);
            }
        });

        return pinnedPhotos.concat(remainingPhotos);
    }

    function getCloudinaryGalleryPhotos(gallery) {
        var imageList = gallery.getAttribute('data-gallery-cloudinary') || '';
        if (!imageList.trim()) return [];

        var urls = imageList.split(',')
            .map(function (url) {
                return url.trim();
            })
            .filter(function (url) {
                return url && isImageFile(url);
            });

        return urls.map(function (url, index) {
            var cleanUrl = url.split('?')[0];
            var name = decodeURIComponent(cleanUrl.split('/').pop() || 'Anh ky niem');
            // Lấy version timestamp từ URL Cloudinary (v1782486xxx) — số lớn hơn = mới hơn
            var versionMatch = cleanUrl.match(/\/v(\d+)\//);
            var time = versionMatch ? parseInt(versionMatch[1], 10) : (urls.length - index);
            return {
                src: url,
                thumb: getCloudinaryVariant(url, 'f_auto,q_auto:good,c_limit,w_720'),
                thumbSrcset: getCloudinarySrcset(url, [360, 540, 720, 960], 'q_auto:good'),
                full: getCloudinaryVariant(url, 'f_auto,q_auto:best,c_limit,w_2400'),
                fullSrcset: getCloudinarySrcset(url, [1200, 1800, 2400], 'q_auto:best'),
                name: name,
                time: time
            };
        });
    }
    function getStaticGalleryPhotos(gallery, dir) {
        var imageList = gallery.getAttribute('data-gallery-images') || '';
        if (!imageList.trim()) return [];

        return imageList.split(',')
            .map(function (name) {
                return name.trim();
            })
            .filter(function (name) {
                return name && isImageFile(name);
            })
            .map(function (name, index, files) {
                return {
                    src: dir + name,
                    name: name,
                    time: files.length - index
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
        var cloudinaryPhotos = getCloudinaryGalleryPhotos(gallery);
        if (cloudinaryPhotos.length) {
            renderPhotoGallery(gallery, applyPinnedPhotoOrder(gallery, cloudinaryPhotos));
            return;
        }
        if (!dir) return;

        // Show loading state
        var loadingDiv = document.createElement('div');
        loadingDiv.className = 'gallery-loading';
        loadingDiv.textContent = 'Đang tải ảnh...';
        gallery.innerHTML = '';
        gallery.appendChild(loadingDiv);

        var staticPhotos = getStaticGalleryPhotos(gallery, dir);
        if (staticPhotos.length) {
            renderPhotoGallery(gallery, applyPinnedPhotoOrder(gallery, staticPhotos));
            return;
        }

        var placeholderCount = gallery.getAttribute('data-gallery-placeholders');
        if (placeholderCount) {
            renderPlaceholderGallery(gallery, placeholderCount);
            return;
        }

        fetch(dir)
            .then(function (response) {
                if (!response.ok) throw new Error('No local directory listing');
                return response.text();
            })
            .then(function (html) {
                var photos = getLocalPhotosFromListing(html, dir);
                if (!photos.length) throw new Error('No local photos');
                renderPhotoGallery(gallery, applyPinnedPhotoOrder(gallery, photos));
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
                        renderPhotoGallery(gallery, applyPinnedPhotoOrder(gallery, photos));
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

    document.querySelectorAll('.photo-gallery[data-gallery-dir], .photo-gallery[data-gallery-cloudinary]').forEach(function (gallery) {
        loadPhotoGallery(gallery);
    });

    // Debounce resize event
    var resizeTimer = null;
    if (window.addEventListener) {
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                document.querySelectorAll('.photo-gallery[data-gallery-dir], .photo-gallery[data-gallery-cloudinary]').forEach(function (gallery) {
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

    /* ---- Browser open note ---- */
    function ensureBrowserNote() {
        var note = document.getElementById('browser-note');
        if (note) return note;

        note = document.createElement('div');
        note.className = 'browser-note';
        note.id = 'browser-note';
        note.setAttribute('role', 'dialog');
        note.setAttribute('aria-modal', 'true');
        note.setAttribute('aria-labelledby', 'browser-note-title');
        note.setAttribute('aria-hidden', 'true');
        note.hidden = true;
        note.innerHTML =
            '<div class="browser-note__backdrop" data-browser-note-ok></div>' +
            '<article class="browser-note__card">' +
                '<h2 class="browser-note__title" id="browser-note-title">L&#432;u &yacute;</h2>' +
                '<p class="browser-note__text">N&ecirc;n m&#7903; b&#7857;ng tr&igrave;nh duy&#7879;t &#273;&#7875; kh&ocirc;ng b&#7883; treo</p>' +
                '<div class="browser-note__actions">' +
                    '<button type="button" class="browser-note__btn browser-note__btn--primary" data-browser-note-ok>OK</button>' +
                    '<button type="button" class="browser-note__btn" data-browser-note-snooze>T&#7855;t 1 gi&#7901;</button>' +
                '</div>' +
            '</article>';
        document.body.appendChild(note);
        return note;
    }

    var browserNote = ensureBrowserNote();
    var BROWSER_NOTE_STORAGE_KEY = 'browser-note-hidden-until';
    var BROWSER_NOTE_SNOOZE_MS = 60 * 60 * 1000;

    function getBrowserNoteHiddenUntil() {
        try {
            return Number(localStorage.getItem(BROWSER_NOTE_STORAGE_KEY) || 0);
        } catch (e) {
            return 0;
        }
    }

    function setBrowserNoteHiddenUntil(timestamp) {
        try {
            localStorage.setItem(BROWSER_NOTE_STORAGE_KEY, String(timestamp));
        } catch (e) {}
    }

    function openBrowserNote() {
        if (!browserNote) return;
        browserNote.hidden = false;
        browserNote.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(function () {
            browserNote.classList.add('is-open');
        });
    }

    function closeBrowserNote() {
        if (!browserNote) return;
        browserNote.classList.remove('is-open');
        browserNote.setAttribute('aria-hidden', 'true');
        setTimeout(function () {
            if (!browserNote.classList.contains('is-open')) {
                browserNote.hidden = true;
            }
        }, 240);
    }

    if (browserNote) {
        if (Date.now() >= getBrowserNoteHiddenUntil()) {
            openBrowserNote();
        }

        browserNote.querySelectorAll('[data-browser-note-ok]').forEach(function (btn) {
            btn.addEventListener('click', closeBrowserNote);
        });

        browserNote.querySelectorAll('[data-browser-note-snooze]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                setBrowserNoteHiddenUntil(Date.now() + BROWSER_NOTE_SNOOZE_MS);
                closeBrowserNote();
            });
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
