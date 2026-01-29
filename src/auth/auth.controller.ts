import { Controller, Get, Query, Res } from "@nestjs/common";
import type { Response } from "express";

const scope = "identify email guilds";

@Controller("api/auth")
export class AuthController {
  @Get("/discord")
  redirectToDiscord(@Res() response: Response) {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return response.status(500).json({
        error: "Missing Discord OAuth environment variables.",
      });
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope,
      prompt: "consent",
    });

    return response.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
  }

  @Get("/discord/callback")
  handleDiscordCallback(@Query("code") code: string, @Res() response: Response) {
    if (!code) {
      return response.status(400).json({
        error: "Missing Discord OAuth code.",
      });
    }

    return response.json({
      status: "received",
      nextSteps: "Exchange the code for a token on the server.",
    });
  }
}
