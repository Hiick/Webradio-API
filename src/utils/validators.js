const { check } = require('express-validator');

const validateRequest = (code) => {

    if (code === 'update password') {
        return [check('password', "Merci de rentrer un mot de passe de 8 caractères minimum, avec au moins une majuscule et une minuscule").notEmpty().isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])/,)]
    }

    if (code === 'login') {
        return  [check('email', "Merci d'indiquer une adresse email valide").notEmpty().isEmail()]
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

    if (code === 'update user with role') {
        return [
            check('username', "Le nom d'utilisateur doit être de 3 caractères minimum et ne peux pas contenir d'espace").notEmpty().trim().isLength({ min: 3 }),
            check('avatar', "L'avatar ne peux pas être vide").notEmpty(),
            check('role', "Le rôle ne peux pas être vide").notEmpty()
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
            check('logo', "Le logo ne peux pas être vide").notEmpty(),
            check('direct_url', "L'url ne peux pas être vide").notEmpty(),
        ]
    }

    if (code === 'forgot password email') {
        return [
            check('email', "Merci d'indiquer une adresse email valide").notEmpty().isEmail()
        ]
    }

    if (code === 'forgot password valid pass') {
        return [
            check('password', "Merci de rentrer un mot de passe de 8 caractères minimum, avec au moins une majuscule et une minuscule").notEmpty().isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])/,)
        ]
    }

    if (code === 'subscribe payment') {
        return [
            check('card_number', "Le numéro de carte ne dois pas être vide et dois faire 16 chiffres").notEmpty().isLength({ min: 16, max: 16 }),
            check('card_exp_month', "Le numéro d'expiration du mois ne dois pas être vide et dois faire 2 chiffres").notEmpty().isLength({ min: 2, max: 2 }),
            check('card_exp_year', "Le numéro d'expiration de l'année ne dois pas être vide et dois faire 2 chiffres").notEmpty().isLength({ min: 2, max: 2 }),
            check('card_cvc', "Le numéro CVC ne dois pas être vide et dois faire 3 chiffres").notEmpty().isLength({ min: 3, max: 3 }),
            check('email', "Merci d'indiquer une adresse email valide").notEmpty().isEmail(),
            check('plan', "Le plan stripe en doit pas être vide").notEmpty()
        ]
    }

    if (code === 'create user') {
        return [
            check('email', "Merci d'indiquer une adresse email valide").notEmpty().isEmail(),
            check('username', "Le nom d'utilisateur doit être de 3 caractères minimum et ne peux pas contenir d'espace").notEmpty().trim().isLength({ min: 3 }),
        ]
    }

    if (code === 'favorite') {
        return [
            check('user_id', "L'utilisateur doit être renseigné").notEmpty()
        ]
    }

};

module.exports = {
    validateRequest: validateRequest
};


