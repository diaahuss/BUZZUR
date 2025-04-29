document.addEventListener('DOMContentLoaded', function() {
    class BuzzAllApp {
        constructor() {
            this.initDomElements();
            this.initState();
            this.initEventListeners();
            this.showScreen('login');
        }

        initDomElements() {
            // Core screens
            this.dom = {
                loginScreen: document.getElementById('login-screen'),
                signupScreen: document.getElementById('signup-screen'),
                groupsScreen: document.getElementById('groups-screen'),
                groupManagementScreen: document.getElementById('group-management-screen'),
                buzzScreen: document.getElementById('buzz-screen'),
                
                // Forms and inputs
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

            // Initialize with a sample group if none exists
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

        initEventListeners() {
            // Auth Event Listeners
            document.getElementById('show-signup')?.addEventListener('click', () => this.showScreen('signup'));
            document.getElementById('show-login')?.addEventListener('click', () => this.showScreen('login'));
            document.getElementById('login-btn')?.addEventListener('click', () => this.handleLogin());
            
            // Password Toggles - Fixed implementation
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

            // [Rest of your event listeners...]
        }

        // Fixed Login Function
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

        // [Rest of your methods...]
        
        saveData() {
            localStorage.setItem('buzzall-users', JSON.stringify(this.state.users));
            localStorage.setItem('buzzall-groups', JSON.stringify(this.state.groups));
        }
    }

    // Initialize the app
    new BuzzAllApp();
});
