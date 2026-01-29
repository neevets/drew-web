module.exports = async (request, response) => {
  const code = request.query.code;

  if (!code) {
    return response.status(400).json({
      error: "Missing Discord OAuth code.",
    });
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return response.status(500).json({
      error: "Missing Discord OAuth environment variables.",
    });
  }

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      return response.status(502).json({
        error: "Failed to exchange Discord OAuth code.",
        details: errorBody,
      });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const [userResponse, guildsResponse] = await Promise.all([
      fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    if (!userResponse.ok) {
      const errorBody = await userResponse.text();
      return response.status(502).json({
        error: "Failed to fetch Discord user profile.",
        details: errorBody,
      });
    }

    const user = await userResponse.json();
    const guilds = guildsResponse.ok ? await guildsResponse.json() : [];

    return response.json({
      status: "authenticated",
      user,
      guilds,
    });
  } catch (error) {
    return response.status(500).json({
      error: "Unexpected error while completing Discord OAuth.",
    });
  }
};
