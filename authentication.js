let auth0Client = null;
// Keep isAuthenticated declaration here and make it accessible
window.isAuthenticated = false;

const configureAuth0 = async () => {
    try {
        auth0Client = await window.auth0.createAuth0Client({
            domain: config.AUTH0_DOMAIN,
            clientId: config.AUTH0_CLIENT_ID,
            authorizationParams: {
                redirect_uri: config.AUTH0_CALLBACK_URL
            },
            cacheLocation: 'localstorage'
        });

        // Handle callback
        if (window.location.search.includes("code=")) {
            await handleAuthRedirect();
        }

        window.isAuthenticated = await auth0Client.isAuthenticated();
        return window.isAuthenticated;
    } catch (err) {
        console.error("Error configuring Auth0:", err);
        return false;
    }
};

const handleAuthRedirect = async () => {
    try {
        // Process the redirect callback and remove query parameters
        await auth0Client.handleRedirectCallback();
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
        console.error("Error handling Auth0 redirect:", error);
    }
};

const updateUI = async () => {
    try {
        const isAuthenticated = await auth0Client.isAuthenticated();
        const profileButton = document.getElementById('profile-button');
        const profileAvatar = document.getElementById('profile-avatar');
        const profileName = document.getElementById('profile-name');
        const dropdownMenu = document.getElementById('dropdown-menu');
        const userProfile = document.getElementById('user-profile');

        if (isAuthenticated) {
            const user = await auth0Client.getUser();
            
            // Update profile button
            profileAvatar.src = user.picture || 'https://upload.wikimedia.org/wikipedia/commons/4/41/Default-avatar%E5%BE%97%E5%BE%97.png?20240324104624';
            profileName.textContent = user.name || 'User';
            userProfile.style.display = 'block';

            // Update dropdown menu
            dropdownMenu.innerHTML = `
                <a href="#" class="user-welcome">
                    <img src="${user.picture || 'https://upload.wikimedia.org/wikipedia/commons/4/41/Default-avatar%E5%BE%97%E5%BE%97.png?20240324104624'}" alt="User Avatar" class="user-avatar">
                    Welcome, ${user.name || "User"}
                </a>
                <a href="#" id="logout" class="logout-link">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </a>`;

            // Add logout handler
            document.getElementById('logout').addEventListener('click', () => {
                auth0Client.logout({ returnTo: window.location.origin });
            });
        } else {
            userProfile.style.display = 'none';
        }
    } catch (err) {
        console.error('Error updating UI:', err);
    }
};

const toggleDropdown = () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    if (dropdownMenu) {
        dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
    }
};

// Update window event listeners
document.addEventListener('DOMContentLoaded', () => {
    const profileButton = document.getElementById('profile-button');
    if (profileButton) {
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const dropdown = document.getElementById('dropdown-menu');
        const userProfile = document.getElementById('user-profile');
        if (dropdown && userProfile && !userProfile.contains(event.target)) {
            dropdown.style.display = 'none';
        }
    });
});

const initAuth = async () => {
    await configureAuth0();
    await updateUI();
};

// Export methods for use in other files
window.auth = {
    init: initAuth,
    login: async () => {
        try {
            await auth0Client.loginWithRedirect();
        } catch (err) {
            console.error("Error logging in:", err);
        }
    },
    logout: async () => {
        try {
            await auth0Client.logout({
                returnTo: window.location.origin
            });
        } catch (err) {
            console.error("Error logging out:", err);
        }
    },
    getUser: async () => {
        try {
            return await auth0Client.getUser();
        } catch (err) {
            console.error("Error getting user:", err);
            return null;
        }
    },
    // Update isAuthenticated export to use window.isAuthenticated
    isAuthenticated: () => window.isAuthenticated
};