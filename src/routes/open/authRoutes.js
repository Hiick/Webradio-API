module.exports =  (router, app, authRoutesMethods) => {

    router.post('/register', authRoutesMethods.register);
    router.post('/login', app.oauth.grant(), authRoutesMethods.login);
    router.get('/facebook/login/:token', authRoutesMethods.facebookLogin);

    return router

};
