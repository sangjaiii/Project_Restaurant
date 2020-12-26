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
const url = 'mongodb+srv://ProjectAccess:yTUyYnl4jrE8RObp@cluster0.0czjw.mongodb.net/381_Project_Restaurant?retryWrites=true&w=majority';  // MongoDB Atlas Connection URL
const dbName = '381_Project_Restaurant'; // Database Name
const secKey = "I tried hard!";

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


//End 