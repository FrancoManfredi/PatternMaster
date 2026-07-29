export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-lowest border-t border-outline-variant/10 py-12 mt-[32px]">
      <div className="max-w-[1280px] mx-auto px-[24px] flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-headline text-on-surface text-lg uppercase tracking-widest">
            PatternMaster
          </span>
          <span className="font-body text-code-sm text-on-surface-variant uppercase">
            Kernel v1.0.4 - 2024
          </span>
        </div>

        <div className="flex gap-12">
          <div className="flex flex-col gap-3">
            <span className="font-body text-label-caps text-primary uppercase tracking-widest">
              Legal
            </span>
            <a
              href="#"
              className="text-body-md text-on-surface-variant hover:text-on-surface"
            >
              Términos
            </a>
            <a
              href="#"
              className="text-body-md text-on-surface-variant hover:text-on-surface"
            >
              Privacidad
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-body text-label-caps text-secondary uppercase tracking-widest">
              Social
            </span>
            <a
              href="#"
              className="text-body-md text-on-surface-variant hover:text-on-surface"
            >
              Terminal_X
            </a>
            <a
              href="#"
              className="text-body-md text-on-surface-variant hover:text-on-surface"
            >
              Discord_Node
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-[24px] mt-12 pt-6 border-t border-outline-variant/5 text-center">
        <span className="font-body text-code-sm text-on-surface-variant/40">
          END_OF_TRANSMISSION
        </span>
      </div>
    </footer>
  );
}
