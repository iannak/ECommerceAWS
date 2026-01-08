import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

export interface Product {
    id: string;
    productName: string;
    code: string;
    price: number;
    model: string;
}

export class ProductRepository {
    private readonly dbClient: DocumentClient;
    private readonly productsTable: string;

    constructor(dbClient: DocumentClient, productsTable: string) {
        this.dbClient = dbClient;
        this.productsTable = productsTable;
    }

    async getAllProducts(): Promise<Product[]> {
        const result = await this.dbClient.scan({ TableName: this.productsTable }).promise();
        return result.Items as Product[];
    }

    async getProductById(id: string): Promise<Product | null> {
        const result = await this.dbClient
            .get({
                TableName: this.productsTable,
                Key: { id },
            })
            .promise();

        return result.Item as Product || null;
    }

    async create(product: Product): Promise<Product> {
       product.id = uuid();
       await this.dbClient
           .put({
               TableName: this.productsTable,
               Item: product,
           })
           .promise();

       return product;
    }

    async deleteProduct(id: string): Promise<Product> {
        const data = await this.dbClient
            .delete({
                TableName: this.productsTable,
                Key: { id },
                ReturnValues: "ALL_OLD",
            })
            .promise();

        if(data.Attributes) {
            return data.Attributes as Product;
        }
        throw new Error(`Product with id ${id} not found`);
    }
}
