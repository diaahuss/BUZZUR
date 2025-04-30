document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginScreen = document.getElementById('login-screen');
    const signupScreen = document.getElementById('signup-screen');
    const appScreen = document.getElementById('app-screen');
    
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    
    // Initialize - Show login screen by default
    loginScreen.classList.add('active');
    
    // Navigation
    showSignupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginScreen.classList.remove('active');
        signupScreen.classList.add('active');
    });
    
    showLoginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupScreen.classList.remove('active');
        loginScreen.classList.add('active');
    });
    
    // Form submissions
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // For demo purposes, just show app screen
        loginScreen.classList.remove('active');
        signupScreen.classList.remove('active');
        appScreen.style.display = 'flex';
        
        // Initialize app content here
        initializeApp();
    });
    
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // For demo purposes, just show app screen
        loginScreen.classList.remove('active');
        signupScreen.classList.remove('active');
        appScreen.style.display = 'flex';
        
        // Initialize app content here
        initializeApp();
    });
    
    function initializeApp() {
        // Your app initialization code here
        console.log('App initialized');
    }
    
    // Password toggle functionality
    document.querySelectorAll('.toggle-password').forEach(icon => {
        icon.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye-slash');
        });
    });
});
