// @flow

import GraphQLIdentity from '../types/outputs/Identity';
import type { GraphqlContextType } from '../../common/services/GraphqlContext';

export default {
  type: GraphQLIdentity, // may be null (doesn't exist)
  description: 'Current user information.',
  resolve: async (
    ancestor: mixed,
    args: Object,
    { dataLoader }: GraphqlContextType,
  ) => dataLoader.identity.load(),
};
