const express = require('express')
require('dotenv').config()
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const cors = require('cors');
const { ObjectId } = require('mongodb');
const port = 5000

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static('servics'));
app.use(fileUpload());

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fuyuk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const carCollection = client.db("creativeAgency").collection("cars");
  // perform actions on the collection object

  app.post('/addCar', (req, res) => {
    const file = req.files.file
    const carName = req.body.carName
    const _id = req.body.id
    const description = req.body.description
    const price = req.body.price
    const brandName = req.body.brandName
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: req.files.file.mimetype,
      size: req.files.file.size,
      img: Buffer.from(encImg, 'base64')
    };

    carCollection.insertOne({ _id, carName, price, brandName, description, image, rating: 5 })
      .then(result => res.send(result.insertedCount > 0))
  })

  app.get('/allCars', (req, res) => {
    carCollection.find()
      .toArray((err, result) => res.send(result))
  })

  app.get('/details/:id', (req, res) => {
    const id = req.params.id
    carCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  app.delete('/carDelete/:id', (req, res) => {
    const id = req.params.id
    carCollection.deleteOne({ _id: id })
      .then(result => res.send(result.deletedCount > 0))

  })

  app.patch('/review/:id', (req, res) => {
    let id = req.params.id
    const rating = req.body.review.rating
    const comment = req.body.review.comment
    carCollection.updateOne({ _id: id },
      {
        $set: { comment, rating },
      })
      .then(result => res.send(result.modifiedCount > 0))
  })

  app.patch('/editDetails/:id', (req, res) => {
    const id = req.params.id
    const carName = req.body.carName
    const description = req.body.description
    const price = req.body.price

    carCollection.updateOne({ _id: id },
      {
        $set: { carName, price, description },
      })
      .then(result => res.send(result.modifiedCount > 0))
  })

});

app.get('/', (req, res) => {
  res.send("Hello from DB, It's Working !!")
})

app.listen(process.env.PORT || port, () => {
  console.log(`${port} is running`)
})