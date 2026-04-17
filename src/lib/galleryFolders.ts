export interface GalleryFolder {
    id: number;
    name: string;
    category_id: number;
    parent_folder_id: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface GalleryFolderNode extends GalleryFolder {
    children: GalleryFolderNode[];
    depth: number;
    pathLabel: string;
}

export interface GalleryFolderOption {
    id: number;
    category_id: number;
    parent_folder_id: number | null;
    name: string;
    pathLabel: string;
    depth: number;
}

const compareGalleryFolders = (first: Pick<GalleryFolder, 'name' | 'id'>, second: Pick<GalleryFolder, 'name' | 'id'>) => {
    const nameComparison = first.name.localeCompare(second.name, undefined, { sensitivity: 'base' });

    if (nameComparison !== 0) {
        return nameComparison;
    }

    return first.id - second.id;
};

export const normalizeGalleryFolderName = (name: string) => name.trim().replace(/\s+/g, ' ');

export const hasDuplicateGalleryFolderName = (
    folders: GalleryFolder[],
    {
        name,
        categoryId,
        parentFolderId,
        excludeFolderId
    }: {
        name: string;
        categoryId: number;
        parentFolderId: number | null;
        excludeFolderId?: number;
    }
) => {
    const normalizedTargetName = normalizeGalleryFolderName(name).toLowerCase();

    return folders.some((folder) => (
        folder.id !== excludeFolderId
        && folder.category_id === categoryId
        && (folder.parent_folder_id ?? null) === (parentFolderId ?? null)
        && normalizeGalleryFolderName(folder.name).toLowerCase() === normalizedTargetName
    ));
};

export const buildGalleryFolderTree = (folders: GalleryFolder[]): GalleryFolderNode[] => {
    const sortedFolders = [...folders].sort(compareGalleryFolders);
    const nodeMap = new Map<number, GalleryFolderNode>(
        sortedFolders.map((folder) => [
            folder.id,
            {
                ...folder,
                children: [],
                depth: 0,
                pathLabel: folder.name
            }
        ])
    );
    const rootNodes: GalleryFolderNode[] = [];

    for (const folder of sortedFolders) {
        const node = nodeMap.get(folder.id);

        if (!node) {
            continue;
        }

        if (folder.parent_folder_id && nodeMap.has(folder.parent_folder_id)) {
            nodeMap.get(folder.parent_folder_id)?.children.push(node);
        } else {
            rootNodes.push(node);
        }
    }

    const assignNodeMetadata = (nodes: GalleryFolderNode[], depth = 0, parentPath = ''): GalleryFolderNode[] => (
        [...nodes]
            .sort(compareGalleryFolders)
            .map((node) => {
                const pathLabel = parentPath ? `${parentPath} / ${node.name}` : node.name;

                return {
                    ...node,
                    depth,
                    pathLabel,
                    children: assignNodeMetadata(node.children, depth + 1, pathLabel)
                };
            })
    );

    return assignNodeMetadata(rootNodes);
};

export const buildGalleryFolderOptions = (folders: GalleryFolder[]): GalleryFolderOption[] => {
    const options: GalleryFolderOption[] = [];
    const appendNodes = (nodes: GalleryFolderNode[]) => {
        for (const node of nodes) {
            options.push({
                id: node.id,
                category_id: node.category_id,
                parent_folder_id: node.parent_folder_id,
                name: node.name,
                pathLabel: node.pathLabel,
                depth: node.depth
            });

            appendNodes(node.children);
        }
    };

    appendNodes(buildGalleryFolderTree(folders));
    return options;
};

export const buildGalleryFolderPathMap = (folders: GalleryFolder[]) => Object.fromEntries(
    buildGalleryFolderOptions(folders).map((folder) => [folder.id, folder.pathLabel])
);
