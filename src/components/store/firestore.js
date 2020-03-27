const Firestore = require('@google-cloud/firestore');

const db = new Firestore();

async function insert({ table, doc }) {
  const exists = await 
     db.collection(table)
      .doc(doc.id)
      .get()
      .then(doc => doc.exists)

  if(exists) return { message: `${doc.id} already exists` }

  return upsert({ table, doc });
}

function upsert({ table, doc }) {
  const { id, ...data } = doc;

  return db.collection(table)
    .doc(id)
    .set(data, {merge: true})
}

function remove({ table, id }) {
  return db.collection(table)
    .doc(id)
    .delete()
}

function getByIndex({ table, index, values, page=1, size }) {
  return db.collection(table)
    .where(index, '==', values)
    .offset((page-1)*size)
    .limit(size)
    .get()
    .then(cur => cur.docs.map(doc => ({ id: doc.id, ...doc.data()})))
}

module.exports = {
  name: 'firestore',
  insert,
  upsert,
  remove,
  getByIndex,
}
