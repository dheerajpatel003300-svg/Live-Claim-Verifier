import { useState, type FormEvent } from 'react'
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  FileSearch,
  Fingerprint,
  Globe2,
  LoaderCircle,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from 'lucide-react'

type Verdict = 'true' | 'false' | 'needs_review'
type Language = 'english' | 'hindi' | 'bengali' | 'codemix'

type Source = {
  title: string
  url: string
}

type CheckResult = {
  claim: string
  language: Language
  verdict: Verdict
  confidence?: number
  support_threshold?: number
  review_threshold?: number
  evidence?: string
  sources?: Source[]
  justification?: string
  reason?: string
}

const endpoint = import.meta.env.VITE_FACTCHECK_API_URL || '/api/check-claim'

const verdictCopy: Record<Verdict, { title: string; label: string }> = {
  true: { title: 'Supported by evidence', label: 'TRUE' },
  false: { title: 'Evidence contradicts claim', label: 'FALSE' },
  needs_review: { title: 'Needs a closer look', label: 'NEEDS REVIEW' },
}

function formatReason(reason: string) {
  return reason.replace(/_/g, ' ')
}

function App() {
  const [claim, setClaim] = useState('')
  const [language, setLanguage] = useState<Language>('english')
  const [withJustification, setWithJustification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CheckResult | null>(null)
  const [brandOpen, setBrandOpen] = useState(false)
  const [teamOpen, setTeamOpen] = useState(false)

  async function submitClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!claim.trim() || loading) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: claim.trim(),
          language,
          with_justification: withJustification,
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || `The verifier returned HTTP ${response.status}.`)
      }

      const data = (await response.json()) as CheckResult
      if (!data || !['true', 'false', 'needs_review'].includes(data.verdict)) {
        throw new Error('The verifier returned an unrecognized result. No verdict was shown.')
      }
      setResult(data)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not connect to the verifier. Check the API and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function resetCheck() {
    setResult(null)
    setError('')
  }

  const verdict = result?.verdict ?? 'needs_review'
  const confidence = typeof result?.confidence === 'number' ? result.confidence : null
  const percent = confidence === null ? 0 : Math.max(0, Math.min(100, confidence * 100))

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={() => setBrandOpen(true)} aria-label="About Proofline">
          <span className="brand-mark"><Fingerprint size={19} strokeWidth={2.2} /></span>
          <span>proofline<span className="brand-dot">.</span></span>
        </button>
        <div className="topbar-center"><span className="live-indicator" /> LIVE VERIFICATION</div>
        <button className="help-button" type="button" title="About us" aria-label="About us" onClick={() => setTeamOpen(true)}>
          <CircleHelp size={18} />
        </button>
      </header>

      {brandOpen && (
        <div className="modal-backdrop" onClick={() => setBrandOpen(false)}>
          <div className="about-modal" role="dialog" aria-modal="true" aria-labelledby="brand-proofline-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setBrandOpen(false)} aria-label="Close Proofline info">
              ×
            </button>
            <p className="micro-label">ABOUT PROOFLINE</p>
            <h2 id="brand-proofline-title">Built to protect people from misinformation.</h2>
            <div className="modal-copy">
              <p><strong>Proofline exists to help people verify what they hear before they share it.</strong> In a world filled with fast-moving claims, headlines, and rumors, it is easy to mistake noise for truth.</p>
              <p>Its purpose is simple: slow down the spread of misinformation by grounding decisions in current evidence, transparent reasoning, and measurable confidence.</p>
              <p>When a claim is checked, Proofline looks for supporting or contradicting sources, surfaces the relevant evidence, and helps users decide whether to trust it, question it, or keep investigating.</p>
            </div>
          </div>
        </div>
      )}

      {teamOpen && (
        <div className="modal-backdrop" onClick={() => setTeamOpen(false)}>
          <div className="about-modal" role="dialog" aria-modal="true" aria-labelledby="team-proofline-title" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setTeamOpen(false)} aria-label="Close team information">
              ×
            </button>
            <p className="micro-label">HACKNEX 2.0</p>
            <h2 id="team-proofline-title">Team Tech Titans.</h2>
            <div className="modal-copy">
              <p><strong>This project was created at HackNex 2.0 in JIS College.</strong> It was developed by Team Tech Titans, including Amit, Harsh Kumar, Harsh Dev Jha, and Dheeraj.</p>
              <p>Our goal is to make fact-checking more accessible and help people separate truth from manipulation, rumors, and misleading narratives.</p>
              <p>Our vision is to protect India from misinformation by building tools that make evidence-based thinking easier for everyone.</p>
            </div>
          </div>
        </div>
      )}

      <main id="top" className="workspace">
        <section className="intro-row" aria-labelledby="page-title">
          <div>
            <h1 id="page-title">Check what<br className="mobile-break" /> you hear.</h1>
            <p className="intro-copy">One claim. Current sources. A verdict that knows when to pause.</p>
          </div>
          <div className="privacy-note"><LockKeyhole size={14} /><span>Evidence-led, never guess-led</span></div>
        </section>

        <div className="work-grid">
          <section className="input-panel" aria-labelledby="claim-heading">
            <div className="panel-heading">
              <div className="step-number">01</div>
              <div>
                <p className="micro-label">START WITH A CLAIM</p>
                <h2 id="claim-heading">What should we verify?</h2>
              </div>
            </div>

            <form onSubmit={submitClaim}>
              <label className="sr-only" htmlFor="claim-input">Claim to verify</label>
              <div className="claim-field-wrap">
                <textarea
                  id="claim-input"
                  value={claim}
                  onChange={(event) => setClaim(event.target.value)}
                  placeholder="Write a factual claim, not a question…"
                  maxLength={1200}
                  rows={5}
                  disabled={loading}
                />
                <span className="character-count">{claim.length}/1200</span>
              </div>

              <div className="form-options">
                <div className="language-control">
                  <Globe2 size={16} aria-hidden="true" />
                  <label className="sr-only" htmlFor="language-select">Claim language</label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value as Language)}
                    disabled={loading}
                  >
                    <option value="english">English</option>
                    <option value="hindi">Hindi</option>
                    <option value="bengali">Bengali</option>
                    <option value="codemix">Code-mix</option>
                  </select>
                  <ChevronDown className="select-chevron" size={14} aria-hidden="true" />
                </div>
                <label className="toggle-control">
                  <input
                    type="checkbox"
                    checked={withJustification}
                    onChange={(event) => setWithJustification(event.target.checked)}
                    disabled={loading}
                  />
                  <span className="toggle-track"><span /></span>
                  <span>Include explanation</span>
                </label>
              </div>

              <button className="submit-button" type="submit" disabled={!claim.trim() || loading}>
                {loading ? <LoaderCircle className="spin" size={18} /> : <FileSearch size={18} />}
                <span>{loading ? 'Checking live sources' : 'Verify this claim'}</span>
                {!loading && <ArrowUpRight size={17} className="submit-arrow" />}
              </button>
              {loading && <p className="loading-caption">Searching the web, reviewing passages, and checking the evidence.</p>}
            </form>

            {error && (
              <div className="error-message" role="alert">
                <TriangleAlert size={17} />
                <div><strong>Couldn’t complete this check</strong><p>{error}</p></div>
              </div>
            )}

            <div className="pipeline-strip" aria-label="Verification steps">
              <div><span className="pipeline-icon"><Globe2 size={14} /></span><span>Live search</span></div>
              <span className="pipeline-connector" />
              <div><span className="pipeline-icon"><Sparkles size={14} /></span><span>Evidence</span></div>
              <span className="pipeline-connector" />
              <div><span className="pipeline-icon"><ShieldCheck size={14} /></span><span>Verdict</span></div>
            </div>
          </section>

          <section className={`result-panel ${result ? `result-${verdict}` : ''}`} aria-live="polite" aria-labelledby="result-heading">
            {loading ? (
              <div className="pending-state">
                <div className="loader-orbit"><span /><span /><span /></div>
                <p className="micro-label">FOLLOWING THE EVIDENCE</p>
                <h2 id="result-heading">Checking the record<span className="animated-ellipsis">...</span></h2>
                <p>Gathering current sources and comparing what they say.</p>
                <div className="pending-steps"><span className="complete-step"><Check size={13} /> Search started</span><span className="active-step">Reading evidence</span><span>Scoring claim</span></div>
              </div>
            ) : result ? (
              <div className="result-content">
                <div className="result-topline"><p className="micro-label">VERIFICATION RESULT</p><button type="button" className="reset-button" onClick={resetCheck} title="Start a new check"><RotateCcw size={15} /><span>New check</span></button></div>
                <div className="verdict-lockup">
                  <span className={`verdict-stamp verdict-stamp-${verdict}`}>{verdict === 'true' ? <Check size={25} /> : verdict === 'false' ? <span className="false-mark">×</span> : <CircleHelp size={24} />}</span>
                  <div><span className={`verdict-label verdict-label-${verdict}`}>{verdictCopy[verdict].label}</span><h2 id="result-heading">{verdictCopy[verdict].title}</h2></div>
                </div>
                <div className="checked-claim"><span>CLAIM CHECKED</span><p>{result.claim || claim}</p></div>

                <div className="confidence-block">
                  <div className="confidence-heading"><span>Classifier confidence</span><strong>{confidence === null ? 'Not provided' : `${Math.round(percent)}%`}</strong></div>
                  <div className="confidence-track" aria-label={confidence === null ? 'Confidence unavailable' : `Confidence ${Math.round(percent)} percent`}>
                    <span className="confidence-fill" style={{ width: `${percent}%` }} />
                    <span className="threshold-marker marker-review" />
                    <span className="threshold-marker marker-support" />
                  </div>
                  <div className="threshold-labels"><span>0</span><span className="review-caption">60% review</span><span className="support-caption">85% support</span><span>100</span></div>
                </div>

                {result.reason && <p className="reason-note"><CircleHelp size={14} /> {formatReason(result.reason)}</p>}

                <div className="evidence-block">
                  <div className="section-divider"><span>WHAT THE SOURCES SAY</span><span className="divider-line" /></div>
                  {result.evidence ? <p className="evidence-copy">{result.evidence}</p> : <p className="empty-evidence">No evidence summary was returned for this check.</p>}
                </div>

                {result.justification && <div className="justification-block"><div className="section-divider"><span>WHY THIS VERDICT</span><span className="divider-line" /></div><p className="evidence-copy">{result.justification}</p></div>}

                <div className="sources-block">
                  <div className="section-divider"><span>SOURCES</span><span className="source-count">{result.sources?.length ?? 0}</span></div>
                  {result.sources?.length ? <ul className="source-list">{result.sources.map((source, index) => <li key={`${source.url}-${index}`}><span className="source-index">{String(index + 1).padStart(2, '0')}</span><a href={source.url} target="_blank" rel="noreferrer">{source.title || source.url}<ExternalLink size={13} /></a></li>)}</ul> : <p className="empty-evidence">No sources were attached to this result.</p>}
                </div>
                <p className="disclaimer"><ShieldCheck size={14} /> Evidence-assisted, not a guarantee of truth.</p>
              </div>
            ) : (
              <div className="empty-result">
                <div className="result-topline"><p className="micro-label">YOUR RESULT</p><span className="awaiting-label"><span /> AWAITING CLAIM</span></div>
                <div className="empty-symbol"><ShieldCheck size={27} strokeWidth={1.5} /><span className="symbol-spark">✳</span></div>
                <h2 id="result-heading">Good checks<br />start with evidence.</h2>
                <p className="empty-description">Your sources, evidence summary, and confidence-aware verdict will appear here.</p>
                <div className="threshold-card">
                  <div className="threshold-card-heading"><span>VERDICT THRESHOLDS</span><span>CONFIDENCE</span></div>
                  <div className="threshold-row"><span className="threshold-dot dot-true" /><strong>Supported</strong><span className="threshold-range">Above 85%</span></div>
                  <div className="threshold-row"><span className="threshold-dot dot-review" /><strong>Needs review</strong><span className="threshold-range">60–85%</span></div>
                  <div className="threshold-row"><span className="threshold-dot dot-false" /><strong>Contradicted</strong><span className="threshold-range">Below 60%</span></div>
                </div>
                <div className="safety-note"><span className="safety-icon"><ShieldCheck size={15} /></span><p>Missing or irrelevant evidence always means <strong>needs review</strong>.</p></div>
              </div>
            )}
          </section>
        </div>

        <footer className="page-footer"><span>PROOFLINE <span className="footer-separator">/</span> LIVE CLAIM VERIFIER</span><span>SEARCH · CONTEXT · CONFIDENCE</span><a href="https://ollama.com" target="_blank" rel="noreferrer">LOCAL MODEL <ArrowUpRight size={12} /></a></footer>
      </main>
    </div>
  )
}

export default App