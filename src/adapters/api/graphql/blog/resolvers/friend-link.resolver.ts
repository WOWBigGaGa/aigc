import { Query, Resolver } from '@nestjs/graphql';
import { FriendLinkDTO } from '../types/friend-link.dto';
import { FriendLinkQueryService } from '@src/modules/blog/queries/friend-link.query.service';

@Resolver(() => FriendLinkDTO)
export class FriendLinkResolver {
  constructor(private readonly friendLinkQueryService: FriendLinkQueryService) {}

  @Query(() => [FriendLinkDTO], { description: '获取所有友链' })
  async friendLinks(): Promise<FriendLinkDTO[]> {
    return this.friendLinkQueryService.getAllFriendLinks();
  }

  @Query(() => [FriendLinkDTO], { description: '获取启用的友链' })
  async activeFriendLinks(): Promise<FriendLinkDTO[]> {
    return this.friendLinkQueryService.getActiveFriendLinks();
  }
}