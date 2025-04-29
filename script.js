// Global variables
let groups = [];

// DOM elements
const groupNameInput = document.getElementById('groupName');
const membersInput = document.getElementById('members');
const createGroupBtn = document.getElementById('createGroupBtn');
const loadGroupsBtn = document.getElementById('loadGroupsBtn');
const groupsList = document.getElementById('groupsList');
const selectedGroup = document.getElementById('selectedGroup');
const messageText = document.getElementById('messageText');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const statusMessage = document.getElementById('statusMessage');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadGroupsFromStorage();
    updateGroupDropdown();
});

createGroupBtn.addEventListener('click', createGroup);
loadGroupsBtn.addEventListener('click', loadGroupsFromStorage);
sendMessageBtn.addEventListener('click', sendGroupMessage);

// Group management functions
function createGroup() {
    const groupName = groupNameInput.value.trim();
    const members = membersInput.value.trim();
    
    if (!groupName || !members) {
        showStatus('Please fill in all fields', 'error');
        return;
    }
    
    // Validate phone numbers
    const phoneNumbers = members.split(',')
        .map(num => num.trim())
        .filter(num => {
            if (!isValidPhoneNumber(num)) {
                showStatus(`Invalid phone number: ${num}`, 'error');
                return false;
            }
            return true;
        });
    
    if (phoneNumbers.length === 0) {
        showStatus('No valid phone numbers provided', 'error');
        return;
    }
    
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        members: phoneNumbers,
        createdAt: new Date().toISOString()
    };
    
    groups.push(newGroup);
    saveGroupsToStorage();
    updateGroupDropdown();
    renderGroupsList();
    
    groupNameInput.value = '';
    membersInput.value = '';
    
    showStatus('Group created successfully!', 'success');
}

function loadGroupsFromStorage() {
    const savedGroups = localStorage.getItem('messageGroups');
    if (savedGroups) {
        groups = JSON.parse(savedGroups);
        renderGroupsList();
        showStatus('Groups loaded successfully', 'success');
    } else {
        showStatus('No groups found in storage', 'error');
    }
}

function saveGroupsToStorage() {
    localStorage.setItem('messageGroups', JSON.stringify(groups));
}

function renderGroupsList() {
    if (groups.length === 0) {
        groupsList.innerHTML = '<p>No groups created yet</p>';
        return;
    }
    
    groupsList.innerHTML = '';
    groups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'group-item';
        groupElement.innerHTML = `
            <h3>${group.name}</h3>
            <p><strong>Members:</strong> ${group.members.join(', ')}</p>
            <p><small>Created: ${new Date(group.createdAt).toLocaleString()}</small></p>
            <button class="btn-secondary delete-group" data-id="${group.id}">Delete</button>
        `;
        groupsList.appendChild(groupElement);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-group').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupId = e.target.getAttribute('data-id');
            deleteGroup(groupId);
        });
    });
}

function deleteGroup(groupId) {
    groups = groups.filter(group => group.id !== groupId);
    saveGroupsToStorage();
    updateGroupDropdown();
    renderGroupsList();
    showStatus('Group deleted successfully', 'success');
}

function updateGroupDropdown() {
    selectedGroup.innerHTML = '<option value="">-- Select a group --</option>';
    groups.forEach(group => {
        const option = document.createElement('option');
        option.value = group.id;
        option.textContent = group.name;
        selectedGroup.appendChild(option);
    });
}

// Messaging functions
async function sendGroupMessage() {
    const groupId = selectedGroup.value;
    const message = messageText.value.trim();
    
    if (!groupId || !message) {
        showStatus('Please select a group and enter a message', 'error');
        return;
    }
    
    const group = groups.find(g => g.id === groupId);
    if (!group) {
        showStatus('Selected group not found', 'error');
        return;
    }
    
    try {
        // Send to each member
        for (const phoneNumber of group.members) {
            await sendTwilioMessage(phoneNumber, message);
        }
        
        showStatus(`Message sent to ${group.members.length} recipients`, 'success');
        messageText.value = '';
    } catch (error) {
        console.error('Error sending messages:', error);
        showStatus(`Failed to send messages: ${error.message}`, 'error');
    }
}

async function sendTwilioMessage(to, body) {
    // Replace with your actual Twilio credentials and endpoint
    const accountSid = 'YOUR_TWILIO_ACCOUNT_SID';
    const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
    const fromNumber = 'YOUR_TWILIO_PHONE_NUMBER';
    
    const endpoint = 'https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json';
    
    const formData = new FormData();
    formData.append('To', to);
    formData.append('From', fromNumber);
    formData.append('Body', body);
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken)
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Twilio API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Message sent:', data.sid);
        return data;
    } catch (error) {
        console.error('Error sending Twilio message:', error);
        throw error;
    }
}

// Utility functions
function isValidPhoneNumber(phoneNumber) {
    // Simple validation - adjust as needed
    return /^\+?[1-9]\d{1,14}$/.test(phoneNumber);
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
    statusMessage.style.display = 'block';
}
