# Task 2 Completion Report: `extract-wordlist.ts` Parser (TDD)

## Files Created

1. **Test file:** `C:\Users\Tariq\Desktop\geothe\scripts\__tests__\extract-wordlist.test.ts`
2. **Implementation file:** `C:\Users\Tariq\Desktop\geothe\scripts\extract-wordlist.ts`

## TDD Evidence

### Step 2: RED Phase - Tests Fail (Expected)

**Command:**
```bash
node --test "scripts/__tests__/extract-wordlist.test.ts"
```

**Output:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'C:\Users\Tariq\Desktop\geothe\scripts\extract-wordlist.ts' imported from C:\Users\Tariq\Desktop\geothe\scripts\__tests__\extract-wordlist.test.ts
    at finalizeResolution (node:internal/modules/esm/resolve:274:11)
    at moduleResolve (node:internal/modules/esm/resolve:864:10)
    at defaultResolve (node:internal/modules/esm/resolve:990:11)
    at #cachedDefaultResolve (node:internal/modules/esm/loader:749:20)
    at ModuleLoader.resolve (node:internal/loader:726:38)
    at ModuleLoader.getModuleJobForImport (node:internal/loader:312:38)
    at #link (node:internal/module_job:208:49) {
  code: 'ERR_MODULE_NOT_FOUND',
  url: 'file:///C:/Users/Tariq/Desktop/geothe/scripts/extract-wordlist.ts'
}

Node.js v24.7.0
✖ scripts\__tests__\extract-wordlist.test.ts (237.681ms)
ℹ tests 1
ℹ suites 0
ℹ pass 0
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 257.4086

✖ failing tests:

test at scripts\__tests__\extract-wordlist.test.ts:1:1
✖ scripts\__tests__\extract-wordlist.test.ts (237.681ms)
  'test failed'
```

**Result:** FAILED as expected (module doesn't exist yet).

---

### Step 4: GREEN Phase - Tests Pass

**Command:**
```bash
node --test "scripts/__tests__/extract-wordlist.test.ts"
```

**Output:**
```
✔ parses a simple noun entry with a plural marker (4.2757ms)
✔ filters page-break junk lines (0.2295ms)
✔ keeps danken, der Dank and danke as separate flat entries (0.1988ms)
✔ keeps two independent example sentences as separate array items (0.1734ms)
✔ joins a line-wrapped example that has no terminating punctuation yet (1.482ms)
✔ flags a capitalized noun line missing its article as a warning (0.1913ms)
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 160.485
```

**Result:** ALL 6 TESTS PASSING ✓

---

## Self-Review Findings

### Test File Review (`scripts/__tests__/extract-wordlist.test.ts`)

Checked all 6 tests against the brief:

1. ✓ **parses a simple noun entry with a plural marker**
   - Correctly extracts "Aufzug" with artikel="der", plural="-ü, e"
   - Matches example output exactly

2. ✓ **filters page-break junk lines**
   - Correctly filters VS_02_280312, Seite 11, Inventare, B
   - Only keeps "bald" entry
   - Junk pattern matching works as intended

3. ✓ **keeps danken, der Dank and danke as separate flat entries**
   - Correctly separates verb "danken", noun "Dank", and exclamation "danke"
   - Correctly joins two consecutive example lines under "Dank"

4. ✓ **keeps two independent example sentences as separate array items**
   - Correctly recognizes that "Ich nehme die nächste Bahn." starts with capital I and is a new entry
   - Properly maintains example array with 2 separate items

5. ✓ **joins a line-wrapped example that has no terminating punctuation yet**
   - Correctly identifies wrapped line based on lack of sentence punctuation
   - Properly joins "z. B. meine beiden" + "Brüder, arbeiten auch hier." without extra space issues
   - Result: "Beispiel/z. B. Viele meiner Verwandten, z. B. meine beiden Brüder, arbeiten auch hier."

6. ✓ **flags a capitalized noun line missing its article as a warning**
   - Correctly parses 3 entries: "Salz" (with artikel="das"), "Satz" (no artikel, with warning), "S-Bahn" (with artikel="die")
   - Correctly identifies "Satz, -ä, e" as missing article and generates exactly 1 warning

### Implementation File Review (`scripts/extract-wordlist.ts`)

Verified key logic against test expectations:

1. ✓ **Interfaces match spec:**
   - `WordlistEntry`: word, artikel, plural, wortart ("nomen"|"verb"|null), beispiele
   - `ExtractWarning`: line, reason

2. ✓ **Junk line filtering:**
   - JUNK_LINE_PATTERNS covers: `VS_\d+`, `Seite \d+`, `Inventare`, single capital letters
   - `isJunkLine()` correctly returns true for empty lines and pattern matches

3. ✓ **Article prefix recognition:**
   - Regex `/^(der\/die|der|die|das)\s+/` correctly extracts articles including compound "der/die"

4. ✓ **Plural marker extraction:**
   - Regex `/^([-–][^\s,]*(?:,\s*[^\s,]+)?)\s+/` correctly handles both single and dual-part plurals like "-ü, e"

5. ✓ **Sentence punctuation detection:**
   - `endsWithSentencePunctuation()` regex `/[.!?]["')]?$/` correctly identifies sentence endings including quoted ends

6. ✓ **Word/rest splitting:**
   - `splitWordAndRest()` correctly extracts word, artikel, plural in proper sequence
   - Properly handles German characters (ä, ö, ü, ß)

7. ✓ **Line classification:**
   - Lowercase start or missing-article-noun pattern triggers new entry parsing
   - Other lines are appended as examples or line-wrapped continuations
   - `lastLineEndedSentence` state variable correctly controls joining vs. separate entries

8. ✓ **Main function:**
   - Reads from correct path: `data/wordlist/raw/wortliste_raw.txt`
   - Writes outputs: `data/wordlist/wordlist.json`, `data/wordlist/warnings.json`
   - Entry point check with `import.meta.url` === `pathToFileURL(process.argv[1]).href` is correct

### Transcription Accuracy

- No character-by-character transcription errors found
- Regex patterns match exactly (including hyphen vs. en-dash distinctions)
- German umlauts and special characters preserved correctly
- All TypeScript syntax is valid

---

## Summary

**Status:** DONE

All 6 tests passing. Implementation exactly matches the test specifications. No transcription errors found. Code is ready for Task 3.

- **RED phase:** Tests correctly fail with module not found error
- **GREEN phase:** All 6 tests pass with 0 failures
- **Self-review:** No issues found in transcription or logic

Next: Task 3 will run the parser on the real PDF wordlist and spot-check results.
