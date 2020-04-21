
module.exports =  (router, app, restrictedAreaRoutesMethods) => {

    /**
     * ALL ROUTES FOR SIGNALEMENTS
     */
    router.post('/signalements/channel/:id',  app.oauth.authorise(), restrictedAreaRoutesMethods.newSignalement);
    router.get('/signalements/all', app.oauth.authorise(), restrictedAreaRoutesMethods.getSignalements);
    router.get('/signalements/channel/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.getSignalementsByChannelID);
    router.put('/signalement/update/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.updateSignalement);
    router.delete('/signalements/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.deleteSignalement);

    /**
     * ALL ROUTES FOR CHANNELS
     */
    router.get('/channels/all', app.oauth.authorise(), restrictedAreaRoutesMethods.getChannels);
    router.get('/channels/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.getOneChannel);
    router.get('/channels/stream/all', app.oauth.authorise(), restrictedAreaRoutesMethods.getStreamChannel);
    router.get('/channels/banish/all', app.oauth.authorise(), restrictedAreaRoutesMethods.getBanishChannels);
    router.put('/channels/update/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.updateChannel);
    router.put('/channels/banish/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.banishChannel);
    router.put('/channels/unbanish/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.unbanChannel);
    router.delete('/channels/delete/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.deleteChannel);

    /**
     * ALL ROUTES FOR RADIOS
     */
    router.post('/radios', app.oauth.authorise(), restrictedAreaRoutesMethods.addRadio);
    router.get('/radios/all', app.oauth.authorise(), restrictedAreaRoutesMethods.getRadios);
    router.get('/radios/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.getOneRadio);
    router.put('/radios/update/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.updateOneRadio);
    router.delete('/radios/delete/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.deleteOneRadio);

    /**
     * ALL ROUTES FOR USERS
     */
    router.get('/user/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.getOneUser);
    router.get('/users', app.oauth.authorise(), restrictedAreaRoutesMethods.getUsers);
    router.get('/users/logged', app.oauth.authorise(), restrictedAreaRoutesMethods.getUserWithOAuth);
    router.get('/users/active', app.oauth.authorise(), restrictedAreaRoutesMethods.getActiveUser);
    router.get('/users/inactive', app.oauth.authorise(), restrictedAreaRoutesMethods.getInactiveUser);
    router.put('/users/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.updateUser);
    router.put('/users/password/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.updateUserPassword);
    router.delete('/users/delete/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.deleteUser);
    // Route à faire :
    // Rendre un utilisateur inactif et faire la doc

    /**
     * ALL ROUTES FOR STREAMS
     */
    router.get('/stream/record/:channel_id', restrictedAreaRoutesMethods.recordStream);
    router.get('/stream/stop', restrictedAreaRoutesMethods.stopStream);
    router.get('/stream/generate/:channel_id', restrictedAreaRoutesMethods.getFirstStream);

    /**
     * ALL ROUTES FOR STATS
     */
    router.get('/stats/users', app.oauth.authorise(), restrictedAreaRoutesMethods.costUsers);
    router.get('/stats/users/active', app.oauth.authorise(), restrictedAreaRoutesMethods.costActiveUsers);
    router.get('/stats/users/inactive', app.oauth.authorise(), restrictedAreaRoutesMethods.costInactiveUsers);
    router.get('/stats/users/registered/month', app.oauth.authorise(), restrictedAreaRoutesMethods.costRegisteredThisMonth);
    router.get('/stats/subscribers', app.oauth.authorise(), restrictedAreaRoutesMethods.costSubscribe);
    router.get('/stats/listen', app.oauth.authorise(), restrictedAreaRoutesMethods.costListen);
    router.get('/stats/listen/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.costListenForUser);
    router.get('/stats/listen/streams', app.oauth.authorise(), restrictedAreaRoutesMethods.costStreamsListen);
    router.get('/stats/listen/radios', app.oauth.authorise(), restrictedAreaRoutesMethods.costRadiosListen);
    router.get('/stats/channels/active', app.oauth.authorise(), restrictedAreaRoutesMethods.costActiveChannels);
    router.get('/stats/channels/inactive', app.oauth.authorise(), restrictedAreaRoutesMethods.costInactiveChannels);
    router.get('/stats/channels/banish', app.oauth.authorise(), restrictedAreaRoutesMethods.costBanishChannels);
    router.get('/stats/radios', app.oauth.authorise(), restrictedAreaRoutesMethods.costRadios);
    router.get('/stats/stream', app.oauth.authorise(), restrictedAreaRoutesMethods.costCreatedStream);
    router.get('/stats/stream/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.costCreatedStreamForUser);
    router.get('/stats/stream/plan', app.oauth.authorise(), restrictedAreaRoutesMethods.costPlan);
    router.get('/stats/stream/plan/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.costPlanStreamForUser);
    router.get('/stats/fav/:id', app.oauth.authorise(), restrictedAreaRoutesMethods.costFavoriteForUser);
    router.get('/stats/signalements', app.oauth.authorise(), restrictedAreaRoutesMethods.costSignalements);
    router.get('/stats/signalements/:channel_id', app.oauth.authorise(), restrictedAreaRoutesMethods.costSignalementsForUser);

    return router

};
