document.addEventListener('DOMContentLoaded', function() {
    class BuzzAllApp {
        constructor() {
            // Initialize after DOM is loaded
            this.initDomElements();
            this.initState();
            this.initEventListeners();
            this.showScreen('login');
        }

        initDomElements() {
            this.dom = {
                // Auth Screens
                loginScreen: document.getElementById('login-screen'),
                signupScreen: document.getElementById('signup-screen'),
                
                // App Screens
                groupsScreen: document.getElementById('groups-screen'),
                groupManagementScreen: document.getElementById('group-management-screen'),
                buzzScreen: document.getElementById('buzz-screen'),
                
                // Lists
                groupsList: document.getElementById('groups-list'),
                membersList: document.getElementById('members-list'),
                buzzMembersList: document.getElementById('buzz-members-list'),
                
                // Modals
                addMemberModal: document.getElementById('add-member-modal'),
                
                // Audio
                buzzSound: document.getElementById('buzz-sound')
            };
        }

        initState() {
            this.state = {
                currentUser: null,
                currentGroup: null,
                groups: JSON.parse(localStorage.getItem('buzzall-groups')) || [],
                users: JSON.parse(localStorage.getItem('buzzall-users')) || [
                    { phone: '1234567890', password: 'password123', name: 'Test User' }
                ]
            };
        }

        initEventListeners() {
            // Auth Event Listeners
            document.getElementById('show-signup')?.addEventListener('click', () => this.showScreen('signup'));
            document.getElementById('show-login')?.addEventListener('click', () => this.showScreen('login'));
            document.getElementById('login-btn')?.addEventListener('click', this.handleLogin.bind(this));
            document.getElementById('signup-btn')?.addEventListener('click', this.handleSignup.bind(this));

            // Password Toggles
            document.querySelectorAll('.toggle-pw').forEach(btn => {
                btn.addEventListener('click', function() {
                    const input = this.parentElement.querySelector('input');
                    input.type = input.type === 'password' ? 'text' : 'password';
                    this.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
                });
            });

            // Groups Event Listeners
            document.getElementById('logout-btn')?.addEventListener('click', () => {
                this.state.currentUser = null;
                this.showScreen('login');
            });
            document.getElementById('back-to-groups')?.addEventListener('click', () => this.showScreen('groups'));
            document.getElementById('create-group-btn')?.addEventListener('click', this.createNewGroup.bind(this));
            document.getElementById('save-group-btn')?.addEventListener('click', this.saveGroupChanges.bind(this));
            document.getElementById('delete-group-btn')?.addEventListener('click', this.deleteCurrentGroup.bind(this));
            document.getElementById('add-member-btn')?.addEventListener('click', () => {
                this.dom.addMemberModal.classList.add('active');
            });

            // Buzz Event Listeners
            document.getElementById('back-from-buzz')?.addEventListener('click', () => this.showScreen('groups'));
            document.getElementById('send-buzz-btn')?.addEventListener('click', this.sendBuzz.bind(this));
            document.getElementById('select-all')?.addEventListener('click', () => this.selectAllMembers(true));
            document.getElementById('deselect-all')?.addEventListener('click', () => this.selectAllMembers(false));

            // Member Management
            document.getElementById('confirm-add-member')?.addEventListener('click', this.addMemberToGroup.bind(this));
            document.getElementById('cancel-add-member')?.addEventListener('click', () => {
                this.dom.addMemberModal.classList.remove('active');
            });
        }

        showScreen(screenName) {
            // Hide all screens first
            const screens = [
                this.dom.loginScreen,
                this.dom.signupScreen,
                this.dom.groupsScreen,
                this.dom.groupManagementScreen,
                this.dom.buzzScreen
            ];
            
            screens.forEach(screen => {
                if (screen) {
                    screen.style.display = 'none';
                    screen.classList.remove('active');
                }
            });

            // Show the requested screen
            switch(screenName) {
                case 'login':
                    if (this.dom.loginScreen) {
                        this.dom.loginScreen.style.display = 'flex';
                        this.dom.loginScreen.classList.add('active');
                    }
                    break;
                case 'signup':
                    if (this.dom.signupScreen) {
                        this.dom.signupScreen.style.display = 'flex';
                        this.dom.signupScreen.classList.add('active');
                    }
                    break;
                case 'groups':
                    if (this.dom.groupsScreen) {
                        this.dom.groupsScreen.style.display = 'flex';
                        this.loadGroups();
                    }
                    break;
                case 'group-management':
                    if (this.dom.groupManagementScreen) {
                        this.dom.groupManagementScreen.style.display = 'flex';
                        this.loadGroupManagement();
                    }
                    break;
                case 'buzz':
                    if (this.dom.buzzScreen) {
                        this.dom.buzzScreen.style.display = 'flex';
                        this.loadBuzzScreen();
                    }
                    break;
            }
        }

        // [Rest of your methods remain the same...]
        // Include all other methods from the previous implementation (handleLogin, handleSignup, etc.)
        // Make sure to add the saveData() method and all group/buzz related methods
    }

    // Initialize the app
    new BuzzAllApp();
});
