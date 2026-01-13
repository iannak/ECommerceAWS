import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";

const dynamoDbClient = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, dynamoDbClient);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

  const method = event.httpMethod;

  if (event.resource === '/products') {
    if (method === 'GET') {
      console.log('Fetching products...');

      const products = await productRepository.getAllProducts();

      return {
        statusCode: 200,
        body: JSON.stringify(products)
      };
    }
  } else if (event.resource === "/products/{id}") {
    if (method === 'GET') {
      const productId = event.pathParameters!.id as string;
      console.log(`GET: /products/${productId}`);

      try {
        const product = await productRepository.getProductById(productId);

        return {
          statusCode: 200,
          body: JSON.stringify(product)
        };
      } catch (error) {
        console.error(`Error fetching product with id ${productId}:`, error);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Product not found' })
        };
      }
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({ message: 'Bad Request' })
  };
}
