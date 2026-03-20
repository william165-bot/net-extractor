import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  UserPlus, CreditCard, BookOpen, Download, Monitor, Sparkles,
  CheckCircle, MessageCircle, Key, AlertCircle, ChevronRight,
  HelpCircle, ArrowRight
} from 'lucide-react'

function Section({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={`py-10 ${className}`}>{children}</section>
}

function SectionTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-7">
      <h2 className="font-serif text-2xl font-bold text-foreground">{children}</h2>
      {sub && <p className="text-muted-foreground text-sm mt-1">{sub}</p>}
    </div>
  )
}

function Step({ n, icon, title, children }: { n: number; icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="h-9 w-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0 shadow-sm">{n}</div>
        <div className="flex-1 w-px bg-border mt-2 mb-2" />
      </div>
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-primary">{icon}</span>
          <h3 className="font-semibold text-base">{title}</h3>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function ProductCard({
  color, title, price, priceLabel, who, includes, paymentLink, paymentNote, icon
}: {
  color: string; title: string; price: string; priceLabel: string;
  who: string; includes: string[]; paymentLink: string; paymentNote: string; icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="h-1.5 w-full" style={{ background: color }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span style={{ color }}>{icon}</span>
            <h3 className="font-serif font-bold text-lg">{title}</h3>
          </div>
          <div className="text-right flex-shrink-0 ml-3">
            <div className="text-2xl font-serif font-bold" style={{ color }}>{price}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{priceLabel}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-4 border">
          <span className="font-semibold text-foreground">Who is this for? </span>{who}
        </p>
        <div className="mb-4">
          <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">What you get:</div>
          <ul className="space-y-1.5">
            {includes.map(item => (
              <li key={item} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" style={{ color }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2.5 text-xs text-amber-800 mb-4">
          <span className="font-bold">💳 How to pay: </span>{paymentNote}
        </div>
        <Link to="/auth">
          <Button className="w-full gap-2 text-white" style={{ background: color }}>
            Get Started <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

function FaqItem({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-start gap-3">
        <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold text-sm mb-1.5">{q}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-muted/20">
      {/* Hero */}
      <div className="bg-primary text-white py-12">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border border-yellow-400/40 text-yellow-300 mb-4">
            Complete User Guide
          </div>
          <h1 className="font-serif text-4xl font-bold mb-3">How It Works</h1>
          <p className="text-white/75 max-w-xl mx-auto leading-relaxed">
            Everything you need to know — from registering, to paying, to taking your first practice exam.
            No technical skills required.
          </p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="bg-white border-b sticky top-[65px] z-30 shadow-sm">
        <div className="mx-auto max-w-4xl px-4 py-3 flex gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { href: '#getting-started', label: '1. Getting Started' },
            { href: '#products', label: '2. Products & Prices' },
            { href: '#how-to-pay', label: '3. How to Pay' },
            { href: '#after-payment', label: '4. After Payment' },
            { href: '#faq', label: '5. FAQ' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16">

        {/* ── Section 1: Getting Started ── */}
        <Section id="getting-started" className="border-b">
          <SectionTitle sub="Start here — it's completely free">1. Getting Started</SectionTitle>
          <Step n={1} icon={<UserPlus className="h-4 w-4" />} title="Create a Free Account">
            Go to <Link to="/auth" className="text-primary font-semibold hover:underline">Sign In / Register</Link> and click "Create Account". Enter your name, email address, and a password. That's it — your account is ready immediately.
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-green-800">
              ✅ <strong>No payment needed to register.</strong> You can practise Current Affairs questions for free right after registering.
            </div>
          </Step>
          <Step n={2} icon={<BookOpen className="h-4 w-4" />} title="Try Free Current Affairs Practice">
            After logging in, go to your <Link to="/dashboard" className="text-primary font-semibold hover:underline">Dashboard</Link>. Scroll down to "Practice Cadres" and click <strong>Current Affairs (Free)</strong>. You'll get a 45-minute timed exam with up to 70 questions and instant feedback.
          </Step>
          <Step n={3} icon={<CreditCard className="h-4 w-4" />} title="Upgrade When Ready">
            If you want to practise other cadres or use the AI platform, choose a plan below. All payments go through <strong>Flutterwave</strong> — a secure Nigerian payment gateway that accepts cards, bank transfer, and USSD.
          </Step>
        </Section>

        {/* ── Section 2: Products ── */}
        <Section id="products" className="border-b">
          <SectionTitle sub="Three completely separate products — each unlocks something different">2. Products &amp; Prices</SectionTitle>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <strong>Important:</strong> These are <strong>three separate products</strong> with separate prices. An activation key for CBT Premium <em>only</em> unlocks the practice cadres — it does NOT give you Past Questions or the Windows Software. You pay for each one separately.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-5">
            <ProductCard
              color="#1a5c35"
              title="CBT Premium Access"
              price="₦5,000"
              priceLabel="One-time payment"
              who="Anyone who wants to practise all 21 professional cadre subjects and use the AI CBT platform."
              includes={[
                'All 21 professional cadre exam subjects',
                'AI-powered CBT platform (adaptive testing)',
                'Timed 45-minute practice sessions',
                'Instant score with correct answers',
                'Full explanations for every question',
                'Access from any phone or computer',
              ]}
              paymentLink="https://flutterwave.com/pay/emellunf1blc"
              paymentNote="Click 'Pay ₦5,000' on your dashboard. You'll go to Flutterwave, pay, and be brought back automatically. Your account unlocks immediately."
              icon={<Sparkles className="h-5 w-5" />}
            />
            <ProductCard
              color="#7c3aed"
              title="Past Exam Questions"
              price="₦7,000"
              priceLabel="One-time payment"
              who="Anyone who wants the official FCT CBT past exam questions as a downloadable file."
              includes={[
                'Official FCT CBT past questions',
                'Covers all professional cadres',
                'Downloadable PDF format',
                'Updated collection',
                'Download as many times as you need',
              ]}
              paymentLink="https://flutterwave.com/pay/zjveyg6kjpfd"
              paymentNote="Click 'Pay ₦7,000' on your dashboard. After payment you're brought back and a download button appears immediately."
              icon={<Download className="h-5 w-5" />}
            />
            <ProductCard
              color="#1e40af"
              title="Windows Enterprise Software"
              price="₦100,000"
              priceLabel="One-time payment"
              who="Organizations, training centres, or offices that need offline CBT software installed on Windows computers."
              includes={[
                'Full offline Windows application',
                'No internet needed after installation',
                'Supports multiple users (bulk use)',
                'Admin dashboard for institutions',
                'Advanced analytics and reporting',
                'Technical support included',
              ]}
              paymentLink="https://flutterwave.com/pay/f6lonaopcfuo"
              paymentNote="Click 'Pay ₦100,000' on your dashboard. After payment, a download link for the Windows installer appears. Contact WhatsApp for installation help."
              icon={<Monitor className="h-5 w-5" />}
            />
          </div>
        </Section>

        {/* ── Section 3: How to Pay ── */}
        <Section id="how-to-pay" className="border-b">
          <SectionTitle sub="Step-by-step payment process with pictures in plain English">3. How to Pay — Step by Step</SectionTitle>

          <div className="space-y-5">
            <div className="rounded-xl border bg-white p-6">
              <h3 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">A</span>
                Paying Through the Website (Recommended)
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { n: '1', text: 'Log in to your account and go to your Dashboard' },
                  { n: '2', text: 'Find the product you want (CBT Premium, Past Questions, or Windows Software)' },
                  { n: '3', text: 'Click the green "Pay ₦X,XXX" button' },
                  { n: '4', text: 'You will be taken to Flutterwave — a secure Nigerian payment page' },
                  { n: '5', text: 'Enter your card details, or choose "Bank Transfer" or "USSD" if you prefer' },
                  { n: '6', text: 'Complete the payment. You will be brought back to the website automatically.' },
                  { n: '7', text: 'Your account will unlock immediately and a success message will appear.' },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <span className="text-muted-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h3 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center">B</span>
                If Your Account Didn't Unlock After Payment
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sometimes the redirect doesn't work properly (slow internet, closed browser too early). Don't worry — your money is safe. Here's what to do:
              </p>
              <div className="space-y-3 text-sm">
                {[
                  { n: '1', text: 'Find your Transaction ID — this is a number like 5234871 in the Flutterwave payment receipt (sent to your email or SMS)' },
                  { n: '2', text: 'Go back to your Dashboard and find the product you paid for' },
                  { n: '3', text: 'Click the orange "Already paid but not unlocked?" link below the payment button' },
                  { n: '4', text: 'Enter your Transaction ID and click "Verify" — your account will unlock instantly' },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <span className="text-muted-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-white p-6">
              <h3 className="font-serif font-bold text-base mb-4 flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">C</span>
                Paying via Activation Key (for CBT Premium only)
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Some users receive an activation key directly from the admin. If you have a key:
              </p>
              <div className="space-y-3 text-sm">
                {[
                  { n: '1', text: 'Log in and go to your Dashboard' },
                  { n: '2', text: 'Click "Enter Activation Key" button' },
                  { n: '3', text: 'Type your key exactly as given (e.g. ACT-XXXXXXXX)' },
                  { n: '4', text: 'Click "Activate" — your premium access is unlocked immediately' },
                ].map(step => (
                  <div key={step.n} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{step.n}</span>
                    <span className="text-muted-foreground">{step.text}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                ⚠️ Activation keys only work for CBT Premium. They cannot unlock Past Questions or Windows Software.
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section 4: After Payment ── */}
        <Section id="after-payment" className="border-b">
          <SectionTitle sub="What happens next and how to use what you've paid for">4. After Payment — What to Do</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-xl border bg-white p-5">
              <div className="text-2xl mb-3">🎯</div>
              <h3 className="font-serif font-bold mb-2">After CBT Premium</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />Your dashboard shows "CBT Premium Active" badge</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />All cadre cards in Practice section now show "Start Practice" button</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />AI CBT Platform section now shows "Open AI CBT Platform" button</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />Pick your cadre, click Start, and begin your 45-minute timed session</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <div className="text-2xl mb-3">📥</div>
              <h3 className="font-serif font-bold mb-2">After Past Questions</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />A green "Payment Verified — Download Ready" message appears</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />Click the "Download Past Questions" button</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />The PDF file downloads to your device</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />Save it to your phone or computer — you can open it anytime</li>
              </ul>
            </div>
            <div className="rounded-xl border bg-white p-5">
              <div className="text-2xl mb-3">💻</div>
              <h3 className="font-serif font-bold mb-2">After Windows Software</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />A "Download Windows Software" button appears in the card</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />Click it to download the Windows installer (.exe file)</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />Run the installer on your Windows computer</li>
                <li className="flex items-start gap-2"><CheckCircle className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />WhatsApp us for installation help: +234 813 847 4528</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* ── Section 5: FAQ ── */}
        <Section id="faq">
          <SectionTitle sub="Common questions answered simply">5. Frequently Asked Questions</SectionTitle>

          <div className="space-y-3">
            <FaqItem q="Is my money safe? What payment methods are accepted?">
              Yes. All payments go through <strong>Flutterwave</strong>, which is a regulated Nigerian fintech company used by thousands of businesses. You can pay by debit card, credit card, bank transfer, USSD (*payment code on your phone), or mobile money. Your card details are never stored on our server.
            </FaqItem>
            <FaqItem q="I paid but nothing happened. Did I lose my money?">
              No — your money is safe. This sometimes happens when your internet is slow or you closed the browser before the page redirected back. Go to your Dashboard, scroll to the product you paid for, and click "Already paid but not unlocked?". Enter your Transaction ID (found in the Flutterwave email or SMS receipt) and click Verify. Your account will unlock immediately.
            </FaqItem>
            <FaqItem q="Where do I find my Transaction ID?">
              Flutterwave sends a receipt to your email and SMS after payment. The Transaction ID is a number (e.g. 5234871) shown on that receipt. Check your email inbox or SMS messages. If you can't find it, send your payment screenshot to WhatsApp: <a href="https://wa.me/2348138474528" className="text-primary font-semibold hover:underline" target="_blank" rel="noopener noreferrer">+234 813 847 4528</a>.
            </FaqItem>
            <FaqItem q="Does the ₦5,000 CBT Premium unlock the Past Questions too?">
              No. CBT Premium (₦5,000) only unlocks the 21 practice cadre subjects and the AI CBT platform. Past Questions (₦7,000) and Windows Software (₦100,000) are completely separate products with their own separate payments.
            </FaqItem>
            <FaqItem q="Can I use this on my mobile phone?">
              Yes. The website works on any smartphone or tablet — Android or iPhone. You don't need to download any app. Just open the website in your phone's browser (Chrome, Safari, etc.) and it works perfectly.
            </FaqItem>
            <FaqItem q="How does the timed exam work?">
              Each practice session gives you up to 70 questions and 45 minutes. The timer counts down at the top of the screen. When time runs out, the exam is automatically submitted. You can also submit early. After submitting, you see your score, which questions you got right or wrong, and explanations for each answer.
            </FaqItem>
            <FaqItem q="Can I stop mid-exam and continue later?">
              Yes. Your exam progress is automatically saved every second. If you close your browser or lose internet, just go back to the same cadre exam page — you'll be given the option to resume from where you left off.
            </FaqItem>
            <FaqItem q="What is the AI CBT Platform?">
              The AI CBT Platform is an advanced testing system (separate from the regular practice exams) that adapts to your level and gives a more realistic exam simulation. It opens in a secure browser within the website. It requires CBT Premium access.
            </FaqItem>
            <FaqItem q="I have an activation key. How is it different from paying online?">
              An activation key is a code (like ACT-XXXXXXXX) given to you by the admin, usually after a manual payment arrangement. You enter it on your Dashboard by clicking "Enter Activation Key". Keys can ONLY unlock CBT Premium — they cannot unlock Past Questions or Windows Software.
            </FaqItem>
            <FaqItem q="I need help. How do I contact support?">
              The fastest way is WhatsApp: <a href="https://wa.me/2348138474528" className="text-primary font-semibold hover:underline" target="_blank" rel="noopener noreferrer">+234 813 847 4528</a>. You can also submit a message through the Feedback section on your Dashboard. Response is usually within a few hours.
            </FaqItem>
          </div>
        </Section>

        {/* Bottom CTA */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-8 text-center">
          <h2 className="font-serif text-2xl font-bold mb-2">Ready to Start?</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Create a free account and try Current Affairs practice right now. No payment required.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth">
              <Button className="gap-2 px-8">
                <UserPlus className="h-4 w-4" />Register Free Now
              </Button>
            </Link>
            <a href="https://wa.me/2348138474528" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="gap-2 px-8 border-green-300 text-green-700 hover:bg-green-50">
                <MessageCircle className="h-4 w-4" />WhatsApp Us
              </Button>
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
