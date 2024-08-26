import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, mfccFeatures } = req.body;

    if (!name || !mfccFeatures) {
      return res.status(400).json({ message: "Missing name or MFCC features" });
    }

    const client = new MongoClient(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    try {
      await client.connect();
      const database = client.db("SIH");
      const collection = database.collection("Audio");

      await collection.insertOne({
        name,
        mfccFeatures,
        timestamp: new Date(),
      });

      res.status(201).json({ message: "Data saved successfully!" });
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
