import type { GalleryFolder } from '../../lib/galleryFolders';
import { buildGalleryFolderTree } from '../../lib/galleryFolders';

interface GalleryFolderTreeProps {
    folders: GalleryFolder[];
    imageCountsByFolder: Record<number, number>;
    isBusy?: boolean;
    onAddSubFolder: (folder: GalleryFolder) => void;
    onRenameFolder: (folder: GalleryFolder) => void;
    onDeleteFolder: (folder: GalleryFolder) => void;
}

export default function GalleryFolderTree({
    folders,
    imageCountsByFolder,
    isBusy = false,
    onAddSubFolder,
    onRenameFolder,
    onDeleteFolder
}: GalleryFolderTreeProps) {
    const folderTree = buildGalleryFolderTree(folders);

    const renderFolderNodes = (nodes: typeof folderTree): JSX.Element => (
        <div className="space-y-3">
            {nodes.map((node) => {
                const imageCount = imageCountsByFolder[node.id] || 0;
                const childCount = node.children.length;

                return (
                    <div key={node.id} className="space-y-3">
                        <div
                            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                            style={{ marginLeft: node.depth > 0 ? `${node.depth * 1.25}rem` : undefined }}
                        >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <div className="font-semibold text-gray-800">{node.name}</div>
                                    <div className="mt-1 text-xs text-gray-500">
                                        {childCount} sub-folder{childCount === 1 ? '' : 's'} | {imageCount} image{imageCount === 1 ? '' : 's'}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onAddSubFolder(node)}
                                        disabled={isBusy}
                                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50"
                                    >
                                        Add Sub-Folder
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRenameFolder(node)}
                                        disabled={isBusy}
                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-white disabled:opacity-50"
                                    >
                                        Rename
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteFolder(node)}
                                        disabled={isBusy}
                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>

                        {node.children.length > 0 && renderFolderNodes(node.children)}
                    </div>
                );
            })}
        </div>
    );

    return renderFolderNodes(folderTree);
}
