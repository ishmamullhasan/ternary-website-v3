<?xml version="1.0" encoding="UTF-8"?>
<!--
  Human-readable view of /sitemap.xml. Browsers apply this transform and render the table below;
  crawlers ignore the xml-stylesheet instruction entirely and parse the raw XML, so this file has no
  SEO effect. It exists because Chrome refuses to pretty-print any XML document containing
  XHTML-namespace elements — and the hreflang alternates are exactly that — leaving the sitemap
  looking like a wall of unformatted text.
-->
<xsl:stylesheet
  version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
  <xsl:output method="html" indent="yes" encoding="UTF-8" />

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <title>XML Sitemap</title>
        <style>
          :root { color-scheme: dark; }
          body {
            margin: 0;
            padding: 2.5rem 1.25rem;
            background: #050505;
            color: #f4f3ec;
            font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
            font-size: 14px;
            line-height: 1.5;
          }
          .wrap { max-width: 1480px; margin: 0 auto; }
          h1 { font-size: 1.75rem; margin: 0 0 .5rem; letter-spacing: -.03em; }
          .lede { color: #d5d5d5; margin: 0 0 2rem; max-width: 70ch; }
          .count { color: #8a8a86; }
          .scroll { overflow-x: auto; border-radius: 8px; background: #1b1a17; }
          table { width: 100%; border-collapse: collapse; }
          th, td {
            text-align: left;
            padding: .75rem 1rem;
            border-bottom: 1px solid rgba(244, 243, 236, .1);
            vertical-align: top;
            white-space: nowrap;
          }
          th { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: #d5d5d5; }
          tr:last-child td { border-bottom: 0; }
          a { color: #f4f3ec; }
          a:hover { color: #d5d5d5; }
          a:focus-visible { outline: 2px solid #f4f3ec; outline-offset: 2px; border-radius: 3px; }
          .alt { color: #d5d5d5; font-size: 12px; }
          .alt code {
            display: inline-block;
            margin-right: .5rem;
            padding: .1rem .4rem;
            border-radius: 4px;
            background: #202020;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1>XML Sitemap</h1>
          <p class="lede">
            This is the machine-readable sitemap search engines crawl, shown here in a readable
            table. <span class="count"><xsl:value-of select="count(s:urlset/s:url)" /> URLs.</span>
          </p>
          <div class="scroll">
            <table>
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Alternates</th>
                  <th>Last modified</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="s:urlset/s:url">
                  <tr>
                    <td>
                      <a href="{s:loc}">
                        <xsl:value-of select="s:loc" />
                      </a>
                    </td>
                    <td class="alt">
                      <xsl:for-each select="xhtml:link">
                        <code><xsl:value-of select="@hreflang" /></code>
                      </xsl:for-each>
                    </td>
                    <td><xsl:value-of select="s:lastmod" /></td>
                    <td><xsl:value-of select="s:priority" /></td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
