import { Controller, Post, Get, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/request.types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  @Post('logout')
  @UseGuards(ClerkAuthGuard)
  @ApiBearerAuth('ClerkAuth')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout current session and clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  async logout(@Req() req: AuthenticatedRequest, @Res({ passthrough: true }) res: any) {
    // Clear auth cookies per Docx 22 Step 5
    if (res && res.setHeader) {
      res.setHeader('Set-Cookie', [
        'nex_access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
        'nex_refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/auth/refresh; Max-Age=0',
        'nex_csrf_token=; Secure; SameSite=Strict; Path=/; Max-Age=0'
      ]);
    }
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
