import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";

@Controller()
export class AppController {
  @Get("dashboard")
  redirectDashboard(@Res() response: Response) {
    return response.redirect("/api/auth/discord");
  }
}
