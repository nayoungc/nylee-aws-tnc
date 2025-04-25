import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

export class BedrockService {
  private client: BedrockRuntimeClient;
  private model: string;
  private kbId: string;

  constructor() {
    this.client = new BedrockRuntimeClient({ region: "us-east-1" });
    this.model = "anthropic.claude-3-5-sonnet-20240620-v1:0";
    this.kbId = "9NFEGNPEJ9";
  }

  async generateText(prompt: string): Promise<string> {
    const input = {
      modelId: this.model,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              }
            ]
          }
        ]
      })
    };

    try {
      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);
      
      // Parse response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.content[0].text;
    } catch (error) {
      console.error("Error calling Bedrock:", error);
      throw error;
    }
  }

  // Knowledge Base 쿼리 메서드는 필요에 따라 추가
}

export const bedrockService = new BedrockService();
