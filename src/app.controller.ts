import { Controller, Req, Res, Post } from '@nestjs/common';
import { HasuraService } from './hasura/hasura.service';
const util = require('util');
import { Request, Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly hasuraService: HasuraService) {}

  @Post('validateAndAddDirectMessageChannel')
  async validateAndAddDirectMessageChannel(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    console.log('DEBUG validateAndAddDirectMessageChannel', req.body.input);
    // get request input
    const { name, user_id1, user_id2 } = req.body.input;

    const {
      data: checkData,
      errors: checkErrors,
    }: any = await this.hasuraService.getCheckIfUserHasSubscribedToChannel({
      user_id: user_id1,
      dm_to_user: user_id2,
    });

    if (checkErrors) {
      return res['status'](400).json(checkErrors[0]);
    }

    console.log('checkData: ', util.inspect(checkData, false, null, true));

    if (user_id1 === user_id2) {
      console.error('You cannot subscribe to yourself');
      return res.json({ affected_rows: 0 });
    }

    if (checkData?.data?.channel.length >= 1) {
      console.error(
        'Users have already subscribed to a direct message channel.',
      );
      return res.json({ affected_rows: 0 });
    }

    console.log(
      'mutation gets executed: ',
      util.inspect(checkData.data, false, null, true),
    );

    //execute the Hasura operation
    const {
      data,
      errors,
    }: any = await this.hasuraService.addDirectMessageChannel({
      channel_type: 'DIRECT_MESSAGE',
      name,
      is_private: true,
      user_id1,
      user_id2,
    });

    // if Hasura operation errors, then throw error
    if (errors) {
      return res.status(400).json(errors[0]);
    }

    console.log('data end', data);

    // success
    return res.json({
      ...data.data.insert_channel,
    });
  }

  @Post('addChannelUser')
  async addChannelUser(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    // get request input

    console.log('DEBUG addChannelUser', req.body.input);

    // get request input
    const { user_id, channel_id } = req.body.input;

    // run some business logic

    const {
      data: checkData,
      errors: checkErrors,
    }: any = await this.hasuraService.getChannelType({
      id: channel_id,
    });

    console.log(
      'checkData: ',
      util.inspect(
        checkData?.data?.channel[0]?.channel_type,
        false,
        null,
        true,
      ),
    );

    if (checkErrors) {
      return res['status'](400).json(checkErrors[0]);
    }

    if (checkData?.data?.channel[0]?.channel_type !== 'CHAT_MESSAGE') {
      console.log(
        'wrong channel type: ',
        checkData?.data?.channel[0]?.channel_type,
      );
      return res.json({ affected_rows: 0 });
    }

    if (checkData?.data?.channel[0]?.is_private !== true) {
      console.log('you cant add users to a public channel!');

      return res.json({ affected_rows: 0 });
    }

    if (checkData?.data?.channel[0]?.owner_id === user_id) {
      console.log(
        'you cant add yourself to a private channel, because you are the owner of the private channel',
      );

      return res.json({ affected_rows: 0 });
    }

    console.log('user_id', user_id);
    console.log(
      'add user to channel: ',
      util.inspect(checkData.data, false, null, true),
    );

    // execute the Hasura operation
    const {
      data,
      errors,
    } = await this.hasuraService.addChannelUserSubscription({
      user_id,
      channel_id,
    });

    // if Hasura operation errors, then throw error
    if (errors) {
      console.error(errors[0]);
      return res.json({ affected_rows: 0 });
    }

    if (data.errors) {
      console.error(data.errors[0]);
      return res.status(400).json(data.errors[0]);
    }

    console.log('success', data);

    return res.json({
      ...data?.data?.insert_user_channels,
    });
  }
}
