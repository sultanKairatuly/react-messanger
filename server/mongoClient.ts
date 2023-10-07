import { MongoClient, ServerApiVersion } from "mongodb";

const uri = "mongodb+srv://sultanbekkajratuly:<password>@cluster0.t0mwif5.mongodb.net/?retryWrites=true&w=majority";
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

