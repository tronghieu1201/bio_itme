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
    var JOIN_STORAGE_KEY = 'life-join-submissions';
    var OPEN_CATEGORY_STORAGE_KEY = 'life-open-category';
    var DEFAULT_TOAST_MESSAGE = toast ? toast.textContent : 'Chưa update. Hãy quay lại sau nhé!';
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

        try {
            localStorage.setItem(OPEN_CATEGORY_STORAGE_KEY, categoryKey);
        } catch (e) {}

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
        }, 2600);
    }

    function closeGallery() {
        if (!overlay) return;
        clearTimeout(toastTimer);
        document.body.classList.remove('is-modal-open');
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
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

    var savedGalleryCategory = null;
    try {
        savedGalleryCategory = localStorage.getItem(OPEN_CATEGORY_STORAGE_KEY);
    } catch (e) {}
    if (savedGalleryCategory && categories[savedGalleryCategory]) {
        openGallery(savedGalleryCategory);
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
