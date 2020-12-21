const express = require('express');
const hashPW = require('password-hash');
const session = require('cookie-session');
const bodyParser = require('body-parser');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const ObjectId = require('mongodb').ObjectID;
const fs = require('fs');
const formidable = require('formidable');
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

 const countTotalNumber = (db) =>{
	 let Tnumber = db.collection('Restaurant').find({}).count();
	 return Tnumber;
 }

 const insertNewDoc = (db, name, cuisine, street, building, zipcode, lon, lat, photo, userid, callback) =>{
	 db.collection("Restaurant").insertOne({
		"name": name,
		"name": name,
		"name": name,
		"name": name,
		"name": name,
		"name": name,
		"name": name,
		"name": name,

	 })
 }

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
	//console.log(req.session.isAuthenticated + " " + req.session.UserName + " " + req.session.PW + " " + req.session.userid);
	if (!req.session.isAuthenticated) {    // user not logged in!
		res.redirect('/login');
	} else {	
		res.status(200).render('Success',{UserName:req.session.UserName, TotalNumber: req.session.TotalNumber});
		
	}
});

//Handling Login Page and Login procrdure
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

		countTotalNumber(DB).then((result) =>{
			req.session.TotalNumber = result;
		})

		loginFuction(DB, (LoginInfo) =>{
			connection.close();
			LoginInfo.forEach(element => {
				if(element.userName == req.body.txtUserName && element.password == req.body.txtPW){
					console.log("Matched");
					req.session.isAuthenticated = true;
					req.session.UserName = req.body.txtUserName;
					req.session.userid = element.userid;
					//console.log(req.session.isAuthenticated + " " + req.session.UserName + " " + req.session.PW + " " + req.session.userid);
				}
			});
			res.redirect('/');
		});
	})
});

// Handling new document page and Adding new document
app.get('/newDoc', (req, res) =>{
	res.status(200).render("CreateNewDoc", {UserName:req.session.UserName, TotalNumber: req.session.TotalNumber});
});
app.post('/newDoc', (req, res) =>{
	
	const form = new formidable.IncomingForm();
	let photo, photo_mimetype = "";
	form.parse(req, (err, fields, files) =>{
		console.log(JSON.stringify(files.picPhoto));
		/*
		if(files){
			fs.readFile(files.filetoupload.path, (err, data) =>{
				photo = new Buffer.from(data).toString('base64');
				console.log(photo);
			})
		}
		*/

	})

})


app.get('/Logout', (req, res) =>{
	req.session = null;
	res.redirect('/');
})

app.listen(process.env.PORT || 8099);
