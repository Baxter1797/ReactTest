interface ITraverseDir {
    id: string;
    fileName: string;
    type: string;
    path: string;
    executable: boolean;
    lastModified: number,
    canWrite: boolean;
    fileSize: number;
    children: ITraverseDir[];
}

export default ITraverseDir