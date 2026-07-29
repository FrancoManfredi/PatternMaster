export default function CatalogEmptyState() {
  return (
    <div
      className="bg-surface-container/50 border border-outline-variant/30 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[280px]"
    >
      <span className="material-symbols-outlined text-[48px] text-outline mb-4 opacity-50">
        data_object
      </span>
      <p className="font-body text-code-sm text-outline-variant uppercase tracking-widest mb-2">
        Módulo Cifrado
      </p>
      <p className="font-body text-body-md text-on-surface-variant/70">
        Nuevos patrones arquitectónicos en fase de compilación...
      </p>
    </div>
  );
}
