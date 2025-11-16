import { UsePipes } from '@nestjs/common';
import { SanitizationPipe } from '../pipes/sanitization.pipe';

export const Sanitize = () => UsePipes(new SanitizationPipe());
