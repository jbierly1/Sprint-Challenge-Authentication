const axios = require('axios');
const cors=require('cors');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const knex=require('knex');
const dbConfig=require('../knexfile.js');
const db= knex(dbConfig.development);

const { authenticate } = require('../auth/authenticate');

const registerUser=function(user){
  return db('users').insert(user).then(id=>id).catch(err=>err)
  }
const getUser=function(user){
  return db('users').where({userName:user}).first().then(user=>user).catch(err=>err)
      };

const getUsers=function(){
      return db.select('*').from('users').then(users=>users).catch(err=>err)
      };


module.exports = server => {
  server.post('/api/register', register);
  server.post('/api/login', login);
  server.get('/api/jokes', authenticate, getJokes);
};
const jwtKey =
  process.env.JWT_SECRET ||
  'add a .env file to root of project with the JWT_SECRET variable';


function generateToken(user){
  const payload={
    subject: user.id
  }
  const options={
    expiresIn:'1h',
    jwtid:'12345', //jti
  }
  return jwt.sign(payload,jwtKey,options);
}

function register(req, res) {
  // implement user registration
  const creds=req.body;
  const hash=bcrypt.hashSync(creds.password, 14);
  creds.password=hash;
  const registerToken=generateToken(creds);
  registerUser(creds).then(id=>res.status(201).json(registerToken)).catch(err=>res.status(500).json(err))
}

function login(req, res) {
  // implement user login
  const creds=req.body;
    getUser(creds.username).then(user=>{
if(user && bcrypt.compareSync(creds.password, user.password)){
    //generate token
  const token=generateToken(user);
    //attach token to response
    
    res.status(200).json({token:token})
}else{
    //either username is not found or password is wrong
    res.status(401).json({message:'you shall not pass'})
}}).catch(err=>res.json(err))
}

function getJokes(req, res) {
  const requestOptions = {
    headers: { accept: 'application/json' },
  };

  axios
    .get('https://icanhazdadjoke.com/search', requestOptions)
    .then(response => {
      res.status(200).json(response.data.results);
    })
    .catch(err => {
      res.status(500).json({ message: 'Error Fetching Jokes', error: err });
    });
}
