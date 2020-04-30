const { validateRequest } = require('../../utils/validators');

module.exports =  (router, check, authRoutesMethods) => {

    router.post('/register', validateRequest('register'), authRoutesMethods.register);

    router.post('/login', validateRequest('login'), authRoutesMethods.login);

    router.get('/facebook/login/:token', authRoutesMethods.facebookLogin);

    return router

};
