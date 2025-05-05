// Simplified Buzzur App JavaScript

// DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  const screens = {
    login: document.getElementById('login-screen'),
    signup: document.getElementById('signup-screen'),
    app: document.getElementById('app-screen'),
    group: document.getElementById('group-screen')
  };

  const forms = {
    login: document.getElementById('login-form'),
    signup: document.getElementById('signup-form')
  };

  const buttons = {
    showSignup: document.getElementById('show-signup'),
    showLogin: document.getElementById('show-login'),
    logout: document.getElementById('logout-btn'),
    back: document.getElementById('back-btn'),
    createGroup: document.getElementById('create-group-btn'),
    deleteGroup: document.getElementById('delete-group-btn'),
    addMember: document.getElementById('add-member-btn'),
    removeMembers: document.getElementById('remove-members-btn'),
    buzzSelected: document.getElementById('buzz-selected-btn'),
    buzzAll: document.getElementById('buzz-all-btn')
  };

  const modals = {
    createGroup: document.getElementById('create-group-modal'),
    addMember: document.getElementById('add-member-modal')
  };

  const inputs = {
    newGroupName: document.getElementById('new-group-name'),
    memberName: document.getElementById('member-name'),
    memberPhone: document.getElementById('member-phone')
  };

  const lists = {
    groups: document.getElementById('groups-list'),
    members: document.getElementById('members-list')
  };

  const groupTitle = document.getElementById('group-title');
  const buzzSound = document.getElementById('buzz-sound');

  let authToken = null;
  let groups = [];
  let currentGroup = null;

  // Navigation
  function show(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
  }

  // Event handlers
  buttons.showSignup.onclick = e => { e.preventDefault(); show('signup'); };
  buttons.showLogin.onclick = e => { e.preventDefault(); show('login'); };
  buttons.logout.onclick = () => { authToken = null; show('login'); };
  buttons.back.onclick = () => show('app');

  forms.login.onsubmit = async e => {
    e.preventDefault();
    const email = forms.login.querySelector('input[type="email"]').value;
    const password = forms.login.querySelector('input[type="password"]').value;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      authToken = data.token;
      groups = data.groups || [];
      renderGroups();
      show('app');
    } catch {
      alert('Login failed');
    }
  };

  forms.signup.onsubmit = async e => {
    e.preventDefault();
    const name = forms.signup.querySelector('input[placeholder="Full Name"]').value;
    const email = forms.signup.querySelector('input[type="email"]').value;
    const password = forms.signup.querySelector('input[type="password"]').value;
    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      authToken = data.token;
      show('app');
    } catch {
      alert('Signup failed');
    }
  };

  // Group rendering
  function renderGroups() {
    lists.groups.innerHTML = groups.length
      ? ''
      : '<div class="empty-message">No groups yet.</div>';

    groups.forEach(group => {
      const el = document.createElement('div');
      el.className = 'group-item';
      el.innerHTML = `<div><h4>${group.name}</h4><p>${group.members.length} members</p></div><i class="fas fa-chevron-right"></i>`;
      el.onclick = () => {
        currentGroup = group;
        groupTitle.textContent = group.name;
        renderMembers();
        show('group');
      };
      lists.groups.appendChild(el);
    });
  }

  function renderMembers() {
    lists.members.innerHTML = currentGroup.members.length
      ? ''
      : '<div class="empty-message">No members yet.</div>';
    currentGroup.members.forEach(m => {
      const el = document.createElement('div');
      el.className = 'member-item';
      el.innerHTML = `<div><h4>${m.name}</h4><p>${m.phone}</p></div><input type="checkbox" class="member-checkbox" data-id="${m.id}">`;
      lists.members.appendChild(el);
    });
  }

  // Group management
  buttons.createGroup.onclick = () => toggle(modals.createGroup, true);
  document.getElementById('cancel-create').onclick = () => toggle(modals.createGroup, false);
  document.getElementById('confirm-create').onclick = async () => {
    const name = inputs.newGroupName.value.trim();
    if (!name) return alert('Enter group name');
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name })
      });
      const newGroup = await res.json();
      if (!res.ok) throw new Error();
      groups.push(newGroup);
      renderGroups();
      toggle(modals.createGroup, false);
      inputs.newGroupName.value = '';
    } catch {
      alert('Failed to create group');
    }
  };

  buttons.deleteGroup.onclick = async () => {
    if (!confirm(`Delete group "${currentGroup.name}"?`)) return;
    try {
      const res = await fetch(`/api/groups/${currentGroup.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!res.ok) throw new Error();
      groups = groups.filter(g => g.id !== currentGroup.id);
      renderGroups();
      show('app');
    } catch {
      alert('Delete failed');
    }
  };

  // Member management
  buttons.addMember.onclick = () => toggle(modals.addMember, true);
  document.getElementById('cancel-add').onclick = () => toggle(modals.addMember, false);
  document.getElementById('confirm-add').onclick = async () => {
    const name = inputs.memberName.value.trim();
    const phone = inputs.memberPhone.value.trim();
    if (!name || !phone) return alert('Enter name and phone');
    try {
      const res = await fetch(`/api/groups/${currentGroup.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name, phone })
      });
      const newMember = await res.json();
      if (!res.ok) throw new Error();
      currentGroup.members.push(newMember);
      renderMembers();
      toggle(modals.addMember, false);
      inputs.memberName.value = inputs.memberPhone.value = '';
    } catch {
      alert('Add member failed');
    }
  };

  buttons.removeMembers.onclick = async () => {
    const ids = [...document.querySelectorAll('.member-checkbox:checked')].map(cb => cb.dataset.id);
    try {
      for (const id of ids) {
        await fetch(`/api/groups/${currentGroup.id}/members/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        currentGroup.members = currentGroup.members.filter(m => m.id != id);
      }
      renderMembers();
    } catch {
      alert('Remove members failed');
    }
  };

  // Buzz
  function buzz(ids) {
    buzzSound.play();
    // You can integrate a socket emit or API call here if needed
    alert(`Buzz sent to ${ids.length} members`);
  }

  buttons.buzzSelected.onclick = () => {
    const ids = [...document.querySelectorAll('.member-checkbox:checked')].map(cb => cb.dataset.id);
    if (ids.length) buzz(ids);
  };
  buttons.buzzAll.onclick = () => {
    const ids = currentGroup.members.map(m => m.id);
    if (ids.length) buzz(ids);
  };

  // Modal toggle helper
  function toggle(el, show) {
    el.style.display = show ? 'block' : 'none';
  }
});
