const express = require('express');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const secKey = "I tried hard!";

app.set('view engine','ejs');

app.use(session({
    Name: "First Cookie try",
    keys: [secKey]
}))

app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {    // user not logged in!
		res.redirect('/login');
	} else {
		res.status(200).render('secrets',{name:req.session.username});
	}
});

app.get('/login', (req,res) =>{
    res.status(200).render('Login',{});
});

app.listen(process.env.PORT || 8099);
