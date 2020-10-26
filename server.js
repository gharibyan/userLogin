const express = require('express');
const app = express()
const {pool} = require('./dbConfig')
const bcrypt = require('bcrypt')
const session = require('express-session')
const flash = require('express-flash')   
const PORT = process.env.PORT || 4000; 
const initializePassport = require("./passportConfig")
const passport = require("passport");
const userService = require('./userService');


initializePassport(passport);
app.set('view engine','ejs');
app.use(express.urlencoded({extended: false}));
app.use(session({
    secret : 'secret',
    resave : false,
    saveUninitialized : false

}));
app.use(passport.initialize())
app.use(passport.session())
let defStatus = 'pending';
let defRole = 'not assigned'
app.use(flash());

app.get('/', (req,res)=> {
    res.render('index');
});
app.get('/users/register', (req,res)=> {
    res.render('register');
});
app.get('/users/login', (req,res)=> {
    res.render('login');
});

app.get('/users/dashboard', (req,res)=> { 
  userService.callGetUsersList().then(result => {
    res.render('dashboard', {avc: req.user.name, usersList:result,userInfo: req.user, ccc: req.user.info});
  }
)});

  app.post("/users/dashboard",async (req,res) => {
    if(req.user.name=='hrach'){
      userService.callUpdateUsersList(req.body).then(result =>{
      res.render('dashboard', {avc: req.user.name, usersList:result});
    })
  }
    else{
       userService.callUpdateUsersInfo(req.body).then(result =>{
        res.render('dashboard', {avc: req.user.name, ccc :result.rows[0].info,userInfo: req.user});
      })
    }

  })

app.post('/users/register',async (req,res) => {
    let {name, email,password, password2} = req.body;

    console.log({
        name,
        email,
        password,
        password2
    })
    let errors = [];
    if (!name || !email || !password || !password2) {
        errors.push({ message: "Please enter all fields" });
      }
    
      if (password.length < 6) {
        errors.push({ message: "Password must be a least 6 characters long" });
      }
    
      if (password !== password2) {
        errors.push({ message: "Passwords do not match" });
      }
    
      if (errors.length > 0) {
        res.render("register", { errors });
       } else {
         hashedPassword = await bcrypt.hash(password, 10);
        // Validation passed
        pool.query(
          `SELECT * FROM users
            WHERE email = $1`,
          [email],
          (err, results) => {
            if (err) {
              throw(err);
            }else{
              usersList=results;
            }    
            if (results.rows.length > 0) {
              errors.push({ message: 'email already registered'});
              res.render("register",{errors})
            } else {
              pool.query(
                `INSERT INTO users (name, email, password, status, role)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id, password`,
                [name, email, hashedPassword, defStatus, defRole],
                (err, results) => {
                  if (err) {
                    throw err;
                  }
                  req.flash("success_msg", "You are now registered. Please log in");
                  res.redirect("/users/login");
                }
              );
            }
          }
        );
      }
    });

app.post("/users/login",passport.authenticate('local',{successRedirect: "/users/dashboard",failureRedirect: "/users/register", failureFlash: true}));

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});
