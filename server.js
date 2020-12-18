const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const secKey = "I tried hard!";


app.set('view engine','ejs');

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    Name: "First Cookie try",
    keys: [secKey]
}))

app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.isAuthenticated) {    // user not logged in!
		res.redirect('/login');
	} else {
		res.status(200).render('Success',{UserName:req.session.UserName, PW: req.session.PW});
	}
});

app.get('/login', (req,res) =>{
    res.status(200).render('Login',{});
});

app.post('/login', (req,res) =>{

	req.session.isAuthenticated = true;

	console.log(req.body);

	req.session.UserName = req.body.txtUserName;
	req.session.PW = req.body.txtPW;
	res.redirect('/');


});

app.listen(process.env.PORT || 8099);
