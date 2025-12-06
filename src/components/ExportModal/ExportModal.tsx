import * as Dialog from '@radix-ui/react-dialog';
import { ExportSettings } from './ExportSettings';
import type { ExportSettings as IExportSettings, ExportProgress } from '../../types/export';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartExport: (settings: IExportSettings) => void;
  progress: ExportProgress;
  isExporting: boolean;
}

export function ExportModal({
  isOpen,
  onClose,
  onStartExport,
  progress,
  isExporting,
}: ExportModalProps) {
  const handleClose = () => {
    if (!isExporting) {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />

        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-lg bg-dark rounded-lg overflow-hidden z-50"
          onEscapeKeyDown={handleClose}
        >
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Export Vidéo
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-400 mt-1">
                Exportez votre animation shader en fichier vidéo
              </Dialog.Description>
            </div>

            {!isExporting && (
              <Dialog.Close asChild>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-lighter hover:bg-dark-border text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </Dialog.Close>
            )}
          </div>

          <div className="p-6">
            <ExportSettings
              onStartExport={onStartExport}
              progress={progress}
              isExporting={isExporting}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
