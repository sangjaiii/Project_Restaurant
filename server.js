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
const { nextTick } = require('process');
const { call } = require('body-parser');
const url = '';  // MongoDB Atlas Connection URL
const dbName = ''; // Database Name
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
	 });
 }

 const getAllDocument = (db, callback) =>{
	 let cursor = db.collection('Restaurant').find({});

	 cursor.toArray((err, docs) =>{
		 assert.equal(null, err);
		 callback(docs);
	 })
 }

 const checkIsGraded = (db, targeID, userid, callback) =>{
	 let isGraded = db.collection('Restaurant').find({$and: [{"grades.userid" : ObjectID(userid)}, {"_id" : ObjectID(targeID)}]});
	 //console.log(targeID);
	 //console.log(userid);
	 //console.log(isGraded);
	 isGraded.toArray((err, docs) =>{
		assert.equal(null, err);
		//console.log(docs);
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

 const rateRestaurant = (db, rate, RID, userid, callback) =>{
	
	db.collection('Restaurant').updateOne({	
		"_id" : ObjectId(RID)
	}, { 
		$push: {
			"grades": {
				"userid": ObjectId(userid), 
				"score": parseInt(rate)
			}
		}
	}, (err, result) =>{
		assert.equal(null, err);
		callback(result);
	});
 }

 const deleteRestaurant = (db, targetID, callback) =>{

	db.collection('Restaurant').remove({

		"_id": ObjectID(targetID)

	}, (err, result) =>{

		assert.equal(null, err);
		callback(result);
	});

 }

 const getUser = (db, userid, callback) =>{

	let cursor = db.collection('Login_Info').find({"userid": ObjectID(userid)});

	cursor.toArray((err, doc) =>{
		assert.equal(null, err);
		callback(doc);
	 });

 }

 const getUserList = (db, callback) =>{

	let cursor = db.collection('Login_Info').find({}, {"userName": 1, "_id": 0, "password": 0, "userid": 0});

	cursor.toArray((err, doc) =>{
		assert.equal(null, err);
		callback(doc);
	 });

 }

 const updateRestaurantWithPhoto = (db, RID, name, borough, cuisine, street, building, zipcode, lon, lat, photo, photo_mimetype, callback) =>{

	db.collection('Restaurant').updateOne(
		{
			"_id": ObjectID(RID)
		},
		{
			$set: 	{
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
						}
					}
		}, 
		(err, result) =>{
			assert.equal(null, err);
			callback(result);
		});

 }

 const updateRestaurantWOPhoto = (db, RID, name, borough, cuisine, street, building, zipcode, lon, lat, callback) =>{

	db.collection('Restaurant').updateOne(
		{
			"_id": ObjectID(RID)
		},
		{
			$set: 	{
						"name": name,
						"borough": borough,
						"cuisine": cuisine,
						"address": {
							"street": street,
							"building": building,
							"zipcode": zipcode,
							"coord": [lon, lat]
						}
					}
		}, 
		(err, result) =>{
			assert.equal(null, err);
			callback(result);
		});

 }

 const searchRestaurantByName = (db, Name, callback) =>{

	let cursor = db.collection('Restaurant').find({
		"name": Name
	});

	cursor.toArray((err, doc) =>{
		assert.equal(null, err);
		callback(doc);
	 });
	
 }

 const searchRestaurantByBorough = (db, Borough, callback) =>{

	let cursor = db.collection('Restaurant').find({
		"borough": Borough
	});

	cursor.toArray((err, doc) =>{
		assert.equal(null, err);
		callback(doc);
	 });
	
 }

 const searchRestaurantByCuisine = (db, Cuisine, callback) =>{

	let cursor = db.collection('Restaurant').find({
		"cuisine": Cuisine
	});

	cursor.toArray((err, doc) =>{
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


//Handling random route, route back to home/info page, accessing page that require login in
app.get('*', (req, res, next) =>{
	
	if(!req.session.isAuthenticated){

		res.status(200).render('Login',{});

	}else{

		next();

	}

})


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
				req.session.TotalNumber = result;
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
	//console.log(res.locals.docsJson);
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
		
		//console.log(fields);

		if(files.picPhoto.size > 0){
			fs.readFile(files.picPhoto.path, (err, data) =>{

				photo = new Buffer.from(data).toString('base64');
				photo_mimetype = files.picPhoto.type;

				const connection = new MongoClient(url, { useNewUrlParser: true });
				connection.connect((err) =>{
					
					assert.equal(err, null);
					console.log("Successful connection");

					const db = connection.db(dbName)				
					insertNewDoc(db, fields.txtName, fields.txtBorough, fields.txtCuisine, fields.txtStreet, fields.txtBuilding, fields.txtZipcode, fields.txtGPS_lon, fields.txtGPS_lat, photo, photo_mimetype, req.session.userid, (result) =>{
						connection.close();
						//console.log(result);
					});	
				});

			});

		}

	});
	res.status(200).render('CreateNewDoc', {UserName:req.session.UserName, TotalNumber: req.session.TotalNumber, isAlert: "true", isInsert: "true"});
});


//Handling the rating page
app.get('/Rate', (req, res, next) => {
	
	const targetID = req.query.restaurant;
	let isGraded = false;

	//console.log(req.query.rating);
	if(targetID){

		if(!req.query.rating){

			console.log("Rating Page");
			const connection = new MongoClient(url, { useNewUrlParser: true });
			connection.connect((err) =>{
	
				const db = connection.db(dbName);
				getRestaurant(db, targetID, (result) =>{		
	
					res.locals.RName = result[0].name;
					res.locals.RID = result[0]._id;
	
					checkIsGraded(db, targetID, req.session.userid, (result) =>{
						
						connection.close();
						//console.log(result);
						if(!result){
							next();
						}
						
					res.status(200).render("FailRate", {UserName:req.session.UserName});
						
						
					})
				})		
			})
		}
		else{
			
			console.log("Rated Page");
			
			const connection = new MongoClient(url, { useNewUrlParser: true });
			connection.connect((err) =>{
	
				const db = connection.db(dbName);
				rateRestaurant(db, req.query.rating, req.query.RID, req.session.userid, (result) =>{
	
					connection.close()
					//console.log(result);
					res.status(200).render("Rated", {UserName:req.session.UserName});
					
				})
			})
			
		}

	}else{

		res.redirect("/");

	}

	
	
})
app.get('/Rate', (req, res) =>{
	res.status(200).render('Rate', {UserName:req.session.UserName, RestaurantsName: res.locals.RName, RID: res.locals.RID});
})


//Handling Delete action and route to delete success/fail page
app.get("/Delete", (req, res, next) =>{

	const targetID = req.query.restaurant;

	if(targetID){

		const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{
	
			assert.equal(err,null);
			const db = connection.db(dbName);
	
			getRestaurant(db, targetID, (result) =>{
	
				const owner = result[0].owner;
				//console.log(owner);
				if(req.session.userid == owner){
					deleteRestaurant(db, targetID, (result) =>{
	
						connection.close();
						//console.log(result);
						next();
			
					});
				}else{
	
					res.status(200).render('deleteFail', {UserName:req.session.UserName});
	
				}
			})
		});

	}else{

		res.redirect("/");

	}

	

});
app.get("/Delete", (req, res) =>{
	res.status(200).render('Deleted', {UserName:req.session.UserName});
})


