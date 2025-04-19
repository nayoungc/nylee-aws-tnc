#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NyleeAwsTncStack } from '../lib/nylee-aws-tnc-stack';  // 여기서 실제 파일 이름과 일치하게 수정
import { NyleeAwsTncBedrockStack } from '../lib/nylee-aws-tnc-bedrock-stack';

const app = new cdk.App();
new NyleeAwsTncStack(app, 'NyleeAwsTncStack');
new NyleeAwsTncBedrockStack(app, 'NyleeAwsTncBedrockStack');
