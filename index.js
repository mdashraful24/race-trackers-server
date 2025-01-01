require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://marathonproject-2a4f2.web.app',
        'https://marathonproject-2a4f2.firebaseapp.com'
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Token Verification
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;

    if (!token) {
        return res.status(401).send({ message: 'Unauthorized access' })
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized access' })
        }
        req.user = decoded;
        next();
    })
}

// Database connect URI
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
        // await client.connect();
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        // All Collections
        const marathonsCollection = client.db('marathonRace').collection('marathons');
        const registrationsCollection = client.db('marathonRace').collection('registrations');

        // Auth related APIs
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                })
                .send({ success: true });
        });

        app.post('/logout', (req, res) => {
            res
                .clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                })
                .send({ success: true })
        })

        // Get marathons data
        app.get('/marathons', async (req, res) => {
            const cursor = marathonsCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        });

        // Sorting section with marathon page
        app.get('/marathonPage', verifyToken, async (req, res) => {
            try {
                const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
                const cursor = marathonsCollection.find().sort({ createdAt: sortOrder });
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching marathons:', error);
                res.status(500).send({ message: 'Failed to fetch marathons' });
            }
        });

        app.get('/marathons/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await marathonsCollection.findOne(query);
            res.send(result);
        });

        app.get('/myApplyList', verifyToken, async (req, res) => {
            const title = req.query.title || '';
            const cursor = registrationsCollection.find({
                title: { $regex: new RegExp(title, 'i') } // Case-insensitive search
            });
            const result = await cursor.toArray();
            res.send(result);
        });

        app.post('/addMarathons', async (req, res) => {
            const newMarathon = req.body;
            // console.log(newMarathon);
            const result = await marathonsCollection.insertOne(newMarathon);
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

        app.put('/marathonPage/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedList = req.body;
            const campaign = {
                $set: {
                    title: updatedList.title,
                    firstName: updatedList.firstName,
                    lastName: updatedList.lastName,
                    number: updatedList.number,
                    startRegistrationDate: updatedList.startRegistrationDate,
                    endRegistrationDate: updatedList.endRegistrationDate,
                    marathonStartDate: updatedList.marathonStartDate,
                    runningDistance: updatedList.runningDistance,
                    description: updatedList.description,
                    marathonImage: updatedList.marathonImage,
                }
            }
            const result = await marathonsCollection.updateOne(filter, campaign, options);
            res.send(result);
        })

        app.delete('/marathonPage/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await marathonsCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/myApplyList/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await registrationsCollection.deleteOne(query);
            res.send(result);
        });

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
    // console.log(`Marathon running at: ${port}`);
});