//Handling the Detial Page
app.get("/Detail", (req, res, next) =>{

	const targetID = req.query.restaurant;

	if(targetID){

		const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{
	
			assert.equal(null, err);
			const db = connection.db(dbName);
	
	
			getRestaurant(db, targetID, (result) =>{
	
				res.locals.RDetatil = result;
	
				getUser(db, result[0].owner, (result) =>{
	
					res.locals.ownerName = result[0].userName;
					next();
	
				});
	
			});
	
		});

	}else{

		res.redirect("/")

	}
	
})
app.get("/Detail", (req, res, next) =>{

	const RDetail = res.locals.RDetatil[0]
	const withphoto = RDetail.photo == "" || RDetail.photo_mimetype == ""? false:true;
	const withmap = RDetail.address.coord[0] == "" && RDetail.address.coord[1]? false:true;
	let ratingList = [];

	const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{

			assert.equal(null, err);
			const db = connection.db(dbName);
			getUserList(db, (result) =>{

				connection.close();
				(RDetail.grades).forEach(element => {
					result.forEach(things => {
						if(element.userid.toString() == things.userid.toString()){
							ratingList.push({
								"userName": things.userName,
								"score": element.score
							});
						}

					});
				});

				res.status(200).render('Detail', {
					UserName:req.session.UserName, 
					restaurantsName: RDetail.name,
					photoMimetype: RDetail.photo_mimetype, 
					photoBase64: RDetail.photo,
					Borough: RDetail.borough,
					Cuisine: RDetail.cuisine,
					Street: RDetail.address.street,
					Building: RDetail.address.building,
					Zipcode: RDetail.address.zipcode,
					GPSX: RDetail.address.coord[0],
					GPSY: RDetail.address.coord[1],
					Owner: res.locals.ownerName,
					ratingList: JSON.stringify(ratingList),
					withPhoto: withphoto,
					withMap: withmap
				});						
			});
		});
})


