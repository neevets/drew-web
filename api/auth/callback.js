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

const renderGuildSelectorButton = (guild, isActive) => {
  const guildName = escapeHtml(guild.name || "Servidor sin nombre");

  return `<button class="oauth-server-chip${isActive ? " oauth-server-chip--active" : ""}" type="button" data-guild-select data-guild-id="${escapeHtml(guild.id)}" data-guild-name="${guildName}">${guildName}</button>`;
};

const renderAuthPage = (user, guilds) => {
  const avatarUrl = avatarUrlFor(user);
  const safeDisplayName = escapeHtml(user.global_name || user.username || "Usuario");
  const safeUsername = escapeHtml(user.username || "unknown");
  const safeEmail = escapeHtml(user.email || "No disponible");
  const manageableGuilds = guilds.filter((guild) => {
    const permissions = Number(guild.permissions_new ?? guild.permissions ?? 0);
    const isAdmin = (permissions & 0x8) === 0x8;
    return guild.owner || isAdmin;
  });
  const totalGuilds = manageableGuilds.length;
  const selectedGuild = manageableGuilds[0] ?? null;

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

      .oauth-server-selector {
        display: grid;
        gap: 16px;
      }

      .oauth-server-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .oauth-server-chip {
        border: 1px solid var(--stroke);
        background: var(--card);
        color: var(--text);
        border-radius: 12px;
        padding: 10px 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .oauth-server-chip--active {
        border-color: #3f6bff;
        box-shadow: 0 0 0 2px rgba(63, 107, 255, 0.25);
      }

      .guild-dashboard {
        background: radial-gradient(circle at top, #07153d 0%, #040b22 65%, #020617 100%);
        border-color: #1b2d66;
        color: #e8eeff;
        display: grid;
        gap: 18px;
      }

      .guild-dashboard__intro {
        color: #9fb1df;
        margin: 0;
        font-size: 1.1rem;
      }

      .guild-dashboard__tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .guild-dashboard__tab {
        border: 1px solid #2a3f7a;
        background: rgba(16, 30, 72, 0.75);
        color: #d9e4ff;
        border-radius: 12px;
        padding: 10px 14px;
        font-weight: 600;
      }

      .guild-dashboard__tab--active {
        border-color: #3f6bff;
        box-shadow: 0 0 0 2px rgba(63, 107, 255, 0.3);
      }

      .guild-dashboard__title {
        margin: 0;
        font-size: clamp(1.8rem, 3.5vw, 2.6rem);
        letter-spacing: 0.08em;
      }

      .guild-dashboard__description {
        margin: 0;
        color: #b8c7f0;
        line-height: 1.45;
        max-width: 68ch;
      }

      .guild-dashboard__rule {
        display: grid;
        grid-template-columns: 1.5fr 1fr 1fr auto;
        gap: 10px;
        align-items: center;
        border: 1px solid #2a3f7a;
        border-radius: 14px;
        padding: 14px;
        background: rgba(16, 30, 72, 0.75);
      }

      .guild-dashboard__rule input,
      .guild-dashboard__rule select {
        background: #111f4b;
        border: 1px solid #2f4587;
        color: #e7eeff;
        border-radius: 10px;
        padding: 8px 10px;
      }

      .guild-dashboard__apply {
        width: 42px;
        height: 42px;
        border: 0;
        border-radius: 12px;
        background: #3f6bff;
        color: #fff;
        font-size: 1.4rem;
      }

      .oauth-empty {
        color: var(--muted);
      }

      @media (max-width: 860px) {
        .guild-dashboard__rule {
          grid-template-columns: 1fr;
        }
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
        <a class="cta cta--small" href="/api/auth/discord">Dashboard</a>
        <button class="theme-toggle" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to dark mode">
          <span class="theme-toggle__text" data-theme-label>light</span>
        </button>
      </div>
    </header>

    <main class="dashboard-shell oauth-grid">
      <section class="dashboard-auth">
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


      <section class="dashboard-card oauth-server-selector">
        <div class="oauth-guilds__header">
          <h2>Selecciona un servidor</h2>
          <p>${totalGuilds} disponibles</p>
        </div>
        ${
          totalGuilds
            ? `<div class="oauth-server-chips">${manageableGuilds
                .map((guild, index) => renderGuildSelectorButton(guild, index === 0))
                .join("")}</div>`
            : '<p class="oauth-empty">No encontramos servidores donde tengas permisos de owner/admin.</p>'
        }
      </section>

      ${
        selectedGuild
          ? `<section class="dashboard-card guild-dashboard" data-guild-dashboard>
              <p class="guild-dashboard__intro">You are managing <strong data-guild-name>${escapeHtml(selectedGuild.name || "Servidor sin nombre")}</strong></p>
              <div class="guild-dashboard__tabs">
                <button type="button" class="guild-dashboard__tab">General</button>
                <button type="button" class="guild-dashboard__tab guild-dashboard__tab--active">Anti Nuke</button>
                <button type="button" class="guild-dashboard__tab">Beast Mode</button>
                <button type="button" class="guild-dashboard__tab">Anti Raid</button>
                <button type="button" class="guild-dashboard__tab">Verification</button>
                <button type="button" class="guild-dashboard__tab">Moderation</button>
              </div>
              <h3 class="guild-dashboard__title">ANTI NUKE</h3>
              <p class="guild-dashboard__description">Keep your server safe from users that take advantage of their permissions to destroy your lovely community. Configure limits, punishments and logging for the selected server.</p>
              <div class="guild-dashboard__rule">
                <strong>ANTI BAN</strong>
                <label>Limit <input type="number" value="5" min="1" max="30" /></label>
                <label>Punishment
                  <select>
                    <option>Kick</option>
                    <option>Ban</option>
                    <option>Timeout</option>
                  </select>
                </label>
                <button class="guild-dashboard__apply" type="button" aria-label="Guardar configuración">✓</button>
              </div>
            </section>`
          : ""
      }

      <section class="dashboard-card oauth-guilds">
        <div class="oauth-guilds__header">
          <h2>Servidores gestionables</h2>
          <p>${totalGuilds} encontrados</p>
        </div>
        <div class="oauth-guilds-list">
          ${manageableGuilds.map(renderGuildCard).join("")}
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
          <li><a href="/api/auth/discord">Dashboard</a></li>
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

    <script>
      (() => {
        const selectorButtons = Array.from(document.querySelectorAll('[data-guild-select]'));
        const guildNameNode = document.querySelector('[data-guild-name]');

        if (!selectorButtons.length || !guildNameNode) {
          return;
        }

        selectorButtons.forEach((button) => {
          button.addEventListener('click', () => {
            selectorButtons.forEach((other) => {
              other.classList.remove('oauth-server-chip--active');
            });
            button.classList.add('oauth-server-chip--active');
            guildNameNode.textContent = button.dataset.guildName || 'Servidor sin nombre';
          });
        });
      })();
    </script>
  </body>
</html>`;
};

const redirectToDiscordAuth = (response) =>
  response.redirect(302, "/api/auth/discord");

const parseJsonSafely = (value) => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

module.exports = async (request, response) => {
  const code = request.query.code;

  if (!code || typeof code !== "string") {
    return redirectToDiscordAuth(response);
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
      const tokenError = parseJsonSafely(errorBody);

      if (tokenError?.error === "invalid_grant") {
        return redirectToDiscordAuth(response);
      }

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
