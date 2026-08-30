export const msalConfig = {
    auth: {
        clientId: "518f7708-c599-49b3-986a-2df6a7e2b830",
        authority: "https://login.microsoftonline.com/631afcf8-65f9-405f-b756-eac2b39633ca",
        redirectUri: "http://localhost:5173",
        postLogoutRedirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

export const loginRequest = {
    scopes: ["User.Read"]
};

export const apiRequest = {
    scopes: [
        "api://518f7708-c599-49b3-986a-2df6a7e2b830/read-write"
    ]
};