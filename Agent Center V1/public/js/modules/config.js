export const CONFIG = {
    // If running locally (localhost, 127.0.0.1) or via file protocol (opening index.html directly),
    // use the local server URL. Otherwise (production), use relative path.
    API_BASE_URL: (window.location.protocol === 'file:')
        ? 'http://localhost:3000'
        : '',
};
