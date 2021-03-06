// @flow

import { GraphQLNonNull, GraphQLID, GraphQLString } from 'graphql';
import { fromGlobalId } from 'graphql-relay';

import { post } from '../../common/services/HttpRequest';
import { ProxiedError } from '../../common/services/errors/ProxiedError';
import supportedLanguages from '../supportedLanguages';
import FAQArticle from '../types/outputs/FAQArticle';
import FAQCommentType from '../types/inputs/FAQCommentType';
import type { FAQArticleDetail as FAQArticleType } from '../dataloaders/FAQArticle';
import type { GraphqlContextType } from '../../common/services/GraphqlContext';

const successfulResponse = { message: 'yummy indeed' };

export default {
  type: FAQArticle,
  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'ID of FAQ article to receive vote.',
    },
    type: {
      type: new GraphQLNonNull(FAQCommentType),
      description: 'Value indicating the comment type.',
    },
    comment: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Comment text',
    },
  },
  resolve: async (
    _: mixed,
    { id, type: commentType, comment }: Object,
    { dataLoader, locale, whoIAm }: GraphqlContextType,
  ): Promise<FAQArticleType> => {
    const payload = {
      type: commentType,
      comment,
    };
    const { id: originalId, type } = fromGlobalId(id);

    if (type !== 'FAQArticle') {
      throw new Error(
        `FAQArticle ID mishmash. You cannot query FAQ with ID ` +
          `'${id}' because this ID is not ID of the FAQArticle. ` +
          `Please use opaque ID of the FAQArticle.`,
      );
    }

    let language = locale.language;
    if (supportedLanguages[language] !== true) {
      language = 'en';
    }

    const commentUrl = `https://api.skypicker.com/knowledgebase/api/v1/articles/${originalId}/comment`;
    const response = await post(commentUrl, payload, {
      'Accept-Language': language,
      'X-WHOIAM': whoIAm,
    });
    if (response.message !== successfulResponse.message) {
      throw new ProxiedError(
        response.message ? response.message : 'Article commenting failed',
        response.error_code ? response.error_code : '-1',
        commentUrl,
      );
    }

    return dataLoader.FAQArticle.load({ originalId });
  },
};
