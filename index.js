const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config()
const app = express()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//middleware
app.use(cors())
app.use(express.json())

//MongoDb Url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.uxzfht6.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db("MetaMotion")
        const UserCollection = database.collection('User')
        const GalleryCollection = database.collection('Gallery')
        const AppliedCollection = database.collection('Applied_Trainer')
        const TrainerCollection = database.collection('Trainer')
        const SubscriberCollection = database.collection('Subscriber')
        const ReviewCollection = database.collection('Review')
        const ForumsCollection = database.collection('Forums')
        const ClassCollection = database.collection('Class')

        //User 
        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await UserCollection.insertOne(user)
            res.send(result)
        })
        app.get('/users', async (req, res) => {
            const cursor = UserCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await UserCollection.findOne(query)
            res.send(result)
        })
        app.patch('/users/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body;
            const query = { email: email }
            const isExist = await UserCollection.findOne(query)
            if (!isExist) {
                const result = await UserCollection.insertOne(user)
                res.send(result)
            }
            else {
                const UpdateUser = {
                    $set: {
                        lastSignInTime: user.lastSignInTime,
                    }
                }
                const result = await UserCollection.updateOne(query, UpdateUser)
                res.send(result)
            }
        })
        //Gallery
        app.get('/gallery', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const offset = parseInt(req.query.offset)
            const cursor = GalleryCollection.find()
            const galleryData = await cursor.toArray()
            const paginate = (array, limit, offset) => {
                const startIndex = offset;
                const endIndex = offset + limit;
                const paginatedData = array.slice(startIndex, endIndex);
                return paginatedData;
            }
            const result = paginate(galleryData, limit, offset);
            res.send(result)
        })
        //Applied Trainer
        app.post('/appliedTrainer', async (req, res) => {
            const appliedData = req.body;
            const query = { email: appliedData.email }
            const isExist = await AppliedCollection.findOne(query)
            if (isExist) {
                res.send(isExist)
            }
            else {
                const result = await AppliedCollection.insertOne(appliedData)
                res.send(result)
            }
        })
        app.get('/appliedTrainer', async (req, res) => {
            const cursor = AppliedCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.delete('/appliedTrainer/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await AppliedCollection.deleteOne(query)
            res.send(result)
        })
        //Trainer data
        app.post('/trainer', async (req, res) => {
            const data = req.body;
            const result = await TrainerCollection.insertOne(data)
            res.send(result)
        })
        app.get('/trainer', async (req, res) => {
            const cursor = TrainerCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/trainerDetails', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await TrainerCollection.findOne(query)
            res.send(result)
        })
        //Subscriber
        app.post('/subscriber', async (req, res) => {
            const data = req.body;
            const query = { email: data.email }
            const isExist = await SubscriberCollection.findOne(query)
            if (isExist) {
                res.send(isExist)
            }
            else {
                const result = await SubscriberCollection.insertOne(data)
                res.send(result)
            }
        })
        app.get('/subscriber', async (req, res) => {
            const cursor = SubscriberCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        //Reviews
        app.post('/review', async (req, res) => {
            const data = req.body;
            const result = await ReviewCollection.insertOne(data)
            res.send(result)
        })
        app.get('/review', async (req, res) => {
            const cursor = ReviewCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        //Forums POst
        app.post('/forums', async (req, res) => {
            const data = req.body;
            const result = await ForumsCollection.insertOne(data)
            res.send(result)
        })
        app.get('/forums', async (req, res) => {
            const cursor = ForumsCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.get('/forums/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await ForumsCollection.findOne(query)
            res.send(result)
        })
        app.put('/LikeForums/:id', async (req, res) => {
            const Id = req.params.id
            const data = req.body
            const query = { _id: new ObjectId(Id), likes: { email: data.email } }
            const filter = { _id: new ObjectId(Id) }
            const isExist = await ForumsCollection.findOne(query)
            if (!isExist) {
                const query2 = { _id: new ObjectId(Id), dislikes: { email: data.email } }
                const isExist2 = await ForumsCollection.findOne(query2)
                if (isExist2) {
                    const disliked = {
                        $pull: {
                            dislikes: { email: data.email }
                        }
                    }
                    const liked = {
                        //change set to push
                        $push: {
                            likes: { email: data.email }
                        }
                    }
                    const result = await ForumsCollection.updateOne(filter, liked)
                    const result2 = await ForumsCollection.updateOne(filter, disliked)
                    res.send(result2)
                }
                else {
                    const liked = {
                        $push: {
                            likes: { email: data.email }
                        }
                    }
                    const result = await ForumsCollection.updateOne(filter, liked)
                    res.send(result)
                }
            }
        })
        app.put('/disLikeForums/:id', async (req, res) => {
            const Id = req.params.id
            const data = req.body
            const query = { _id: new ObjectId(Id), dislikes: { email: data.email } }
            const filter = { _id: new ObjectId(Id) }
            const isExist = await ForumsCollection.findOne(query)
            if (!isExist) {
                const query2 = { _id: new ObjectId(Id), likes: { email: data.email } }
                const isExist2 = await ForumsCollection.findOne(query2)
                if (isExist2) {
                    const disliked = {
                        $push: {
                            dislikes: { email: data.email }
                        }
                    }
                    const liked = {
                        //change set to push
                        $pull: {
                            likes: { email: data.email }
                        }
                    }
                    const result = await ForumsCollection.updateOne(filter, liked)
                    const result2 = await ForumsCollection.updateOne(filter, disliked)
                    res.send(result2)
                }
                else {
                    const disliked = {
                        $push: {
                            dislikes: { email: data.email }
                        }
                    }
                    const result = await ForumsCollection.updateOne(filter, disliked)
                    res.send(result)
                }

            }
        })
        //Class
        app.post('/class', async (req, res) => {
            const data = req.body;
            const result = await ClassCollection.insertOne(data)
            res.send(result)
        })
        app.get('/class', async (req, res) => {
            const cursor = ClassCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })
        app.put('/class/:id', async (req, res) => {
            const Id = req.params.id
            const data = req.body;
            const query = {
                _id: new ObjectId(Id),
                joinMember: {
                    stdName: data.stdName,
                    stdEmail: data.stdEmail,
                    stdPhotoURL: data.stdPhotoURL,
                }
            }
            const isExist = await ClassCollection.findOne(query)
            if (!isExist) {
                const Joined = {
                    $push: {
                        joinMember: {
                            stdName: data.stdName,
                            stdEmail: data.stdEmail,
                            stdPhotoURL: data.stdPhotoURL,
                        }
                    }
                }
                const result = await ClassCollection.updateOne({ _id: new ObjectId(Id) }, Joined)
                res.send(result)
            }
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', async (req, res) => {
    res.send("Meta Motion Server")
})
app.listen(port, () => {
    console.log('App listing on PORT:', port)
})