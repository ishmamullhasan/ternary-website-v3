# Security Policy

## Reporting a vulnerability

If you believe you have found a security vulnerability in the Ternary Solutions website,
please report it privately. **Do not open a public GitHub issue for security reports.**

- Email **security@ternary.solutions** with a description of the issue, steps to reproduce,
  and any relevant logs or proof-of-concept.
- We aim to acknowledge reports within **3 business days** and to provide a remediation
  timeline after triage.

Please give us a reasonable window to investigate and fix the issue before any public
disclosure.

## Scope

In scope: this repository (the marketing website and its Payload CMS) and its deployed
instances. Out of scope: third-party services (Vercel, Payload Cloud, the recruiting
service) — report those to the respective vendor.

## Handling secrets

Never commit secrets. Configuration is provided via environment variables (see
`.env.example`); `.env` files are git-ignored. If a secret is exposed in a commit or a
shared channel, rotate it immediately.
