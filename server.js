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
app.use(express.static("Pic"));


//Function For CRUD
const loginFuction = (db, callback) => {
	let cursor = db.collection('Login_Info').find({}, {"userName":1, "password":1, "userid": 1, "_id": 0});
	
	cursor.toArray((err, docs) =>{
		assert.equal(null, err);
		callback(docs);
	});
 };
//End 



// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//initializing the cookies
app.use(session({
    Name: "First Cookie try",
    keys: [secKey]
}));

app.get('/', (req,res) => {
	console.log(req.session.isAuthenticated + " " + req.session.UserName + " " + req.session.PW + " " + req.session.userid);
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

	//Connect to DB to retrieve Login Info
	const connection = new MongoClient(url, { useNewUrlParser: true });
	connection.connect((err) =>{

		assert.equal(null,err);
		console.log("Successful connection");

		const DB = connection.db(dbName);
		loginFuction(DB, (LoginInfo) =>{
			connection.close();
			LoginInfo.forEach(element => {
				if(element.userName == req.body.txtUserName && element.password == req.body.txtPW){
					console.log("Matched");
					req.session.isAuthenticated = true;
					req.session.UserName = req.body.txtUserName;
					req.session.PW = req.body.txtPW;
					req.session.userid = element.userid;
					console.log(req.session.isAuthenticated + " " + req.session.UserName + " " + req.session.PW + " " + req.session.userid);
				}
			});
			res.redirect('/');
		});
	})
	

});

app.get('/Logout', (req, res) =>{
	req.session = null;
	res.redirect('/');
})

app.listen(process.env.PORT || 8099);
