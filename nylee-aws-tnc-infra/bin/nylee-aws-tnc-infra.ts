#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NyleeAwsTncStack } from '../lib/nylee-aws-tnc-stack';
import { NyleeAwsTncBedrockStack } from '../lib/nylee-aws-tnc-bedrock-stack';

const app = new cdk.App();
new NyleeAwsTncStack(app, 'NyleeAwsTncStack');
new NyleeAwsTncBedrockStack(app, 'NyleeAwsTncBedrockStack');
