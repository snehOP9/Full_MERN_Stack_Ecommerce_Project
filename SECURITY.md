# Security

## Secrets

- Keep `JWT_SECRET`, database URLs, mail credentials, Cloudinary credentials, and payment/provider secrets outside Git.
- Use environment variables for local and deployed configuration.
- Never paste real credentials into README files, example configuration, screenshots, or issue reports.
- Rotate a credential immediately if it is accidentally committed.

## Authentication

Authentication changes should cover invalid, expired, and mismatched tokens. Sensitive authentication material such as password hashes, refresh tokens, and reset tokens must never be returned to clients.

## Reporting

For a suspected security vulnerability, provide a minimal reproduction, affected endpoint or component, impact, and suggested mitigation without including live credentials or private user data.

## Verification

Security-sensitive changes should include regression coverage where practical and should be verified against the relevant API or frontend build before release.
