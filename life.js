// life.js – Gallery logic for "Góc cá nhân" page
(function () {
    var overlay = document.getElementById('gallery-overlay');
    var titleEl = document.getElementById('gallery-title');
    var gridEl = document.getElementById('gallery-grid');
    var quoteEl = document.getElementById('gallery-quote');
    var emptyEl = document.getElementById('gallery-empty');
    var closeBtn = document.getElementById('gallery-close');
    var thoughtsGuide = document.getElementById('thoughts-guide');
    var thoughtsGuideBtn = document.getElementById('thoughts-guide-btn');
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
        'Không cho em được gì nhiều nên chẳng dám đòi hỏi bao nhiêu.',
        'Khởi đầu đầy lời tạm biệt.',
        'Hãy chấp nhận góc nhìn của người khác mà không cần chứng minh mình đúng.',
        'Mình đang yêu người đó theo cách hiện tại, hay mình đang giữ một phần của bản thân mình trong quá khứ.',
        'Anh học thêm, để kể em nhiều — Em học thêm, để hiểu những gì anh kể.',
        'Bất kể là mối quan hệ gì, khi người khác không cần. Bạn phải học cách thu hồi sự nhiệt tình và lịch sự rời đi.'
    ];
    var specialThoughtIndexes = [1, 7, 11];
    var thoughtsGuideNotice = null;
    var thoughtsGuideCloseTimer = null;
    var GUIDE_BIRTH_DATE = '17/04/2004';
    var GUIDE_BIRTH_DIGITS = '17042004';

    function sumDigits(value) {
        return String(value).replace(/\D/g, '').split('').reduce(function (total, digit) {
            return total + Number(digit);
        }, 0);
    }

    function getDigitSumExpression(value) {
        return String(value).replace(/\D/g, '').split('').join(' + ');
    }

    function reduceToSingleDigit(value) {
        var current = value;
        var steps = [];

        while (current >= 10) {
            var expression = getDigitSumExpression(current);
            current = sumDigits(current);
            steps.push(expression + ' = ' + current);
        }

        return {
            result: current,
            steps: steps
        };
    }

    function getThoughtsGuideMessage() {
        var currentDay = new Date().getDate();
        var birthSum = sumDigits(GUIDE_BIRTH_DIGITS);
        var total = birthSum + currentDay;
        var reduced = reduceToSingleDigit(total);
        var reductionRows = reduced.steps.map(function (step) {
            return '<p>' + step + '</p>';
        }).join('');

        return '' +
            '<h3>C&aacute;ch t&iacute;nh sai s&#7889;</h3>' +
            '<ol>' +
                '<li>C&#7897;ng t&#7845;t c&#7843; c&aacute;c ch&#7919; s&#7889; c&#7911;a ng&agrave;y sinh (dd/mm/yyyy).</li>' +
                '<li>C&#7897;ng th&ecirc;m ng&agrave;y hi&#7879;n t&#7841;i (' + currentDay + ').</li>' +
                '<li>N&#7871;u k&#7871;t qu&#7843; c&oacute; t&#7915; 2 ch&#7919; s&#7889; tr&#7903; l&ecirc;n, ti&#7871;p t&#7909;c c&#7897;ng c&aacute;c ch&#7919; s&#7889; c&#7911;a k&#7871;t qu&#7843; cho &#273;&#7871;n khi c&ograve;n 1 ch&#7919; s&#7889; duy nh&#7845;t.</li>' +
            '</ol>' +
            '<div class="thoughts-guide-notice__example">' +
                '<strong>V&iacute; d&#7909;</strong>' +
                '<p>Ng&agrave;y sinh: ' + GUIDE_BIRTH_DATE + '</p>' +
                '<p>T&#7893;ng c&aacute;c ch&#7919; s&#7889; ng&agrave;y sinh: ' + getDigitSumExpression(GUIDE_BIRTH_DIGITS) + ' = ' + birthSum + '</p>' +
                '<p>H&ocirc;m nay l&agrave; ng&agrave;y ' + currentDay + ':</p>' +
                '<p>' + birthSum + ' + ' + currentDay + ' = ' + total + '</p>' +
                '<p>R&uacute;t g&#7885;n:</p>' +
                reductionRows +
                '<p>K&#7871;t qu&#7843; cu&#7889;i c&ugrave;ng: ' + reduced.result + '</p>' +
            '</div>';
    }

    // Category config: map category key → display name
    var categories = {
        cooking: {
            title: 'Nấu ăn',
            images: []
        },
        thoughts: {
            title: 'Sai số thứ...',
            images: []
        },
        connections: {
            title: 'Bạn bè',
            images: []
        },
        daily: {
            title: 'Khoảnh khắc',
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
        if (thoughtsGuide) {
            thoughtsGuide.hidden = false;
        }
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
        if (thoughtsGuide) thoughtsGuide.hidden = true;
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

    function ensureThoughtsGuideNotice() {
        if (thoughtsGuideNotice) return thoughtsGuideNotice;

        thoughtsGuideNotice = document.createElement('div');
        thoughtsGuideNotice.className = 'thoughts-guide-notice';
        thoughtsGuideNotice.setAttribute('aria-hidden', 'true');
        thoughtsGuideNotice.innerHTML =
            '<div class="thoughts-guide-notice__backdrop"></div>' +
            '<article class="thoughts-guide-notice__card" role="dialog" aria-modal="true" aria-label="H&#432;&#7899;ng d&#7851;n">' +
                '<button type="button" class="thoughts-guide-notice__close" aria-label="&#272;&#243;ng">&times;</button>' +
                '<div class="thoughts-guide-notice__message"></div>' +
            '</article>';

        thoughtsGuideNotice.querySelector('.thoughts-guide-notice__backdrop').addEventListener('click', closeThoughtsGuideNotice);
        thoughtsGuideNotice.querySelector('.thoughts-guide-notice__close').addEventListener('click', closeThoughtsGuideNotice);
        document.body.appendChild(thoughtsGuideNotice);
        return thoughtsGuideNotice;
    }

    function openThoughtsGuideNotice() {
        var notice = ensureThoughtsGuideNotice();
        var messageEl = notice.querySelector('.thoughts-guide-notice__message');
        if (messageEl) messageEl.innerHTML = getThoughtsGuideMessage();
        clearTimeout(thoughtsGuideCloseTimer);
        notice.classList.remove('is-closing');
        notice.classList.add('is-open');
        notice.setAttribute('aria-hidden', 'false');
    }

    function closeThoughtsGuideNotice() {
        if (!thoughtsGuideNotice) return;
        thoughtsGuideNotice.classList.remove('is-open');
        thoughtsGuideNotice.classList.add('is-closing');
        thoughtsGuideNotice.setAttribute('aria-hidden', 'true');
        thoughtsGuideCloseTimer = setTimeout(function () {
            if (thoughtsGuideNotice) thoughtsGuideNotice.classList.remove('is-closing');
        }, 220);
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
                '<p class="thoughts-confirm__message">C&oacute; th&#7875; kh&ocirc;ng &#273;&uacute;ng v&#7899;i b&#7841;n, nh&#432;ng n&oacute; l&agrave; g&oacute;c nh&igrave;n t&#7915;ng tr&#7843;i c&#7911;a m&#236;nh.</p>' +
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

    if (thoughtsGuideBtn) {
        thoughtsGuideBtn.addEventListener('click', openThoughtsGuideNotice);
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
                createdAt: new Date().toISOString()
            };

            if (!data.name) {
                e.preventDefault();
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
            showLifeToast('Cảm ơn bạn đã góp ý');
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
            closeThoughtsGuideNotice();
        }
    });
})();
