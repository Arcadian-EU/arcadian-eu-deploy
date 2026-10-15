# Arcadian website

The canonical source is the private corporate repository
[Arcadian-EU/arcadian-eu-deploy](https://arcadian-spzoo.ghe.com/Arcadian-EU/arcadian-eu-deploy),
beside Werfvolt. Develop and review changes there.

The company-owned public
[publication repository](https://github.com/Arcadian-EU/arcadian-eu-deploy)
supplies the existing DigitalOcean App Platform app `arcadian-eu` in `fra`.
The website is [arcadian-eu.com](https://arcadian-eu.com).
Both repositories belong to Arcadian-EU; the deployment has no personal repository dependency.

## Layout

- `static-site/`: EN `/`, NL `/nl/`, DE `/de/`, PL `/pl/`; 11 pages per language.
- `cms/`: content CMS, localized page generators and local preview.
- `.do/app.yaml`: the existing static site's App Platform specification.
- `.github/workflows/deploy.yml`: source checks and publication deployment.

Run `node cms/generate-pages.mjs` after changing shared page copy or contacts.
This regenerates the German templates and content pages, the investor pages,
language menus in EN → NL → DE → PL order, and the sitemap.

## Delivery

1. Commit and push changes to corporate `origin`; the GHE workflow validates
   JavaScript, the static build, HTML, links and the CMS.
2. After source checks pass, promote the **same commit** to
   `publication-mirror/main`. Never develop independent changes in that mirror.
3. The GitHub.com workflow checks the promoted commit, applies `.do/app.yaml`,
   deploys the existing DigitalOcean app and runs live smoke checks.
4. Confirm the DigitalOcean deployment, served release marker and changed asset
   hashes before reporting publication complete.

Local remotes:

```text
origin              https://arcadian-spzoo.ghe.com/Arcadian-EU/arcadian-eu-deploy.git
publication-mirror  https://github.com/Arcadian-EU/arcadian-eu-deploy.git
```

App Platform's generic HTTPS Git source must be public. The private GHE source
is therefore validated separately and published through the company-owned
GitHub.com repository. This retains the existing static hosting component.

The publication repository requires:

- `DIGITALOCEAN_ACCESS_TOKEN` secret with Apps read/update access;
- `TURNSTILE_SITEKEY` variable containing the registered public sitekey;
- `CMS_PUBLIC_URL=https://cms.arcadian-eu.com` variable.

These production credentials are not needed for checks in GHE. A GHE run skips
deployment and smoke jobs; it must not deploy a different commit from the mirror.
If hosted automation is unavailable, promote the tested commit, select **Deploy**
in the existing DigitalOcean app and perform the same live verification.

## Contact form and local checks

Contacts and WhatsApp destinations are defined in `cms/site-contacts.mjs`.
The four localized forms post to `https://werfvolt.be/api/public/leads/form`.
Turnstile uses action `arcadian_contact`; submission stays disabled until a valid
token is present. The backend verifies the token and applies its existing CORS,
rate limits, honeypot and attachment limits.

`static-site/build-turnstile-site.sh` requires the public `TURNSTILE_SITEKEY`
and HTTPS `CMS_PUBLIC_URL`, verifies four widgets, and writes the ignored
`static-site/dist/` directory. Configuration checks can use an invalid synthetic
sitekey; browser acceptance requires a key registered for the test hostname.

```sh
CMS_PUBLIC_URL=https://cms.arcadian-eu.com TURNSTILE_SITEKEY=local_only_invalid_sitekey sh static-site/build-turnstile-site.sh
npm run check:html
npm run check:links
```

Never put the Turnstile secret, CMS credentials or deployment tokens in source
files or browser code.

## Migration record

On 15 October 2026, all 49 original commits and 11 branches were copied to GHE
with matching hashes; `main` was `efe06307b28fa7176e492efd977ecf3abaaa0982`.
The original GitHub.com repository was transferred to Arcadian-EU, preserving
its 10 merged pull requests and existing publication configuration.
