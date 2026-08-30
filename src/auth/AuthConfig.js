export const msalConfig = {
    auth: {
        clientId: "518f7708-c599-49b3-986a-2df6a7e2b830",
        authority: "https://login.microsoftonline.com/631afcf8-65f9-405f-b756-eac2b39633ca",
        redirectUri: "https://95xuwhqaq2.execute-api.us-east-1.amazonaws.com/desarrollo/",
        postLogoutRedirectUri: "https://95xuwhqaq2.execute-api.us-east-1.amazonaws.com/desarrollo/",
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