import Button from '../../../../admin-x-ds/global/Button';
import ConfirmationModal from '../../../../admin-x-ds/global/modal/ConfirmationModal';
import FileUpload from '../../../../admin-x-ds/global/form/FileUpload';
import LabItem from './LabItem';
import List from '../../../../admin-x-ds/global/List';
import NiceModal, {useModal} from '@ebay/nice-modal-react';
import React, {useState} from 'react';
import {downloadAllContent, useDeleteAllContent, useImportContent} from '../../../../api/db';
import {showToast} from '../../../../admin-x-ds/global/Toast';
import {useQueryClient} from '@tanstack/react-query';

const ImportModalContent = () => {
    const modal = useModal();
    const {mutateAsync: importContent} = useImportContent();
    const [uploading, setUploading] = useState(false);

    return <FileUpload
        id="import-file"
        onUpload={async (file) => {
            setUploading(true);
            await importContent(file);
            modal.remove();
            NiceModal.show(ConfirmationModal, {
                title: 'Import in progress',
                prompt: `Your import is being processed, and you'll receive a confirmation email as soon as it's complete. Usually this only takes a few minutes, but larger imports may take longer.`,
                cancelLabel: '',
                okLabel: 'Got it',
                onOk: confirmModal => confirmModal?.remove(),
                formSheet: false
            });
        }}
    >
        <div className="cursor-pointer bg-grey-100 p-10 text-center">
            {uploading ? 'Uploading ...' : 'Select a JSON or zip file'}
        </div>
    </FileUpload>;
};

const MigrationOptions: React.FC = () => {
    const {mutateAsync: deleteAllContent} = useDeleteAllContent();
    const client = useQueryClient();

    const handleImportContent = () => {
        NiceModal.show(ConfirmationModal, {
            title: 'Import content',
            prompt: <ImportModalContent />,
            okLabel: '',
            formSheet: false
        });
    };

    const handleDeleteAllContent = () => {
        NiceModal.show(ConfirmationModal, {
            title: 'Would you really like to delete all content from your blog?',
            prompt: 'This is permanent! No backups, no restores, no magic undo button. We warned you, k?',
            okColor: 'red',
            okLabel: 'Delete',
            onOk: async () => {
                await deleteAllContent(null);
                showToast({
                    type: 'success',
                    message: 'All content deleted from database.'
                });
                await client.refetchQueries();
            }
        });
    };

    return (
        <List titleSeparator={false}>
            <LabItem
                action={<Button color='grey' label='Open importer' size='sm' onClick={handleImportContent} />}
                detail='Import posts from a JSON or zip file'
                title='Import content' />
            <LabItem
                action={<Button color='grey' label='Export' size='sm' onClick={() => downloadAllContent()} />}
                detail='Download all of your posts and settings in a single, glorious JSON file'
                title='Export your content' />
            <LabItem
                action={<Button color='red' label='Delete' size='sm' onClick={handleDeleteAllContent} />}
                detail='Permanently delete all posts and tags from the database, a hard reset'
                title='Delete all content' />
        </List>
    );
};

export default MigrationOptions;
