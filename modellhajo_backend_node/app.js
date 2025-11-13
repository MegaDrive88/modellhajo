const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const database = require('./database');
const { Op } = require('sequelize');
const User = require('./models/User');
const { createHash } = require('crypto');
require('dotenv').config();
const DOTENV = process.env;

(async () => {
  try {
    await database.authenticate();
    console.log('Database connected.');
  } catch (err) {
    console.error('Unable to connect to database:', err);
  }
})();

const app = express();
app.use(express.json());
app.disable('x-powered-by');
app.use(cors())

const salt = "PasswordSalted"
const md5 = (str) => createHash('md5').update(str).digest('hex')

app.get('/api', async (req, res) => {
    res.json({
        status: "ok"
    });
});

app.get('/api/login/:user/:isEmail/:pwdHash', async (req, res) => {
    let column = req.params.isEmail == "true" ? 'email' : 'felhasznalonev'; 
    const result = await User.findOne({
        where: {
            [column]: req.params.user,
            jelszo: {
                [Op.regexp]: `^[A-Z]${req.params.pwdHash}[A-Z]$`
            }
        }
    });
    if (!result){
        return res.json({
            "success" : false,
            "error" : "LOGIN_FAILED"
        })
    }
    const token = jwt.sign({ userId: result.id, abilities: ["test_ability"] }, DOTENV.JWT_SECRET);
    return res.json({
        "success": true,
        "user": result,
        "access_token": token
    })
});

const checkUnique = async (field, user, newValue) => {
    const existing = (await User.findAll({
        where:{
            id:{[Op.ne]: user.id}
        }
    })).map(x=>x[field])
    return !existing.includes(newValue)
}

app.patch('/api/updateUser/:id', async (req, res) => {
    try{
        let user = await User.findOne({
            where: {id: req.params.id}
        })
        if(!user){
            return res.json({'success': false, 'error': 'USER_NOT_FOUND'})
        }
        if(req.body.megjeleno_nev == "" || req.body.felhasznalonev == "" || req.body.email == ""){
            return res.json({'success': false, 'error': 'EMPTY_FIELD'})
        }
        user.megjeleno_nev = req.body.megjeleno_nev;
        if (await checkUnique("felhasznalonev", user, req.body.felhasznalonev))
            user.felhasznalonev = req.body.felhasznalonev;
        else return res.json({
            "success": false,
            "error": "USERNAME_NOT_UNIQUE"
        })
        if (await checkUnique("email", user, req.body.email))
            user.email = req.body.email;
        else return res.json({
            "success": false,
            "error": "EMAIL_NOT_UNIQUE"
        })
        await user.save()
        return res.json({
            "success": true,
            "user": user
        })
    } catch (e){
        return res.json({
            "success": false,
            "error": e.message
        })
    }
})

app.patch('/api/updatePassword/:id', async (req, res) => {
    let user = await User.findOne({
        where: {id: req.params.id}
    })
    if(!user){
        return res.json({'success': false, 'error': 'USER_NOT_FOUND'})
    }
    // if (user.jelszo.slice(1, -1))
    // folyt kov
})
app.listen(8001, console.log("server is running"))