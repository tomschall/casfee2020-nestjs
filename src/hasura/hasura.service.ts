import { Injectable, HttpService } from '@nestjs/common';
const util = require('util');

const HASURA_DIRECT_MESSAGE_OPERATION = `
mutation addDirectMessageChannel(
  $channel_type: channel_type_enum! = DIRECT_MESSAGE
  $name: String!
  $is_private: Boolean! = true
  $user_id1: String!
  $user_id2: String!
) {
  insert_channel(
    objects: {
      channel_type: $channel_type
      name: $name
      is_private: $is_private
      user_channels: { data: [{ user_id: $user_id1 }, { user_id: $user_id2 }] }
    }
  ) {
    affected_rows
  }
}
`;

const HASURA_CHECK_DIRECT_MESSAGE = `
query getCheckIfUserHasSubscribedToChannel($user_id: String!, $dm_to_user: String!) {
  channel(
    where: {
      user_channels: {
        _and: {
          user_id: { _eq: $user_id }
          channel: {
            user_channels: {
              user_id: { _eq: $dm_to_user }
              _and: { channel: { channel_type: { _eq: DIRECT_MESSAGE } } }
            }
          }
        }
      }
    }
  ) {
    id
    name
  }
}
`;

const HASURA_CHAT_MESSAGE_OPERATION = `
mutation addChannelUserSubscription($user_id: String!, $channel_id: Int!) {
  insert_user_channels(objects: {channel_id: $channel_id, user_id: $user_id}) {
    affected_rows
  }
}`;

const HASURA_GET_CHANNEL_TYPE = `
query getChannelType($id: Int! = 11) {
  channel(where: {id: {_eq: $id}}) {
    id
    name
    channel_type
    is_private
    owner_id
  }
}`;

@Injectable()
export class HasuraService {
  constructor(private httpService: HttpService) {}

  async addDirectMessageChannel(variables): Promise<any> {
    return this.httpService
      .post(
        'http://localhost:8080/v1/graphql',
        JSON.stringify({
          query: HASURA_DIRECT_MESSAGE_OPERATION,
          variables,
        }),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': 'supersecret',
          },
        },
      )
      .toPromise();
  }

  async getCheckIfUserHasSubscribedToChannel(variables): Promise<any> {
    return this.httpService
      .post(
        'http://localhost:8080/v1/graphql',
        JSON.stringify({
          query: HASURA_CHECK_DIRECT_MESSAGE,
          variables,
        }),
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': 'supersecret',
          },
        },
      )
      .toPromise();
  }

  async addChannelUserSubscription(variables): Promise<any> {
    return this.httpService
      .post(
        'http://localhost:8080/v1/graphql',
        JSON.stringify({
          query: HASURA_CHAT_MESSAGE_OPERATION,
          variables,
        }),
        {
          headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': 'supersecret',
          },
        },
      )
      .toPromise();
  }

  async getChannelType(variables): Promise<any> {
    return this.httpService
      .post(
        'http://localhost:8080/v1/graphql',
        JSON.stringify({
          query: HASURA_GET_CHANNEL_TYPE,
          variables,
        }),
        {
          headers: {
            'content-type': 'application/json',
            'x-hasura-admin-secret': 'supersecret',
          },
        },
      )
      .toPromise();
  }
}
