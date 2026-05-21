import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/LandingPage.module.css';

// Counter display element with customizable delays, increments, speeds, prefix/suffix visibility, and ease-out logic
function StatItem({ started, endVal, increment, delay, duration, prefix = '', suffix = '', label }) {
  const [count, setCount] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!started) return;
    let timer;
    const delayTimer = setTimeout(() => {
      const startTime = performance.now();
      
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Quadratic easeOut: f(x) = 1 - (1 - x)^2
        const easedProgress = 1 - Math.pow(1 - progress, 2);
        
        const rawVal = easedProgress * endVal;
        let currentVal = Math.round(rawVal / increment) * increment;
        if (currentVal > endVal) currentVal = endVal;
        
        setCount(currentVal);
        
        if (progress < 1) {
          timer = requestAnimationFrame(animate);
        } else {
          setCount(endVal);
          setIsDone(true);
        }
      };
      
      timer = requestAnimationFrame(animate);
    }, delay);
    
    return () => {
      clearTimeout(delayTimer);
      cancelAnimationFrame(timer);
    };
  }, [started, endVal, increment, delay, duration]);

  const displayVal = isDone 
    ? `${prefix}${count}${suffix}` 
    : `${count}`;

  return (
    <div className={styles.statBlock}>
      <span className={styles.statNumber}>{displayVal}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [startStatsAnimation, setStartStatsAnimation] = useState(false);
  
  const statsSectionRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStartStatsAnimation(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (statsSectionRef.current) {
      observer.observe(statsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleScrollTo = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={styles.landingContainer}>
      {/* Navigation Header */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <a href="#" onClick={handleScrollToTop} className={styles.navLogoArea}>
          <img 
            src="/logo.png" 
            alt="CLARA Logo" 
            className={styles.navLogo} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span className={styles.navTitle}>CLARA</span>
        </a>

        <div className={styles.navLinks}>
          <a href="#features" onClick={(e) => handleScrollTo(e, 'features')} className={styles.navLink}>Features</a>
          <a href="#how-it-works" onClick={(e) => handleScrollTo(e, 'how-it-works')} className={styles.navLink}>How it works</a>
          <a href="#tech" onClick={(e) => handleScrollTo(e, 'tech')} className={styles.navLink}>Tech</a>
          <a href="#roadmap" onClick={(e) => handleScrollTo(e, 'roadmap')} className={styles.navLink}>Roadmap</a>
        </div>

        <Link to="/app" className={styles.navCta}>
          Launch CLARA
        </Link>
      </nav>

      {/* Hero Section */}
      <header className={styles.heroSection}>
        <img 
          src="/logo.png" 
          alt="CLARA Logo" 
          className={styles.heroLogo} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <h1 className={styles.heroTitle}>C.L.A.R.A</h1>
        <p className={styles.heroSubtitle}>Cyber Log Analysis and Response Assistant</p>
        <p className={styles.heroTagline}>
          AI-powered threat detection for security professionals
        </p>
        <Link to="/app" className={styles.heroCta}>
          Launch CLARA
        </Link>
      </header>

      {/* Stats Bar Section */}
      <section ref={statsSectionRef} className={styles.statsSection}>
        <div className={styles.statsContainer}>
          <StatItem
            started={startStatsAnimation}
            endVal={7}
            increment={1}
            delay={0}
            duration={900}
            label="Log Formats Supported"
          />
          <StatItem
            started={startStatsAnimation}
            endVal={40}
            increment={2}
            delay={200}
            duration={1400}
            suffix="+"
            label="Threat Types Detected"
          />
          <StatItem
            started={startStatsAnimation}
            endVal={20}
            increment={1}
            delay={100}
            duration={1100}
            label="MITRE ATT&CK Techniques Mapped"
          />
          <StatItem
            started={startStatsAnimation}
            endVal={12}
            increment={1}
            delay={350}
            duration={800}
            prefix="~"
            suffix="s"
            label="Average Analysis Time"
          />
          <StatItem
            started={startStatsAnimation}
            endVal={15}
            increment={1}
            delay={50}
            duration={1200}
            prefix="Up to "
            label="Findings Per Analysis"
          />
          <StatItem
            started={startStatsAnimation}
            endVal={3}
            increment={1}
            delay={500}
            duration={600}
            label="Export Formats Available"
          />
          <StatItem
            started={startStatsAnimation}
            endVal={13}
            increment={1}
            delay={150}
            duration={1000}
            label="Kill Chain Stages Mapped"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.featuresSection}>
        <h2 className={styles.sectionHeader}>What CLARA does</h2>
        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>AI Threat Detection</h3>
            <p className={styles.featureCardDesc}>
              Upload any log file and CLARA analyses it instantly using Claude Sonnet. Threats are classified by severity so you know exactly what to prioritise.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>MITRE ATT&CK Mapping</h3>
            <p className={styles.featureCardDesc}>
              Every finding is automatically mapped to the MITRE ATT&CK framework with tactic and technique IDs so you can understand the attack in context.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Analyst Chat</h3>
            <p className={styles.featureCardDesc}>
              Ask follow-up questions about any finding in plain English. CLARA maintains full context of the log and analysis throughout the conversation.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className={styles.featureCardTitle}>Export Reports</h3>
            <p className={styles.featureCardDesc}>
              Generate a full PDF incident report, a SOC-ready summary, or a chat transcript with one click. Ready to share with your team.
            </p>
          </div>
        </div>
      </section>

      {/* Why I Built This Section */}
      <section className={styles.whySection}>
        <div className={styles.whyContainer}>
          <div className={styles.storyLabel}>THE STORY</div>
          <h2 className={styles.storyHeading}>Built out of frustration. Designed for clarity.</h2>
          <p className={styles.storyCopy}>
            As a cybersecurity student, I kept running into the same problem. Professional log analysis tools are powerful but expensive, complex, and built for seasoned analysts. When learning to read logs and identify attack patterns, there was nothing between a raw text file and an enterprise SIEM. I built CLARA to fill that gap — a tool that not only flags threats but explains them, maps them to a framework, and lets you interrogate what you are seeing. It is the tool I wished I had when I was starting out.
          </p>
          <div className={styles.storySignature}>
            — Ahmad, BSc Cybersecurity and Digital Forensics
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <h2 className={styles.sectionHeader}>How it works</h2>
        <div className={styles.stepsRow}>
          {/* Step 1 */}
          <div className={styles.stepBlock}>
            <div className={styles.stepNum}>1</div>
            <h3 className={styles.stepTitle}>Upload your log</h3>
            <p className={styles.stepDesc}>
              Paste raw log text or upload a .txt or .log file directly.
            </p>
          </div>

          {/* Step 2 */}
          <div className={styles.stepBlock}>
            <div className={styles.stepNum}>2</div>
            <h3 className={styles.stepTitle}>Get your analysis</h3>
            <p className={styles.stepDesc}>
              CLARA detects threats, scores risk, and maps every finding to MITRE ATT&CK in seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className={styles.stepBlock}>
            <div className={styles.stepNum}>3</div>
            <h3 className={styles.stepTitle}>Interrogate the findings</h3>
            <p className={styles.stepDesc}>
              Ask the AI analyst anything about the log and export a professional report.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Highlights Section */}
      <section id="tech" className={styles.techSection}>
        <div className={styles.techLabel}>UNDER THE HOOD</div>
        <h2 className={styles.techHeading}>Built with security in mind</h2>
        <div className={styles.techGrid}>
          {/* Card 1 */}
          <div className={styles.techCard}>
            <div className={styles.techCardIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className={styles.techCardTitle}>Secure by design</h3>
            <p className={styles.techCardDesc}>
              Your Anthropic API key is stored as a server-side environment variable and never sent to the browser. All AI calls are proxied through serverless functions — your key is never exposed in the client bundle or network requests.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.techCard}>
            <div className={styles.techCardIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
            <h3 className={styles.techCardTitle}>Powered by Claude Sonnet 4.6</h3>
            <p className={styles.techCardDesc}>
              CLARA uses Anthropic's Claude Sonnet 4.6 model for threat analysis and conversational reasoning. The model returns structured JSON output mapped directly to severity classifications and MITRE ATT&CK techniques.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.techCard}>
            <div className={styles.techCardIcon}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className={styles.techCardTitle}>MITRE ATT&CK mapped</h3>
            <p className={styles.techCardDesc}>
              Every finding is automatically mapped to the MITRE ATT&CK framework with tactic and technique IDs. Kill chain stages are reconstructed from log evidence to show the full shape of an attack.
            </p>
          </div>
        </div>
      </section>

      {/* Supported formats */}
      <section className={styles.supportedSection}>
        <h3 className={styles.supportedTitle}>Supports all major log formats</h3>
        <div className={styles.pillRow}>
          <span className={styles.pill}>Apache</span>
          <span className={styles.pill}>Nginx</span>
          <span className={styles.pill}>Linux Auth</span>
          <span className={styles.pill}>Syslog</span>
          <span className={styles.pill}>Windows Event</span>
          <span className={styles.pill}>Snort</span>
          <span className={styles.pill}>Suricata</span>
          <span className={styles.pill}>Generic</span>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className={styles.roadmapSection}>
        <div className={styles.roadmapLabel}>WHAT'S NEXT</div>
        <h2 className={styles.roadmapHeading}>The road ahead</h2>
        <div className={styles.roadmapGrid}>
          {/* Card 1 */}
          <div className={styles.roadmapCard}>
            <span className={styles.roadmapBadge}>Coming soon</span>
            <h3 className={styles.roadmapCardTitle}>IOC Enrichment</h3>
            <p className={styles.roadmapCardDesc}>
              Automatic extraction of indicators of compromise — IPs, domains, file hashes — with one-click VirusTotal lookups to check if any are known malicious.
            </p>
          </div>

          {/* Card 2 */}
          <div className={styles.roadmapCard}>
            <span className={styles.roadmapBadge}>Coming soon</span>
            <h3 className={styles.roadmapCardTitle}>VirusTotal Integration</h3>
            <p className={styles.roadmapCardDesc}>
              Deep integration with the VirusTotal API to cross-reference every suspicious IP and domain found in the log against a database of known threats.
            </p>
          </div>

          {/* Card 3 */}
          <div className={styles.roadmapCard}>
            <span className={styles.roadmapBadge}>Coming soon</span>
            <h3 className={styles.roadmapCardTitle}>SIEM Export</h3>
            <p className={styles.roadmapCardDesc}>
              Export findings in formats compatible with major SIEM platforms so CLARA fits directly into a real security operations workflow.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <img 
            src="/logo.png" 
            alt="CLARA Logo" 
            className={styles.footerLogo} 
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div className={styles.footerText}>
            <strong>CLARA</strong> — Cyber Log Analysis and Response Assistant
            <br />
            Built by Ahmad — BSc Cybersecurity and Digital Forensics
          </div>
          <div className={styles.footerLinks}>
            <a href="#" className={styles.footerLink} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="#" className={styles.footerLink} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Back to top button */}
      <button 
        type="button" 
        className={`${styles.backToTopBtn} ${showBackToTop ? styles.backToTopBtnVisible : ''}`}
        onClick={handleScrollToTop}
        title="Scroll back to top"
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
