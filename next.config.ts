import type { NextConfig } from "next";

// Bei einem Build innerhalb von GitHub Actions wird die App unter
// https://<owner>.github.io/trademark/ ausgeliefert, braucht also den Repo-Namen
// als Pfadpräfix. Lokal (npm run dev / npm run build) bleibt der Pfad leer.
const isGithubActionsBuild = process.env.GITHUB_ACTIONS === "true";
const repoName = "trademark";

const nextConfig: NextConfig = {
  // Statischer Export, damit die App direkt über GitHub Pages gehostet werden kann.
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: isGithubActionsBuild ? `/${repoName}` : "",
  assetPrefix: isGithubActionsBuild ? `/${repoName}/` : "",
};

export default nextConfig;
