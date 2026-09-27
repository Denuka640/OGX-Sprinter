// Automatically hide splash screen after 2 seconds
window.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splashOverlay');
    if (splash) {
        setTimeout(() => {
            splash.classList.add('hide-splash');
        }, 2000);
    }
});

// Modal Control
function openLoginModal() {
    document.getElementById('authModal').style.display = 'flex';
}

function closeLoginModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Switch between Sign In and Sign Up tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const tabSignIn = document.getElementById('tabSignIn');
    const tabSignUp = document.getElementById('tabSignUp');

    if (tab === 'signin') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        tabSignIn.style.color = '#037ef3';
        tabSignIn.style.borderBottom = '2px solid #037ef3';
        tabSignUp.style.color = '#a0aec0';
        tabSignUp.style.borderBottom = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        tabSignUp.style.color = '#037ef3';
        tabSignUp.style.borderBottom = '2px solid #037ef3';
        tabSignIn.style.color = '#a0aec0';
        tabSignIn.style.borderBottom = 'none';
    }
}

// Sign In Action
function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    if (!email) {
        alert("Please enter your email.");
        return;
    }
    showProfileView("Member", "Team Vengeance");
}

// Sign Up Action
function handleSignUp() {
    const name = document.getElementById('signUpName').value;
    const team = document.getElementById('signUpTeam').value;
    const email = document.getElementById('signUpEmail').value;

    if (!name || !team || !email) {
        alert("Please fill in all fields.");
        return;
    }

    alert(`Account created for ${name}!`);
    showProfileView(name, team);
}

// Show Profile Dashboard
function showProfileView(name, team) {
    document.getElementById('authTabs').style.display = 'none';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'none';
    
    document.getElementById('profileName').textContent = name;
    document.getElementById('profileTeam').textContent = team;
    document.getElementById('profileDashboard').style.display = 'block';
    
    document.getElementById('loginBtn').textContent = 'My Profile';
}

// Logout Action
function handleLogout() {
    document.getElementById('authTabs').style.display = 'flex';
    document.getElementById('profileDashboard').style.display = 'none';
    switchAuthTab('signin');
    document.getElementById('loginBtn').textContent = 'Member Login';
    closeLoginModal();
}

// Update Post Count
function updatePostCount() {
    const count = document.getElementById('postCount').value;
    alert(`Successfully updated post count to ${count}!`);
}

// Upload Profile Photo
function uploadProfilePhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profileImage').src = e.target.result;
        }
        reader.readAsDataURL(file);
    }
}