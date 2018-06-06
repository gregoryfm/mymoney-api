const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const env = require('../../.env');
const User = require('./user');

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%]).{6,20})/;

const sendErrosFromDB = (res, dbErrors) => {
    const errors = [];
    _.forIn(dbErrors.errors, error => errors.push(error.message))
    return res.status(400).json({ errors });
}

const login = (request, response, next) => {
    const email = request.body.email || '';
    const password = request.body.password || '';

    User.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrosFromDB(response, err);
        } else if ( user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign(user, env.authSecret, {
                expiresIn: '1 day'
            })
            const { name, email } = user;
            response.json({ name, email, token })
        } else {
            return response.status(400).send({ errors: ['Usuário/Senha inválidos'] })
        }
    });
}

const validateToken = (request, response, next) => {
    const token = request.body.token || '';
    jwt.verify(token, env.authSecret, function (err, decoded) {
        return response.status(200).send({ valid: !err });
    })
}

const signup = (request, response, next) => {
    const name = request.body.name || '';
    const email = request.body.email || '';
    const password = request.body.password || '';
    const confirmPassword = request.body.confirm_password || '';

    if (!email.match(emailRegex)) {
        return response.status(400).send({ errors: ['O email informado esta inválido']});
    }

    if (!password.match(passwordRegex)) {
        return response.status(400).send({
            errors: [
            'Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@#$ %) e tamanho entre 6-20.'
            ]
        })
    }

    const salt = bcrypt.genSaltSync();
    const passwordHash = bcrypt.hashSync(password, salt);
    if (!bcrypt.compareSync(confirmPassword, passwordHash)) {
        return response.status(400).send({ errors: ['Senhas não conferem.']});
    }

    user.findOne({ email }, (err, user) => {
        if (err) {
            return sendErrosFromDB(response, err);
        } else if (user) {
            return response.status(400).send({ errors: ['Usuário já cadastrado.'] })
        } 

        const newUser = new User({ name, email, password: passwordHash })
        newUser.save(err => {
            if (err) {
                return sendErrosFromDB(response, err);
            } 
            login(request, response, next);
        })
    });
}

module.exports = { login, signup, validateToken };