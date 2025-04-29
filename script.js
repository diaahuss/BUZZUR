document.addEventListener('DOMContentLoaded', function() {
    class BuzzAllApp {
        constructor() {
            // First initialize DOM references
            this.cacheDomElements();
            
            // Then initialize state
            this.initState();
            
            // Then set up event listeners
            this.bindEvents();
            
            // Finally show the initial screen
            this.showScreen('login');
        }

        cacheDomElements() {
            // Main screens
            this.screens = {
                login: document.getElementById('login-screen'),
                signup: document.getElementById('signup-screen'),
                groups: document.getElementById('groups-screen'),
                groupManagement: document.getElementById('group-management-screen'),
                buzz: document.getElementById('buzz-screen')
            };

            // Login form elements
            this.loginForm = {
                phone: document.getElementById('login-phone'),
                password: document.getElementById('login-password'),
                button: document.getElementById('login-btn')
            };

            // Signup form elements
            this.signupForm = {
                name: document.getElementById('signup-name'),
                phone: document.getElementById('signup-phone'),
                password: document.getElementById('signup-password'),
                confirm: document.getElementById('signup-confirm'),
                button: document.getElementById('signup-btn')
            };

            // Navigation elements
            this.nav = {
                showSignup: document.getElementById('show-signup'),
                showLogin: document.getElementById('show-login'),
                logout: document.getElementById('logout-btn')
            };

            // Other elements
            this.elements = {
                groupsList: document.getElementById('groups-list'),
                membersList: document.getElementById('members-list'),
                buzzMembersList: document.getElementById('buzz-members-list'),
                buzzSound: document.getElementById('buzz-sound')
            };

            // Verify all required elements exist
            this.verifyDomElements();
        }

        verifyDomElements() {
            const requiredElements = [
                ...Object.values(this.screens).filter(Boolean),
                ...Object.values(this.loginForm).filter(Boolean),
                ...Object.values(this.signupForm).filter(Boolean),
                ...Object.values(this.nav).filter(Boolean),
                this.elements.groupsList,
                this.elements.buzzSound
            ];

            if (requiredElements.some(el => !el)) {
                console.error('Missing required DOM elements');
            }
        }

        initState() {
            this.state = {
                currentUser: null,
                currentGroup: null,
                users: JSON.parse(localStorage.getItem('buzzall-users')) || [
                    {
                        phone: '1234567890',
                        password: 'password123',
                        name: 'Test User',
                        groups: ['family-group']
                    }
                ],
                groups: JSON.parse(localStorage.getItem('buzzall-groups')) || [
                    {
                        id: 'family-group',
                        name: 'Family',
                        members: [
                            { name: 'Test User', phone: '1234567890' },
                            { name: 'Mom', phone: '0987654321' }
                        ]
                    }
                ]
            };
        }

        bindEvents() {
            // Navigation
            if (this.nav.showSignup) this.nav.showSignup.addEventListener('click', () => this.showScreen('signup'));
            if (this.nav.showLogin) this.nav.showLogin.addEventListener('click', () => this.showScreen('login'));
            if (this.nav.logout) this.nav.logout.addEventListener('click', () => this.logout());

            // Login
            if (this.loginForm.button) {
                this.loginForm.button.addEventListener('click', () => this.handleLogin());
            }

            // Signup
            if (this.signupForm.button) {
                this.signupForm.button.addEventListener('click', () => this.handleSignup());
            }

            // Password toggles
            document.querySelectorAll('.toggle-pw').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const input = e.currentTarget.parentElement.querySelector('input');
                    if (input) {
                        const isPassword = input.type === 'password';
                        input.type = isPassword ? 'text' : 'password';
                        e.currentTarget.innerHTML = isPassword 
                            ? '<i class="fas fa-eye-slash"></i>' 
                            : '<i class="fas fa-eye"></i>';
                    }
                });
            });
        }

        showScreen(screenName) {
            // Hide all screens
            Object.values(this.screens).forEach(screen => {
                if (screen) {
                    screen.style.display = 'none';
                    screen.classList.remove('active');
                }
            });

            // Show requested screen
            const targetScreen = this.screens[screenName];
            if (targetScreen) {
                targetScreen.style.display = 'flex';
                targetScreen.classList.add('active');
                
                // Load data if needed
                if (screenName === 'groups') this.loadGroups();
                if (screenName === 'groupManagement') this.loadGroupManagement();
                if (screenName === 'buzz') this.loadBuzzScreen();
            } else {
                console.error(`Screen ${screenName} not found`);
            }
        }

        handleLogin() {
            const phone = this.loginForm.phone?.value;
            const password = this.loginForm.password?.value;

            if (!phone || !password) {
                alert('Please enter both phone and password');
                return;
            }

            const user = this.state.users.find(u => 
                u.phone === phone && u.password === password
            );

            if (user) {
                this.state.currentUser = user;
                this.showScreen('groups');
            } else {
                alert('Invalid credentials');
            }
        }

        handleSignup() {
            const name = this.signupForm.name?.value;
            const phone = this.signupForm.phone?.value;
            const password = this.signupForm.password?.value;
            const confirm = this.signupForm.confirm?.value;

            if (!name || !phone || !password || !confirm) {
                alert('Please fill all fields');
                return;
            }

            if (password !== confirm) {
                alert("Passwords don't match");
                return;
            }

            if (this.state.users.some(u => u.phone === phone)) {
                alert('Phone already registered');
                return;
            }

            const newUser = {
                name,
                phone,
                password,
                groups: []
            };

            this.state.users.push(newUser);
            this.state.currentUser = newUser;
            this.saveData();
            this.showScreen('groups');
        }

        logout() {
            this.state.currentUser = null;
            this.showScreen('login');
        }

        saveData() {
            localStorage.setItem('buzzall-users', JSON.stringify(this.state.users));
            localStorage.setItem('buzzall-groups', JSON.stringify(this.state.groups));
        }

        // [Include other methods like loadGroups, loadGroupManagement, etc.]
    }

    // Initialize the app
    new BuzzAllApp();
});
