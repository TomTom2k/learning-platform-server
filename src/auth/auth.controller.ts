import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './auth.guard';
import { UserService } from '../user/user.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'yourpassword' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created',
    schema: { example: { message: 'User created' } },
  })
  @ApiResponse({
    status: 400,
    description: 'User already exists',
    schema: { example: { error_code: 400, message: 'User already exists' } },
  })
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    await this.authService.register(email, password);
    return { message: 'User created' };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    schema: {
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'yourpassword' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về token',
    schema: { example: { access_token: 'jwt-token-string' } },
  })
  @ApiResponse({
    status: 400,
    description: 'Sai thông tin đăng nhập',
    schema: { example: { error_code: 400, message: 'Invalid credentials' } },
  })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new BadRequestException('Invalid credentials');
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiResponse({
    status: 200,
    description: 'Thông tin user từ token',
    schema: {
      example: {
        error_code: 0,
        message: 'Success',
        data: { email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'User not found',
    schema: { example: { error_code: 400, message: 'User not found' } },
  })
  async getMe(@Req() req) {
    const user = await this.userService.findByEmail(req.user.email);
    if (!user) {
      return { error_code: 400, message: 'User not found' };
    }
    return { error_code: 0, message: 'Success', data: { email: user.email } };
  }
}
