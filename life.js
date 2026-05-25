// life.js – Gallery logic for "Góc cá nhân" page
(function () {
    var overlay = document.getElementById('gallery-overlay');
    var titleEl = document.getElementById('gallery-title');
    var gridEl = document.getElementById('gallery-grid');
    var emptyEl = document.getElementById('gallery-empty');
    var closeBtn = document.getElementById('gallery-close');
    var backBtn = document.getElementById('life-back');
    var toast = document.getElementById('life-toast');
    var joinBtn = document.getElementById('card-join');
    var joinModal = document.getElementById('join-modal');
    var joinClose = document.getElementById('join-close');
    var joinForm = document.getElementById('join-form');
    var toastTimer = null;
    var JOIN_STORAGE_KEY = 'life-join-submissions';
    var DEFAULT_TOAST_MESSAGE = toast ? toast.textContent : 'Chưa update. Hãy quay lại sau nhé!';

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

    function showLifeToast(message) {
        if (!toast) return;
        toast.textContent = message || DEFAULT_TOAST_MESSAGE;
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

    function openJoinModal() {
        if (!joinModal) return;
        joinModal.classList.add('is-open');
        joinModal.setAttribute('aria-hidden', 'false');
    }

    function closeJoinModal() {
        if (!joinModal) return;
        joinModal.classList.remove('is-open');
        joinModal.setAttribute('aria-hidden', 'true');
    }

    function readJoinSubmissions() {
        try {
            return JSON.parse(localStorage.getItem(JOIN_STORAGE_KEY)) || [];
        } catch (e) {
            return [];
        }
    }

    function saveJoinSubmission(data) {
        var submissions = readJoinSubmissions();
        submissions.push(data);
        try {
            localStorage.setItem(JOIN_STORAGE_KEY, JSON.stringify(submissions, null, 2));
        } catch (e) {
            return false;
        }
        return true;
    }

    function sendJoinSubmission(formData) {
        if (!joinForm || !joinForm.action) {
            return Promise.reject(new Error('Missing form endpoint'));
        }

        return fetch(joinForm.action, {
            method: 'POST',
            headers: {
                Accept: 'application/json'
            },
            body: formData
        }).then(function (response) {
            if (!response.ok) throw new Error('Form submit failed');
            return response.json();
        });
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

    if (joinBtn) {
        joinBtn.addEventListener('click', openJoinModal);
    }

    if (joinClose) {
        joinClose.addEventListener('click', closeJoinModal);
    }

    if (joinModal) {
        joinModal.querySelector('.join-modal__backdrop').addEventListener('click', closeJoinModal);
    }

    if (joinForm) {
        joinForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var formData = new FormData(joinForm);
            var data = {
                name: String(formData.get('name') || '').trim(),
                email: String(formData.get('email') || '').trim(),
                createdAt: new Date().toISOString()
            };

            if (!data.name || !data.email) return;

            formData.append('createdAt', data.createdAt);
            saveJoinSubmission(data);

            sendJoinSubmission(formData)
                .then(function () {
                    joinForm.reset();
                    closeJoinModal();
                    showLifeToast('Đã gửi thông tin. Cảm ơn bạn nhé!');
                })
                .catch(function () {
                    showLifeToast('Chưa gửi được, thử lại sau nhé!');
                });
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
        if (e.key === 'Escape') {
            closeGallery();
            closeJoinModal();
        }
    });
})();
