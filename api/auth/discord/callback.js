const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const avatarUrlFor = (user) => {
  if (!user?.id || !user?.avatar) {
    return null;
  }

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
};

const guildIconUrlFor = (guild) => {
  if (!guild?.id || !guild?.icon) {
    return null;
  }

  return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`;
};

const renderGuildCard = (guild) => {
  const guildName = escapeHtml(guild.name || "Servidor sin nombre");
  const guildIcon = guildIconUrlFor(guild);
  const permissions = Number(guild.permissions_new ?? guild.permissions ?? 0);
  const isAdmin = (permissions & 0x8) === 0x8;

  return `
    <article class="dashboard-card oauth-guild-card">
      <div class="oauth-guild-card__head">
        ${
          guildIcon
            ? `<img class="oauth-guild-card__icon" src="${escapeHtml(guildIcon)}" alt="${guildName}" loading="lazy" />`
            : `<div class="oauth-guild-card__icon oauth-guild-card__icon--fallback">${guildName.slice(0, 1).toUpperCase()}</div>`
        }
        <div>
          <h3>${guildName}</h3>
          <p>ID: <code>${escapeHtml(guild.id)}</code></p>
        </div>
      </div>
      <div class="oauth-guild-card__badges">
        ${guild.owner ? '<span class="badge oauth-badge-owner">Owner</span>' : ""}
        ${isAdmin ? '<span class="badge oauth-badge-admin">Admin</span>' : ""}
      </div>
    </article>
  `;
};

const renderAuthPage = (user, guilds) => {
  const avatarUrl = avatarUrlFor(user);
  const safeDisplayName = escapeHtml(user.global_name || user.username || "Usuario");
  const safeUsername = escapeHtml(user.username || "unknown");
  const safeEmail = escapeHtml(user.email || "No disponible");
  const totalGuilds = guilds.length;
  const ownerGuilds = guilds.filter((guild) => guild.owner).length;
  const adminGuilds = guilds.filter((guild) => {
    const permissions = Number(guild.permissions_new ?? guild.permissions ?? 0);
    return (permissions & 0x8) === 0x8;
  }).length;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Drew Dashboard</title>
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="stylesheet" href="/styles.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
    <script defer src="https://va.vercel-scripts.com/v1/script.js"></script>
    <script defer src="/theme.js"></script>
    <style>
      .oauth-grid {
        display: grid;
        gap: 24px;
      }

      .oauth-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 24px;
      }

      .oauth-stat h3 {
        font-size: 0.95rem;
        color: var(--muted);
        margin-bottom: 12px;
      }

      .oauth-stat p {
        font-size: 2rem;
        font-weight: 700;
      }

      .oauth-profile {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .oauth-profile__avatar {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid var(--stroke);
      }

      .oauth-profile__fallback {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #f2b400, #0d0d0d);
        color: #ffffff;
        font-weight: 700;
      }

      .oauth-profile h2 {
        margin-bottom: 6px;
      }

      .oauth-profile p {
        color: var(--muted);
        margin: 0;
      }

      .oauth-guilds__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .oauth-guilds__header p {
        color: var(--muted);
        margin: 0;
      }

      .oauth-guilds-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 18px;
      }

      .oauth-guild-card {
        display: grid;
        gap: 12px;
      }

      .oauth-guild-card__head {
        display: flex;
        gap: 12px;
      }

      .oauth-guild-card__icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        object-fit: cover;
        border: 1px solid var(--stroke);
      }

      .oauth-guild-card__icon--fallback {
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        background: var(--accent);
        color: var(--cta-text);
      }

      .oauth-guild-card h3 {
        margin: 0 0 6px;
        font-size: 1.05rem;
      }

      .oauth-guild-card p {
        color: var(--muted);
        font-size: 0.88rem;
      }

      .oauth-guild-card__badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .oauth-badge-owner {
        background: #f2b400;
        color: #000;
      }

      .oauth-badge-admin {
        background: var(--accent);
        color: var(--cta-text);
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <a class="logo" href="/">Drew</a>
      <nav class="nav">
        <a href="https://status.neevets.website" target="_blank" rel="noreferrer">Status</a>
        <a class="nav__premium" href="/premium.html">Premium</a>
        <a href="https://discord.gg/5e2jm7QDSS" target="_blank" rel="noreferrer">Support</a>
      </nav>
      <div class="topbar__actions">
        <a class="cta cta--small" href="/dashboard.html">Dashboard</a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode">
          <span class="theme-toggle__text" data-theme-label>light</span>
        </button>
      </div>
    </header>

    <main class="dashboard-shell oauth-grid">
      <section class="dashboard-auth">
        <div>
          <p class="dashboard-auth__eyebrow">Discord OAuth</p>
          <h1>Autenticación completada</h1>
          <p>¡Listo! Ya conectaste tu cuenta de Discord con Drew. Aquí tienes el resumen de tus servidores y permisos.</p>
          <div class="dashboard-auth__actions">
            <a class="cta" href="/dashboard.html">Ir al dashboard</a>
            <a class="ghost" href="/api/auth/discord">Reautenticar</a>
          </div>
          <div class="dashboard-auth__meta">
            <span>Estado: autenticado</span>
            <span>Usuario: @${safeUsername}</span>
          </div>
        </div>

        <article class="dashboard-auth__card">
          <div class="oauth-profile">
            ${
              avatarUrl
                ? `<img class="oauth-profile__avatar" src="${escapeHtml(avatarUrl)}" alt="Avatar de ${safeDisplayName}" />`
                : `<div class="oauth-profile__fallback">${safeDisplayName.slice(0, 1).toUpperCase()}</div>`
            }
            <div>
              <h2>${safeDisplayName}</h2>
              <p>@${safeUsername}</p>
              <p>${safeEmail}</p>
            </div>
          </div>
        </article>
      </section>

      <section class="oauth-stats">
        <article class="dashboard-card oauth-stat">
          <h3>Servidores totales</h3>
          <p>${totalGuilds}</p>
        </article>
        <article class="dashboard-card oauth-stat">
          <h3>Servidores owner</h3>
          <p>${ownerGuilds}</p>
        </article>
        <article class="dashboard-card oauth-stat">
          <h3>Servidores admin</h3>
          <p>${adminGuilds}</p>
        </article>
      </section>

      <section class="dashboard-card oauth-guilds">
        <div class="oauth-guilds__header">
          <h2>Tus servidores</h2>
          <p>${totalGuilds} encontrados</p>
        </div>
        <div class="oauth-guilds-list">
          ${guilds.map(renderGuildCard).join("")}
        </div>
      </section>
    </main>

    <footer class="footer">
      <div>
        <h4>Drew</h4>
        <p>Advanced security and automation for Discord communities.</p>
        <p class="footer__meta">Made by Stane.</p>
      </div>
      <div>
        <h4>Product</h4>
        <ul>
          <li><a href="/premium.html">Premium</a></li>
          <li><a href="/dashboard.html">Dashboard</a></li>
          <li>
            <a href="https://discord.com/oauth2/authorize?client_id=1441457111409103010&permissions=8&integration_type=0&scope=bot+applications.commands">Invite</a>
          </li>
        </ul>
      </div>
      <div>
        <h4>Resources</h4>
        <ul>
          <li><a href="https://status.neevets.website" target="_blank" rel="noreferrer">Status</a></li>
          <li><a href="https://docs.neevets.website">Docs</a></li>
          <li><a href="https://discord.gg/5e2jm7QDSS" target="_blank" rel="noreferrer">Support</a></li>
        </ul>
      </div>
      <div>
        <h4>Legal</h4>
        <p>© 2025 Drew. All rights reserved.</p>
        <ul>
          <li><a href="https://docs.neevets.website/legal/privacy/">Privacy Policy</a></li>
          <li><a href="https://docs.neevets.website/legal/terms/">Terms of Service</a></li>
        </ul>
      </div>
    </footer>
  </body>
</html>`;
};

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

    return response
      .status(200)
      .setHeader("Content-Type", "text/html; charset=utf-8")
      .send(renderAuthPage(user, guilds));
  } catch (error) {
    return response.status(500).json({
      error: "Unexpected error while completing Discord OAuth.",
    });
  }
};
