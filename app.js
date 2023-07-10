const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const errorController = require('./controllers/error');
const User = require('./models/user');


const app = express();
require('dotenv').config();
const store = new MongoDBStore({
        uri: process.env.MONGODB_URI,
        collection: 'sessions'
      })


      const fileStorage = multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, 'images');
        },
        filename: (req, file, cb) => {
          cb(null,file.fieldname+'-'+file.originalname)
        }
      })
      const fileFilter = (req, file, cb) => {
        if (
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg' ||
          file.mimetype === 'image/jpeg'||
          file.mimetype === 'image/avif'
        ) {
          cb(null, true);
        } else {
          cb(null, false);
        }
      }
const csrfProtection = csrf();
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'))
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
app.use(
        session({
                secret:'my secret',
                resave:false,
                saveUninitialized:false,
                store: store
        })
)

app.use(csrfProtection);

app.use(flash());

app.use((req,res,next)=>{
        if(!req.session.user){
                return next()
        }
        User.findById(req.session.user._id)
        .then(user=>{
                if(!user){
                   return next()
                }
                req.user=user
                next()
        }).catch(err=>{
                const error = new Error('err')
                error.httpStatusCode = 500
                return next(error)
        })
        
 })


 app.use((req, res, next) => {
        res.locals.isAuthenticated = req.session.isLoggedIn;
        res.locals.csrfToken = req.csrfToken();
        next();
      })


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.get('/500',errorController.get500)
app.use(errorController.get404);

app.use((error, req, res, next) => {
        res.status(500).render('500',{
          pageTitle: 'Error!',
          path: '/500',
          isAuthenticated: req.session.isLoggedIn
        })
      });


mongoose
.connect(process.env.MONGODB_URI)
.then(result=>{
 
        const PORT = 5000
        app.listen(PORT)
        console.log('mongoose database connect')
})
.catch(erro=>{console.log(erro);})

