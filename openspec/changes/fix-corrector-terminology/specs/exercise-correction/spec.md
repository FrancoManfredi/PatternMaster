# Delta for exercise-correction

## MODIFIED Requirements

### Requirement: Structured Correction Result

MUST display: score per criterion (0-10), weighted total, actionable feedback. Rubric: pattern application, decoupling/SOLID, naming/clarity, functionality.

The system MUST tailor evaluation terminology to the specific pattern being evaluated. Each correction response MUST use the correct actor names, role descriptions, and pattern-specific vocabulary derived from the pattern's content (e.g., "Producto" and "Creador" for Factory Method; "EstrategiaConcreta" and "Contexto" for Strategy). The system MUST NOT leak terminology from other patterns into feedback.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Success | valid code submitted for Factory Method | API returns valid response | scores + feedback rendered using Factory Method terminology |
| Pattern-specific vocabulary | correction for Strategy pattern | feedback generated | uses "Estrategia", "Contexto", "Algoritmo" — NOT "Producto" or "Creador" |
| No cross-pollution | correction for any pattern | feedback generated | contains zero actor names from other patterns |

(Previously: Structured Correction Result displayed scores and feedback but used generic or leaked Strategy-pattern terminology for all patterns.)

### Requirement: Mock Corrector

MUST include mock via `USE_REAL_CLAUDE` env flag — realistic JSON without API call.

The mock corrector MUST accept a `patternSlug` parameter and return feedback using correct terminology for that specific pattern. The mock MUST NOT return hardcoded Strategy-pattern terms for non-Strategy patterns. When no pattern-specific template exists for a given slug, the mock SHOULD fall back to generic feedback without pattern-specific actor names.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Mock mode | USE_REAL_CLAUDE=false | code submitted | mock feedback, no API call |
| Pattern-aware mock | USE_REAL_CLAUDE=false, patternSlug="factory-method" | mock invoked | feedback uses Factory Method terminology ("Producto", "Creador") |
| No cross-pollution in mock | USE_REAL_CLAUDE=false, patternSlug="strategy" | mock invoked | feedback does NOT mention "Producto" or "Creador" |
| Fallback for unknown pattern | USE_REAL_CLAUDE=false, patternSlug="unknown-pattern" | mock invoked | generic feedback returned without pattern-specific actor names |

(Previously: Mock corrector returned hardcoded Strategy-pattern terminology ("estrategias concretas", "contexto") regardless of which pattern was being evaluated.)

## ADDED Requirements

### Requirement: Pattern-Specific Feedback Vocabulary

The system MUST derive a glossary of correct actor names for each pattern from its content definition (`sections.howItWorks.description` bolded names). The correction prompt MUST inject this glossary so the LLM uses only the correct terms for the target pattern. The system MUST also build a set of forbidden synonyms — actor names from OTHER patterns — and include them in the prompt as terms to avoid.

| Scenario | GIVEN | a pattern with bolded actor names in howItWorks.description |
|----------|-------|------|
| Glossary derivation | pattern "factory-method" | glossary contains ["Producto", "Creador", "Notificacion"] |
| Forbidden synonyms | pattern "strategy" | forbidden list contains Factory Method actors, not Strategy actors |
| Prompt injection | glossary built for any pattern | correction prompt includes glossary block before feedback request |

### Requirement: Code Reference Directive

The correction prompt MUST include a directive instructing the LLM to cite at least one concrete class or method from the user's submitted code before suggesting improvements. The prompt SHOULD include a `codeBefore`/`codeAfter` few-shot example from the pattern's content to ground the feedback in a concrete reference transition.

| Scenario | GIVEN | WHEN | THEN |
|----------|-------|------|------|
| Directive present | user submits code | correction prompt built | prompt contains "cite at least one concrete class from the user's code" |
| Few-shot example | pattern has codeBefore/codeAfter | prompt built | prompt includes codeBefore -> codeAfter transition as reference |
| Feedback references code | valid code submitted | correction returned | feedback mentions at least one class/method name from submitted code |
