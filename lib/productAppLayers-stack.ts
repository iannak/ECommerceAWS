import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ProductsAppLayersStack extends cdk.Stack {
  readonly productsLayers: lambda.LayerVersion;
  readonly productsEventsLayers: lambda.LayerVersion;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productsLayers = new lambda.LayerVersion(this, "ProductsLayers", {
      code: lambda.Code.fromAsset("lambda/products/layers/productLayer"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      layerVersionName: "ProductLayer",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    new ssm.StringParameter(this, "ProductsLayersVersionArn", {
      parameterName: "ProductsLayersVersionArn",
      stringValue: productsLayers.layerVersionArn,
    });

    const productsEventsLayers = new lambda.LayerVersion(
      this,
      "productsEventsLayers",
      {
        code: lambda.Code.fromAsset(
          "lambda/products/layers/productEventsLayer",
        ),
        compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
        layerVersionName: "ProductEventsLayer",
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      },
    );
    new ssm.StringParameter(this, "ProductsEventsLayersVersionArn", {
      parameterName: "ProductsEventsLayersVersionArn",
      stringValue: productsEventsLayers.layerVersionArn,
    });
  }
}
