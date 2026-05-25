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

    function sendJoinSubmission(data) {
        if (!joinForm || !joinForm.action) {
            return Promise.reject(new Error('Missing form endpoint'));
        }

        return fetch(joinForm.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                name: data.name,
                email: data.email,
                createdAt: data.createdAt,
                message: 'Tham gia cùng tôi',
                _subject: 'Có người muốn tham gia cùng tôi',
                _template: 'table',
                _captcha: 'false'
            })
        }).then(function (response) {
            return response.json().then(function (result) {
                if (!response.ok || result.success === false) {
                    throw new Error(result.message || 'Form submit failed');
                }
                return result;
            });
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

            saveJoinSubmission(data);

            sendJoinSubmission(data)
                .then(function () {
                    joinForm.reset();
                    closeJoinModal();
                    showLifeToast('Đã gửi thông tin. Cảm ơn bạn nhé!');
                })
                .catch(function (error) {
                    var message = error && error.message ? error.message : '';
                    if (message.toLowerCase().indexOf('activate') >= 0 || message.toLowerCase().indexOf('confirm') >= 0) {
                        showLifeToast('Bạn cần xác nhận FormSubmit trong email trước nhé!');
                    } else {
                        showLifeToast('Chưa gửi được, thử lại sau nhé!');
                    }
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
