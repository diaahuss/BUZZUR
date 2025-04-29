class BuzzAllApp {
    constructor() {
        // DOM Elements
        this.dom = {
            authScreens: document.getElementById('auth-screens'),
            appScreens: document.getElementById('app-screens'),
            loginScreen: document.getElementById('login-screen'),
            signupScreen: document.getElementById('signup-screen'),
            groupsScreen: document.getElementById('groups-screen'),
            groupManagementScreen: document.getElementById('group-management-screen'),
            buzzScreen: document.getElementById('buzz-screen'),
            groupsList: document.getElementById('groups-list'),
            membersList: document.getElementById('members-list'),
            buzzMembersList: document.getElementById('buzz-members-list'),
            addMemberModal: document.getElementById('add-member-modal'),
            buzzSound: document.getElementById('buzz-sound')
        };

        // State
        this.state = {
            currentUser: null,
            currentGroup: null,
            groups: JSON.parse(localStorage.getItem('buzzall-groups')) || [],
            users: JSON.parse(localStorage.getItem('buzzall-users')) || [
                { phone: '1234567890', password: 'password123', name: 'Test User' }
            ]
        };

        // Initialize
        this.initAuth();
        this.initGroups();
        this.initBuzz();
        this.showScreen('login');
    }

    // ======================
    // CORE FUNCTIONALITY
    // ======================

    showScreen(screenName) {
        // Hide all screens first
        document.querySelectorAll('.auth-screen, .app-screen').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });

        // Show the requested screen
        switch(screenName) {
            case 'login':
                this.dom.loginScreen.classList.add('active');
                break;
            case 'signup':
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

    saveData() {
        localStorage.setItem('buzzall-users', JSON.stringify(this.state.users));
        localStorage.setItem('buzzall-groups', JSON.stringify(this.state.groups));
    }

    // ======================
    // AUTHENTICATION
    // ======================

    initAuth() {
        // Login/Signup toggle
        document.getElementById('show-signup').addEventListener('click', () => this.showScreen('signup'));
        document.getElementById('show-login').addEventListener('click', () => this.showScreen('login'));

        // Login form
        document.getElementById('login-btn').addEventListener('click', () => {
            const phone = document.getElementById('login-phone').value;
            const password = document.getElementById('login-password').value;
            this.handleLogin(phone, password);
        });

        // Signup form
        document.getElementById('signup-btn').addEventListener('click', () => {
            const name = document.getElementById('signup-name').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            
            if (password !== confirm) {
                alert("Passwords don't match");
                return;
            }
            
            this.handleSignup(name, phone, password);
        });

        // Password toggle
        document.querySelectorAll('.toggle-pw').forEach(btn => {
            btn.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                input.type = input.type === 'password' ? 'text' : 'password';
                this.innerHTML = input.type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
            });
        });
    }

    handleLogin(phone, password) {
        const user = this.state.users.find(u => u.phone === phone && u.password === password);
        
        if (user) {
            this.state.currentUser = user;
            this.showScreen('groups');
        } else {
            alert('Invalid phone number or password');
        }
    }

    handleSignup(name, phone, password) {
        if (this.state.users.some(u => u.phone === phone)) {
            alert('Phone number already registered');
            return;
        }
        
        const newUser = { name, phone, password };
        this.state.users.push(newUser);
        this.state.currentUser = newUser;
        this.saveData();
        this.showScreen('groups');
    }

    // ======================
    // GROUPS MANAGEMENT
    // ======================

    initGroups() {
        // Navigation
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.state.currentUser = null;
            this.showScreen('login');
        });

        document.getElementById('back-to-groups').addEventListener('click', () => {
            this.showScreen('groups');
        });

        // Group creation
        document.getElementById('create-group-btn').addEventListener('click', () => {
            this.createNewGroup();
        });

        // Group management
        document.getElementById('save-group-btn').addEventListener('click', () => {
            this.saveGroupChanges();
        });

        document.getElementById('delete-group-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this group?')) {
                this.deleteCurrentGroup();
            }
        });

        // Member management
        document.getElementById('add-member-btn').addEventListener('click', () => {
            this.dom.addMemberModal.classList.add('active');
        });

        document.getElementById('confirm-add-member').addEventListener('click', () => {
            const name = document.getElementById('new-member-name').value;
            const phone = document.getElementById('new-member-phone').value;
            
            if (!name || !phone) {
                alert('Please enter both name and phone number');
                return;
            }
            
            this.addMemberToGroup(name, phone);
        });

        document.getElementById('cancel-add-member').addEventListener('click', () => {
            this.dom.addMemberModal.classList.remove('active');
        });
    }

    loadGroups() {
        this.dom.groupsList.innerHTML = '';
        
        const userGroups = this.state.groups.filter(group => 
            group.members.some(member => member.phone === this.state.currentUser.phone)
        );
        
        if (userGroups.length === 0) {
            this.dom.groupsList.innerHTML = '<p class="empty-state">No groups yet. Create your first group!</p>';
            return;
        }
        
        userGroups.forEach(group => {
            const groupCard = document.createElement('div');
            groupCard.className = 'group-card';
            groupCard.innerHTML = `
                <h3>${group.name}</h3>
                <p>${group.members.length} members</p>
                <div class="group-actions">
                    <button class="btn small edit-group" data-id="${group.id}">
                        <i class="fas fa-edit"></i> Manage
                    </button>
                    <button class="btn small buzz-group" data-id="${group.id}">
                        <i class="fas fa-bell"></i> Buzz
                    </button>
                </div>
            `;
            this.dom.groupsList.appendChild(groupCard);
            
            // Add event listeners
            groupCard.querySelector('.edit-group').addEventListener('click', () => {
                this.state.currentGroup = group;
                this.showScreen('group-management');
            });
            
            groupCard.querySelector('.buzz-group').addEventListener('click', () => {
                this.state.currentGroup = group;
                this.showScreen('buzz');
            });
        });
    }

    createNewGroup() {
        const groupName = prompt('Enter group name:');
        if (!groupName) return;
        
        const newGroup = {
            id: Date.now().toString(),
            name: groupName,
            members: [{
                name: this.state.currentUser.name,
                phone: this.state.currentUser.phone
            }]
        };
        
        this.state.groups.push(newGroup);
        this.saveData();
        this.loadGroups();
    }

    loadGroupManagement() {
        if (!this.state.currentGroup) return;
        
        document.getElementById('group-management-title').textContent = this.state.currentGroup.name;
        document.getElementById('group-name-input').value = this.state.currentGroup.name;
        
        this.dom.membersList.innerHTML = '';
        this.state.currentGroup.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            
            const canRemove = member.phone !== this.state.currentUser.phone;
            
            memberItem.innerHTML = `
                <span>${member.name} (${member.phone})</span>
                ${canRemove ? `
                <div class="actions">
                    <button class="btn icon danger remove-member" data-phone="${member.phone}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ` : ''}
            `;
            
            this.dom.membersList.appendChild(memberItem);
            
            if (canRemove) {
                memberItem.querySelector('.remove-member').addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.removeMemberFromGroup(member.phone);
                });
            }
        });
    }

    addMemberToGroup(name, phone) {
        if (this.state.currentGroup.members.some(m => m.phone === phone)) {
            alert('This member is already in the group');
            return;
        }
        
        this.state.currentGroup.members.push({ name, phone });
        this.saveData();
        this.loadGroupManagement();
        this.dom.addMemberModal.classList.remove('active');
        
        // Clear inputs
        document.getElementById('new-member-name').value = '';
        document.getElementById('new-member-phone').value = '';
    }

    removeMemberFromGroup(phone) {
        this.state.currentGroup.members = this.state.currentGroup.members.filter(m => m.phone !== phone);
        this.saveData();
        this.loadGroupManagement();
    }

    saveGroupChanges() {
        const newName = document.getElementById('group-name-input').value;
        if (!newName) {
            alert('Please enter a group name');
            return;
        }
        
        this.state.currentGroup.name = newName;
        this.saveData();
        this.showScreen('groups');
    }

    deleteCurrentGroup() {
        this.state.groups = this.state.groups.filter(g => g.id !== this.state.currentGroup.id);
        this.saveData();
        this.state.currentGroup = null;
        this.showScreen('groups');
    }

    // ======================
    // BUZZ FUNCTIONALITY
    // ======================

    initBuzz() {
        document.getElementById('back-from-buzz').addEventListener('click', () => {
            this.showScreen('groups');
        });

        document.getElementById('send-buzz-btn').addEventListener('click', () => {
            this.sendBuzz();
        });

        document.getElementById('select-all').addEventListener('click', () => {
            this.selectAllMembers(true);
        });

        document.getElementById('deselect-all').addEventListener('click', () => {
            this.selectAllMembers(false);
        });
    }

    loadBuzzScreen() {
        if (!this.state.currentGroup) return;
        
        document.getElementById('buzz-group-title').textContent = this.state.currentGroup.name;
        this.dom.buzzMembersList.innerHTML = '';
        
        this.state.currentGroup.members.forEach(member => {
            if (member.phone === this.state.currentUser.phone) return;
            
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            memberItem.innerHTML = `
                <label>
                    <input type="checkbox" class="member-checkbox" data-phone="${member.phone}">
                    ${member.name} (${member.phone})
                </label>
            `;
            this.dom.buzzMembersList.appendChild(memberItem);
        });
    }

    selectAllMembers(select) {
        document.querySelectorAll('.member-checkbox').forEach(checkbox => {
            checkbox.checked = select;
        });
    }

    sendBuzz() {
        const selected = Array.from(document.querySelectorAll('.member-checkbox:checked'));
        
        if (selected.length === 0) {
            alert('Please select at least one member to buzz');
            return;
        }
        
        // Play buzz sound
        this.dom.buzzSound.currentTime = 0;
        this.dom.buzzSound.play().catch(e => console.log('Audio play failed:', e));
        
        // Show confirmation
        alert(`Buzz sent to ${selected.length} member(s)!`);
        
        // Return to groups screen
        this.showScreen('groups');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BuzzAllApp();
});
