import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './aws-config';

export const configureAmplify = () => {
  Amplify.configure(amplifyConfig);
};
