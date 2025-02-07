/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://gametap.app",
  generateRobotsTxt: true,
  exclude: ["/server-sitemap.xml"], // Exclude server-side sitemap from indexing
  robotsTxtOptions: {
    additionalSitemaps: [
      "https://gametap.app/server-sitemap.xml", // Add server-side sitemap
    ],
  },
  outDir: "./public", // By default it's ".next" directory
};
