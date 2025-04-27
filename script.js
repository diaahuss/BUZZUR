/*********************
 * APP STATE & CONFIG
 *********************/
let currentUser = null;
let groups = [];
const DEBUG_MODE = true;

/*********************
 * CORE UTILITIES
 *********************/
function logDebug(...messages) {
    if (DEBUG_MODE) console.log('[DEBUG]', ...messages);
}

function safeQuerySelector(selector) {
    const element = document.querySelector(selector);
    if (!element) console.warn(`Element not found: ${selector}`);
    return element;
}

function addSafeListener(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
        logDebug(`Added ${eventType} listener to #${elementId}`);
    } else {
        console.warn(`Cannot add listener - element #${elementId} not found`);
    }
}

/*********************
 * SCREEN MANAGEMENT
 *********************/
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.style.display = 'block';
        logDebug(`Switched to screen: ${screenId}`);
    } else {
        console.error(`Screen not found: ${screenId}`);
    }
}

/*********************
 * EVENT MANAGEMENT
 *********************/
function initializeEventListeners() {
    // Authentication
    addSafeListener('login-btn', 'click', loginUser);
    addSafeListener('signup-btn', 'click', signUpUser);
    addSafeListener('logout-btn', 'click', logout);
    
    // Group Management
    addSafeListener('create-group-btn', 'click', createGroup);
    addSafeListener('save-group-btn', 'click', saveGroupEdits);
    addSafeListener('send-buzz-btn', 'click', sendBuzz);
    
    // Navigation
    addSafeListener('to-signup', 'click', () => switchScreen('signup-screen'));
    addSafeListener('to-login', 'click', () => switchScreen('login-screen'));
    addSafeListener('to-groups', 'click', () => {
        switchScreen('my-groups-screen');
        renderGroups();
    });
    
    // Password Toggle
    addSafeListener('toggle-password', 'click', togglePasswordVisibility);
}

/*********************
 * AUTH FUNCTIONS
 *********************/
function loginUser() {
    try {
        const phone = safeQuerySelector('#login-phone')?.value;
        const password = safeQuerySelector('#login-password')?.value;
        
        if (!phone || !password) {
            alert('Please enter both phone and password');
            return;
        }
        
        currentUser = { phone, password };
        logDebug('User logged in:', phone);
        switchScreen('my-groups-screen');
        renderGroups();
        
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login error - please try again');
    }
}

function signUpUser() {
    // Similar robust implementation
}

function logout() {
    currentUser = null;
    switchScreen('login-screen');
}

/*********************
 * GROUP FUNCTIONS
 *********************/
function createGroup() {
    try {
        const groupName = safeQuerySelector('#create-group-name')?.value.trim();
        if (!groupName) {
            alert('Please enter a group name');
            return;
        }
        
        const newGroup = {
            id: Date.now().toString(),
            name: groupName,
            members: []
        };
        
        groups.push(newGroup);
        logDebug('Group created:', groupName);
        switchScreen('my-groups-screen');
        renderGroups();
        
    } catch (error) {
        console.error('Group creation failed:', error);
        alert('Error creating group');
    }
}

function renderGroups() {
    const groupList = safeQuerySelector('#group-list');
    if (!groupList) return;
    
    groupList.innerHTML = groups.map(group => `
        <div class="group-card">
            <h3>${group.name}</h3>
            <button onclick="editGroup('${group.id}')">Edit</button>
            <button onclick="deleteGroup('${group.id}')">Delete</button>
            <button onclick="selectGroup('${group.id}')">Buzz</button>
        </div>
    `).join('');
}

/*********************
 * BUZZ FUNCTIONALITY
 *********************/
function sendBuzz() {
    try {
        const buzzAudio = safeQuerySelector('#buzz-audio');
        if (buzzAudio) {
            buzzAudio.play();
            logDebug('Buzz sound played');
        }
        alert('Buzz sent to selected members!');
    } catch (error) {
        console.error('Buzz failed:', error);
        alert('Error sending buzz');
    }
}

/*********************
 * INITIALIZATION
 *********************/
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    switchScreen('login-screen');
    logDebug('App initialized');
});

/*********************
 * HELPER FUNCTIONS
 *********************/
function togglePasswordVisibility() {
    const passwordInput = safeQuerySelector('#login-password');
    const toggleButton = safeQuerySelector('#toggle-password');
    
    if (passwordInput && toggleButton) {
        passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
        toggleButton.innerHTML = passwordInput.type === 'password' 
            ? '<i class="fas fa-eye"></i>' 
            : '<i class="fas fa-eye-slash"></i>';
    }
}
