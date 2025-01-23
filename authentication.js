let auth0Client = null;
window.isAuthenticated = false;

const configureAuth0 = async () => {
    try {
        // Wait for config to be available
        if (!window.config) {
            throw new Error('Config not initialized');
        }

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
    init: async () => {
        let retries = 3;
        while (retries > 0) {
            try {
                await configureAuth0();
                if (auth0Client) {
                    await updateUI();
                    return true;
                }
            } catch (err) {
                console.error("Auth initialization attempt failed:", err);
                retries--;
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        throw new Error('Failed to initialize Auth0 after multiple attempts');
    },
    login: async () => {
        try {
            if (!auth0Client) {
                await configureAuth0();
            }
            if (auth0Client) {
                await auth0Client.loginWithRedirect();
            } else {
                throw new Error('Auth0 client not initialized');
            }
        } catch (err) {
            console.error("Error logging in:", err);
            // Display error to user
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = 'Login failed. Please try again.';
            document.querySelector('.auth-buttons').appendChild(errorDiv);
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

// Initialize immediately when script loads
configureAuth0().catch(err => console.error("Initial Auth0 configuration failed:", err));