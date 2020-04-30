const { check } = require('express-validator');

const validateRequest = (code) => {

    if (code === 'update password') {
        return [check('password', "Merci de rentrer un mot de passe de 8 caractères minimum, avec au moins une majuscule et une minuscule").notEmpty().isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])/,)]
    }

    if (code === 'login') {
        return  [check('email', "Merci d'indiquer une adresse email valide").notEmpty().isEmail(),]
    }

    if (code === 'register') {
        return [
            check('email', "Merci d'indiquer une adresse email valide").notEmpty().isEmail(),
            check('username', "Le nom d'utilisateur doit être de 3 caractères minimum et ne peux pas contenir d'espace").notEmpty().trim().isLength({ min: 3 }),
            check('password', "Merci de rentrer un mot de passe de 8 caractères minimum, avec au moins une majuscule et une minuscule").notEmpty().isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])/,)
        ]
    }

    if (code === 'update user') {
        return [
            check('username', "Le nom d'utilisateur doit être de 3 caractères minimum et ne peux pas contenir d'espace").notEmpty().trim().isLength({ min: 3 }),
            check('avatar', "L'avatar ne peux pas être vide").notEmpty()
        ]
    }

    if (code === 'create signalement' || code === 'update signalement') {
        return [
            check('motif', "Le motif ne peux pas être vide").notEmpty()
        ]
    }

    if (code === 'update channel') {
        return [
            check('name', "Le nom de chaîne doit être de 3 caractères minimum et ne peux pas contenir d'espace").notEmpty().trim().isLength({ min: 3 }),
            check('avatar', "Le motif ne peux pas être vide").notEmpty()
        ]
    }

    if (code === 'add new radio' || code === 'update radio') {
        return [
            check('radio_name', "Le nom de radio ne peux pas être vide").notEmpty(),
            check('logo', "Le nom de radio ne peux pas être vide").notEmpty(),
            check('direct_url', "Le nom de radio ne peux pas être vide").notEmpty(),
        ]
    }

};

module.exports = {
    validateRequest: validateRequest
};

