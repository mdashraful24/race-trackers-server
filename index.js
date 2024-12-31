require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.p8flg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const marathonsCollection = client.db('marathonRace').collection('marathons');
        const registrationsCollection = client.db('marathonRace').collection('registrations');

        app.get('/marathons', async (req, res) => {
            const cursor = marathonsCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/marathonPage', async (req, res) => {
            const cursor = marathonsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/marathons/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await marathonsCollection.findOne(query);
            res.send(result);
        });

        app.get('/myApplyList', async (req, res) => {
            const cursor = registrationsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/registrations", async (req, res) => {
            const registration = req.body;
            const result = await registrationsCollection.insertOne(registration);

            if (result.insertedId) {
                // Update the total registration count
                const title = registration.title;
                await marathonsCollection.updateOne(
                    { title },
                    { $inc: { totalRegistrationCount: 1 } }
                );
            }
            res.send(result);
        });

        app.put('/myApplyList/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedInfo = req.body;
            const racing = {
                $set: {
                    firstName: updatedInfo.firstName,
                    lastName: updatedInfo.lastName,
                    number: updatedInfo.number,
                    additionalInfo: updatedInfo.additionalInfo
                }
            }
            const result = await registrationsCollection.updateOne(filter, racing, options);
            res.send(result);
        })

        app.delete('/myApplyList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await registrationsCollection.deleteOne(query);
            res.send(result);
        });


        // app.patch("/marathons/increment/:title", async (req, res) => {
        //     const title = req.params.title;
        //     const result = await marathonsCollection.updateOne(
        //         { title },
        //         { $inc: { totalRegistrationCount: 1 } }
        //     );
        //     res.send(result);
        // });

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Marathons running starts');
});

app.listen(port, () => {
    console.log(`Marathon running at: ${port}`);
});
