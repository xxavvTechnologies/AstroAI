let auth0Client = null;

window.auth = {
    isAuthenticated: false,
    user: null,

    async init() {
        try {
            auth0Client = await createAuth0Client({
                domain: config.AUTH0_DOMAIN,
                client_id: config.AUTH0_CLIENT_ID,
                redirect_uri: config.AUTH0_CALLBACK_URL,
                useRefreshTokens: true,
                cacheLocation: "localstorage"
            });

            if (window.location.search.includes("code=") || window.location.search.includes("state=")) {
                await auth0Client.handleRedirectCallback();
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            this.isAuthenticated = await auth0Client.isAuthenticated();
            this.user = this.isAuthenticated ? await auth0Client.getUser() : null;

            return this.isAuthenticated;
        } catch (error) {
            console.error("Error initializing Auth0 client:", error);
        }
    },

    async login() {
        await auth0Client.loginWithRedirect();
    },

    async logout() {
        auth0Client.logout({
            returnTo: window.location.origin
        });
    },

    getUser() {
        return this.user;
    },

    isAuthenticated() {
        return this.isAuthenticated;
    }
};

window.onload = async () => {
    // Initialize Auth0 client
    await window.auth.init();

    // Update the UI
    await updateUI();

    // Attach event listener to the profile button
    const profileButton = document.getElementById("profile-button");
    profileButton.addEventListener("click", toggleDropdown);
};

const updateUI = async () => {
    const isAuthenticated = window.auth.isAuthenticated;
    const dropdownMenu = document.getElementById("dropdown-menu");

    // Clear and rebuild dropdown menu
    dropdownMenu.innerHTML = "";

    if (isAuthenticated) {
        const user = window.auth.getUser();

        // Add user-specific options
        dropdownMenu.innerHTML += `
            <a href="#" class="user-welcome">
                <img src="${user.picture || 'https://upload.wikimedia.org/wikipedia/commons/4/41/Default-avatar%E5%BE%97%E5%BE%97.png?20240324104624'}" alt="User Avatar" class="user-avatar">
                Welcome, ${user.name || "User"}
            </a>`;
        
        // Add Nova App links with Font Awesome icons
        dropdownMenu.innerHTML += `
            <a href="https://account.nova.xxavvgroup.com" class="nova-app-link">Your Account</a>
            <a href="https://search.nova.xxavvgroup.com" class="nova-app-link">Nova Search</a>
            <a href="https://docs.nova.xxavvgroup.com" class="nova-app-link">Nova Docs</a>`;

        dropdownMenu.innerHTML += `
            <a href="#" id="logout" class="logout-link">
                <i class="fas fa-sign-out-alt"></i> Logout
            </a>`;

        document.getElementById("logout").addEventListener("click", () => {
            window.auth.logout();
        });
    } else {
        // Add login option if not authenticated
        dropdownMenu.innerHTML += `
            <a href="#" id="login" class="login-link">
                <i class="fas fa-sign-in-alt"></i> Login
            </a>`;

        document.getElementById("login").addEventListener("click", async () => {
            await window.auth.login();
        });
    }
};

const toggleDropdown = () => {
    const dropdownMenu = document.getElementById("dropdown-menu");
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
};

// Close dropdown when clicking outside
window.addEventListener("click", (event) => {
    if (!event.target.closest(".user-dropdown")) {
        const dropdownMenu = document.getElementById("dropdown-menu");
        dropdownMenu.style.display = "none";
    }
});