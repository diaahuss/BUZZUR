document.addEventListener('DOMContentLoaded', function() {
    class BuzzAllApp {
        constructor() {
            this.initDomElements();
            this.initState();
            this.bindEventListeners();
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
                
                // Auth Form Elements
                loginPhone: document.getElementById('login-phone'),
                loginPassword: document.getElementById('login-password'),
                signupName: document.getElementById('signup-name'),
                signupPhone: document.getElementById('signup-phone'),
                signupPassword: document.getElementById('signup-password'),
                signupConfirm: document.getElementById('signup-confirm'),
                
                // Lists
                groupsList: document.getElementById('groups-list'),
                membersList: document.getElementById('members-list'),
                buzzMembersList: document.getElementById('buzz-members-list'),
                
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
                    { 
                        phone: '1234567890', 
                        password: 'password123', 
                        name: 'Test User',
                        groups: ['family-group'] 
                    }
                ]
            };

            // Initialize with sample data if empty
            if (this.state.groups.length === 0) {
                this.state.groups.push({
                    id: 'family-group',
                    name: 'Family',
                    members: [
                        { name: 'Test User', phone: '1234567890' },
                        { name: 'Mom', phone: '0987654321' }
                    ]
                });
                this.saveData();
            }
        }

        bindEventListeners() {
            // Use arrow functions to maintain 'this' context
            document.getElementById('show-signup')?.addEventListener('click', () => this.showScreen('signup'));
            document.getElementById('show-login')?.addEventListener('click', () => this.showScreen('login'));
            
            // Fixed login handler with proper 'this' binding
            document.getElementById('login-btn')?.addEventListener('click', () => this.handleLogin());
            document.getElementById('signup-btn')?.addEventListener('click', () => this.handleSignup());

            // Password toggle - working implementation
            document.querySelectorAll('.toggle-pw').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const input = e.currentTarget.parentElement.querySelector('input');
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    e.currentTarget.innerHTML = isPassword 
                        ? '<i class="fas fa-eye-slash"></i>' 
                        : '<i class="fas fa-eye"></i>';
                });
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
            ].filter(Boolean);
            
            screens.forEach(screen => {
                screen.style.display = 'none';
                screen.classList.remove('active');
            });

            // Show requested screen
            switch(screenName) {
                case 'login':
                    this.dom.loginScreen.style.display = 'flex';
                    this.dom.loginScreen.classList.add('active');
                    break;
                case 'signup':
                    this.dom.signupScreen.style.display = 'flex';
                    this.dom.signupScreen.classList.add('active');
                    break;
                case 'groups':
                    this.dom.groupsScreen.style.display = 'flex';
                    this.loadGroups();
                    break;
                case 'group-management':
                    this.dom.groupManagementScreen.style.display = 'flex';
                    this.loadGroupManagement();
                    break;
                case 'buzz':
                    this.dom.buzzScreen.style.display = 'flex';
                    this.loadBuzzScreen();
                    break;
            }
        }

        handleLogin() {
            const phone = this.dom.loginPhone.value;
            const password = this.dom.loginPassword.value;
            
            const user = this.state.users.find(u => 
                u.phone === phone && u.password === password
            );
            
            if (user) {
                this.state.currentUser = user;
                this.showScreen('groups');
                console.log('Login successful!', user);
            } else {
                alert('Invalid phone number or password');
            }
        }

        handleSignup() {
            const name = this.dom.signupName.value;
            const phone = this.dom.signupPhone.value;
            const password = this.dom.signupPassword.value;
            const confirm = this.dom.signupConfirm.value;
            
            if (password !== confirm) {
                alert("Passwords don't match");
                return;
            }
            
            if (this.state.users.some(u => u.phone === phone)) {
                alert('Phone number already registered');
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

        saveData() {
            localStorage.setItem('buzzall-users', JSON.stringify(this.state.users));
            localStorage.setItem('buzzall-groups', JSON.stringify(this.state.groups));
        }

        // [Include all other methods from previous implementation]
    }

    // Initialize the app
    new BuzzAllApp();
});
