# Evidence logs

Terminal output of the test runs quoted in the documents. All runs: retries 0.

| Log | What it shows | Quoted in |
|-----|---------------|-----------|
| `final-core-run-all-browsers-2-workers.log` | **Final run of the 25 core cases** in Chromium, Firefox and WebKit: 75 passed, 3 failed (TC25 / BUG-01 in each browser) | README, ANSWERS A2, traceability matrix |
| `final-run-2-all-browsers-2-workers.log` | Final full-suite run, Chromium and Firefox (stopped before WebKit started) | README, traceability matrix |
| `final-run-3-webkit-2-workers.log` | Final full-suite run, WebKit | README, traceability matrix |
| `final-run-1-all-browsers-webkit-fill-flake.log` | Earlier full run where one WebKit checkout test failed once; investigated and fixed | known-limitations |
| `bdd-run-1-all-browsers-3-webkit-failures.log`, `bdd-run-2-all-browsers-2-workers.log` | First runs after the move to BDD: 3 WebKit timing failures, then the run after the fix | known-limitations |
| `pre-bdd-migration/` | Runs before the move to BDD, including the Firefox parallel-load investigation | known-limitations |
