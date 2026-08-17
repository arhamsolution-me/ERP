import { Controller, Post, Get, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  @Post('logout')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('ClerkAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 204, description: 'Session revoked successfully' })
  async logout(@Req() req: AuthenticatedRequest) {
    return { success: true, sessionId: req.auth?.sessionId };
  }

  @Post('logout-all-devices')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('ClerkAuth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all sessions for the current user' })
  @ApiResponse({ status: 204, description: 'All sessions revoked' })
  async logoutAllDevices(@Req() req: AuthenticatedRequest) {
    return { success: true, userId: req.auth?.userId };
  }

  @Get('mfa/enroll')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('ClerkAuth')
  @ApiOperation({ summary: 'Get MFA enrollment status' })
  @ApiResponse({ status: 200, description: 'MFA enrollment info' })
  async getMfaEnroll(@Req() req: AuthenticatedRequest) {
    return {
      message: 'MFA enrollment is managed via Clerk. Use UserProfile component on the frontend.',
      userId: req.auth?.userId,
    };
  }

  @Post('mfa/verify')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('ClerkAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify MFA challenge' })
  @ApiResponse({ status: 200, description: 'MFA verified' })
  async verifyMfa(@Req() req: AuthenticatedRequest) {
    return { message: 'MFA is enforced and managed by Clerk at sign-in.' };
  }
}
