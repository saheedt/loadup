import { Module } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import {
  SingleChoiceScorer,
  MultiChoiceScorer,
  NumberScorer,
  TextScorer,
} from './strategies';

@Module({
  providers: [
    ScoringService,
    SingleChoiceScorer,
    MultiChoiceScorer,
    NumberScorer,
    TextScorer,
  ],
  exports: [ScoringService],
})
export class ScoringModule {}
