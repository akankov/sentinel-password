# Security Policy

The security of Sentinel Password and its users is a top priority. We appreciate responsible disclosures from the community and aim to respond promptly and transparently.

## Supported Versions

We provide security updates for the latest published version of every `@sentinel-password/*` package — `core`, `react`, `react-components`, `entropy`, and `breach`. This explicitly includes `@sentinel-password/breach`, the only package that makes outbound network requests (Have I Been Pwned, via SHA-1 k-anonymity).

If you are using an older version, we strongly recommend upgrading to the latest release to benefit from the most recent security fixes and hardening.

## Reporting a Vulnerability

If you believe you have found a security vulnerability in this project:

1. **Do not open a public issue.**
2. **Preferred:** use GitHub's private vulnerability reporting —
   [Report a vulnerability](https://github.com/akankov/sentinel-password/security/advisories/new)
   (the **Security** tab → **Report a vulnerability**). It keeps the report
   private, gives both sides a tracked advisory thread, and provides a CVE
   assignment path on disclosure.
3. Alternatively, contact the maintainers privately at:
   - **Email:** `akankov@gmail.com`
4. Provide as much detail as possible, including:
   - A description of the issue
   - Steps to reproduce
   - Potential impact
   - Any relevant code snippets, logs, or proof-of-concept

Please avoid including any real passwords, API keys, or other sensitive data in your report.

## Our Commitment

- We will acknowledge your report **within 5 business days**.
- We will investigate the issue and work to reproduce it.
- Once confirmed, we will:
  - Assess the severity and impact
  - Prepare a fix or mitigation
  - Plan a coordinated disclosure, if applicable

We may contact you for additional information and to coordinate public disclosure once a fix is available.

## Responsible Disclosure

We ask that you:

- Give us a reasonable amount of time to investigate and remediate the issue before publicly disclosing it.
- Avoid violating privacy, destroying data, or disrupting production systems while investigating.
- Comply with applicable laws and avoid accessing data that does not belong to you.

## Threat Model

What these packages do — and deliberately do not do — with passwords:

- **`core` and `entropy` are pure in-process computation.** No network calls,
  no storage, no logging — the password never leaves the caller's runtime.
  Validators are *not* constant-time: every pattern they check (lengths,
  character classes, the common-password list, keyboard layouts) is public,
  so timing reveals nothing secret. Constant-time comparison belongs to
  password *verification* against a stored hash (Argon2/bcrypt), which is
  explicitly out of this library's scope.
- **The common-password check is a Bloom filter**: it can flag a password as
  "common" that isn't (small false-positive rate) but never misses one that
  is in the embedded list (no false negatives). Treat a "common" verdict as
  advice to pick another password, not as proof of presence in a breach.
- **`breach` makes the project's only outbound network request** — to Have I
  Been Pwned's range API using SHA-1 k-anonymity: only the first 5 hex chars
  of the local SHA-1 digest are transmitted; the password, full hash, and
  matched suffix never leave the process and are never logged. `checkBreach`
  never throws and never silently reports "safe" on failure — errors surface
  as `{ status: 'error' }` so the caller decides fail-open vs fail-closed.
  Server-side use is recommended: a browser call exposes the requester's IP
  and query timing to the HIBP CDN.
- **The React packages hold the plaintext password in component state** while
  the user edits — inherent to a controlled input. They never log, persist,
  or transmit it. Clear the state (`reset()`) after successful submission.
- **Supply chain:** `core`, `entropy`, and `breach` have zero runtime
  dependencies. CI actions are SHA-pinned with minimal per-job permissions;
  npm publishing uses OIDC trusted publishing with provenance; dependency
  lifecycle scripts are blocked by pnpm except an explicit allowlist; new
  registry versions face a cooling-off window (`minimumReleaseAge`).

## Out of Scope

The following are generally out of scope for this security policy:

- Vulnerabilities in third-party dependencies not maintained by this project
- Issues requiring physical access to a device
- Social engineering attacks

If you are unsure whether something is in scope, you can still reach out privately and we will let you know.
