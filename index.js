import { faker } from '@faker-js/faker';
import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'testdb';
const collectionName = 'products';


const generateFakeProduct = () => ({
  name: faker.commerce.productName(),
  price: faker.commerce.price(),
  category: faker.commerce.department(),
  rating: faker.helpers.arrayElement([1, 2, 3, 4, 5]),
  description: faker.lorem.sentence(),
});

const createIndexes = async (client) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    console.time('Index Creation Time');
    // Create index on category and rating
    await collection.createIndex({ category: 1, rating: -1 });
    console.timeEnd('Index Creation Time');
  };

const insertBulkData = async (client, data) => {
  const db = client.db(dbName);
  const collection = db.collection(collectionName);
  console.time('Bulk Insertion Time');
  await collection.insertMany(data);
  console.timeEnd('Bulk Insertion Time'); // Bulk Insertion Time: 106.216ms
};

const filterAndSortProducts = async (client, category) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
  
    console.time('Query Time');
  
    const products = await collection
      .find({ category })
      .sort({ rating: -1 })
      .toArray();
  
    console.timeEnd('Query Time');
  
    console.log(`Found ${products.length} products in category '${category}'`);
    console.log(products);
  };

const main = async () => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();

    await createIndexes(client);

    await insertBulkData(client, Array.from({ length: 10000 }, generateFakeProduct));

    const categoryToFilter = 'Sports';
    await filterAndSortProducts(client, categoryToFilter);

  } finally {
    await client.close();
  }
};

main().catch(console.error);
