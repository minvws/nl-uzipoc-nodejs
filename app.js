require("dotenv").config();

const express = require("express");
const express_tl = require("express-tl");
const jose = require("node-jose");

const { Issuer, generators } = require("openid-client");
const cookieSession = require("cookie-session");

const fs = require("fs");

let client = undefined;

const app = express();
app.use(cookieSession({
    name: "session",
    keys: ["secretCookieKey"],
    maxAge: 10 * 60 * 1000, // 10 min
    httpOnly: true
}));
app.engine("tl", express_tl);
app.set("views", "./views");
app.set("view engine", "tl");

const login = function(req, res){
    req.session.oidcState = generators.state();
    req.session.nonce = generators.nonce();
    req.session.code_verifier = generators.codeVerifier();
    req.session.code_challenge = generators.codeChallenge(req.session.code_verifier);

    const redirectUrl = client.authorizationUrl({
        scope: "openid",
        state: req.session.oidcState,
        code_challenge: req.session.code_challenge,
        code_challenge_method: "S256",
        nonce: req.session.nonce
    });
    return res.redirect(redirectUrl);
};

const clearSession = function(req,) {
    delete req.session.oidcState;
    delete req.session.nonce;
    delete req.session.code_verifier;
    delete req.session.code_challenge;
    delete req.session.tokenSet;

};
const handleCallback = function(req, res){
    let code_verifier = req.session.code_verifier;
    let state = req.session.oidcState;
    let nonce = req.session.nonce;
    const params = client.callbackParams(req);
    client.callback(process.env.OPENID_REDIRECT_URI, params, {
        code_verifier,
        state,
        nonce
    }).then(function (tokenSet) {
        req.session.tokenSet = tokenSet;
        res.redirect("/");
    }, (error) => {
        console.log(error);
        res.render("index", {
            loggedIn: true,
            response: error.message
        });
    });
};

const loggedIn = function(req){
    return req.session != undefined
        && req.session.tokenSet != undefined
        && req.session.tokenSet.access_token != undefined;
};

const router = express.Router();

router.get("/login", (req, res) =>{
    return login(req, res);
});

router.get("/logout", (req, res) =>{
    clearSession(req, res);
    return res.redirect("/");
});

router.get("/", (req, res)=>{
    if ("code" in req.query ) {
        return handleCallback(req, res);
    } else if(loggedIn(req)){
        client.userinfo(req.session.tokenSet.access_token)
            .then(userinfo => {
                res.render("index", {
                    loggedIn: true,
                    response: JSON.stringify(userinfo)
                });
            }, (error) => {
                res.render("index", {
                    loggedIn: true,
                    response: error.message
                });

            });
    } else {
        return res.render("index", {
            loggedIn: false,
        });
    }
});


app.use(router);

app.listen(process.env.LISTEN_PORT, async () => {
    const key = fs.readFileSync(process.env.CLIENT_KEY_PATH);
    const keystore = jose.JWK.createKeyStore();
    await keystore.add(key, "pem");
    const jwks = keystore.toJSON(true);

    Issuer.discover( process.env.OPENID_SERVER ).then((issuer)=>{
        console.log("Discovered issuer %s %O", issuer.issuer, issuer.metadata);
        client = new issuer.Client({
            client_id: process.env.OPENID_CLIENT_ID,
            redirect_uris: [ process.env.OPENID_REDIRECT_URI],
            id_token_signed_response_alg: "RS256",
            response_types: ["code"],
            token_endpoint_auth_method: "none",
            userinfo_encrypted_response_alg: "RSA-OAEP",
            userinfo_signed_response_alg: "RS256",
        }, jwks);
    });
});