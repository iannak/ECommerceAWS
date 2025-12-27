import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs';

export class ProductsAppStack extends cdk.Stack { 
    readonly productsFetchHandler: lambdaNodejs.NodejsFunction;
    readonly productsAdminHandler: lambdaNodejs.NodejsFunction;
    readonly productsDdb: dynamodb.Table;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.productsDdb = new dynamodb.Table(this, "ProductsDdb", {
            tableName: "products",
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })

        this.productsFetchHandler = new lambdaNodejs.NodejsFunction(this, 'ProductsFetchFunction', {
            functionName: 'ProductsFetchFunction',
            entry: 'lambda/products/productsFetchFunction.ts',
            handler: 'handler',
            memorySize: 512,
            runtime: lambda.Runtime.NODEJS_18_X,
            timeout: cdk.Duration.seconds(10),
            bundling: {
                minify: true,
                sourceMap: false,
            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName,
            }
        });

        this.productsDdb.grantReadData(this.productsFetchHandler)

        this.productsAdminHandler = new lambdaNodejs.NodejsFunction(this, 'ProductsAdminFunction', {
            functionName: 'ProductsAdminFunction',
            entry: 'lambda/products/productsAdminFunction.ts',
            handler: 'handler',
            memorySize: 512,
            runtime: lambda.Runtime.NODEJS_18_X,
            timeout: cdk.Duration.seconds(10),
            bundling: {
                minify: true,
                sourceMap: false,
            },
            environment: {
                PRODUCTS_DDB: this.productsDdb.tableName,
            }
        });
        this.productsDdb.grantWriteData(this.productsAdminHandler)
    }
}