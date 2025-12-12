import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
