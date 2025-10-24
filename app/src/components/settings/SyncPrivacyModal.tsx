import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface SyncPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncPrivacyModal({ isOpen, onClose }: SyncPrivacyModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Google Drive Sync Privacy" size="large">
      <div className="space-y-6 text-text-secondary">
        {/* What data is synced */}
        <section>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            What data is synced?
          </h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Your word and sentence list (Japanese, romanji, English translations)</li>
            <li>Your learning progress (scores, mastery levels, review history)</li>
            <li>Your app settings (study preferences, flashcard settings)</li>
          </ul>
          <p className="mt-3 text-sm">
            Note: Your theme preference (dark/light mode) is NOT synced - it remains device-specific.
          </p>
        </section>

        {/* Where is data stored */}
        <section>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Where is data stored?
          </h3>
          <p>
            Your data is stored in your personal Google Drive account in a hidden application data folder.
            The file is named <code className="px-1.5 py-0.5 bg-bg-tertiary-dark rounded text-sm font-mono">
              japanese-learning-app-data.json
            </code> and contains all your learning data in a structured format.
          </p>
          <div className="mt-3 p-3 bg-bg-tertiary-dark rounded-lg">
            <p className="text-sm">
              <strong className="text-text-primary">Important:</strong> Only this application can access the synced file.
              No other apps or services can read or modify your learning data.
            </p>
          </div>
        </section>

        {/* Privacy guarantees */}
        <section>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            Privacy & Security
          </h3>
          <ul className="space-y-2">
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Data is transmitted over HTTPS (encrypted)</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>We never send data to our servers - this app has no backend</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You can disconnect and delete your data at any time</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>You can export your data anytime from the Settings page</span>
            </li>
            <li className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Google's privacy policy applies to data stored in your Drive</span>
            </li>
          </ul>
        </section>

        {/* How to disconnect */}
        <section>
          <h3 className="text-lg font-semibold text-text-primary mb-3">
            How to disconnect
          </h3>
          <p>
            If you want to stop syncing, simply click the "Disconnect" button in the sync settings.
            Your local data will remain intact. You can choose whether to keep or delete the copy in Google Drive.
          </p>
          <p className="mt-2">
            You can also revoke this app's access to your Google Drive at any time by visiting{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo hover:underline"
            >
              Google Account Permissions
            </a>.
          </p>
        </section>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t border-border-subtle">
          <Button variant="primary" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </Modal>
  );
}
