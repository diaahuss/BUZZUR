/*********************
 * APP STATE
 *********************/
const AppState = {
    currentUser: null,
    groups: [],
    DEBUG: true
};

/*********************
 * CORE UTILITIES
 *********************/
const Utils = {
    debugLog(...args) {
        if (AppState.DEBUG) console.log('[DEBUG]', ...args);
    },

    getElement(id) {
        const el = document.getElementById(id);
        if (!el) console.warn(`Element #${id} not found`);
        return el;
    },

    switchScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        const target = this.getElement(screenId);
        if (target) {
            target.style.display = 'block';
            this.debugLog(`Switched to screen: ${screenId}`);
        }
    },

    addListener(id, event, handler) {
        const element = this.getElement(id);
        if (element) {
            element.addEventListener(event, handler);
            this.debugLog(`Added ${event} listener to #${id}`);
        } else {
            console.warn(`Element #${id} not found for event listener`);
        }
    }
};

/*********************
 * AUTHENTICATION SERVICE
 *********************/
const AuthService = {
    login() {
        const phone = Utils.getElement('login-phone')?.value;
        const password = Utils.getElement('login-password')?.value;
        
        if (!phone || !password) {
            alert('Please enter both phone and password');
            return;
        }
        
        AppState.currentUser = { phone, password };
        Utils.debugLog('User logged in:', phone);
        Utils.switchScreen('my-groups-screen');
        GroupService.renderGroups();
    },

    signUp() {
        const name = Utils.getElement('signup-name')?.value.trim();
        const phone = Utils.getElement('signup-phone')?.value.trim();
        const password = Utils.getElement('signup-password')?.value;
        const confirmPassword = Utils.getElement('signup-confirm-password')?.value;
        
        if (!name || !phone || !password || !confirmPassword) {
            alert('Please fill all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        AppState.currentUser = { name, phone, password };
        alert('Registration successful!');
        Utils.switchScreen('login-screen');
    },

    logout() {
        AppState.currentUser = null;
        Utils.switchScreen('login-screen');
    },

    togglePasswordVisibility() {
        const input = Utils.getElement('login-password');
        const button = Utils.getElement('toggle-password');
        if (input && button) {
            input.type = input.type === 'password' ? 'text' : 'password';
            button.innerHTML = input.type === 'password' 
                ? '<i class="fas fa-eye"></i>' 
                : '<i class="fas fa-eye-slash"></i>';
        }
    }
};

/*********************
 * GROUP SERVICE
 *********************/
const GroupService = {
    showCreateGroupScreen() {
        const nameInput = Utils.getElement('new-group-name');
        if (nameInput) nameInput.value = '';
        Utils.switchScreen('create-group-screen');
    },

    createGroup() {
        const nameInput = Utils.getElement('new-group-name');
        if (!nameInput) return;
        
        const groupName = nameInput.value.trim();
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }
        
        const newGroup = {
            id: Date.now().toString(),
            name: groupName,
            members: []
        };
        
        AppState.groups.push(newGroup);
        Utils.debugLog('Group created:', groupName);
        alert(`Group "${groupName}" created successfully!`);
        Utils.switchScreen('my-groups-screen');
        this.renderGroups();
    },

    editGroup(groupId) {
        const group = AppState.groups.find(g => g.id === groupId);
        if (!group) return;
        
        const nameInput = Utils.getElement('edit-group-name');
        const idInput = Utils.getElement('edit-group-id');
        if (nameInput && idInput) {
            nameInput.value = group.name;
            idInput.value = group.id;
        }
        this.renderMembers(group.members);
        Utils.switchScreen('edit-group-screen');
    },

    renderMembers(members) {
        const container = Utils.getElement('current-members');
        if (!container) return;
        
        container.innerHTML = members.map(member => `
            <div class="member-item">
                <span>${member.name} (${member.phone})</span>
                <button class="btn small" onclick="GroupService.removeMember('${member.phone}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    addMember() {
        const groupId = Utils.getElement('edit-group-id')?.value;
        const name = Utils.getElement('new-member-name')?.value.trim();
        const phone = Utils.getElement('new-member-phone')?.value.trim();
        
        if (!name || !phone) {
            alert('Please enter both name and phone');
            return;
        }
        
        const group = AppState.groups.find(g => g.id === groupId);
        if (group) {
            if (group.members.some(m => m.phone === phone)) {
                alert('This member already exists in the group');
                return;
            }
            
            group.members.push({ name, phone });
            Utils.getElement('new-member-name').value = '';
            Utils.getElement('new-member-phone').value = '';
            this.renderMembers(group.members);
        }
    },

    removeMember(phone) {
        const groupId = Utils.getElement('edit-group-id')?.value;
        const group = AppState.groups.find(g => g.id === groupId);
        if (group) {
            group.members = group.members.filter(m => m.phone !== phone);
            this.renderMembers(group.members);
        }
    },

    saveGroupEdits() {
        const groupId = Utils.getElement('edit-group-id')?.value;
        const newName = Utils.getElement('edit-group-name')?.value.trim();
        
        const group = AppState.groups.find(g => g.id === groupId);
        if (group) {
            group.name = newName;
            alert('Group updated successfully!');
            Utils.switchScreen('my-groups-screen');
            this.renderGroups();
        }
    },

    renderGroups() {
        const container = Utils.getElement('group-list');
        if (!container) return;
        
        container.innerHTML = AppState.groups.map(group => `
            <div class="group-card" data-group-id="${group.id}">
                <h3>${group.name}</h3>
                <div class="group-actions">
                    <button class="btn" onclick="GroupService.editGroup('${group.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn" onclick="BuzzService.startBuzz('${group.id}')">
                        <i class="fas fa-bell"></i> Buzz
                    </button>
                </div>
            </div>
        `).join('');
    }
};

/*********************
 * BUZZ SERVICE
 *********************/
const BuzzService = {
    init() {
        document.getElementById('send-buzz-btn')?.addEventListener('click', () => this.sendBuzz());
        document.getElementById('cancel-buzz')?.addEventListener('click', () => {
            Utils.switchScreen('my-groups-screen');
        });
    },

    startBuzz(groupId) {
        const group = AppState.groups.find(g => g.id === groupId);
        if (!group) return;
        
        document.getElementById('current-buzz-group').value = groupId;
        this.renderBuzzMembers(group.members);
        Utils.switchScreen('buzz-screen');
    },

    renderBuzzMembers(members) {
        const container = document.getElementById('member-list');
        if (!container) return;
        
        container.innerHTML = members.map(member => `
            <div class="member-card">
                <label>
                    <input type="checkbox" value="${member.phone}" checked>
                    ${member.name} (${member.phone})
                </label>
            </div>
        `).join('');
    },

    async sendBuzz() {
        // 1. Get selected numbers
        const selected = Array.from(
            document.querySelectorAll('#member-list input:checked')
        ).map(el => el.value.trim());

        // 2. Validate numbers
        if (selected.length === 0) {
            alert('Please select at least one member');
            return;
        }

        // 3. Play sound
        try {
            const sound = document.getElementById('buzz-sound');
            if (sound) {
                sound.currentTime = 0;
                await sound.play();
            }
        } catch (e) {
            console.warn('Audio error:', e);
        }

        // 4. Send buzzes
        try {
            const results = await Promise.allSettled(
                selected.map(phone => 
                    fetch('https://cadet-goldfinch-4268.twil.io/send-buzz', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'Accept': 'application/json'
                        },
                        body: new URLSearchParams({ to: phone })
                    })
                    .then(res => res.json())
                    .then(data => ({ phone, data }))
                )
            );

            // 5. Process results
            const failed = results.filter(r => r.status === 'rejected' || !r.value.data.success);
            if (failed.length > 0) {
                const errorList = failed.map(f => 
                    `• ${f.reason?.message || f.value?.data?.error || 'Unknown error'}`
                ).join('\n');
                alert(`Failed to send to ${failed.length}/${selected.length}:\n${errorList}`);
            } else {
                alert(`✅ Buzz sent to ${selected.length} members!`);
            }
        } catch (err) {
            console.error('Buzz failed:', err);
            alert('Network error - check console');
        }
    }
};

// Initialize on app start
BuzzService.init();

/*********************
 * NAVIGATION SERVICE
 *********************/
const NavigationService = {
    initNavigation() {
        Utils.addListener('to-signup', 'click', () => Utils.switchScreen('signup-screen'));
        Utils.addListener('to-login', 'click', () => Utils.switchScreen('login-screen'));
        Utils.addListener('refresh-groups', 'click', GroupService.renderGroups);
        Utils.addListener('cancel-create-group', 'click', () => Utils.switchScreen('my-groups-screen'));
        Utils.addListener('cancel-edit-group', 'click', () => Utils.switchScreen('my-groups-screen'));
        Utils.addListener('cancel-buzz', 'click', () => Utils.switchScreen('my-groups-screen'));
    }
};

/*********************
 * INITIALIZATION
 *********************/
function initializeApp() {
    // Initialize event listeners
    Utils.addListener('login-btn', 'click', AuthService.login);
    Utils.addListener('signup-btn', 'click', AuthService.signUp);
    Utils.addListener('logout-btn', 'click', AuthService.logout);
    Utils.addListener('create-group-btn', 'click', GroupService.showCreateGroupScreen);
    Utils.addListener('confirm-create-group', 'click', GroupService.createGroup);
    Utils.addListener('add-member-btn', 'click', GroupService.addMember);
    Utils.addListener('save-group-btn', 'click', GroupService.saveGroupEdits);
    Utils.addListener('send-buzz-btn', 'click', BuzzService.sendBuzz);
    Utils.addListener('toggle-password', 'click', AuthService.togglePasswordVisibility);
    
    // Initialize navigation
    NavigationService.initNavigation();
    
    // Start on login screen
    Utils.switchScreen('login-screen');
    Utils.debugLog('App initialized');
}

document.addEventListener('DOMContentLoaded', initializeApp);