//Handling the map
app.get("/Map", (req, res) =>{

	const GPS_X = req.query.GPSX;
	const GPS_Y = req.query.GPSY;
	res.status(200).render('Map', {UserName:req.session.UserName, GPSX: GPS_X, GPSY: GPS_Y});

});


//Handling the Editing page and action
app.get("/Edit", (req, res, next) =>{

	const RID = req.query.restaurant;

	if(RID){

		const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{
	
			assert.equal(null, err);
			const db = connection.db(dbName);
	
			getRestaurant(db, RID, (result) =>{
	
				connection.close();
				res.locals.restaurantJSON = result;
				next();
	
			});
	
		});

	}else{

		res.redirect("/");

	}

	

});
app.get("/Edit", (req, res) =>{

	const RID = req.query.restaurant;
	const RDetail = res.locals.restaurantJSON[0];
	res.status(200).render('Edit', {
		UserName:req.session.UserName, 
		Name: RDetail.name,
		Borough: RDetail.borough,
		Cuisine: RDetail.cuisine,
		Street: RDetail.address.street,
		Building: RDetail.address.building,
		Zipcode: RDetail.address.zipcode,
		Lon: RDetail.address.coord[0],
		Lat: RDetail.address.coord[1],
		RID: RID
	});

})
app.post("/Edit", (req, res) =>{
	
	const form = new formidable.IncomingForm();
	let photo, photo_mimetype = "";
	form.parse(req, (err, fields, files) =>{		

		const connection = new MongoClient(url, { useNewUrlParser: true });
		connection.connect((err) =>{

			assert.equal(err, null);
			console.log("Successful connection");
			const db = connection.db(dbName)

			if(files.picPhoto.size > 0){

				fs.readFile(files.picPhoto.path, (err, data) =>{

					photo = new Buffer.from(data).toString('base64');
					photo_mimetype = files.picPhoto.type;

					updateRestaurantWithPhoto(db, fields.RID, fields.txtName, fields.txtBorough, fields.txtCuisine, fields.txtStreet, fields.txtBuilding, fields.txtZipcode, fields.txtGPS_lon, fields.txtGPS_lat, photo, photo_mimetype, (result) =>{
						
						connection.close();
						//console.log(result);
						res.redirect('/Detail?restaurant=' + fields.RID);

					});

				});

			}else{

				updateRestaurantWOPhoto(db, fields.RID, fields.txtName, fields.txtBorough, fields.txtCuisine, fields.txtStreet, fields.txtBuilding, fields.txtZipcode, fields.txtGPS_lon, fields.txtGPS_lat, (result) =>{
					
					connection.close();
					//console.log(result);
					res.redirect('/Detail?restaurant=' + fields.RID);

				});

			}

		});

	});

});


//Handling the api 
app.get("/api/restaurant", (req, res) =>{

	const connection = new MongoClient(url, { useNewUrlParser: true });
	connection.connect((err) =>{

		assert.equal(null, err);
		const db = connection.db(dbName);
		getAllDocument(db, (result) =>{

			connection.close();
			res.status(200).type('json').json(result).end();

		});

	});

})
app.get("/api/restaurant/name/:name", (req, res) =>{

	const name = req.params.name;
	const connection = new MongoClient(url, { useNewUrlParser: true });
	connection.connect((err) =>{

		assert.equal(null, err);
		const db = connection.db(dbName);
		searchRestaurantByName(db, name, (result) =>{

			connection.close();
			res.status(200).type('json').json(result).end();

		})

	});

})
app.get("/api/restaurant/borough/:borough", (req, res) =>{

	const borough = req.params.borough;
	const connection = new MongoClient(url, { useNewUrlParser: true });
	connection.connect((err) =>{

		assert.equal(null, err);
		const db = connection.db(dbName);
		searchRestaurantByBorough(db, borough, (result) =>{

			connection.close();
			res.status(200).type('json').json(result).end();

		})

	});

})
app.get("/api/restaurant/cuisine/:cuisine", (req, res) =>{

	const cuisine = req.params.cuisine;
	const connection = new MongoClient(url, { useNewUrlParser: true });
	connection.connect((err) =>{

		assert.equal(null, err);
		const db = connection.db(dbName);
		searchRestaurantByCuisine(db, cuisine, (result) =>{

			connection.close();
			res.status(200).type('json').json(result).end();

		})

	});

})


//Handling Logout request
app.get('/Logout', (req, res) =>{

	req.session = null;
	res.redirect('/');

})



app.listen(process.env.PORT || 8099);
