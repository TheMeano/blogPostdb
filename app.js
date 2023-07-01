//jshint esversion:6

const express = require("express");
const ejs = require("ejs");
const _ = require("lodash");
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const { getDate } = require(__dirname + "/date.js");
const methodOverride = require("method-override");


const uri = "mongodb+srv://Meano:1aqr1hPThjH69uKu@cluster0.3nmf3fk.mongodb.net/BlogPost?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

const date = require(__dirname + "/date.js")


const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));

let posts = [];
let day = getDate(date)


app.get("/", async(req, res) =>{

  
  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("BlogPost");
    const posts = await todolist.find().toArray(); // Fetch all items from the collection

    res.render("home", {
      loremIpsum: homeStartingContent,
      posts: posts,
      Datum : day
      });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
 
});

app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", async(req, res)=>{
  const post = {
    title: req.body.title,
    post: req.body.text
  };

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("BlogPost");
    const result = await todolist.insertOne({ post: post });
    console.log(`A document was inserted with the _id: ${result.insertedId}`);
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }


  posts.push(post);

  res.redirect("/");

});

app.get("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("BlogPost");
    const post = await todolist.findOne({ _id: new ObjectId(postId) });

    if (post) {
      res.render("post", {
        title: post.post.title,
        content: post.post.post,
        postId: postId // Pass the postId to the view
      });
    } else {
      res.send("Post not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
});


app.delete("/posts/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    await client.connect();
    const database = client.db();
    const todolist = database.collection("BlogPost");
    const result = await todolist.deleteOne({ _id: new ObjectId(postId) });
    console.log(`${result.deletedCount} document(s) deleted`);
    res.redirect("/");
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
