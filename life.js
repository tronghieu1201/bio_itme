// life.js – Gallery logic for "Góc cá nhân" page
(function () {
    var overlay = document.getElementById('gallery-overlay');
    var titleEl = document.getElementById('gallery-title');
    var gridEl = document.getElementById('gallery-grid');
    var quoteEl = document.getElementById('gallery-quote');
    var emptyEl = document.getElementById('gallery-empty');
    var closeBtn = document.getElementById('gallery-close');
    var backBtn = document.getElementById('life-back');
    var toast = document.getElementById('life-toast');
    var joinBtn = document.getElementById('card-join');
    var joinModal = document.getElementById('join-modal');
    var joinClose = document.getElementById('join-close');
    var joinForm = document.getElementById('join-form');
    var joinCreatedAt = document.getElementById('join-created-at');
    var toastTimer = null;
    var thoughtsConfirmModal = null;
    var thoughtsConfirmCloseTimer = null;
    var JOIN_STORAGE_KEY = 'life-join-submissions';
    var DEFAULT_TOAST_MESSAGE = toast ? toast.textContent : 'Mục này đang được cập nhật, hãy quay lại sau nhé!';
    var THOUGHTS_STORAGE_KEY = 'life-thoughts-selected';
    var thoughtsQuotes = [
        'Nghe hàng nghìn đạo lý — nhưng vẫn chưa sống tốt ở hiện tại.',
        'Những thứ đơn giản tạo nên tình yêu — tình yêu sẽ là những thứ đơn giản.',
        'Không cô đơn vì biết đủ hay không cô đơn vì không biết đủ.',
        'Ánh mắt của tôi chỉ dành cho bạn — nhưng liệu chỉ nhìn từ xa thì có hối hận không.',
        'Biết đủ để không cần nói.',
        'Ai cũng nghĩ mình là nạn nhân nhưng đâu nghĩ rằng ai cũng có lỗi.',
        'Một khoảnh khắc nhỏ đã biến ngày hôm đó thành kỷ niệm.',
        'Mình đang yêu người đó theo cách hiện tại, hay mình đang giữ một phần của bản thân mình trong quá khứ.',
        'Khởi đầu đầy lời tạm biệt.',
        'Hãy chấp nhận góc nhìn của người khác mà không cần chứng minh mình đúng.',
        'Bất kể là mối quan hệ gì, khi người khác không cần. Bạn phải học cách thu hồi sự nhiệt tình và lịch sự rời đi.',
        'Anh học thêm, để kể em nhiều — Em học thêm, để hiểu những gì anh kể.'
    ];
    var specialThoughtIndexes = [1, 7, 11];

    // Category config: map category key → display name and image folder
    var categories = {
        cooking: {
            title: 'Nấu ăn',
            folder: 'images/life/cooking/',
            images: [] // Add image filenames here, e.g. ['mon1.jpg', 'mon2.jpg']
        },
        thoughts: {
            title: 'Sai số thứ...',
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

    function setThoughtQuote(index) {
        if (!quoteEl) return;

        if (!Number.isFinite(index) || index < 0 || index >= thoughtsQuotes.length) {
            quoteEl.className = 'gallery-panel__quote';
            quoteEl.innerHTML = '';
            quoteEl.hidden = true;
            try {
                localStorage.removeItem(THOUGHTS_STORAGE_KEY);
            } catch (e) {}
            document.querySelectorAll('.thoughts-number-btn').forEach(function (btn) {
                btn.classList.remove('is-active');
            });
            return;
        }

        var safeIndex = Math.max(0, Math.min(index, thoughtsQuotes.length - 1));
        var isSpecial = specialThoughtIndexes.indexOf(safeIndex) !== -1;
        quoteEl.className = 'gallery-panel__quote is-visible';
        quoteEl.innerHTML = '<span class="thought-quote__text' + (isSpecial ? ' thought-quote__text--special' : '') + '">' + thoughtsQuotes[safeIndex] + '</span>';
        quoteEl.hidden = false;

        try {
            localStorage.setItem(THOUGHTS_STORAGE_KEY, String(safeIndex));
        } catch (e) {}

        document.querySelectorAll('.thoughts-number-btn').forEach(function (btn) {
            btn.classList.toggle('is-active', Number(btn.getAttribute('data-index')) === safeIndex);
        });
    }

    function renderThoughtsQuotes() {
        titleEl.textContent = categories.thoughts.title;
        gridEl.innerHTML = '';
        gridEl.dataset.mode = 'thoughts';
        emptyEl.hidden = true;
        quoteEl.className = 'gallery-panel__quote';
        quoteEl.innerHTML = '';
        quoteEl.hidden = true;

        thoughtsQuotes.forEach(function (quote, index) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'thoughts-number-btn';
            btn.setAttribute('data-index', String(index));
            btn.innerHTML = '<span>' + (index + 1) + '</span>';
            btn.addEventListener('click', function () {
                setThoughtQuote(index);
            });
            gridEl.appendChild(btn);
        });
    }

    function openGallery(categoryKey) {
        var cat = categories[categoryKey];
        if (!cat || !overlay) return;

        titleEl.textContent = cat.title;
        gridEl.innerHTML = '';
        gridEl.dataset.mode = '';
        clearTimeout(toastTimer);
        document.body.classList.add('is-modal-open');
        emptyEl.hidden = false;
        emptyEl.classList.remove('is-visible');
        quoteEl.hidden = true;
        quoteEl.className = 'gallery-panel__quote';
        quoteEl.classList.remove('is-visible');
        quoteEl.innerHTML = '';

        if (categoryKey === 'thoughts') {
            renderThoughtsQuotes();
        } else if (cat.images.length === 0) {
            showLifeToast();
            return;
        } else {
            emptyEl.classList.remove('is-visible');
            emptyEl.hidden = true;
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
        }, 900);
    }

    function stopConfirmEvent(ev) {
        ev.preventDefault();
        ev.stopPropagation();
    }

    function ensureThoughtsConfirmModal() {
        if (thoughtsConfirmModal) return thoughtsConfirmModal;

        thoughtsConfirmModal = document.createElement('div');
        thoughtsConfirmModal.className = 'thoughts-confirm';
        thoughtsConfirmModal.setAttribute('aria-hidden', 'true');
        thoughtsConfirmModal.innerHTML =
            '<div class="thoughts-confirm__backdrop"></div>' +
            '<article class="thoughts-confirm__card" role="dialog" aria-modal="true" aria-label="X&aacute;c nh&#7853;n L&#259;ng k&iacute;nh">' +
                '<p class="thoughts-confirm__message">C&oacute; th&#7875; kh&ocirc;ng &#273;&uacute;ng v&#7899;i b&#7841;n, nh&#432;ng n&oacute; l&agrave; g&oacute;c nh&igrave;n t&#7915;ng tr&#7843;i c&#7911;a Hi&#7871;u.</p>' +
                '<div class="thoughts-confirm__actions">' +
                    '<button type="button" class="thoughts-confirm__accept">Ch&#7845;p nh&#7853;n</button>' +
                    '<button type="button" class="thoughts-confirm__decline">Kh&ocirc;ng</button>' +
                '</div>' +
            '</article>';

        var backdrop = thoughtsConfirmModal.querySelector('.thoughts-confirm__backdrop');
        var card = thoughtsConfirmModal.querySelector('.thoughts-confirm__card');

        ['pointerdown', 'touchend', 'click'].forEach(function (eventName) {
            backdrop.addEventListener(eventName, stopConfirmEvent);
            card.addEventListener(eventName, function (ev) {
                ev.stopPropagation();
            });
        });

        thoughtsConfirmModal.querySelector('.thoughts-confirm__accept').addEventListener('click', function (ev) {
            stopConfirmEvent(ev);
            closeThoughtsConfirm(true);
        });

        thoughtsConfirmModal.querySelector('.thoughts-confirm__decline').addEventListener('click', function (ev) {
            stopConfirmEvent(ev);
            closeThoughtsConfirm(false);
        });

        document.body.appendChild(thoughtsConfirmModal);
        return thoughtsConfirmModal;
    }

    function openThoughtsConfirm() {
        var modal = ensureThoughtsConfirmModal();
        clearTimeout(thoughtsConfirmCloseTimer);
        document.body.classList.add('is-modal-open');
        modal.classList.remove('is-closing');
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }

    function closeThoughtsConfirm(accepted) {
        if (!thoughtsConfirmModal) return;
        thoughtsConfirmModal.classList.remove('is-open');
        thoughtsConfirmModal.classList.add('is-closing');
        thoughtsConfirmModal.setAttribute('aria-hidden', 'true');

        thoughtsConfirmCloseTimer = setTimeout(function () {
            if (!thoughtsConfirmModal) return;
            thoughtsConfirmModal.classList.remove('is-closing');
            if (!accepted) document.body.classList.remove('is-modal-open');
        }, 320);

        if (accepted) openGallery('thoughts');
    }

    function closeGallery() {
        if (!overlay) return;
        clearTimeout(toastTimer);
        document.body.classList.remove('is-modal-open');
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');

        var url = new URL(window.location.href);
        if (url.searchParams.has('category')) {
            url.searchParams.delete('category');
            history.replaceState({}, '', url.pathname + (url.search ? '?' + url.searchParams.toString() : ''));
        }
    }

    function openJoinModal() {
        if (!joinModal) return;
        document.body.classList.add('is-modal-open');
        joinModal.classList.add('is-open');
        joinModal.setAttribute('aria-hidden', 'false');
    }

    function closeJoinModal() {
        if (!joinModal) return;
        document.body.classList.remove('is-modal-open');
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

    function isValidGmail(email) {
        return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
    }

    // Attach click to each category card
    document.querySelectorAll('.life-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            var category = card.getAttribute('data-category');
            if (!category) return;
            e.preventDefault();

            if (category === 'thoughts') {
                openThoughtsConfirm();
                return;
            }

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

    // Auto-open category only when the URL explicitly requests one.
    var params = new URLSearchParams(window.location.search);
    var categoryParam = params.get('category');
    if (categoryParam && categories[categoryParam]) {
        openGallery(categoryParam);
    }
    if (joinModal) {
        joinModal.querySelector('.join-modal__backdrop').addEventListener('click', closeJoinModal);
    }

    if (joinForm) {
        joinForm.addEventListener('submit', function (e) {
            var formData = new FormData(joinForm);
            var data = {
                name: String(formData.get('name') || '').trim(),
                email: String(formData.get('email') || '').trim(),
                createdAt: new Date().toISOString()
            };

            if (!data.name || !data.email) {
                e.preventDefault();
                return;
            }

            if (!isValidGmail(data.email)) {
                e.preventDefault();
                showLifeToast('Nhập đúng địa chỉ Gmail nhé!');
                return;
            }

            if (joinCreatedAt) joinCreatedAt.value = data.createdAt;
            saveJoinSubmission(data);

            e.preventDefault();
            fetch(joinForm.action, {
                method: 'POST',
                mode: 'no-cors',
                body: new FormData(joinForm)
            });

            joinForm.reset();
            closeJoinModal();
            showLifeToast('Nhớ check mail nhé 😉');
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
