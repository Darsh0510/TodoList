//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose")
const _ = require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

async function main(){
  await mongoose.connect("mongodb://0.0.0.0:27017/todolistDB")
} 

main().catch((err)=>{
  console.log(err);
})


const itemsSchema = new mongoose.Schema({
  name : String
})

const Item = mongoose.model('Item',itemsSchema)

const item1= new Item({
  name : "Welcome to your TodoList"
})

const item2 = new Item({
  name : "Hit the + button to add a new item"
})

const item3 = new Item({
  name : "<-- Hit this to delete an item"
})

const defaultitem = [item1,item2,item3]

const listSchema = new mongoose.Schema({
  name : String,
  items: [itemsSchema] 
})

const List = mongoose.model("List", listSchema)




app.get("/", async function(req, res) {

// const day = date.getDate();
await Item.find().then((foundItems)=>{
  if (foundItems.length == 0){
    Item.insertMany(defaultitem)
  .then((docs)=>{console.log("Hurray");})
  .catch((err)=>{
    console.log(err);
  })
  res.redirect("/")
  }else{
    console.log(foundItems)
    
    res.render("list", {listTitle: "Today", newListItems: foundItems})
  }  
  
})
});

app.get("/:customListName",(req,res)=>{
  const customName = _.capitalize(req.params.customListName)

  List.findOne({name: customName}).then(foundList=>{
    if (!foundList){
      
      
      const list = new List({
        name : customName,
        items: defaultitem
      }) 
      list.save()
      res.redirect("/"+list.name)
    }else{
      res.render("list",{listTitle: foundList.name, newListItems:foundList.items})
    }
  })
  

  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list
  console.log(req.body);

  const item = new Item({
    name: itemName
  })

  if (listName == "Today"){
    
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name: listName}).then((foundList)=>{
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+foundList.name)
    })
  }

  

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",(req,res)=>{
  const checkboxItemId = req.body.checkbox;
  const listname = req.body.listname

  if (listname == "Today"){
    Item.findByIdAndDelete({_id:checkboxItemId}).then((output)=>{
      res.redirect("/")
    })
  }else{
    List.findOneAndUpdate({name: listname},{$pull : {items: {_id : checkboxItemId}}}).then(foundList=>{
      console.log(foundList)
      res.redirect("/"+listname)
    })
  }

  
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
