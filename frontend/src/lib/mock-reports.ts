import type { ReportResult } from "./types"

// Four mock reports covering the grade spectrum (A/B/C/F) so the
// grade-reactive accent system and DimensionDetail collapsibles can be
// visually exercised without a backend. Category strings on findings
// match the backend contract documented in the plan — do not invent
// new categories here.

export const mockReports: Record<string, ReportResult> = {
  "mock-a": {
    report_id: "mock-a",
    repo_url: "https://github.com/facebook/react",
    repo_name: "facebook/react",
    overall_score: 9.2,
    overall_grade: "A",
    dimensions: [
      {
        key: "code_quality",
        name: "Code Quality",
        score: 9.4,
        grade: "A",
        summary: "Exemplary cyclomatic complexity and module size discipline.",
        findings: [],
        recommendations: [
          "Keep enforcing the module-size budget in lint as the codebase grows.",
        ],
      },
      {
        key: "docs",
        name: "Docs",
        score: 9.1,
        grade: "A",
        summary: "Comprehensive README, architecture docs, and contributor guide.",
        findings: [],
        recommendations: [],
      },
      {
        key: "deps",
        name: "Dependencies",
        score: 8.6,
        grade: "A",
        summary: "All dependencies pinned and recent.",
        findings: [
          {
            category: "stale_dep",
            severity: "low",
            detail: "One dev-only dependency is one minor version behind upstream.",
          },
        ],
        recommendations: [
          "Run Dependabot weekly so the long tail of dev deps doesn't drift.",
        ],
      },
      {
        key: "tests",
        name: "Tests",
        score: 9.3,
        grade: "A",
        summary: "Deep test surface with snapshot + integration coverage.",
        findings: [],
        recommendations: [],
      },
      {
        key: "ci",
        name: "CI/CD",
        score: 10,
        grade: "A",
        summary: "Full matrix workflows + Dockerfile + pre-commit.",
        findings: [],
        recommendations: [],
      },
      {
        key: "security",
        name: "Security",
        score: 8.8,
        grade: "A",
        summary: "Clean bandit scan, no hardcoded secrets.",
        findings: [],
        recommendations: [
          "Add a SECURITY.md disclosure policy to formalize the existing process.",
        ],
      },
    ],
    synthesis:
      "facebook/react is the kind of repository you point junior engineers at when you want them to see what 'maintained' actually means. Every dimension lands in the A band, and the few low-severity findings are housekeeping rather than risk. There is no single weak link here — process, tooling, and code quality move together.\n\nThe two strongest signals are the CI/CD pipeline (10/10: full matrix workflows, Dockerfile, pre-commit) and the test surface (9.3/10) which combines snapshot, unit, and integration tiers. Together they mean almost any regression is caught before review. Documentation at 9.1 reinforces this — the README, architecture docs, and contributor guide are coherent, current, and load-bearing for the community around the project.\n\nThe only meaningful priorities are forward-looking. First, add a SECURITY.md so the disclosure policy is discoverable instead of tribal — the existing workflow is already mature, this is just publishing it. Second, keep Dependabot tight on the dev-tooling tail; one minor-version drift today becomes a stale-dep cluster in six months. Neither is urgent. The bar to maintain is higher than the bar to reach.",
    top_fixes: [
      "Publish a SECURITY.md describing the existing disclosure workflow so external researchers can find it.",
      "Enable weekly Dependabot PRs for dev-only dependencies to prevent quiet drift on the long tail.",
    ],
    generated_at: "2026-05-27T12:00:00Z",
    shareable_url: "/report/mock-a",
  },

  "mock-b": {
    report_id: "mock-b",
    repo_url: "https://github.com/vercel/next.js",
    repo_name: "vercel/next.js",
    overall_score: 7.2,
    overall_grade: "B",
    dimensions: [
      {
        key: "code_quality",
        name: "Code Quality",
        score: 8.4,
        grade: "A",
        summary: "Strong module boundaries; a few hotspots in the compiler layer.",
        findings: [
          {
            category: "high_complexity_file",
            severity: "medium",
            detail:
              "packages/next/src/build/webpack-config.ts has a cyclomatic complexity above 40, well past the 15 budget.",
          },
        ],
        recommendations: [
          "Extract the webpack-config builder into smaller stage modules so each stage can be unit-tested in isolation.",
        ],
      },
      {
        key: "docs",
        name: "Docs",
        score: 7.1,
        grade: "B",
        summary:
          "Public docs site is excellent; the in-repo README and contributor surface lag behind.",
        findings: [
          {
            category: "missing_architecture_section",
            severity: "medium",
            detail:
              "Top-level README has no architecture overview — newcomers have to reverse-engineer the package layout from the monorepo tree.",
          },
          {
            category: "missing_contributing_section",
            severity: "low",
            detail:
              "CONTRIBUTING.md exists but does not describe the local dev loop for the compiler vs. the runtime packages.",
          },
        ],
        recommendations: [
          "Add a 60-second 'how this monorepo is organized' section to the root README pointing at each package's role.",
          "Expand CONTRIBUTING.md with the compiler and runtime dev loops so first PRs do not bounce on environment setup.",
        ],
      },
      {
        key: "deps",
        name: "Dependencies",
        score: 4.2,
        grade: "C",
        summary:
          "Large surface area is mostly current, but a meaningful slice is stale or unpinned.",
        findings: [
          {
            category: "stale_dep",
            severity: "high",
            detail:
              "12 dependencies are more than 2 major versions behind, including a transitive that has a published advisory.",
          },
          {
            category: "unpinned_versions",
            severity: "medium",
            detail:
              "Several internal packages use caret ranges where exact versions would be safer given the release cadence.",
          },
          {
            category: "cve_dep",
            severity: "high",
            detail:
              "One transitive dependency has a known moderate-severity CVE; an upgrade path exists.",
          },
        ],
        recommendations: [
          "Knock out the 3 dependency upgrades that resolve the published CVE; the rest can batch behind that.",
          "Switch internal cross-package versions from caret to exact pins so a single bad publish cannot cascade.",
          "Schedule a dependency-debt sprint for the long tail rather than letting it accumulate quarter over quarter.",
        ],
      },
      {
        key: "tests",
        name: "Tests",
        score: 3.1,
        grade: "D",
        summary:
          "Headline e2e suite is solid, but unit coverage on internal packages is thin and uneven.",
        findings: [
          {
            category: "low_test_ratio",
            severity: "high",
            detail:
              "Test-to-source ratio across internal packages is roughly 0.15; the public surface looks healthy because the e2e suite carries the load.",
          },
          {
            category: "no_test_config",
            severity: "medium",
            detail:
              "Three internal packages have no jest/vitest config of their own and inherit from the root in ways that silently skip files.",
          },
        ],
        recommendations: [
          "Add per-package test configs to the three internal packages so coverage stops silently collapsing into the root config.",
          "Target 60% line coverage on the compiler package as a first milestone — that is where regressions hurt most.",
          "Wire coverage thresholds into CI so any new file under the bar fails the PR.",
        ],
      },
      {
        key: "ci",
        name: "CI/CD",
        score: 9.0,
        grade: "A",
        summary:
          "Matrix workflows, Docker, and pre-commit are all in place and well-tuned.",
        findings: [],
        recommendations: [
          "Cache the compiler build artifact across workflow jobs to shave end-to-end CI time.",
        ],
      },
      {
        key: "security",
        name: "Security",
        score: 6.6,
        grade: "B",
        summary:
          "Posture is reasonable but the static-analysis surface has a few medium signals worth chasing.",
        findings: [
          {
            category: "bandit_medium",
            severity: "medium",
            detail:
              "Static analysis surfaces 4 medium-severity findings in build tooling scripts.",
          },
          {
            category: "eval_usage",
            severity: "medium",
            detail:
              "Two dynamic-evaluation call sites in the codegen path could be replaced with a safer dispatcher.",
          },
        ],
        recommendations: [
          "Replace the two eval call sites in the codegen path with a table-driven dispatcher.",
          "Triage the 4 medium bandit findings — most are likely false positives in build scripts but should be explicitly suppressed with rationale.",
        ],
      },
    ],
    synthesis:
      "vercel/next.js is a strong repository carrying a few specific weights. The headline score of 7.2 hides a real split: code quality, CI/CD, and the public documentation experience are all genuinely good, while dependency hygiene and unit-level testing are dragging the rest of the report down. This is the classic shape of a fast-moving project where the runtime is loved and the build infrastructure quietly accumulates debt.\n\nThe clearest strengths are CI/CD (9.0/10) and code quality (8.4/10). The matrix workflows, Dockerfile, and pre-commit hooks form a credible release pipeline, and module boundaries are mostly respected outside one well-known complexity hotspot in webpack-config.ts. Documentation at 7.1 is held up by the excellent public docs site; the in-repo contributor surface is what drags it from an A to a B.\n\nTwo priorities matter more than the rest. First, the dependency cluster scoring 4.2 includes a transitive with a published CVE and 12 packages more than two majors behind — start with the three upgrades that resolve the advisory, then batch the long tail. Second, internal-package test coverage at 3.1 is structurally broken: three packages have no test config of their own and silently skip files. Wire per-package configs and a 60% threshold on the compiler package into CI before adding any more features.",
    top_fixes: [
      "Resolve the moderate-severity transitive CVE by completing the 3-package upgrade path, then schedule a dedicated dependency-debt sprint for the remaining 12 stale majors.",
      "Add per-package test configs to the three internal packages currently inheriting silently, and enforce a 60% line-coverage threshold on the compiler package in CI.",
    ],
    generated_at: "2026-05-27T12:00:00Z",
    shareable_url: "/report/mock-b",
  },

  "mock-c": {
    report_id: "mock-c",
    repo_url: "https://github.com/octocat/hello-world",
    repo_name: "octocat/hello-world",
    overall_score: 5.2,
    overall_grade: "C",
    dimensions: [
      {
        key: "code_quality",
        name: "Code Quality",
        score: 6.0,
        grade: "C",
        summary:
          "Code is workable but a handful of files are doing too much and complexity is rising.",
        findings: [
          {
            category: "high_complexity_file",
            severity: "medium",
            detail:
              "src/handlers/main.ts has cyclomatic complexity 28 and contains three distinct responsibilities.",
          },
          {
            category: "oversized_file",
            severity: "medium",
            detail:
              "src/utils/helpers.ts is 712 lines and functions as a junk drawer for unrelated helpers.",
          },
        ],
        recommendations: [
          "Split src/handlers/main.ts along its three responsibilities so each can be reasoned about and tested alone.",
          "Break src/utils/helpers.ts into domain-scoped modules (string, time, validation) and delete anything unused after the move.",
        ],
      },
      {
        key: "docs",
        name: "Docs",
        score: 3.4,
        grade: "D",
        summary:
          "README exists but is too thin to onboard anyone who did not write the code.",
        findings: [
          {
            category: "short_readme",
            severity: "high",
            detail:
              "README is 14 lines and consists mostly of a one-paragraph description plus a screenshot.",
          },
          {
            category: "missing_install_section",
            severity: "high",
            detail:
              "There is no documented install path — a new contributor has to read package.json to guess at the setup steps.",
          },
          {
            category: "missing_usage_section",
            severity: "medium",
            detail:
              "No usage examples or CLI invocations are documented; behavior has to be inferred from tests.",
          },
          {
            category: "no_license",
            severity: "high",
            detail:
              "No LICENSE file is present, which makes the project legally ambiguous to depend on or fork.",
          },
        ],
        recommendations: [
          "Add a LICENSE file (MIT or Apache-2.0 are the safe defaults) before doing anything else.",
          "Expand the README with explicit Install, Usage, and Configuration sections — each just needs 3-5 runnable lines.",
          "Add a 'How it works' section at the bottom so people can decide if this is the right tool before reading code.",
        ],
      },
      {
        key: "deps",
        name: "Dependencies",
        score: 4.1,
        grade: "D",
        summary:
          "Small footprint but most of it is stale and several entries are loosely pinned.",
        findings: [
          {
            category: "stale_dep",
            severity: "high",
            detail:
              "8 of 14 dependencies are more than one major version behind their current upstream release.",
          },
          {
            category: "unpinned_versions",
            severity: "medium",
            detail:
              "package.json mixes caret, tilde, and plain version specifiers inconsistently across runtime deps.",
          },
        ],
        recommendations: [
          "Run a single bulk upgrade pass to align the 8 stale deps; the small surface means it should be a one-afternoon job.",
          "Pick one version specifier convention (recommend exact pins for runtime, caret for dev) and apply it everywhere.",
        ],
      },
      {
        key: "tests",
        name: "Tests",
        score: 2.0,
        grade: "F",
        summary:
          "Almost no automated tests; what exists is more demo than verification.",
        findings: [
          {
            category: "low_test_ratio",
            severity: "high",
            detail:
              "Test-to-source ratio is 0.04 — two test files for roughly 50 source files.",
          },
          {
            category: "no_test_config",
            severity: "high",
            detail:
              "No jest, vitest, or mocha configuration is present; the two existing tests appear to run only when invoked directly.",
          },
        ],
        recommendations: [
          "Pick a test runner (vitest is the lowest-friction choice given the stack) and commit a config.",
          "Write tests for the two highest-traffic functions in src/handlers first — coverage of the rest can follow.",
          "Add a CI step that runs the suite on every PR so the test surface cannot quietly regress.",
        ],
      },
      {
        key: "ci",
        name: "CI/CD",
        score: 7.2,
        grade: "B",
        summary:
          "A working GitHub Actions workflow exists; some standard guardrails are missing.",
        findings: [
          {
            category: "no_dockerfile",
            severity: "low",
            detail:
              "No Dockerfile is checked in, which makes reproducible local environments harder than they need to be.",
          },
          {
            category: "no_precommit",
            severity: "medium",
            detail:
              "No pre-commit configuration — formatting and lint regressions only surface in CI.",
          },
        ],
        recommendations: [
          "Add a pre-commit config that runs the existing linter and formatter so trivial issues never reach CI.",
          "Add a minimal Dockerfile so contributors can replicate the CI environment locally.",
        ],
      },
      {
        key: "security",
        name: "Security",
        score: 6.4,
        grade: "C",
        summary:
          "No critical issues, but one medium static-analysis signal and a dynamic-evaluation call site.",
        findings: [
          {
            category: "bandit_medium",
            severity: "medium",
            detail:
              "Static analysis flags one medium-severity issue in the request-parsing helper.",
          },
          {
            category: "eval_usage",
            severity: "medium",
            detail:
              "src/utils/helpers.ts uses eval() to parse a config string; this should be a JSON.parse with a schema check instead.",
          },
        ],
        recommendations: [
          "Replace the eval() call in helpers.ts with JSON.parse plus a small schema validation.",
          "Resolve or explicitly suppress the bandit-medium finding so it does not get tuned out as noise.",
        ],
      },
    ],
    synthesis:
      "octocat/hello-world is a working project that has not yet been treated like a real one. The 5.2 overall is what you get when the code itself is fine but everything around it — docs, tests, dependencies — has been left to drift. None of the problems are catastrophic individually; collectively they make the repo expensive to onboard onto and risky to depend on.\n\nThe relative strengths are CI/CD at 7.2 and code quality at 6.0. There is already a working GitHub Actions pipeline, which means most fixes can be enforced rather than just suggested. Code is readable, with the caveat that one handler file and one utils file are absorbing complexity that should be split. These are the parts to keep building on.\n\nTwo priorities outweigh the rest. First, the documentation score of 3.4 includes a missing LICENSE — that is a one-line fix that meaningfully de-risks the project for anyone considering it. Pair it with explicit Install and Usage sections in the README. Second, the testing score of 2.0 is structural: there is no committed test runner config and the two existing tests are effectively demo scripts. Pick vitest, write tests for the two highest-traffic handlers, and gate them in CI before adding new features.",
    top_fixes: [
      "Add a LICENSE file and expand the README with Install, Usage, and Configuration sections so the project is legally and practically adoptable.",
      "Commit a vitest config, write tests for the two highest-traffic handler functions, and run the suite on every PR via the existing GitHub Actions workflow.",
    ],
    generated_at: "2026-05-27T12:00:00Z",
    shareable_url: "/report/mock-c",
  },

  "mock-f": {
    report_id: "mock-f",
    repo_url: "https://github.com/intern/hackathon-2019",
    repo_name: "intern/hackathon-2019",
    overall_score: 2.8,
    overall_grade: "F",
    dimensions: [
      {
        key: "code_quality",
        name: "Code Quality",
        score: 3.0,
        grade: "D",
        summary:
          "Several files mix unrelated responsibilities and have grown well past any reasonable size budget.",
        findings: [
          {
            category: "high_complexity_file",
            severity: "high",
            detail:
              "app.py has cyclomatic complexity 62 and contains routing, business logic, and database access in one file.",
          },
          {
            category: "oversized_file",
            severity: "high",
            detail:
              "app.py is 1,840 lines; utils.py is 980. Neither has clear internal structure.",
          },
          {
            category: "high_complexity_file",
            severity: "medium",
            detail:
              "process_data() inside utils.py is a 200-line function with 14 nested branches.",
          },
        ],
        recommendations: [
          "Split app.py along clear seams: routes, services, and data access as separate modules.",
          "Extract process_data() into a small pipeline of named functions so each branch can be read and tested.",
          "Adopt a complexity budget in lint (start lenient, e.g. 20) so the existing hotspots cannot get worse.",
        ],
      },
      {
        key: "docs",
        name: "Docs",
        score: 1.2,
        grade: "F",
        summary:
          "Essentially no documentation. The repo is unreadable to anyone outside the original team.",
        findings: [
          {
            category: "no_readme",
            severity: "high",
            detail:
              "There is no README file at the repository root.",
          },
          {
            category: "missing_install_section",
            severity: "high",
            detail:
              "No documented install path exists anywhere in the repo.",
          },
          {
            category: "missing_usage_section",
            severity: "high",
            detail:
              "No usage examples, CLI documentation, or API description is provided.",
          },
          {
            category: "no_license",
            severity: "high",
            detail:
              "No LICENSE file. The project is legally undefined for any external use.",
          },
        ],
        recommendations: [
          "Add a README — even a single page covering what the project does, how to run it, and who maintains it would move the score by several points.",
          "Add a LICENSE file before sharing the repo outside the original team.",
          "Document the install and run path in the README so the project is reproducible without tribal knowledge.",
        ],
      },
      {
        key: "deps",
        name: "Dependencies",
        score: 2.4,
        grade: "F",
        summary:
          "Dependencies are deeply stale and one carries a known critical CVE.",
        findings: [
          {
            category: "cve_dep",
            severity: "high",
            detail:
              "requirements.txt pins a version of requests with a known high-severity CVE; the fix has been available for over a year.",
          },
          {
            category: "stale_dep",
            severity: "high",
            detail:
              "11 of 13 dependencies are more than 3 years old. Several are no longer maintained upstream.",
          },
          {
            category: "unpinned_versions",
            severity: "medium",
            detail:
              "requirements.txt mixes pinned and unpinned entries — a fresh install will pull different versions than what the project was built against.",
          },
        ],
        recommendations: [
          "Upgrade the CVE-affected dependency this week. This is the only finding in the report with an active exploit path.",
          "Audit the unmaintained dependencies and plan a replacement for each — staying on unmaintained packages is a long-term liability.",
          "Pin every entry in requirements.txt to an exact version so installs are reproducible.",
        ],
      },
      {
        key: "tests",
        name: "Tests",
        score: 0.0,
        grade: "F",
        summary: "No tests exist in the repository.",
        findings: [
          {
            category: "low_test_ratio",
            severity: "high",
            detail:
              "Zero test files exist. Test-to-source ratio is 0.0.",
          },
          {
            category: "no_test_config",
            severity: "low",
            detail:
              "No pytest, unittest, or other test runner configuration is present.",
          },
        ],
        recommendations: [
          "Add a pytest config and write a single smoke test that confirms the app can start; ship that before anything else.",
          "Once the smoke test runs in CI, target the three highest-risk functions for unit tests.",
          "Treat 'no tests' as a release blocker going forward so the project cannot regress from zero further.",
        ],
      },
      {
        key: "ci",
        name: "CI/CD",
        score: 4.0,
        grade: "D",
        summary:
          "No automation. Every check that exists has to be run manually by a human.",
        findings: [
          {
            category: "no_github_workflows",
            severity: "high",
            detail:
              "There is no .github/workflows directory; nothing runs automatically on push or PR.",
          },
          {
            category: "no_dockerfile",
            severity: "medium",
            detail:
              "No Dockerfile is checked in, so the runtime environment is whatever each contributor has installed locally.",
          },
          {
            category: "no_env_example",
            severity: "medium",
            detail:
              "No .env.example exists, so required environment variables have to be discovered by running and failing.",
          },
          {
            category: "no_makefile",
            severity: "low",
            detail:
              "No Makefile or task runner — common operations (install, run, test) are undocumented and inconsistent across contributors.",
          },
          {
            category: "no_precommit",
            severity: "medium",
            detail:
              "No pre-commit configuration is present.",
          },
        ],
        recommendations: [
          "Add a minimal GitHub Actions workflow that runs install and the (eventual) test suite on every PR — this is the highest-leverage fix in the report.",
          "Commit a .env.example listing every required variable so onboarding stops being trial-and-error.",
          "Add a Makefile with install / run / test targets so the standard operations are discoverable and consistent.",
        ],
      },
      {
        key: "security",
        name: "Security",
        score: 5.6,
        grade: "C",
        summary:
          "Better than the rest of the report, but a hardcoded secret and an unsafe eval are both present.",
        findings: [
          {
            category: "hardcoded_secret",
            severity: "high",
            detail:
              "settings.py contains a hardcoded API key for a third-party service. Rotate the key and move it to an environment variable.",
          },
          {
            category: "eval_usage",
            severity: "medium",
            detail:
              "utils.py uses eval() on a string read from disk to deserialize configuration.",
          },
          {
            category: "bandit_medium",
            severity: "medium",
            detail:
              "Three additional medium-severity findings from static analysis remain untriaged.",
          },
        ],
        recommendations: [
          "Rotate the leaked API key immediately and move it to an environment variable with a .env.example entry.",
          "Replace the eval() in utils.py with a safe deserializer (json or a small schema validator).",
          "Triage the three remaining bandit findings — either fix them or suppress with documented rationale.",
        ],
      },
    ],
    synthesis:
      "intern/hackathon-2019 reads exactly like what the name suggests: a project that worked for a demo and then accumulated five years of neglect. The 2.8 overall is not the result of a single broken area — it is the result of every supporting practice being absent at once. No README, no tests, no CI, no dependency hygiene, and one hardcoded secret. The code itself is not catastrophic, but it has been left without any of the scaffolding that keeps a project usable.\n\nThe least-bad areas are security at 5.6 and CI/CD at 4.0, and both are graded generously. Security stays out of the F band only because there is exactly one hardcoded secret rather than a pattern of them, and CI/CD scrapes a D because basic deployment scripts exist even though no automated workflow runs them. There are no real strengths to build on — every dimension needs work.\n\nTwo priorities outrank the rest by a wide margin. First, the dependency situation includes a known-exploitable CVE that has had a fix available for over a year, and there is a hardcoded API key sitting in settings.py — both are active risks, both should be addressed this week. Second, the project needs the bare minimum of a README, a LICENSE, and a CI workflow before any new features are added; without those, nothing else done to the repo will hold.",
    top_fixes: [
      "Rotate the hardcoded API key in settings.py, move it to an environment variable, and upgrade the CVE-affected requests dependency — both are active security risks today.",
      "Add a README, a LICENSE, and a minimal GitHub Actions workflow that runs install + a smoke test on every PR; treat these as a release blocker before any new feature work.",
    ],
    generated_at: "2026-05-27T12:00:00Z",
    shareable_url: "/report/mock-f",
  },
}
