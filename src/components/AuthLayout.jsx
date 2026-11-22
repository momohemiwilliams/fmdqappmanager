import FmdqLogo from './FmdqLogo'

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-6 py-6">
      <div className="flex w-full max-w-6xl flex-col items-stretch gap-6 lg:flex-row lg:items-stretch lg:justify-center">
        <section className="navy-texture w-full rounded-3xl p-6 text-white shadow-xl lg:w-[480px] sm:p-8">
          <FmdqLogo />
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight">iAuth</h1>
          <p className="mt-2 max-w-sm text-sm leading-snug text-slate-300">
            Single Sign On (SSO) to access all FMDQ Legacy software solutions in one place.
          </p>

          <div className="gold-panel mt-5 rounded-2xl p-5 text-xs leading-relaxed text-white shadow-lg">
            <p>
              FMDQ Group is Africa&rsquo;s first vertically integrated financial market infrastructure (FMI) group,
              strategically positioned to provide registration, listing, quoting and noting services; integrated
              trading, clearing &amp; central counterparty, settlement, risk management for financial market
              transactions; and depository of securities across the debt capital, foreign exchange, derivatives and
              equity markets, through its wholly owned subsidiaries.
            </p>
            <p className="mt-3 font-semibold">
              FMDQ Securities Exchange, FMDQ Clear, FMDQ Depository, FMDQ Private Markets and iQx Consult Limited
            </p>
            <p className="mt-3">
              Towards transforming the Nigerian financial markets to become &ldquo;GOLD&rdquo; (Globally Competitive,
              Operationally Excellent, Liquid and Diverse) in alignment with its global counterparts.
            </p>
          </div>
        </section>

        <section className="flex w-full flex-col justify-center lg:w-[480px]">
          <div className="card-lift rounded-2xl bg-white p-6 shadow-xl sm:p-8">{children}</div>
          <p className="mt-4 text-center text-xs text-slate-500">
            By clicking continue, you agree to our{' '}
            <a href="#terms" className="font-medium text-navy-800 underline underline-offset-2">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#privacy" className="font-medium text-navy-800 underline underline-offset-2">
              Privacy Policy
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
