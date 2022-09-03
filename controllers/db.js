var MongoClient = require('mongodb').MongoClient;
var url = "mongodb+srv://cluster0.c6csvjf.mongodb.net/myFirstDatabase";

MongoClient.connect(url, function(err, db) {
  console.log("Database created!");
  db.close();
});