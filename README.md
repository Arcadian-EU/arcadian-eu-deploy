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
2. After checks on corporate `main` pass, the `mirror` job automatically promotes
   the **same commit** to `publication-mirror/main` using a repository deploy key.
   Pull requests and feature branches cannot publish. Never develop independent
   changes in the mirror.
3. The GitHub.com workflow checks the promoted commit, applies `.do/app.yaml`,
   deploys the existing DigitalOcean app and runs live smoke checks.
4. The corporate job waits for `/deployment.json` to serve that exact commit.
   The publication workflow verifies the same marker and runs live smoke checks.

Main runs are serialized on both hosts. Superseded corporate commits are skipped
before promotion; a running publication is allowed to finish. Promotion uses a
normal fast-forward push and refuses divergent mirror history. Other branches
and tags are not synchronized by the publisher.

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

Corporate GHE requires the `PUBLICATION_DEPLOY_KEY` Actions secret. Its public key
is registered as a write-enabled deploy key on the publication repository only;
it is not a personal-account token. The private key is never committed or sent to
DigitalOcean. The runner creates a private temporary key file and removes it when
the job ends. GitHub's SSH host key is pinned in `.github/github_known_hosts`.

Checks do not require production credentials. GHE runs the `mirror` job after its
checks and skips the DigitalOcean jobs; GitHub.com skips `mirror` and runs deploy
and smoke. `SOURCE_COMMIT` in the App Platform build configuration is set by the
publication workflow from its exact commit hash. The static build writes this to
`/deployment.json`; a reachable page alone is not proof of the expected release.

If the publication workflow fails after the mirror was updated, rerun that failed
GitHub.com workflow. No manual code transfer is needed. If the mirror diverges,
inspect the independent commits and reconcile them explicitly; do not force-push.
Missing credentials, build failures or a 15-minute served-marker timeout fail the
corporate publication job.

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
