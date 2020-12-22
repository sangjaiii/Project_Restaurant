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
const { ObjectID } = require('mongodb');
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

 const insertNewDoc = (db, name, borough, cuisine, street, building, zipcode, lon, lat, photo, photo_mimetype, userid, callback) =>{
	
	 db.collection('Restaurant').insertOne({
		"name": name,
		"borough": borough,
		"cuisine": cuisine,
		"photo": photo,
		"photo_mimetype": photo_mimetype,
		"address": {
			"street": street,
			"building": building,
			"zipcode": zipcode,
			"coord": [lon, lat]
		},
		"grades": [],
		"owner": ObjectID(userid)
	 }, (err, result) =>{
		 assert.equal(null, err);
		 callback(result);
	 })
 }

 const getAllDocument = (db, callback) =>{
	 let cursor = db.collection('Restaurant').find({});

	 cursor.toArray((err, docs) =>{
		 assert.equal(null, err);
		 callback(docs);
	 })
 }

 const checkIsGraded = (db, targeID, userid, callback) =>{
	 let isGraded = db.collection('Restaurant').find({$and: [{"grades.userid" : userid}, {"owner" : targeID}]});
	 //console.log(targeID);
	 //console.log(userid);
	 isGraded.toArray((err, docs) =>{
		assert.equal(null, err);
		callback(docs.toString() == ""? false: true);
	})
 }

 const getRestaurant = (db, targeID, callback) =>{
	 let restaurant = db.collection('Restaurant').find({"_id": ObjectID(targeID)});

	 restaurant.toArray((err, doc) =>{
		assert.equal(null, err);
		callback(doc);
	 });
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

//Handling the Info Page
app.get('/', (req,res, next) => {
	//console.log(req.session.isAuthenticated + " " + req.session.UserName + " " + req.session.PW + " " + req.session.userid);
	if (!req.session.isAuthenticated) {    // user not logged in!

		res.redirect('/login');

	} else {	

		const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{
			
			const DB = connection.db(dbName);

			countTotalNumber(DB).then((result) =>{
				res.locals.TotalNumber = result;
				eq.session.TotalNumber = result;
			})

			getAllDocument(DB, (docs) =>{

				connection.close();
				res.locals.docsJson = docs;
				next();
			})
		});
	}
});

app.get('/', (req, res) =>{
	console.log(res.locals.docsJson);
	res.status(200).render('Success',{UserName:req.session.UserName, TotalNumber: res.locals.TotalNumber , docJSON: JSON.stringify(res.locals.docsJson), userID: req.session.userid })
})


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
	res.status(200).render("CreateNewDoc", {UserName:req.session.UserName, TotalNumber: req.session.TotalNumber, isAlert: "false", isInsert: "false"});
});
app.post('/newDoc', (req, res) =>{
	
	const form = new formidable.IncomingForm();
	let photo, photo_mimetype = "";
	form.parse(req, (err, fields, files) =>{
		
		console.log(fields);

		if(files.picPhoto.size > 0){
			fs.readFile(files.picPhoto.path, (err, data) =>{
				photo = new Buffer.from(data).toString('base64');
				photo_mimetype = files.picPhoto.type;
			})
		}

		const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{
			
			assert.equal(err, null);
			console.log("Successful connection");

			const db = connection.db(dbName)				
			insertNewDoc(db, fields.txtName, fields.txtBorough, fields.txtCuisine, fields.txtStreet, fields.txtBuilding, fields.txtZipcode, fields.txtGPS_lon, fields.txtGPS_lat, photo, photo_mimetype, req.session.userid, (result) =>{
				connection.close();
				console.log(result);
			});	
		});
	});
	res.status(200).render('CreateNewDoc', {UserName:req.session.UserName, TotalNumber: req.session.TotalNumber, isAlert: "true", isInsert: "true"});
});

//Handling Logout request
app.get('/Logout', (req, res) =>{

	req.session = null;
	res.redirect('/');

})

//Handling the rating page
app.get('/Rate', (req, res, next) => {
	
	const targetID = req.query.restaurant;
	let isGraded = false;

	const connection = new MongoClient(url, { useNewUrlParser: true });
	connection.connect((err) =>{

		const db = connection.db(dbName);
		getRestaurant(db, targetID, (result) =>{		

			res.locals.RName = result[0].name;
			checkIsGraded(db, targetID, req.session.userid, (result) =>{
				
				connection.close();
				if(!result){
					next();
				}			
			})
		})		
	})
})
app.get('/Rate', (req, res) =>{
	res.status(200).render('Rate', {UserName:req.session.UserName, RestaurantsName: res.locals.RName});
})

/*
//Handling random route, route back to home/info page
app.get('*', (req, res) =>{
	res.redirect('/');
})
*/

app.listen(process.env.PORT || 8099);
