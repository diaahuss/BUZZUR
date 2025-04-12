const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Mock database (replace with real database in production)
let groups = [];
let members = {};

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.get('/api/groups', (req, res) => {
    res.json(groups);
});

app.post('/api/groups', (req, res) => {
    const { name } = req.body;
    const newGroup = {
        id: Date.now().toString(),
        name
    };
    groups.push(newGroup);
    members[newGroup.id] = [];
    res.status(201).json(newGroup);
});

app.get('/api/groups/:groupId/members', (req, res) => {
    const { groupId } = req.params;
    if (!members[groupId]) {
        return res.status(404).json({ error: 'Group not found' });
    }
    res.json(members[groupId]);
});

app.post('/api/groups/:groupId/members', (req, res) => {
    const { groupId } = req.params;
    const { phone } = req.body;
    
    if (!members[groupId]) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    const newMember = {
        id: Date.now().toString(),
        phone
    };
    
    members[groupId].push(newMember);
    res.status(201).json(newMember);
});

app.post('/api/groups/:groupId/buzz', (req, res) => {
    const { groupId } = req.params;
    
    if (!members[groupId]) {
        return res.status(404).json({ error: 'Group not found' });
    }
    
    // In a real app, here you would integrate with a notification service
    console.log(`BUZZING group ${groupId} with ${members[groupId].length} members`);
    
    res.json({ success: true, message: 'Buzz sent to group members' });
});

// Serve HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
