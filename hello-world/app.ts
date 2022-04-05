import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import AWS from 'aws-sdk';
AWS.config.update({ region: 'us-east-1' });

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    if (event.path === '/categoria') {
        return {
            body: await getByCategory(),
            statusCode: 201,
        };
    }

    if (event.path === '/categoria-scan') {
        return {
            body: await getByCategoryWithScan(),
            statusCode: 201,
        };
    }

    switch (event.httpMethod) {
        case 'POST':
            return {
                body: await createItem(),
                statusCode: 204,
            };
        case 'DELETE':
            return {
                body: await deleteItem(),
                statusCode: 204,
            };
        case 'PUT':
            return {
                body: await updateItem(),
                statusCode: 204,
            };
        case 'GET':
            return {
                body: await getItem(),
                statusCode: 201,
            };
        default:
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Metodo inváido',
                }),
            };
    }
};

async function updateItem() {
    const dynamoParams = {
        TableName: 'first_table',
        Key: { id: '3' },
        UpdateExpression: 'set nome - :nome, categoria - :categoria',
        ExpressionAttributeValues: {
            ':nome': 'Maria do Carmo',
            ':categoria': 3,
        },
    };
    try {
        const docClient = new AWS.DynamoDB.DocumentClient();
        await docClient.update(dynamoParams).promise();
        return JSON.stringify({});
    } catch (err) {
        return JSON.stringify({
            message: 'some error happened',
        });
    }
}

async function getByCategoryWithScan() {
    const dynamoParams = {
        TableName: 'first_table',
        ProjectionExpression: 'id, nome',
        FilterExpression: '#categoria = :categoria and contains(nome, :nome)',
        ExpressionAttributeNames: {
            '#categoria': 'categoria',
        },
        ExpressionAttributeValues: {
            ':categoria': 2,
            ':nome': 'Maria',
        },
    };

    try {
        const docClient = new AWS.DynamoDB.DocumentClient();
        const data = await docClient.scan(dynamoParams).promise();
        return JSON.stringify(data.Items);
    } catch (err) {
        return JSON.stringify({
            message: 'some error happened',
        });
    }
}

async function getByCategory() {
    const dynamoParams = {
        TableName: 'first_table',
        IndexName: 'categoria-index',
        ProjectionExpression: 'id, nome',
        KeyConditionExpression: '#categoria = :categoria',
        FilterExpression: 'contains(nome, :nome)',
        ExpressionAttributeNames: {
            '#categoria': 'categoria',
        },
        ExpressionAttributeValues: {
            ':categoria': 2,
            ':nome': 'Maria',
        },
    };

    try {
        const docClient = new AWS.DynamoDB.DocumentClient();
        const data = await docClient.query(dynamoParams).promise();
        console.log({ data });
        return JSON.stringify(data.Items);
    } catch (err) {
        return JSON.stringify({
            message: 'some error happened',
        });
    }
}

async function deleteItem() {
    const dynamoParams = {
        TableName: 'first_table',
        Key: { id: '1' },
    };
    try {
        const docClient = new AWS.DynamoDB.DocumentClient();
        await docClient.delete(dynamoParams).promise();
        return JSON.stringify({});
    } catch (err) {
        return JSON.stringify({
            message: 'some error happened',
        });
    }
}

async function getItem() {
    const dynamoParams = {
        TableName: 'first_table',
        Key: { id: '1' },
    };
    try {
        const docClient = new AWS.DynamoDB.DocumentClient();
        const body = await docClient.get(dynamoParams).promise();
        return JSON.stringify(body.Item);
    } catch (err) {
        return JSON.stringify({
            message: 'some error happened',
        });
    }
}

async function createItem() {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const dynamoParams = {
        TableName: 'first_table',
        Item: { id: '3', nome: 'Maria da Silva', categoria: 2 },
    };
    try {
        await docClient.put(dynamoParams).promise();
        return JSON.stringify({});
    } catch (err) {
        return JSON.stringify({
            message: 'some error happened',
        });
    }
}
