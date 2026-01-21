import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Product, ProductRepository } from "/opt/nodejs/productsLayer";
import { DynamoDB } from "aws-sdk";
import { error } from "console";
import * as AWSXRay from "aws-xray-sdk";

AWSXRay.captureAWS(require("aws-sdk"));

const dynamoDbClient = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();

const productRepository = new ProductRepository(ddbClient, dynamoDbClient);

export async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  const lamdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;

  console.log(
    `API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lamdaRequestId}`,
  );

  if (event.resource === "/products") {
    console.log("POST /products");

    const productData = JSON.parse(event.body!) as Product;
    const newProduct = await productRepository.create(productData);

    return {
      statusCode: 201,
      body: JSON.stringify(newProduct),
    };
  } else if (event.resource === "/products/{id}") {
    const productId = event.pathParameters!.id as string;
    if (event.httpMethod === "PUT") {
      console.log(`PUT: /products/${productId}`);

      const productData = JSON.parse(event.body!) as Product;

      try {
        const updatedProduct = await productRepository.updateProduct(
          productId,
          productData,
        );

        return {
          statusCode: 200,
          body: JSON.stringify(updatedProduct),
        };
      } catch (ConditionalCheckFailedException) {
        console.error(`Error updating product with id ${productId}:`, error);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Product not found" }),
        };
      }
    } else if (event.httpMethod === "DELETE") {
      console.log(`DELETE: /products/${productId}`);

      try {
        const product = await productRepository.deleteProduct(productId);

        return {
          statusCode: 200,
          body: JSON.stringify(product),
        };
      } catch (error) {
        console.error(`Error deleting product with id ${productId}:`, error);
        return {
          statusCode: 404,
          body: JSON.stringify({ message: "Product not found" }),
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: "Bad request",
  };
}
