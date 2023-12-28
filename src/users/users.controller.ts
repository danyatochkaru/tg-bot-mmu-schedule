import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { UsersCountByGroupsQuery } from './users.interface';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('count')
  async getCountByGroups(@Query() query: UsersCountByGroupsQuery) {
    return this.usersService.getCountByGroups(
      Array.isArray(query.groupsList) ? query.groupsList : [query.groupsList],
    );
  }
}
