const express = require('express');
const hashPW = require('password-hash');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const url = 'mongodb+srv://ProjectAccess:yTUyYnl4jrE8RObp@cluster0.0czjw.mongodb.net/381_Project_Restaurant?retryWrites=true&w=majority';  // MongoDB Atlas Connection URL
const dbName = '381_Project_Restaurant'; // Database Name
const secKey = "I tried hard!";


app.set('view engine','ejs');
app.use(express.static("Pages"));

const client = new MongoClient(url, { useNewUrlParser: true } );
client.connect((err) => {
	assert.equal(null,err);
	console.log(`Connected successfully to ${url}`);
	const db = client.db(dbName);
})


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

app.post('/Register', (req, res) =>{
	console.log(req.body);	
})

app.get('/Logout', (req, res) =>{
	req.session = null;
	res.redirect('/');
})

app.listen(process.env.PORT || 8099);
