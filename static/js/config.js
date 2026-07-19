const APP_CONFIG = {
    DOMAIN: 'learn.reboot01.com',
    TOKEN_STORAGE_KEY: 'amani_token',
};

/* Authorization*/
APP_CONFIG.SIGNIN_ENDPOINT = "https://" + APP_CONFIG.DOMAIN + "/api/auth/signin";
/* fetch reboot's data*/
APP_CONFIG.GRAPHQL_ENDPOINT = "https://" + APP_CONFIG.DOMAIN + "/api/graphql-engine/v1/graphql";

window.APP_CONFIG = APP_CONFIG;