const { validateRequest } = require('../../utils/validators');

module.exports =  (router, check, authRoutesMethods) => {

    router.post('/register', validateRequest('register'), authRoutesMethods.register);

    router.post('/user/confirm/:token', authRoutesMethods.confirmUser);

    router.post('/login', validateRequest('login'), authRoutesMethods.login);

    router.post('/forgot/password', validateRequest('forgot password email'), authRoutesMethods.forgotPassword);

    router.post('/reset/password/:token', validateRequest('forgot password valid pass'), authRoutesMethods.resetPassword);

    router.get('/facebook/login/:token', authRoutesMethods.facebookLogin);

    router.get('/radios/all', authRoutesMethods.getRadios);



    return router

};
