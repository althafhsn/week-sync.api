import { Body, Controller, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service.js';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto, @Query('include') include?: string) {
    return this.authService.login(loginDto.email, loginDto.password, include);
  }

  @Post('refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
