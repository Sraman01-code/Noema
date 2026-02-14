export default function ActionBar({
  onAnalyze,
  onConfirm,
  disabled,
  hasResult,
  saving = false, // new prop
}: {
  onAnalyze: () => void;
  onConfirm?: () => void; // optional callback for confirm & save
  disabled: boolean;
  hasResult: boolean;
  saving?: boolean; // optional prop for saving state
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 p-4 flex justify-end gap-3">
      {!hasResult ? (
        <button
          onClick={onAnalyze}
          disabled={disabled}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-medium disabled:opacity-40"
        >
          Analyze Product
        </button>
      ) : (
        <button
          onClick={onConfirm}
          disabled={disabled || saving} // disable while saving
          className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition font-medium disabled:opacity-40"
        >
          {saving ? "Saving…" : "Confirm & Save"} {/* show saving state */}
        </button>
      )}
    </div>
  );
}
