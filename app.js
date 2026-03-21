/* ===========================
   LEARN N GROW — PREMIUM DARK
   =========================== */
(() => {
    'use strict';

    // ---- Shorthand ----
    const $ = (s, p = document) => p.querySelector(s);
    const $$ = (s, p = document) => [...p.querySelectorAll(s)];

    // ---- Mock Data ----
    const MOCK = {
        student: {
            name: 'Ritesh Singh',
            email: 'ritesh@example.com',
            phone: '+91 98765 43210',
            memberSince: 'January 2026',
        },
        stats: {
            // These will now be loaded from localStorage
            fluent: 0,
            khushi: 0,
            total: 0,
        },
        improvement: {
            labels: ['Tenses', 'Articles', 'Prepositions', 'Subject-Verb', 'Vocabulary', 'Sentence Structure'],
            // Initial mock data if nothing in storage
            data: [45, 30, 60, 55, 40, 50],
        },
        fluentResponses: [
            "That's a great question! The present perfect tense ('have done') connects the past to the present — it describes something that started in the past and is still relevant now. The past simple ('did') describes a completed action at a specific past time.\n\nFor example:\n• \"I have lived here for 5 years.\" (still living here)\n• \"I lived there in 2020.\" (no longer living there)",
            "Good observation! 'Since' is used with a specific point in time (since Monday, since 2020), while 'for' is used with a duration (for 3 days, for a year). Both are commonly used with the present perfect tense.",
            "Let me explain! 'Much' is used with uncountable nouns (much water, much time), while 'many' is used with countable nouns (many books, many people). A simple rule: if you can count it, use 'many'.",
            "The difference between 'affect' and 'effect': 'Affect' is usually a verb meaning to influence something. 'Effect' is usually a noun meaning the result. Remember: Affect = Action, Effect = End result.",
            "Great question about articles! Use 'a' before consonant sounds and 'an' before vowel sounds. 'The' is used when referring to something specific that both speaker and listener know about.",
        ],
        khushiResponses: [
            "That's wonderful to hear! Tell me more about your day. What did you do this morning? I'll help you express it naturally in English. 😊",
            "Nice try! Just a small correction — instead of saying \"I goed to the market\", you should say \"I went to the market\". 'Go' has an irregular past tense. Keep going, you're doing great!",
            "I love that you're practicing! Here's a more natural way to say that: \"I enjoy spending time with my friends on weekends.\" The key is using 'enjoy + verb-ing' for activities you like.",
            "That's a perfectly formed sentence! Your English is really improving. I noticed you used the correct tense and preposition. Let's try a slightly more complex sentence structure next.",
            "Interesting! When talking about your hobbies, you can say: \"I'm into reading\" or \"I'm passionate about cooking\". These sound more natural than just saying \"I like...\" all the time.",
        ],
    };

    // ---- State ----
    let currentUser = null;
    let currentPage = 'auth';
    let currentUid = null;
    let activityState = null;
    let activityEditingQuestionId = null;
    let pendingAccountActionToast = '';
    let toastTimer = null;
    let toastCleanupTimer = null;
    const modalControllers = {
        feedback: {
            open: () => { },
            close: () => { }
        },
        testSelector: {
            open: () => { },
            close: () => { }
        }
    };
    const PRIMARY_NAV_ITEMS = [
        {
            id: 'home',
            label: 'Home',
            icon: 'house',
            activeRoutes: ['dashboard'],
            action: () => navigateTo('dashboard')
        },
        {
            id: 'fluent',
            label: 'Fluent',
            icon: 'user',
            activeRoutes: ['chat-fluent'],
            action: () => navigateTo('chat-fluent')
        },
        {
            id: 'khushi',
            label: 'Khushi',
            icon: 'messages-square',
            activeRoutes: ['chat-khushi'],
            action: () => navigateTo('chat-khushi')
        },
        {
            id: 'test',
            label: 'Test',
            icon: 'clipboard-list',
            activeRoutes: ['activity-modals-have', 'activity-level-assessment'],
            action: () => openTestSelectorModal()
        },
        {
            id: 'feedback',
            label: 'Feedback',
            icon: 'message-square',
            activeRoutes: [],
            action: () => openFeedbackModal()
        }
    ];

    // ---- Safe Area Detection for Android WebView ----
    async function setSafeAreaInsets() {
        document.documentElement.classList.toggle('android-webview', /Android/i.test(navigator.userAgent));

        if (window.Capacitor?.isNativePlatform?.()) {
            try {
                const statusBar = window.Capacitor?.Plugins?.StatusBar;
                await statusBar?.setStyle?.({ style: 'LIGHT' });
            } catch (error) {
                console.debug('Status bar style sync skipped:', error);
            }
        }
    }

    // Run on DOM ready and resize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setSafeAreaInsets);
    } else {
        setSafeAreaInsets();
    }
    window.addEventListener('resize', setSafeAreaInsets);

    // ---- Announcements State ----
    let announcementsCache = [];
    let announcementsRefreshTimer = null;
    let announcementCalendarVisible = false;
    let announcementCalendarViewDate = null;
    const ANNOUNCEMENTS_REFRESH_MS = 60000;

    const ACTIVITY_ROUTE_TO_SET = {
        'activity-modals-have': 'modals_have_v1',
        'activity-level-assessment': 'level_assessment_v1'
    };
    let ACTIVITY_SET_ID = ACTIVITY_ROUTE_TO_SET['activity-modals-have'];
    const ACTIVITY_VERSION = 1;
    const VALID_APP_PAGES = new Set([
        'auth',
        'dashboard',
        'chat-fluent',
        'chat-khushi',
        'activity-modals-have',
        'activity-level-assessment',
        'profile'
    ]);

    function normalizeRoute(page) {
        return VALID_APP_PAGES.has(page) ? page : null;
    }

    function shouldShowPrimaryNav(page = currentPage) {
        return !!currentUser && page === 'dashboard';
    }

    function openFeedbackModal() {
        modalControllers.feedback.open();
    }

    function openTestSelectorModal() {
        modalControllers.testSelector.open();
    }

    function schedulePrimaryNavLayoutSync() {
        requestAnimationFrame(() => {
            requestAnimationFrame(syncPrimaryNavLayout);
        });
    }

    function syncPrimaryNavLayout() {
        const shell = $('#primary-nav-shell');
        if (!shell) return;

        const rootStyle = document.documentElement.style;
        if (!shell.classList.contains('active')) {
            rootStyle.setProperty('--primary-nav-clearance', '0px');
            return;
        }

        const shellStyles = window.getComputedStyle(shell);
        const shellBottom = parseFloat(shellStyles.bottom) || 0;
        const shellHeight = shell.getBoundingClientRect().height || shell.offsetHeight || 0;
        const clearance = Math.ceil(shellBottom + shellHeight + 16);
        rootStyle.setProperty('--primary-nav-clearance', `${clearance}px`);
    }

    function renderPrimaryNav() {
        const nav = $('#primary-nav');
        if (!nav) return;

        nav.innerHTML = PRIMARY_NAV_ITEMS.map((item, index) => `
            <button class="primary-nav-item" type="button" data-nav-id="${item.id}" data-nav-index="${index}" aria-label="${item.label}" style="--nav-order:${index};">
                <span class="primary-nav-icon">
                    <i data-lucide="${item.icon}"></i>
                </span>
                <span class="primary-nav-label">${item.label}</span>
            </button>
        `).join('');

        $$('.primary-nav-item', nav).forEach(button => {
            button.addEventListener('click', () => {
                const item = PRIMARY_NAV_ITEMS.find(entry => entry.id === button.dataset.navId);
                item?.action?.();
            });
        });

        if (window.lucide) {
            lucide.createIcons({ nodes: [nav] });
        }

        syncPrimaryNavState(currentPage);
        schedulePrimaryNavLayoutSync();
    }

    function syncPrimaryNavState(page = currentPage) {
        const shell = $('#primary-nav-shell');
        if (!shell) return;

        const isVisible = shouldShowPrimaryNav(page);
        shell.classList.toggle('active', isVisible);
        document.body.classList.toggle('has-primary-nav', isVisible);

        $$('.primary-nav-item', shell).forEach(button => {
            const item = PRIMARY_NAV_ITEMS.find(entry => entry.id === button.dataset.navId);
            const isActive = !!item?.activeRoutes?.includes(page);
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        const activeIndex = PRIMARY_NAV_ITEMS.findIndex(item => item.activeRoutes.includes(page));
        const nav = $('#primary-nav', shell);
        if (nav) {
            nav.style.setProperty('--primary-nav-index', `${Math.max(activeIndex, 0)}`);
        }

        schedulePrimaryNavLayoutSync();
    }

    function getRouteFromHash() {
        return normalizeRoute(window.location.hash.replace(/^#/, '').trim());
    }

    function getInitialAuthenticatedRoute() {
        const requestedRoute = getRouteFromHash();
        if (!requestedRoute || requestedRoute === 'auth') return 'dashboard';
        return requestedRoute;
    }

    function updateHistoryForPage(page, replaceHistory = false) {
        const nextHash = `#${page}`;
        const currentHash = window.location.hash || '#';
        const currentStatePage = history.state?.lgPage || null;

        if (!replaceHistory && currentHash === nextHash && currentStatePage === page) return;

        const method = replaceHistory ? 'replaceState' : 'pushState';
        history[method]({ lgPage: page }, '', nextHash);
    }

    function initAppHistory() {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        window.addEventListener('popstate', event => {
            const requestedRoute = normalizeRoute(event.state?.lgPage) || getRouteFromHash() || 'auth';
            const nextRoute = currentUser ? requestedRoute : 'auth';
            navigateTo(nextRoute, {
                skipHistory: true,
                skipSessionIncrement: true
            });
        });
    }

    // ---- Firestore Helpers ----
    function getUserDocRef() {
        if (!currentUid) return null;
        return db.collection('users').doc(currentUid);
    }

    async function loadUserData(firebaseUser) {
        const ref = getUserDocRef();
        if (!ref) return null;
        try {
            const doc = await ref.get();
            if (doc.exists) {
                return doc.data();
            } else {
                // First time user — create document with defaults
                const storedPhone = localStorage.getItem('temp_signup_phone');
                const storedFirst = localStorage.getItem('temp_signup_firstname');
                const storedLast = localStorage.getItem('temp_signup_lastname');

                const defaults = {
                    fluentSessions: 0,
                    khushiSessions: 0,
                    profilePhoto: '',
                    phone: storedPhone || '',
                    firstName: storedFirst || '',
                    lastName: storedLast || ''
                };

                // Clear temp storage
                clearTempSignupStorage();

                await ref.set(defaults);

                // Trigger n8n webhook for new user onboarding
                if (firebaseUser) {
                    sendUserToN8N(firebaseUser, defaults.phone, defaults.firstName, defaults.lastName);
                }

                return defaults;
            }
        } catch (err) {
            console.error('Firestore read error:', err);
            return null;
        }
    }

    // ---- n8n Webhook Integration ----
    function sendUserToN8N(user, phoneOverride = '', firstName = '', lastName = '') {
        // Replace this URL with your actual n8n webhook URL
        const WEBHOOK_URL = 'https://n8n.ritesh-ai-automation.in/webhook/new-user';

        const payload = {
            uid: user.uid,
            email: user.email,
            firstName: firstName || user.displayName?.split(' ')[0] || '',
            lastName: lastName || user.displayName?.split(' ').slice(1).join(' ') || '',
            phoneNumber: phoneOverride || user.phoneNumber || '',
            metadata: {
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime
            },
            registeredDate: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (response.ok) {
                    console.log('Successfully sent user data to n8n');
                } else {
                    console.error('Failed to send user data to n8n:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error sending user data to n8n:', error);
            });
    }

    async function updateUserData(fields) {
        const ref = getUserDocRef();
        if (!ref) return;
        try {
            await ref.set(fields, { merge: true });
        } catch (err) {
            console.error('Firestore write error:', err);
        }
    }

    function clearTempSignupStorage() {
        localStorage.removeItem('temp_signup_phone');
        localStorage.removeItem('temp_signup_firstname');
        localStorage.removeItem('temp_signup_lastname');
    }

    async function deleteCurrentAccount(password) {
        const authUser = auth.currentUser;
        if (!authUser) {
            throw new Error('No active account found.');
        }

        if (!authUser.email) {
            throw new Error('Account deletion is only available for email/password accounts right now.');
        }

        const credential = firebase.auth.EmailAuthProvider.credential(authUser.email, password);
        await authUser.reauthenticateWithCredential(credential);
        await db.collection('users').doc(authUser.uid).delete();
        clearTempSignupStorage();
        await authUser.delete();
        pendingAccountActionToast = 'Account deleted permanently.';
    }

    // ---- Daily Content (Local Static) ----
    async function fetchDailyContent() {
        const today = new Date();
        const dateDisplay = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

        const dateEl = document.getElementById('vocab-date');
        if (dateEl) dateEl.textContent = dateDisplay;

        // Deterministic Index based on days since epoch (Jan 1, 2024)
        const startEpoch = new Date('2024-01-01').getTime();
        const currentEpoch = today.getTime();
        const daysSince = Math.floor((currentEpoch - startEpoch) / (1000 * 60 * 60 * 24));

        // 1. Daily Tip
        if (typeof DAILY_TIPS !== 'undefined' && DAILY_TIPS.length > 0) {
            const tipIndex = daysSince % DAILY_TIPS.length;
            const dailyTip = DAILY_TIPS[tipIndex];

            const tipTitle = document.getElementById('tip-title');
            const tipContent = document.getElementById('tip-content');
            if (tipTitle) tipTitle.textContent = dailyTip.title;
            if (tipContent) tipContent.textContent = dailyTip.content;
        }

        // 2. Daily Vocabulary (5 words)
        if (typeof VOCABULARY_POOL !== 'undefined' && VOCABULARY_POOL.length > 0) {
            const vocabList = document.getElementById('vocab-list');
            if (vocabList) {
                // Random Vocabulary Generator (Seeded by Date)
                // Goal: Display 5 random words each day, consistent for everyone on that date.

                // Mulberry32 - A high-quality pseudo-random number generator
                function mulberry32(a) {
                    return function () {
                        var t = a += 0x6D2B79F5;
                        t = Math.imul(t ^ t >>> 15, t | 1);
                        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                        return ((t ^ t >>> 14) >>> 0) / 4294967296;
                    }
                }

                const indices = [];
                // Use daysSince as the seed so the "random" set is fixed for the entire day
                const seed = daysSince;
                const rand = mulberry32(seed);

                // Pick 5 unique random words from the pool
                const count = Math.min(5, VOCABULARY_POOL.length);
                let attempts = 0;
                while (indices.length < count && attempts < 100) {
                    const idx = Math.floor(rand() * VOCABULARY_POOL.length);
                    if (!indices.includes(idx)) {
                        indices.push(idx);
                    }
                    attempts++;
                }

                const dailyVocab = indices.map(i => VOCABULARY_POOL[i]);

                vocabList.innerHTML = dailyVocab.map(item => `
                    <div class="vocab-item">
                        <div class="vocab-word">${item.word}</div>
                        <div class="vocab-dash">—</div>
                        <div class="vocab-meaning">${item.definition}</div>
                    </div>
                `).join('');
            }
        }
    }

    function syncAppViewportHeight() {
        const viewport = window.visualViewport;
        const viewportHeight = viewport ? viewport.height : window.innerHeight;
        const viewportOffsetTop = viewport ? viewport.offsetTop : 0;
        const keyboardInset = viewport
            ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop)
            : 0;

        document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`);
        document.documentElement.style.setProperty('--app-offset-top', `${Math.round(viewportOffsetTop)}px`);
        document.documentElement.style.setProperty('--keyboard-inset', `${Math.round(keyboardInset)}px`);
        document.documentElement.style.removeProperty('--app-status-bar');
        document.documentElement.style.removeProperty('--app-nav-bar');
        return keyboardInset;
    }

    function initMobileChatViewport() {
        const chatInputSelector = '#chat-input-fluent, #chat-input-khushi';
        const keyboardOpenThreshold = 120;
        let currentKeyboardInset = 0;

        const syncViewportState = () => {
            currentKeyboardInset = syncAppViewportHeight();
            return currentKeyboardInset;
        };

        const syncKeyboardState = (keyboardInset = currentKeyboardInset) => {
            const activeEl = document.activeElement;
            const isChatInputFocused = !!(activeEl && activeEl.matches?.(chatInputSelector));
            const activeChatPage = document.querySelector('.chat-page.active');
            const isKeyboardOpen = isChatInputFocused && keyboardInset > keyboardOpenThreshold;

            $$('.chat-page').forEach(page => page.classList.remove('keyboard-open'));

            if (!activeChatPage || !isChatInputFocused) return;
            if (isKeyboardOpen) {
                activeChatPage.classList.add('keyboard-open');
            }

            const botType = activeEl.id.includes('khushi') ? 'khushi' : 'fluent';
            requestAnimationFrame(() => scrollChat(botType));
        };

        syncViewportState();

        window.addEventListener('resize', () => {
            syncViewportState();
            syncKeyboardState();
        }, { passive: true });
        window.addEventListener('resize', schedulePrimaryNavLayoutSync, { passive: true });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                syncViewportState();
                syncKeyboardState();
                syncPrimaryNavLayout();
            }, 120);
        }, { passive: true });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', () => {
                syncViewportState();
                syncKeyboardState();
                syncPrimaryNavLayout();
            });
            window.visualViewport.addEventListener('scroll', () => {
                syncViewportState();
                syncKeyboardState();
                syncPrimaryNavLayout();
            });
        }

        document.addEventListener('focusin', event => {
            if (!event.target.matches?.(chatInputSelector)) return;
            setTimeout(() => {
                syncViewportState();
                syncKeyboardState();
            }, 60);
        });

        document.addEventListener('focusout', event => {
            if (!event.target.matches?.(chatInputSelector)) return;
            setTimeout(() => {
                syncViewportState();
                syncKeyboardState();
            }, 120);
        });

        // Add scroll effect for nav bar scrim
        const topNav = document.querySelector('.top-nav');
        if (topNav) {
            const handleScroll = () => {
                const scrollY = window.scrollY || window.pageYOffset;
                if (scrollY > 10) {
                    topNav.classList.add('scrolled');
                } else {
                    topNav.classList.remove('scrolled');
                }
            };
            window.addEventListener('scroll', handleScroll, { passive: true });
            handleScroll(); // Initial check
        }

        if (document.fonts?.ready) {
            document.fonts.ready.then(() => {
                schedulePrimaryNavLayoutSync();
            }).catch(() => { });
        }
    }

    // ---- Init ----
    document.addEventListener('DOMContentLoaded', () => {
        initMobileChatViewport();
        renderPrimaryNav();
        lucide.createIcons();
        initAuth();
        initNav();
        initAppHistory();
        initActivity();
        initChat();
        initVoice();
        initFeedback();
        initTestSelector();
        initProfile();
        initAnnouncementBar();
        initScrollAnimations();
        fetchDailyContent();
        checkSession();
    });

    // ---- Session ----
    function hideAppLoader() {
        const loader = document.getElementById('app-loader');
        if (!loader) return;
        loader.classList.add('fade-out');
        setTimeout(() => loader.remove(), 320);
    }

    function checkSession() {
        // Firebase handles session automatically
        auth.onAuthStateChanged(async user => {
            if (user) {
                currentUid = user.uid;
                currentUser = {
                    uid: user.uid,
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    phone: user.photoURL || '',
                    activityProgress: {}
                };

                // Load user data from Firestore
                const userData = await loadUserData(user);
                if (userData) {
                    currentUser.fluentSessions = userData.fluentSessions || 0;
                    currentUser.khushiSessions = userData.khushiSessions || 0;
                    currentUser.profilePhoto = userData.profilePhoto || '';
                    currentUser.activityProgress = userData.activityProgress || {};

                    // Use Firestore name if available (overrides Auth displayName/email)
                    if (userData.firstName) {
                        const full = [userData.firstName, userData.lastName].filter(Boolean).join(' ');
                        if (full) currentUser.name = full;
                    }
                }

                navigateTo(getInitialAuthenticatedRoute(), {
                    replaceHistory: true,
                    skipSessionIncrement: true
                });
            } else {
                currentUser = null;
                currentUid = null;
                activityState = null;
                activityEditingQuestionId = null;
                stopAnnouncementsAutoRefresh();
                navigateTo('auth', {
                    replaceHistory: true,
                    skipSessionIncrement: true
                });
                if (pendingAccountActionToast) {
                    showToast(pendingAccountActionToast);
                    pendingAccountActionToast = '';
                }
            }

            // Auth state resolved — hide the loader
            hideAppLoader();
        });
    }

    // saveSession is no longer needed as Firebase persists state
    // But we keep a helper for logout
    function logout() {
        auth.signOut().then(() => {
            showToast('Signed out');
        }).catch(err => {
            console.error(err);
            showToast('Error signing out');
        });
    }

    // ---- Navigation ----
    function navigateTo(page, options = {}) {
        const {
            replaceHistory = false,
            skipHistory = false,
            skipSessionIncrement = false
        } = options;
        page = normalizeRoute(page) || (currentUser ? 'dashboard' : 'auth');
        const isActivityPage = page === 'activity-modals-have' || page === 'activity-level-assessment';
        if (page === 'activity-level-assessment') {
            ACTIVITY_SET_ID = ACTIVITY_ROUTE_TO_SET[page];
        }
        if (page === 'activity-modals-have') {
            const currentSet = typeof ACTIVITY_SETS !== 'undefined' ? ACTIVITY_SETS[ACTIVITY_SET_ID] : null;
            if (!currentSet || currentSet.group !== 'test_series') {
                ACTIVITY_SET_ID = ACTIVITY_ROUTE_TO_SET[page] || ACTIVITY_ROUTE_TO_SET['activity-modals-have'];
            }
        }

        // Both activity routes share the same visual page shell.
        const pageTarget = isActivityPage ? 'activity-modals-have' : page;
        const isChatPage = page === 'chat-fluent' || page === 'chat-khushi';
        document.body.classList.toggle('chat-open', isChatPage);

        // Hide all pages
        $$('.auth-page, .page, .chat-page, .profile-page').forEach(el => el.classList.remove('active'));

        // Show target
        const target = $(`#page-${pageTarget}`);
        if (target) {
            target.classList.add('active');
            currentPage = page;
            document.body.dataset.page = page;
            if (!skipHistory) {
                updateHistoryForPage(page, replaceHistory);
            }
        }

        if (page !== 'dashboard') {
            $('#announcement-popup')?.classList.remove('open');
            setAnnouncementCalendarVisible(false);
        }

        syncAppViewportHeight();
        syncPrimaryNavState(page);

        // Page-specific init
        if (page === 'dashboard') {
            loadStats();
            populateDashboard();
            // Re-trigger scroll animations
            setTimeout(() => triggerScrollAnimations(), 100);
        }
        if (page === 'chat-fluent' && !skipSessionIncrement) {
            incrementSession('fluent');
        }
        if (page === 'chat-khushi' && !skipSessionIncrement) {
            incrementSession('khushi');
        }
        if (isActivityPage) {
            openActivityPage();
        }
        if (page === 'profile') {
            populateProfile();
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }
    window.navigateTo = navigateTo;

    function activityBackClick() {
        if (activityState && activityState.status === 'in_progress') {
            $('#leave-test-modal')?.classList.add('open');
        } else {
            navigateTo('dashboard');
        }
    }
    window.activityBackClick = activityBackClick;

    // ---- Auth ----
    function initAuth() {
        // Tab switching
        $$('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                $$('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const target = tab.dataset.tab;
                $$('.auth-form').forEach(f => f.classList.remove('active'));
                $(`#form-${target}`).classList.add('active');
            });
        });

        // Login
        $('#form-login').addEventListener('submit', e => {
            e.preventDefault();
            const email = $('#login-email').value.trim();
            const pass = $('#login-password').value.trim();

            let valid = true;
            if (!email) { $('#login-email').closest('.form-group').classList.add('error'); valid = false; }
            else { $('#login-email').closest('.form-group').classList.remove('error'); }
            if (!pass) { $('#login-password').closest('.form-group').classList.add('error'); valid = false; }
            else { $('#login-password').closest('.form-group').classList.remove('error'); }

            if (!valid) return;

            // Firebase Login
            auth.signInWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    // Success - onAuthStateChanged will handle navigation
                    showToast('Welcome back!');
                })
                .catch((error) => {
                    const message = getFriendlyErrorMessage(error.code);
                    showToast(message);
                    console.error(error.code, error.message);
                });
        });

        // Signup
        $('#form-signup').addEventListener('submit', e => {
            e.preventDefault();
            const firstName = $('#signup-firstname').value.trim();
            const lastName = $('#signup-lastname').value.trim();
            const name = `${firstName} ${lastName}`.trim();
            const email = $('#signup-email').value.trim();
            const phone = $('#signup-phone').value.trim();
            const pass = $('#signup-password').value.trim();
            const confirm = $('#signup-confirm').value.trim();

            let valid = true;
            const check = (id, cond) => {
                const el = $(`#${id}`).closest('.form-group');
                if (!cond) { el.classList.add('error'); valid = false; }
                else { el.classList.remove('error'); }
            };

            check('signup-firstname', firstName.length > 0);
            check('signup-lastname', lastName.length > 0);
            check('signup-email', email.includes('@'));
            check('signup-phone', phone.length >= 10);
            check('signup-password', pass.length >= 6);
            check('signup-confirm', confirm === pass && confirm.length > 0);

            if (!valid) return;

            // Firebase Signup
            auth.createUserWithEmailAndPassword(email, pass)
                .then((userCredential) => {
                    // Signed in 
                    const user = userCredential.user;

                    // Store details temporarily for onboarding (to avoid race conditions with updateProfile)
                    if (phone) localStorage.setItem('temp_signup_phone', phone);
                    if (firstName) localStorage.setItem('temp_signup_firstname', firstName);
                    if (lastName) localStorage.setItem('temp_signup_lastname', lastName);

                    // Update profile with name
                    user.updateProfile({
                        displayName: name
                    }).then(() => {
                        // Profile updated
                        // onAuthStateChanged will handle navigation
                        showToast('Account created successfully');
                    }).catch((error) => {
                        console.error("Error updates profile", error);
                    });
                })
                .catch((error) => {
                    const message = getFriendlyErrorMessage(error.code);
                    showToast(message);
                    console.error(error.code, error.message);
                });
        });

        // Clear error on focus
        $$('.input-field').forEach(input => {
            input.addEventListener('focus', () => {
                input.closest('.form-group')?.classList.remove('error');
            });
        });

        // Forgot Password
        const forgotLink = $('#forgot-password-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const email = $('#login-email').value.trim();

                if (!email) {
                    showToast('Please enter your email first.');
                    $('#login-email').focus();
                    return;
                }

                showToast('Sending reset link...');

                try {
                    await auth.sendPasswordResetEmail(email);
                    showToast('Reset link sent! Check your email inbox.');
                } catch (error) {
                    console.error('Password reset error:', error);
                    const message = getFriendlyErrorMessage(error.code);
                    showToast(message);
                }
            });
        }
    }

    function getLocalDateKey(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getLocalStartOfDay(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function getUpcomingAnnouncementMap() {
        const map = new Map();
        const todayStart = getLocalStartOfDay(new Date()).getTime();

        announcementsCache.forEach(announcement => {
            if (!(announcement?.date instanceof Date) || Number.isNaN(announcement.date.getTime())) return;

            const eventDay = getLocalStartOfDay(announcement.date);
            if (eventDay.getTime() < todayStart) return;

            const key = getLocalDateKey(eventDay);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(announcement);
        });

        return map;
    }

    function getAnnouncementCalendarDefaultMonth() {
        const todayStart = getLocalStartOfDay(new Date()).getTime();
        const upcoming = announcementsCache
            .filter(a => a?.date instanceof Date && !Number.isNaN(a.date.getTime()))
            .map(a => getLocalStartOfDay(a.date))
            .filter(date => date.getTime() >= todayStart)
            .sort((a, b) => a - b);

        const baseDate = upcoming[0] || new Date();
        return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    }

    function renderAnnouncementCalendar() {
        const card = $('#announcement-calendar-card');
        const monthLabel = $('#announcement-calendar-month');
        const daysGrid = $('#announcement-calendar-days');
        if (!card || !monthLabel || !daysGrid) return;
        if (!announcementCalendarVisible) return;

        if (!(announcementCalendarViewDate instanceof Date) || Number.isNaN(announcementCalendarViewDate.getTime())) {
            announcementCalendarViewDate = getAnnouncementCalendarDefaultMonth();
        }

        const year = announcementCalendarViewDate.getFullYear();
        const month = announcementCalendarViewDate.getMonth();
        const firstOfMonth = new Date(year, month, 1);
        const firstWeekday = firstOfMonth.getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        monthLabel.textContent = firstOfMonth.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const todayKey = getLocalDateKey(new Date());
        const upcomingMap = getUpcomingAnnouncementMap();
        let html = '';

        for (let i = 0; i < 42; i += 1) {
            let dayNumber = 0;
            let dateObj = null;
            let isOtherMonth = false;

            if (i < firstWeekday) {
                dayNumber = daysInPrevMonth - firstWeekday + i + 1;
                dateObj = new Date(year, month - 1, dayNumber);
                isOtherMonth = true;
            } else if (i >= firstWeekday + daysInMonth) {
                dayNumber = i - (firstWeekday + daysInMonth) + 1;
                dateObj = new Date(year, month + 1, dayNumber);
                isOtherMonth = true;
            } else {
                dayNumber = i - firstWeekday + 1;
                dateObj = new Date(year, month, dayNumber);
            }

            const dayKey = getLocalDateKey(dateObj);
            const dayAnnouncements = upcomingMap.get(dayKey) || [];

            const classes = ['calendar-day'];
            if (isOtherMonth) classes.push('other-month');
            if (dayKey === todayKey) classes.push('today');
            if (dayAnnouncements.length > 0) classes.push('has-announcement');

            const title = dayAnnouncements.length > 0
                ? ` title="${escapeHTML(dayAnnouncements.map(item => item.title).join(' • '))}"`
                : '';

            html += `<div class="${classes.join(' ')}"${title}><span>${dayNumber}</span>${dayAnnouncements.length > 0 ? '<span class="calendar-day-dot"></span>' : ''}</div>`;
        }

        daysGrid.innerHTML = html;
    }

    function setAnnouncementCalendarVisible(visible, resetMonth = false) {
        const card = $('#announcement-calendar-card');
        if (!card) return;

        announcementCalendarVisible = !!visible;
        if (announcementCalendarVisible && resetMonth) {
            announcementCalendarViewDate = getAnnouncementCalendarDefaultMonth();
        }

        card.style.display = announcementCalendarVisible ? 'block' : 'none';

        if (announcementCalendarVisible) {
            renderAnnouncementCalendar();
        }
    }

    function shiftAnnouncementCalendarMonth(offset) {
        if (!(announcementCalendarViewDate instanceof Date) || Number.isNaN(announcementCalendarViewDate.getTime())) {
            announcementCalendarViewDate = getAnnouncementCalendarDefaultMonth();
        }

        announcementCalendarViewDate = new Date(
            announcementCalendarViewDate.getFullYear(),
            announcementCalendarViewDate.getMonth() + offset,
            1
        );
        renderAnnouncementCalendar();
    }

    // ---- Top Nav ----
    function initNav() {
        const trigger = $('#nav-profile-trigger');
        const dropdown = $('#profile-dropdown');

        trigger.addEventListener('click', e => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });

        $('#nav-profile-link').addEventListener('click', e => {
            e.preventDefault();
            dropdown.classList.remove('open');
            navigateTo('profile');
        });

        $('#nav-logout').addEventListener('click', e => {
            e.preventDefault();
            logout();
        });

        // ---- Announcement Bell ----
        const bellBtn = $('#announcement-bell');
        const bellPopup = $('#announcement-popup');
        const bellPopupClose = $('#announcement-popup-close');
        const calendarCard = $('#announcement-calendar-card');
        const calendarPrevBtn = $('#announcement-calendar-prev');
        const calendarNextBtn = $('#announcement-calendar-next');

        if (bellBtn && bellPopup) {
            const closeAnnouncementUi = () => {
                bellPopup.classList.remove('open');
                setAnnouncementCalendarVisible(false);
            };

            bellBtn.addEventListener('click', e => {
                e.stopPropagation();
                const shouldOpen = !bellPopup.classList.contains('open');
                bellPopup.classList.toggle('open', shouldOpen);
                setAnnouncementCalendarVisible(shouldOpen && announcementsCache.length > 0, true);
                // Close profile dropdown if open
                if (dropdown) dropdown.classList.remove('open');
            });

            if (bellPopupClose) {
                bellPopupClose.addEventListener('click', closeAnnouncementUi);
            }

            document.addEventListener('click', closeAnnouncementUi);

            bellPopup.addEventListener('click', e => {
                e.stopPropagation();
            });

            if (calendarCard) {
                calendarCard.addEventListener('click', e => {
                    e.stopPropagation();
                });
            }

            if (calendarPrevBtn) {
                calendarPrevBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    shiftAnnouncementCalendarMonth(-1);
                });
            }

            if (calendarNextBtn) {
                calendarNextBtn.addEventListener('click', e => {
                    e.stopPropagation();
                    shiftAnnouncementCalendarMonth(1);
                });
            }
        }
    }

    // ---- Update Announcement Badge ----
    function updateAnnouncementBadge() {
        const badge = $('#announcement-badge');
        const bell = $('#announcement-bell');
        if (!badge || !bell) return;

        const count = announcementsCache.length;
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'flex';
            bell.style.display = 'flex';
        } else {
            // For testing: show bell with "!" if no announcements
            // In production, you can hide it: badge.style.display = 'none';
            badge.style.display = 'none';
            bell.style.display = 'flex'; // Always show bell for testing
        }
    }

    // ---- Populate Announcement Popup ----
    function populateAnnouncementPopup() {
        const popupList = $('#announcement-popup-list');
        const popupEmpty = $('#announcement-popup-empty');
        if (!popupList || !popupEmpty) return;

        if (announcementsCache.length === 0) {
            popupList.style.display = 'none';
            popupEmpty.style.display = 'block';
            return;
        }

        popupList.style.display = 'block';
        popupEmpty.style.display = 'none';

        popupList.innerHTML = announcementsCache.map(a => {
            const date = new Date(a.date);
            const dateStr = date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
            return `
                <div class="announcement-popup-item" onclick="showAnnouncementDetail('${escapeHTML(a.id)}')">
                    <div class="announcement-popup-item-title">${escapeHTML(a.title)}</div>
                    <div class="announcement-popup-item-message">${escapeHTML(a.message)}</div>
                    <div class="announcement-popup-item-date">${dateStr}</div>
                </div>
            `;
        }).join('');
    }

    // ---- Show Announcement Detail ----
    window.showAnnouncementDetail = function(id) {
        const announcement = announcementsCache.find(a => a.id === id);
        if (!announcement) return;

        const date = new Date(announcement.date);
        const dateStr = date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Create a simple alert for now - could be upgraded to a modal
        alert(`${announcement.title}\n\n${announcement.message}\n\nDate: ${dateStr}`);
    };

    // ---- Activity (Self Assessment + Test Series) ----
    const N8N_ACTIVITY_REPORT_WEBHOOK = 'https://n8n.ritesh-ai-automation.in/webhook/activity-modals-report';
    const ACTIVITY_MODAL_OPTIONS = [
        'could have',
        "couldn't have",
        'should have',
        "shouldn't have",
        'would have',
        "wouldn't have"
    ];
    const ACTIVITY_CONTEXT_STYLES = {
        'past possibility': { bg: 'bg-blue', text: 'text-blue', border: 'border-blue' },
        'past negative possibility': { bg: 'bg-purple', text: 'text-purple', border: 'border-purple' },
        'past advice / regret': { bg: 'bg-green', text: 'text-green', border: 'border-green' },
        'past negative advice / regret': { bg: 'bg-red', text: 'text-red', border: 'border-red' },
        'past willingness': { bg: 'bg-orange', text: 'text-orange', border: 'border-orange' },
        'Section A: Grammar': { bg: 'bg-blue', text: 'text-blue', border: 'border-blue' },
        'Section B: Vocabulary': { bg: 'bg-purple', text: 'text-purple', border: 'border-purple' },
        'Section C: Sentence Skills': { bg: 'bg-green', text: 'text-green', border: 'border-green' },
        'Section D: Reading Comprehension': { bg: 'bg-orange', text: 'text-orange', border: 'border-orange' },
        default: { bg: 'bg-blue', text: 'text-blue', border: 'border-blue' }
    };
    const ACTIVITY_HINTS = {
        'past possibility': "Use 'could have + past participle' for something that was possible but did not happen.",
        'past negative possibility': "Use 'couldn't have + past participle' for something that was not possible.",
        'past advice / regret': "Use 'should have + past participle' for something that would have been better to do.",
        'past negative advice / regret': "Use 'shouldn't have + past participle' for something that was a mistake.",
        'past willingness': "Use 'would have + past participle' for willingness blocked by circumstances."
    };

    function getActivitySet() {
        if (typeof ACTIVITY_SETS === 'undefined') return null;
        return ACTIVITY_SETS[ACTIVITY_SET_ID] || null;
    }

    function getTestSeriesSets() {
        if (typeof ACTIVITY_SETS === 'undefined') return [];
        return Object.values(ACTIVITY_SETS)
            .filter(set => set && set.group === 'test_series')
            .sort((a, b) => {
                const orderDiff = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
                if (orderDiff !== 0) return orderDiff;
                return (a.title || '').localeCompare(b.title || '');
            });
    }

    function isModalsActivity(set = getActivitySet()) {
        return !!set && set.id === 'modals_have_v1';
    }

    function isReportEnabled(set = getActivitySet()) {
        if (!set) return false;
        return set.reportEnabled !== false;
    }

    function getQuestionType(question) {
        if (!question) return 'fill_blank';
        if (question.expectedPhrase) return 'modal_phrase';
        return question.type || 'fill_blank';
    }

    function getQuestionContextLabel(question, set = getActivitySet()) {
        if (!question || !set) return 'Question';
        if (isModalsActivity(set)) return question.category || 'Past Modals';

        const section = Array.isArray(set.sections)
            ? set.sections.find(s => Array.isArray(s.questions) && s.questions.includes(question.id))
            : null;
        return section?.name || question.category || set.contextLabel || set.navTitle || set.title || 'Practice';
    }

    function getContextStyle(label) {
        return ACTIVITY_CONTEXT_STYLES[label] || ACTIVITY_CONTEXT_STYLES.default;
    }

    function getExpectedAnswerText(question) {
        if (!question) return '';

        const type = getQuestionType(question);
        if (type === 'modal_phrase') return question.expectedPhrase || '';
        if (question.displayAnswer) return question.displayAnswer;

        if (type === 'multiple_choice' && Array.isArray(question.options) && Number.isInteger(question.correctAnswer)) {
            return question.options[question.correctAnswer] || '';
        }

        if (typeof question.correctAnswer === 'string') return question.correctAnswer;
        if (Array.isArray(question.normalizedAnswers) && question.normalizedAnswers.length > 0) {
            return question.normalizedAnswers[0];
        }
        return '';
    }

    function getActivityTopicLabel(set = getActivitySet()) {
        if (!set) return '';
        return String(set.contextLabel || set.navTitle || set.title || '').toLowerCase();
    }

    function getQuestionOptionSummary(question) {
        if (!Array.isArray(question?.options) || question.options.length === 0) return '';
        return question.options.map(option => String(option)).join(' / ');
    }

    function getPromptTimeClue(prompt = '') {
        const normalizedPrompt = String(prompt).toLowerCase();
        const timeClues = [
            'right now',
            'yesterday evening',
            'yesterday',
            'last night',
            'last weekend',
            'since 2022',
            'since last year',
            'since yesterday',
            'this week',
            'this month',
            'every day',
            'every morning',
            'every winter',
            'by next week',
            'by tomorrow evening',
            'by tomorrow',
            'by 2030',
            'tomorrow at noon',
            'tomorrow',
            'when the guests arrived',
            'when the thief came',
            'during the storm'
        ];

        return timeClues.find(clue => normalizedPrompt.includes(clue)) || '';
    }

    function getGeneratedQuestionHint(question, set = getActivitySet()) {
        if (!question || !set) return 'Review the sentence carefully and choose the best answer.';

        const topic = getActivityTopicLabel(set);
        const type = getQuestionType(question);
        const optionsSummary = getQuestionOptionSummary(question);
        const verbHint = extractVerbFromPrompt(question.prompt);
        const timeClue = getPromptTimeClue(question.prompt);

        if (type === 'fill_blank') {
            if (topic.includes('subject-verb')) {
                const verbPart = verbHint ? ` Use the correct form of "${verbHint}"` : '';
                return `Find the main subject before the blank and ignore extra phrases like "of", "along with", or "as well as".${verbPart} so it agrees with the subject.`;
            }

            if (topic.includes('mix tenses')) {
                const cluePart = timeClue ? ` The time clue "${timeClue}" tells you which tense to use.` : '';
                const verbPart = verbHint ? ` Write the correct tense form of "${verbHint}".` : '';
                return `Look for the time marker and decide whether the sentence talks about the present, past, or future.${cluePart}${verbPart}`;
            }

            const verbPart = verbHint ? ` Use the correct form of "${verbHint}".` : '';
            return `Read the whole sentence for grammar clues before filling the blank.${verbPart}`;
        }

        if (type === 'multiple_choice') {
            if (topic.includes('pronoun')) {
                return `Check what job the blank is doing in the sentence: subject, object, possession, or reflexive form. Then choose from ${optionsSummary}.`;
            }

            if (topic.includes('adjectives and adverbs')) {
                return `Decide whether the blank needs a describing word, an adverb, or a comparative/superlative form. Then choose from ${optionsSummary}.`;
            }

            if (topic.includes('preposition')) {
                return `Focus on the relationship in the sentence: place, time, direction, or manner. Then choose the best preposition from ${optionsSummary}.`;
            }

            if (topic.includes('conjunction')) {
                return `Think about the link between the two parts of the sentence: contrast, reason, choice, condition, or addition. Then choose from ${optionsSummary}.`;
            }

            if (topic.includes('modal')) {
                return `Decide whether the sentence shows advice, permission, ability, possibility, or obligation. Then choose the modal that fits best from ${optionsSummary}.`;
            }

            if (topic.includes('determiner')) {
                return `Check whether the noun needs an article, quantity word, or pointing word. Then choose the correct determiner from ${optionsSummary}.`;
            }

            return `Read the full sentence and choose the option that makes both the grammar and meaning correct: ${optionsSummary}.`;
        }

        return 'Review the sentence carefully and choose the best answer.';
    }

    function isActivityAnswerSubmitted(answer) {
        if (!answer || typeof answer !== 'object') return false;
        if (Number.isInteger(answer.selectedOptionIndex)) return true;
        return typeof answer.rawInput === 'string' && answer.rawInput.trim().length > 0;
    }

    function initActivity() {
        const leaveModal = $('#leave-test-modal');
        $('#leave-test-cancel')?.addEventListener('click', () => leaveModal?.classList.remove('open'));
        $('#leave-test-confirm')?.addEventListener('click', () => {
            leaveModal?.classList.remove('open');
            navigateTo('dashboard');
        });

        const checkBtn = $('#check-btn');
        const nextBtn = $('#next-btn');
        const prevBtn = $('#prev-btn');
        const editBtn = $('#result-edit-btn');
        const resetBtn = $('#reset-btn');
        const tryAgainBtn = $('#try-again-btn');
        const retryBtn = $('#activity-report-retry-btn');
        const hintBtn = $('#hint-btn');

        if (!checkBtn || !nextBtn || !prevBtn || !editBtn || !hintBtn) return;

        buildActivityQuickNav();

        checkBtn.addEventListener('click', submitCurrentActivityAnswer);
        nextBtn.addEventListener('click', handleActivityNext);
        prevBtn.addEventListener('click', handleActivityPrev);
        editBtn.addEventListener('click', enableActivityEditMode);
        resetBtn?.addEventListener('click', resetActivityProgress);
        tryAgainBtn?.addEventListener('click', resetActivityProgress);
        retryBtn?.addEventListener('click', () => requestActivityReport(true));
        hintBtn.addEventListener('click', toggleCurrentHint);
    }

    function openActivityPage() {
        const set = getActivitySet();
        if (!set) {
            showToast('Activity data is missing. Please reload.');
            return;
        }

        if (!currentUser || !currentUid) {
            showToast('Please sign in to access activities.');
            navigateTo('auth');
            return;
        }

        if (!activityState || activityState.setId !== ACTIVITY_SET_ID) {
            const stored = currentUser?.activityProgress?.[ACTIVITY_SET_ID];
            activityState = hydrateActivityState(stored, set);
        }

        buildActivityQuickNav();
        activityEditingQuestionId = null;
        renderActivity();

        if (
            isReportEnabled(set) &&
            activityState.status === 'completed' &&
            !activityState.report &&
            activityState.reportStatus !== 'loading'
        ) {
            requestActivityReport(false);
        }
    }

    function createDefaultActivityState(set) {
        const now = new Date().toISOString();
        return {
            version: ACTIVITY_VERSION,
            setId: set.id,
            status: 'in_progress',
            currentIndex: 0,
            answersById: {},
            submittedCount: 0,
            correctCount: 0,
            startedAt: now,
            updatedAt: now,
            completedAt: null,
            report: null,
            reportStatus: 'idle'
        };
    }

    function hydrateActivityState(stored, set) {
        if (!stored || typeof stored !== 'object') {
            return createDefaultActivityState(set);
        }

        const state = createDefaultActivityState(set);
        state.version = ACTIVITY_VERSION;
        state.setId = set.id;
        state.status = stored.status === 'completed' ? 'completed' : 'in_progress';
        state.currentIndex = Number.isInteger(stored.currentIndex) ? stored.currentIndex : 0;
        state.answersById = (stored.answersById && typeof stored.answersById === 'object') ? { ...stored.answersById } : {};
        state.startedAt = stored.startedAt || state.startedAt;
        state.updatedAt = stored.updatedAt || state.updatedAt;
        state.completedAt = stored.completedAt || null;
        state.report = stored.report || null;
        state.reportStatus = state.report ? 'success' : 'idle';

        recalculateActivityMetrics(state, set);
        state.currentIndex = Math.max(0, Math.min(state.currentIndex, set.totalQuestions - 1));

        if (state.submittedCount >= set.totalQuestions) {
            state.status = 'completed';
            state.completedAt = state.completedAt || new Date().toISOString();
        }

        return state;
    }

    function recalculateActivityMetrics(state, set) {
        let submittedCount = 0;
        let correctCount = 0;

        set.questions.forEach(q => {
            const answer = state.answersById?.[String(q.id)];
            if (!isActivityAnswerSubmitted(answer)) return;
            submittedCount += 1;
            if (answer.isCorrect) correctCount += 1;
        });

        state.submittedCount = submittedCount;
        state.correctCount = correctCount;
    }

    function getCurrentActivityQuestion() {
        const set = getActivitySet();
        if (!set || !activityState) return null;
        return set.questions[activityState.currentIndex] || null;
    }

    function getActivityAnswer(questionId) {
        if (!activityState) return null;
        return activityState.answersById?.[String(questionId)] || null;
    }

    function extractVerbFromPrompt(prompt) {
        const match = (prompt || '').match(/\(([^)]+)\)/);
        return match?.[1] || '';
    }

    function parseAnswerParts(rawInput = '') {
        const normalized = canonicalizeNegativeModalPrefix(normalizeAnswer(rawInput));
        for (const option of [...ACTIVITY_MODAL_OPTIONS].sort((a, b) => b.length - a.length)) {
            if (normalized === option) return { modal: option, verb: '' };
            if (normalized.startsWith(`${option} `)) {
                return { modal: option, verb: normalized.slice(option.length + 1) };
            }
        }
        return { modal: '', verb: normalized };
    }

    function formatQuestionWithBlank(prompt, answerText = '', showInput = false) {
        if (showInput) {
            const blank = '<input type="text" id="answer-input" class="inline-blank-input" placeholder="type here..." autocomplete="off" spellcheck="false">';
            if (/_{2,}/.test(prompt)) return escapeHTML(prompt).replace(/_{2,}/g, blank);
            return `${escapeHTML(prompt)} ${blank}`;
        }
        const blankText = answerText ? escapeHTML(answerText) : '_______';
        const blank = `<span class="blank">${blankText}</span>`;
        if (/_{2,}/.test(prompt)) return escapeHTML(prompt).replace(/_{2,}/g, blank);
        return `${escapeHTML(prompt)} ${blank}`;
    }

    function attachTextAnswerListeners(inputEl) {
        if (!inputEl) return;
        inputEl.addEventListener('input', updateActivityActionState);
        inputEl.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const checkBtn = $('#check-btn');
                if (checkBtn && !checkBtn.disabled) submitCurrentActivityAnswer();
            }
        });
    }

    function renderAssessmentInputWidget(question, answer, isEditing, mountEl) {
        const type = getQuestionType(question);
        if (!mountEl) return;

        if (type === 'multiple_choice') {
            const selectedIndex = (isEditing && Number.isInteger(answer?.selectedOptionIndex))
                ? answer.selectedOptionIndex
                : null;

            mountEl.innerHTML = `
                <div class="answer-options">
                    ${(question.options || []).map((opt, idx) => `
                        <label class="answer-option" for="answer-option-${idx}">
                            <input
                                id="answer-option-${idx}"
                                type="radio"
                                name="answer-option"
                                value="${idx}"
                                ${selectedIndex === idx ? 'checked' : ''}
                            />
                            <span>${escapeHTML(opt)}</span>
                        </label>
                    `).join('')}
                </div>
            `;

            mountEl.querySelectorAll('input[name="answer-option"]').forEach(input => {
                input.addEventListener('change', updateActivityActionState);
            });
            return;
        }

        const value = isEditing ? (answer?.rawInput || '') : '';
        mountEl.innerHTML = `
            <div class="input-row">
                <input
                    type="text"
                    id="answer-input"
                    class="activity-answer-input"
                    placeholder="Type your answer..."
                    autocomplete="off"
                    spellcheck="false"
                    value="${escapeHTML(value)}"
                />
            </div>
        `;

        attachTextAnswerListeners(mountEl.querySelector('#answer-input'));
    }

    function buildActivityQuickNav() {
        const set = getActivitySet();
        const quickNav = $('#quick-nav');
        if (!set || !quickNav) return;

        quickNav.innerHTML = '';
        set.questions.forEach((q, index) => {
            const btn = document.createElement('button');
            btn.className = 'quick-nav-btn';
            btn.type = 'button';
            btn.textContent = String(index + 1);
            btn.addEventListener('click', () => goToActivityQuestion(index));
            quickNav.appendChild(btn);
        });
    }

    function updateActivityQuickNav() {
        const set = getActivitySet();
        const quickNav = $('#quick-nav');
        if (!set || !quickNav || !activityState) return;

        const buttons = [...quickNav.querySelectorAll('.quick-nav-btn')];
        buttons.forEach((btn, index) => {
            const q = set.questions[index];
            const answer = getActivityAnswer(q.id);

            btn.classList.remove('current', 'answered', 'correct', 'wrong');
            if (index === activityState.currentIndex && activityState.status !== 'completed') btn.classList.add('current');
            if (isActivityAnswerSubmitted(answer)) {
                btn.classList.add('answered');
                btn.classList.add(answer.isCorrect ? 'correct' : 'wrong');
            }
        });
    }

    function renderActivity() {
        const set = getActivitySet();
        if (!set || !activityState) return;

        const navTitleEl = $('.activity-nav-title');
        const titleEl = $('#activity-title');
        const subtitleEl = $('#activity-subtitle');
        const badgeEl = $('#activity-badge');
        const progressTextEl = $('#progress-text');
        const scoreTextEl = $('#activity-score-text');
        const progressFillEl = $('#progress-fill');
        const quizContainer = $('#quiz-container');
        const resultsContainer = $('#results-container');
        const grammarRefCard = $('#grammar-ref-card');
        const reportCard = $('#activity-report-card');

        if (navTitleEl) navTitleEl.textContent = set.navTitle || set.title || 'Activity';
        if (titleEl) titleEl.textContent = set.title || 'Activity';
        if (subtitleEl) subtitleEl.textContent = set.subtitle || '';
        if (grammarRefCard) grammarRefCard.classList.toggle('hidden', !isModalsActivity(set));
        if (reportCard) reportCard.classList.toggle('hidden', !isReportEnabled(set));

        const progressRatio = Math.max(0, Math.min(1, activityState.submittedCount / set.totalQuestions));
        if (progressFillEl) progressFillEl.style.width = `${Math.round(progressRatio * 100)}%`;
        if (progressTextEl) progressTextEl.textContent = `${Math.min(activityState.currentIndex + 1, set.totalQuestions)} / ${set.totalQuestions}`;
        if (scoreTextEl) scoreTextEl.textContent = `Score: ${activityState.correctCount}/${set.totalQuestions}`;

        if (activityState.status === 'completed') {
            if (badgeEl) {
                badgeEl.textContent = 'Completed';
                badgeEl.classList.add('completed');
            }
            if (quizContainer) quizContainer.classList.add('hidden');
            if (resultsContainer) resultsContainer.classList.remove('hidden');
            renderActivityCompletion();
            updateActivityQuickNav();
            return;
        }

        if (badgeEl) {
            badgeEl.textContent = 'In Progress';
            badgeEl.classList.remove('completed');
        }

        if (quizContainer) quizContainer.classList.remove('hidden');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        renderCurrentActivityQuestion();
    }

    function renderCurrentActivityQuestion() {
        const question = getCurrentActivityQuestion();
        if (!question) return;

        const set = getActivitySet();
        const questionType = getQuestionType(question);
        const contextLabel = getQuestionContextLabel(question, set);
        const contextStyle = getContextStyle(contextLabel);

        const contextBadge = $('#context-badge');
        const questionPassage = $('#question-passage');
        const questionText = $('#question-text');
        const verbHintWrap = $('.verb-hint');
        const verbHint = $('#verb-hint');
        const answerWidget = $('#answer-widget');
        const inputArea = $('#input-area');
        const resultArea = $('#result-area');
        const hintBox = $('#hint-box');
        const prevBtn = $('#prev-btn');
        const progressText = $('#progress-text');
        const progressFill = $('#progress-fill');

        const answer = getActivityAnswer(question.id);
        const isEditing = activityEditingQuestionId === question.id;

        if (progressText && set) progressText.textContent = `${activityState.currentIndex + 1} / ${set.totalQuestions}`;
        if (progressFill && set) progressFill.style.width = `${((activityState.currentIndex + 1) / set.totalQuestions) * 100}%`;

        if (contextBadge) {
            contextBadge.className = `context-badge ${contextStyle.bg} ${contextStyle.text} ${contextStyle.border}`;
            contextBadge.textContent = contextLabel;
        }

        if (questionPassage) {
            if (question.passage) {
                questionPassage.textContent = question.passage;
                questionPassage.classList.remove('hidden');
            } else {
                questionPassage.textContent = '';
                questionPassage.classList.add('hidden');
            }
        }

        const showInput = !isActivityAnswerSubmitted(answer) || isEditing;
        if (questionText) {
            if (questionType === 'modal_phrase') {
                const filled = answer && !isEditing ? answer.rawInput : '';
                questionText.innerHTML = formatQuestionWithBlank(question.prompt, filled, showInput);
            } else {
                questionText.textContent = question.prompt || '';
            }
        }

        if (verbHintWrap && verbHint) {
            if (questionType === 'modal_phrase') {
                const verb = extractVerbFromPrompt(question.prompt);
                if (verb) {
                    verbHint.textContent = `(${verb})`;
                    verbHintWrap.style.display = 'flex';
                } else {
                    verbHintWrap.style.display = 'none';
                }
            } else {
                verbHintWrap.style.display = 'none';
            }
        }

        if (answerWidget) {
            answerWidget.innerHTML = '';
        }

        if (showInput && questionType === 'modal_phrase') {
            const inlineInput = questionText ? $('#answer-input', questionText) : null;
            if (inlineInput) {
                inlineInput.value = isEditing ? (answer?.rawInput || '') : '';
                attachTextAnswerListeners(inlineInput);
                inlineInput.focus();
            }
        }

        if (showInput && questionType !== 'modal_phrase' && answerWidget) {
            renderAssessmentInputWidget(question, answer, isEditing, answerWidget);
            if (questionType === 'multiple_choice') {
                ($('input[name="answer-option"]:checked', answerWidget) || $('#answer-option-0', answerWidget))?.focus();
            } else {
                $('#answer-input', answerWidget)?.focus();
            }
        }

        if (inputArea && resultArea) {
            if (!showInput) {
                inputArea.classList.add('hidden');
                resultArea.classList.remove('hidden');
                renderAnswerResult(answer, question);
            } else {
                inputArea.classList.remove('hidden');
                resultArea.classList.add('hidden');
            }
        }

        if (hintBox) {
            hintBox.classList.add('hidden');
            hintBox.textContent = '';
        }

        if (prevBtn) prevBtn.disabled = activityState.currentIndex === 0;
        updateActivityActionState();
        updateActivityQuickNav();
    }

    function renderAnswerResult(answer, question) {
        const resultBox = $('#result-box');
        const resultTitle = $('#result-title');
        const resultExplanation = $('#result-explanation');
        const nextBtn = $('#next-btn');

        const isCorrect = !!answer?.isCorrect;
        const questionType = getQuestionType(question);

        if (resultBox) {
            resultBox.className = `result-box ${isCorrect ? 'result-correct' : 'result-incorrect'}`;
        }

        if (resultTitle) {
            resultTitle.textContent = isCorrect ? 'Correct' : 'Not quite right';
        }

        if (resultExplanation) {
            let html = '';

            if (!isCorrect) {
                const expected = getExpectedAnswerText(question);
                if (expected) {
                    html += `<p style="margin-bottom:8px;">Correct answer: <strong class="text-correct">${escapeHTML(expected)}</strong></p>`;
                }
            }

            if (questionType === 'modal_phrase' && question.modelSentence) {
                html += `<p><strong>Model sentence:</strong> ${escapeHTML(question.modelSentence)}</p>`;
            }

            if (question.explanation) {
                html += `<p style="margin-top:8px;"><strong>Explanation:</strong> ${escapeHTML(question.explanation)}</p>`;
            }

            if (!html) {
                html = '<p>Answer submitted.</p>';
            }
            resultExplanation.innerHTML = html;
        }

        if (nextBtn) {
            const isLast = activityState.currentIndex >= (getActivitySet()?.totalQuestions || 1) - 1;
            nextBtn.textContent = isLast ? 'View Results' : 'Next Question ->';
        }
    }

    function updateActivityActionState() {
        const question = getCurrentActivityQuestion();
        if (!question || !activityState) return;

        const checkBtn = $('#check-btn');
        const prevBtn = $('#prev-btn');
        if (!checkBtn) return;

        const answer = getActivityAnswer(question.id);
        const isSubmitted = isActivityAnswerSubmitted(answer);
        const isEditing = activityEditingQuestionId === question.id;
        const type = getQuestionType(question);

        let hasInput = false;
        if (type === 'multiple_choice') {
            hasInput = !!$('input[name="answer-option"]:checked');
        } else {
            const answerInput = $('#answer-input');
            hasInput = !!(answerInput && answerInput.value.trim().length > 0);
        }

        if (isSubmitted && !isEditing) {
            checkBtn.disabled = true;
        } else {
            checkBtn.disabled = !hasInput;
        }

        if (prevBtn) prevBtn.disabled = activityState.currentIndex === 0;
    }

    function normalizeAnswer(text) {
        return (text || '')
            .toLowerCase()
            .replace(/[’`]/g, "'")
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/[.,!?;:]+$/g, '')
            .trim();
    }

    function canonicalizeNegativeModalPrefix(text = '') {
        return (text || '')
            .replace(/^could not have\b/, "couldn't have")
            .replace(/^should not have\b/, "shouldn't have")
            .replace(/^would not have\b/, "wouldn't have")
            .replace(/^couldnt have\b/, "couldn't have")
            .replace(/^shouldnt have\b/, "shouldn't have")
            .replace(/^wouldnt have\b/, "wouldn't have");
    }

    function normalizeActivityPhraseForCompare(text = '') {
        return canonicalizeNegativeModalPrefix(normalizeAnswer(text));
    }

    function evaluateActivityAnswer(question, rawInput, selectedOptionIndex = null) {
        const type = getQuestionType(question);

        if (type === 'modal_phrase') {
            const normalizedInput = normalizeAnswer(rawInput);
            const normalizedInputForCompare = normalizeActivityPhraseForCompare(rawInput);
            const normalizedExpectedForCompare = normalizeActivityPhraseForCompare(question.normalizedExpectedPhrase || question.expectedPhrase);
            return {
                normalizedInput,
                normalizedInputForCompare,
                isCorrect: normalizedInputForCompare === normalizedExpectedForCompare
            };
        }

        if (type === 'multiple_choice') {
            const normalizedInput = normalizeAnswer(rawInput);
            const correctIndex = Number(question.correctAnswer);
            return {
                normalizedInput,
                normalizedInputForCompare: normalizedInput,
                isCorrect: Number.isInteger(selectedOptionIndex) && selectedOptionIndex === correctIndex
            };
        }

        const normalizedInput = normalizeAnswer(rawInput);
        const accepted = [];

        if (Array.isArray(question.normalizedAnswers)) {
            accepted.push(...question.normalizedAnswers.map(a => normalizeAnswer(a)));
        }
        if (typeof question.correctAnswer === 'string') {
            accepted.push(normalizeAnswer(question.correctAnswer));
        }

        const uniqueAccepted = [...new Set(accepted.filter(Boolean))];
        return {
            normalizedInput,
            normalizedInputForCompare: normalizedInput,
            isCorrect: uniqueAccepted.includes(normalizedInput)
        };
    }

    function submitCurrentActivityAnswer() {
        const set = getActivitySet();
        const question = getCurrentActivityQuestion();
        if (!set || !question || !activityState) return;

        const questionType = getQuestionType(question);
        let rawInput = '';
        let selectedOptionIndex = null;

        if (questionType === 'multiple_choice') {
            const selected = $('input[name="answer-option"]:checked');
            if (!selected) {
                showToast('Please select an option.');
                return;
            }
            selectedOptionIndex = Number(selected.value);
            rawInput = question.options?.[selectedOptionIndex] || '';
        } else {
            const answerInput = $('#answer-input');
            if (!answerInput || !answerInput.value.trim()) {
                showToast('Please type your answer.');
                return;
            }
            rawInput = answerInput.value.trim();
        }

        const evaluation = evaluateActivityAnswer(question, rawInput, selectedOptionIndex);
        const modalParts = questionType === 'modal_phrase'
            ? parseAnswerParts(rawInput)
            : { modal: '', verb: '' };

        activityState.answersById[String(question.id)] = {
            rawInput,
            normalizedInput: evaluation.normalizedInput,
            normalizedInputForCompare: evaluation.normalizedInputForCompare,
            isCorrect: evaluation.isCorrect,
            selectedOptionIndex,
            selectedModal: modalParts.modal,
            verbPart: modalParts.verb,
            submittedAt: new Date().toISOString()
        };

        recalculateActivityMetrics(activityState, set);
        activityEditingQuestionId = null;

        if (activityState.submittedCount >= set.totalQuestions) {
            activityState.status = 'completed';
            activityState.completedAt = activityState.completedAt || new Date().toISOString();
        }

        persistActivityProgress();
        renderCurrentActivityQuestion();
        renderActivity();

        if (
            isReportEnabled(set) &&
            activityState.status === 'completed' &&
            !activityState.report &&
            activityState.reportStatus !== 'loading'
        ) {
            requestActivityReport(false);
        }
    }

    function enableActivityEditMode() {
        const question = getCurrentActivityQuestion();
        const answer = question ? getActivityAnswer(question.id) : null;
        if (!question || !isActivityAnswerSubmitted(answer)) return;

        activityEditingQuestionId = question.id;
        renderCurrentActivityQuestion();

        const answerInput = $('#answer-input');
        if (answerInput) {
            answerInput.focus();
            answerInput.setSelectionRange(answerInput.value.length, answerInput.value.length);
            return;
        }

        const selectedOption = $('input[name="answer-option"]:checked') || $('input[name="answer-option"]');
        selectedOption?.focus();
    }

    function toggleCurrentHint() {
        const question = getCurrentActivityQuestion();
        const hintBox = $('#hint-box');
        const set = getActivitySet();
        if (!question || !hintBox) return;

        if (!hintBox.classList.contains('hidden')) {
            hintBox.classList.add('hidden');
            hintBox.textContent = '';
            return;
        }

        let hint = '';
        if (isModalsActivity()) {
            hint = ACTIVITY_HINTS[question.category] || 'Use the category clue to choose the correct modal phrase.';
        } else {
            hint = question.hint || question.explanation || getGeneratedQuestionHint(question, set);
        }

        hintBox.textContent = `Tip: ${hint}`;
        hintBox.classList.remove('hidden');
    }

    function handleActivityNext() {
        const set = getActivitySet();
        const question = getCurrentActivityQuestion();
        if (!set || !question || !activityState) return;

        const answer = getActivityAnswer(question.id);
        if (!isActivityAnswerSubmitted(answer)) {
            showToast('Submit this answer before moving next.');
            return;
        }

        if (activityState.currentIndex < set.totalQuestions - 1) {
            activityState.currentIndex += 1;
            activityEditingQuestionId = null;
            persistActivityProgress();
            renderActivity();
            return;
        }

        if (activityState.submittedCount >= set.totalQuestions) {
            activityState.status = 'completed';
            activityState.completedAt = activityState.completedAt || new Date().toISOString();
            persistActivityProgress();
            renderActivity();
            if (isReportEnabled(set) && !activityState.report && activityState.reportStatus !== 'loading') {
                requestActivityReport(false);
            }
        }
    }

    function handleActivityPrev() {
        if (!activityState || activityState.currentIndex === 0) return;
        activityState.currentIndex -= 1;
        activityEditingQuestionId = null;
        persistActivityProgress();
        renderActivity();
    }

    function goToActivityQuestion(index) {
        const set = getActivitySet();
        if (!set || !activityState) return;
        if (index < 0 || index >= set.totalQuestions) return;

        activityState.currentIndex = index;
        activityEditingQuestionId = null;
        persistActivityProgress();
        renderActivity();
    }

    function renderActivityCompletion() {
        const set = getActivitySet();
        if (!set || !activityState) return;

        const scorePercentEl = $('#score-percent');
        const scoreCircleEl = $('#score-circle');
        const resultsTitleEl = $('#results-title');
        const resultsSubtitleEl = $('#results-subtitle');
        const reviewListEl = $('#review-list');

        const total = set.totalQuestions;
        const correct = activityState.correctCount;
        const percentage = Math.round((correct / total) * 100);
        const passMark = Number.isFinite(set.passMark) ? set.passMark : null;
        const passed = passMark === null ? percentage >= 60 : correct >= passMark;
        const gradeBand = Array.isArray(set.grading)
            ? set.grading.find(g => correct >= g.minScore && correct <= g.maxScore)
            : null;

        if (scorePercentEl) scorePercentEl.textContent = `${percentage}%`;

        if (scoreCircleEl) {
            scoreCircleEl.className = 'score-circle';
            if (percentage >= 80) scoreCircleEl.classList.add('score-excellent');
            else if (passed) scoreCircleEl.classList.add('score-good');
            else scoreCircleEl.classList.add('score-poor');
        }

        if (resultsTitleEl) {
            if (gradeBand?.grade) {
                resultsTitleEl.textContent = `Grade ${gradeBand.grade}`;
            } else if (percentage >= 80) {
                resultsTitleEl.textContent = 'Excellent';
            } else if (passed) {
                resultsTitleEl.textContent = 'Good Job';
            } else {
                resultsTitleEl.textContent = 'Keep Practicing';
            }
        }

        if (resultsSubtitleEl) {
            if (gradeBand) {
                const levelPart = gradeBand.level ? `, ${gradeBand.level}` : '';
                const passPart = passed ? 'Passed' : 'Not Passed';
                const remarkPart = gradeBand.remarks ? ` - ${gradeBand.remarks}` : '';
                resultsSubtitleEl.textContent = `You scored ${correct}/${total} (${percentage}%). ${passPart}${levelPart}${remarkPart}`;
            } else {
                resultsSubtitleEl.textContent = `You got ${correct} out of ${total} questions correct`;
            }
        }

        if (reviewListEl) {
            reviewListEl.innerHTML = set.questions.map((q, index) => {
                const answer = getActivityAnswer(q.id);
                const userAnswer = isActivityAnswerSubmitted(answer) ? (answer.rawInput || 'Not answered') : 'Not answered';
                const isCorrect = !!answer?.isCorrect;
                const expectedAnswer = getExpectedAnswerText(q);

                return `
                    <div class="review-item ${isCorrect ? 'review-correct' : 'review-incorrect'}">
                        <div class="review-header">
                            <div class="review-icon">${isCorrect ? '✓' : '✗'}</div>
                            <div class="review-content">
                                <p><strong>Q${index + 1}:</strong> ${escapeHTML(q.prompt || '').replace(/_{2,}/g, '_____')}</p>
                                <p class="review-answer">Your answer: <span class="${isCorrect ? 'text-correct' : 'text-incorrect'}">${escapeHTML(userAnswer)}</span></p>
                                ${!isCorrect && expectedAnswer ? `<p class="review-answer">Correct: <span class="text-correct">${escapeHTML(expectedAnswer)}</span></p>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        updateActivityQuickNav();
        if (isReportEnabled(set)) {
            renderActivityReport();
        }
    }

    function buildActivityReportPayload() {
        const set = getActivitySet();
        if (!set || !activityState || !isReportEnabled(set)) return null;

        const total = set.totalQuestions;
        const correct = activityState.correctCount;
        const accuracy = Math.round((correct / total) * 100);

        const attempts = set.questions.map(q => {
            const answer = getActivityAnswer(q.id);
            return {
                question_id: q.id,
                type: getQuestionType(q),
                category: getQuestionContextLabel(q, set),
                expected_phrase: getExpectedAnswerText(q),
                user_input: answer?.rawInput || '',
                is_correct: !!answer?.isCorrect
            };
        });

        return {
            activity_id: set.id,
            chat_id: currentUid || 'anonymous',
            user_meta: {
                uid: currentUid || 'anonymous',
                name: currentUser?.name || 'Guest',
                email: currentUser?.email || ''
            },
            summary: {
                total,
                correct,
                accuracy_percent: accuracy
            },
            attempts
        };
    }

    async function requestActivityReport(forceRetry = false) {
        const set = getActivitySet();
        if (!set || !isReportEnabled(set) || !activityState || activityState.status !== 'completed') return;
        if (activityState.reportStatus === 'loading') return;
        if (activityState.report && !forceRetry) return;

        const payload = buildActivityReportPayload();
        if (!payload) return;

        activityState.reportStatus = 'loading';
        renderActivityReport();

        try {
            const res = await fetch(N8N_ACTIVITY_REPORT_WEBHOOK, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const contentType = res.headers.get('content-type') || '';
            let data;

            if (contentType.includes('application/json')) {
                data = await res.json();
            } else {
                data = { text: await res.text() };
            }

            const reportText = (data?.report_text || data?.text || data?.reply || data?.output || '').toString().trim();
            const reportHtml = (data?.report_html || data?.html || '').toString().trim();
            const fallback = !reportText && !reportHtml ? JSON.stringify(data, null, 2) : '';

            activityState.report = {
                generatedAt: new Date().toISOString(),
                text: reportText || fallback,
                html: reportHtml || null
            };
            activityState.reportStatus = 'success';

            await persistActivityProgress();
            renderActivity();
        } catch (err) {
            console.error('Activity report error:', err);
            activityState.reportStatus = 'failed';
            renderActivityReport();
            showToast('Report generation failed. You can retry.');
        }
    }

    function renderActivityReport() {
        const set = getActivitySet();
        if (!set || !isReportEnabled(set) || !activityState) return;

        const statusEl = $('#activity-report-status');
        const contentEl = $('#activity-report-content');
        const retryBtn = $('#activity-report-retry-btn');
        if (!statusEl || !contentEl || !retryBtn) return;

        retryBtn.style.display = 'none';

        if (activityState.reportStatus === 'loading') {
            statusEl.textContent = 'Generating report...';
            contentEl.innerHTML = '';
            return;
        }

        if (activityState.report) {
            const ts = new Date(activityState.report.generatedAt).toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            statusEl.textContent = `Generated on ${ts}`;
            if (activityState.report.html) {
                contentEl.innerHTML = activityState.report.html;
            } else {
                contentEl.textContent = activityState.report.text || 'Report generated successfully.';
            }
            return;
        }

        if (activityState.reportStatus === 'failed') {
            statusEl.textContent = 'Could not generate report right now.';
            contentEl.textContent = 'You can continue with your score summary and try generating the report again.';
            retryBtn.style.display = 'inline-flex';
            return;
        }

        statusEl.textContent = 'Report not generated yet.';
        contentEl.textContent = '';
        retryBtn.style.display = 'inline-flex';
    }

    function resetActivityProgress() {
        const set = getActivitySet();
        if (!set) return;

        activityState = createDefaultActivityState(set);
        activityEditingQuestionId = null;
        persistActivityProgress();
        renderActivity();
        showToast('Activity restarted.');
    }

    function serializeActivityState(state) {
        return {
            version: ACTIVITY_VERSION,
            setId: state.setId,
            status: state.status,
            currentIndex: state.currentIndex,
            answersById: state.answersById,
            submittedCount: state.submittedCount,
            correctCount: state.correctCount,
            startedAt: state.startedAt,
            updatedAt: state.updatedAt,
            completedAt: state.completedAt || null,
            report: state.report || null
        };
    }

    async function persistActivityProgress() {
        if (!currentUid || !activityState) return;

        activityState.updatedAt = new Date().toISOString();
        const serialized = serializeActivityState(activityState);

        try {
            await updateUserData({
                activityProgress: {
                    [ACTIVITY_SET_ID]: serialized
                }
            });

            if (!currentUser.activityProgress) currentUser.activityProgress = {};
            currentUser.activityProgress[ACTIVITY_SET_ID] = serialized;
        } catch (err) {
            console.error('Activity progress save error:', err);
        }
    }

    // ---- Dashboard ----
    function populateDashboard() {
        if (!currentUser) return;
        const firstName = currentUser.name.split(' ')[0];
        const initials = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

        const welcomeHeading = $('#welcome-heading');
        if (welcomeHeading) welcomeHeading.textContent = 'Welcome, ' + firstName;
        $('#nav-student-name').textContent = firstName;

        // Check for saved profile photo for nav avatar (from Firestore data)
        const navAvatar = $('#nav-avatar');
        const savedPhoto = currentUser.profilePhoto || '';
        if (savedPhoto && navAvatar) {
            navAvatar.textContent = '';
            navAvatar.innerHTML = `<img src="${savedPhoto}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
        } else if (navAvatar) {
            navAvatar.textContent = initials;
        }

        // Stats count-up
        setTimeout(() => animateCountUp(), 300);

        // Chart
        setTimeout(() => renderChart(), 200);

        // Daily Vocabulary
        // Daily Vocabulary
        // populateVocabulary(); // Moved to fetchDailyContent fallback

        // Load announcements and keep them fresh on dashboard
        loadAnnouncements();
        startAnnouncementsAutoRefresh();
    }

    // ---- Daily Vocabulary ----
    function populateVocabulary() {
        const WORDS = [
            { word: "Apparently", meaning: "As far as one knows or can see; it seems that something is true" },
            { word: "Eloquent", meaning: "Fluent or persuasive in speaking or writing" },
            { word: "Inevitable", meaning: "Certain to happen; unavoidable" },
            { word: "Pragmatic", meaning: "Dealing with things sensibly and realistically" },
            { word: "Ambiguous", meaning: "Open to more than one interpretation; not clear" },
            { word: "Resilient", meaning: "Able to recover quickly from difficult conditions" },
            { word: "Subtle", meaning: "So delicate or precise as to be difficult to describe" },
            { word: "Comprehensive", meaning: "Including all or nearly all elements; complete and thorough" },
            { word: "Authentic", meaning: "Of undisputed origin; genuine and real" },
            { word: "Diligent", meaning: "Having or showing careful and persistent effort" },
            { word: "Reluctant", meaning: "Unwilling and hesitant; not eager to do something" },
            { word: "Persuade", meaning: "To convince someone to do or believe something through reasoning" },
            { word: "Enormous", meaning: "Very large in size, quantity, or extent" },
            { word: "Accomplish", meaning: "To achieve or complete something successfully" },
            { word: "Tremendous", meaning: "Very great in amount, scale, or intensity" },
            { word: "Consequence", meaning: "A result or effect of an action or condition" },
            { word: "Significantly", meaning: "In a way that is important or large enough to have an effect" },
            { word: "Adequate", meaning: "Sufficient for a specific need or requirement" },
            { word: "Demonstrate", meaning: "To clearly show the existence or truth of something" },
            { word: "Interpret", meaning: "To explain the meaning of information or actions" },
            { word: "Consistent", meaning: "Acting or done the same way over time; unchanging" },
            { word: "Emphasize", meaning: "To give special importance or attention to something" },
            { word: "Enthusiasm", meaning: "Intense and eager enjoyment, interest, or approval" },
            { word: "Negotiate", meaning: "To discuss something in order to reach an agreement" },
            { word: "Perspective", meaning: "A particular way of thinking about or viewing something" },
            { word: "Substantial", meaning: "Of considerable importance, size, or worth" },
            { word: "Gradually", meaning: "In a way that happens slowly over time, not suddenly" },
            { word: "Controversy", meaning: "A prolonged public disagreement or heated discussion" },
            { word: "Anticipate", meaning: "To expect or predict something before it happens" },
            { word: "Distinguish", meaning: "To recognize or treat someone or something as different" },
            { word: "Exaggerate", meaning: "To make something seem larger or more important than it is" },
            { word: "Persistent", meaning: "Continuing firmly in spite of difficulty or opposition" },
            { word: "Spontaneous", meaning: "Done or occurring without planning, on impulse" },
            { word: "Credible", meaning: "Able to be believed or trusted; convincing" },
            { word: "Overwhelm", meaning: "To have a very strong emotional or physical effect on someone" },
            { word: "Meticulous", meaning: "Showing great attention to detail; very careful and precise" },
            { word: "Fluctuate", meaning: "To rise and fall irregularly in number or amount" },
            { word: "Contemplate", meaning: "To think about something deeply and for a long time" },
            { word: "Feasible", meaning: "Possible and practical to do or achieve easily" },
            { word: "Deteriorate", meaning: "To become progressively worse over time" },
            { word: "Novice", meaning: "A person new to or inexperienced in a particular field" },
            { word: "Profound", meaning: "Very great or intense; having deep meaning" },
            { word: "Reluctance", meaning: "Unwillingness or hesitation to do something" },
            { word: "Abundant", meaning: "Existing or available in large quantities; plentiful" },
            { word: "Gratitude", meaning: "The quality of being thankful; readiness to show appreciation" },
            { word: "Concise", meaning: "Giving a lot of information clearly in a few words; brief" },
            { word: "Vulnerable", meaning: "Exposed to the possibility of being harmed, physically or emotionally" },
            { word: "Elaborate", meaning: "Involving many carefully arranged parts; detailed and complicated" },
            { word: "Inevitable", meaning: "Sure to happen; impossible to avoid or prevent" },
            { word: "Versatile", meaning: "Able to adapt or be adapted to many different functions" },
            { word: "Peculiar", meaning: "Strange or unusual; not like what is normal or expected" },
            { word: "Diminish", meaning: "To make or become less; to reduce in size or importance" },
            { word: "Obstinate", meaning: "Stubbornly refusing to change one's opinion or course of action" },
            { word: "Candid", meaning: "Truthful and straightforward; being honest and open" },
            { word: "Turbulent", meaning: "Characterized by conflict, disorder, or confusion" },
            { word: "Impeccable", meaning: "Without faults or mistakes; flawless and perfect" },
            { word: "Endure", meaning: "To suffer something painful or difficult patiently over time" },
            { word: "Vivid", meaning: "Producing powerful feelings or strong, clear images in the mind" },
            { word: "Skeptical", meaning: "Not easily convinced; having doubts or reservations" },
            { word: "Compassion", meaning: "Sympathetic concern for the sufferings or misfortunes of others" },
        ];

        // Date-based seed for daily rotation
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

        // Simple seeded shuffle to pick 5 words
        function seededRandom(s) {
            let x = Math.sin(s) * 10000;
            return x - Math.floor(x);
        }

        const indices = [];
        let s = seed;
        while (indices.length < 5) {
            s++;
            const idx = Math.floor(seededRandom(s) * WORDS.length);
            if (!indices.includes(idx)) indices.push(idx);
        }

        const todayWords = indices.map(i => WORDS[i]);

        // Set date
        const vocabDateEl = $('#vocab-date');
        if (vocabDateEl) {
            vocabDateEl.textContent = today.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
        }

        // Render words
        const listEl = $('#vocab-list');
        if (listEl) {
            listEl.innerHTML = todayWords.map(w => `
                <div class="vocab-item">
                    <span class="vocab-word">${w.word}</span>
                    <span class="vocab-dash">—</span>
                    <span class="vocab-meaning">${w.meaning}</span>
                </div>
            `).join('');
        }
    }

    // ---- Count-Up Animation ----
    function animateCountUp() {
        $$('.stat-value[data-count]').forEach(el => {
            const target = parseInt(el.dataset.count, 10);
            if (target === 0) {
                el.textContent = '0';
                return;
            }
            const duration = 1200;
            const start = performance.now();

            function tick(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(target * eased);
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = target; // Ensure exact final value
            }
            requestAnimationFrame(tick);
        });
    }

    // ---- Stats Logic (Firestore-backed) ----
    function loadStats() {
        if (!currentUser) return;
        const fluent = currentUser.fluentSessions || 0;
        const khushi = currentUser.khushiSessions || 0;

        // Update DOM data-count attributes
        const stats = $$('.stat-value');
        if (stats.length >= 3) {
            stats[0].dataset.count = fluent;
            stats[1].dataset.count = khushi;
            stats[2].dataset.count = fluent + khushi;
        }
    }

    async function incrementSession(bot) {
        if (!currentUser) return;

        if (bot === 'fluent') {
            currentUser.fluentSessions = (currentUser.fluentSessions || 0) + 1;
            await updateUserData({ fluentSessions: currentUser.fluentSessions });
        } else {
            currentUser.khushiSessions = (currentUser.khushiSessions || 0) + 1;
            await updateUserData({ khushiSessions: currentUser.khushiSessions });
        }

        // Simulate learning progress
        updateChartData();
    }

    function updateChartData() {
        // Get current data or init with default
        let data = JSON.parse(localStorage.getItem('lg_chart_data'));
        if (!data) {
            data = [45, 30, 60, 55, 40, 50];
        }

        // Randomly improve 1-2 categories by 2-5 points
        const numUpdates = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numUpdates; i++) {
            const idx = Math.floor(Math.random() * data.length);
            const increase = Math.floor(Math.random() * 4) + 2;
            data[idx] = Math.min(data[idx] + increase, 100); // Cap at 100
        }

        localStorage.setItem('lg_chart_data', JSON.stringify(data));
    }

    // ---- Chart ----
    let chartInstance = null;

    function renderChart() {
        const canvas = $('#improvement-chart');
        if (!canvas) return;

        if (chartInstance) {
            chartInstance.destroy();
            chartInstance = null;
        }

        const ctx = canvas.getContext('2d');

        // Gradient fill
        const barGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        barGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        barGradient.addColorStop(1, 'rgba(139, 92, 246, 0.8)');

        const barBorderGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        barBorderGradient.addColorStop(0, '#3B82F6');
        barBorderGradient.addColorStop(1, '#8B5CF6');

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: MOCK.improvement.labels,
                datasets: [{
                    label: 'Proficiency Score',
                    data: JSON.parse(localStorage.getItem('lg_chart_data')) || MOCK.improvement.data,
                    backgroundColor: barGradient,
                    borderColor: barBorderGradient,
                    borderWidth: 1,
                    borderRadius: 6,
                    borderSkipped: false,
                }],
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1200,
                    easing: 'easeOutQuart',
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#FFFFFF',
                        titleColor: '#111827',
                        bodyColor: '#6B7280',
                        borderColor: '#E5E7EB',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 10,
                        displayColors: false,
                        titleFont: { weight: '600', size: 13 },
                        bodyFont: { size: 12 },
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    },
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.04)',
                            drawBorder: false,
                        },
                        ticks: {
                            color: '#9CA3AF',
                            font: { size: 11 },
                        },
                        border: { display: false },
                    },
                    y: {
                        grid: { display: false },
                        ticks: {
                            color: '#6B7280',
                            font: { size: 12, weight: '500' },
                            padding: 8,
                        },
                        border: { display: false },
                    },
                },
                layout: {
                    padding: { top: 4, bottom: 4 },
                },
            },
        });
    }

    // ---- Chat ----
    function initChat() {
        setupChatBot('fluent');
        setupChatBot('khushi');
    }

    function setupChatBot(type) {
        const input = $(`#chat-input-${type}`);
        const sendBtn = $(`#send-${type}`);

        const send = async () => {
            const text = input.value.trim();
            if (!text) return;
            addMessage(type, 'user', text);
            input.value = '';
            input.focus();

            // Show typing
            const typing = $(`#typing-${type}`);
            typing.classList.add('active');
            scrollChat(type);

            if (type === 'fluent') {
                // Real AI response via n8n webhook
                const response = await callFluentBot(text);
                typing.classList.remove('active');
                addMessage(type, 'bot', response, true);
            } else {
                // Real AI response via Khushi n8n webhook
                const data = await callKhushiBot(text);
                typing.classList.remove('active');
                handleKhushiResponse(data);
            }
        };

        sendBtn.addEventListener('click', send);
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
            }
        });
    }

    function addMessage(botType, sender, text, isHTML = false) {
        const container = $(`#chat-${botType}-messages`);
        const typing = $(`#typing-${botType}`);

        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        // Bot messages from n8n already contain HTML formatting
        const content = (sender === 'bot' && isHTML)
            ? text.replace(/\n/g, '<br/>')
            : escapeHTML(text).replace(/\n/g, '<br/>');

        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.innerHTML = `
      <div>
        <div class="msg-bubble">${content}</div>
        <div class="msg-time">${time}</div>
      </div>
    `;

        container.insertBefore(msgDiv, typing);
        scrollChat(botType);
    }

    function scrollChat(botType) {
        const container = $(`#chat-${botType}-messages`);
        if (!container) return;
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }

    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ---- N8N Webhook Integration ----
    // Use webhook-test for testing, switch to webhook/ for production
    const N8N_FLUENT_WEBHOOK = 'https://n8n.ritesh-ai-automation.in/webhook/fluent-bot-web';

    async function callFluentBot(message, mode = 'Chat', audioBlob = null) {
        try {
            const nameParts = (currentUser?.name || 'Guest').split(' ');
            const formData = new FormData();

            formData.append('first_name', nameParts[0] || '');
            formData.append('last_name', nameParts.slice(1).join(' ') || '');
            formData.append('date', Math.floor(Date.now() / 1000).toString());
            formData.append('mode', mode);
            formData.append('chat_id', currentUid || 'anonymous');

            if (audioBlob) {
                // Voice mode: attach audio file with correct extension
                const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
                formData.append('audio', audioBlob, `voice-message.${ext}`);
            } else {
                // Chat mode: attach text
                formData.append('text', message);
            }

            console.log('Sending to n8n:', {
                mode,
                hasAudio: !!audioBlob,
                text: message,
                audioType: audioBlob?.type
            });
            const res = await fetch(N8N_FLUENT_WEBHOOK, {
                method: 'POST',
                body: formData,
            });
            console.log('Response status:', res.status);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log('N8N response:', data);
            return data.reply || data.text || data.output || JSON.stringify(data);
        } catch (err) {
            console.error('Fluent Bot API error:', err);
            return '⚠️ Connection issue. Please try again in a moment.';
        }
    }

    // Khushi Bot Webhook
    const N8N_KHUSHI_WEBHOOK = 'https://n8n.ritesh-ai-automation.in/webhook/b06287b2-a53a-4a71-942a-9eae1b4a32db';

    async function callKhushiBot(message, mode = 'Chat', audioBlob = null) {
        try {
            const nameParts = (currentUser?.name || 'Guest').split(' ');
            const formData = new FormData();

            formData.append('first_name', nameParts[0] || '');
            formData.append('last_name', nameParts.slice(1).join(' ') || '');
            formData.append('date', Math.floor(Date.now() / 1000).toString());
            formData.append('mode', mode);
            formData.append('chat_id', currentUid || 'anonymous');

            if (audioBlob) {
                const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
                formData.append('audio', audioBlob, `voice-message.${ext}`);
            } else {
                formData.append('text', message);
            }

            console.log('Sending to Khushi:', {
                mode,
                hasAudio: !!audioBlob,
                text: message,
                audioType: audioBlob?.type
            });
            const res = await fetch(N8N_KHUSHI_WEBHOOK, {
                method: 'POST',
                body: formData,
            });
            console.log('Khushi response status:', res.status);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            console.log('Khushi response:', data);
            return data; // Return full object for custom handling
        } catch (err) {
            console.error('Khushi Bot API error:', err);
            return { error: '⚠️ Connection issue. Please try again in a moment.' };
        }
    }

    // Handle Khushi's structured response (Premium Voice Card)
    function handleKhushiResponse(data) {
        if (data.error) {
            addMessage('khushi', 'bot', data.error);
            return;
        }

        const ans = data.ans || data.reply || data.text || data.output || '';
        const mistakes = data.mistakes_summary || data.mistake || '';
        const nextQ = data.next_question || '';
        const audioData = data.audio || data.audio_base64 || data.file;

        // 1. Premium Audio Card
        if (ans || audioData) {
            // Unique ID for this message instance
            const msgId = 'voice-' + Date.now() + Math.floor(Math.random() * 1000);

            // Store audio data globally
            if (!window.voiceDataStore) window.voiceDataStore = {};
            window.voiceDataStore[msgId] = {
                audio: audioData,
                text: ans,
                speed: 1.0 // Changed from 1.5 to 1.0 (Normal Speed)
            };

            const playIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="play-icon"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>`;

            const audioHtml = `
            <div class="voice-msg-container" id="${msgId}">
                <button class="voice-play-btn" onclick="toggleKhushiVoice('${msgId}')">
                    ${playIcon}
                </button>
                <div class="voice-waveform-box">
                    ${Array(18).fill('<div class="wave-bar"></div>').join('')}
                </div>
                <div class="voice-duration" id="dur-${msgId}">0:00</div>
            </div>`;

            addMessage('khushi', 'bot', audioHtml, true);

            // Auto-play the new voice message
            setTimeout(() => toggleKhushiVoice(msgId), 300);
        }

        // 2. Mistakes Bubble
        if (mistakes && !mistakes.includes('No mistakes')) {
            const mistakesHtml = `<div style="padding:4px"><strong>✏️ Mistakes Summary:</strong><br/><div style="margin-top:6px;white-space:pre-wrap">${mistakes}</div></div>`;
            addMessage('khushi', 'bot', mistakesHtml, true);
        } else if (mistakes) {
            const praiseHtml = `<div style="color:#15803d;font-weight:500">🎉 ${mistakes}</div>`;
            addMessage('khushi', 'bot', praiseHtml, true);
        }

        // 3. Next Question Bubble
        if (nextQ) {
            addMessage('khushi', 'bot', nextQ);
        }
    }

    // --- Premium Voice Logic ---
    window.currentVoice = null;     // { id, audio, speed }

    function stopKhushiVoicePlayback() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }

        if (!window.currentVoice) return;

        const { id, audio } = window.currentVoice;
        const playIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>`;

        try {
            audio.pause();
            audio.currentTime = 0;
        } catch (err) {
            console.warn('Failed to stop active Khushi audio:', err);
        }

        const container = document.getElementById(id);
        if (container) {
            container.classList.remove('playing');

            const playBtn = container.querySelector('.voice-play-btn');
            if (playBtn) {
                playBtn.classList.remove('playing');
                playBtn.innerHTML = playIconSVG;
            }

            const durationEl = document.getElementById(`dur-${id}`);
            if (durationEl) {
                durationEl.textContent = formatTime(audio.duration || 0);
            }
        }

        window.currentVoice = null;
    }

    window.toggleKhushiVoice = (id) => {
        const container = document.getElementById(id);
        const playBtn = container.querySelector('.voice-play-btn');
        const durationEl = document.getElementById(`dur-${id}`);
        const data = window.voiceDataStore[id];

        const playIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M8 5V19L19 12L8 5Z" fill="currentColor"/></svg>`;
        const pauseIconSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 19H10V5H6V19ZM14 5V19H18V5H14Z" fill="currentColor"/></svg>`;

        if (!data) return;

        // If playing other audio, stop it
        if (window.currentVoice && window.currentVoice.id !== id) {
            const prevContainer = document.getElementById(window.currentVoice.id);
            if (prevContainer) {
                prevContainer.classList.remove('playing');
                prevContainer.querySelector('.voice-play-btn').classList.remove('playing');
                prevContainer.querySelector('.voice-play-btn').innerHTML = playIconSVG;
            }
            window.currentVoice.audio.pause();
            window.currentVoice = null;
        }

        // Initialize Audio if needed
        if (!window.currentVoice || window.currentVoice.id !== id) {
            // Handle Base64 source
            let src = null;
            if (data.audio) {
                src = data.audio.startsWith('data:') ? data.audio : `data:audio/mp3;base64,${data.audio}`;
            }

            if (!src) {
                // TTS Fallback
                window.playTTS(data.text);
                return;
            }

            const audio = new Audio(src);
            // Resume functionality logic

            window.currentVoice = { id, audio, speed: 1 };

            // Event Listeners
            audio.addEventListener('ended', () => {
                container.classList.remove('playing');
                playBtn.classList.remove('playing');
                playBtn.innerHTML = playIconSVG;
                window.currentVoice = null;
                durationEl.textContent = formatTime(audio.duration || 0);
            });

            audio.addEventListener('timeupdate', () => {
                if (!audio.duration) return;
                // Show current progress or remaining? User asked for duration.
                // Typical chat app shows X:XX (progress)
                durationEl.textContent = formatTime(audio.currentTime);
            });

            audio.addEventListener('loadedmetadata', () => {
                durationEl.textContent = formatTime(audio.duration);
            });

            // Check if speed was selected before play (UI pills) OR use stored default
            const activeSpeedOpt = container.querySelector('.speed-opt.active');
            if (activeSpeedOpt) {
                const speed = parseFloat(activeSpeedOpt.textContent);
                if (!isNaN(speed)) audio.playbackRate = speed;
            } else if (data.speed) {
                audio.playbackRate = data.speed; // Use stored default (1.5)
            }
        }

        const audio = window.currentVoice.audio;

        if (audio.paused) {
            audio.play().then(() => {
                container.classList.add('playing');
                playBtn.classList.add('playing');
                playBtn.innerHTML = pauseIconSVG;
            }).catch(e => {
                console.error("Audio play failed", e);
                window.playTTS(data.text);
            });
        } else {
            audio.pause();
            container.classList.remove('playing');
            playBtn.classList.remove('playing');
            playBtn.innerHTML = playIconSVG;
        }
    };

    window.setVoiceSpeed = (id, speed) => {
        const container = document.getElementById(id);
        if (!container) return;

        // Update pills UI
        const pills = container.querySelectorAll('.speed-opt');
        pills.forEach(p => {
            const pSpeed = parseFloat(p.textContent);
            if (pSpeed === speed) p.classList.add('active');
            else p.classList.remove('active');
        });

        // Update Audio
        if (window.currentVoice && window.currentVoice.id === id) {
            window.currentVoice.audio.playbackRate = speed;
        }
    };

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Global TTS function
    window.playTTS = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop valid audio
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            // Try to set a female voice if available
            const voices = window.speechSynthesis.getVoices();
            const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Google US English'));
            if (femaleVoice) utterance.voice = femaleVoice;
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-Speech not supported in this browser.');
        }
    };

    function formatKhushiResponse(data) {
        const ans = data.ans || data.reply || data.text || data.output || '';
        const mistakes = data.mistakes_summary || data.mistake || '';
        const nextQ = data.next_question || '';

        let html = '';
        if (ans) html += `<div style="margin-bottom:8px">${ans}</div>`;
        if (mistakes && !mistakes.includes('No mistakes')) {
            html += `<div style="margin-top:8px;padding:8px 12px;background:rgba(239,68,68,0.08);border-left:3px solid #ef4444;border-radius:6px;font-size:13px"><strong>✏️ Mistakes:</strong><br/>${mistakes}</div>`;
        } else if (mistakes) {
            html += `<div style="margin-top:8px;padding:8px 12px;background:rgba(34,197,94,0.08);border-left:3px solid #22c55e;border-radius:6px;font-size:13px">🎉 ${mistakes}</div>`;
        }
        if (nextQ) html += `<div style="margin-top:8px;font-style:italic;color:#6366f1">💬 ${nextQ}</div>`;

        return html || JSON.stringify(data);
    }

    // ---- Voice Recording ----
    function initVoice() {
        setupVoiceForBot('fluent');
        setupVoiceForBot('khushi');
    }

    function setupVoiceForBot(type) {
        const micBtn = $(`#mic-${type}`);
        const sendBtn = $(`#send-${type}`);
        const cancelBtn = $(`#rec-cancel-${type}`);
        const inputBar = $(`#input-bar-${type}`);
        const timerEl = $(`#rec-timer-${type}`);
        const input = $(`#chat-input-${type}`);

        let recognition = null;
        let isRecording = false;
        let timerInterval = null;
        let seconds = 0;
        let mediaRecorder = null;
        let audioChunks = [];
        let isInitializing = false;
        let pendingStop = false;
        let recorderMimeType = '';
        let chunkMimeType = '';

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        micBtn.addEventListener('click', () => {
            if (isRecording) {
                stopRecording(true);
            } else {
                startRecording();
            }
        });

        // FIX 1: Send button should also stop & send during recording
        sendBtn.addEventListener('click', () => {
            if (isRecording) {
                stopRecording(true);
            }
        });

        cancelBtn.addEventListener('click', () => {
            stopRecording(false);
        });

        function startRecording() {
            if (isInitializing) return;

            // Recording should take mic focus: stop any currently playing bot audio immediately.
            stopKhushiVoicePlayback();

            isRecording = true;
            isInitializing = true;
            pendingStop = false;
            seconds = 0;
            audioChunks = [];
            chunkMimeType = '';
            recorderMimeType = ''; // Reset
            inputBar.classList.add('recording');
            timerEl.textContent = '0:00';

            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            // Safety: Clear input to prevent any phantom text
            input.value = '';
            input.dataset.voiceText = '';

            // Start actual audio recording for playback
            if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
                isInitializing = false;
                isRecording = false;
                inputBar.classList.remove('recording');
                showToast('Microphone recording is not supported in this browser.');
                return;
            }

            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(stream => {
                    const preferredMimeTypes = [
                        'audio/mp4;codecs=mp4a.40.2',
                        'audio/mp4',
                        'audio/webm;codecs=opus',
                        'audio/webm',
                        'audio/ogg;codecs=opus',
                        'audio/ogg'
                    ];
                    const supportsType = typeof MediaRecorder.isTypeSupported === 'function';
                    const selectedMimeType = supportsType
                        ? preferredMimeTypes.find(mime => MediaRecorder.isTypeSupported(mime))
                        : '';
                    const recorderOptions = selectedMimeType ? { mimeType: selectedMimeType } : undefined;

                    mediaRecorder = recorderOptions ? new MediaRecorder(stream, recorderOptions) : new MediaRecorder(stream);
                    recorderMimeType = mediaRecorder.mimeType || selectedMimeType || ''; // Capture browser-supported mime type

                    mediaRecorder.ondataavailable = (e) => {
                        if (e.data && e.data.size > 0) {
                            if (!chunkMimeType && e.data.type) chunkMimeType = e.data.type;
                            audioChunks.push(e.data);
                        }
                    };
                    mediaRecorder.onerror = (event) => {
                        console.warn('MediaRecorder error:', event?.error || event);
                    };

                    try {
                        // Small timeslice helps produce stable chunks across browsers.
                        mediaRecorder.start(250);
                    } catch (err) {
                        console.warn('MediaRecorder.start(250) failed, retrying without timeslice:', err);
                        mediaRecorder.start();
                    }

                    timerInterval = setInterval(() => {
                        seconds++;
                        const m = Math.floor(seconds / 60);
                        const s = seconds % 60;
                        timerEl.textContent = `${m}:${s.toString().padStart(2, '0')}`;
                    }, 1000);

                    isInitializing = false;

                    if (pendingStop) {
                        console.log('Handling pending stop after initialization');
                        stopRecording(true);
                    }
                })
                .catch(err => {
                    console.warn('Mic access denied:', err);
                    isInitializing = false;
                    isRecording = false;
                    inputBar.classList.remove('recording');
                    if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
                        showToast('Microphone permission is blocked. Allow mic access for Learn N Grow in Android app settings and try again.');
                    } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
                        showToast('No microphone was found on this device.');
                    } else {
                        showToast('Could not start microphone recording. Please try again.');
                    }
                });

            // Start speech-to-text in parallel
            // SpeechRecognition removed to prevent unwanted transcription
            /*
            if (SpeechRecognition) {
                recognition = new SpeechRecognition();
                recognition.lang = 'en-US';
                recognition.interimResults = true;
                recognition.continuous = true;

                let finalTranscript = '';

                recognition.onresult = (event) => {
                    let interim = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript + ' ';
                        } else {
                            interim += event.results[i][0].transcript;
                        }
                    }
                    input.dataset.voiceText = (finalTranscript + interim).trim();
                };

                recognition.onerror = (e) => {
                    if (e.error !== 'aborted') {
                        console.warn('Speech recognition error:', e.error);
                    }
                };

                recognition.onend = () => {
                    if (isRecording && recognition) {
                        try { recognition.start(); } catch (e) { }
                    }
                };

                try { recognition.start(); } catch (e) {
                    console.warn('Could not start speech recognition:', e);
                }
            }
            */
        }

        function stopRecording(shouldSend) {
            try {
                if (isInitializing) {
                    console.log('Recording is initializing, deferring stop...');
                    pendingStop = true;
                    return;
                }

                isRecording = false;
                inputBar.classList.remove('recording');
                if (timerInterval) {
                    clearInterval(timerInterval);
                    timerInterval = null;
                }

                // Safety check for recognition variable
                if (typeof recognition !== 'undefined' && recognition) {
                    try { recognition.stop(); } catch (e) { }
                    recognition = null;
                }

                // Stop media recorder and get audio blob
                const finalize = (audioBlob) => {
                    try {
                        if (shouldSend) {
                            if (audioBlob && audioBlob.size > 0) {
                                // Send audio directly to n8n for AI transcription
                                const durationSecs = Math.max(seconds, 1);
                                const audioUrl = URL.createObjectURL(audioBlob);
                                addVoiceMessage(type, durationSecs, audioUrl);
                                triggerBotResponse(type, audioBlob).catch(err => {
                                    console.error('TriggerBotResponse error:', err);
                                    showToast('Error sending message: ' + err.message);
                                });
                            } else {
                                console.warn('Voice recording failed: Empty audio blob.');
                                showToast('Voice recording failed. Please try again.');
                            }
                        }

                        input.dataset.voiceText = '';
                        seconds = 0;
                        if (timerEl) timerEl.textContent = '0:00';
                    } catch (finalErr) {
                        console.error('Finalize error:', finalErr);
                        showToast('Error processing recording: ' + finalErr.message);
                    }
                };

                if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                    const recorder = mediaRecorder;
                    recorder.onstop = () => {
                        try {
                            // Stop all mic tracks
                            if (recorder.stream) {
                                recorder.stream.getTracks().forEach(t => t.stop());
                            }

                            // Use the captured mimeType from initialization, fallback if needed
                            const blobMimeType = recorderMimeType || chunkMimeType || (audioChunks.length > 0 ? audioChunks[0].type : '') || 'audio/webm';
                            const blob = new Blob(audioChunks, { type: blobMimeType });
                            audioChunks = [];
                            chunkMimeType = '';
                            mediaRecorder = null;

                            console.log('Audio recording finished. Blob size:', blob.size, 'Type:', blob.type);

                            if (blob.size > 0) {
                                finalize(blob);
                            } else {
                                finalize(null);
                            }
                        } catch (onStopErr) {
                            console.error('Recorder onstop error:', onStopErr);
                            finalize(null);
                        }
                    };
                    try {
                        recorder.stop();
                    } catch (err) {
                        console.warn('Failed to stop recorder:', err);
                        finalize(null);
                    }
                } else {
                    finalize(null);
                }
            } catch (mainErr) {
                console.error('stopRecording fatal error:', mainErr);
                showToast('Error stopping recording: ' + mainErr.message);
            }
        }

        async function triggerBotResponse(botType, audioBlob = null) {
            const typing = $(`#typing-${botType}`);
            typing.classList.add('active');
            scrollChat(botType);

            if (botType === 'fluent') {
                let response;
                if (audioBlob) {
                    // Send audio file
                    response = await callFluentBot('', 'Voice', audioBlob);
                } else {
                    // Text message — use 'Chat' mode
                    const msgs = $$(`#chat-${botType}-messages .message.user .msg-bubble`);
                    const lastMsg = msgs.length ? msgs[msgs.length - 1].textContent : 'hello';
                    response = await callFluentBot(lastMsg, 'Chat');
                }

                typing.classList.remove('active');
                // Webhook replies are HTML-formatted; keep voice rendering aligned with text chat.
                addMessage(botType, 'bot', response, true);
            }
            else if (botType === 'khushi') {
                let data;
                if (audioBlob) {
                    data = await callKhushiBot('', 'Voice', audioBlob);
                } else {
                    // Text message — use 'Chat' mode
                    const msgs = $$(`#chat-${botType}-messages .message.user .msg-bubble`);
                    const lastMsg = msgs.length ? msgs[msgs.length - 1].textContent : 'hello';
                    data = await callKhushiBot(lastMsg, 'Chat');
                }

                typing.classList.remove('active');
                handleKhushiResponse(data);
            }
        }


        function addVoiceMessage(botType, durationSecs, audioUrl) {
            const container = $(`#chat-${botType}-messages`);
            const typing = $(`#typing-${botType}`);
            const now = new Date();
            const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const m = Math.floor(durationSecs / 60);
            const s = durationSecs % 60;
            const durStr = `${m}:${s.toString().padStart(2, '0')}`;

            const bars = Array.from({ length: 20 }, () => Math.floor(Math.random() * 18) + 6);
            const barHTML = bars.map(h => `<span style="height:${h}px"></span>`).join('');

            const msgDiv = document.createElement('div');
            msgDiv.className = 'message user';
            msgDiv.innerHTML = `
      <div>
        <div class="msg-bubble voice-bubble">
          <button class="voice-play-btn"><i data-lucide="play"></i></button>
          <div class="voice-waveform">${barHTML}</div>
          <span class="voice-duration">${durStr}</span>
        </div>
        <div class="msg-time">${time}</div>
      </div>
    `;

            container.insertBefore(msgDiv, typing);
            lucide.createIcons();
            scrollChat(botType);

            // FIX 2: Wire up play button for audio playback
            const playBtn = msgDiv.querySelector('.voice-play-btn');
            if (audioUrl) {
                const audio = new Audio(audioUrl);
                let isPlaying = false;
                playBtn.addEventListener('click', () => {
                    if (isPlaying) {
                        audio.pause();
                        audio.currentTime = 0;
                        playBtn.innerHTML = '<i data-lucide="play"></i>';
                        lucide.createIcons({ nodes: [playBtn] });
                        isPlaying = false;
                    } else {
                        audio.play().catch(e => {
                            console.error('Audio playback failed:', e);
                            showToast('Could not play audio. Please try again.');
                            isPlaying = false;
                            playBtn.innerHTML = '<i data-lucide="play"></i>';
                            lucide.createIcons({ nodes: [playBtn] });
                        });
                        playBtn.innerHTML = '<i data-lucide="pause"></i>';
                        lucide.createIcons({ nodes: [playBtn] });
                        isPlaying = true;
                    }
                });
                audio.addEventListener('ended', () => {
                    playBtn.innerHTML = '<i data-lucide="play"></i>';
                    lucide.createIcons({ nodes: [playBtn] });
                    isPlaying = false;
                });
            }
        }
    }

    // ---- Feedback ----
    function initFeedback() {
        const modal = $('#feedback-modal');
        const trigger = $('#feedback-trigger');
        const cancel = $('#fb-cancel');
        const form = $('#feedback-form');
        const openModal = () => modal?.classList.add('open');
        const closeModal = () => modal?.classList.remove('open');

        modalControllers.feedback = {
            open: openModal,
            close: closeModal
        };

        trigger?.addEventListener('click', e => {
            e.preventDefault();
            openModal();
        });

        cancel?.addEventListener('click', closeModal);

        modal?.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });

        form?.addEventListener('submit', e => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            const category = $('#fb-type').value;
            const message = $('#fb-message').value;

            const payload = {
                uid: currentUser?.uid || 'anonymous',
                name: currentUser?.name || 'Anonymous',
                email: currentUser?.email || 'No Email',
                category: category,
                message: message,
                timestamp: new Date().toISOString()
            };

            // n8n Webhook for Feedback
            const WEBHOOK_URL = 'https://n8n.ritesh-ai-automation.in/webhook/feedback';

            fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (response.ok) {
                        showToast('Feedback submitted. Thank you!');
                        closeModal();
                        form.reset();
                    } else {
                        throw new Error('Network response was not ok');
                    }
                })
                .catch(error => {
                    console.error('Error sending feedback:', error);
                    showToast('Failed to send feedback. Please try again.');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    function initTestSelector() {
        const modal = $('#test-selector-modal');
        const trigger = $('#test-trigger');
        const closeBtn = $('#test-selector-close');
        const selfAssessmentBtn = $('#select-self-assessment');
        const testSeriesList = $('#test-series-list');

        const closeModal = () => modal?.classList.remove('open');
        const openActivitySet = setId => {
            if (!setId || !ACTIVITY_SETS?.[setId]) return;
            ACTIVITY_SET_ID = setId;
            closeModal();
            navigateTo('activity-modals-have');
        };
        const renderTestSeriesOptions = () => {
            if (!testSeriesList) return;

            const testSeriesSets = getTestSeriesSets();
            testSeriesList.innerHTML = testSeriesSets.map(set => `
                <button class="test-selector-btn" type="button" data-activity-set="${escapeHTML(set.id)}">
                    <span>
                        <strong>${escapeHTML(set.title || 'Test Series')}</strong>
                        <small>${escapeHTML(set.selectorDescription || `${set.totalQuestions || 0} questions`)}</small>
                    </span>
                    <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>
                </button>
            `).join('');

            $$('[data-activity-set]', testSeriesList).forEach(button => {
                button.addEventListener('click', () => openActivitySet(button.dataset.activitySet));
            });

            if (window.lucide) lucide.createIcons();
        };
        const openModal = () => {
            renderTestSeriesOptions();
            modal?.classList.add('open');
        };

        modalControllers.testSelector = {
            open: openModal,
            close: closeModal
        };

        trigger?.addEventListener('click', e => {
            e.preventDefault();
            openModal();
        });

        closeBtn?.addEventListener('click', closeModal);

        modal?.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });

        selfAssessmentBtn?.addEventListener('click', () => {
            closeModal();
            navigateTo('activity-level-assessment');
        });
    }

    // ---- Profile ----
    function initProfile() {
        const toggle = $('#change-pw-toggle');
        const pwForm = $('#change-pw-form');
        const deleteModal = $('#delete-account-modal');
        const deleteForm = $('#delete-account-form');
        const deletePassword = $('#delete-account-password');
        const deleteConsent = $('#delete-account-consent');
        const deleteSubmit = $('#delete-account-submit');
        const deleteEmail = $('#delete-account-email');

        const closeDeleteModal = () => {
            deleteModal?.classList.remove('open');
            deleteForm?.reset();
        };

        const openDeleteModal = () => {
            if (deleteEmail) {
                deleteEmail.textContent = currentUser?.email || 'No email available';
            }
            if (deletePassword) deletePassword.value = '';
            if (deleteConsent) deleteConsent.checked = false;
            deleteModal?.classList.add('open');
            deletePassword?.focus();
        };

        toggle?.addEventListener('click', () => {
            pwForm.classList.toggle('open');
            toggle.textContent = pwForm.classList.contains('open') ? 'Cancel' : 'Change Password';
        });

        $('#pw-form')?.addEventListener('submit', e => {
            e.preventDefault();
            const newPw = $('#pw-new').value;
            const confirmPw = $('#pw-confirm').value;

            if (newPw.length < 6) {
                showToast('Password must be at least 6 characters');
                return;
            }
            if (newPw !== confirmPw) {
                showToast('Passwords do not match');
                return;
            }

            pwForm.classList.remove('open');
            toggle.textContent = 'Change Password';
            e.target.reset();
            showToast('Password updated');
        });

        $('#profile-logout')?.addEventListener('click', () => {
            logout();
        });

        $('#profile-delete-trigger')?.addEventListener('click', openDeleteModal);
        $('#delete-account-cancel')?.addEventListener('click', closeDeleteModal);

        deleteModal?.addEventListener('click', e => {
            if (e.target === deleteModal) closeDeleteModal();
        });

        deleteForm?.addEventListener('submit', async e => {
            e.preventDefault();

            if (!deleteConsent?.checked) {
                showToast('Please confirm that you understand this action is permanent.');
                return;
            }

            const password = deletePassword?.value?.trim() || '';
            if (!password) {
                showToast('Enter your current password to continue.');
                return;
            }

            const originalText = deleteSubmit?.textContent || 'Delete Permanently';
            if (deleteSubmit) {
                deleteSubmit.disabled = true;
                deleteSubmit.textContent = 'Deleting...';
            }

            try {
                await deleteCurrentAccount(password);
                closeDeleteModal();
            } catch (error) {
                console.error('Account deletion failed:', error);
                showToast(getFriendlyErrorMessage(error.code) || error.message || 'Could not delete account.');
            } finally {
                if (deleteSubmit) {
                    deleteSubmit.disabled = false;
                    deleteSubmit.textContent = originalText;
                }
            }
        });

        // ---- Photo Upload ----
        $('#profile-avatar-wrapper')?.addEventListener('click', () => {
            $('#profile-photo-input')?.click();
        });

        $('#profile-photo-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showToast('Photo must be under 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                const base64 = event.target.result;

                // Save to Firestore and local state
                currentUser.profilePhoto = base64;
                await updateUserData({ profilePhoto: base64 });

                displayProfilePhoto(base64);

                // Also update nav bar avatar
                const navAvatar = $('#nav-avatar');
                if (navAvatar) {
                    navAvatar.textContent = '';
                    navAvatar.innerHTML = `<img src="${base64}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
                }

                showToast('Profile photo updated!');
            };
            reader.readAsDataURL(file);
        });

        // ---- Name Editing ----
        const editBtn = $('#edit-name-btn');
        const nameEdit = $('#profile-name-edit');
        const nameRow = document.querySelector('.profile-name-row');

        editBtn?.addEventListener('click', () => {
            $('#profile-name-input').value = currentUser?.name || '';
            nameRow.style.display = 'none';
            nameEdit.style.display = 'flex';
            $('#profile-name-input').focus();
        });

        $('#cancel-name-btn')?.addEventListener('click', () => {
            nameEdit.style.display = 'none';
            nameRow.style.display = 'flex';
        });

        $('#save-name-btn')?.addEventListener('click', async () => {
            const newName = $('#profile-name-input').value.trim();
            if (!newName) {
                showToast('Name cannot be empty');
                return;
            }

            try {
                const user = auth.currentUser;
                if (user) {
                    await user.updateProfile({ displayName: newName });
                    currentUser.name = newName;
                    $('#profile-name').textContent = newName;

                    // Update initials avatar if no photo
                    if (!currentUser.profilePhoto) {
                        const initials = newName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                        $('#profile-avatar').textContent = initials;
                    }

                    nameEdit.style.display = 'none';
                    nameRow.style.display = 'flex';
                    showToast('Name updated!');
                }
            } catch (error) {
                console.error('Error updating name:', error);
                showToast('Failed to update name. Try again.');
            }
        });
    }

    function displayProfilePhoto(base64) {
        const avatarEl = $('#profile-avatar');
        avatarEl.textContent = '';
        avatarEl.innerHTML = `<img src="${base64}" alt="Profile Photo" />`;
    }

    function populateProfile() {
        if (!currentUser) return;

        // Check for saved photo first (from Firestore data)
        const savedPhoto = currentUser.profilePhoto || '';
        if (savedPhoto) {
            displayProfilePhoto(savedPhoto);
        } else {
            const initials = currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
            $('#profile-avatar').textContent = initials;
        }

        $('#profile-name').textContent = currentUser.name;
        $('#profile-email').textContent = currentUser.email;
        $('#profile-phone').textContent = currentUser.phone || MOCK.student.phone;
        $('#profile-member-since').textContent = MOCK.student.memberSince;

        // Fetch stats from Firestore (cached in currentUser)
        const fluent = currentUser.fluentSessions || 0;
        const khushi = currentUser.khushiSessions || 0;

        $('#profile-fluent-count').textContent = fluent;
        $('#profile-khushi-count').textContent = khushi;

        // Re-render Lucide icons for profile page
        if (window.lucide) lucide.createIcons();
    }

    // ---- Scroll Fade-in Animations ----
    function initScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry, i) => {
                    if (entry.isIntersecting) {
                        // Stagger delay
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                        }, i * 100);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
        );

        $$('.fade-in-section').forEach(el => observer.observe(el));
    }

    function triggerScrollAnimations() {
        $$('.fade-in-section').forEach((el, i) => {
            el.classList.remove('visible');
            setTimeout(() => {
                el.classList.add('visible');
            }, i * 100);
        });
    }

    // ---- Helpers ----
    function getFriendlyErrorMessage(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-credential':
                return 'Incorrect email or password.';
            case 'auth/user-not-found':
                return 'No account found with this email.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'Email is already registered.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/network-request-failed':
                return 'Network error. Please check your connection.';
            case 'auth/too-many-requests':
                return 'Too many attempts. Please try again later.';
            case 'auth/operation-not-allowed':
                return 'Operation not allowed. Please contact support.';
            case 'auth/requires-recent-login':
                return 'Please sign in again and retry account deletion.';
            default:
                return 'An error occurred. Please try again.';
        }
    }

    // ---- Toast ----
    function showToast(msg) {
        const toast = $('#toast');
        if (!toast) {
            console.log('Toast:', msg);
            return;
        }

        const text = String(msg ?? '').trim();
        if (!text) {
            toast.classList.remove('show');
            toast.textContent = '';
            toast.hidden = true;
            return;
        }

        clearTimeout(toastTimer);
        clearTimeout(toastCleanupTimer);
        toast.hidden = false;
        toast.textContent = text;
        toast.classList.remove('show');
        window.requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
            toastCleanupTimer = window.setTimeout(() => {
                if (!toast.classList.contains('show')) {
                    toast.textContent = '';
                    toast.hidden = true;
                }
            }, 260);
        }, 2800);
    }

    // ---- Announcements (Supabase Direct Read) ----
    function startAnnouncementsAutoRefresh() {
        if (announcementsRefreshTimer) return;
        announcementsRefreshTimer = setInterval(() => {
            if (!currentUser || currentPage !== 'dashboard') return;
            loadAnnouncements();
        }, ANNOUNCEMENTS_REFRESH_MS);
    }

    function stopAnnouncementsAutoRefresh() {
        if (!announcementsRefreshTimer) return;
        clearInterval(announcementsRefreshTimer);
        announcementsRefreshTimer = null;
    }

    async function loadAnnouncements() {
        try {
            // Get Supabase client from window
            const supabaseClient = window.supabase;
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                console.warn('Supabase client not ready yet');
                // Retry after a short delay
                setTimeout(loadAnnouncements, 500);
                return;
            }

            // Fetch directly from Supabase
            const { data, error } = await supabaseClient
                .from('announcements')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error('Supabase error:', error);
                announcementsCache = [];
                updateAnnouncementBadge();
                populateAnnouncementPopup();
                return;
            }

            if (data && data.length > 0) {
                announcementsCache = data.map(item => {
                    let parsedDate = item.date ? new Date(item.date) : new Date();
                    if (Number.isNaN(parsedDate.getTime())) parsedDate = new Date();

                    return {
                        id: item.id,
                        title: item.title || '',
                        message: item.message || '',
                        date: parsedDate,
                        createdAt: item.created_at ? new Date(item.created_at) : new Date()
                    };
                });
                updateAnnouncementBadge();
                populateAnnouncementPopup();
                if (window.lucide) lucide.createIcons();
            } else {
                announcementsCache = [];
                updateAnnouncementBadge();
                populateAnnouncementPopup();
            }
        } catch (err) {
            console.error('Failed to load announcements:', err);
            announcementsCache = [];
            updateAnnouncementBadge();
            populateAnnouncementPopup();
        } finally {
            renderAnnouncementBar();
            renderAnnouncementCalendar();
        }
    }

    function renderAnnouncementBar() {
        const bar = $('#announcement-bar');
        const list = $('#announcement-list');
        if (!bar || !list) return;

        if (announcementsCache.length === 0) {
            list.innerHTML = '';
            bar.hidden = true;
            bar.classList.remove('collapsed');
            setAnnouncementCalendarVisible(false);
            return;
        }

        list.innerHTML = announcementsCache.map(a => {
            const dateStr = a.date.toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
            return `<div class="announcement-item">
                <div class="announcement-item-title">${escapeHTML(a.title)}</div>
                <div class="announcement-item-message">${escapeHTML(a.message)}</div>
                <div class="announcement-item-date">${escapeHTML(dateStr)}</div>
            </div>`;
        }).join('');

        bar.hidden = false;
        bar.classList.add('collapsed');

        const header = bar.querySelector('.announcement-bar-header');
        if (header) {
            header.style.cursor = 'pointer';
            header.onclick = () => {
                bar.classList.toggle('collapsed');
            };
        }

        if (window.lucide) lucide.createIcons();
    }

    function initAnnouncementBar() {
        const dismissBtn = $('#announcement-dismiss');
        if (dismissBtn) dismissBtn.style.display = 'none';

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return;
            if (!currentUser || currentPage !== 'dashboard') return;
            loadAnnouncements();
        });
    }

})();
