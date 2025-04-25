import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  GetCommand, 
  PutCommand, 
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

class DynamoDBService {
  private client: DynamoDBDocumentClient;
  
  constructor() {
    const dbClient = new DynamoDBClient({ region: "us-east-1" });
    this.client = DynamoDBDocumentClient.from(dbClient);
  }

  // 테이블별 기본 서비스 메서드
  
  // CourseCatalog 메서드
  async getCourseCatalogById(catalogId: string, title: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog",
      Key: {
        catalogId: catalogId,
        title: title
      }
    };
    
    const { Item } = await this.client.send(new GetCommand(params));
    return Item;
  }

  async queryCourseCatalogsByTitle(title: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog",
      IndexName: "CourseCatalog-GSI1",
      KeyConditionExpression: "title = :title",
      ExpressionAttributeValues: {
        ":title": title
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items;
  }

  async queryCourseCatalogsByAwsCode(awsCode: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog",
      IndexName: "CourseCatalog-GSI2",
      KeyConditionExpression: "awsCode = :awsCode",
      ExpressionAttributeValues: {
        ":awsCode": awsCode
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items;
  }

  // Course Modules 메서드
  async getModulesByCatalogId(catalogId: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog-Modules",
      KeyConditionExpression: "catalogId = :catalogId",
      ExpressionAttributeValues: {
        ":catalogId": catalogId
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items;
  }

  async getModuleById(moduleId: string): Promise<any> {
    const params = {
      TableName: "Tnc-CourseCatalog-Modules",
      IndexName: "ourseCatalog-Modules-GSI1",
      KeyConditionExpression: "moduleId = :moduleId",
      ExpressionAttributeValues: {
        ":moduleId": moduleId
      }
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items && Items.length > 0 ? Items[0] : null;
  }

  // 나머지 테이블에 대한 메서드도 유사하게 구현할 수 있습니다
  // 각 테이블에 대한 기본적인 CRUD 작업을 정의합니다

  // 일반 CRUD 메서드
  async getItem(tableName: string, key: Record<string, any>): Promise<any> {
    const params = {
      TableName: tableName,
      Key: key
    };
    
    const { Item } = await this.client.send(new GetCommand(params));
    return Item;
  }

  async putItem(tableName: string, item: Record<string, any>): Promise<any> {
    const params = {
      TableName: tableName,
      Item: item
    };
    
    return await this.client.send(new PutCommand(params));
  }

  async queryItems(
    tableName: string, 
    keyCondition: string, 
    values: Record<string, any>, 
    indexName?: string
  ): Promise<any[]> {
    const params = {
      TableName: tableName,
      ...(indexName && { IndexName: indexName }),
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: values
    };
    
    const { Items } = await this.client.send(new QueryCommand(params));
    return Items || [];
  }
  
  async scanItems(
    tableName: string, 
    filterExpression?: string, 
    values?: Record<string, any>
  ): Promise<any[]> {
    const params = {
      TableName: tableName,
      ...(filterExpression && { FilterExpression: filterExpression }),
      ...(values && { ExpressionAttributeValues: values })
    };
    
    const { Items } = await this.client.send(new ScanCommand(params));
    return Items || [];
  }
}

export const dynamoDBService = new DynamoDBService();
