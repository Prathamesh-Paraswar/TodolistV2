//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolist", { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })

const items=mongoose.Schema({
  name:{
    type:String,
    required:true
  }
})
const Item=mongoose.model("list",items)

const l1=new Item({
  name:"Buy Food"
})

const l2=new Item({
  name:"Cook Food"
})

const l3=new Item({
  name:"Eat Food"
})

const defaultItems=[l1,l2,l3]

const listSchema=mongoose.Schema({
  name:String,
  list : { type : Array }
})

const List=mongoose.model("randomList",listSchema);

app.get("/", function(req, res) {
  Item.find({},function(err,result)//Find in the list return =0 if list is empty
  {
    if(result.length===0)//If empty insert default items
    {
      Item.insertMany(defaultItems,function(err)
      {
        if(err)
        {
          console.log("Error in inserting")
        }
        else
        {
          console.log("Successfully inserted");
        }
      });
      res.redirect("/");
    }
    else
    {
      res.render("list", {listTitle: "Today", newListItems: result});
    }
  })
});

app.get("/:listName",function(req,res)
{
  const listname=_.capitalize(req.params.listName);//To capitalize any text entered by the user
  
  List.findOne({name:listname},function(err,fname)
  {
    if(!err)
    {
      if(!fname)
      {
        //To save the list since it is new
        const list1=new List({
          name:listname,
          list:defaultItems
        });
        list1.save()
        res.redirect("/"+listname)
      }
      else{
        //To display the list since it already exists
        // console.log("Exists")
        res.render("list",{listTitle:listname,newListItems:fname.list})
      }
    }
  })
})
app.post("/", function(req, res){//For the post request

  const item = req.body.newItem;//To get the post element
  const l=req.body.list;//To get the list
  const doc=new Item({
    name:item
  })
  if(l==="Today")
  {
    doc.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:l},function(err,item)
    {
      if(!err)
      {
        item.list.push(doc);
        item.save();
        res.redirect("/"+l);
      }
    })
  }
});


app.post("/delete",function(req,res)
{
  const id=req.body.check;
  const title=req.body.title;
  if(title==="Today")
  {
      Item.deleteOne({_id:id},function(err)
      {
        if(err)
        {
          console.log("Error")
        }
        else{
        }
      })
      res.redirect("/");
  }
  else{
    List.findOneAndUpdate({ name :title},{ $pull: {list: {_id :id }}},function(err,flist)
    {
      console.log(flist)
      if(err)
      {
        console.log(err)
      }
      else
      {
        res.redirect("/"+title)
      }
    });
  }
})


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
