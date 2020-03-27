const AWS = require("aws-sdk");

AWS.config.update({
  region: 'us-west-1',
  endpoint: "https://dynamodb.us-west-1.amazonaws.com"
});

const docClient = new AWS.DynamoDB.DocumentClient();

function upsert({ table, id, doc }) {
  const params = {
    TableName: table,
    Key: {
      id: id
    },
    UpdateExpression: "set #field = :value",
    ExpressionAttributeNames: {
      "#field": Object.keys(doc)[0]
    },
    ExpressionAttributeValues: {
      ":value": Object.values(doc)[0]
    },
  }

  return new Promise((resolve, reject) => {
    docClient.update(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  })
}

function insert({ table, doc }) {
  const params = {
    TableName: table,
    Item: doc,
  }

  return new Promise((resolve, reject) => {
    docClient.put(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  })
}


function insertMany({ table, docs }) {
  if(docs.length > 25 || docs.length === 0) {
    return Promise.reject(new Error('Docs must be a array with length 1-25'))
  }

  var params = {
    RequestItems: {
    }
  };
  params.RequestItems[table] = docs.map(doc => ({ PutRequest: { Item: doc } }));

  return new Promise((resolve, reject) => {
    docClient.batchWrite(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  });
}

function scan({ table, index, limit }) {
  const params = {
    TableName: table,
    IndexName: index,
    Limit: limit
  };

  return new Promise((resolve, reject) => {
    docClient.scan(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  });
}

function getByPrimaryKey({ table, key }) {
  if(typeof(key) !== 'object' && Object.keys(key).length === 0) {
    return Promise.reject(new Error('Key must be a object containing one key value pair'));
  }

  const params = {
    TableName: table, 
    KeyConditionExpression: "#field = :value",
    ExpressionAttributeNames: {
      "#field": Object.keys(key)[0]
    },
    ExpressionAttributeValues: {
      ":value": Object.values(key)[0],
    },
    ReturnConsumedCapacity: 'TOTAL',
  };

  return new Promise((resolve, reject) => {
    docClient.query(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  });
}

function getByHashIndex({ table, index, partition }) {
  const params = {
    TableName: table,
    IndexName: index,
    KeyConditionExpression: `#partition = :hashValue`,
    ExpressionAttributeNames: {
      "#partition": Object.keys(partition)[0],
    },
    ExpressionAttributeValues: {
      ":hashValue": Object.values(partition)[0],
    },
    ReturnConsumedCapacity: 'TOTAL',
  };

  return new Promise((resolve, reject) => {
    docClient.query(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  });
}

function getByCompositeIndex({ table, index, partition, sort, limit=50, ascending=true }) {
  const params = {
    TableName: table,
    IndexName: index,
    KeyConditionExpression: `#partition = :hashValue and #sort ${sort['op']} :rangeValue`,
    ExpressionAttributeNames: {
      "#partition": Object.keys(partition)[0],
      "#sort": sort['field'],
    },
    ExpressionAttributeValues: {
      ":hashValue": Object.values(partition)[0],
      ":rangeValue": sort['value'],
    },
    ScanIndexForward: ascending,
    Limit: limit,
    //ReturnConsumedCapacity: 'TOTAL',
  };

  return new Promise((resolve, reject) => {
    docClient.query(params, (err ,data) => {
      if(err) reject(err);

      resolve(data)
    })
  });
}

module.exports = {
  name: 'dynamodb',
  upsert,
  insert,
  insertMany,
  scan,
  getByPrimaryKey,
  getByHashIndex,
  getByCompositeIndex,
};
